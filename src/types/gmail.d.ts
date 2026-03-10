import { gmail_v1 } from "@googleapis/gmail";

export type GmailClient = gmail_v1.Gmail;

export type GmailMessage = gmail_v1.Schema$Message;

export type GmailMessagePart = gmail_v1.Schema$MessagePart;

export type GmailMessagePartHeader = gmail_v1.Schema$MessagePartHeader;

export type ExtractedBodyPart = {
    rawBody: string
    mimeType: string
}
export type BaseNormalizedMessage = {
    id: string
    threadId: string
    headers: Record<string, string>
    snippet: string,
    historyId: string
}

export type NormalizedMetadataMessage = BaseNormalizedMessage

export type NormalizedFullMessage = BaseNormalizedMessage & {
    parts: GmailMessagePart[]
}

export type MessageWithBody = BaseNormalizedMessage & {

    bodyPart: ExtractedBodyPart | null
}

type DecodedEmail = BaseNormalizedMessage & {

    bodyText: string
}