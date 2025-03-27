import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Drone } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function DroneList() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDrone, setSelectedDrone] = useState<Drone | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const { data: drones, isLoading } = useQuery<Drone[]>({
    queryKey: ["/api/drones"],
  });

  // Filter drones based on search query
  const filteredDrones = drones?.filter(
    (drone) =>
      drone.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drone.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drone.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get drone status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "available":
        return "green";
      case "in-mission":
        return "amber";
      case "charging":
        return "blue";
      case "maintenance":
        return "red";
      default:
        return "gray";
    }
  };

  // Get battery level color
  const getBatteryColor = (level: number) => {
    if (level > 70) return "bg-green-600";
    if (level > 30) return "bg-amber-500";
    return "bg-red-600";
  };

  const [addDroneOpen, setAddDroneOpen] = useState(false);
  const [newDrone, setNewDrone] = useState({
    name: "",
    model: "",
    status: "available",
    batteryLevel: 100,
    lastMission: null,
    locationLat: null,
    locationLng: null,
  });

  const handleAddDrone = async () => {
    try {
      if (!newDrone.name || !newDrone.model) {
        toast({
          title: "Validation Error",
          description: "Name and model are required",
          variant: "destructive",
        });
        return;
      }

      const response = await apiRequest({
        url: "/api/drones",
        method: "POST",
        data: newDrone,
      });

      await queryClient.invalidateQueries({ queryKey: ["/api/drones"] });
      setAddDroneOpen(false);
      setNewDrone({
        name: "",
        model: "",
        status: "available",
        batteryLevel: 100,
        lastMission: null,
        locationLat: null,
        locationLng: null,
      });

      toast({
        title: "Success",
        description: "Drone added successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add drone",
        variant: "destructive",
      });
    }
  };
  // Handle drone action (e.g., mark as charging, maintenance)
  const handleDroneAction = async (droneId: number, action: string) => {
    try {
      const response = await apiRequest({
        url: `/api/drones/${droneId}`,
        method: "PATCH",
        data: { status: action },
      });

      // Refresh drone list
      await queryClient.invalidateQueries({ queryKey: ["/api/drones"] });

      toast({
        title: "Success",
        description: `Drone status updated to ${action}`,
      });
    } catch (error: any) {
      console.error("Error updating drone status:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to update drone status. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle opening drone details
  const openDroneDetails = (drone: Drone) => {
    setSelectedDrone(drone);
    setDetailsOpen(true);
  };

  return (
    <>
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between px-6 py-4 border-b">
          <CardTitle className="text-xl">Fleet Management</CardTitle>
          <div className="flex items-center">
            <div className="relative w-64 mr-2">
              <span className="absolute left-2.5 top-2.5 text-gray-400">
                <span className="material-icons text-lg">search</span>
              </span>
              <Input
                type="text"
                placeholder="Search drones"
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={() => setAddDroneOpen(true)}>
              <span className="material-icons text-sm mr-2">add</span>
              Add Drone
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Drone ID</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Battery</TableHead>
                    <TableHead>Last Mission</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDrones?.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center h-24 text-gray-500"
                      >
                        No drones found matching your search
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDrones?.map((drone) => (
                      <TableRow
                        key={drone.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => openDroneDetails(drone)}
                      >
                        <TableCell className="font-medium">
                          {drone.name}
                        </TableCell>
                        <TableCell>{drone.model}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`bg-${getStatusColor(
                              drone.status
                            )}-100 text-${getStatusColor(
                              drone.status
                            )}-800 border-${getStatusColor(drone.status)}-300`}
                          >
                            {drone.status.charAt(0).toUpperCase() +
                              drone.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Progress
                              value={drone.batteryLevel}
                              className="h-2 w-24 mr-2"
                              indicatorClassName={getBatteryColor(
                                drone.batteryLevel
                              )}
                            />
                            <span className="text-xs font-mono">
                              {drone.batteryLevel}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {drone.lastMission ? (
                            new Date(drone.lastMission).toLocaleDateString()
                          ) : (
                            <span className="text-gray-400">Never</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {drone.locationLat && drone.locationLng ? (
                            <span className="text-xs font-mono">
                              {parseFloat(drone.locationLat).toFixed(4)},{" "}
                              {parseFloat(drone.locationLng).toFixed(4)}
                            </span>
                          ) : (
                            <span className="text-gray-400">
                              No location data
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              asChild
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button variant="ghost" size="sm">
                                <span className="material-icons">
                                  more_vert
                                </span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {drone.status !== "available" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleDroneAction(drone.id, "available")
                                  }
                                >
                                  <span className="material-icons text-sm mr-2">
                                    check_circle
                                  </span>
                                  Mark as Available
                                </DropdownMenuItem>
                              )}
                              {drone.status !== "charging" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleDroneAction(drone.id, "charging")
                                  }
                                >
                                  <span className="material-icons text-sm mr-2">
                                    battery_charging_full
                                  </span>
                                  Send to Charging
                                </DropdownMenuItem>
                              )}
                              {drone.status !== "maintenance" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleDroneAction(drone.id, "maintenance")
                                  }
                                >
                                  <span className="material-icons text-sm mr-2">
                                    build
                                  </span>
                                  Mark for Maintenance
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <span className="material-icons text-sm mr-2">
                                  edit
                                </span>
                                Edit Drone
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Drone Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Drone Details</DialogTitle>
          </DialogHeader>

          {selectedDrone && (
            <div className="mt-4 space-y-4">
              <div className="flex items-start">
                <div className="rounded-lg bg-gray-100 p-3 mr-4">
                  <span className="material-icons text-4xl text-gray-700">
                    flight
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-medium">{selectedDrone.name}</h3>
                  <p className="text-gray-500 text-sm">{selectedDrone.model}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <h4 className="text-sm text-gray-500 mb-1">Status</h4>
                  <Badge
                    variant="outline"
                    className={`bg-${getStatusColor(
                      selectedDrone.status
                    )}-100 text-${getStatusColor(
                      selectedDrone.status
                    )}-800 border-${getStatusColor(selectedDrone.status)}-300`}
                  >
                    {selectedDrone.status.charAt(0).toUpperCase() +
                      selectedDrone.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <h4 className="text-sm text-gray-500 mb-1">Battery Level</h4>
                  <div className="flex items-center">
                    <Progress
                      value={selectedDrone.batteryLevel}
                      className="h-2 w-24 mr-2"
                      indicatorClassName={getBatteryColor(
                        selectedDrone.batteryLevel
                      )}
                    />
                    <span className="text-sm font-mono">
                      {selectedDrone.batteryLevel}%
                    </span>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm text-gray-500 mb-1">Last Mission</h4>
                  <p>
                    {selectedDrone.lastMission
                      ? new Date(selectedDrone.lastMission).toLocaleString()
                      : "Never"}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm text-gray-500 mb-1">Location</h4>
                  <p>
                    {selectedDrone.locationLat && selectedDrone.locationLng ? (
                      <span className="font-mono">
                        {parseFloat(selectedDrone.locationLat).toFixed(6)},{" "}
                        {parseFloat(selectedDrone.locationLng).toFixed(6)}
                      </span>
                    ) : (
                      "No location data"
                    )}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <h4 className="font-medium mb-3">Quick Actions</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedDrone.status !== "available" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        handleDroneAction(selectedDrone.id, "available");
                        setDetailsOpen(false);
                      }}
                    >
                      <span className="material-icons text-sm mr-2">
                        check_circle
                      </span>
                      Mark as Available
                    </Button>
                  )}
                  {selectedDrone.status !== "charging" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        handleDroneAction(selectedDrone.id, "charging");
                        setDetailsOpen(false);
                      }}
                    >
                      <span className="material-icons text-sm mr-2">
                        battery_charging_full
                      </span>
                      Send to Charging
                    </Button>
                  )}
                  {selectedDrone.status !== "maintenance" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        handleDroneAction(selectedDrone.id, "maintenance");
                        setDetailsOpen(false);
                      }}
                    >
                      <span className="material-icons text-sm mr-2">build</span>
                      Mark for Maintenance
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <Button variant="default" onClick={() => setDetailsOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={addDroneOpen} onOpenChange={setAddDroneOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Drone</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="name">Drone Name *</label>
              <Input
                id="name"
                value={newDrone.name}
                onChange={(e) =>
                  setNewDrone({ ...newDrone, name: e.target.value })
                }
                placeholder="Enter drone name"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="model">Model *</label>
              <Input
                id="model"
                value={newDrone.model}
                onChange={(e) =>
                  setNewDrone({ ...newDrone, model: e.target.value })
                }
                placeholder="Enter drone model"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="batteryLevel">Initial Battery Level</label>
              <Input
                id="batteryLevel"
                type="number"
                min="0"
                max="100"
                value={newDrone.batteryLevel}
                onChange={(e) =>
                  setNewDrone({
                    ...newDrone,
                    batteryLevel: parseInt(e.target.value),
                  })
                }
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setAddDroneOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddDrone}>Add Drone</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
