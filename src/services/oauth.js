import { loadTokens, saveTokens } from "./oauth-token-store.js";

const TOKEN_URL = "https://api.mercadolibre.com/oauth/token";
const AUTH_URL = "https://auth.mercadolibre.cl/authorization";
const EXPIRY_MARGIN_MS = 60_000;

async function postToken(body) {
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.message || "Mercado Libre OAuth failed");
  return data;
}

export function buildAuthorizationUrl(state) {
  const url = new URL(AUTH_URL);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", process.env.MELI_CLIENT_ID);
  url.searchParams.set("redirect_uri", process.env.MELI_REDIRECT_URI);
  url.searchParams.set("state", state);
  return url.toString();
}

export async function exchangeAuthorizationCode(code) {
  const tokens = await postToken({
    grant_type: "authorization_code",
    client_id: process.env.MELI_CLIENT_ID,
    client_secret: process.env.MELI_CLIENT_SECRET,
    code,
    redirect_uri: process.env.MELI_REDIRECT_URI
  });
  await saveTokens(tokens);
  return tokens;
}

export async function getValidAccessToken() {
  const current = await loadTokens();
  if (!current) throw new Error("Mercado Libre is not authorized");
  if (new Date(current.expires_at).getTime() > Date.now() + EXPIRY_MARGIN_MS) {
    return current.access_token;
  }
  const tokens = await postToken({
    grant_type: "refresh_token",
    client_id: process.env.MELI_CLIENT_ID,
    client_secret: process.env.MELI_CLIENT_SECRET,
    refresh_token: current.refresh_token
  });
  await saveTokens(tokens);
  return tokens.access_token;
}
