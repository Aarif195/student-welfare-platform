import { Router } from "express";

import { authenticate } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/roleMiddleware";

import { paramIdValidation } from "../middlewares/validation";
import { validateResult } from "../middlewares/validateResult";

import {
  createNotificationController,
  deleteNotificationController,
  getGlobalNotificationsController,
  getHostelNotificationsController,
} from "../controllers/notificationControllers/notificationControllers";


const router = Router();

// CREATE (superadmin / Owner)
router.post(
  "/hostels/:hostelId",
  authenticate,
  authorize(["superadmin", "owner"]),
  paramIdValidation("hostelId"),
  validateResult,
  createNotificationController
);

// CREATE (superadmin /)
router.post(
  "/admin/global",
  authenticate,
  authorize(["superadmin"]),
  createNotificationController
);

// DELETE
router.delete(
  "/:notificationId",
  authenticate,
  authorize(["superadmin", "owner"]),
  paramIdValidation("notificationId"),
  validateResult,
  deleteNotificationController
);

// READ – Global notifications
router.get(
  "/admin/global-notifications",
  authenticate,
  authorize(["superadmin", "owner", "student"]),
  getGlobalNotificationsController
);

// READ GET all notifications for a specific hostel
router.get(
  "/hostel/:hostelId",
  authenticate,
  authorize(["owner", "superadmin", "student"]),
  paramIdValidation("hostelId"),
  validateResult,
  getHostelNotificationsController
);

export default router;
