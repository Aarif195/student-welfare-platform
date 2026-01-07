import { Router } from "express";
import { resendOTPController } from "../controllers/otpManagement/resendOTPController";
import { verifyOTPController } from "../controllers/otpManagement/verifyOTPController";
import { forgotPasswordController } from "../controllers/otpManagement/forgotPassword";
import { resetPasswordController } from "../controllers/otpManagement/resetPasswordController";

import { validateResult } from "../middlewares/validateResult";
import {
  validateForgotPassword,
  validateResetPassword,
  validateVerifyOTP,
} from "../middlewares/validation";

import { googleLogin } from "../controllers/notificationControllers/googleAuthController";

const router = Router();

router.post(
  "/resend-otp",
  validateForgotPassword,
  validateResult,
  resendOTPController
);
router.post(
  "/verify-otp",
  validateVerifyOTP,
  validateResult,
  verifyOTPController
);

router.post(
  "/forgot-password",
  validateForgotPassword,
  validateResult,
  forgotPasswordController
);

router.post(
  "/reset-password",
  validateResetPassword,
  validateResult,
  resetPasswordController
);

router.post("/google-login", googleLogin);

export default router;
