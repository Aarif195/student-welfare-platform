import { Router } from "express";
import { upload } from "../utils/multer";
import { validateResult } from "../middlewares/validateResult";
import {
  studentRegisterValidation,
  studentLoginValidation,
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
  bookRoomController,
  cancelBookingController,
  getAllAvailableHostelsController,
  getAvailableRoomsController,
} from "../controllers/studentController/studentBookingController";

const router = Router();

// Auth
router.post(
  "/register",
   upload.single("profile_image"),
  studentRegisterValidation,
  validateResult,
  registerStudentController
);

// router.post(
//   "/register",
//   upload.single("profile_image"),
//   registerStudentController
// );

// router.post(
//   "/rooms",
//   authenticate,
//   authorize(["owner"]),
//   upload.array("images", 5),
//   createRoomController
// );

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
