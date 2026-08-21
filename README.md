# MCP Portal Inmobiliario

Arquitectura deliberadamente simple:

- `api/mcp.js`: transporte MCP/JSON-RPC.
- `src/tool-schema.js`: único tool público, schema rígido.
- `src/router.js`: router central por `action`.
- `src/engines/*`: un motor por responsabilidad.
- `src/services/*`: acceso externo, OAuth y normalización.
- `api/oauth/*`: autorización Mercado Libre.

## Tool

`portal_inmobiliario`

Acciones:

- `SEARCH_RENTALS`
- `GET_PROPERTY`
- `AUTH_STATUS`

El LLM no decide endpoints ni motores. Solo selecciona una acción válida y entrega variables de control definidas por el schema.

## Variables Vercel

- `MELI_CLIENT_ID`
- `MELI_CLIENT_SECRET`
- `MELI_REDIRECT_URI`
- `DATABASE_URL`

## OAuth

1. Abrir `/api/oauth/login`.
2. Mercado Libre redirige a `/api/oauth/callback`.
3. Los tokens se guardan en Neon.
4. El cliente renueva automáticamente el access token cuando corresponde.

## Regla de diseño

Ningún archivo debe superar aproximadamente 100–120 líneas. Un motor debe tener una sola responsabilidad.
