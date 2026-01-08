"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectTODB = exports.pool = void 0;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});
const connectTODB = async () => {
    try {
        const client = await exports.pool.connect();
        console.log("connected successfully");
        client.release();
    }
    catch (err) {
        if (err instanceof Error) {
            console.error("fail to connect", err.message);
        }
        else {
            console.error("fail to connect", err);
        }
    }
};
exports.connectTODB = connectTODB;
