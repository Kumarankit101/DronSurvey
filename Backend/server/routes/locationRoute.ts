import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from '../database/storage.ts';
import { z } from "zod";
import {
  insertLocationSchema,
} from "@shared/schema.ts";

export async function locationRoutes(app: Express): Promise<Server> {



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
      // console.log("req.body", req.body)
      const validatedData = insertLocationSchema.parse(req.body);
      // console.log("validatedData", validatedData)

      const location = await storage.createLocation(validatedData);
      console.log("validatedData", location)

      res.status(201).json(location);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: 'Failed to create location' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
