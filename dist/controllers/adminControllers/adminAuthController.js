"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminLoginController = void 0;
const db_1 = require("../../config/db");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
// adminLoginController
const adminLoginController = async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await db_1.pool.query("SELECT * FROM Admins WHERE email = $1", [email]);
        const admin = result.rows[0];
        if (!admin)
            return res.status(404).json({ message: "Admin not found" });
        const isMatch = await bcrypt_1.default.compare(password, admin.password);
        if (!isMatch)
            return res.status(401).json({ message: "Invalid credentials" });
        const token = jsonwebtoken_1.default.sign({ id: admin.id, role: admin.role }, //superadmin
        process.env.JWT_SECRET, { expiresIn: "1d" });
        res.status(200).json({ success: true, token, role: "Superadmin" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.adminLoginController = adminLoginController;
