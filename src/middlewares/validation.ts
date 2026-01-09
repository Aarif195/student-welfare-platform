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
    .withMessage("Phone is required")
    .matches(/^\+?\d{7,15}$/)
    .withMessage("Phone must be a valid number with or without country code"),
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
    .withMessage("Phone is required")
    .matches(/^\+?\d{7,15}$/)
    .withMessage("Phone must be a valid number with or without country code"),
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
export const bookingValidation = [
  body("room_id").notEmpty().withMessage("Room ID is required"),
  body("reference").notEmpty().withMessage("Payment reference is required"),
];

// REVIEW VALIDATION
export const reviewValidation = [
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

// replyReviewValidation
export const replyReviewValidation = [
  body("reply").notEmpty().withMessage("Reply text is required"),
];

// PARAM VALIDATION
export const paramIdValidation = (paramName: string) => [
  param(paramName).isInt().withMessage(`${paramName} must be an integer`),
];

// adminLoginValidation
export const adminLoginValidation = [
  body("email").isEmail().withMessage("Valid admin email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

// creating validation
// createHostelValidation
export const createHostelValidation = [
  body("name").notEmpty().trim().withMessage("Hostel name is required"),
  body("location").notEmpty().withMessage("Address is required"),
  body("description")
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters"),
];

// createRoomValidation
export const createRoomValidation = [
  body("room_number").notEmpty().withMessage("Room number is required"),
  body("capacity").isNumeric().withMessage("Capacity must be a number"),
  body("price").isNumeric().withMessage("Price must be a number"),
];

// updateProfileValidation
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
  body("phone")
    .optional()
    .matches(/^\+?\d{7,15}$/)
    .withMessage("Phone must be a valid number with or without country code"),
];

// validateMaintenance
export const validateMaintenance = [
  body("issue_type").notEmpty().withMessage("Issue type is required"),
  body("description")
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters"),
];

// updateValidateMaintenance
export const updateValidateMaintenance = [
  body("status")
    .isIn(["pending", "in-progress", "resolved"])
    .withMessage("Invalid status"),
  body("owner_notes").optional().isString(),
  body("assigned_to").optional().isString(),
];

// guestLogValidation
export const guestLogValidation = [
  body("guest_name").notEmpty().withMessage("Guest name is required").trim(),
  body("guest_phone")
    .matches(/^[0-9+]{10,15}$/)
    .withMessage("Valid phone number required"),
  body("visit_purpose")
    .notEmpty()
    .withMessage("Purpose of visit is required")
    .trim(),
  body("expected_duration")
    .notEmpty()
    .withMessage('Duration is required (e.g., "2 hours" or "1 day")'),
];

export const validateAvailableSeats = (value: number, req: Request) => {
  if (value > req.body.total_seats) {
    throw new Error("Available seats cannot exceed total seats");
  }
  return true;
};

// studySpaceValidation
export const studySpaceValidation = [
  body("name").notEmpty().withMessage("Study space name is required"),

  body("location").notEmpty().withMessage("Location is required"),

  body("total_capacity")
    .isInt({ min: 1 })
    .withMessage("Total capacity must be at least 1"),

  body("available_slots")
    .isInt({ min: 0 })
    .withMessage("Available slots cannot be negative")

    .custom((value: number, { req }: { req: Request }) =>
      validateAvailableSeats(value, req as Request)
    ),

  body("status")
    .isIn(["open", "closed", "full"])
    .withMessage("Status must be open, closed, or full"),
  body("opening_time")
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage("Invalid opening time (HH:MM)"),
  body("closing_time")
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage("Invalid closing time (HH:MM)"),
];

export const validateAvailableSlots = (
  value: number,
  req: Request
): boolean => {
  const total = req.body.total_capacity;

  if (total !== undefined && value > total) {
    throw new Error("Available slots cannot exceed total capacity");
  }

  return true;
};

// studySpaceUpdateValidation
export const studySpaceUpdateValidation = [
  body("total_capacity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Total capacity must be at least 1"),

  body("available_slots")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Available slots cannot be negative")
    .custom((value: number, { req }: { req: Request }) =>
      validateAvailableSlots(value, req)
    ),

  body("status").optional().isIn(["open", "closed", "full"]),

  body("opening_time")
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/),

  body("closing_time")
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/),
];

// validateForgotPassword
export const validateForgotPassword = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
];

// validateVerifyOTP
export const validateVerifyOTP = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
  body("otp_code")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be exactly 6 digits"),
];

// validateResetPassword
export const validateResetPassword = [
  body("email")
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),
  body("otp_code")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be exactly 6 digits"),
  body("newPassword")
    .isLength({ min: 8 })
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/
    )
    .withMessage(
      "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character"
    ),
];
