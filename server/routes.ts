import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertDroneSchema, 
  insertLocationSchema, 
  insertMissionSchema, 
  insertSurveyReportSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes
  app.get('/api/dashboard/stats', async (req: Request, res: Response) => {
    try {
      const drones = await storage.getDrones();
      const missions = await storage.getMissions();
      const reports = await storage.getSurveyReports();
      
      const activeMissions = missions.filter(m => m.status === 'in-progress').length;
      const availableDrones = drones.filter(d => d.status === 'available').length;
      const completedSurveys = missions.filter(m => m.status === 'completed').length;
      
      // Calculate total area covered from survey reports
      const areaCovered = reports.reduce((sum, report) => {
        const area = report.areaCovered ? parseFloat(report.areaCovered) : 0;
        return sum + area;
      }, 0);
      
      res.status(200).json({
        activeMissions,
        availableDrones,
        completedSurveys,
        areaCovered: areaCovered.toFixed(1)
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
  });
  
  // Drones API
  app.get('/api/drones', async (req: Request, res: Response) => {
    try {
      const drones = await storage.getDrones();
      res.status(200).json(drones);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch drones' });
    }
  });
  
  app.get('/api/drones/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const drone = await storage.getDrone(id);
      
      if (!drone) {
        return res.status(404).json({ error: 'Drone not found' });
      }
      
      res.status(200).json(drone);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch drone' });
    }
  });
  
  app.post('/api/drones', async (req: Request, res: Response) => {
    try {
      const validatedData = insertDroneSchema.parse(req.body);
      const drone = await storage.createDrone(validatedData);
      res.status(201).json(drone);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: 'Failed to create drone' });
    }
  });
  
  app.patch('/api/drones/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const drone = await storage.getDrone(id);
      
      if (!drone) {
        return res.status(404).json({ error: 'Drone not found' });
      }
      
      const updatedDrone = await storage.updateDrone(id, req.body);
      res.status(200).json(updatedDrone);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update drone' });
    }
  });
  
  // Locations API
  app.get('/api/locations', async (req: Request, res: Response) => {
    try {
      const locations = await storage.getLocations();
      res.status(200).json(locations);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch locations' });
    }
  });
  
  app.get('/api/locations/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const location = await storage.getLocation(id);
      
      if (!location) {
        return res.status(404).json({ error: 'Location not found' });
      }
      
      res.status(200).json(location);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch location' });
    }
  });
  
  app.post('/api/locations', async (req: Request, res: Response) => {
    try {
      const validatedData = insertLocationSchema.parse(req.body);
      const location = await storage.createLocation(validatedData);
      res.status(201).json(location);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: 'Failed to create location' });
    }
  });
  
  // Missions API
  app.get('/api/missions', async (req: Request, res: Response) => {
    try {
      // Filter by status if provided
      const status = req.query.status as string | undefined;
      
      let missions;
      if (status) {
        missions = await storage.getMissionsByStatus(status);
      } else {
        missions = await storage.getMissions();
      }
      
      res.status(200).json(missions);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch missions' });
    }
  });
  
  app.get('/api/missions/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const mission = await storage.getMission(id);
      
      if (!mission) {
        return res.status(404).json({ error: 'Mission not found' });
      }
      
      res.status(200).json(mission);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch mission' });
    }
  });
  
  app.post('/api/missions', async (req: Request, res: Response) => {
    try {
      const validatedData = insertMissionSchema.parse(req.body);
      const mission = await storage.createMission(validatedData);
      res.status(201).json(mission);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: 'Failed to create mission' });
    }
  });
  
  app.patch('/api/missions/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const mission = await storage.getMission(id);
      
      if (!mission) {
        return res.status(404).json({ error: 'Mission not found' });
      }
      
      // Handle mission control actions
      if (req.body.action) {
        const { action } = req.body;
        
        // Update mission based on action
        if (action === 'start' && mission.status === 'scheduled') {
          req.body.status = 'in-progress';
          req.body.startTime = new Date();
          delete req.body.action;
        } else if (action === 'pause' && mission.status === 'in-progress') {
          req.body.status = 'paused';
          delete req.body.action;
        } else if (action === 'resume' && mission.status === 'paused') {
          req.body.status = 'in-progress';
          delete req.body.action;
        } else if (action === 'abort') {
          req.body.status = 'aborted';
          req.body.endTime = new Date();
          delete req.body.action;
        } else if (action === 'complete') {
          req.body.status = 'completed';
          req.body.endTime = new Date();
          req.body.completionPercentage = 100;
          delete req.body.action;
        }
      }
      
      const updatedMission = await storage.updateMission(id, req.body);
      res.status(200).json(updatedMission);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update mission' });
    }
  });
  
  // Survey Reports API
  app.get('/api/survey-reports', async (req: Request, res: Response) => {
    try {
      const missionId = req.query.missionId ? parseInt(req.query.missionId as string) : undefined;
      
      let reports;
      if (missionId) {
        reports = await storage.getSurveyReportsByMission(missionId);
      } else {
        reports = await storage.getSurveyReports();
      }
      
      res.status(200).json(reports);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch survey reports' });
    }
  });
  
  app.get('/api/survey-reports/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const report = await storage.getSurveyReport(id);
      
      if (!report) {
        return res.status(404).json({ error: 'Survey report not found' });
      }
      
      res.status(200).json(report);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch survey report' });
    }
  });
  
  app.post('/api/survey-reports', async (req: Request, res: Response) => {
    try {
      const validatedData = insertSurveyReportSchema.parse(req.body);
      const report = await storage.createSurveyReport(validatedData);
      
      // Update the associated mission to completed
      const mission = await storage.getMission(report.missionId);
      if (mission) {
        await storage.updateMission(mission.id, {
          status: 'completed',
          endTime: new Date(),
          completionPercentage: 100
        });
      }
      
      res.status(201).json(report);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: 'Failed to create survey report' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
