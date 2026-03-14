import { Base64 } from "js-base64";
import { convert } from "html-to-text";
import { DecodedEmail, ExtractedBodyPart, GmailMessage, GmailMessagePartHeader, GmailMessagePart, MessageWithBody, NormalizedMetadataMessage, NormalizedFullMessage } from "../types/gmail.js";

function normalizeBaseMessage(msg: GmailMessage) {
  if (!msg?.id) throw new Error('normalizeBaseMessage: missing message id');
  if (!msg?.threadId) throw new Error('normalizeBaseMessage: missing threadId');

  return {
    id: msg.id,
    threadId: msg.threadId,
    headers: extractHeaders(msg.payload?.headers ?? []),
    snippet: msg.snippet ?? '',
    historyId: msg.historyId ?? '',
  };
}

export function normalizeMessage(
  msg: GmailMessage,
  format: "metadata" | "full"
) {
  const base = {
    id: msg.id,
    threadId: msg.threadId,
    headers: extractHeaders(msg.payload?.headers ?? []),
    snippet: msg.snippet,
    historyId: msg.historyId
  }

  if (format === "full") {
    return {
      ...base,
      parts: extractParts(msg.payload ?? {}),
    }
  }

  return base
}
export const normalizeMetadataMessage = (msg: GmailMessage) =>
  normalizeMessage(msg, "metadata")

export const normalizeFullMessage = (msg: GmailMessage) =>
  normalizeMessage(msg, "full")

export function extractHeaders(headers: GmailMessagePartHeader[]) {
  // const headersReqd = ["Subject", "From", "Reply-To"]
  const headerObj = {
    date: headers.find(h => h.name === "Date")?.value ?? null,
    subject: headers.find(h => h.name === "Subject")?.value ?? null,
    from: headers.find(h => h.name === "From")?.value ?? null,
    replyTo: headers.find(h => h.name === "Reply-To")?.value ?? null
  }
  return headerObj

}

export function extractParts(part: GmailMessagePart, flatParts: GmailMessagePart[] = []) {
  //extract all nested parts by flatteniing the parts[]
  // "?" Guard against will crash if mimeType is undefined
  if (part.mimeType?.startsWith("multipart/")) {
    // This is a container — go deeper
    for (const nestedPart of part.parts || []) {
      extractParts(nestedPart, flatParts);
    }
  } else {
    // This is a leaf — actual content lives here
    flatParts.push(part);
  }
  return flatParts;
}

export function extractBodyPart(partsList: GmailMessagePart[]) {
  // 1. Filter for text/plain
  // 2. Ensure filename is empty/null to exclude attachments cuz if there is a .txt attachment it also comes has text/plain mimeType and has value for filename
  let bodyPart = partsList.find(
    (part) =>
      part.mimeType === "text/plain" &&
      (!part.filename || part.filename.length === 0),
  );

  // 3. Fallback: If no plain text, find the HTML Body
  if (!bodyPart) {
    bodyPart = partsList.find(
      (part) => part.mimeType === "text/html" && !part.filename,
    );
  }
  if (!bodyPart?.body?.data || !bodyPart.mimeType) {
    return null;
  }
  return {
    // If found, return the encoded data; otherwise null
    // plainPart: bodyPart ? bodyPart : null,
    rawBody: bodyPart?.body?.data ?? null,
    mimeType: bodyPart?.mimeType ?? null,
  };
}

export function decodeToPlainText(
  emailBody: ExtractedBodyPart | null
): string | null {

  if (!emailBody) return null;

  if (!emailBody.rawBody || !Base64.isValid(emailBody.rawBody)) {
    return null;
  }

  try {
    let bodyText = Base64.decode(emailBody.rawBody);

    if (emailBody.mimeType === "text/html") {
      bodyText = convert(bodyText);
    }

    return bodyText;

  } catch (error) {
    if (error instanceof Error) {
      console.error("decodeToPlainText Error:", error.message);
    } else {
      console.error("decodeToPlainText Error:", error);
    }
    return null;
  }
}

export function attachBodyPart(msg: NormalizedFullMessage): MessageWithBody | null {
  const bodyPart = extractBodyPart(msg.parts);

  if (!bodyPart) return null;

  return {
    id: msg.id,
    threadId: msg.threadId,
    headers: msg.headers,
    snippet: msg.snippet,
    historyId: msg.historyId,
    bodyPart
  };
}

export function decodeEmail(msg: MessageWithBody | null): DecodedEmail | null {
  if (!msg) return null;

  const bodyText = decodeToPlainText(msg.bodyPart);

  if (!bodyText) return null;

  return {
    id: msg.id,
    threadId: msg.threadId,
    headers: msg.headers,
    snippet: msg.snippet,
    historyId: msg.historyId,
    bodyText
  };
}
// company
// role 
// status
// appliedDate
// emailSubject
// emailThreadId

export function classifyOnSubject() { }
export function classifyOnSnippet() { }
export function classifyOnBody() { }
//Ignore Job invites from naukri // in query only see negative query can be made
export function extractCompanyNameFromAddress() {
  //TODO: Extract name using From Address Everything before < tag is most of the time name but there are cases
  //"\"Codestore Technologies Pvt Ltd.\" <info@codestoresolutions.com>"
  //"Smart Working Solutions <no-reply@hire.lever.co>"
  // Ignore if via is there "from": "Rohini B via Wellfound <no-reply@remail.wellfound.com>",
  // Ignore Alerts  "from": "Naukri Alerts <naukrialerts@naukri.com>",
  //    "from": "Indeed <alert@indeed.com>",
  // Ignore Match    "from": "Indeed <donotreply@match.indeed.com>"
}

export function extractCompanyNameFromSubject() {
  //    "subject": "Your application to Svaksha Technologies was accepted!",
  //"subject": "Your application to Web Developer at OptimHire",
  //"from": "LinkedIn <jobs-noreply@linkedin.com>",
  // "subject": "Hrithik, your application was sent to Binated",
  //  "from": "LinkedIn <jobs-noreply@linkedin.com>",
}

export function extractCompanyNameFromSnippet() {
  //    "snippet": "Your application was sent to Binated ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏ ͏",
}