import { Router } from "express";
import {
  ownerRegisterValidation,
  ownerLoginValidation,
} from "../middlewares/validation";
import { authenticate } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/roleMiddleware";
import { validateResult } from "../middlewares/validateResult";
import {
  paramIdValidation,
  createRoomValidation,
  createHostelValidation, updateProfileValidation
} from "../middlewares/validation";

import {
  ownerRegisterController,
  ownerLoginController,
} from "../controllers/ownerControllers/ownerAuthController";
import {
  getMyHostelsController,
  getSingleHostelController,
  createHostelController,
  updateHostelController, updateRoomController,
  deleteHostelController,
  createRoomController,
} from "../controllers/ownerControllers/ownerHostelController";
import {
  getOwnerProfileController,
  updateOwnerProfileController,
} from "../controllers/ownerControllers/ownerProfileController";

const router = Router();

// Auth
router.post(
  "/register",
  ownerRegisterValidation,
  validateResult,
  ownerRegisterController
);
router.post(
  "/login",
  ownerLoginValidation,
  validateResult,
  ownerLoginController
);

// Profile
router.get(
  "/profile",
  authenticate,
  authorize(["owner"]),
  getOwnerProfileController
);
router.put(
  "/profile",
  authenticate,
  authorize(["owner"]),
  updateProfileValidation,
  validateResult,
  updateOwnerProfileController
);

// Hostel Management
router.get(
  "/hostels",
  authenticate,
  authorize(["owner"]),
  getMyHostelsController
);

router.get(
  "/hostels/:hostelId",
  authenticate,
  authorize(["owner"]),
  paramIdValidation("hostelId"),
  validateResult,
  getSingleHostelController
);

router.post(
  "/hostels",
  authenticate,
  authorize(["owner"]),
  createHostelValidation,
  validateResult,
  createHostelController
);

router.post(
  "/rooms",
  authenticate,
  authorize(["owner"]),
  createRoomValidation,
  validateResult,
  createRoomController
);

router.put(
  "/hostels/:hostelId",
  authenticate,
  authorize(["owner"]),
  paramIdValidation("hostelId"),
  createHostelValidation,
  validateResult,
  updateHostelController
);

router.put(
  "/rooms/:roomId",
  authenticate,
  authorize(["owner"]),
  paramIdValidation('roomId'),
  createRoomValidation, 
  validateResult,
  updateRoomController
);


router.delete(
  "/hostels/:hostelId",
  authenticate,
  authorize(["owner"]),
  paramIdValidation("hostelId"), // This is sufficient
  validateResult,
  deleteHostelController
);


export default router;
