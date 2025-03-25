import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import MissionMap from "@/components/mission/MissionMap";
import { Mission, Drone, Location } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export default function MissionMonitoring() {
  const { toast } = useToast();
  const [selectedMissionId, setSelectedMissionId] = useState<number | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ action: string; missionId: number } | null>(null);
  
  // Fetch missions data
  const { data: missions, isLoading: missionsLoading } = useQuery<Mission[]>({
    queryKey: ['/api/missions'],
  });
  
  // Fetch drones data
  const { data: drones } = useQuery<Drone[]>({
    queryKey: ['/api/drones'],
  });
  
  // Fetch locations data
  const { data: locations } = useQuery<Location[]>({
    queryKey: ['/api/locations'],
  });
  
  // Active missions (for dropdown)
  const activeMissions = missions?.filter(m => m.status === 'in-progress') || [];
  
  // Selected mission details
  const selectedMission = selectedMissionId 
    ? missions?.find(m => m.id === selectedMissionId)
    : activeMissions.length > 0 ? activeMissions[0] : null;
  
  // Auto-select first active mission on load if none selected
  useEffect(() => {
    if (!selectedMissionId && activeMissions.length > 0) {
      setSelectedMissionId(activeMissions[0].id);
    }
  }, [activeMissions, selectedMissionId]);
  
  // Get drone details for selected mission
  const missionDrone = selectedMission?.droneId 
    ? drones?.find(d => d.id === selectedMission.droneId)
    : null;
  
  // Get location details for selected mission
  const missionLocation = selectedMission?.locationId
    ? locations?.find(l => l.id === selectedMission.locationId)
    : null;
  
  // Handle mission action (pause, resume, abort)
  const handleMissionAction = async (action: string) => {
    if (!selectedMission) return;
    
    // For destructive actions, set confirm action
    if (action === 'abort') {
      setConfirmAction({ action, missionId: selectedMission.id });
      return;
    }
    
    try {
      await apiRequest('PATCH', `/api/missions/${selectedMission.id}`, { action });
      queryClient.invalidateQueries({ queryKey: ['/api/missions'] });
      
      toast({
        title: "Mission Updated",
        description: `Mission successfully ${action}ed.`,
      });
    } catch (error) {
      console.error('Failed to update mission:', error);
      toast({
        title: "Action Failed",
        description: `Could not ${action} the mission. Please try again.`,
        variant: "destructive",
      });
    }
  };
  
  // Execute confirmed action
  const executeConfirmedAction = async () => {
    if (!confirmAction) return;
    
    try {
      await apiRequest('PATCH', `/api/missions/${confirmAction.missionId}`, { action: confirmAction.action });
      queryClient.invalidateQueries({ queryKey: ['/api/missions'] });
      
      toast({
        title: "Mission Aborted",
        description: "Mission has been successfully aborted.",
      });
      
      // Clear confirmation
      setConfirmAction(null);
    } catch (error) {
      console.error('Failed to abort mission:', error);
      toast({
        title: "Action Failed",
        description: "Could not abort the mission. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Calculate estimated time remaining
  const calculateTimeRemaining = (mission: Mission) => {
    if (!mission.startTime || mission.completionPercentage === undefined) return "Unknown";
    
    const startTime = new Date(mission.startTime).getTime();
    const now = new Date().getTime();
    const elapsedMs = now - startTime;
    
    // If no progress yet, return unknown
    if (mission.completionPercentage === 0) return "Calculating...";
    
    // Calculate remaining time based on elapsed time and completion percentage
    const totalEstimatedMs = elapsedMs / (mission.completionPercentage / 100);
    const remainingMs = totalEstimatedMs - elapsedMs;
    
    // Convert to minutes
    const remainingMinutes = Math.round(remainingMs / (1000 * 60));
    
    if (remainingMinutes < 1) return "< 1 minute";
    if (remainingMinutes === 1) return "1 minute";
    return `${remainingMinutes} minutes`;
  };

  return (
    <div className="px-6 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between px-6 py-4 border-b">
              <CardTitle className="text-xl">Mission Monitor</CardTitle>
              <Select 
                value={selectedMissionId?.toString() || ""} 
                onValueChange={(value) => setSelectedMissionId(parseInt(value))}
              >
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Select a mission" />
                </SelectTrigger>
                <SelectContent>
                  {activeMissions.length === 0 ? (
                    <SelectItem value="none" disabled>No active missions</SelectItem>
                  ) : (
                    activeMissions.map(mission => (
                      <SelectItem key={mission.id} value={mission.id.toString()}>
                        {mission.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </CardHeader>
            
            <CardContent className="p-0">
              {missionsLoading ? (
                <div className="h-[500px] flex items-center justify-center bg-gray-50">
                  <Skeleton className="h-96 w-96" />
                </div>
              ) : !selectedMission ? (
                <div className="h-[500px] flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <span className="material-icons text-gray-400 text-6xl mb-4">flight_takeoff</span>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No Active Missions</h3>
                    <p className="text-gray-500 max-w-md">
                      There are currently no active drone missions to monitor. Start a mission from the Mission Planning page.
                    </p>
                    <Button className="mt-4" onClick={() => window.location.href = "/missions"}>
                      Go to Mission Planning
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="relative h-[500px]">
                  <MissionMap 
                    mission={selectedMission} 
                    interactive={true}
                    height="h-[500px]"
                  />
                  
                  {/* Mission Control Panel */}
                  <div className="absolute bottom-4 left-4 bg-white bg-opacity-95 shadow-md rounded-md p-4 max-w-md">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{selectedMission.name}</h3>
                      <Badge 
                        variant="outline"
                        className="bg-green-100 text-green-800 border-green-300"
                      >
                        In Progress
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div className="flex items-center text-gray-600">
                        <span className="material-icons text-sm mr-1">schedule</span>
                        Started: {selectedMission.startTime ? new Date(selectedMission.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="material-icons text-sm mr-1">drone</span>
                        {missionDrone?.name || `Drone #${selectedMission.droneId}`}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="material-icons text-sm mr-1">location_on</span>
                        {missionLocation?.name || `Location ${selectedMission.locationId}`}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <span className="material-icons text-sm mr-1">category</span>
                        <span className="capitalize">{selectedMission.missionType}</span>
                      </div>
                    </div>
                    
                    <Progress value={selectedMission.completionPercentage || 0} className="h-2 mb-1" />
                    <div className="flex justify-between text-xs text-gray-500 mb-3">
                      <span>{selectedMission.completionPercentage || 0}% Completed</span>
                      <span>{calculateTimeRemaining(selectedMission)} remaining</span>
                    </div>
                    
                    <div className="flex">
                      {selectedMission.status === 'in-progress' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mr-2 flex items-center"
                          onClick={() => handleMissionAction('pause')}
                        >
                          <span className="material-icons text-sm mr-1">pause</span>
                          Pause
                        </Button>
                      ) : selectedMission.status === 'paused' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mr-2 flex items-center"
                          onClick={() => handleMissionAction('resume')}
                        >
                          <span className="material-icons text-sm mr-1">play_arrow</span>
                          Resume
                        </Button>
                      ) : null}
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 border-red-200 hover:bg-red-50 flex items-center"
                          >
                            <span className="material-icons text-sm mr-1">stop</span>
                            Abort
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Abort Mission?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will immediately stop the drone mission and return the drone to its home position.
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              className="bg-red-500 hover:bg-red-600"
                              onClick={() => handleMissionAction('abort')}
                            >
                              Yes, Abort Mission
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="shadow-sm">
            <CardHeader className="px-6 py-4 border-b">
              <CardTitle className="text-lg">Active Missions</CardTitle>
            </CardHeader>
            
            <CardContent className="p-4">
              {missionsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : activeMissions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No active missions at the moment
                </div>
              ) : (
                <div className="space-y-3 overflow-auto max-h-[calc(100vh-300px)]">
                  {activeMissions.map((mission) => (
                    <div 
                      key={mission.id} 
                      className={`border-l-4 border-green-500 bg-green-50 p-3 rounded-r-md hover:bg-green-100 cursor-pointer transition-colors ${
                        selectedMissionId === mission.id ? 'ring-2 ring-green-300' : ''
                      }`}
                      onClick={() => setSelectedMissionId(mission.id)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium">{mission.name}</h3>
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                          In Progress
                        </Badge>
                      </div>
                      <p className="text-gray-500 text-sm mb-2">
                        <span className="material-icons text-xs align-text-bottom mr-1">drone</span>
                        {mission.droneId ? `Drone #${mission.droneId}` : 'No drone assigned'}
                        <span className="mx-1">•</span>
                        <span className="material-icons text-xs align-text-bottom mr-1">schedule</span>
                        {mission.completionPercentage}% Complete
                      </p>
                      <Progress value={mission.completionPercentage || 0} className="h-1.5" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          {missionDrone && (
            <Card className="shadow-sm mt-6">
              <CardHeader className="px-6 py-4 border-b">
                <CardTitle className="text-lg">Drone Status</CardTitle>
              </CardHeader>
              
              <CardContent className="p-4">
                <div className="flex items-center mb-4">
                  <div className="rounded-full bg-blue-100 p-3 mr-3">
                    <span className="material-icons text-blue-600">flight</span>
                  </div>
                  <div>
                    <h3 className="font-medium">{missionDrone.name}</h3>
                    <p className="text-gray-500 text-sm">{missionDrone.model}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">Battery Level</span>
                      <span className="font-medium">{missionDrone.batteryLevel}%</span>
                    </div>
                    <Progress 
                      value={missionDrone.batteryLevel} 
                      className="h-2"
                      indicatorClassName={
                        missionDrone.batteryLevel > 70
                          ? "bg-green-600"
                          : missionDrone.batteryLevel > 30
                          ? "bg-amber-500"
                          : "bg-red-600"
                      }
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-3 rounded-md">
                      <h4 className="text-xs text-gray-500 mb-1">Status</h4>
                      <p className="font-medium capitalize">{missionDrone.status}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <h4 className="text-xs text-gray-500 mb-1">Last Mission</h4>
                      <p className="font-medium">
                        {missionDrone.lastMission
                          ? new Date(missionDrone.lastMission).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* Confirmation Dialog for abort */}
      <AlertDialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Abort Mission?</AlertDialogTitle>
            <AlertDialogDescription>
              This will immediately stop the drone mission and return the drone to its home position.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmAction(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-500 hover:bg-red-600"
              onClick={executeConfirmedAction}
            >
              Yes, Abort Mission
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
