import { db } from "./db.js";

const PROVIDER = "mercadolibre";

export async function loadTokens() {
  const { rows } = await db().query(
    "SELECT access_token, refresh_token, expires_at, updated_at FROM public.meli_oauth_tokens WHERE provider = $1 LIMIT 1",
    [PROVIDER]
  );
  return rows[0] || null;
}

export async function saveTokens(tokens) {
  const expiresAt = new Date(Date.now() + Number(tokens.expires_in || 0) * 1000);
  await db().query(
    `INSERT INTO public.meli_oauth_tokens
      (provider, access_token, refresh_token, expires_at, updated_at)
     VALUES ($1, $2, $3, $4, now())
     ON CONFLICT (provider) DO UPDATE SET
       access_token = EXCLUDED.access_token,
       refresh_token = EXCLUDED.refresh_token,
       expires_at = EXCLUDED.expires_at,
       updated_at = now()`,
    [PROVIDER, tokens.access_token, tokens.refresh_token, expiresAt]
  );
  return { expires_at: expiresAt };
}
