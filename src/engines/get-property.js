import { meliGet } from "../services/meli.js";
import { normalizeProperty } from "../services/property-normalizer.js";

export async function getProperty(controls = {}) {
  if (!controls.property_id) throw new Error("property_id is required");
  const item = await meliGet(`/items/${encodeURIComponent(controls.property_id)}`);
  return normalizeProperty(item);
}
