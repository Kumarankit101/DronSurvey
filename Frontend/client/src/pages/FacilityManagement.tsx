import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Location } from "../../../shared/schema.ts";
import { apiRequest } from "@/lib/queryClient";

export default function FacilityManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "facility",
    startLatitude: "",
    startLongitude: "",
    endLatitude: "",
    endLongitude: "",
  });

  // Fetch existing locations
  const { data: locations = [] } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await apiRequest({
        method: "POST",
        url: "/api/locations",
        data: formData,
      });

      // Show success message
      toast({
        title: "Success",
        description: "Facility created successfully",
      });

      // Reset form
      setFormData({
        name: "",
        description: "",
        type: "facility",
        startLatitude: "",
        startLongitude: "",
        endLatitude: "",
        endLongitude: "",
      });

      // Refresh locations data
      queryClient.invalidateQueries(["/api/locations"]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create facility. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Facility</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Facility Name</label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter facility name"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter facility description"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="facility">Facility</SelectItem>
                  <SelectItem value="warehouse">Warehouse</SelectItem>
                  <SelectItem value="office">Office</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Point</label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Input
                      type="number"
                      value={formData.startLatitude}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          startLatitude: e.target.value,
                        })
                      }
                      placeholder="Start Latitude (-90 to 90)"
                      min="-90"
                      max="90"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="number"
                      value={formData.startLongitude}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          startLongitude: e.target.value,
                        })
                      }
                      placeholder="Start Longitude (-180 to 180)"
                      min="-180"
                      max="180"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">End Point</label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Input
                      type="number"
                      value={formData.endLatitude}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          endLatitude: e.target.value,
                        })
                      }
                      placeholder="End Latitude (-90 to 90)"
                      min="-90"
                      max="90"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="number"
                      value={formData.endLongitude}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          endLongitude: e.target.value,
                        })
                      }
                      placeholder="End Longitude (-180 to 180)"
                      min="-180"
                      max="180"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Facility"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Facilities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {locations.map((location) => (
              <div key={location.id} className="py-4">
                <h3 className="font-medium">{location.name}</h3>
                <p className="text-sm text-gray-500">{location.description}</p>
                <p className="text-sm text-gray-500">
                  Start Point: {location.startLatitude},{" "}
                  {location.startLongitude}
                </p>
                <p className="text-sm text-gray-500">
                  End Point: {location.endLatitude}, {location.endLongitude}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
