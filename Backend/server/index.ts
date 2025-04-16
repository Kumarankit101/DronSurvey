import express, { type Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
// import { registerRoutes } from "./routes.ts";
import { dashboardRoutes } from "./routes/dashboardRoute.ts";
import { locationRoutes } from "./routes/locationRoute.ts";
import { missionRoutes } from "./routes/missionRoute.ts";
import { surveyRoutes } from "./routes/surveyRoute.ts";
import { droneRoutes } from "./routes/droneRoute.ts";
import { storage } from "./database/storage.ts";
import { DatabaseStorage } from "./database/database-storage.js";
import { authenticateJWT } from "./middleware/auth.js";
import authRoutes from "./routes/auth.js";
import dotenv from "dotenv";
import { createServer } from "http";
import cors from "cors"; // Import the cors package


dotenv.config();
const app = express();
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL  // Use environment variable in production
    : 'http://localhost:5138',  // Development URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Add all needed HTTP methods
  maxAge: 86400,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Cookie parser middleware
app.use(cookieParser());
// Authentication middleware - will attach user to req if authenticated
app.use(authenticateJWT);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Register auth routes
app.use('/api/auth', authRoutes);
// app.use("/", (req, res) => {
//   res.send("Hello World!");
// });

(async () => {
  // Seed initial data if we're using a database
  if (storage instanceof DatabaseStorage) {
    try {
      await (storage as DatabaseStorage).seedInitialData();
      console.log("Database seeded successfully");
    } catch (error) {
      console.log(`Error seeding database: ${error}`);
    }
  }

  const server = createServer(app);
  // await registerRoutes(app);
  await droneRoutes(app);
  await dashboardRoutes(app);
  await locationRoutes(app);
  await missionRoutes(app);
  await surveyRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  console.log("Registering routes...");
  const port = 3000;
  server.listen({
    port,
    host: "0.0.0.0",
  }, () => {
    console.log(`API server running on port ${port}`);
  });
})();
