import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { insertMissionSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Drone, Location } from "@shared/schema";
import { generateSurveyPatternData } from "@/lib/missionPatterns";

// Extend the insert schema with validation rules
const formSchema = insertMissionSchema.extend({
  name: z.string().min(3, "Mission name must be at least 3 characters"),
  description: z.string().optional(),
  locationId: z.number().min(1, "Please select a location"),
  missionType: z.string().min(1, "Please select a mission type"),
  scheduledTime: z.preprocess(
    (arg) => (typeof arg === "string" ? new Date(arg) : arg),
    z.date()
  ),
  altitude: z
    .number()
    .min(10, "Minimum altitude is 10m")
    .max(120, "Maximum altitude is 120m"),
  overlap: z
    .number()
    .min(20, "Minimum overlap is 20%")
    .max(90, "Maximum overlap is 90%"),
  speed: z
    .number()
    .min(1, "Minimum speed is 1 m/s")
    .max(10, "Maximum speed is 10 m/s"),
  droneId: z.number().optional(),
  recurringDays: z.array(z.number()).optional(),
});

// Type for the form data
type MissionFormValues = z.infer<typeof formSchema>;

interface MissionFormProps {
  onSuccess?: () => void;
}

export default function MissionForm({ onSuccess }: MissionFormProps) {
  const { toast } = useToast();
  const [patternTab, setPatternTab] = useState("crosshatch");

  // Fetch locations for dropdown
  const { data: locations } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
  });

  // Fetch drones for dropdown
  const { data: drones } = useQuery<Drone[]>({
    queryKey: ["/api/drones"],
  });

  // Filter only available drones
  const availableDrones = drones?.filter((d) => d.status === "available") || [];

  // Initialize form with default values
  const form = useForm<MissionFormValues>({
    resolver: zodResolver(formSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      description: "",
      missionType: "crosshatch",
      status: "scheduled",
      isRecurring: false,
      recurringPattern: "weekly",
      altitude: 30,
      overlap: 70,
      speed: 5,
      locationId: 1,
      droneId: 0,
      recurringDays: [],
      scheduledTime: (() => {
        const now = new Date();
        const offset = now.getTimezoneOffset();
        now.setMinutes(now.getMinutes() - offset);
        now.setSeconds(0);
        now.setMilliseconds(0);
        return now;
      })(),
      completionPercentage: 0,
      surveyParameters: {
        altitude: 30,
        overlap: 70,
        speed: 5,
      },
    },
  });

  useEffect(() => {
    console.log("Form validation state:", {
      isValid: form.formState.isValid,
      errors: form.formState.errors,
      values: form.getValues(),
    });
  }, [form.formState.isValid]);

  useEffect(() => {
    console.log("Validation Errors:", form.formState.errors);
  }, [form.formState.errors]);

  useEffect(() => {
    console.log("Form Values:", form.getValues());
  }, [form.getValues()]);
  // Watch for changes to form values
  const isRecurring = form.watch("isRecurring");
  const recurringPattern = form.watch("recurringPattern");
  const selectedLocId = form.watch("locationId");

  // Get the selected location
  const selectedLocation = locations?.find((loc) => loc.id === selectedLocId);

  // Days of the week for recurring missions
  const weekDays = [
    { value: 0, label: "Sunday" },
    { value: 1, label: "Monday" },
    { value: 2, label: "Tuesday" },
    { value: 3, label: "Wednesday" },
    { value: 4, label: "Thursday" },
    { value: 5, label: "Friday" },
    { value: 6, label: "Saturday" },
  ];

  // Handle form submission
  const onSubmit = async (data: MissionFormValues) => {
    try {
      // Generate the survey pattern data based on selected location and mission type
      const surveyPatternData = generateSurveyPatternData(
        selectedLocation,
        data.missionType || patternTab
      );

      // Prepare the survey parameters according to schema
      const surveyParameters = {
        altitude: Number(data.altitude),
        overlap: Number(data.overlap),
        speed: Number(data.speed),
      };

      // Create submission data with explicit Date conversion and proper structure
      const submissionData = {
        name: data.name,
        description: data.description,
        locationId: data.locationId,
        droneId: data.droneId || undefined,
        status: "scheduled",
        missionType: data.missionType,
        completionPercentage: 0,
        isRecurring: data.isRecurring,
        recurringPattern: data.recurringPattern,
        recurringDays: data.recurringDays || [],
        scheduledTime: new Date(data.scheduledTime),
        surveyPatternData,
        surveyParameters: {
          altitude: Number(data.altitude),
          overlap: Number(data.overlap),
          speed: Number(data.speed),
        },
      };

      // Log the data being sent
      console.log(
        "Submitting data type of :",
        typeof submissionData.scheduledTime
      );

      // Submit to API
      const response = await apiRequest({
        method: "POST",
        url: "/api/missions",
        data: submissionData,
      });

      // Rest of the code...
    } catch (error) {
      console.error("Error Details:", {
        error,
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
        response: (error as any).response?.data,
      });
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create mission. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info Section */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mission Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Facility A Roof Inspection"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Brief description of mission purpose and goals"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="locationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <Select
                    onValueChange={(value) =>
                      field.onChange(parseInt(value) || null)
                    }
                    value={field.value?.toString() || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {locations?.map((location) => (
                        <SelectItem
                          key={location.id}
                          value={location.id.toString()}
                        >
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="droneId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign Drone</FormLabel>
                  <Select
                    onValueChange={(value) =>
                      field.onChange(parseInt(value) || null)
                    }
                    value={field.value?.toString() || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Auto-assign" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0">Auto-assign</SelectItem>
                      {availableDrones.map((drone) => (
                        <SelectItem key={drone.id} value={drone.id.toString()}>
                          {drone.name} - {drone.batteryLevel}%
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Only available drones are listed
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Scheduling Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Scheduling</h3>

          <FormField
            control={form.control}
            name="scheduledTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Scheduled Time</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    {...field}
                    value={
                      typeof field.value === "object"
                        ? field.value.toISOString().slice(0, 16)
                        : field.value || ""
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isRecurring"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Recurring Mission</FormLabel>
                  <FormDescription>
                    Schedule this mission to repeat automatically
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {isRecurring && (
            <>
              <FormField
                control={form.control}
                name="recurringPattern"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recurrence Pattern</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select pattern" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {recurringPattern === "weekly" && (
                <FormField
                  control={form.control}
                  name="recurringDays"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Select Days</FormLabel>
                        <FormDescription>
                          Choose which days of the week this mission should run
                        </FormDescription>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {weekDays.map((day) => (
                          <FormField
                            key={day.value}
                            control={form.control}
                            name="recurringDays"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={day.value}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(day.value)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([
                                              ...(field.value || []),
                                              day.value,
                                            ])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== day.value
                                              )
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {day.label}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </>
          )}
        </div>

        {/* Survey Parameters Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Survey Parameters</h3>

          <FormField
            control={form.control}
            name="missionType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Survey Pattern</FormLabel>
                <Tabs
                  defaultValue={patternTab}
                  onValueChange={(value) => {
                    setPatternTab(value);
                    field.onChange(value);
                  }}
                >
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="crosshatch">Crosshatch</TabsTrigger>
                    <TabsTrigger value="perimeter">Perimeter</TabsTrigger>
                    <TabsTrigger value="grid">Grid</TabsTrigger>
                  </TabsList>
                  <TabsContent value="crosshatch" className="pt-2">
                    <FormDescription>
                      Covers the area in a crisscross pattern for maximum
                      coverage, ideal for detailed inspections.
                    </FormDescription>
                  </TabsContent>
                  <TabsContent value="perimeter" className="pt-2">
                    <FormDescription>
                      Follows the boundaries of the area, good for security and
                      boundary inspections.
                    </FormDescription>
                  </TabsContent>
                  <TabsContent value="grid" className="pt-2">
                    <FormDescription>
                      Systematic pattern with parallel lines for consistent
                      coverage.
                    </FormDescription>
                  </TabsContent>
                </Tabs>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="altitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Altitude (m)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={10}
                      max={120}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>Flight height above ground</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="overlap"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Overlap (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={20}
                      max={90}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>Image overlap percentage</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="speed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Speed (m/s)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      step={0.5}
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormDescription>Drone flight speed</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              form.reset();
              if (onSuccess) onSuccess();
            }}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={!form.formState.isValid}>
            {form.formState.isSubmitting ? "Creating..." : "Create Mission"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
