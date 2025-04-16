import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from '../database/storage.ts';

export async function dashboardRoutes(app: Express): Promise<Server> {
  // API Routes
  app.get('/api/dashboard/stats', async (req: Request, res: Response) => {
    try {
      const drones = await storage.getDrones();
      const missions = await storage.getMissions();
      const reports = await storage.getSurveyReports();

      const activeMissions = missions.filter((m: { status: string }) => m.status === 'in-progress').length;
      const availableDrones = drones.filter((d: { status: string }) => d.status === 'available').length;
      const completedSurveys = missions.filter((m: { status: string }) => m.status === 'completed').length;

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

  const httpServer = createServer(app);
  return httpServer;
}
