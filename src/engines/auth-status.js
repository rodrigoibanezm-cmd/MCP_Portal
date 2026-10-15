import { loadTokens } from "../services/oauth-token-store.js";
import { getValidAccessToken } from "../services/oauth.js";

async function probe(path, token) {
  try {
    const response = await fetch("https://api.mercadolibre.com" + path, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      signal: AbortSignal.timeout(10000)
    });
    let payload = {};
    try { payload = await response.json(); } catch {}
    return {
      status: response.status,
      code: response.ok ? null : String(payload?.error || payload?.code || "unknown").slice(0,80)
    };
  } catch (error) {
    return { status: null, code: "network_error" };
  }
}

export async function authStatus() {
  const configured = Boolean(process.env.MELI_CLIENT_ID && process.env.MELI_CLIENT_SECRET &&
    process.env.MELI_REDIRECT_URI && process.env.DATABASE_URL);
  if (!configured) return { configured: false, authorized: false };
  const tokens = await loadTokens();
  const result = { configured: true, authorized: Boolean(tokens),
    expires_at: tokens?.expires_at || null, updated_at: tokens?.updated_at || null };
  if (!tokens) return result;
  let token;
  try { token = await getValidAccessToken(); }
  catch { result.diagnostic = { error: "token_refresh_failed" }; return result; }
  const paths = ["/users/me", "/sites/MLC/search?q=kia%20sportage&limit=1", "/sites/MLC/categories", "/items/MLC4548769130"];
  result.diagnostic = {};
  for (const path of paths) {
    result.diagnostic[path.split("?")[0]] = {
      without_token: await probe(path, null),
      with_token: await probe(path, token)
    };
  }
  return result;
}
