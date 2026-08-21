import { db } from "./db.js";

const PROVIDER = "mercadolibre";

export async function loadTokens() {
  const sql = db();
  const rows = await sql`
    SELECT access_token, refresh_token, expires_at, updated_at
    FROM public.meli_oauth_tokens
    WHERE provider = ${PROVIDER}
    LIMIT 1
  `;
  return rows[0] || null;
}

export async function saveTokens(tokens) {
  const sql = db();
  const expiresAt = new Date(Date.now() + Number(tokens.expires_in || 0) * 1000);
  await sql`
    INSERT INTO public.meli_oauth_tokens
      (provider, access_token, refresh_token, expires_at, updated_at)
    VALUES
      (${PROVIDER}, ${tokens.access_token}, ${tokens.refresh_token}, ${expiresAt}, now())
    ON CONFLICT (provider) DO UPDATE SET
      access_token = EXCLUDED.access_token,
      refresh_token = EXCLUDED.refresh_token,
      expires_at = EXCLUDED.expires_at,
      updated_at = now()
  `;
  return { expires_at: expiresAt };
}
