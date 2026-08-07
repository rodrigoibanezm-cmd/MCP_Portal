import { meliGet } from "../services/meli.js";

async function findChild(parentId, names) {
  const category = await meliGet(`/categories/${parentId}`);
  const wanted = names.map((name) => name.toLowerCase());
  return category.children_categories?.find((child) =>
    wanted.includes(child.name.toLowerCase())
  ) || null;
}

export async function resolveRentalCategory() {
  const roots = await meliGet("/sites/MLC/categories");
  const realEstate = roots.find((item) => item.name.toLowerCase() === "inmuebles");
  if (!realEstate) throw new Error("No se encontró la categoría Inmuebles");

  const apartment = await findChild(realEstate.id, ["Departamentos", "Departamento"]);
  if (!apartment) throw new Error("No se encontró la categoría Departamentos");

  const rental = await findChild(apartment.id, ["Arriendo", "Alquiler"]);
  if (!rental) throw new Error("No se encontró la categoría Arriendo");

  const rentalDetails = await meliGet(`/categories/${rental.id}`);
  if (!rentalDetails.children_categories?.length) return rental.id;

  const individual = rentalDetails.children_categories.find((child) =>
    ["propiedades individuales", "usados", "propiedades usadas"].includes(
      child.name.toLowerCase()
    )
  );
  return individual?.id || rental.id;
}
