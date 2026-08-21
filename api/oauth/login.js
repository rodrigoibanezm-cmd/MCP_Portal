import crypto from "node:crypto";
import { buildAuthorizationUrl } from "../../src/services/oauth.js";

function stateCookie(value) {
  return [
    `meli_oauth_state=${value}`,
    "Path=/api/oauth",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    "Max-Age=600"
  ].join("; ");
}

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  if (!process.env.MELI_CLIENT_ID || !process.env.MELI_REDIRECT_URI) {
    return res.status(500).json({ ok: false, error: "OAuth configuration missing" });
  }
  const state = crypto.randomBytes(24).toString("hex");
  res.setHeader("Set-Cookie", stateCookie(state));
  return res.redirect(302, buildAuthorizationUrl(state));
}
