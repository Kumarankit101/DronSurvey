import { useEffect, useRef } from "react";
import L from "leaflet";
import { Mission } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Drone } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { drawMissionPath } from "@/lib/mapUtils";

interface MissionMapProps {
  mission?: Mission | null;
  interactive?: boolean;
  height?: string;
}

export default function MissionMap({ mission, interactive = false, height = "h-96" }: MissionMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  
  // Query drones to get the assigned drone for the mission
  const { data: drones } = useQuery<Drone[]>({
    queryKey: ['/api/drones'],
    enabled: !!mission?.droneId
  });
  
  const assignedDrone = mission?.droneId 
    ? drones?.find(d => d.id === mission.droneId) 
    : undefined;

  useEffect(() => {
    if (!mapRef.current) return;
    
    // Initialize map if it doesn't exist
    if (!leafletMap.current) {
      // Default to San Francisco if no mission coordinates
      const defaultCenter = [37.7749, -122.4194];
      
      leafletMap.current = L.map(mapRef.current).setView(defaultCenter, 14);
      
      // Add tile layer (satellite imagery)
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri'
      }).addTo(leafletMap.current);
      
      // Add zoom control
      L.control.zoom({
        position: 'topright'
      }).addTo(leafletMap.current);
    }
    
    // Clear any existing overlays
    leafletMap.current.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline || layer instanceof L.Polygon) {
        leafletMap.current?.removeLayer(layer);
      }
    });
    
    // If we have a mission, draw its path
    if (mission && mission.surveyPatternData) {
      const { coordinates } = mission.surveyPatternData as any;
      
      if (coordinates && coordinates.length > 0) {
        // Set map view to mission location
        leafletMap.current.setView(
          [parseFloat(coordinates[0].lat), parseFloat(coordinates[0].lng)],
          15
        );
        
        // Draw the mission path based on mission type
        drawMissionPath(leafletMap.current, mission);
        
        // Add drone marker if the mission is in progress
        if (mission.status === 'in-progress' && assignedDrone) {
          // For demo purposes, place the drone marker at a point along the path
          const dronePosition = [...coordinates].pop() || coordinates[0];
          
          const droneIcon = L.divIcon({
            html: `
              <div class="relative">
                <div class="absolute rounded-full bg-amber-500 opacity-50 animate-ping -top-2 -left-2 w-4 h-4"></div>
                <div class="rounded-full bg-amber-500 w-3 h-3"></div>
              </div>
            `,
            className: '',
            iconSize: [10, 10]
          });
          
          // Add drone marker with popup
          L.marker([parseFloat(dronePosition.lat), parseFloat(dronePosition.lng)], { icon: droneIcon })
            .addTo(leafletMap.current)
            .bindPopup(`
              <b>${assignedDrone.name}</b><br>
              Battery: ${assignedDrone.batteryLevel}%<br>
              Model: ${assignedDrone.model}
            `);
        }
      }
    }
    
    // Handle window resize
    const handleResize = () => {
      if (leafletMap.current) {
        leafletMap.current.invalidateSize();
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [mission, assignedDrone]);

  if (!mission) {
    return (
      <Card className={`${height} flex items-center justify-center bg-gray-100`}>
        <div className="text-center text-gray-500">
          <span className="material-icons text-4xl mb-2">flight</span>
          <p>No active mission selected</p>
          <p className="text-sm">Select a mission to view its flight path</p>
        </div>
      </Card>
    );
  }

  return (
    <div 
      ref={mapRef} 
      className={`${height} w-full relative ${interactive ? 'z-10' : 'z-0'}`}
    ></div>
  );
}
