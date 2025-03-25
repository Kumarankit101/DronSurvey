import L from "leaflet";
import { Mission } from "@shared/schema";

/**
 * Draw mission path on the map based on mission type and survey pattern data
 */
export function drawMissionPath(map: L.Map, mission: Mission): void {
  if (!mission.surveyPatternData) {
    console.error("No survey pattern data available for mission", mission.id);
    return;
  }

  const { coordinates } = mission.surveyPatternData as any;
  if (!coordinates || !Array.isArray(coordinates) || coordinates.length === 0) {
    console.error("Invalid coordinates in survey pattern data", mission.id);
    return;
  }

  // Convert coordinates to Leaflet latLng format
  const latLngs = coordinates.map((coord: any) => 
    L.latLng(parseFloat(coord.lat), parseFloat(coord.lng))
  );

  // Clear existing paths if any
  // (this is handled by the parent component, just focusing on drawing here)

  // Create survey area polygon based on mission type
  if (mission.missionType === "perimeter") {
    // For perimeter, just create a polygon outlining the area
    createPerimeterPath(map, latLngs, mission);
  } else if (mission.missionType === "crosshatch") {
    // For crosshatch, create a polygon and add crosshatch pattern inside
    createCrosshatchPath(map, latLngs, mission);
  } else if (mission.missionType === "grid") {
    // For grid pattern, create a polygon and add grid lines
    createGridPath(map, latLngs, mission);
  } else {
    // Default to simple polygon
    createPerimeterPath(map, latLngs, mission);
  }

  // Add drone position marker if mission is in progress
  if (mission.status === "in-progress" && mission.completionPercentage !== undefined) {
    // For demo, we'll calculate a position along the path based on completion percentage
    addDroneMarker(map, latLngs, mission.completionPercentage);
  }
}

/**
 * Create a perimeter path on the map
 */
function createPerimeterPath(map: L.Map, latLngs: L.LatLng[], mission: Mission): void {
  // Create area boundary polygon
  const areaPolygon = L.polygon(latLngs, {
    color: '#1976d2',
    weight: 2,
    opacity: 0.8,
    fillColor: '#1976d2',
    fillOpacity: 0.1,
  }).addTo(map);

  // Create flight path polyline (follows the perimeter)
  const closedLatLngs = [...latLngs, latLngs[0]]; // Close the loop
  const flightPath = L.polyline(closedLatLngs, {
    color: '#1976d2',
    weight: 3,
    opacity: 0.8,
    dashArray: mission.status === 'in-progress' ? '5, 10' : '',
    dashOffset: mission.status === 'in-progress' ? '0' : '',
  }).addTo(map);

  // Add animated effect if mission is in progress
  if (mission.status === 'in-progress') {
    animateFlightPath(flightPath);
  }

  // Fit map to the polygon bounds
  map.fitBounds(areaPolygon.getBounds());
}

/**
 * Create a crosshatch pattern path on the map
 */
function createCrosshatchPath(map: L.Map, latLngs: L.LatLng[], mission: Mission): void {
  // Create area boundary polygon
  const areaPolygon = L.polygon(latLngs, {
    color: '#388e3c',
    weight: 2,
    opacity: 0.8,
    fillColor: '#388e3c',
    fillOpacity: 0.1,
  }).addTo(map);

  // Create crosshatch pattern lines
  const bounds = areaPolygon.getBounds();
  const north = bounds.getNorth();
  const south = bounds.getSouth();
  const east = bounds.getEast();
  const west = bounds.getWest();
  
  // Calculate center and dimensions
  const center = bounds.getCenter();
  const width = east - west;
  const height = north - south;
  
  // Create horizontal crosshatch lines
  const hLines = [];
  const numHLines = 5; // Number of horizontal lines
  for (let i = 0; i < numHLines; i++) {
    const y = south + (height * i) / (numHLines - 1);
    hLines.push(L.polyline(
      [
        [y, west],
        [y, east]
      ],
      {
        color: '#388e3c',
        weight: 1.5,
        opacity: 0.6,
        dashArray: '3, 3',
      }
    ).addTo(map));
  }
  
  // Create vertical crosshatch lines
  const vLines = [];
  const numVLines = 5; // Number of vertical lines
  for (let i = 0; i < numVLines; i++) {
    const x = west + (width * i) / (numVLines - 1);
    vLines.push(L.polyline(
      [
        [south, x],
        [north, x]
      ],
      {
        color: '#388e3c',
        weight: 1.5,
        opacity: 0.6,
        dashArray: '3, 3',
      }
    ).addTo(map));
  }
  
  // Create diagonal lines
  const diag1 = L.polyline(
    [
      [south, west],
      [north, east]
    ],
    {
      color: '#388e3c',
      weight: 1.5,
      opacity: 0.6,
      dashArray: '3, 3',
    }
  ).addTo(map);
  
  const diag2 = L.polyline(
    [
      [north, west],
      [south, east]
    ],
    {
      color: '#388e3c',
      weight: 1.5,
      opacity: 0.6,
      dashArray: '3, 3',
    }
  ).addTo(map);
  
  // Create flight path (zigzag pattern for crosshatch)
  const flightCoords = createZigzagPattern(latLngs);
  const flightPath = L.polyline(flightCoords, {
    color: '#f57c00',
    weight: 3,
    opacity: 0.8,
    dashArray: mission.status === 'in-progress' ? '5, 10' : '',
    dashOffset: mission.status === 'in-progress' ? '0' : '',
  }).addTo(map);
  
  // Add animated effect if mission is in progress
  if (mission.status === 'in-progress') {
    animateFlightPath(flightPath);
  }

  // Fit map to the polygon bounds
  map.fitBounds(areaPolygon.getBounds());
}

/**
 * Create a grid pattern path on the map
 */
function createGridPath(map: L.Map, latLngs: L.LatLng[], mission: Mission): void {
  // Create area boundary polygon
  const areaPolygon = L.polygon(latLngs, {
    color: '#9c27b0',
    weight: 2,
    opacity: 0.8,
    fillColor: '#9c27b0',
    fillOpacity: 0.1,
  }).addTo(map);

  // Create grid pattern
  const bounds = areaPolygon.getBounds();
  const north = bounds.getNorth();
  const south = bounds.getSouth();
  const east = bounds.getEast();
  const west = bounds.getWest();
  
  // Calculate dimensions
  const width = east - west;
  const height = north - south;
  
  // Create horizontal grid lines
  const hLines = [];
  const numHLines = 6; // Number of horizontal lines
  for (let i = 0; i < numHLines; i++) {
    const y = south + (height * i) / (numHLines - 1);
    hLines.push(L.polyline(
      [
        [y, west],
        [y, east]
      ],
      {
        color: '#9c27b0',
        weight: 1.5,
        opacity: 0.6,
        dashArray: '3, 3',
      }
    ).addTo(map));
  }
  
  // Create vertical grid lines
  const vLines = [];
  const numVLines = 6; // Number of vertical lines
  for (let i = 0; i < numVLines; i++) {
    const x = west + (width * i) / (numVLines - 1);
    vLines.push(L.polyline(
      [
        [south, x],
        [north, x]
      ],
      {
        color: '#9c27b0',
        weight: 1.5,
        opacity: 0.6,
        dashArray: '3, 3',
      }
    ).addTo(map));
  }
  
  // Create flight path (lawn mower pattern for grid)
  const flightCoords = createLawnMowerPattern(latLngs);
  const flightPath = L.polyline(flightCoords, {
    color: '#f57c00',
    weight: 3,
    opacity: 0.8,
    dashArray: mission.status === 'in-progress' ? '5, 10' : '',
    dashOffset: mission.status === 'in-progress' ? '0' : '',
  }).addTo(map);
  
  // Add animated effect if mission is in progress
  if (mission.status === 'in-progress') {
    animateFlightPath(flightPath);
  }

  // Fit map to the polygon bounds
  map.fitBounds(areaPolygon.getBounds());
}

/**
 * Create a zigzag pattern for crosshatch missions
 */
function createZigzagPattern(latLngs: L.LatLng[]): L.LatLng[] {
  const bounds = L.latLngBounds(latLngs);
  const north = bounds.getNorth();
  const south = bounds.getSouth();
  const east = bounds.getEast();
  const west = bounds.getWest();
  
  const height = north - south;
  const rows = 5; // Number of rows for zigzag
  const rowHeight = height / rows;
  
  const zigzagPath: L.LatLng[] = [];
  
  // Add start point
  zigzagPath.push(L.latLng(south, west));
  
  // Generate zigzag pattern
  for (let i = 0; i < rows; i++) {
    const y = south + i * rowHeight;
    
    if (i % 2 === 0) {
      // Left to right
      zigzagPath.push(L.latLng(y, west));
      zigzagPath.push(L.latLng(y, east));
    } else {
      // Right to left
      zigzagPath.push(L.latLng(y, east));
      zigzagPath.push(L.latLng(y, west));
    }
  }
  
  // Add final row if necessary
  zigzagPath.push(L.latLng(north, (rows % 2 === 0) ? west : east));
  
  return zigzagPath;
}

/**
 * Create a lawn mower pattern for grid missions
 */
function createLawnMowerPattern(latLngs: L.LatLng[]): L.LatLng[] {
  const bounds = L.latLngBounds(latLngs);
  const north = bounds.getNorth();
  const south = bounds.getSouth();
  const east = bounds.getEast();
  const west = bounds.getWest();
  
  const width = east - west;
  const columns = 6; // Number of columns for lawn mower pattern
  const columnWidth = width / columns;
  
  const lawnMowerPath: L.LatLng[] = [];
  
  // Add start point
  lawnMowerPath.push(L.latLng(south, west));
  
  // Generate lawn mower pattern
  for (let i = 0; i < columns; i++) {
    const x = west + i * columnWidth;
    
    if (i % 2 === 0) {
      // Bottom to top
      lawnMowerPath.push(L.latLng(south, x));
      lawnMowerPath.push(L.latLng(north, x));
    } else {
      // Top to bottom
      lawnMowerPath.push(L.latLng(north, x));
      lawnMowerPath.push(L.latLng(south, x));
    }
  }
  
  // Add final column if necessary
  lawnMowerPath.push(L.latLng((columns % 2 === 0) ? south : north, east));
  
  return lawnMowerPath;
}

/**
 * Add a drone marker at a position along the path based on completion percentage
 */
function addDroneMarker(map: L.Map, path: L.LatLng[], completionPercentage: number): void {
  if (path.length === 0) return;
  
  // For demo purposes, calculate a position along the path based on completion percentage
  const index = Math.min(
    Math.floor((path.length - 1) * (completionPercentage / 100)),
    path.length - 1
  );
  
  const position = path[index];
  
  // Create a custom drone icon
  const droneIcon = L.divIcon({
    html: `
      <div class="relative">
        <div class="absolute w-4 h-4 bg-amber-500 rounded-full opacity-40 animate-ping -top-2 -left-2"></div>
        <div class="w-3 h-3 bg-amber-500 rounded-full"></div>
      </div>
    `,
    className: '',
    iconSize: [10, 10]
  });
  
  // Add marker
  const marker = L.marker(position, { icon: droneIcon }).addTo(map);
  
  // Add tooltip
  marker.bindTooltip("Drone in flight", { 
    permanent: false,
    direction: 'top',
    offset: L.point(0, -10)
  });
}

/**
 * Animate a flight path to show drone movement
 */
function animateFlightPath(path: L.Polyline): void {
  // This function would typically use CSS animations
  // For simplicity in this demo, we'll use Leaflet's dashOffset
  
  let offset = 0;
  
  // Create animation using requestAnimationFrame
  function animate() {
    offset -= 0.5;
    path.setStyle({ dashOffset: String(offset) });
    requestAnimationFrame(animate);
  }
  
  animate();
}
