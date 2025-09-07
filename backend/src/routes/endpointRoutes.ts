import { Router } from "express";
import {
  createEndpoint,
  getEndpoints,
  getEndpoint,
  updateEndpoint,
  deleteEndpoint,
} from "../controllers/endpointController.js"

const router = Router();

router.post("/", createEndpoint);
router.get("/", getEndpoints);
router.get("/:id", getEndpoint);
router.put("/:id", updateEndpoint);
router.delete("/:id", deleteEndpoint);

export default router;
