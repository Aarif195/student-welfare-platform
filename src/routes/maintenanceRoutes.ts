import { Router } from "express";

import { createMaintenanceRequest } from "../controllers/maintenanceControllers/maintenanceControllers";
import { authenticate } from "../middlewares/authMiddleware";
import { validateMaintenance } from "../middlewares/validation";
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

export default router;