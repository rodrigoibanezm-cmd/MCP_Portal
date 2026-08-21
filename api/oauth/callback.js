import { exchangeAuthorizationCode } from "../../src/services/oauth.js";

function readCookie(req, name) {
  const header = req.headers.cookie || "";
  const pair = header.split(";").map((v) => v.trim()).find((v) => v.startsWith(`${name}=`));
  return pair ? decodeURIComponent(pair.slice(name.length + 1)) : null;
}

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  const { code, state, error } = req.query;
  if (error) return res.status(400).json({ ok: false, error });
  if (!code || !state) return res.status(400).json({ ok: false, error: "Missing code or state" });

  const expectedState = readCookie(req, "meli_oauth_state");
  if (!expectedState || state !== expectedState) {
    return res.status(400).json({ ok: false, error: "Invalid OAuth state" });
  }

  try {
    const tokens = await exchangeAuthorizationCode(code);
    res.setHeader("Set-Cookie", "meli_oauth_state=; Path=/api/oauth; Max-Age=0; HttpOnly; Secure; SameSite=Lax");
    return res.status(200).json({ ok: true, authorized: true, expires_in: tokens.expires_in });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
