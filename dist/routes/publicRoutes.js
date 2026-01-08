"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validateResult_1 = require("../middlewares/validateResult");
const validation_1 = require("../middlewares/validation");
const publicHostelController_1 = require("../controllers/publicControllers/publicHostelController");
const router = (0, express_1.Router)();
// Public - Hostels
router.get("/hostels", publicHostelController_1.getAllHostelsPublicController);
router.get("/hostels/:hostelId", (0, validation_1.paramIdValidation)('hostelId'), validateResult_1.validateResult, publicHostelController_1.getSingleHostelPublicController);
// Public - Search
router.get("/search", 
//  searchValidation
validateResult_1.validateResult, publicHostelController_1.searchHostelsController);
exports.default = router;
