"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./config/db");
async function testConnection() {
    try {
        const res = await db_1.pool.query("SELECT NOW()");
        console.log("Connected:", res.rows[0]);
    }
    catch (err) {
        console.error("Connection error:", err);
    }
    finally {
        await db_1.pool.end(); // close pool after test
    }
}
testConnection();
