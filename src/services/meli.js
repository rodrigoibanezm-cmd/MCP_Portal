import { getValidAccessToken } from "./oauth.js";

const API = "https://api.mercadolibre.com";

export async function meliGet(path, params = {}) {
  const url = new URL(`${API}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  const accessToken = await getValidAccessToken();
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  const data = await response.json();
  if (!response.ok) {
    const code = data?.error || data?.code || "unknown";
    const message = data?.message || "Request rejected";
    throw new Error(`Mercado Libre ${response.status} (${code}) at ${url.pathname}: ${message}`);
  }
  return data;
}
