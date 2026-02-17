import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = "Rori123"; 
export interface AuthRequest extends Request {
  user?: {
    id: number;
    role: string;
  };
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(403).send("No token provided");

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(403).send("No token provided");

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; role: string };
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).send("Invalid token");
  }
};

export const authorizeRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(403).send("Unauthorized");

    if (!roles.includes(req.user.role)) {
      return res.status(403).send("Forbidden: Insufficient role");
    }

    next();
  };
};
