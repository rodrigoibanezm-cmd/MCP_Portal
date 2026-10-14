export const TOOL = {
  name: "portal_inmobiliario",
  description: "Consulta arriendos y avisos de vehículos usados en Mercado Libre Chile.",
  inputSchema: {
    type: "object",
    additionalProperties: false,
    required: ["action", "controls"],
    properties: {
      action: {
        type: "string",
        enum: ["SEARCH_RENTALS", "SEARCH_VEHICLES", "GET_PROPERTY", "AUTH_STATUS"]
      },
      controls: {
        type: "object",
        additionalProperties: false,
        properties: {
          communes: {
            type: "array",
            items: { type: "string", minLength: 1 },
            minItems: 1,
            maxItems: 10
          },
          price_min: { type: "number", minimum: 0 },
          price_max: { type: "number", minimum: 0 },
          bedrooms_min: { type: "integer", minimum: 0 },
          bathrooms_min: { type: "integer", minimum: 0 },
          area_min: { type: "number", minimum: 0 },
          parking: { type: "boolean" },
          limit: { type: "integer", minimum: 1, maximum: 20 },
          property_id: { type: "string", minLength: 3 },
          brand: { type: "string", minLength: 1 },
          model: { type: "string", minLength: 1 },
          version: { type: "string", minLength: 1 },
          year: { type: "integer", minimum: 1900, maximum: 2100 },
          km: { type: "integer", minimum: 0 },
          max_pages: { type: "integer", minimum: 1, maximum: 10 }
        }
      }
    },
    allOf: [
      {
        if: { properties: { action: { const: "GET_PROPERTY" } } },
        then: { properties: { controls: { required: ["property_id"] } } }
      }
    ]
  }
};
