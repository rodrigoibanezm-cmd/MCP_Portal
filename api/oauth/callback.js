export default function handler(req, res) {
  res.status(501).json({
    error: "Token persistence not configured",
    next: "Configure persistent token storage before enabling OAuth callback"
  });
}
