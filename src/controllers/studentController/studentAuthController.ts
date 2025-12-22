import { Request, Response } from "express";

export const registerStudentController = async (
  req: Request,
  res: Response
) => {
  // logic will be added later
  return res.status(501).json({ message: "Register student not implemented yet" });
};

export const loginStudentController = async (
  req: Request,
  res: Response
) => {
  // logic will be added later
  return res.status(501).json({ message: "Login student not implemented yet" });
};
