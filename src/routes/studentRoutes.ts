import { Router } from "express";

import { validateResult } from "../middlewares/validateResult";
import {
  studentRegisterValidation,
  studentLoginValidation,
  reviewValidation,
  paramIdValidation,
  bookingValidation,
  updateProfileValidation,
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
  getMyBookingsController,
  getStudentBookingByIdController,
  bookRoomController,
  cancelBookingController,
  getAllAvailableHostelsController,
  getAvailableRoomsController,
} from "../controllers/studentController/studentBookingController";


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
  updateProfileValidation,
  validateResult,
  updateStudentProfileController
);

// Hostels Checking
router.get("/available-hostels", getAllAvailableHostelsController);

// rooms
router.get("/rooms", getAvailableRoomsController);

// Bookings
router.get(
  "/my-bookings",
  authenticate,
  authorize(["student"]),
  getMyBookingsController
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



export default router;
