"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authService_1 = require("../services/authService");
const router = (0, express_1.Router)();
// Send OTP to user's email
router.post("/send-otp", async (req, res) => {
    const { email, name } = req.body;
    if (!email || typeof email !== "string" || !email.includes("@")) {
        res.status(400).json({ success: false, message: "A valid email address is required." });
        return;
    }
    try {
        const result = await (0, authService_1.sendOTP)(email, name);
        res.json(result);
    }
    catch (error) {
        console.error("Error sending OTP:", error);
        res.status(500).json({ success: false, message: "Internal server error while sending OTP." });
    }
});
// Verify OTP
router.post("/verify-otp", (req, res) => {
    const { email, otp, name } = req.body;
    if (!email || !otp) {
        res.status(400).json({ success: false, message: "Email and OTP code are required." });
        return;
    }
    const result = (0, authService_1.verifyOTP)(email, otp, name);
    if (!result.success) {
        res.status(400).json(result);
        return;
    }
    res.json(result);
});
exports.default = router;
