export default function handler(req, res) {
  const clientId = process.env.MELI_CLIENT_ID;
  const redirectUri = process.env.MELI_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    return res.status(500).json({ error: "Missing MELI_CLIENT_ID or MELI_REDIRECT_URI" });
  }

  const url = new URL("https://auth.mercadolibre.cl/authorization");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  return res.redirect(302, url.toString());
}
