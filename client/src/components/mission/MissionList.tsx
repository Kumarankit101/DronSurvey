import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { format, formatDistanceToNow } from "date-fns";
import { Mission } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import MissionForm from "./MissionForm";

interface MissionListProps {
  onSelectMission?: (mission: Mission) => void;
  selectedMissionId?: number | null;
}

export default function MissionList({
  onSelectMission,
  selectedMissionId,
}: MissionListProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const { data: missions, isLoading } = useQuery<Mission[]>({
    queryKey: ['/api/missions'],
  });

  // Filter missions by status
  const activeMissions = missions?.filter(m => m.status === 'in-progress') || [];
  const scheduledMissions = missions?.filter(m => m.status === 'scheduled') || [];
  const completedMissions = missions?.filter(m => m.status === 'completed') || [];

  // Handle mission actions (pause, abort, etc.)
  const handleMissionAction = async (id: number, action: string) => {
    try {
      await apiRequest('PATCH', `/api/missions/${id}`, { action });
      queryClient.invalidateQueries({ queryKey: ['/api/missions'] });
    } catch (error) {
      console.error('Failed to perform mission action:', error);
    }
  };

  // Format scheduled time
  const formatScheduledTime = (scheduledTime: string | undefined) => {
    if (!scheduledTime) return 'Not scheduled';
    
    const date = new Date(scheduledTime);
    const isToday = new Date().toDateString() === date.toDateString();
    
    if (isToday) {
      return `Today, ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM d, h:mm a');
    }
  };

  return (
    <>
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between px-4 py-4 border-b">
          <CardTitle className="text-lg">Missions</CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center">
                <span className="material-icons text-sm mr-1">add</span>
                New Mission
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Mission</DialogTitle>
              </DialogHeader>
              <MissionForm onSuccess={() => setDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </CardHeader>
        
        <CardContent className="p-4">
          <Tabs defaultValue="active">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="active">
                Active ({activeMissions.length})
              </TabsTrigger>
              <TabsTrigger value="scheduled">
                Scheduled ({scheduledMissions.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({completedMissions.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="active" className="space-y-3 overflow-auto max-h-[calc(100vh-300px)]">
              {isLoading ? (
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
                    onClick={() => onSelectMission?.(mission)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium">{mission.name}</h3>
                      <span className="flex items-center text-green-600 text-sm">
                        <span className="material-icons text-sm mr-1">flight_takeoff</span>
                        In Progress
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm mb-1">
                      <span className="material-icons text-xs align-text-bottom mr-1">location_on</span>
                      Location ID: {mission.locationId}
                      <span className="mx-1">•</span>
                      <span className="material-icons text-xs align-text-bottom mr-1">drone</span>
                      Drone #{mission.droneId}
                    </p>
                    <Progress value={mission.completionPercentage || 0} className="h-1.5 mb-2" />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{mission.completionPercentage}% Complete</span>
                      <span>{mission.startTime ? formatDistanceToNow(new Date(mission.startTime), { addSuffix: true }) : ''}</span>
                    </div>
                    <div className="flex mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="mr-2 h-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMissionAction(mission.id, 'pause');
                        }}
                      >
                        <span className="material-icons text-xs mr-1">pause</span>
                        Pause
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 h-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMissionAction(mission.id, 'abort');
                        }}
                      >
                        <span className="material-icons text-xs mr-1">stop</span>
                        Abort
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No active missions at the moment
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="scheduled" className="space-y-3 overflow-auto max-h-[calc(100vh-300px)]">
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : scheduledMissions.length > 0 ? (
                scheduledMissions.map((mission) => (
                  <div 
                    key={mission.id} 
                    className={`border-l-4 border-blue-500 bg-blue-50 p-3 rounded-r-md hover:bg-blue-100 cursor-pointer transition-colors ${
                      selectedMissionId === mission.id ? 'ring-2 ring-blue-300' : ''
                    }`}
                    onClick={() => onSelectMission?.(mission)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium">{mission.name}</h3>
                      <span className="flex items-center text-blue-600 text-sm">
                        <span className="material-icons text-sm mr-1">event</span>
                        {formatScheduledTime(mission.scheduledTime)}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm mb-1">
                      <span className="material-icons text-xs align-text-bottom mr-1">location_on</span>
                      Location ID: {mission.locationId}
                      <span className="mx-1">•</span>
                      <span className="material-icons text-xs align-text-bottom mr-1">drone</span>
                      {mission.droneId ? `Assigned: Drone #${mission.droneId}` : 'Pending Assignment'}
                    </p>
                    <p className="text-gray-500 text-sm mb-1">
                      <span className="material-icons text-xs align-text-bottom mr-1">category</span>
                      {mission.missionType.charAt(0).toUpperCase() + mission.missionType.slice(1)}
                      {mission.isRecurring && (
                        <>
                          <span className="mx-1">•</span>
                          <span className="material-icons text-xs align-text-bottom mr-1">repeat</span>
                          Recurring
                        </>
                      )}
                    </p>
                    <div className="flex mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="mr-2 h-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Edit functionality would go here
                        }}
                      >
                        <span className="material-icons text-xs mr-1">edit</span>
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 h-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMissionAction(mission.id, 'cancel');
                        }}
                      >
                        <span className="material-icons text-xs mr-1">delete</span>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No scheduled missions
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="completed" className="space-y-3 overflow-auto max-h-[calc(100vh-300px)]">
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : completedMissions.length > 0 ? (
                completedMissions.map((mission) => (
                  <div 
                    key={mission.id} 
                    className={`border-l-4 border-gray-400 bg-gray-50 p-3 rounded-r-md hover:bg-gray-100 cursor-pointer transition-colors ${
                      selectedMissionId === mission.id ? 'ring-2 ring-gray-300' : ''
                    }`}
                    onClick={() => onSelectMission?.(mission)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium">{mission.name}</h3>
                      <span className="flex items-center text-gray-600 text-sm">
                        <span className="material-icons text-sm mr-1">check_circle</span>
                        Completed
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm mb-1">
                      <span className="material-icons text-xs align-text-bottom mr-1">location_on</span>
                      Location ID: {mission.locationId}
                      <span className="mx-1">•</span>
                      <span className="material-icons text-xs align-text-bottom mr-1">drone</span>
                      Drone #{mission.droneId}
                    </p>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span className="flex items-center">
                        <span className="material-icons text-xs mr-1">event</span>
                        {mission.endTime ? format(new Date(mission.endTime), 'MMM d, h:mm a') : 'Recently'}
                      </span>
                      <span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-blue-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            // View report functionality
                          }}
                        >
                          <span className="material-icons text-xs mr-1">assessment</span>
                          View Report
                        </Button>
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No completed missions
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
}
