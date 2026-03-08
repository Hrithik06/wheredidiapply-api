import { gmail_v1 } from "@googleapis/gmail";

export type GmailClient = gmail_v1.Gmail;
export type GmailMessage = gmail_v1.Schema$Message;
export type GmailMessagePart = gmail_v1.Schema$MessagePart;
export type GmailMessagePartBody = gmail_v1.Schema$MessagePartBody;
export type GmailMessagePartHeader = gmail_v1.Schema$MessagePartHeader;
export type GmailMessageList = gmail_v1.Schema$ListMessagesResponse;
export type GmailMessageHeaders = gmail_v1.Schema$MessagePartHeader;

export type MessageWithParts = {
    id: string
    headers: {
        subject: string
        from: string
        replyTo: string
    }
    parts: GmailMessagePart[]
}

export type ExtractedBodyPart = {
    id: string
    rawBody: string
    mimeType: string
}
