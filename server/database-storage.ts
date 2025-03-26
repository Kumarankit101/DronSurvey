import { 
  User, InsertUser, 
  Drone, InsertDrone, 
  Location, InsertLocation, 
  Mission, InsertMission, 
  SurveyReport, InsertSurveyReport 
} from "@shared/schema";
import { IStorage } from "./storage";
import { prisma } from "./prisma";

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
      latitude: location.latitude || "0",
      longitude: location.longitude || "0"
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
    return mission || undefined;
  }

  async getMissions(): Promise<Mission[]> {
    return await prisma.mission.findMany();
  }

  async getMissionsByStatus(status: string): Promise<Mission[]> {
    return await prisma.mission.findMany({
      where: { status }
    });
  }

  async createMission(mission: InsertMission): Promise<Mission> {
    // Make sure required fields are present
    const missionData = {
      ...mission,
      // Required fields in Prisma schema that might be optional in Zod schema
      recurringDays: mission.recurringDays || [],
      surveyPatternData: mission.surveyPatternData || {},
      surveyParameters: mission.surveyParameters || {}
    };
    
    return await prisma.mission.create({
      data: missionData
    });
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

  // Seed initial data (can be called during initialization if needed)
  async seedInitialData(): Promise<void> {
    try {
      // Check if data already exists before seeding
      const dronesCount = await prisma.drone.count();
      if (dronesCount > 0) {
        console.log("Database already contains data, skipping seed");
        return;
      }

      console.log("Seeding database with initial data...");

      // Seed logic here similar to initializeSampleData from MemStorage
      // First create a user
      const admin = await prisma.user.create({
        data: {
          username: "admin",
          password: "admin123",
          email: "admin@example.com",
          role: "admin",
          name: "Administrator"
        }
      });

      // Create sample drones
      const droneModels = ["DJI Mavic 3 Pro", "DJI Phantom 4", "Autel EVO II", "Skydio 2"];
      const droneStatuses = ["available", "in-mission", "charging", "maintenance"];
      
      for (let i = 1; i <= 20; i++) {
        const modelIndex = Math.floor(Math.random() * droneModels.length);
        const statusIndex = Math.floor(Math.random() * droneStatuses.length);
        const batteryLevel = Math.floor(Math.random() * 100) + 1;
        const lastMissionDate = i % 3 === 0 ? new Date() : undefined;
        
        await prisma.drone.create({
          data: {
            name: `Drone #${i.toString().padStart(2, '0')}`,
            model: droneModels[modelIndex],
            status: droneStatuses[statusIndex],
            batteryLevel,
            lastMission: lastMissionDate,
            locationLat: i % 2 === 0 ? "37.7749" : undefined,
            locationLng: i % 2 === 0 ? "-122.4194" : undefined
          }
        });
      }

      // Create sample locations
      const locations = [
        {
          name: "Facility A",
          description: "Main manufacturing facility",
          latitude: "37.7749",
          longitude: "-122.4194",
          area: 25000,
          type: "industrial"
        },
        {
          name: "Site B Construction",
          description: "New construction site",
          latitude: "37.7739",
          longitude: "-122.4312",
          area: 15000,
          type: "construction"
        },
        {
          name: "Solar Farm C",
          description: "Solar panel installation",
          latitude: "37.7833",
          longitude: "-122.4167",
          area: 50000,
          type: "energy"
        }
      ];

      for (const location of locations) {
        await prisma.location.create({
          data: location
        });
      }

      // Create sample missions
      const missionTypes = ["perimeter", "crosshatch", "grid"];
      const now = new Date();

      // Helper to add minutes to date
      const addMinutes = (date: Date, minutes: number) => {
        return new Date(date.getTime() + minutes * 60000);
      };

      // Create all missions first
      const completedMissions = [];
      // Create completed missions
      for (let i = 1; i <= 3; i++) {
        const missionType = missionTypes[i % missionTypes.length];
        const locationId = (i % 3) + 1;
        const droneId = i + 1;

        // Mission that completed 1-3 days ago
        const daysAgo = i;
        const endDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
        const startDate = new Date(endDate.getTime() - (45 * 60 * 1000)); // 45 minutes before end

        const mission = await prisma.mission.create({
          data: {
            name: `Past Mission ${i}`,
            description: `Completed mission ${i} days ago`,
            locationId,
            droneId,
            status: "completed",
            missionType,
            completionPercentage: 100,
            isRecurring: false,
            startTime: startDate,
            endTime: endDate,
            surveyPatternData: {
              coordinates: [
                { lat: "37.7749", lng: "-122.4194" },
                { lat: "37.7749", lng: "-122.4094" },
                { lat: "37.7849", lng: "-122.4094" },
                { lat: "37.7849", lng: "-122.4194" }
              ]
            },
            surveyParameters: {
              altitude: 30,
              overlap: 70,
              speed: 5
            }
          }
        });
        
        completedMissions.push(mission);
      }

      // Create active missions
      for (let i = 1; i <= 2; i++) {
        const missionType = missionTypes[i % missionTypes.length];
        const locationId = (i % 3) + 1;
        const droneId = i;
        const startTime = addMinutes(now, -30 * i); // Started 30-60 minutes ago
        const completionPercentage = 30 + (i * 20); // 50% and 70% complete

        await prisma.mission.create({
          data: {
            name: `Facility A - ${i === 1 ? 'Roof Inspection' : 'Perimeter Check'}`,
            description: "Active mission for real-time monitoring",
            locationId,
            droneId,
            status: "in-progress",
            missionType,
            completionPercentage,
            isRecurring: false,
            startTime,
            surveyPatternData: {
              coordinates: [
                { lat: "37.7749", lng: "-122.4194" },
                { lat: "37.7749", lng: "-122.4094" },
                { lat: "37.7849", lng: "-122.4094" },
                { lat: "37.7849", lng: "-122.4194" }
              ]
            },
            surveyParameters: {
              altitude: 30,
              overlap: 70,
              speed: 5
            }
          }
        });
      }

      // Create scheduled missions
      for (let i = 1; i <= 3; i++) {
        const missionType = missionTypes[i % missionTypes.length];
        const locationId = (i % 3) + 1;
        const droneId = i % 2 === 0 ? i + 10 : undefined; // Some with assigned drones, some without
        const scheduledTime = addMinutes(now, i * 60); // Scheduled 1-3 hours in future

        await prisma.mission.create({
          data: {
            name: `Scheduled Mission ${i}`,
            description: `Upcoming mission scheduled for future execution`,
            locationId,
            droneId,
            status: "scheduled",
            missionType,
            completionPercentage: 0,
            isRecurring: i === 3, // Make the last one recurring
            recurringPattern: i === 3 ? "weekly" : undefined,
            recurringDays: i === 3 ? [1, 3, 5] : [],
            scheduledTime,
            surveyPatternData: {
              coordinates: [
                { lat: "37.7749", lng: "-122.4194" },
                { lat: "37.7749", lng: "-122.4094" },
                { lat: "37.7849", lng: "-122.4094" },
                { lat: "37.7849", lng: "-122.4194" }
              ]
            },
            surveyParameters: {
              altitude: 30,
              overlap: 70,
              speed: 5
            }
          }
        });
      }

      // NOW create survey reports for completed missions
      for (let i = 0; i < completedMissions.length; i++) {
        const mission = completedMissions[i];
        await prisma.surveyReport.create({
          data: {
            missionId: mission.id,
            date: mission.endTime!,
            duration: 45,
            areaCovered: `${5 + i}.2`,
            status: "completed",
            summary: `Survey completed for mission ${i+1}. No issues detected.`,
            findings: {
              issues: [],
              progress: "All objectives completed",
              recommendations: "Regular maintenance recommended"
            },
            imageUrls: [
              `/assets/survey${i+1}_1.jpg`,
              `/assets/survey${i+1}_2.jpg`
            ]
          }
        });
      }

      console.log("Database seeding completed");
    } catch (error) {
      console.error("Error seeding database:", error);
      throw error;
    }
  }
}