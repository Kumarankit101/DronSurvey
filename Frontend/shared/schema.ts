import { z } from "zod";

// User schema using Zod
export const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  password: z.string(),
  email: z.string(),
  role: z.string(),
  name: z.string().nullable(),
});

export const insertUserSchema = userSchema.omit({
  id: true
}).partial({
  name: true,
}).extend({
  role: z.string().default('user')
});

// Drone schema using Zod
export const droneSchema = z.object({
  id: z.number(),
  name: z.string(),
  model: z.string(),
  status: z.string(), // available, in-mission, charging, maintenance
  batteryLevel: z.number(),
  lastMission: z.date().nullable(),
  locationLat: z.string().nullable(),
  locationLng: z.string().nullable(),
});

export const insertDroneSchema = droneSchema.omit({
  id: true,
}).partial({
  lastMission: true,
  locationLat: true,
  locationLng: true,
});

// Location schema using Zod
export const locationSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  type: z.string(),
  startLatitude: z.string(),
  startLongitude: z.string(),
  endLatitude: z.string(),
  endLongitude: z.string(),
  area: z.number().nullable(),
});

export const insertLocationSchema = locationSchema.omit({
  id: true,
}).partial({
  description: true,
  area: true,
});

// Mission schema using Zod
export const missionSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  locationId: z.number(),
  droneId: z.number().nullable(),
  status: z.string(), // scheduled, in-progress, completed, aborted
  missionType: z.string(), // perimeter, crosshatch, grid
  completionPercentage: z.number(),
  isRecurring: z.boolean().default(false),
  recurringPattern: z.string().nullable(), // daily, weekly, monthly
  recurringDays: z.array(z.number()),
  scheduledTime: z.date().nullable(),
  startTime: z.date().nullable(),
  endTime: z.date().nullable(),
  surveyPatternData: z.any(),
  surveyParameters: z.object({
    altitude: z.number().min(10, "Minimum altitude is 10m").max(120, "Maximum altitude is 120m"),
    overlap: z.number().min(20, "Minimum overlap is 20%").max(90, "Maximum overlap is 90%"),
    speed: z.number().min(1, "Minimum speed is 1 m/s").max(10, "Maximum speed is 10 m/s"),
  }),

});

export const insertMissionSchema = missionSchema.omit({
  id: true,
}).partial({
  description: true,
  droneId: true,
  startTime: true,
  endTime: true,
  scheduledTime: true,
  isRecurring: true,
  recurringPattern: true,
});

// Survey report schema using Zod
export const surveyReportSchema = z.object({
  id: z.number(),
  missionId: z.number(),
  date: z.date(),
  duration: z.number().nullable(),
  areaCovered: z.string().nullable(),
  status: z.string(), // completed, partial, failed
  summary: z.string().nullable(),
  findings: z.any(),
  imageUrls: z.array(z.string()),
});

export const insertSurveyReportSchema = surveyReportSchema.omit({
  id: true,
}).partial({
  areaCovered: true,
  summary: true,
  duration: true,
});

// Types for the database models
export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Drone = z.infer<typeof droneSchema>;
export type InsertDrone = z.infer<typeof insertDroneSchema>;

export type Location = z.infer<typeof locationSchema>;
export type InsertLocation = z.infer<typeof insertLocationSchema>;

export type Mission = z.infer<typeof missionSchema>;
export type InsertMission = z.infer<typeof insertMissionSchema>;

export type SurveyReport = z.infer<typeof surveyReportSchema>;
export type InsertSurveyReport = z.infer<typeof insertSurveyReportSchema>;
