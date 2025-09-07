import { Request, Response } from "express";
import { scheduleEndpoint } from "../services/monitorService.js";
import { updateEndpointSchedule, stopEndpointSchedule } from "../services/monitorService.js";
import prisma from "../prisma.js";

// Create endpoint
export const createEndpoint = async (req: Request, res: Response) => {
  try {
    const { name, url, intervalSec, isActive } = req.body;

    if (!name || !url) {
      return res.status(400).json({ error: "Name and URL are required" });
    }

    const endpoint = await prisma.endpoint.create({
      data: { name, url, intervalSec: intervalSec || 60, isActive: isActive || true },
    });
    scheduleEndpoint(endpoint);
    res.status(201).json(endpoint);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create endpoint" });
  }
};

// Get all endpoints
export const getEndpoints = async (_req: Request, res: Response) => {
  try {
    const endpoints = await prisma.endpoint.findMany();
    res.json(endpoints);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch endpoints" });
  }
};

// Get one endpoint by ID
export const getEndpoint = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const endpoint = await prisma.endpoint.findUnique({ where: { id } });

    if (!endpoint) {
      return res.status(404).json({ error: "Endpoint not found" });
    }

    res.json(endpoint);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch endpoint" });
  }
};

// Update endpoint
export const updateEndpoint = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, url, intervalSec, isActive } = req.body;

    const endpoint = await prisma.endpoint.update({
      where: { id },
      data: { name, url, intervalSec, isActive },
    });
    if (endpoint.isActive) {
      updateEndpointSchedule(endpoint.id);
    } else {
      stopEndpointSchedule(endpoint.id);
    }

    res.json(endpoint);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update endpoint" });
  }
};

// Delete endpoint

export const deleteEndpoint = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Stop monitoring first
    stopEndpointSchedule(id);

    // Delete all related endpoint checks
    await prisma.endpointCheck.deleteMany({ where: { endpointId: id } });

    // Delete endpoint
    await prisma.endpoint.delete({ where: { id } });

    res.json({ message: "Endpoint and its checks deleted successfully" });
  } catch (err) {
    console.error("Delete endpoint error:", err);
    res.status(500).json({ error: "Failed to delete endpoint" });
  }
};
