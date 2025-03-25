import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Mission } from "@shared/schema";
import MissionMap from "../mission/MissionMap";
import { formatDistanceToNow, format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";

export default function MissionOverview() {
  const [selectedMissionId, setSelectedMissionId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("active");
  
  const { data: missionsData, isLoading: missionsLoading, refetch: refetchMissions } = useQuery<Mission[]>({
    queryKey: ['/api/missions'],
  });
  
  // Get the currently selected mission data
  const selectedMission = selectedMissionId 
    ? missionsData?.find(m => m.id === selectedMissionId) 
    : missionsData?.find(m => m.status === 'in-progress');

  // Filter missions by status
  const activeMissions = missionsData?.filter(m => m.status === 'in-progress') || [];
  const scheduledMissions = missionsData?.filter(m => m.status === 'scheduled') || [];
  const completedMissions = missionsData?.filter(m => m.status === 'completed') || [];

  // Handle mission control actions
  const handleMissionAction = async (missionId: number, action: string) => {
    try {
      await apiRequest('PATCH', `/api/missions/${missionId}`, { action });
      refetchMissions();
    } catch (error) {
      console.error('Failed to execute mission action:', error);
    }
  };

  // Format mission time
  const formatMissionTime = (mission: Mission) => {
    if (mission.status === 'in-progress' && mission.startTime) {
      return `Started: ${format(new Date(mission.startTime), 'h:mm a')}`;
    } else if (mission.status === 'scheduled' && mission.scheduledTime) {
      const scheduledTime = new Date(mission.scheduledTime);
      const isToday = new Date().toDateString() === scheduledTime.toDateString();
      
      if (isToday) {
        return `Today, ${format(scheduledTime, 'h:mm a')}`;
      } else {
        return `${format(scheduledTime, 'MMM d, h:mm a')}`;
      }
    }
    return '';
  };

  // Remaining time calculation
  const calculateRemainingTime = (mission: Mission) => {
    if (mission.status !== 'in-progress' || !mission.startTime) return '';
    
    // Assume a mission takes about 60 minutes for every 25% completion
    const totalEstimatedMins = 60 * 4; // 4 hours total
    const completedMins = (mission.completionPercentage || 0) / 100 * totalEstimatedMins;
    const remainingMins = totalEstimatedMins - completedMins;
    
    return `${Math.round(remainingMins)} min remaining`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <Card className="col-span-1 lg:col-span-2 shadow-sm">
        <CardHeader className="border-b px-4 py-4">
          <CardTitle className="text-lg">Active Missions</CardTitle>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="relative h-96 overflow-hidden rounded-b-lg">
            {missionsLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <Skeleton className="h-48 w-48 rounded-md mx-auto" />
                  <p className="mt-4 text-gray-500">Loading mission map...</p>
                </div>
              </div>
            ) : (
              <MissionMap mission={selectedMission} />
            )}
            
            {selectedMission && selectedMission.status === 'in-progress' && (
              <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 shadow-md rounded-md p-4 max-w-md">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{selectedMission.name}</h3>
                  <span className="px-2 py-1 rounded-full text-xs bg-green-500 text-white">
                    In Progress
                  </span>
                </div>
                <div className="flex items-center text-sm mb-2">
                  <span className="material-icons text-gray-500 mr-1 text-sm">schedule</span>
                  <span>{formatMissionTime(selectedMission)}</span>
                  {selectedMission.completionPercentage ? (
                    <>
                      <span className="mx-2">|</span>
                      <span>Est. completion: {format(new Date(), 'h:mm a')}</span>
                    </>
                  ) : null}
                </div>
                <Progress 
                  value={selectedMission.completionPercentage || 0} 
                  className="h-2 mb-1" 
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{selectedMission.completionPercentage}% Completed</span>
                  <span>{calculateRemainingTime(selectedMission)}</span>
                </div>
                <div className="flex mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="mr-2 flex items-center"
                    onClick={() => handleMissionAction(selectedMission.id, 'pause')}
                  >
                    <span className="material-icons text-sm mr-1">pause</span>
                    Pause
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500 border-red-500 hover:bg-red-50"
                    onClick={() => handleMissionAction(selectedMission.id, 'abort')}
                  >
                    <span className="material-icons text-sm mr-1">stop</span>
                    Abort
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between px-4 py-4 border-b">
          <CardTitle className="text-lg">Mission Queue</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <div className="flex items-center">
              <span className="material-icons text-sm mr-1">add</span>
              New Mission
            </div>
          </Button>
        </CardHeader>
        
        <CardContent className="p-4">
          <Tabs defaultValue="active" onValueChange={setActiveTab}>
            <TabsList className="mb-4 justify-start">
              <TabsTrigger value="active">Active ({activeMissions.length})</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled ({scheduledMissions.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedMissions.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="active" className="space-y-3 overflow-auto max-h-[24rem]">
              {missionsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : activeMissions.length > 0 ? (
                activeMissions.map((mission) => (
                  <div 
                    key={mission.id} 
                    className={`border-l-4 border-green-500 bg-green-50 p-3 rounded-r-md hover:bg-green-100 cursor-pointer transition-colors ${
                      selectedMissionId === mission.id ? 'ring-2 ring-green-300' : ''
                    }`}
                    onClick={() => setSelectedMissionId(mission.id)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium">{mission.name}</h3>
                      <span className="flex items-center text-green-600 text-sm">
                        <span className="material-icons text-sm mr-1">flight_takeoff</span>
                        In Progress
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm mb-2">
                      <span className="material-icons text-xs align-text-bottom mr-1">drone</span>
                      Drone #{mission.droneId}
                      <span className="mx-1">•</span>
                      <span className="material-icons text-xs align-text-bottom mr-1">schedule</span>
                      {mission.completionPercentage}% Complete
                    </p>
                    <Progress value={mission.completionPercentage || 0} className="h-1.5" />
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No active missions at the moment
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="scheduled" className="space-y-3 overflow-auto max-h-[24rem]">
              {missionsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : scheduledMissions.length > 0 ? (
                scheduledMissions.map((mission) => {
                  const isStartingSoon = mission.scheduledTime && 
                    new Date(mission.scheduledTime).getTime() - new Date().getTime() < 30 * 60 * 1000;
                  
                  return (
                    <div 
                      key={mission.id} 
                      className={`border-l-4 ${
                        isStartingSoon ? 'border-amber-500 bg-amber-50' : 'border-blue-500 bg-blue-50'
                      } p-3 rounded-r-md hover:bg-opacity-75 cursor-pointer transition-colors`}
                      onClick={() => setSelectedMissionId(mission.id)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium">{mission.name}</h3>
                        <span className={`flex items-center text-sm ${
                          isStartingSoon ? 'text-amber-600' : 'text-blue-600'
                        }`}>
                          <span className="material-icons text-sm mr-1">
                            {isStartingSoon ? 'schedule' : 'event'}
                          </span>
                          {isStartingSoon 
                            ? 'Starting soon' 
                            : formatMissionTime(mission)
                          }
                        </span>
                      </div>
                      <p className="text-gray-500 text-sm mb-1">
                        <span className="material-icons text-xs align-text-bottom mr-1">drone</span>
                        {mission.droneId ? `Assigned: Drone #${mission.droneId}` : 'Pending Assignment'}
                        <span className="mx-1">•</span>
                        <span className="material-icons text-xs align-text-bottom mr-1">schedule</span>
                        Est. {mission.missionType === 'perimeter' ? '30' : '45'} min
                      </p>
                      <div className="flex mt-1">
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600 h-6 px-1">
                          <span className="material-icons text-xs mr-1">edit</span>
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-600 h-6 px-1">
                          <span className="material-icons text-xs mr-1">close</span>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No scheduled missions
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="completed" className="space-y-3 overflow-auto max-h-[24rem]">
              {missionsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : completedMissions.length > 0 ? (
                completedMissions.map((mission) => (
                  <div 
                    key={mission.id} 
                    className="border-l-4 border-gray-400 bg-gray-50 p-3 rounded-r-md hover:bg-gray-100 cursor-pointer transition-colors"
                    onClick={() => setSelectedMissionId(mission.id)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium">{mission.name}</h3>
                      <span className="flex items-center text-gray-600 text-sm">
                        <span className="material-icons text-sm mr-1">check_circle</span>
                        Completed
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm">
                      <span className="material-icons text-xs align-text-bottom mr-1">event</span>
                      {mission.endTime ? formatDistanceToNow(new Date(mission.endTime), { addSuffix: true }) : 'Recently'}
                      <span className="mx-1">•</span>
                      <span className="material-icons text-xs align-text-bottom mr-1">drone</span>
                      Drone #{mission.droneId}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No completed missions
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          <Button variant="outline" className="w-full mt-4">
            <span className="material-icons text-sm mr-1">expand_more</span>
            View All Missions
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
