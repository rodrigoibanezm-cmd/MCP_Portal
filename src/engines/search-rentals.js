import { meliGet } from "../services/meli.js";
import { normalizeProperty } from "../services/property-normalizer.js";
import { resolveRentalCategory } from "./resolve-rental-category.js";

function number(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function passes(property, controls) {
  const commune = property.commune?.toLowerCase();
  if (controls.communes?.length) {
    const allowed = controls.communes.map((item) => item.toLowerCase());
    if (!commune || !allowed.some((item) => commune.includes(item))) return false;
  }
  if (controls.price_min && property.price < controls.price_min) return false;
  if (controls.price_max && property.price > controls.price_max) return false;
  if (controls.bedrooms_min && number(property.bedrooms) < controls.bedrooms_min) return false;
  if (controls.bathrooms_min && number(property.bathrooms) < controls.bathrooms_min) return false;
  if (controls.area_min && number(property.total_area) < controls.area_min) return false;
  if (controls.parking === true && number(property.parking_spaces) < 1) return false;
  return true;
}

export async function searchRentals(controls = {}) {
  const category = await resolveRentalCategory();
  const limit = Math.min(Math.max(controls.limit || 10, 1), 20);
  const query = controls.communes?.length ? controls.communes.join(" ") : undefined;
  const data = await meliGet("/sites/MLC/search", {
    category,
    q: query,
    limit: 50,
    price: controls.price_min || controls.price_max
      ? `${controls.price_min || "*"}-${controls.price_max || "*"}`
      : undefined
  });

  const properties = (data.results || [])
    .map(normalizeProperty)
    .filter((item) => passes(item, controls))
    .slice(0, limit);

  return {
    count: properties.length,
    total_source_results: data.paging?.total ?? null,
    properties
  };
}
