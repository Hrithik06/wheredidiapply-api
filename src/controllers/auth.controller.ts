import { Request, Response } from "express";

import { getOAuthClient } from "../config/googleOAuth.js";
import { checkScopes } from "../utils/checkScopes.js";
import {
  enableAutomaticTracking,
  findOrCreateUser,
  getSafeUserById,
  getUserByGoogleId,
  saveGmailTokens,
  updateScopes,
} from "../services/user.service.js";

import { hasFullGmailTokens } from "../utils/hasFullGmailTokens.js";
import { signToken, verifyToken } from "../services/jwt.service.js";
import { JwtPayload } from "../types/auth.js";

const BASE_SCOPES = [
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/userinfo.email",
  "openid",
];

const GMAIL_SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];

const ALL_SCOPES = [...BASE_SCOPES, ...GMAIL_SCOPES];

// Starts Google OAuth flow
// If user already has a valid session cookie,
// skip Google login and send them directly to dashboard
export const googleAuth = async (req: Request, res: Response) => {
  const token = req.cookies.session;

  // Check existing login session
  if (token) {
    try {
      const decoded = verifyToken(token) as JwtPayload;

      // Extra safety:
      // token may still be valid even if user was deleted from DB
      const user = await getSafeUserById(decoded.userId);

      if (!user) {
        throw new Error("User not found");
      }

      // User already authenticated → no need to go through OAuth again
      return res.redirect(`${process.env.CLIENT_URL}`);
    } catch {
      // Invalid/expired token OR user missing
      // continue with fresh Google OAuth login
    }
  }

  const oauth2Client = getOAuthClient();

  // Generates Google consent screen URL
  // Browser will be redirected to Google login page
  const authUrl = oauth2Client.generateAuthUrl({
    scope: BASE_SCOPES,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
  });

  // Redirect user to Google OAuth consent screen
  return res.redirect(authUrl);
};

export const googleCallback = async (req: Request, res: Response) => {
  try {
    // Google sends temporary authorization code in query params
    const code = req.query.code as string;

    const oauth2Client = getOAuthClient();

    // Exchange authorization code for Google access tokens
    const { tokens } = await oauth2Client.getToken({
      code,
      // Must match the redirect URI used during auth URL generation
      // Important when app has multiple callback URLs
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    });

    oauth2Client.setCredentials(tokens);

    // Scopes actually granted by user
    const grantedScopes = tokens?.scope?.split(" ") || [];

    // Fetch authenticated Google user's profile
    const response = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      },
    );

    const data = await response.json();

    // Validate required profile fields
    if (!data.id || !data.email || !data.name || !data.picture) {
      throw new Error("Missing data in OAuth callback");
    }

    // Normalize Google profile data for app
    const profile = {
      googleId: data.id,
      email: data.email,
      name: data.name,
      picture: data.picture,
      scopes: grantedScopes,
    };

    // Create user if first login
    // otherwise return existing user
    const user = await findOrCreateUser(profile);

    // Create app session JWT
    // After this, app trusts its own token instead of Google token
    const token = signToken({
      userId: user.id,
      email: user.email,
    });

    const ONE_DAY = 24 * 60 * 60 * 1000;

    // Store JWT in secure HTTP-only cookie
    // Browser automatically sends this cookie in future requests
    res.cookie("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // true in production (HTTPS)
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * ONE_DAY,
    });

    // OAuth flow complete
    // Redirect user back to frontend app
    res.redirect(`${process.env.CLIENT_URL}`);
  } catch (err) {
    console.log("googleCallback ERROR");
    console.error(err);

    // Send user to frontend error page on OAuth failure
    res.redirect(`${process.env.CLIENT_URL}/auth-error`);
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
    res.redirect(`${process.env.CLIENT_URL}/auth-error`);
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
      redirect_uri: process.env.GOOGLE_UPGRADE_REDIRECT_URI, //need to send again cuz we have different uris if not sent google uses last used/default callbacklogout
    });

    oauth2Client.setCredentials(tokens);

    // const oauth2 = google.oauth2({
    //   auth: oauth2Client,
    //   version: "v2",
    // });

    // const { data } = await oauth2.userinfo.get();

    // const accessToken = (await oauth2Client.getAccessToken()).token;
    // console.log(accessToken)
    // console.log(tokens.access_token === accessToken)

    if (!tokens.scope) {
      throw new Error("Missing scopes in OAuth callback");
    }
    const grantedScopes = tokens?.scope.split(" ") || [];

    const hasGmailScope = checkScopes(grantedScopes, GMAIL_SCOPES);

    if (!hasGmailScope) {
      // User denied the scope
      return res.redirect(
        `${process.env.CLIENT_URL}${state.redirectTo}?error=gmail_access_denied`,
      );
    }
    const response = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      },
    );

    const data = await response.json();

    const googleId = data.id;
    if (!googleId) {
      throw new Error("Missing googleId in OAuth callback");
    }
    const user = await getUserByGoogleId(googleId);
    if (!user) {
      throw new Error("User not found");
    }
    await updateScopes(user.id, grantedScopes);
    await enableAutomaticTracking(user.id);

    if (hasFullGmailTokens(tokens) && googleId) {
      await saveGmailTokens(
        user.id,
        tokens.access_token,
        tokens.refresh_token,
        new Date(tokens.expiry_date),
      );
    }

    // Trigger initial email scan
    // await scanGmailForApplications(req.session.userId);

    res.redirect(
      `${process.env.CLIENT_URL}${state.redirectTo}?success=automatic_enabled`,
    );
  } catch (err) {
    console.log("googleUpgradeCallback ERROR");
    console.error(err);
    res.redirect(`${process.env.CLIENT_URL}/dashboard?error=upgrade_failed`);
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie("session");
  res.json({ success: true });
};
