import { Router } from "express";
import {
  createAlertController,
  updateAlertController,
  deleteAlertController,
  getGlobalAlertsController,
  getHostelAlertsController,
} from "../controllers/alertControllers/alertControllers";

import { authenticate } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/roleMiddleware";

import { paramIdValidation } from "../middlewares/validation";
import { validateResult } from "../middlewares/validateResult";

const router = Router();


// CREATE (Admin / Owner)
router.post(
  "/hostels/:hostelId/alerts",
  authenticate,
  authorize(["superadmin", "owner"]),
  paramIdValidation("hostelId"),
  validateResult,
  createAlertController
);

router.post(
  "/global",
  authenticate,
  authorize(["superadmin"]),
  createAlertController
);

// UPDATE
// router.put(
//   "/:alertId",
//   authenticate,
//   authorize(["superadmin", "owner"]),
//   updateAlertController
// );

// DELETE
// router.delete(
//   "/:alertId",
//   authenticate,
//   authorize(["superadmin", "owner"]),
//   deleteAlertController
// );

// READ – Global alerts
// router.get(
//   "/",
//   authenticate,
//   getGlobalAlertsController
// );

// GET all alerts for a specific hostel
router.get(
  "/hostel/:hostelId",
  authenticate,
  authorize(["owner", "superadmin", "student"]),
  paramIdValidation("hostelId"),
  validateResult,
  getHostelAlertsController
);

export default router;
