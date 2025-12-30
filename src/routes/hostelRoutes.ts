import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/roleMiddleware";

import {
  paramIdValidation,
  reviewValidation,
} from "../middlewares/validation";

import { validateResult } from "../middlewares/validateResult";



import {
  getAllHostelsController,
  getSingleHostelPublicController,
  searchHostelsController,
} from "../controllers/hostelControllers/hostelPublicController";
import {
  bookHostelController,
  cancelBookingController,
} from "../controllers/hostelControllers/hostelBookingController";

import { createStudentReviewController, getHostelReviewsController } from "../controllers/hostelControllers/hostelReviewController";

const router = Router();

// Public
router.get("/", getAllHostelsController);
router.get("/search", searchHostelsController);

router.get("/:hostelId", getSingleHostelPublicController);


// Reviews
router.get(
  "/:hostelId/reviews",
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

export default router;
