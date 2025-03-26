import { z } from "zod";

// User schema using Zod
export const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  password: z.string(),
  email: z.string(),
  role: z.string(),
  name: z.string().nullable().optional(),
});

export const insertUserSchema = userSchema.omit({ 
  id: true 
}).partial({
  name: true,
  email: true,
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
  latitude: z.string().nullable(),
  longitude: z.string().nullable(),
  area: z.number().nullable(),
});

export const insertLocationSchema = locationSchema.omit({
  id: true,
}).partial({
  description: true,
  latitude: true,
  longitude: true,
  area: true,
});

// Mission schema using Zod
export const missionSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  locationId: z.number().nullable(),
  droneId: z.number().nullable(),
  status: z.string(), // scheduled, in-progress, completed, aborted
  missionType: z.string(), // perimeter, crosshatch, grid
  startTime: z.date().nullable(),
  endTime: z.date().nullable(),
  scheduledTime: z.date().nullable(),
  isRecurring: z.boolean().default(false),
  recurringPattern: z.string().nullable(), // daily, weekly, monthly
  recurringDays: z.array(z.number()).nullable(), // [1,3,5] for Monday, Wednesday, Friday
  surveyParameters: z.record(z.any()).nullable(), // altitude, overlap, etc
  surveyPatternData: z.record(z.any()).nullable(), // coordinates, waypoints
  completionPercentage: z.number().nullable(),
});

export const insertMissionSchema = missionSchema.omit({
  id: true,
}).partial({
  description: true,
  locationId: true,
  droneId: true,
  startTime: true,
  endTime: true,
  scheduledTime: true,
  isRecurring: true,
  recurringPattern: true,
  recurringDays: true,
  surveyParameters: true,
  surveyPatternData: true,
  completionPercentage: true,
});

// Survey report schema using Zod
export const surveyReportSchema = z.object({
  id: z.number(),
  missionId: z.number(),
  date: z.string(),
  duration: z.number(),
  areaCovered: z.string().nullable(),
  findings: z.record(z.any()).nullable(),
  status: z.string(), // completed, partial, failed
  summary: z.string().nullable(),
  imageUrls: z.array(z.string()).optional(),
});

export const insertSurveyReportSchema = surveyReportSchema.omit({
  id: true,
  imageUrls: true,
}).partial({
  areaCovered: true,
  findings: true,
  summary: true,
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
