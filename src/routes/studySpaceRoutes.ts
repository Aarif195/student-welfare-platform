import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/roleMiddleware";
import { validateResult } from "../middlewares/validateResult";
import {
  paramIdValidation,
  studySpaceValidation,
} from "../middlewares/validation";

import {
  createStudySpaceController,
  updateStudySpaceController,
  deleteStudySpaceController,
  getAllStudySpacesController,
  getSingleStudySpaceController,
} from "../controllers/study-space/studySpaceControllers";

const router = Router();

router.post(
  "/create",
  authenticate,
  authorize(["superadmin"]),
  studySpaceValidation,
  validateResult,
  createStudySpaceController
);

router.patch(
  "/:id",
  authenticate,
  authorize(["superadmin"]),
  
  updateStudySpaceController
);

router.delete(
  "/:id",
  authenticate,
  authorize(["superadmin"]),
  paramIdValidation("id"),
  validateResult,
  deleteStudySpaceController
);

router.get(
  "/",
  authenticate,
  authorize(["student", "owner", "superadmin"]),
  paramIdValidation("id"),
  validateResult,
  getAllStudySpacesController
);

router.get(
  "/:id",
  authenticate,
  authorize(["student", "owner", "superadmin"]),
  paramIdValidation("id"),
  validateResult,
  getSingleStudySpaceController
);

export default router;
