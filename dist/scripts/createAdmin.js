"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("../config/db");
const createAdmin = async () => {
    const PLAIN_PASSWORD = "Admin@123";
    const hash = await bcrypt_1.default.hash(PLAIN_PASSWORD, 10);
    const query = `
  INSERT INTO Admins (firstName, lastName, email, password, role)
  VALUES ('Super', 'Admin', 'admin@hostel.com', $1, 'superadmin')
  ON CONFLICT (email)
  DO UPDATE SET password = EXCLUDED.password;
`;
    try {
        await db_1.pool.query(query, [hash]);
        console.log("Admin created successfully!");
    }
    catch (err) {
        console.error("Error creating admin:", err);
    }
};
createAdmin();
