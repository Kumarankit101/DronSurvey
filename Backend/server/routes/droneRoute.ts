import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from '../database/storage.ts';
import { z } from "zod";
import {
  insertDroneSchema,
} from "@shared/schema.ts";

export async function droneRoutes(app: Express): Promise<Server> {

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

  const httpServer = createServer(app);
  return httpServer;
}
