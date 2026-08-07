const ACTIONS = new Set(["SEARCH_RENTALS", "GET_PROPERTY", "AUTH_STATUS"]);
const CONTROL_KEYS = new Set([
  "communes",
  "price_min",
  "price_max",
  "bedrooms_min",
  "bathrooms_min",
  "area_min",
  "parking",
  "limit",
  "property_id"
]);

export function validateInput(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Input must be an object");
  }
  if (!ACTIONS.has(input.action)) throw new Error("Invalid action");
  if (!input.controls || typeof input.controls !== "object" || Array.isArray(input.controls)) {
    throw new Error("controls must be an object");
  }
  for (const key of Object.keys(input.controls)) {
    if (!CONTROL_KEYS.has(key)) throw new Error(`Unknown control: ${key}`);
  }
  if (input.action === "GET_PROPERTY" && !input.controls.property_id) {
    throw new Error("GET_PROPERTY requires property_id");
  }
  if (input.action === "AUTH_STATUS" && Object.keys(input.controls).length) {
    throw new Error("AUTH_STATUS does not accept controls");
  }
  return input;
}
