import {
  User, InsertUser,
  Drone, InsertDrone,
  Location, InsertLocation,
  Mission, InsertMission,
  SurveyReport, InsertSurveyReport
} from "@shared/schema.ts";
import { IStorage } from "./storage.ts";
import { prisma } from "./prisma.ts";
import { seedDatabase } from "./database-seed.ts";

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const user = await prisma.user.findUnique({
      where: { id }
    });
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const user = await prisma.user.findUnique({
      where: { username }
    });
    return user || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    // Make sure we have an email and handle nullable fields for Prisma
    const userData = {
      ...user,
      email: user.email || `${user.username}@example.com`, // Default email if not provided
      name: user.name || null
    };

    return await prisma.user.create({
      data: userData
    });
  }

  // Drone operations
  async getDrone(id: number): Promise<Drone | undefined> {
    const drone = await prisma.drone.findUnique({
      where: { id }
    });
    return drone || undefined;
  }

  async getDrones(): Promise<Drone[]> {
    return await prisma.drone.findMany();
  }

  async createDrone(drone: InsertDrone): Promise<Drone> {
    // Make sure required fields are present
    const droneData = {
      ...drone,
      // Handle nullable fields with proper default values
      lastMission: drone.lastMission || null,
      locationLat: drone.locationLat || null,
      locationLng: drone.locationLng || null
    };

    return await prisma.drone.create({
      data: droneData
    });
  }

  async updateDrone(id: number, drone: Partial<Drone>): Promise<Drone | undefined> {
    try {
      // Get the existing drone first to handle required fields
      const currentDrone = await this.getDrone(id);
      if (!currentDrone) return undefined;

      // Create update data, preserving required fields if not provided in update
      const updateData: any = { ...drone };

      // Make sure null values are properly handled for nullable fields
      if ('lastMission' in drone && drone.lastMission === undefined) {
        updateData.lastMission = currentDrone.lastMission;
      }

      if ('locationLat' in drone && drone.locationLat === undefined) {
        updateData.locationLat = currentDrone.locationLat;
      }

      if ('locationLng' in drone && drone.locationLng === undefined) {
        updateData.locationLng = currentDrone.locationLng;
      }

      return await prisma.drone.update({
        where: { id },
        data: updateData
      });
    } catch (error) {
      console.error("Failed to update drone:", error);
      return undefined;
    }
  }

  // Location operations
  async getLocation(id: number): Promise<Location | undefined> {
    const location = await prisma.location.findUnique({
      where: { id }
    });
    return location || undefined;
  }

  async getLocations(): Promise<Location[]> {
    return await prisma.location.findMany();
  }

  async createLocation(location: InsertLocation): Promise<Location> {
    // Make sure required fields are present
    const locationData = {
      ...location,
      // Required fields in Prisma schema that might be optional in Zod schema
      startLatitude: location.startLatitude || "0",
      startLongitude: location.startLongitude || "0",
      endLatitude: location.endLatitude || "0",
      endLongitude: location.endLongitude || "0"
    };

    return await prisma.location.create({
      data: locationData
    });
  }

  // Mission operations
  async getMission(id: number): Promise<Mission | undefined> {
    const mission = await prisma.mission.findUnique({
      where: { id }
    });
if (!mission) return undefined;
return {
  ...mission,
  surveyParameters: mission.surveyParameters as { altitude: number; overlap: number; speed: number; }
};
  }

  async getMissions(): Promise<Mission[]> {
const missions = await prisma.mission.findMany();
return missions.map(mission => ({
  ...mission,
  surveyParameters: mission.surveyParameters as { altitude: number; overlap: number; speed: number; }
}));
  }

  async getMissionsByStatus(status: string): Promise<Mission[]> {

    const missions = await prisma.mission.findMany({
      where: { status }
    });
return missions.map(mission => ({
  ...mission,
  surveyParameters: mission.surveyParameters as { altitude: number; overlap: number; speed: number; }
}));

    
    // return await prisma.mission.findMany({
    //   where: { status }
    // });
  }

  async createMission(mission: InsertMission): Promise<Mission> {
    try {
      // Make sure required fields are present and properly formatted
      const missionData = {
        ...mission,
        // Required fields in Prisma schema that might be optional in Zod schema
        recurringDays: mission.recurringDays || [],
        surveyPatternData: mission.surveyPatternData || {},
        surveyParameters: mission.surveyParameters || {
          altitude: 30,
          overlap: 70,
          speed: 5
        },
        // Ensure dates are properly formatted
        scheduledTime: mission.scheduledTime ? new Date(mission.scheduledTime) : null,
        startTime: mission.startTime ? new Date(mission.startTime) : null,
        endTime: mission.endTime ? new Date(mission.endTime) : null
      };

      console.log("Attempting to create mission with data:", JSON.stringify(missionData, null, 2));

      const missionCreated = await prisma.mission.create({
        data: missionData
      });

      console.log("Mission created successfully:", missionCreated);
      return missionCreated;
    } catch (error) {
      console.error("Failed to create mission. Error:", error);
      throw error;
    }
  }

  async updateMission(id: number, mission: Partial<Mission>): Promise<Mission | undefined> {
    try {
      // Get the existing mission first to handle required fields
      const currentMission = await this.getMission(id);
      if (!currentMission) return undefined;

      // Create update data, preserving required fields if not provided in update
      const updateData: any = { ...mission };

      // Make sure we don't override required fields with undefined
      if ('surveyPatternData' in mission && mission.surveyPatternData === undefined) {
        updateData.surveyPatternData = currentMission.surveyPatternData;
      }

      if ('surveyParameters' in mission && mission.surveyParameters === undefined) {
        updateData.surveyParameters = currentMission.surveyParameters;
      }

      if ('recurringDays' in mission && mission.recurringDays === undefined) {
        updateData.recurringDays = currentMission.recurringDays;
      }

      return await prisma.mission.update({
        where: { id },
        data: updateData
      });
    } catch (error) {
      console.error("Failed to update mission:", error);
      return undefined;
    }
  }

  async getMissionsByDroneId(droneId: number): Promise<Mission[]> {
    return await prisma.mission.findMany({
      where: { droneId }
    });
  }

  // Survey Report operations
  async getSurveyReport(id: number): Promise<SurveyReport | undefined> {
    const report = await prisma.surveyReport.findUnique({
      where: { id }
    });
    return report || undefined;
  }

  async getSurveyReports(): Promise<SurveyReport[]> {
    return await prisma.surveyReport.findMany();
  }

  async getSurveyReportsByMission(missionId: number): Promise<SurveyReport[]> {
    return await prisma.surveyReport.findMany({
      where: { missionId }
    });
  }

  async createSurveyReport(report: InsertSurveyReport): Promise<SurveyReport> {
    // Make sure required fields are present
    const reportData = {
      ...report,
      // Required fields in Prisma schema that might be optional in Zod schema
      findings: report.findings || {},
      imageUrls: report.imageUrls || []
    };

    return await prisma.surveyReport.create({
      data: reportData
    });
  }

  async seedInitialData(): Promise<void> {
    await seedDatabase();
  }


}