import { google } from "googleapis";

export const getOAuthClient = () =>
  new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    undefined, //cuz i have  multiple redirect_uri
  );
