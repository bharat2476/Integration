import type { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

const HEADER = "x-correlation-id";

export function correlationMiddleware(req: Request, res: Response, next: NextFunction): void {
  const incoming = req.header(HEADER);
  const correlationId = incoming && incoming.length > 0 ? incoming : uuidv4();
  req.correlationId = correlationId;
  res.setHeader(HEADER, correlationId);
  next();
}

declare global {
  namespace Express {
    interface Request {
      correlationId: string;
      tenantId?: string;
    }
  }
}
