// import { google } from "googleapis";
import { OAuth2Client } from 'google-auth-library';
export const getOAuthClient = () =>
  // new google.auth.OAuth2(
  //   process.env.GOOGLE_CLIENT_ID,
  //   process.env.GOOGLE_CLIENT_SECRET,
  //   undefined, //cuz i have  multiple redirect_uri
  // );
  new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    undefined, //cuz i have  multiple redirect_uri
  );
