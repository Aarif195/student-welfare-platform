import { Router } from "express";
import { resendOTPController } from "../controllers/resendOTPController/resendOTPController";

const router = Router();


router.post("/resend-otp", resendOTPController);

export default router;
