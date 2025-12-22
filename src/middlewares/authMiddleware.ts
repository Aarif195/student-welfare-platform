import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Use the interface to avoid 'any'
export interface AuthRequest extends Request {
  user?: {
    id: number;
    role: 'student' | 'owner' | 'admin';
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ message: "Unauthorized" });

  const parts = authHeader.trim().split(/\s+/);
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ message: "Invalid Token Format" });
  }

  const token = parts[1];

  try {
  
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: number; role: any };
    
    req.user = decoded; 
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or Expired Token" });
  }
};