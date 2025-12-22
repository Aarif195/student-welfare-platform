import { Response } from "express";
import crypto from "crypto";


export const sendError = (res: Response, msg: string, status = 400) => {
  res.status(status).json({ error: msg });
};


export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}