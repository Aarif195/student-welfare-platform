"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOTP = exports.verifyPayment = exports.generateToken = exports.comparePassword = exports.hashPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const hashPassword = async (password) => {
    const salt = await bcrypt_1.default.genSalt(10);
    return await bcrypt_1.default.hash(password, salt);
};
exports.hashPassword = hashPassword;
const comparePassword = async (password, hashed) => {
    return await bcrypt_1.default.compare(password, hashed);
};
exports.comparePassword = comparePassword;
// To create a new token
const generateToken = (id, role) => {
    return jsonwebtoken_1.default.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: "1d",
    });
};
exports.generateToken = generateToken;
// paymentUtility
const verifyPayment = async (reference) => {
    // Logic for external API call (Paystack/Flutterwave) goes here later
    return true;
};
exports.verifyPayment = verifyPayment;
const generateOTP = () => {
    return crypto_1.default.randomInt(100000, 999999).toString();
};
exports.generateOTP = generateOTP;
