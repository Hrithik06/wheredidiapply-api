
import { getOAuthClient } from "../config/googleOAuth.js";
import { gmail } from "@googleapis/gmail";
import {
  decodeToPlainText,
  extractBodyPart,
  extractParts,
} from "../utils/gmail.utils.js";
import { GmailClient } from "../types/gmail.js";
import { gmailQuery } from "../constants/gmailFilters.js";

export async function exchangeCodeForTokens(code: string) {
  const oauth2Client = getOAuthClient();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}
// TODO 1. Filter listMessageIds using gmail filters
// TODO 2. Metadata fetchEmails
// TODO 3. fetchEmails LLM


// Use the actual type from googleapis
// import type { Credentials } from "google-auth-library";
// export async function getGrantedScopes(tokens: Credentials): Promise<string[]>
//   return tokens.scope?.split(" ") ?? [];
// }

export async function listMessageIds(gmailAPI: GmailClient, maxResults = 10) {
  try {
    //get first 10 message ids
    const messageListResponse = await gmailAPI.users.messages.list({
      userId: "me",
      maxResults: maxResults,
      q: gmailQuery.replace(/[\r\n]+/gm, "")
    });

    return messageListResponse;
  } catch (error) {
    console.error("listMessageIds Error: ", error.message);
    throw new Error(`listMessageIds failed: ${error.message}`);
  }
}
export async function fetchMessageById(id: string, gmailAPI: GmailClient, format: string) {
  try {
    const messageResponse = await gmailAPI.users.messages.get({
      id: id,
      userId: "me",
      format: format,
    });
    return messageResponse;
  } catch (error) {
    console.error("fetchMessageById Error: ", error.message);
    throw new Error(`fetchMessageById failed: ${error.message}`);
  }
}

export async function fetchEmails(refreshToken: string, accessToken: string) {
  try {
    const oauth2Client = getOAuthClient();
    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
      // Optional: expiry_date: 123456789 (timestamp in ms)
    });

    // const gmailAPI = google.gmail({ version: "v1", auth: oauth2Client });
    const gmailAPI = gmail({ version: "v1", auth: oauth2Client });

    //"??" guard against if messageIds is null/empty (empty inbox)
    const messageIds = await listMessageIds(gmailAPI).then(
      (res) => res.data.messages ?? [],
    );

    // const rawMessages = await Promise.all(
    //   messageIds.map((item) => fetchMessageById(item.id, gmailAPI)),
    // );

    //Use allSettled to fetch what you can, skip what fails
    const results = await Promise.allSettled(
      messageIds.map((msgRef) => fetchMessageById(msgRef.id, gmailAPI, "full")),
    );
    const rawMessages = results
      .filter((result) => result.status === "fulfilled")
      .map((result) => result.value);
    //Flatten payload and parts array
    const flattenedMessages = rawMessages.map((msg) => {
      return { id: msg.data.id, parts: extractParts(msg.data.payload) };
    });

    //fetch only body part text/plain fallback text/html ignore attachments
    const extractedBodies = flattenedMessages.map((msg) =>
      extractBodyPart(msg)
    );
    // const decodedData = extractedBodies.map((emailBody) => {
    //   return {
    //     id: emailBody.id,
    //     decodedBody: decodeToPlainText(emailBody),
    //     mimeType: emailBody.mimeType,
    //   };
    // });


    const decodedEmails = extractedBodies
      .map((emailBody) => ({
        id: emailBody.id,
        bodyText: decodeToPlainText(emailBody),
      }))
      .filter((email) => email.bodyText !== null); // drop failed decodes
    // .filter((email) => hasJobKeywords(email.bodyText)); // drop non-job emails

    // only job-related, successfully decoded emails reach here → save to DB
    return decodedEmails;
  } catch (error) {
    console.error("fetchEmails Error: ", error.message);
    throw new Error(`fetchEmails failed: ${error.message}`);
  }
}
