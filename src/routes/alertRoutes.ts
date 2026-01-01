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

const router = Router();



// CREATE (Admin / Owner)
router.post(
  "/",
  authenticate,
  authorize(["admin", "owner"]),
  createAlertController
);

// UPDATE
router.put(
  "/:alertId",
  authenticate,
  authorize(["admin", "owner"]),
  updateAlertController
);

// DELETE
router.delete(
  "/:alertId",
  authenticate,
  authorize(["admin", "owner"]),
  deleteAlertController
);

// READ – Global alerts
router.get(
  "/",
  authenticate,
  getGlobalAlertsController
);

// READ – Hostel-specific alerts
router.get(
  "/hostels/:hostelId",
  authenticate,
  getHostelAlertsController
);

export default router;
