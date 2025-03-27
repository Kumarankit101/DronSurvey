import { Location } from "@shared/schema";

/**
 * Generate survey pattern data for a mission based on location and pattern type
 */
export function generateSurveyPatternData(
  location: Location | undefined,
  patternType: string
): any {
  if (!location) {
    // Return default pattern if no location provided
    return {
      coordinates: defaultCoordinates(),
    };
  }

  const { latitude, longitude } = location;
  
  if (!latitude || !longitude) {
    return {
      coordinates: defaultCoordinates(),
    };
  }

  // Center coordinates
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);

  // Generate appropriate pattern based on type
  switch (patternType) {
    case "perimeter":
      return generatePerimeterPattern(lat, lng);
    case "crosshatch":
      return generateCrosshatchPattern(lat, lng);
    case "grid":
      return generateGridPattern(lat, lng);
    default:
      return generateCrosshatchPattern(lat, lng);
  }
}

/**
 * Generate a perimeter pattern around the location
 */
function generatePerimeterPattern(centerLat: number, centerLng: number): any {
  // Create a simple rectangle around the center point
  // Offset by about 0.005 degrees (~500m)
  const offset = 0.005;
  
  return {
    coordinates: [
      { lat: centerLat - offset, lng: centerLng - offset }, // SW
      { lat: centerLat - offset, lng: centerLng + offset }, // SE
      { lat: centerLat + offset, lng: centerLng + offset }, // NE
      { lat: centerLat + offset, lng: centerLng - offset }, // NW
      { lat: centerLat - offset, lng: centerLng - offset }, // Back to SW to close the loop
    ],
    flightPath: {
      type: "perimeter",
      height: 30,
      speed: 5,
    },
  };
}

/**
 * Generate a crosshatch pattern centered on the location
 */
function generateCrosshatchPattern(centerLat: number, centerLng: number): any {
  // Create a rectangle with crosshatch pattern
  const offset = 0.005;
  
  const vertices = [
    { lat: centerLat - offset, lng: centerLng - offset }, // SW
    { lat: centerLat - offset, lng: centerLng + offset }, // SE
    { lat: centerLat + offset, lng: centerLng + offset }, // NE
    { lat: centerLat + offset, lng: centerLng - offset }, // NW
  ];
  
  // For flight path, we would add crosshatch lines
  // We'll just include the vertices here for simplicity
  
  return {
    coordinates: vertices,
    flightPath: {
      type: "crosshatch",
      spacing: 25, // meters between lines
      height: 40,
      speed: 4,
    },
  };
}

/**
 * Generate a grid pattern centered on the location
 */
function generateGridPattern(centerLat: number, centerLng: number): any {
  // Create a rectangle with grid pattern
  const offset = 0.005;
  
  const vertices = [
    { lat: centerLat - offset, lng: centerLng - offset }, // SW
    { lat: centerLat - offset, lng: centerLng + offset }, // SE
    { lat: centerLat + offset, lng: centerLng + offset }, // NE
    { lat: centerLat + offset, lng: centerLng - offset }, // NW
  ];
  
  return {
    coordinates: vertices,
    flightPath: {
      type: "grid",
      spacing: 20, // meters between grid lines
      height: 35,
      speed: 3,
    },
  };
}

/**
 * Default coordinates if no location is provided
 */
function defaultCoordinates() {
  // Default to San Francisco area
  return [
    { lat: 37.7749, lng: -122.4194 },
    { lat: 37.7749, lng: -122.4094 },
    { lat: 37.7849, lng: -122.4094 },
    { lat: 37.7849, lng: -122.4194 },
  ];
}
