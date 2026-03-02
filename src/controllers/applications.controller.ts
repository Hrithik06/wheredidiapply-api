import { Request, Response } from "express";
import { fetchEmails } from "../services/gmailSync.service.js";
import { getUser } from "../services/user.service.js";
// import { Base64 } from "js-base64";
export async function scanGmailForApplications(req: Request, res: Response) {
  const googleId = "108871094855080717450";
  const user = await getUser(googleId);
  const { refreshToken, accessToken } = user!;
  const message = await fetchEmails(refreshToken!, accessToken!);
  // // res.json(message.data.payload.parts[0].body.data);
  // const encoded = message.data.payload.parts[0].body.data;
  // var bytes = Base64.decode(encoded);
  // // var text = utf8.decode(bytes);
  res.send(message);
}
