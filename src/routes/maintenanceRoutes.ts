import { Router } from "express";

import {
  createMaintenanceRequest,
  getMaintenanceRequests,
  updateMaintenanceStatus,
  getStudentMaintenanceRequests,
  getStudentNotifications,
  markNotificationAsRead,
} from "../controllers/maintenanceControllers/maintenanceControllers";
import { authenticate } from "../middlewares/authMiddleware";
import {
  validateMaintenance,
  updateValidateMaintenance,
} from "../middlewares/validation";
import { validateResult } from "../middlewares/validateResult";
import { authorize } from "../middlewares/roleMiddleware";
import { upload } from "../utils/multer";

const router = Router();

router.post(
  "/create",
  authenticate,
  authorize(["student"]),
  upload.single("image"),
  validateMaintenance,
  validateResult,
  createMaintenanceRequest
);

router.get(
  "/all",
  authenticate,
  authorize(["owner", "superadmin"]),
  getMaintenanceRequests
);

router.get(
  "/my-requests",
  authenticate,
  authorize(["student"]),
  getStudentMaintenanceRequests
);

router.get(
  "/notifications/my-requests",
  authenticate,
  authorize(["student"]),
  getStudentNotifications
);

router.patch(
  "/update/:id",
  authenticate,
  authorize(["owner", "superadmin"]),
  updateValidateMaintenance,
  validateResult,
  updateMaintenanceStatus
);

router.patch(
  "/notifications/:id/read",
  authenticate,
  authorize(["student"]),
  markNotificationAsRead
);

export default router;
