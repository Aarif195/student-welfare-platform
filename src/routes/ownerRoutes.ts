import { Router } from "express";
import {
    ownerRegisterValidation,
    ownerLoginValidation,
    validateResult
} from "../middlewares/validation";
import { authenticate, authorize } from "../middlewares/authMiddleware";


import { ownerRegisterController , ownerLoginController} from "../controllers/ownerControllers/ownerAuthController";
import { getMyHostelsController, getSingleHostelController , createHostelController, updateHostelController, deleteHostelController} from "../controllers/ownerControllers/ownerHostelController";
import { getOwnerProfileController, updateOwnerProfileController } from "../controllers/ownerControllers/ownerProfileController";


const router = Router();

// Auth
router.post("/register", ownerRegisterValidation, validateResult, ownerRegisterController);
router.post("/login", ownerLoginValidation, validateResult, ownerLoginController);

// Profile
router.get("/profile", authenticate, authorize(["owner"]), getOwnerProfileController);
router.get("/profileupdate", authenticate, authorize(["owner"]), updateOwnerProfileController);

// Hostel Management
router.get("/hostels", authenticate, authorize(["owner"]), getMyHostelsController);
router.get("/hostels/:hostelId", authenticate, authorize(["owner"]), getSingleHostelController);

router.post("/hostels", authenticate, authorize(["owner"]), createHostelController);
router.put("/hostels/:hostelId", authenticate, authorize(["owner"]), updateHostelController);
router.delete("/hostels/:hostelId", authenticate, authorize(["owner"]), deleteHostelController);

export default router;
