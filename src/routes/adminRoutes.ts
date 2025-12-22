import { Router } from "express";
import { authenticate, authorize } from "../middlewares/authMiddleware";

import { adminLoginController } from "../controllers/adminControllers/adminAuthController";
import { getAllStudentsController, getAllOwnersController, getAllHostelsController, deleteStudentController, deleteOwnerController, approveHostelController , rejectHostelController} from "../controllers/adminControllers/adminManagementController";

const router = Router();

// Auth
router.post("/login", adminLoginController);

// Management
router.get("/students", authenticate, authorize(["admin"]), getAllStudentsController);
router.get("/owners", authenticate, authorize(["admin"]), getAllOwnersController);
router.get("/hostels", authenticate, authorize(["admin"]), getAllHostelsController);

// Actions
router.delete("/students/:studentId", authenticate, authorize(["admin"]), deleteStudentController);
router.delete("/owners/:ownerId", authenticate, authorize(["admin"]), deleteOwnerController);

router.post("/hostels/:hostelId/approve", authenticate, authorize(["admin"]), approveHostelController);
router.post("/hostels/:hostelId/reject", authenticate, authorize(["admin"]), rejectHostelController);

export default router;
