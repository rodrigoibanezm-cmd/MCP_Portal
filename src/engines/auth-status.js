export async function authStatus() {
  return {
    client_id: Boolean(process.env.MELI_CLIENT_ID),
    client_secret: Boolean(process.env.MELI_CLIENT_SECRET),
    redirect_uri: Boolean(process.env.MELI_REDIRECT_URI),
    access_token: Boolean(process.env.MELI_ACCESS_TOKEN)
  };
}
