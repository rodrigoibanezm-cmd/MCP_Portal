import { loadTokens } from "../services/oauth-token-store.js";
import { getValidAccessToken } from "../services/oauth.js";

export async function authStatus() {
  const configured = Boolean(
    process.env.MELI_CLIENT_ID &&
    process.env.MELI_CLIENT_SECRET &&
    process.env.MELI_REDIRECT_URI &&
    process.env.DATABASE_URL
  );

  if (!configured) return { configured: false, authorized: false };

  const tokens = await loadTokens();
  const result = {
    configured: true,
    authorized: Boolean(tokens),
    expires_at: tokens?.expires_at || null,
    updated_at: tokens?.updated_at || null
  };
  if (!tokens) return result;

  // Temporary safe diagnostic. Never expose the bearer token or user identity.
  try {
    const token = await getValidAccessToken();
    const response = await fetch("https://api.mercadolibre.com/users/me", {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(12000)
    });
    let payload = {};
    try { payload = await response.json(); } catch {}
    result.users_me_probe = {
      http_status: response.status,
      authorized: response.ok,
      error_code: response.ok ? null : String(payload?.error || payload?.code || "unknown").slice(0,100)
    };
  } catch (err) {
    result.users_me_probe = { http_status: null, authorized: false, error_code: "network_or_token_error" };
  }
  return result;
}
