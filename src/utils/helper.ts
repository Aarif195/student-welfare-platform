import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from 'crypto';


export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hashed: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashed);
};

// To create a new token
export const generateToken = (id: number, role: string): string => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET as string, {
    expiresIn: "1d",
  });
};

// paymentUtility
export const verifyPayment = async (reference: string): Promise<boolean> => {
  // Logic for external API call (Paystack/Flutterwave) goes here later
  return true; 
};



export const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};