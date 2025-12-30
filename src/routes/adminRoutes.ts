import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/roleMiddleware";

import {
  paramIdValidation,
  adminLoginValidation,
} from "../middlewares/validation";
import { validateResult } from "../middlewares/validateResult";

import { adminLoginController } from "../controllers/adminControllers/adminAuthController";
import {
  approveBookingController,
  getAllStudentsController,
  getAllOwnersController,
  getAllHostelsController,
  deleteStudentController,
  deleteOwnerController,
  approveHostelController,
  rejectHostelController,
  getAllUsersController,
  getAdminPendingBookingsController,rejectBookingController
} from "../controllers/adminControllers/adminManagementController";

const router = Router();

// Auth
router.post(
  "/login",
  adminLoginValidation,
  validateResult,
  adminLoginController
);

// Management
router.get(
  "/students",
  authenticate,
  authorize(["superadmin"]),
  getAllStudentsController
);

router.get(
  "/owners",
  authenticate,
  authorize(["superadmin"]),
  getAllOwnersController
);
router.get(
  "/hostels",
  authenticate,
  authorize(["superadmin"]),
  getAllHostelsController
);

router.get(
  "/users",
  authenticate,
  authorize(["superadmin"]),
  getAllUsersController
);

// get pending bookings
router.get(
  "/bookings/pending",
  authenticate,
  authorize(["superadmin"]),
  getAdminPendingBookingsController
);

// Actions
router.patch(
  "/bookings/:bookingId/approve",
  authenticate,
  authorize(["superadmin"]),
  paramIdValidation("bookingId"),
  validateResult,
  approveBookingController
);

router.delete(
  "/students/:studentId",
  authenticate,
  authorize(["superadmin"]),
  paramIdValidation("studentId"),
  validateResult,
  deleteStudentController
);

router.delete(
  "/owners/:ownerId",
  authenticate,
  authorize(["superadmin"]),
  paramIdValidation("ownerId"),
  validateResult,
  deleteOwnerController
);

router.patch(
  "/hostels/:hostelId/approve",
  authenticate,
  authorize(["superadmin"]),
  paramIdValidation("hostelId"),
  validateResult,
  approveHostelController
);

router.patch(
  "/hostels/:hostelId/reject",
  authenticate,
  authorize(["superadmin"]),
  paramIdValidation("hostelId"),
  validateResult,
  rejectHostelController
);

router.patch(
  "/bookings/:bookingId/reject",
  authenticate,
  authorize(["superadmin"]),
  rejectBookingController
);

export default router;
