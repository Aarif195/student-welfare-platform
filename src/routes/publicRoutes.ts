import { Router } from "express";

import {
  getAllHostelsPublicController,
  getSingleHostelPublicController,
  searchHostelsController,
} from "../controllers/publicControllers/publicHostelController";

const router = Router();

// Public - Hostels
router.get("/hostels", getAllHostelsPublicController);
router.get("/hostels/:hostelId", getSingleHostelPublicController);

// Public - Search
router.get("/search", searchHostelsController);

export default router;
