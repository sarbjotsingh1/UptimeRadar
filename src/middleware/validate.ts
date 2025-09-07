import { NextFunction, Request, Response } from "express";
import { ZodError, ZodSchema } from "zod";

export const validate =
  (schema: ZodSchema, property: "body" | "params" | "query" = "body") =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req[property]);

      // Attach parsed data to req.validated
      (req as any).validated = (req as any).validated || {};
      (req as any).validated[property] = parsed;

      return next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({
          error: "Validation failed",
          issues: err.issues.map((e) => ({
            path: e.path,
            message: e.message,
          })),

        });
      }
      return next(err);
    }
  };
