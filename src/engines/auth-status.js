import { loadTokens } from "../services/oauth-token-store.js";

export async function authStatus() {
  const configured = Boolean(
    process.env.MELI_CLIENT_ID &&
    process.env.MELI_CLIENT_SECRET &&
    process.env.MELI_REDIRECT_URI &&
    process.env.DATABASE_URL
  );

  if (!configured) return { configured: false, authorized: false };

  const tokens = await loadTokens();
  return {
    configured: true,
    authorized: Boolean(tokens),
    expires_at: tokens?.expires_at || null,
    updated_at: tokens?.updated_at || null
  };
}
