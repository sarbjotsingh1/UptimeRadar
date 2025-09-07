import express from "express";
import prisma from "./prisma.js";
import { errorHandler } from "./middleware/errorHandler.js";
import endpointRoutes from "./routes/endpointRoutes.js";
import checkRoutes from "./routes/checkRoutes.js"
import { initMonitoring } from "./services/monitorService.js";

const app = express();
app.use(express.json());

// Health check
app.get("/", (_req, res) => res.send("Uptime Radar API running 🚀"));

// Endpoint CRUD routes
app.use("/endpoints", endpointRoutes);
app.use("/checks", checkRoutes);
app.use(errorHandler);
app.listen(4000, () =>
  console.log("Server running at http://localhost:4000 🚀")
);

initMonitoring();

