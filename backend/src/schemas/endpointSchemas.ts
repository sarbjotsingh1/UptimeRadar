import { z } from "zod";

/**
 * Helpers:
 * - preprocess used to coerce string->number or string->boolean if client sends strings.
 * - defaults applied so missing values still work.
 */

// Coerce numeric string to number and apply min/max
const intervalNumber = z.preprocess((val) => {
  if (typeof val === "string" && val.trim() !== "") return Number(val);
  return val;
}, z.number().int().min(10).max(86400).default(60));

// Coerce boolean-like strings to boolean
const booleanCoerce = z.preprocess((val) => {
  if (val === "true" || val === "1" || val === 1) return true;
  if (val === "false" || val === "0" || val === 0) return false;
  return val;
}, z.boolean().default(true));

export const createEndpointSchema = z.object({
  name: z.string().min(2, "Name should be at least 2 characters"),
  url: z.string().url("Must be a valid URL"),
  intervalSec: intervalNumber,
  isActive: booleanCoerce.optional(),
});

export const updateEndpointSchema = createEndpointSchema.partial(); // all fields optional for update

// Param schema (e.g. /endpoints/:id)
export const endpointIdParamSchema = z.object({
  id: z.string().cuid(), // use cuid if that's what Prisma uses; else use z.string().min(...)
});

// Query schema for checks filtering
export const checksQuerySchema = z.object({
  from: z.string().optional(), // ISO date string; we'll parse client-side if needed
  to: z.string().optional(),
});
