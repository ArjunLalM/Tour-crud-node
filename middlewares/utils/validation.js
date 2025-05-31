// utils/validation.js

export const validateJSONField = (fieldName, validatorFn) => {
  return (value) => {
    let parsed;
    try {
      parsed = typeof value === 'string' ? JSON.parse(value) : value;
    } catch {
      throw new Error(`${fieldName} must be a valid JSON string`);
    }

    const error = validatorFn(parsed);
    if (error) {
      throw new Error(`${fieldName}: ${error}`);
    }

    return true;
  };
};

export const itineraryValidator = (itinerary) => {
  if (!Array.isArray(itinerary)) return "Itinerary must be an array";
  for (const step of itinerary) {
    if (!step.step || !step.description) {
      return "Each itinerary item must include step and description";
    }
  }
  return null;
};

export const coordinatesValidator = (coordinates) => {
  if (coordinates.type !== "Point" || !Array.isArray(coordinates.coordinates)) {
    return "Coordinates must have type 'Point' and a coordinates array";
  }
  return null;
};
