import { verifyOTPController } from "../controllers/verifyOTPController/verifyOTPController";
import { Router } from "express";

const router = Router();


router.post("/verify-otp", verifyOTPController);

export default router;
