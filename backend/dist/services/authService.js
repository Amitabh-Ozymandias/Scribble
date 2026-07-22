"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOTP = sendOTP;
exports.verifyOTP = verifyOTP;
const nodemailer_1 = __importDefault(require("nodemailer"));
const otpStore = new Map();
function getTransporter() {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    if (host && user && pass) {
        return nodemailer_1.default.createTransport({
            host,
            port,
            secure: port === 465,
            auth: { user, pass },
        });
    }
    return null;
}
/**
 * Sends a 6-digit OTP code to the requested email address.
 */
async function sendOTP(email, name) {
    const normalizedEmail = email.trim().toLowerCase();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes TTL
    otpStore.set(normalizedEmail, { otp, expiresAt, name });
    const transporter = getTransporter();
    if (transporter) {
        try {
            await transporter.sendMail({
                from: process.env.SMTP_FROM || `"Scribble Game" <no-reply@scribble.app>`,
                to: normalizedEmail,
                subject: `🎨 Your Scribble Sign-In OTP Code: ${otp}`,
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #0f172a; color: #f8fafc;">
            <h2 style="color: #818cf8; text-align: center; margin-bottom: 8px;">🎨 Scribble Sign In</h2>
            <p style="text-align: center; color: #94a3b8; font-size: 14px;">Welcome back! Use the verification code below to sign in:</p>
            <div style="text-align: center; margin: 24px 0;">
              <span style="display: inline-block; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #38bdf8; background-color: rgba(56, 189, 248, 0.1); padding: 12px 24px; border-radius: 12px; border: 1px solid #38bdf8;">${otp}</span>
            </div>
            <p style="text-align: center; color: #94a3b8; font-size: 13px;">This code will expire in <strong>5 minutes</strong>. If you did not request this, please ignore this email.</p>
          </div>
        `,
            });
            console.log(`[AUTH] Emailed OTP successfully to ${normalizedEmail}`);
            return { success: true, message: `OTP code sent to ${normalizedEmail}` };
        }
        catch (err) {
            console.error("[AUTH] Email sending failed:", err);
            // Fallback to dev mode log if SMTP send fails
        }
    }
    // Dev mode log when SMTP is not configured
    console.log(`\n=================================================`);
    console.log(`📧 [DEV MODE] OTP Code for ${normalizedEmail}: ${otp}`);
    console.log(`=================================================\n`);
    return {
        success: true,
        message: `OTP sent to ${normalizedEmail} (Dev Mode Active)`,
        devOtp: otp,
    };
}
/**
 * Verifies the 6-digit OTP code for the given email address.
 */
function verifyOTP(email, otp, name) {
    const normalizedEmail = email.trim().toLowerCase();
    const record = otpStore.get(normalizedEmail);
    if (!record) {
        return { success: false, message: "No OTP requested for this email or OTP expired." };
    }
    if (Date.now() > record.expiresAt) {
        otpStore.delete(normalizedEmail);
        return { success: false, message: "OTP has expired. Please request a new code." };
    }
    if (record.otp !== otp.trim()) {
        return { success: false, message: "Incorrect OTP code. Please try again." };
    }
    // Valid OTP! Clear record and issue session profile
    otpStore.delete(normalizedEmail);
    const displayName = name?.trim() || record.name || normalizedEmail.split("@")[0];
    const token = Buffer.from(`${normalizedEmail}:${Date.now()}`).toString("base64");
    return {
        success: true,
        message: "Successfully authenticated!",
        user: {
            email: normalizedEmail,
            name: displayName,
            token,
        },
    };
}
