import { Request, Response } from "express";
import prisma from "../prisma.js";

// Get all checks (optionally filtered by endpointId)
export const getChecks = async (req: Request, res: Response) => {
  try {
    const { endpointId } = req.query;

    const where = endpointId ? { endpointId: endpointId as string } : {};

    const checks = await prisma.endpointCheck.findMany({
      where,
      orderBy: { createdAt: "desc" }, // newest first
    });

    res.json(checks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch checks" });
  }
};

// Get all checks for an endpoint
export const getEndpointChecks = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { from, to } = req.query;

    const where: any = { endpointId: id };

    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from as string);
      if (to) where.createdAt.lte = new Date(to as string);
    }

    const checks = await prisma.endpointCheck.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    res.json(checks);
  } catch (err) {
    console.error("Fetch endpoint checks error:", err);
    res.status(500).json({ error: "Failed to fetch endpoint checks" });
  }
};

// Get aggregated stats for an endpoint
export const getEndpointStats = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { period } = req.query; // e.g., "7d", "24h"

    let fromDate: Date | undefined;

    if (period === "7d") fromDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    else if (period === "24h") fromDate = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const where: any = { endpointId: id };
    if (fromDate) where.createdAt = { gte: fromDate };

    const checks = await prisma.endpointCheck.findMany({ where });

    const total = checks.length;
    const up = checks.filter((c) => c.status === "UP").length;
    const down = checks.filter((c) => c.status === "DOWN").length;
    const avgResponseMs =
      checks.reduce((acc, c) => acc + (c.responseMs || 0), 0) /
      (total || 1);

    res.json({ total, up, down, avgResponseMs });
  } catch (err) {
    console.error("Fetch endpoint stats error:", err);
    res.status(500).json({ error: "Failed to fetch endpoint stats" });
  }
};

export const getLatestStatus = async (_req: Request, res: Response) => {
  try {
    // Fetch all endpoints
    const endpoints = await prisma.endpoint.findMany({
      where: { isActive: true }, // only active endpoints
      select: { id: true, name: true, url: true, intervalSec: true },
    });

    // For each endpoint, fetch latest check
    const latestChecks = await Promise.all(
      endpoints.map(async (ep) => {
        const latest = await prisma.endpointCheck.findFirst({
          where: { endpointId: ep.id },
          orderBy: { createdAt: "desc" },
        });

        return {
          id: ep.id,
          name: ep.name,
          url: ep.url,
          intervalSec: ep.intervalSec,
          lastStatus: latest?.status || "UNKNOWN",
          lastResponseMs: latest?.responseMs || null,
          lastCheckedAt: latest?.createdAt || null,
        };
      })
    );

    res.json(latestChecks);
  } catch (err) {
    console.error("Fetch latest status error:", err);
    res.status(500).json({ error: "Failed to fetch latest status" });
  }
};



