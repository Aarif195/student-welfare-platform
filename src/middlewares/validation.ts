const { body, param } = require("express-validator");
import { Request } from "express";

import dotenv from "dotenv";

dotenv.config();

// STUDENT VALIDATION
export const studentRegisterValidation = [
  body("firstName").notEmpty().withMessage("First name is required"),
  body("lastName").notEmpty().withMessage("Last name is required"),
  body("email").isEmail().withMessage("Invalid email"),
  body("password")
    .isLength({ min: 8 })
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/
    )
    .withMessage(
      "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character"
    ),
  body("phone")
    .notEmpty()
    .isNumeric()
    .withMessage("Phone is required and must be numeric"),
  body("address").optional().isString(),
];

export const studentLoginValidation = [
  body("email")
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage("Invalid email format")
    .isLength({ max: 100 })
    .withMessage("Email is too long"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ max: 50 })
    .withMessage("Password is too long"),
];

// HOSTEL OWNER VALIDATION
export const ownerRegisterValidation = [
  body("firstName").notEmpty().withMessage("First name is required"),
  body("lastName").notEmpty().withMessage("Last name is required"),
  body("email").isEmail().withMessage("Invalid email"),
  body("password")
    .isLength({ min: 8 })
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/
    )
    .matches(/[A-Za-z]/)
    .withMessage(
      "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character"
    ),
  body("phone")
    .notEmpty()
    .isNumeric()
    .withMessage("Phone is required and must be numeric"),
 
];

export const ownerLoginValidation = [
  body("email")
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage("Invalid email format")
    .isLength({ max: 100 })
    .withMessage("Email is too long"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ max: 50 })
    .withMessage("Password is too long"),
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

// creating validation
export const createHostelValidation = [
  body("name").notEmpty().trim().withMessage("Hostel name is required"),
  body("location").notEmpty().withMessage("Address is required"),
  body("description")
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters"),
    
];

export const createRoomValidation = [
  body("room_number").notEmpty().withMessage("Room number is required"),
  body("capacity").isNumeric().withMessage("Capacity must be a number"),
  body("price_per_month").isNumeric().withMessage("Price must be a number"),
];

export const updateProfileValidation = [
  body("firstName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("First name cannot be empty"),
  body("lastName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Last name cannot be empty"),
  body("phoneNumber")
    .optional()
    .isMobilePhone("any")
    .withMessage("Invalid phone number"),
];
