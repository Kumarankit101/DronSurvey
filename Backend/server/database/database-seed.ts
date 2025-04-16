import { prisma } from "./prisma.ts";

  // Seed initial data (can be called during initialization if needed)
export async function seedDatabase(): Promise<void> {
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
          startLatitude: "37.7749",
          startLongitude: "-122.4194",
          endLatitude: "37.7749",
          endLongitude: "-122.4194",
          area: 25000,
          type: "industrial"
        },
        {
          name: "Site B Construction",
          description: "New construction site",
          startLatitude: "37.7739",
          startLongitude: "-122.4312",
          endLatitude: "37.7739",
          endLongitude: "-122.4312",
          area: 15000,
          type: "construction"
        },
        {
          name: "Solar Farm C",
          description: "Solar panel installation",
          startLatitude: "37.7833",
          startLongitude: "-122.4167",
          endLatitude: "37.7833",
          endLongitude: "-122.4167",
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
            summary: `Survey completed for mission ${i + 1}. No issues detected.`,
            findings: {
              issues: [],
              progress: "All objectives completed",
              recommendations: "Regular maintenance recommended"
            },
            imageUrls: [
              `/assets/survey${i + 1}_1.jpg`,
              `/assets/survey${i + 1}_2.jpg`
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