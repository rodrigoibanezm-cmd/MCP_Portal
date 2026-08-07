import { TOOL } from "../src/tool-schema.js";
import { route } from "../src/router.js";

function ok(id, result) {
  return { jsonrpc: "2.0", id, result };
}

function fail(id, code, message) {
  return { jsonrpc: "2.0", id, error: { code, message } };
}

async function handle(body) {
  const { id, method, params } = body || {};

  if (method === "initialize") {
    return ok(id, {
      protocolVersion: params?.protocolVersion || "2025-03-26",
      capabilities: { tools: {} },
      serverInfo: { name: "mcp-portal", version: "0.1.0" }
    });
  }
  if (method === "ping") return ok(id, {});
  if (method === "tools/list") return ok(id, { tools: [TOOL] });
  if (method === "tools/call") {
    if (params?.name !== TOOL.name) return fail(id, -32602, "Unknown tool");
    const data = await route(params?.arguments || {});
    return ok(id, {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: data
    });
  }
  return fail(id, -32601, "Method not found");
}

export default async function handler(req, res) {
  if (req.method === "GET") return res.status(200).json({ ok: true, service: "mcp-portal" });
  if (req.method !== "POST") return res.status(405).end();
  try {
    const response = await handle(req.body);
    if (response?.id === undefined || response?.id === null) return res.status(202).end();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(200).json(fail(req.body?.id ?? null, -32603, error.message));
  }
}
