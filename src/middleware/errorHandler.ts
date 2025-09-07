import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Validation failed",
      issues: err.issues.map((issue) => ({
        path: issue.path,
        message: issue.message,
      })),
    });
  }

  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal Server Error" });
};
