"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateResetPassword = exports.validateVerifyOTP = exports.validateForgotPassword = exports.studySpaceUpdateValidation = exports.validateAvailableSlots = exports.studySpaceValidation = exports.validateAvailableSeats = exports.guestLogValidation = exports.updateValidateMaintenance = exports.validateMaintenance = exports.updateProfileValidation = exports.createRoomValidation = exports.createHostelValidation = exports.adminLoginValidation = exports.paramIdValidation = exports.replyReviewValidation = exports.reviewValidation = exports.bookingValidation = exports.ownerLoginValidation = exports.ownerRegisterValidation = exports.studentLoginValidation = exports.studentRegisterValidation = void 0;
const { body, param } = require("express-validator");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// STUDENT VALIDATION
exports.studentRegisterValidation = [
    body("firstName").notEmpty().withMessage("First name is required"),
    body("lastName").notEmpty().withMessage("Last name is required"),
    body("email").isEmail().withMessage("Invalid email"),
    body("password")
        .isLength({ min: 8 })
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/)
        .withMessage("Password must be at least 8 characters long and include uppercase, lowercase, number, and special character"),
    body("phone")
        .notEmpty()
        .withMessage("Phone is required")
        .matches(/^\+?\d{7,15}$/)
        .withMessage("Phone must be a valid number with or without country code"),
    body("address").optional().isString(),
];
exports.studentLoginValidation = [
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
exports.ownerRegisterValidation = [
    body("firstName").notEmpty().withMessage("First name is required"),
    body("lastName").notEmpty().withMessage("Last name is required"),
    body("email").isEmail().withMessage("Invalid email"),
    body("password")
        .isLength({ min: 8 })
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/)
        .matches(/[A-Za-z]/)
        .withMessage("Password must be at least 8 characters long and include uppercase, lowercase, number, and special character"),
    body("phone")
        .notEmpty()
        .withMessage("Phone is required")
        .matches(/^\+?\d{7,15}$/)
        .withMessage("Phone must be a valid number with or without country code"),
];
exports.ownerLoginValidation = [
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
const endDateValidator = (value, { req }) => {
    if (new Date(value) <= new Date(req.body.start_date)) {
        throw new Error("End date must be after start date");
    }
    return true;
};
exports.bookingValidation = [
    body("room_id").notEmpty().withMessage("Room ID is required"),
    body("reference").notEmpty().withMessage("Payment reference is required"),
    body("start_date").isISO8601().withMessage("Start date must be a valid date"),
    body("end_date")
        .isISO8601()
        .withMessage("End date must be a valid date")
        .custom(endDateValidator),
];
// REVIEW VALIDATION
exports.reviewValidation = [
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
exports.replyReviewValidation = [
    body("reply").notEmpty().withMessage("Reply text is required"),
];
// PARAM VALIDATION
const paramIdValidation = (paramName) => [
    param(paramName).isInt().withMessage(`${paramName} must be an integer`),
];
exports.paramIdValidation = paramIdValidation;
// adminLoginValidation
exports.adminLoginValidation = [
    body("email").isEmail().withMessage("Valid admin email is required"),
    body("password").notEmpty().withMessage("Password is required"),
];
// creating validation
// createHostelValidation
exports.createHostelValidation = [
    body("name").notEmpty().trim().withMessage("Hostel name is required"),
    body("location").notEmpty().withMessage("Address is required"),
    body("description")
        .isLength({ min: 10 })
        .withMessage("Description must be at least 10 characters"),
];
// createRoomValidation
exports.createRoomValidation = [
    body("room_number").notEmpty().withMessage("Room number is required"),
    body("capacity").isNumeric().withMessage("Capacity must be a number"),
    body("price").isNumeric().withMessage("Price must be a number"),
];
// updateProfileValidation
exports.updateProfileValidation = [
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
exports.validateMaintenance = [
    body("issue_type").notEmpty().withMessage("Issue type is required"),
    body("description")
        .isLength({ min: 10 })
        .withMessage("Description must be at least 10 characters"),
];
// updateValidateMaintenance
exports.updateValidateMaintenance = [
    body("status")
        .isIn(["pending", "in-progress", "resolved"])
        .withMessage("Invalid status"),
    body("owner_notes").optional().isString(),
    body("assigned_to").optional().isString(),
];
// guestLogValidation
exports.guestLogValidation = [
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
const validateAvailableSeats = (value, req) => {
    if (value > req.body.total_seats) {
        throw new Error("Available seats cannot exceed total seats");
    }
    return true;
};
exports.validateAvailableSeats = validateAvailableSeats;
// studySpaceValidation
exports.studySpaceValidation = [
    body("name").notEmpty().withMessage("Study space name is required"),
    body("location").notEmpty().withMessage("Location is required"),
    body("total_capacity")
        .isInt({ min: 1 })
        .withMessage("Total capacity must be at least 1"),
    body("available_slots")
        .isInt({ min: 0 })
        .withMessage("Available slots cannot be negative")
        .custom((value, { req }) => (0, exports.validateAvailableSeats)(value, req)),
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
const validateAvailableSlots = (value, req) => {
    const total = req.body.total_capacity;
    if (total !== undefined && value > total) {
        throw new Error("Available slots cannot exceed total capacity");
    }
    return true;
};
exports.validateAvailableSlots = validateAvailableSlots;
// studySpaceUpdateValidation
exports.studySpaceUpdateValidation = [
    body("total_capacity")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Total capacity must be at least 1"),
    body("available_slots")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Available slots cannot be negative")
        .custom((value, { req }) => (0, exports.validateAvailableSlots)(value, req)),
    body("status").optional().isIn(["open", "closed", "full"]),
    body("opening_time")
        .optional()
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/),
    body("closing_time")
        .optional()
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/),
];
// validateForgotPassword
exports.validateForgotPassword = [
    body("email")
        .isEmail()
        .withMessage("Please provide a valid email address")
        .normalizeEmail(),
];
// validateVerifyOTP
exports.validateVerifyOTP = [
    body("email")
        .isEmail()
        .withMessage("Please provide a valid email address")
        .normalizeEmail(),
    body("otp_code")
        .isLength({ min: 6, max: 6 })
        .withMessage("OTP must be exactly 6 digits"),
];
// validateResetPassword
exports.validateResetPassword = [
    body("email")
        .isEmail()
        .withMessage("Valid email is required")
        .normalizeEmail(),
    ,
    body("otp_code")
        .isLength({ min: 6, max: 6 })
        .withMessage("OTP must be exactly 6 digits"),
    body("newPassword")
        .isLength({ min: 8 })
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/)
        .withMessage("Password must be at least 8 characters long and include uppercase, lowercase, number, and special character"),
];
