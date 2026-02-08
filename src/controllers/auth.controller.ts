import { Request, Response } from "express";
// import * as googleService from "../services/googleOAuth.service.js"; import {
// checkScopes } from "../utils/checkScopes.js";

const REQUIRED_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "openid",
  "email",
  "profile",
];

const BASE_SCOPES = ["openid", "email", "profile"];

const GMAIL_SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];

import { oauth2Client } from "../config/googleOAuth.js";
import { google } from "googleapis";
import { checkScopes } from "../utils/checkScopes.js";
import { findOrCreateUser } from "../services/user.service.js";

export const googleAuth = (req: Request, res: Response) => {
  const authUrl = oauth2Client.generateAuthUrl({
    // access_type: "offline",
    // prompt: "consent",
    scope: BASE_SCOPES,
  });

  res.redirect(authUrl);
};

export const googleCallback = async (req: Request, res: Response) => {
  try {
    const code = req.query.code as string;
    const { tokens } = await oauth2Client.getToken(code);
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

    // data.email is your unique user id
    const email = data.email;

    if (data && tokens) {
      const profile = {
        googleId: data.id,
        email: data.email,
        name: data.name,
        picture: data.picture,
        scopes: grantedScopes,
      };
      // console.log(user);
      // TODO: create/find user in DB TODO: store tokens.refresh_token in DB
      const user = await findOrCreateUser(profile);
      console.log(user);
      // pretend session for now
    }
    res.cookie("session", email, {
      httpOnly: true,
    });

    res.redirect("http://localhost:5173/dashboard");
  } catch (err) {
    console.error(err);
    res.status(500).send("Auth failed");
  }
};

export const getMe = (req: Request, res: Response) => {
  const session = req.cookies.session;

  if (!session) {
    return res.status(401).json({ user: null });
  }

  // later: fetch from DB
  res.json({
    email: session,
  });
};
