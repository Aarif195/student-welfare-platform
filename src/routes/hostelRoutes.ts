import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/roleMiddleware";

import {
  paramIdValidation,
  reviewValidation, replyReviewValidation
} from "../middlewares/validation";
import { validateResult } from "../middlewares/validateResult";


import {
  getAllHostelsController,
  searchHostelsController,
} from "../controllers/hostelControllers/hostelPublicController";

import { createStudentReviewController, getHostelReviewsController, replyToReviewController } from "../controllers/hostelControllers/hostelReviewController";

const router = Router();

// Public
router.get("/", getAllHostelsController);
router.get("/search", searchHostelsController);



// Reviews
router.get(
  "/:hostelId/reviews",
  authenticate,
  authorize(["student", "owner", "superadmin"]),
  paramIdValidation("hostelId"),
  validateResult,
  getHostelReviewsController
);

router.post(
  "/:hostelId/reviews",
  authenticate,
  authorize(["student"]),
  paramIdValidation("hostelId"),
  reviewValidation,
  validateResult,
  createStudentReviewController
);

router.patch(
  "/reviews/:reviewId/reply",
  authenticate,
  authorize(["superadmin", "owner"]),
  paramIdValidation("reviewId"),
  replyReviewValidation,
  validateResult,
  replyToReviewController
);

export default router;
