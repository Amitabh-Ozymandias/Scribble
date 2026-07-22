import { useState, useEffect } from "react";
import type { AuthUser } from "../types";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: AuthUser) => void;
};

const BACKEND_URL = "https://scribble-ss8e.onrender.com";

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: Props) {
  const [step, setStep] = useState<"request" | "verify">("request");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  if (!isOpen) return null;

  async function handleSendOTP(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");

    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (!name.trim()) {
      setErrorMsg("Please enter your display name.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), name: name.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.message || "Failed to send OTP code.");
        setLoading(false);
        return;
      }

      setInfoMsg(data.message || `OTP sent to ${email}`);
      if (data.devOtp) {
        setDevOtp(data.devOtp);
      }
      setStep("verify");
      setResendTimer(30);
    } catch (err) {
      console.error("Auth request error:", err);
      setErrorMsg("Unable to connect to auth server. Please check backend.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOTP(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");

    if (!otp.trim() || otp.trim().length !== 6) {
      setErrorMsg("Please enter a 6-digit OTP code.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          otp: otp.trim(),
          name: name.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.message || "Invalid OTP code.");
        setLoading(false);
        return;
      }

      onAuthSuccess(data.user);
      onClose();
    } catch (err) {
      console.error("Auth verification error:", err);
      setErrorMsg("Unable to verify OTP code.");
    } finally {
      setLoading(false);
    }
  }

  function handleAutoFillDevOtp() {
    if (devOtp) {
      setOtp(devOtp);
    }
  }

  return (
    <div className="auth-modal-overlay">
      <div className="auth-card">
        <button className="modal-close-btn" onClick={onClose}>
          ✕
        </button>

        <div className="auth-header">
          <div className="auth-icon">🔐</div>
          <h2>Sign In to Scribble</h2>
          <p className="auth-subtitle">
            {step === "request"
              ? "Enter your email to receive a 6-digit verification OTP code"
              : `Enter the 6-digit OTP code sent to ${email}`}
          </p>
        </div>

        {errorMsg && <div className="auth-error-banner">⚠️ {errorMsg}</div>}
        {infoMsg && <div className="auth-info-banner">ℹ️ {infoMsg}</div>}

        {/* Dev Mode Banner for instant local testing */}
        {step === "verify" && devOtp && (
          <div className="dev-otp-banner">
            <span>💡 <strong>Dev Mode OTP:</strong> {devOtp}</span>
            <button
              type="button"
              className="dev-autofill-btn"
              onClick={handleAutoFillDevOtp}
            >
              Auto-fill Code
            </button>
          </div>
        )}

        {step === "request" ? (
          <form onSubmit={handleSendOTP} className="auth-form">
            <div className="form-group">
              <label htmlFor="auth-name">Display Name</label>
              <input
                id="auth-name"
                placeholder="e.g. Amitabh"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="lobby-input"
                maxLength={16}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="auth-email">Email Address</label>
              <input
                id="auth-email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="lobby-input"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary auth-submit-btn"
            >
              {loading ? "Sending OTP..." : "📩 Send OTP Code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="auth-form">
            <div className="form-group">
              <label htmlFor="auth-otp">6-Digit Verification Code</label>
              <input
                id="auth-otp"
                type="text"
                placeholder="e.g. 123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="lobby-input otp-code-input"
                maxLength={6}
                autoFocus
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="btn-primary auth-submit-btn"
            >
              {loading ? "Verifying..." : "✅ Verify & Sign In"}
            </button>

            <div className="auth-resend-row">
              <button
                type="button"
                className="auth-link-btn"
                onClick={() => setStep("request")}
              >
                Change Email
              </button>

              <button
                type="button"
                disabled={resendTimer > 0 || loading}
                className="auth-link-btn"
                onClick={handleSendOTP}
              >
                {resendTimer > 0
                  ? `Resend OTP (${resendTimer}s)`
                  : "Resend OTP Code"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
