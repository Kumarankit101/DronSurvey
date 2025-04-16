import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from '../database/storage.ts';
import { z } from "zod";
import {

  insertSurveyReportSchema
} from "@shared/schema.ts";

export async function surveyRoutes(app: Express): Promise<Server> {
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
