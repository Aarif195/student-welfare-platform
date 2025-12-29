import bcrypt from "bcrypt";
import { pool } from "../config/db";

const createAdmin = async () => {
  const PLAIN_PASSWORD = "Admin@123";
  const hash = await bcrypt.hash(PLAIN_PASSWORD, 10);
  const query = `
  INSERT INTO Admins (firstName, lastName, email, password, role)
  VALUES ('Super', 'Admin', 'admin@hostel.com', $1, 'superadmin')
  ON CONFLICT (email)
  DO UPDATE SET password = EXCLUDED.password;
`;

  try {
    await pool.query(query, [hash]);
    console.log("Admin created successfully!");
  } catch (err) {
    console.error("Error creating admin:", err);
  }
};

createAdmin();
