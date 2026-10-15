import { loadTokens } from "../services/oauth-token-store.js";
import { getValidAccessToken } from "../services/oauth.js";

async function status(path, token) {
  try {
    const r = await fetch("https://api.mercadolibre.com" + path, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      signal: AbortSignal.timeout(8000)
    });
    return r.status;
  } catch {
    return 0;
  }
}

export async function authStatus() {
  const configured = Boolean(process.env.MELI_CLIENT_ID &&
    process.env.MELI_CLIENT_SECRET && process.env.MELI_REDIRECT_URI &&
    process.env.DATABASE_URL);
  if (!configured) return { configured: false, authorized: false };
  const tokens = await loadTokens();
  const result = {
    configured: true, authorized: Boolean(tokens),
    expires_at: tokens?.expires_at || null, updated_at: tokens?.updated_at || null
  };
  if (!tokens) return result;
  let token;
  try { token = await getValidAccessToken(); } catch { result.probe_error = "refresh"; return result; }
  const endpoints = {
    user: "/users/me",
    site: "/sites/MLC",
    categories: "/sites/MLC/categories",
    search: "/sites/MLC/search?q=auto&limit=1",
    item: "/items/MLC4548769130"
  };
  result.probe = {};
  for (const [name, path] of Object.entries(endpoints)) {
    result.probe[name] = [await status(path, null), await status(path, token)];
  }
  // Additional endpoint isolation: own seller listings versus global marketplace.
  let ownId = null;
  try {
    const u = await fetch("https://api.mercadolibre.com/users/me", {
      headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(8000)
    });
    if (u.ok) ownId = (await u.json())?.id;
  } catch {}
  result.extra_probe = {};
  const extra = {
    search_category: "/sites/MLC/search?category=MLC1747&limit=1",
    search_with_seller: ownId ? `/sites/MLC/search?seller_id=${ownId}&limit=1` : null,
    own_seller_items: ownId ? `/users/${ownId}/items/search?limit=1` : null,
    site_domains: "/sites/MLC/domain_discovery/search?limit=1&q=auto",
    site_categories: "/sites/MLC/categories",
    sites: "/sites"
  };
  for (const [key, value] of Object.entries(extra)) {
    if (value) result.extra_probe[key] = [await status(value, null), await status(value, token)];
  }
  return result;
}
