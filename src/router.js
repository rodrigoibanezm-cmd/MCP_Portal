import { validateInput } from "./validate.js";
import * as engines from "./engines/index.js";

export async function route(rawInput) {
  const input = validateInput(rawInput);

  switch (input.action) {
    case "SEARCH_RENTALS":
      return engines.searchRentals(input.controls);
    case "GET_PROPERTY":
      return engines.getProperty(input.controls);
    case "AUTH_STATUS":
      return engines.authStatus();
    default:
      throw new Error("Unsupported action");
  }
}
