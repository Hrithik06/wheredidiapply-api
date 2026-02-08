import { google } from "googleapis";
import { oauth2Client } from "../config/googleOAuth.js";

export async function exchangeCodeForTokens(code: string) {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

export async function getGrantedScopes(tokens: any): Promise<string[]> {
  return tokens.scope?.split(" ") ?? [];
}

export async function fetchGmailMessages(refreshToken: string) {
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  const response = await gmail.users.messages.list({
    userId: "me",
    maxResults: 10,
  });

  return response.data.messages;
}
