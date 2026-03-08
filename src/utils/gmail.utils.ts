import { Base64 } from "js-base64";
import { convert } from "html-to-text";
import { ExtractedBodyPart, GmailMessageHeaders, GmailMessagePart, MessageWithParts } from "../types/gmail.js";


export function extractHeaders(headers: GmailMessageHeaders[]) {
  const headersReqd = ["Subject", "From", "Reply-To"]
  const headerObj = {
    subject: headers.find(h => h.name === "Subject")?.value,
    from: headers?.find(h => h.name === "From")?.value,
    replyTo: headers?.find(h => h.name === "Reply-To")?.value
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


export function extractBodyPart(messageWithParts: MessageWithParts) {
  // 1. Filter for text/plain
  // 2. Ensure filename is empty/null to exclude attachments cuz if there is a .txt attachment it also comes has text/plain mimeType and has value for filename
  let bodyPart = messageWithParts.parts?.find(
    (part) =>
      part.mimeType === "text/plain" &&
      (!part.filename || part.filename.length === 0),
  );

  // 3. Fallback: If no plain text, find the HTML Body
  if (!bodyPart) {
    bodyPart = messageWithParts?.parts?.find(
      (part) => part.mimeType === "text/html" && !part.filename,
    );
  }
  return {
    id: messageWithParts.id,
    // If found, return the encoded data; otherwise null
    // plainPart: bodyPart ? bodyPart : null,
    rawBody: bodyPart?.body?.data ?? null,
    mimeType: bodyPart ? bodyPart.mimeType : null,
  };
}

export function decodeToPlainText(emailBody: ExtractedBodyPart) {
  if (!emailBody.rawBody || !Base64.isValid(emailBody.rawBody)) {
    return null;
  }
  try {
    let bodyText = Base64.decode(emailBody.rawBody);
    //if type is html convert it to text
    if (emailBody.mimeType === "text/html") {
      bodyText = convert(bodyText);
    }
    return bodyText;
  } catch (error) {
    console.error("decodeToPlainText Error:", error.message);
    throw new Error(`decodeToPlainText failed: ${error.message}`);
  }
}
