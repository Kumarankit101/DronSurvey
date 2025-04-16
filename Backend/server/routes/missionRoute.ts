import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from '../database/storage.ts';
import { z } from "zod";
import {
  insertMissionSchema,
} from "@shared/schema.ts";

export async function missionRoutes(app: Express): Promise<Server> {

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
      // Convert scheduledTime string to Date object if it exists
      if (req.body.scheduledTime) {
        req.body.scheduledTime = new Date(req.body.scheduledTime);
      }

      // console.log("Request body:", JSON.stringify(req.body, null, 2));

      const validatedData = insertMissionSchema.parse(req.body);
      // console.log("Validated data:", JSON.stringify(validatedData, null, 2));

      const mission = await storage.createMission(validatedData);
      // console.log("Created mission:", JSON.stringify(mission, null, 2));
      res.status(201).json(mission);
    } catch (error) {
      console.error("Mission creation error:", error);
      if (error instanceof z.ZodError) {
        const validationErrors = error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message,
          code: err.code
        }));
        console.error("Validation errors:", JSON.stringify(validationErrors, null, 2));
        return res.status(400).json({ errors: validationErrors });
      }
      console.error("Unexpected error during mission creation:", error);
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


  const httpServer = createServer(app);
  return httpServer;
}
