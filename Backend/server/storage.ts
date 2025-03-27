import {
  User, InsertUser,
  Drone, InsertDrone,
  Location, InsertLocation,
  Mission, InsertMission,
  SurveyReport, InsertSurveyReport
} from "../shared/schema.ts";

// Interface for all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Drone operations
  getDrone(id: number): Promise<Drone | undefined>;
  getDrones(): Promise<Drone[]>;
  createDrone(drone: InsertDrone): Promise<Drone>;
  updateDrone(id: number, drone: Partial<Drone>): Promise<Drone | undefined>;

  // Location operations
  getLocation(id: number): Promise<Location | undefined>;
  getLocations(): Promise<Location[]>;
  createLocation(location: InsertLocation): Promise<Location>;

  // Mission operations
  getMission(id: number): Promise<Mission | undefined>;
  getMissions(): Promise<Mission[]>;
  getMissionsByStatus(status: string): Promise<Mission[]>;
  createMission(mission: InsertMission): Promise<Mission>;
  updateMission(id: number, mission: Partial<Mission>): Promise<Mission | undefined>;
  getMissionsByDroneId(droneId: number): Promise<Mission[]>;

  // Survey Report operations
  getSurveyReport(id: number): Promise<SurveyReport | undefined>;
  getSurveyReports(): Promise<SurveyReport[]>;
  getSurveyReportsByMission(missionId: number): Promise<SurveyReport[]>;
  createSurveyReport(report: InsertSurveyReport): Promise<SurveyReport>;
}

// In-Memory Storage Implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private drones: Map<number, Drone>;
  private locations: Map<number, Location>;
  private missions: Map<number, Mission>;
  private surveyReports: Map<number, SurveyReport>;

  private currentUserId: number;
  private currentDroneId: number;
  private currentLocationId: number;
  private currentMissionId: number;
  private currentReportId: number;

  constructor() {
    this.users = new Map();
    this.drones = new Map();
    this.locations = new Map();
    this.missions = new Map();
    this.surveyReports = new Map();

    this.currentUserId = 1;
    this.currentDroneId = 1;
    this.currentLocationId = 1;
    this.currentMissionId = 1;
    this.currentReportId = 1;

    // Initialize with sample data
    this.initializeSampleData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Drone operations
  async getDrone(id: number): Promise<Drone | undefined> {
    return this.drones.get(id);
  }

  async getDrones(): Promise<Drone[]> {
    return Array.from(this.drones.values());
  }

  async createDrone(insertDrone: InsertDrone): Promise<Drone> {
    const id = this.currentDroneId++;
    const drone: Drone = { ...insertDrone, id };
    this.drones.set(id, drone);
    return drone;
  }

  async updateDrone(id: number, droneUpdate: Partial<Drone>): Promise<Drone | undefined> {
    const drone = this.drones.get(id);
    if (!drone) return undefined;

    const updatedDrone = { ...drone, ...droneUpdate };
    this.drones.set(id, updatedDrone);
    return updatedDrone;
  }

  // Location operations
  async getLocation(id: number): Promise<Location | undefined> {
    return this.locations.get(id);
  }

  async getLocations(): Promise<Location[]> {
    return Array.from(this.locations.values());
  }

  async createLocation(insertLocation: InsertLocation): Promise<Location> {
    const id = this.currentLocationId++;
    const location: Location = { ...insertLocation, id };
    this.locations.set(id, location);
    return location;
  }

  // Mission operations
  async getMission(id: number): Promise<Mission | undefined> {
    return this.missions.get(id);
  }

  async getMissions(): Promise<Mission[]> {
    return Array.from(this.missions.values());
  }

  async getMissionsByStatus(status: string): Promise<Mission[]> {
    return Array.from(this.missions.values()).filter(
      (mission) => mission.status === status
    );
  }

  async createMission(insertMission: InsertMission): Promise<Mission> {
    console.log("mission", insertMission)

    const id = this.currentMissionId++;
    const mission: Mission = { ...insertMission, id };
    this.missions.set(id, mission);
    return mission;
  }

  async updateMission(id: number, missionUpdate: Partial<Mission>): Promise<Mission | undefined> {
    const mission = this.missions.get(id);
    if (!mission) return undefined;

    const updatedMission = { ...mission, ...missionUpdate };
    this.missions.set(id, updatedMission);
    return updatedMission;
  }

  async getMissionsByDroneId(droneId: number): Promise<Mission[]> {
    return Array.from(this.missions.values()).filter(
      (mission) => mission.droneId === droneId
    );
  }

  // Survey Report operations
  async getSurveyReport(id: number): Promise<SurveyReport | undefined> {
    return this.surveyReports.get(id);
  }

  async getSurveyReports(): Promise<SurveyReport[]> {
    return Array.from(this.surveyReports.values());
  }

  async getSurveyReportsByMission(missionId: number): Promise<SurveyReport[]> {
    return Array.from(this.surveyReports.values()).filter(
      (report) => report.missionId === missionId
    );
  }

  async createSurveyReport(insertReport: InsertSurveyReport): Promise<SurveyReport> {
    const id = this.currentReportId++;
    const report: SurveyReport = { ...insertReport, id };
    this.surveyReports.set(id, report);
    return report;
  }

  // Initialize with sample data for development
  private initializeSampleData() {
    // Add a demo user
    this.createUser({
      username: 'demo',
      password: 'password',
      fullName: 'Demo User',
      role: 'admin'
    });

    // Add sample locations
    const locations = [
      {
        name: 'Facility A',
        description: 'Main manufacturing plant',
        address: '123 Industrial Way, Cityville',
        startLatitude: '37.7749',
        startLongitude: '-122.4194',
        endLatitude: '37.7759',
        endLongitude: '-122.4184'
      },
      {
        name: 'Building B',
        description: 'Research & Development Center',
        address: '456 Tech Boulevard, Techtown',
        startLatitude: '37.7833',
        startLongitude: '-122.4167',
        endLatitude: '37.7843',
        endLongitude: '-122.4157'
      },
      {
        name: 'Solar Farm',
        description: 'Solar energy collection facility',
        address: '789 Sunny Road, Energyville',
        startLatitude: '37.7695',
        startLongitude: '-122.4090',
        endLatitude: '37.7705',
        endLongitude: '-122.4080'
      },
      {
        name: 'Construction Site',
        description: 'New office building construction',
        address: '321 Builder Street, Constructia',
        startLatitude: '37.7695',
        startLongitude: '-122.4290',
        endLatitude: '37.7705',
        endLongitude: '-122.4280'
      },
      {
        name: 'Factory C',
        description: 'Secondary manufacturing plant',
        address: '654 Manufacturing Blvd, Factoryville',
        startLatitude: '37.7895',
        startLongitude: '-122.4390',
        endLatitude: '37.7905',
        endLongitude: '-122.4380'
      }
    ];

    locations.forEach(location => this.createLocation(location));

    // Add sample drones
    const drones = [
      { name: 'Drone #01', model: 'DJI Mavic 3 Pro', status: 'available', batteryLevel: 92 },
      { name: 'Drone #02', model: 'DJI Mavic 3 Pro', status: 'available', batteryLevel: 95 },
      { name: 'Drone #03', model: 'DJI Phantom 4 RTK', status: 'available', batteryLevel: 88 },
      { name: 'Drone #04', model: 'DJI Phantom 4 RTK', status: 'available', batteryLevel: 81 },
      { name: 'Drone #05', model: 'DJI Matrice 300 RTK', status: 'available', batteryLevel: 85 },
      { name: 'Drone #06', model: 'DJI Matrice 300 RTK', status: 'available', batteryLevel: 89 },
      { name: 'Drone #07', model: 'DJI Mavic 3 Pro', status: 'charging', batteryLevel: 28 },
      { name: 'Drone #08', model: 'DJI Phantom 4 RTK', status: 'in-mission', batteryLevel: 78 },
      { name: 'Drone #09', model: 'DJI Matrice 300 RTK', status: 'available', batteryLevel: 90 },
      { name: 'Drone #10', model: 'DJI Mavic 3 Pro', status: 'available', batteryLevel: 94 },
      { name: 'Drone #11', model: 'DJI Phantom 4 RTK', status: 'available', batteryLevel: 90 },
      { name: 'Drone #12', model: 'DJI Matrice 300 RTK', status: 'in-mission', batteryLevel: 65 },
      { name: 'Drone #13', model: 'DJI Mavic 3 Pro', status: 'in-mission', batteryLevel: 72 },
      { name: 'Drone #14', model: 'DJI Phantom 4 RTK', status: 'available', batteryLevel: 91 },
      { name: 'Drone #15', model: 'DJI Matrice 300 RTK', status: 'charging', batteryLevel: 12 },
      { name: 'Drone #16', model: 'DJI Mavic 3 Pro', status: 'available', batteryLevel: 87 },
      { name: 'Drone #17', model: 'DJI Phantom 4 RTK', status: 'available', batteryLevel: 93 },
      { name: 'Drone #18', model: 'DJI Matrice 300 RTK', status: 'available', batteryLevel: 96 },
      { name: 'Drone #19', model: 'DJI Mavic 3 Pro', status: 'in-mission', batteryLevel: 58 },
      { name: 'Drone #20', model: 'DJI Phantom 4 RTK', status: 'available', batteryLevel: 84 },
      { name: 'Drone #21', model: 'DJI Matrice 300 RTK', status: 'available', batteryLevel: 89 },
      { name: 'Drone #22', model: 'DJI Mavic 3 Pro', status: 'in-mission', batteryLevel: 62 },
      { name: 'Drone #23', model: 'DJI Phantom 4 RTK', status: 'in-mission', batteryLevel: 55 },
      { name: 'Drone #24', model: 'DJI Matrice 300 RTK', status: 'in-mission', batteryLevel: 67 },
      { name: 'Drone #25', model: 'DJI Mavic 3 Pro', status: 'in-mission', batteryLevel: 71 },
      { name: 'Drone #26', model: 'DJI Phantom 4 RTK', status: 'maintenance', batteryLevel: 0 },
      { name: 'Drone #27', model: 'DJI Matrice 300 RTK', status: 'charging', batteryLevel: 35 },
      { name: 'Drone #28', model: 'DJI Phantom 4 RTK', status: 'maintenance', batteryLevel: 45 },
      { name: 'Drone #29', model: 'DJI Mavic 3 Pro', status: 'available', batteryLevel: 82 },
      { name: 'Drone #30', model: 'DJI Matrice 300 RTK', status: 'available', batteryLevel: 91 },
      { name: 'Drone #31', model: 'DJI Mavic 3 Pro', status: 'available', batteryLevel: 87 }
    ];

    drones.forEach(drone => this.createDrone(drone));

    // Add sample missions
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0);

    // Helper to add minutes to a date
    const addMinutes = (date: Date, minutes: number) => {
      return new Date(date.getTime() + minutes * 60000);
    };

    const missionTypes = ['roof-inspection', 'perimeter', 'crosshatch'];
    const missionStatuses = ['scheduled', 'in-progress', 'completed', 'aborted'];

    // Create sample missions
    const missions = [
      {
        name: 'Facility A - Roof Inspection',
        description: 'Regular inspection of facility roof and HVAC equipment',
        locationId: 1,
        status: 'in-progress',
        startTime: addMinutes(todayStart, 90), // 10:30 AM today
        scheduledTime: addMinutes(todayStart, 90),
        isRecurring: false,
        missionType: 'crosshatch',
        droneId: 12,
        completionPercentage: 65,
        surveyParameters: {
          altitude: 30,
          overlap: 75,
          speed: 5
        },
        surveyPatternData: {
          coordinates: [
            { lat: 37.7749, lng: -122.4194 },
            { lat: 37.7750, lng: -122.4184 },
            { lat: 37.7755, lng: -122.4188 }
          ]
        }
      },
      {
        name: 'Building B - Perimeter Scan',
        description: 'Security perimeter scan of R&D facility',
        locationId: 2,
        status: 'in-progress',
        startTime: addMinutes(todayStart, 120), // 11:00 AM today
        scheduledTime: addMinutes(todayStart, 120),
        isRecurring: true,
        recurringPattern: 'daily',
        missionType: 'perimeter',
        droneId: 8,
        completionPercentage: 42,
        surveyParameters: {
          altitude: 25,
          overlap: 60,
          speed: 4
        },
        surveyPatternData: {
          coordinates: [
            { lat: 37.7833, lng: -122.4167 },
            { lat: 37.7840, lng: -122.4170 },
            { lat: 37.7835, lng: -122.4180 }
          ]
        }
      },
      {
        name: 'Solar Farm - Panel Inspection',
        description: 'Inspection of solar panel arrays',
        locationId: 3,
        status: 'scheduled',
        scheduledTime: addMinutes(todayStart, 180), // 12:00 PM today
        isRecurring: true,
        recurringPattern: 'weekly',
        recurringDays: [1, 4], // Monday and Thursday
        missionType: 'crosshatch',
        droneId: 5,
        completionPercentage: 0,
        surveyParameters: {
          altitude: 35,
          overlap: 80,
          speed: 3
        },
        surveyPatternData: {
          coordinates: [
            { lat: 37.7695, lng: -122.4090 },
            { lat: 37.7700, lng: -122.4095 },
            { lat: 37.7690, lng: -122.4100 }
          ]
        }
      },
      {
        name: 'Construction Site - Progress Check',
        description: 'Weekly progress check of construction site',
        locationId: 4,
        status: 'scheduled',
        scheduledTime: addMinutes(todayStart, 300), // 2:00 PM today
        isRecurring: true,
        recurringPattern: 'weekly',
        recurringDays: [2], // Tuesday
        missionType: 'crosshatch',
        droneId: 17,
        completionPercentage: 0,
        surveyParameters: {
          altitude: 40,
          overlap: 70,
          speed: 4
        },
        surveyPatternData: {
          coordinates: [
            { lat: 37.7695, lng: -122.4290 },
            { lat: 37.7700, lng: -122.4295 },
            { lat: 37.7690, lng: -122.4300 }
          ]
        }
      },
      {
        name: 'Factory C - Infrastructure Inspection',
        description: 'Inspection of factory pipes and infrastructure',
        locationId: 5,
        status: 'scheduled',
        scheduledTime: addMinutes(todayStart, 1440), // Tomorrow 9:00 AM
        isRecurring: false,
        missionType: 'perimeter',
        completionPercentage: 0,
        surveyParameters: {
          altitude: 30,
          overlap: 65,
          speed: 3
        },
        surveyPatternData: {
          coordinates: [
            { lat: 37.7895, lng: -122.4390 },
            { lat: 37.7900, lng: -122.4395 },
            { lat: 37.7890, lng: -122.4400 }
          ]
        }
      },
      // Add some completed missions from previous days
      {
        name: 'Facility A Inspection',
        description: 'Regular inspection of main facility',
        locationId: 1,
        status: 'completed',
        startTime: addMinutes(todayStart, -120), // Today, 7:00 AM
        endTime: addMinutes(todayStart, -75), // Today, 7:45 AM
        scheduledTime: addMinutes(todayStart, -120),
        isRecurring: true,
        recurringPattern: 'weekly',
        recurringDays: [1, 3, 5], // Mon, Wed, Fri
        missionType: 'crosshatch',
        droneId: 3,
        completionPercentage: 100,
        surveyParameters: {
          altitude: 30,
          overlap: 75,
          speed: 5
        }
      },
      {
        name: 'Solar Farm Weekly Survey',
        description: 'Weekly survey of solar farm',
        locationId: 3,
        status: 'completed',
        startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 14, 30, 0), // Yesterday 2:30 PM
        endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 15, 45, 0), // Yesterday 3:45 PM
        scheduledTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 14, 30, 0),
        isRecurring: true,
        recurringPattern: 'weekly',
        recurringDays: [3], // Wednesday
        missionType: 'crosshatch',
        droneId: 5,
        completionPercentage: 100,
        surveyParameters: {
          altitude: 35,
          overlap: 80,
          speed: 3
        }
      },
      {
        name: 'Construction Site Progress',
        description: 'Weekly progress check of construction site',
        locationId: 4,
        status: 'completed',
        startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 9, 30, 0), // Yesterday 9:30 AM
        endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 10, 2, 0), // Yesterday 10:02 AM
        scheduledTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 9, 30, 0),
        isRecurring: true,
        recurringPattern: 'weekly',
        recurringDays: [2], // Tuesday
        missionType: 'crosshatch',
        droneId: 17,
        completionPercentage: 100,
        surveyParameters: {
          altitude: 40,
          overlap: 70,
          speed: 4
        }
      }
    ];

    missions.forEach(mission => this.createMission(mission));

    // Add sample survey reports
    const surveyReports = [
      {
        missionId: 6,
        date: new Date(),
        duration: 45, // 45 minutes
        areaCovered: '3.2',
        findings: { issues: ['Loose panel on northwest corner', 'Vegetation growth near east entrance'] },
        status: 'completed',
        summary: 'Completed successful inspection of Facility A. Found two minor issues that require maintenance.'
      },
      {
        missionId: 7,
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1),
        duration: 75, // 1h 15min
        areaCovered: '5.8',
        findings: { issues: ['Three panels showing reduced efficiency', 'Dust accumulation on southern array'] },
        status: 'completed',
        summary: 'Weekly survey of solar farm completed successfully. Identified performance issues with some panels.'
      },
      {
        missionId: 8,
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1),
        duration: 32, // 32 minutes
        areaCovered: '1.5',
        findings: { issues: [], progress: 'Foundation completed, steel framing 40% complete' },
        status: 'completed',
        summary: 'Construction progressing according to schedule. No issues identified.'
      }
    ];

    surveyReports.forEach(report => this.createSurveyReport(report));
  }
}

// Import the DatabaseStorage class
import { DatabaseStorage } from './database-storage.ts';

// Export an instance of DatabaseStorage instead of MemStorage
export const storage = new DatabaseStorage();
