import { Router, Request, Response } from "express";
import { sendOTP, verifyOTP } from "../services/authService";

const router = Router();

// Send OTP to user's email
router.post("/send-otp", async (req: Request, res: Response): Promise<void> => {
  const { email, name } = req.body;

  if (!email || typeof email !== "string" || !email.includes("@")) {
    res.status(400).json({ success: false, message: "A valid email address is required." });
    return;
  }

  try {
    const result = await sendOTP(email, name);
    res.json(result);
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ success: false, message: "Internal server error while sending OTP." });
  }
});

// Verify OTP
router.post("/verify-otp", (req: Request, res: Response): void => {
  const { email, otp, name } = req.body;

  if (!email || !otp) {
    res.status(400).json({ success: false, message: "Email and OTP code are required." });
    return;
  }

  const result = verifyOTP(email, otp, name);

  if (!result.success) {
    res.status(400).json(result);
    return;
  }

  res.json(result);
});

export default router;
