import { pool } from "./src/config/db";

async function testConnection() {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("Connected:", res.rows[0]);
  } catch (err) {
    console.error("Connection error:", err);
  } finally {
    await pool.end(); // close pool after test
  }
}

testConnection();
