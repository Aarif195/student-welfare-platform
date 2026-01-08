"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = require("../utils/multer");
const validateResult_1 = require("../middlewares/validateResult");
const validation_1 = require("../middlewares/validation");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const roleMiddleware_1 = require("../middlewares/roleMiddleware");
const studentAuthController_1 = require("../controllers/studentController/studentAuthController");
const studentProfileController_1 = require("../controllers/studentController/studentProfileController");
const studentBookingController_1 = require("../controllers/studentController/studentBookingController");
const studentRegisterGuest_1 = require("../controllers/studentController/studentRegisterGuest");
const router = (0, express_1.Router)();
// Auth
router.post("/register", multer_1.upload.single("profile_image"), validation_1.studentRegisterValidation, validateResult_1.validateResult, studentAuthController_1.registerStudentController);
router.post("/login", validation_1.studentLoginValidation, validateResult_1.validateResult, studentAuthController_1.loginStudentController);
// log guess
router.post("/log-guest", authMiddleware_1.authenticate, (0, roleMiddleware_1.authorize)(["student"]), validation_1.guestLogValidation, validateResult_1.validateResult, studentRegisterGuest_1.registerGuest);
// Profile
router.get("/profile", authMiddleware_1.authenticate, (0, roleMiddleware_1.authorize)(["student"]), studentProfileController_1.getStudentProfileController);
router.put("/profile", authMiddleware_1.authenticate, (0, roleMiddleware_1.authorize)(["student"]), validation_1.updateProfileValidation, validateResult_1.validateResult, studentProfileController_1.updateStudentProfileController);
// Hostels Checking
router.get("/available-hostels", authMiddleware_1.authenticate, (0, roleMiddleware_1.authorize)(["student"]), studentBookingController_1.getAllAvailableHostelsController);
// rooms
router.get("/rooms", authMiddleware_1.authenticate, (0, roleMiddleware_1.authorize)(["student"]), studentBookingController_1.getAvailableRoomsController);
// Bookings
router.get("/my-bookings", authMiddleware_1.authenticate, (0, roleMiddleware_1.authorize)(["student"]), studentBookingController_1.getMyBookingsController);
router.post("/bookings", authMiddleware_1.authenticate, (0, roleMiddleware_1.authorize)(["student"]), validation_1.bookingValidation, validateResult_1.validateResult, studentBookingController_1.bookRoomController);
router.patch("/bookings/:bookingId/cancel", authMiddleware_1.authenticate, (0, roleMiddleware_1.authorize)(["student"]), (0, validation_1.paramIdValidation)("bookingId"), validateResult_1.validateResult, studentBookingController_1.cancelBookingController);
exports.default = router;
