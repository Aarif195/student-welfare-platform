const { body, param, CustomValidator } = require("express-validator");
import { Request } from "express";

import dotenv from "dotenv";

dotenv.config();

// STUDENT VALIDATION
export const studentRegisterValidation = [
  body("full_name").notEmpty().withMessage("Full name is required"),
  body("email").isEmail().withMessage("Invalid email"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/\d/)
    .withMessage("Password must contain a number")
    .matches(/[A-Za-z]/)
    .withMessage("Password must contain a letter"),
  body("phone").optional().isNumeric().withMessage("Phone must be numeric"),
  body("address").optional().isString(),
];

export const studentLoginValidation = [
  body("email").isEmail().withMessage("Invalid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

// HOSTEL OWNER VALIDATION
export const ownerRegisterValidation = [
  body("full_name").notEmpty().withMessage("Full name is required"),
  body("email").isEmail().withMessage("Invalid email"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/\d/)
    .withMessage("Password must contain a number")
    .matches(/[A-Za-z]/)
    .withMessage("Password must contain a letter"),
  body("phone")
    .notEmpty()
    .isNumeric()
    .withMessage("Phone is required and must be numeric"),
  body("company_name").notEmpty().withMessage("Company name is required"),
];

export const ownerLoginValidation = [
  body("email").isEmail().withMessage("Invalid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

// BOOKING VALIDATION
const endDateValidator = (value: string, { req }: { req: Request }) => {
  if (new Date(value) <= new Date(req.body.start_date)) {
    throw new Error("End date must be after start date");
  }
  return true;
};

export const bookingValidation = [
  
  body("hostel_id").notEmpty().withMessage("Hostel ID is required"),
  body("room_id").notEmpty().withMessage("Room ID is required"),
  body("start_date").isISO8601().withMessage("Start date must be a valid date"),
  body("end_date")
    .isISO8601()
    .withMessage("End date must be a valid date")
    .custom(endDateValidator),
];

// REVIEW VALIDATION
export const reviewValidation = [
 
  body("hostel_id").notEmpty().withMessage("Hostel ID is required"),
  body("rating")
    .notEmpty()
    .withMessage("Rating is required")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  body("comment")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Comment max 500 characters"),
];

// PARAM VALIDATION
export const paramIdValidation = (paramName: string) => [
  param(paramName).isInt().withMessage(`${paramName} must be an integer`),
];



export const adminLoginValidation = [
  body("email").isEmail().withMessage("Valid admin email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

export const createHostelValidation = [
  body("name").notEmpty().trim().withMessage("Hostel name is required"),
  body("address").notEmpty().withMessage("Address is required"),
  body("description").isLength({ min: 10 }).withMessage("Description must be at least 10 characters"),
];

export const createRoomValidation = [
  body("roomNumber").notEmpty().withMessage("Room number is required"),
  body("type").isIn(["single", "shared"]).withMessage("Type must be single or shared"),
  body("price").isNumeric().withMessage("Price must be a number"),
];


export const updateProfileValidation = [
  body("firstName").optional().trim().notEmpty().withMessage("First name cannot be empty"),
  body("lastName").optional().trim().notEmpty().withMessage("Last name cannot be empty"),
  body("phoneNumber").optional().isMobilePhone("any").withMessage("Invalid phone number"),
];