function attribute(item, ids) {
  const found = item.attributes?.find((attr) => ids.includes(attr.id));
  return found?.value_struct?.number ?? found?.value_name ?? null;
}

export function normalizeProperty(item) {
  return {
    id: item.id,
    title: item.title,
    price: item.price,
    currency: item.currency_id,
    url: item.permalink,
    thumbnail: item.thumbnail,
    commune: item.address?.city_name || item.location?.city?.name || null,
    region: item.address?.state_name || item.location?.state?.name || null,
    bedrooms: attribute(item, ["BEDROOMS", "BEDROOMS_AMOUNT"]),
    bathrooms: attribute(item, ["FULL_BATHROOMS", "BATHROOMS"]),
    total_area: attribute(item, ["TOTAL_AREA"]),
    covered_area: attribute(item, ["COVERED_AREA"]),
    parking_spaces: attribute(item, ["PARKING_LOTS", "PARKING_SPACES"])
  };
}
