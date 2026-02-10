import { Request, Response } from "express";
import { getOAuthClient } from "../config/googleOAuth.js";
import { google } from "googleapis";
import { checkScopes } from "../utils/checkScopes.js";
import {
  enableAutomaticTracking,
  findOrCreateUser,
  getUser,
  saveGmailTokens,
  updateScopes,
} from "../services/user.service.js";
import { hasFullGmailTokens } from "../utils/hasFullGmailTokens.js";

const BASE_SCOPES = [
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/userinfo.email",
  "openid",
];

const GMAIL_SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];

const ALL_SCOPES = [...BASE_SCOPES, ...GMAIL_SCOPES];

export const googleAuth = (req: Request, res: Response) => {
  const oauth2Client = getOAuthClient();
  const authUrl = oauth2Client.generateAuthUrl({
    // access_type: "offline",
    // prompt: "consent",
    scope: BASE_SCOPES,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
  });

  res.redirect(authUrl);
};

export const googleCallback = async (req: Request, res: Response) => {
  try {
    const code = req.query.code as string;
    const oauth2Client = getOAuthClient();
    const { tokens } = await oauth2Client.getToken({
      code: code,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI, //need to send again cuz we have multiple if not sent google uses last used/default callback
    });

    oauth2Client.setCredentials(tokens);
    const grantedScopes = tokens?.scope?.split(" ") || [];
    //NO need as these are given by default
    // const hasAllScopes = checkScopes(grantedScopes, BASE_SCOPES);

    // if (!hasAllScopes) {
    //   res.status(403).redirect("http://localhost:5173/login");
    //   // return res.status(403).json({ success: false, reason:
    //   // "missing_required_scopes",

    //   // // missing: missingScopes, });
    // }

    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: "v2",
    });

    const { data } = await oauth2.userinfo.get();

    if (!data.id || !data.email || !data.name || !data.picture) {
      throw new Error("Missing data in OAuth callback");
    }

    const profile = {
      googleId: data.id,
      email: data.email,
      name: data.name,
      picture: data.picture,
      scopes: grantedScopes,
    };
    const user = await findOrCreateUser(profile);
    //TODO:Set proper session
    res.cookie("session", user.email, {
      httpOnly: true,
      maxAge: 60 * 60 * 24,
    });

    res.redirect("http://localhost:5173/dashboard");
  } catch (err) {
    console.log("googleCallback ERROR");
    console.error(err);
    res.status(500).send("Auth failed");
  }
};

export const googleUpgrade = (req: Request, res: Response) => {
  try {
    const oauth2Client = getOAuthClient();
    const state = JSON.stringify({
      flow: "upgrade",
      redirectTo: "/dashboard",
    });
    const upgradeAuthUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: ALL_SCOPES, //need to add BASE_SCOPES too cuz google doesnt remember previously given it replaces them with new ones
      redirect_uri: process.env.GOOGLE_UPGRADE_REDIRECT_URI,
      state,
    });
    res.redirect(upgradeAuthUrl);
  } catch (err) {
    console.log("googleUpgrade ERROR");
    console.error(err);
    res.status(500).send("Auth failed");
  }
};

export const googleUpgradeCallback = async (req: Request, res: Response) => {
  try {
    const code = req.query.code as string;
    const state = JSON.parse(req.query.state as string);
    console.log(state);
    const oauth2Client = getOAuthClient();

    const { tokens } = await oauth2Client.getToken({
      code: code,
      redirect_uri: process.env.GOOGLE_UPGRADE_REDIRECT_URI, //need to send again cuz we have multiple if not sent google uses last used/default callback
    });

    oauth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: "v2",
    });

    const { data } = await oauth2.userinfo.get();
    const googleId = data.id;

    if (!tokens.scope) {
      throw new Error("Missing scopes in OAuth callback");
    }
    const grantedScopes = tokens?.scope.split(" ") || [];

    const hasGmailScope = checkScopes(grantedScopes, GMAIL_SCOPES);

    if (!hasGmailScope) {
      // User denied the scope
      return res.redirect(
        `http://localhost:5173${state.redirectTo}?error=gmail_access_denied`,
      );
    }
    if (!googleId) {
      throw new Error("Missing googleId in OAuth callback");
    }
    await updateScopes(googleId, grantedScopes);
    await enableAutomaticTracking(googleId);

    if (hasFullGmailTokens(tokens) && googleId) {
      await saveGmailTokens(
        googleId,
        tokens.access_token,
        tokens.refresh_token,
        new Date(tokens.expiry_date),
      );
    }

    // Trigger initial email scan
    // await scanGmailForApplications(req.session.userId);

    res.redirect(
      `http://localhost:5173${state.redirectTo}?success=automatic_enabled`,
    );
  } catch (err) {
    console.log("googleUpgradeCallback ERROR");
    console.error(err);
    res.redirect("http://localhost:5173/dashboard?error=upgrade_failed");
  }
};
export const getMe = async (req: Request, res: Response) => {
  const session = req.cookies.session;

  if (!session) {
    return res.status(401).json({ user: null });
  }
  const user = await getUser(session.googleId);
  res.json({
    user,
  });
};
