import { pgTable, text, serial, integer, boolean, timestamp, jsonb, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  role: text("role").notNull().default("user"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  role: true,
});

// Drone definition
export const drones = pgTable("drones", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  model: text("model").notNull(),
  status: text("status").notNull().default("available"), // available, in-mission, charging, maintenance
  batteryLevel: integer("battery_level").notNull().default(100),
  lastMission: timestamp("last_mission"),
  locationLat: text("location_lat"),
  locationLng: text("location_lng"),
});

export const insertDroneSchema = createInsertSchema(drones).omit({
  id: true,
});

// Facilities/Locations
export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  address: text("address"),
  latitude: text("latitude"),
  longitude: text("longitude"),
});

export const insertLocationSchema = createInsertSchema(locations).omit({
  id: true,
});

// Mission definitions
export const missions = pgTable("missions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  locationId: integer("location_id"),
  status: text("status").notNull().default("scheduled"), // scheduled, in-progress, completed, aborted
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  scheduledTime: timestamp("scheduled_time"),
  isRecurring: boolean("is_recurring").default(false),
  recurringPattern: text("recurring_pattern"), // daily, weekly, monthly
  recurringDays: jsonb("recurring_days"), // [1,3,5] for Monday, Wednesday, Friday
  missionType: text("mission_type").notNull(), // roof-inspection, perimeter, crosshatch
  surveyParameters: jsonb("survey_parameters"), // altitude, overlap, etc
  surveyPatternData: jsonb("survey_pattern_data"), // coordinates, waypoints
  droneId: integer("drone_id"), // assigned drone
  completionPercentage: integer("completion_percentage").default(0),
});

export const insertMissionSchema = createInsertSchema(missions).omit({
  id: true,
});

// Survey Reports
export const surveyReports = pgTable("survey_reports", {
  id: serial("id").primaryKey(),
  missionId: integer("mission_id").notNull(),
  date: date("date").notNull(),
  duration: integer("duration").notNull(), // in minutes
  areaCovered: text("area_covered"), // in sq meters/km
  findings: jsonb("findings"), // any issues found
  status: text("status").notNull(), // completed, partial, failed
  summary: text("summary"),
});

export const insertSurveyReportSchema = createInsertSchema(surveyReports).omit({
  id: true,
});

// Types for the database models
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Drone = typeof drones.$inferSelect;
export type InsertDrone = z.infer<typeof insertDroneSchema>;

export type Location = typeof locations.$inferSelect;
export type InsertLocation = z.infer<typeof insertLocationSchema>;

export type Mission = typeof missions.$inferSelect;
export type InsertMission = z.infer<typeof insertMissionSchema>;

export type SurveyReport = typeof surveyReports.$inferSelect;
export type InsertSurveyReport = z.infer<typeof insertSurveyReportSchema>;
