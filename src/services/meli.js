const API = "https://api.mercadolibre.com";

function token() {
  return process.env.MELI_ACCESS_TOKEN || null;
}

export async function meliGet(path, params = {}) {
  const url = new URL(`${API}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  const headers = {};
  const accessToken = token();
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const response = await fetch(url, { headers });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || `Mercado Libre API ${response.status}`);
  }
  return data;
}

export async function exchangeCode(code) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: process.env.MELI_CLIENT_ID,
    client_secret: process.env.MELI_CLIENT_SECRET,
    code,
    redirect_uri: process.env.MELI_REDIRECT_URI
  });

  const response = await fetch(`${API}/oauth/token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.message || "OAuth exchange failed");
  return data;
}
