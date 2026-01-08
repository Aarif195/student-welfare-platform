"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const roleMiddleware_1 = require("../middlewares/roleMiddleware");
const validation_1 = require("../middlewares/validation");
const validateResult_1 = require("../middlewares/validateResult");
const notificationControllers_1 = require("../controllers/notificationControllers/notificationControllers");
const router = (0, express_1.Router)();
// CREATE (superadmin / Owner)
router.post("/hostels/:hostelId", authMiddleware_1.authenticate, (0, roleMiddleware_1.authorize)(["superadmin", "owner"]), (0, validation_1.paramIdValidation)("hostelId"), validateResult_1.validateResult, notificationControllers_1.createNotificationController);
// CREATE (superadmin /)
router.post("/admin/global", authMiddleware_1.authenticate, (0, roleMiddleware_1.authorize)(["superadmin"]), notificationControllers_1.createNotificationController);
// DELETE
router.delete("/:notificationId", authMiddleware_1.authenticate, (0, roleMiddleware_1.authorize)(["superadmin", "owner"]), (0, validation_1.paramIdValidation)("notificationId"), validateResult_1.validateResult, notificationControllers_1.deleteNotificationController);
// READ – Global notifications
router.get("/admin/global-notifications", authMiddleware_1.authenticate, (0, roleMiddleware_1.authorize)(["superadmin", "owner", "student"]), notificationControllers_1.getGlobalNotificationsController);
// READ GET all notifications for a specific hostel
router.get("/hostel/:hostelId", authMiddleware_1.authenticate, (0, roleMiddleware_1.authorize)(["owner", "superadmin", "student"]), (0, validation_1.paramIdValidation)("hostelId"), validateResult_1.validateResult, notificationControllers_1.getHostelNotificationsController);
exports.default = router;
