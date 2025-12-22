import { Router } from "express";
import { authenticate, authorize } from "../middlewares/authMiddleware";


import { getAllHostelsController , getSingleHostelPublicController, searchHostelsController } from "../controllers/hostelControllers/hostelPublicController";
import { bookHostelController , cancelBookingController} from "../controllers/hostelControllers/hostelBookingController";
import { getHostelReviewsController , createReviewController} from "../controllers/studentController/studentReviewController";


const router = Router();

// Public
router.get("/", getAllHostelsController);
router.get("/search", searchHostelsController);
router.get("/:hostelId", getSingleHostelPublicController);

// Student Booking
router.post("/:hostelId/book", authenticate, authorize(["student"]), bookHostelController);
router.delete("/:bookingId/cancel", authenticate, authorize(["student"]), cancelBookingController);

// Reviews
router.get("/:hostelId/reviews", getHostelReviewsController);
router.post("/:hostelId/reviews", authenticate, authorize(["student"]), createReviewController);

export default router;
