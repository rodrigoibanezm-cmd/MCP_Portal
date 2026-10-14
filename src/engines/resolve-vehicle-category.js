import { meliGet } from "../services/meli.js";

let cached;
const normalize = (s) => String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
export async function resolveVehicleCategory() {
  if (cached) return cached;
  const roots = await meliGet("/sites/MLC/categories");
  const root = roots.find((x) => /vehiculos/.test(normalize(x.name)));
  if (!root) throw new Error("Vehicle category not found");
  const detail = await meliGet(`/categories/${root.id}`);
  const cars = detail.children_categories?.find((x) => /autos y camionetas/.test(normalize(x.name)));
  if (!cars) throw new Error("Autos y camionetas category not found");
  cached = cars.id;
  return cached;
}
