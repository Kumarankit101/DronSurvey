import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Drone } from "@shared/schema";

export default function FleetStatus() {
  const { data: drones, isLoading } = useQuery<Drone[]>({
    queryKey: ['/api/drones'],
  });

  // Drone status counts
  const statusCounts = {
    available: drones?.filter(d => d.status === 'available').length || 0,
    inMission: drones?.filter(d => d.status === 'in-mission').length || 0,
    charging: drones?.filter(d => d.status === 'charging').length || 0,
    maintenance: drones?.filter(d => d.status === 'maintenance').length || 0
  };

  // Get drones sorted by battery level for display
  const dronesForDisplay = drones 
    ? [...drones].sort((a, b) => b.batteryLevel - a.batteryLevel).slice(0, 5) 
    : [];

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between px-4 py-4 border-b">
        <CardTitle className="text-lg">Fleet Status</CardTitle>
        <Button variant="ghost" size="sm">
          <span className="material-icons text-sm">more_horiz</span>
        </Button>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="flex justify-between text-center mb-6">
          <div className="flex-1">
            <div className="text-3xl font-medium text-green-600">
              {isLoading ? <Skeleton className="h-8 w-8 mx-auto" /> : statusCounts.available}
            </div>
            <div className="text-sm text-gray-500">Available</div>
          </div>
          <div className="flex-1">
            <div className="text-3xl font-medium text-amber-600">
              {isLoading ? <Skeleton className="h-8 w-8 mx-auto" /> : statusCounts.inMission}
            </div>
            <div className="text-sm text-gray-500">In Mission</div>
          </div>
          <div className="flex-1">
            <div className="text-3xl font-medium text-amber-500">
              {isLoading ? <Skeleton className="h-8 w-8 mx-auto" /> : statusCounts.charging}
            </div>
            <div className="text-sm text-gray-500">Charging</div>
          </div>
          <div className="flex-1">
            <div className="text-3xl font-medium text-red-600">
              {isLoading ? <Skeleton className="h-8 w-8 mx-auto" /> : statusCounts.maintenance}
            </div>
            <div className="text-sm text-gray-500">Maintenance</div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-md font-medium mb-3">Drone Battery Status</h3>
          
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex items-center">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-2 flex-1 mx-2" />
                  <Skeleton className="h-4 w-8" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {dronesForDisplay.map((drone) => (
                <div key={drone.id} className="flex items-center">
                  <div className="w-16 font-mono text-sm">
                    {drone.name}
                  </div>
                  <div className="flex-1 mx-2">
                    <Progress 
                      value={drone.batteryLevel} 
                      className="h-2"
                      indicatorClassName={
                        drone.batteryLevel > 60
                          ? "bg-green-600"
                          : drone.batteryLevel > 30
                          ? "bg-amber-500"
                          : "bg-red-600"
                      }
                    />
                  </div>
                  <div className="w-10 text-right font-mono text-sm">
                    {drone.batteryLevel}%
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <Button variant="outline" className="w-full mt-4">
            <span className="material-icons text-sm mr-1">devices</span>
            View Full Fleet
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
