import { Request, Response, NextFunction } from "express";
import { ApiError } from "./errors";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack || err);
  const status = err instanceof ApiError ? err.status : 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ success: false, message });
};
