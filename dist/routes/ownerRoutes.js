"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = require("../utils/multer");
const validation_1 = require("../middlewares/validation");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const roleMiddleware_1 = require("../middlewares/roleMiddleware");
const validateResult_1 = require("../middlewares/validateResult");
const validation_2 = require("../middlewares/validation");
const ownerAuthController_1 = require("../controllers/ownerControllers/ownerAuthController");
const ownerHostelController_1 = require("../controllers/ownerControllers/ownerHostelController");
const ownerProfileController_1 = require("../controllers/ownerControllers/ownerProfileController");
const studentRegisterGuest_1 = require("../controllers/studentController/studentRegisterGuest");
const router = (0, express_1.Router)();
// Auth
router.post("/register", validation_1.ownerRegisterValidation, validateResult_1.validateResult, ownerAuthController_1.ownerRegisterController);
router.post("/login", validation_1.ownerLoginValidation, validateResult_1.validateResult, ownerAuthController_1.ownerLoginController);
// Profile
router.get("/profile", authMiddleware_1.authenticate, (0, roleMiddleware_1.authorize)(["owner"]), ownerProfileController_1.getOwnerProfileController);
router.put("/profile", authMiddleware_1.authenticate, (0, roleMiddleware_1.authorize)(["owner"]), validation_2.updateProfileValidation, validateResult_1.validateResult, ownerProfileController_1.updateOwnerProfileController);
// Hostel Management
router.get("/hostels", authMiddleware_1.authenticate, (0, roleMiddleware_1.authorize)(["owner"]), ownerHostelController_1.getMyHostelsController);
router.get("/hostels/:hostelId", authMiddleware_1.authenticate, (0, roleMiddleware_1.authorize)(["owner"]), (0, validation_2.paramIdValidation)("hostelId"), validateResult_1.validateResult, ownerHostelController_1.getSingleHostelController);
router.get("/hostels/:hostelId/rooms/:roomId", authMiddleware_1.authenticate, (0, roleMiddleware_1.authorize)(["owner"]), (0, validation_2.paramIdValidation)("hostelId"), (0, validation_2.paramIdValidation)("roomId"), validateResult_1.validateResult, ownerHostelController_1.getSingleRoomController);
router.get("/hostels/:hostelId/rooms", authMiddleware_1.authenticate, (0, roleMiddleware_1.authorize)(["owner"]), (0, validation_2.paramIdValidation)("hostelId"), validateResult_1.validateResult, ownerHostelController_1.getRoomsByHostelController);
router.post("/hostels", authMiddleware_1.authenticate, (0, roleMiddleware_1.authorize)(["owner"]), validation_2.createHostelValidation, validateResult_1.validateResult, ownerHostelController_1.createHostelController);
router.post("/:hostelId/rooms", authMiddleware_1.authenticate, (0, roleMiddleware_1.authorize)(["owner"]), multer_1.upload.array("images", 5), validation_2.createRoomValidation, validateResult_1.validateResult, ownerHostelController_1.createRoomController);
router.put("/hostels/:hostelId", authMiddleware_1.authenticate, (0, roleMiddleware_1.authorize)(["owner"]), (0, validation_2.paramIdValidation)("hostelId"), validation_2.createHostelValidation, validateResult_1.validateResult, ownerHostelController_1.updateHostelController);
router.put("/hostels/:hostelId/rooms/:roomId", authMiddleware_1.authenticate, (0, roleMiddleware_1.authorize)(["owner"]), (0, validation_2.paramIdValidation)("hostelId"), (0, validation_2.paramIdValidation)("roomId"), validateResult_1.validateResult, ownerHostelController_1.updateRoomController);
router.delete("/hostels/:hostelId", authMiddleware_1.authenticate, (0, roleMiddleware_1.authorize)(["owner"]), (0, validation_2.paramIdValidation)("hostelId"), validateResult_1.validateResult, ownerHostelController_1.deleteHostelController);
router.delete("/hostels/:hostelId/rooms/:roomId", authMiddleware_1.authenticate, (0, roleMiddleware_1.authorize)(["owner"]), (0, validation_2.paramIdValidation)("hostelId"), (0, validation_2.paramIdValidation)("roomId"), validateResult_1.validateResult, ownerHostelController_1.deleteRoomController);
// get student bookings
router.get("/students/bookings", authMiddleware_1.authenticate, (0, roleMiddleware_1.authorize)(["owner"]), ownerHostelController_1.getOwnerBookingsController);
router.get("/guest-logs", authMiddleware_1.authenticate, (0, roleMiddleware_1.authorize)(["owner"]), studentRegisterGuest_1.getOwnerGuestLogs);
exports.default = router;
