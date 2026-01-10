import { Router } from "express";
import { upload } from "../utils/multer";
import { validateResult } from "../middlewares/validateResult";
import {
  studentRegisterValidation,
  studentLoginValidation,
  paramIdValidation,
  bookingValidation,
  updateProfileValidation,
  guestLogValidation
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
  bookRoomController,
  getMyBookingsController,
  cancelBookingController,
  getAllAvailableHostelsController,
  getAvailableRoomsController,
} from "../controllers/studentController/studentBookingController";

import { registerGuest } from "../controllers/studentController/studentRegisterGuest";

const router = Router();
console.log("studentRoutes loaded");


// Auth
router.post(
  "/register",
  upload.single("profile_image"),
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

// log guess
router.post(
  "/log-guest",
  authenticate,
  authorize(["student"]),
  guestLogValidation,
  validateResult,
  registerGuest
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
router.get(
  "/available-hostels",
  authenticate,
  authorize(["student"]),
  getAllAvailableHostelsController
);

// rooms
router.get(
  "/rooms",
  authenticate,
  authorize(["student"]),
  getAvailableRoomsController
);


// Bookings
router.get(
  "/my-bookings",
  authenticate,
  authorize(["student"]),
  getMyBookingsController
);

router.post(
  "/bookings",
  authenticate,
  authorize(["student"]),
  bookingValidation,
  validateResult,
  bookRoomController
);

router.patch(
  "/bookings/:bookingId/cancel",
  authenticate,
  authorize(["student"]),
  paramIdValidation("bookingId"),
  validateResult,
  cancelBookingController
);

export default router;
