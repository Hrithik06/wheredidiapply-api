
import { getOAuthClient } from "../config/googleOAuth.js";
import { gmail } from "@googleapis/gmail";
import {
  normalizeMetadataMessage,
} from "../utils/gmail.utils.js";
import { GmailClient, GmailMessage } from "../types/gmail.js";
import { gmailQuery } from "../constants/gmailFilters.js";
import { getFormattedDate, isDefined, isFulfilled } from "../utils/helper.js";
import { GaxiosResponse } from "gaxios";
export async function exchangeCodeForTokens(code: string) {
  const oauth2Client = getOAuthClient();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}


// Use the actual type from googleapis
// import type { Credentials } from "google-auth-library";
// export async function getGrantedScopes(tokens: Credentials): Promise<string[]>
//   return tokens.scope?.split(" ") ?? [];
// }


export async function listMessageIds(gmailAPI: GmailClient, maxResults = 500) {
  try {
    //get first 10 message ids
    const today = new Date();
    const priorDate = new Date(new Date().setDate(today.getDate() - 30));

    const formattedAfterDate = getFormattedDate(priorDate);
    console.log(today)
    console.log(priorDate);
    console.log(formattedAfterDate);
    const messageListResponse = await gmailAPI.users.messages.list({
      userId: "me",
      maxResults: maxResults,
      // q: gmailQuery.replace(/[\r\n]+/gm, "")
      // q: `after:${formattedAfterDate}`
      q: `after:2026/02/07`
    });

    return messageListResponse;
  } catch (error) {

    if (error instanceof Error) {
      console.error("listMessageIds Error:", error.message);
    } else {
      console.error("listMessageIds Error:", error);
    }
    return null;

  }
}
async function fetchMessageById(
  id: string,
  gmailAPI: GmailClient,
  format: "metadata" | "full"
): Promise<GmailMessage | null> {
  try {
    const messageResponse = await gmailAPI.users.messages.get({
      id,
      userId: "me",
      format,
      metadataHeaders: ["Date", "Subject", "From", "Reply-To"],
    });
    return messageResponse.data;
  } catch (error) {


    if (error instanceof Error) {
      console.error(`fetchMessageById (${format}) Error:`, error.message);
    } else {
      console.error(`fetchMessageById (${format}) Error:`, error);
    }
    return null;


  }
}

export async function fetchMetadataMessageById(id: string | null | undefined, gmailAPI: GmailClient): Promise<GmailMessage | null> {
  if (!id) return null;

  return fetchMessageById(id, gmailAPI, "metadata");
}

export async function fetchFullMessageById(id: string | null | undefined, gmailAPI: GmailClient): Promise<GmailMessage | null> {
  if (!id) return null;
  return fetchMessageById(id, gmailAPI, "full");
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
      (res) => res?.data.messages ?? [],
    );


    //Use allSettled to fetch what you can, skip what fails
    const results = await Promise.allSettled(
      messageIds.map((msgRef) => fetchMetadataMessageById(msgRef.id, gmailAPI)),
    );




    const rawMessages = results
      .filter(isFulfilled)
      .map((result) => result.value)
      .filter(isDefined);

    // const normalizedMessages = rawMessages.map(normalizeMessage)
    // const messagesWithBody = normalizedMessages.map(attachBodyPart)
    // const decodedEmails = messagesWithBody
    //   .map(decodeEmail)
    //   .filter(Boolean)



    const decodedEmails = rawMessages
      .map(normalizeMetadataMessage)


    // const decodedEmails = rawMessages
    //   .map(normalizeFullMessage)
    //   .map(attachBodyPart)
    //   .filter(isDefined)
    //   .map(decodeEmail)
    //   .filter(isDefined)

    return decodedEmails

  } catch (error) {


    if (error instanceof Error) {
      console.error("fetchEmails Error:", error.message);
    } else {
      console.error("fetchEmails Error:", error);
    }
    return null;
  }
}
