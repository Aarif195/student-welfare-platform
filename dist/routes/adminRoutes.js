"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const roleMiddleware_1 = require("../middlewares/roleMiddleware");
const validation_1 = require("../middlewares/validation");
const validateResult_1 = require("../middlewares/validateResult");
const adminAuthController_1 = require("../controllers/adminControllers/adminAuthController");
const adminManagementController_1 = require("../controllers/adminControllers/adminManagementController");
const router = (0, express_1.Router)();
// Auth
router.post("/login", validation_1.adminLoginValidation, validateResult_1.validateResult, adminAuthController_1.adminLoginController);
// Management
router.get("/students", authMiddleware_1.authenticate, (0, roleMiddleware_1.authorize)(["superadmin"]), adminManagementController_1.getAllStudentsController);
router.get("/owners", authMiddleware_1.authenticate, (0, roleMiddleware_1.authorize)(["superadmin"]), adminManagementController_1.getAllOwnersController);
router.get("/hostels", authMiddleware_1.authenticate, (0, roleMiddleware_1.authorize)(["superadmin"]), adminManagementController_1.getAllHostelsController);
router.get("/users", authMiddleware_1.authenticate, (0, roleMiddleware_1.authorize)(["superadmin"]), adminManagementController_1.getAllUsersController);
// get pending bookings
router.get("/bookings/pending", authMiddleware_1.authenticate, (0, roleMiddleware_1.authorize)(["superadmin"]), adminManagementController_1.getAdminPendingBookingsController);
// Actions
router.patch("/bookings/:bookingId/approve", authMiddleware_1.authenticate, (0, roleMiddleware_1.authorize)(["superadmin"]), (0, validation_1.paramIdValidation)("bookingId"), validateResult_1.validateResult, adminManagementController_1.approveBookingController);
router.delete("/students/:studentId", authMiddleware_1.authenticate, (0, roleMiddleware_1.authorize)(["superadmin"]), (0, validation_1.paramIdValidation)("studentId"), validateResult_1.validateResult, adminManagementController_1.deleteStudentController);
router.delete("/owners/:ownerId", authMiddleware_1.authenticate, (0, roleMiddleware_1.authorize)(["superadmin"]), (0, validation_1.paramIdValidation)("ownerId"), validateResult_1.validateResult, adminManagementController_1.deleteOwnerController);
router.patch("/hostels/:hostelId/approve", authMiddleware_1.authenticate, (0, roleMiddleware_1.authorize)(["superadmin"]), (0, validation_1.paramIdValidation)("hostelId"), validateResult_1.validateResult, adminManagementController_1.approveHostelController);
router.patch("/hostels/:hostelId/reject", authMiddleware_1.authenticate, (0, roleMiddleware_1.authorize)(["superadmin"]), (0, validation_1.paramIdValidation)("hostelId"), validateResult_1.validateResult, adminManagementController_1.rejectHostelController);
router.patch("/bookings/:bookingId/reject", authMiddleware_1.authenticate, (0, roleMiddleware_1.authorize)(["superadmin"]), adminManagementController_1.rejectBookingController);
exports.default = router;
