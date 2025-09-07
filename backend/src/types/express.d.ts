import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      // validated.body, validated.params, validated.query
      validated?: {
        body?: any;
        params?: any;
        query?: any;
      };
    }
  }
}

export {};
