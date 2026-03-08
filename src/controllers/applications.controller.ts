import { Request, Response } from "express";
import { fetchEmails } from "../services/gmailSync.service.js";
import { getUser } from "../services/user.service.js";
// import { Base64 } from "js-base64";
export async function scanGmailForApplications(req: Request, res: Response) {
  // TODO: get googleId from req
  const googleId = "107116420132667803041";
  if (!googleId) {
    res.status(400).send("Invalid Google Id")
    return
  }
  const user = await getUser(googleId);
  if (!user) {
    res.status(400).send("Invalid User")
    return
  }

  const { refreshToken, accessToken } = user;
  if (!refreshToken) {
    res.status(500).send("Missing Refresh token of User in DB")
    return
  }
  if (!accessToken) {
    res.status(500).send("Missing Access token of User in DB")
    return
  }
  const message = await fetchEmails(refreshToken, accessToken);
  // // res.json(message.data.payload.parts[0].body.data);
  // const encoded = message.data.payload.parts[0].body.data;
  // var bytes = Base64.decode(encoded);
  // // var text = utf8.decode(bytes);
  res.send(message);
}
