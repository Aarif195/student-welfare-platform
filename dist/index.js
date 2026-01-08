"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const studentRoutes_1 = __importDefault(require("./routes/studentRoutes"));
const ownerRoutes_1 = __importDefault(require("./routes/ownerRoutes"));
const hostelRoutes_1 = __importDefault(require("./routes/hostelRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const publicRoutes_1 = __importDefault(require("./routes/publicRoutes"));
const notificationsRoutes_1 = __importDefault(require("./routes/notificationsRoutes"));
const maintenanceRoutes_1 = __importDefault(require("./routes/maintenanceRoutes"));
const studySpaceRoutes_1 = __importDefault(require("./routes/studySpaceRoutes"));
const otpRoutes_1 = __importDefault(require("./routes/otpRoutes"));
const db_1 = require("./config/db");
const PORT = process.env.PORT || 8080;
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// server to serve static files via a URL 
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, "../upload")));
// Route registration
app.use("/students", studentRoutes_1.default);
app.use("/owners", ownerRoutes_1.default);
app.use("/hostels", hostelRoutes_1.default);
app.use("/admin", adminRoutes_1.default);
app.use("/public", publicRoutes_1.default);
app.use("/notifications", notificationsRoutes_1.default);
app.use("/maintenance", maintenanceRoutes_1.default);
app.use("/study-spaces", studySpaceRoutes_1.default);
app.use("/api/auth", otpRoutes_1.default);
app.listen(PORT, () => {
    (0, db_1.connectTODB)();
    console.log(`Server running on port ${PORT}`);
});
