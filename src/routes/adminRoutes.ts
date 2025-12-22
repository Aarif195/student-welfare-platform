import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/roleMiddleware";

import { paramIdValidation , adminLoginValidation} from "../middlewares/validation";
import { validateResult } from "../middlewares/validateResult";

import { adminLoginController } from "../controllers/adminControllers/adminAuthController";
import {
  getAllStudentsController,
  getAllOwnersController,
  getAllHostelsController,
  deleteStudentController,
  deleteOwnerController,
  approveHostelController,
  rejectHostelController,
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
  authorize(["admin"]),
  getAllStudentsController
);
router.get(
  "/owners",
  authenticate,
  authorize(["admin"]),
  getAllOwnersController
);
router.get(
  "/hostels",
  authenticate,
  authorize(["admin"]),
  getAllHostelsController
);

// Actions
router.delete(
  "/students/:studentId",
  authenticate,
  authorize(["admin"]),
  paramIdValidation("studentId"),
  validateResult,
  deleteStudentController
);
router.delete(
  "/owners/:ownerId",
  authenticate,
  authorize(["admin"]),
  paramIdValidation("ownerId"),
  validateResult,
  deleteOwnerController
);

router.post(
  "/hostels/:hostelId/approve",
  authenticate,
  authorize(["admin"]),
  paramIdValidation("hostelId"),
  validateResult,
  approveHostelController
);
router.post(
  "/hostels/:hostelId/reject",
  authenticate,
  authorize(["admin"]),
  paramIdValidation("hostelId"),
  validateResult,
  rejectHostelController
);

export default router;
