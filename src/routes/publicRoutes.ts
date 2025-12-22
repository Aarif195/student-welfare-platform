import { Router } from "express";

import { validateResult } from "../middlewares/validateResult";
import { paramIdValidation } from "../middlewares/validation";

import {
  getAllHostelsPublicController,
  getSingleHostelPublicController,
  searchHostelsController,
} from "../controllers/publicControllers/publicHostelController";

const router = Router();

// Public - Hostels
router.get("/hostels", getAllHostelsPublicController);

router.get(
  "/hostels/:hostelId", 
  paramIdValidation('hostelId'), 
  validateResult, 
  getSingleHostelPublicController
);

// Public - Search
router.get(
  "/search", 
  //  searchValidation
  validateResult, 
  searchHostelsController
);

export default router;
