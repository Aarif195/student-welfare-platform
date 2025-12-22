import { Router } from "express";

import { validateResult } from "../middleware/validateResult";

import {
  studentRegisterValidation,
  studentLoginValidation,
  reviewValidation,
  paramIdValidation,
  bookingValidation,
} from "../middlewares/validation";
import { authenticate } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/roleMiddleware";

import {
  registerStudentController,
  loginStudentController,
} from "../controllers/studentController/studentAuthController";
import {
  getStudentProfileController,
  updateStudentProfileController,
} from "../controllers/studentController/studentProfileController";
import {
  getStudentBookingsController,
  getStudentBookingByIdController,
  bookRoomController,
  cancelBookingController,
} from "../controllers/studentController/studentBookingController";
import {
  createStudentReviewController,
  getHostelReviewsController,
} from "../controllers/studentController/studentReviewController";

const router = Router();

// Auth
router.post(
  "/register",
  studentRegisterValidation,
  validateResult,
  registerStudentController
);
router.post(
  "/login",
  studentLoginValidation,
  validateResult,
  loginStudentController
);

// Profile
router.get(
  "/profile",
  authenticate,
  authorize(["student"]),
  getStudentProfileController
);
router.put(
  "/profile",
  authenticate,
  authorize(["student"]),
  updateStudentProfileController
);

// Bookings
router.get(
  "/bookings",
  authenticate,
  authorize(["student"]),
  getStudentBookingsController
);
router.get(
  "/bookings/:id",
  authenticate,
  authorize(["student"]),
  paramIdValidation("id"),
  validateResult,
  getStudentBookingByIdController
);
router.post(
  "/bookings",
  authenticate,
  authorize(["student"]),
  bookingValidation,
  validateResult,
  bookRoomController
);
router.delete(
  "/bookings/:id",
  authenticate,
  authorize(["student"]),
  paramIdValidation("id"),
  validateResult,
  cancelBookingController
);

// Reviews
router.post(
  "/reviews",
  authenticate,
  authorize(["student"]),
  reviewValidation,
  validateResult,
  createStudentReviewController
);
router.get(
  "/reviews/:hostelId",
  paramIdValidation("hostelId"),
  validateResult,
  getHostelReviewsController
); // public

export default router;
