import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import MissionList from "@/components/mission/MissionList";
import MissionMap from "@/components/mission/MissionMap";
import { Mission } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import MissionForm from "@/components/mission/MissionForm";

export default function MissionPlanning() {
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: missions } = useQuery<Mission[]>({
    queryKey: ["/api/missions"],
  });

  // Handle mission selection
  const handleSelectMission = (mission: Mission) => {
    setSelectedMission(mission);
  };

  return (
    <div className="px-6 py-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Mission Panel (List of missions) */}
        <div className="md:w-1/3">
          <MissionList
            onSelectMission={handleSelectMission}
            selectedMissionId={selectedMission?.id}
          />
        </div>

        {/* Map and Mission Details Panel */}
        <div className="md:w-2/3">
          <Card className="shadow-sm mb-6">
            <CardHeader className="flex flex-row items-center justify-between px-4 py-4 border-b">
              <CardTitle className="text-lg">Mission Visualization</CardTitle>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center">
                    <span className="material-icons text-sm mr-1">add</span>
                    New Mission
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]" aria-describedby="mission-form-description">
                  <DialogHeader>
                    <DialogTitle>Create New Mission</DialogTitle>
                    <DialogDescription id="mission-form-description">
                      Fill in the mission details to create a new drone survey mission.
                    </DialogDescription>
                  </DialogHeader>
                  <MissionForm onSuccess={() => setDialogOpen(false)} />
                </DialogContent>
              </Dialog>
            </CardHeader>

            <CardContent className="p-0">
              <MissionMap
                mission={selectedMission}
                interactive={true}
                height="h-[400px]"
              />
            </CardContent>
          </Card>

          {/* Mission Details */}
          {selectedMission ? (
            <Card className="shadow-sm">
              <CardHeader className="px-4 py-4 border-b">
                <CardTitle className="text-lg">Mission Details</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="details">Basic Info</TabsTrigger>
                    <TabsTrigger value="parameters">
                      Survey Parameters
                    </TabsTrigger>
                    <TabsTrigger value="schedule">Schedule</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-medium">
                          {selectedMission.name}
                        </h3>
                        <p className="text-gray-500 text-sm">
                          {selectedMission.description ||
                            "No description provided"}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div>
                          <h4 className="text-sm text-gray-500 mb-1">Status</h4>
                          <div
                            className={`inline-block px-2 py-1 rounded-full text-sm ${
                              selectedMission.status === "in-progress"
                                ? "bg-green-100 text-green-800"
                                : selectedMission.status === "scheduled"
                                ? "bg-blue-100 text-blue-800"
                                : selectedMission.status === "completed"
                                ? "bg-gray-100 text-gray-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {selectedMission.status.charAt(0).toUpperCase() +
                              selectedMission.status.slice(1)}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm text-gray-500 mb-1">
                            Location ID
                          </h4>
                          <p>{selectedMission.locationId || "Not specified"}</p>
                        </div>

                        <div>
                          <h4 className="text-sm text-gray-500 mb-1">
                            Drone Assigned
                          </h4>
                          <p>
                            {selectedMission.droneId
                              ? `Drone #${selectedMission.droneId}`
                              : "Not assigned"}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-sm text-gray-500 mb-1">
                            Mission Type
                          </h4>
                          <p className="capitalize">
                            {selectedMission.missionType}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-sm text-gray-500 mb-1">
                            Completion
                          </h4>
                          <p>{selectedMission.completionPercentage || 0}%</p>
                        </div>

                        <div>
                          <h4 className="text-sm text-gray-500 mb-1">
                            Recurring
                          </h4>
                          <p>{selectedMission.isRecurring ? "Yes" : "No"}</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="parameters">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium mb-3">Survey Parameters</h3>
                        {selectedMission.surveyParameters ? (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gray-50 p-3 rounded-md">
                              <h4 className="text-sm text-gray-500 mb-1">
                                Flight Altitude
                              </h4>
                              <p className="text-lg font-medium">
                                {(selectedMission.surveyParameters as any)
                                  .altitude || "N/A"}{" "}
                                meters
                              </p>
                            </div>

                            <div className="bg-gray-50 p-3 rounded-md">
                              <h4 className="text-sm text-gray-500 mb-1">
                                Overlap
                              </h4>
                              <p className="text-lg font-medium">
                                {(selectedMission.surveyParameters as any)
                                  .overlap || "N/A"}
                                %
                              </p>
                            </div>

                            <div className="bg-gray-50 p-3 rounded-md">
                              <h4 className="text-sm text-gray-500 mb-1">
                                Flight Speed
                              </h4>
                              <p className="text-lg font-medium">
                                {(selectedMission.surveyParameters as any)
                                  .speed || "N/A"}{" "}
                                m/s
                              </p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-500">
                            No survey parameters specified.
                          </p>
                        )}
                      </div>

                      <div>
                        <h3 className="font-medium mb-3">Survey Pattern</h3>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <div className="flex items-center">
                            <span className="material-icons text-gray-600 mr-2">
                              {selectedMission.missionType === "perimeter"
                                ? "crop_square"
                                : selectedMission.missionType === "crosshatch"
                                ? "grid_on"
                                : "grid_3x3"}
                            </span>
                            <div>
                              <h4 className="font-medium capitalize">
                                {selectedMission.missionType}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {selectedMission.missionType === "perimeter"
                                  ? "Follows the boundaries of the area"
                                  : selectedMission.missionType === "crosshatch"
                                  ? "Covers the area in a crisscross pattern"
                                  : "Systematic pattern with parallel lines"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="schedule">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedMission.scheduledTime && (
                          <div className="bg-gray-50 p-3 rounded-md">
                            <h4 className="text-sm text-gray-500 mb-1">
                              Scheduled Start
                            </h4>
                            <p className="text-lg font-medium">
                              {new Date(
                                selectedMission.scheduledTime
                              ).toLocaleString()}
                            </p>
                          </div>
                        )}

                        {selectedMission.startTime && (
                          <div className="bg-gray-50 p-3 rounded-md">
                            <h4 className="text-sm text-gray-500 mb-1">
                              Actual Start
                            </h4>
                            <p className="text-lg font-medium">
                              {new Date(
                                selectedMission.startTime
                              ).toLocaleString()}
                            </p>
                          </div>
                        )}

                        {selectedMission.endTime && (
                          <div className="bg-gray-50 p-3 rounded-md">
                            <h4 className="text-sm text-gray-500 mb-1">
                              End Time
                            </h4>
                            <p className="text-lg font-medium">
                              {new Date(
                                selectedMission.endTime
                              ).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>

                      {selectedMission.isRecurring && (
                        <div>
                          <h3 className="font-medium mb-3">
                            Recurrence Pattern
                          </h3>
                          <div className="bg-gray-50 p-3 rounded-md">
                            <p className="capitalize mb-1">
                              <span className="material-icons text-gray-600 text-sm align-text-bottom mr-1">
                                repeat
                              </span>
                              {selectedMission.recurringPattern}
                            </p>

                            {selectedMission.recurringDays &&
                              selectedMission.recurringDays.length > 0 && (
                                <div className="text-sm text-gray-500">
                                  Days:{" "}
                                  {(selectedMission.recurringDays as number[])
                                    .map((day) => {
                                      const days = [
                                        "Sunday",
                                        "Monday",
                                        "Tuesday",
                                        "Wednesday",
                                        "Thursday",
                                        "Friday",
                                        "Saturday",
                                      ];
                                      return days[day];
                                    })
                                    .join(", ")}
                                </div>
                              )}
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-sm">
              <CardContent className="py-12">
                <div className="text-center text-gray-500">
                  <span className="material-icons text-4xl mb-2">flight</span>
                  <h3 className="text-lg font-medium mb-2">
                    No Mission Selected
                  </h3>
                  <p>Select a mission from the list to view details</p>
                  <Button className="mt-4" onClick={() => setDialogOpen(true)}>
                    <span className="material-icons text-sm mr-1">add</span>
                    Create New Mission
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
