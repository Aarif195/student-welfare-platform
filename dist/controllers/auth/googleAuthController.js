"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleLogin = void 0;
const google_auth_library_1 = require("google-auth-library");
const db_1 = require("../../config/db");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const helper_1 = require("../../utils/helper");
const crypto = __importStar(require("crypto"));
const client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const googleLogin = async (req, res) => {
    const { idToken, role, phone } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            return res.status(400).json({ success: false, message: "Invalid token" });
        }
        const { email, name } = payload;
        const [firstName, ...lastNameParts] = name ? name.split(" ") : ["User", ""];
        const lastName = lastNameParts.join(" ");
        const tableName = role === "student" ? "students" : "hostelOwners";
        // 1. Check if user exists
        const userQuery = await db_1.pool.query(`SELECT * FROM ${tableName} WHERE email = $1`, [email]);
        let user = userQuery.rows[0];
        // 2. Account Linking (Verify existing user)
        if (user) {
            if (!user.is_verified) {
                await db_1.pool.query(`UPDATE ${tableName} SET is_verified = true WHERE email = $1`, [email]);
                user.is_verified = true;
            }
        }
        // 3. If not, create them
        else {
            if (!phone) {
                return res.status(400).json({
                    success: false,
                    message: "First-time login requires a phone number to complete registration.",
                });
            }
            // Generate a unique random string and hash it
            const entropy = crypto.randomBytes(16).toString("hex");
            const securePassword = await (0, helper_1.hashPassword)(entropy);
            const newUser = await db_1.pool.query(`INSERT INTO ${tableName} (firstName, lastName, email, phone, is_verified, password) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`, [firstName, lastName, email, phone, true, securePassword]);
            user = newUser.rows[0];
        }
        // 3. Generate JWT
        const token = jsonwebtoken_1.default.sign({ id: user.id, role }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.status(200).json({ success: true, token, user: { email, name, role } });
    }
    catch (error) {
        console.log("Failed error", error);
        res.status(500).json({ success: false, message: "Authentication failed" });
    }
};
exports.googleLogin = googleLogin;
