import { Router } from "express";

import { createMaintenanceRequest, getMaintenanceRequests , updateMaintenanceStatus} from "../controllers/maintenanceControllers/maintenanceControllers";
import { authenticate } from "../middlewares/authMiddleware";
import { validateMaintenance, updateValidateMaintenance } from "../middlewares/validation";
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

router.patch(
  "/update/:id",
  authenticate,
  authorize(["owner", "superadmin"]),
  updateValidateMaintenance,
  validateResult,
  updateMaintenanceStatus
);

export default router;

// feat: add maintenance status update logic for owner and superadmin