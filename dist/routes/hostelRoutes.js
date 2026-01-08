"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const roleMiddleware_1 = require("../middlewares/roleMiddleware");
const validation_1 = require("../middlewares/validation");
const validateResult_1 = require("../middlewares/validateResult");
const hostelPublicController_1 = require("../controllers/hostelControllers/hostelPublicController");
const hostelReviewController_1 = require("../controllers/hostelControllers/hostelReviewController");
const router = (0, express_1.Router)();
// Public
router.get("/", hostelPublicController_1.getAllHostelsController);
router.get("/search", hostelPublicController_1.searchHostelsController);
// Reviews
router.get("/:hostelId/reviews", authMiddleware_1.authenticate, (0, roleMiddleware_1.authorize)(["student", "owner", "superadmin"]), (0, validation_1.paramIdValidation)("hostelId"), validateResult_1.validateResult, hostelReviewController_1.getHostelReviewsController);
router.post("/:hostelId/reviews", authMiddleware_1.authenticate, (0, roleMiddleware_1.authorize)(["student"]), (0, validation_1.paramIdValidation)("hostelId"), validation_1.reviewValidation, validateResult_1.validateResult, hostelReviewController_1.createStudentReviewController);
router.patch("/reviews/:reviewId/reply", authMiddleware_1.authenticate, (0, roleMiddleware_1.authorize)(["superadmin", "owner"]), (0, validation_1.paramIdValidation)("reviewId"), validation_1.replyReviewValidation, validateResult_1.validateResult, hostelReviewController_1.replyToReviewController);
exports.default = router;
