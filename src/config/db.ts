import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});


export const connectTODB = async () => {
  try {
    const client = await pool.connect(); 
    console.log("connected successfully");
    client.release(); 
  } catch (err) {
    if (err instanceof Error) {
      console.error("fail to connect", err.message);
    } else {
      console.error("fail to connect", err);
    }
  }
};
