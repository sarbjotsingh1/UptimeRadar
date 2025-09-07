import { Router } from "express";
import { getChecks,getEndpointChecks,getEndpointStats,getLatestStatus } from "../controllers/checkController.js";

const router = Router();

// GET /checks?endpointId=abc123
router.get("/", getChecks);
router.get("/:id", getEndpointChecks);
router.get("/:id/stats", getEndpointStats);
router.get("/latest/status", getLatestStatus); 

export default router;
