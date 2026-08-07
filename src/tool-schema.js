export const TOOL = {
  name: "portal_inmobiliario",
  description: "Consulta departamentos en arriendo en Portal Inmobiliario. Elige una acción y envía solo sus variables de control.",
  inputSchema: {
    type: "object",
    additionalProperties: false,
    required: ["action", "controls"],
    properties: {
      action: {
        type: "string",
        enum: ["SEARCH_RENTALS", "GET_PROPERTY", "AUTH_STATUS"]
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
          property_id: { type: "string", minLength: 3 }
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
