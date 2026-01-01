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


// POST /alerts/null

// POST /alerts/12


// UPDATE
// router.put(
//   "/:alertId",
//   authenticate,
//   authorize(["admin", "owner"]),
//   updateAlertController
// );

// DELETE
// router.delete(
//   "/:alertId",
//   authenticate,
//   authorize(["admin", "owner"]),
//   deleteAlertController
// );

// READ – Global alerts
// router.get(
//   "/",
//   authenticate,
//   getGlobalAlertsController
// );

// READ – Hostel-specific alerts
// router.get(
//   "/hostels/:hostelId",
//   authenticate,
//   getHostelAlertsController
// );

export default router;
