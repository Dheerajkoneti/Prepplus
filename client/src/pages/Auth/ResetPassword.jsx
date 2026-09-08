import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiLock, FiCheckCircle, FiAlertCircle, FiRefreshCw, FiEye, FiEyeOff } from "react-icons/fi";
import API from "../../services/api";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3500);
  };

  // Password validation rules
  const hasMinLength = password.length >= 6;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password && password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hasMinLength || !hasUpper || !hasNumber) {
      showToast("Please meet all password security requirements.", "error");
      return;
    }

    if (password !== confirmPassword) {
      showToast("Passwords do not match.", "error");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post(`/auth/reset-password/${token}`, {
        password,
      });

      showToast(res.data.message || "Password reset successful! 🚀", "success");
      
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      showToast(error.response?.data?.message || "Password reset failed ❌", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      width: "100vw", minHeight: "100vh", 
      background: "radial-gradient(circle at top, #1e293b 0%, #0f172a 45%, #08142d 100%)", 
      display: "flex", justifyContent: "center", alignItems: "center", 
      padding: "20px", boxSizing: "border-box", overflowX: "hidden" 
    }}>
      <style>
        {`
          * { box-sizing: border-box; }
          html, body { margin: 0; padding: 0; background-color: #08142d; width: 100%; overflow-x: hidden; }
          .glass-card { background: rgba(30, 41, 59, 0.65); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 20px 40px rgba(0,0,0,0.5); border-radius: 24px; }
          .btn-primary { background: linear-gradient(135deg, #0062ff, #004fe5); color: white; border: none; padding: 14px 24px; border-radius: 14px; font-weight: bold; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 15px rgba(0, 98, 255, 0.3); }
          .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0, 98, 255, 0.5); }
          .custom-input:focus { border-color: #38bdf8 !important; outline: none; box-shadow: 0 0 12px rgba(56, 189, 248, 0.25); }
        `}
      </style>

      {/* Toast Notification Popup */}
      {toast.show && (
        <motion.div
          initial={{ opacity: 0, y: -30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          style={{
            position: "fixed", top: "20px", right: "20px", zIndex: 9999,
            background: toast.type === "success" ? "rgba(16, 185, 129, 0.9)" : "rgba(239, 68, 68, 0.9)",
            backdropFilter: "blur(12px)", color: "white", padding: "12px 22px",
            borderRadius: "14px", boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            display: "flex", alignItems: "center", gap: "10px", fontWeight: "bold",
            border: "1px solid rgba(255,255,255,0.2)"
          }}
        >
          {toast.type === "success" ? <FiCheckCircle size={20} /> : <FiAlertCircle size={20} />}
          <span>{toast.message}</span>
        </motion.div>
      )}

      {/* Reset Card Container matching Preppulse brand styling */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="glass-card"
        style={{ width: "100%", maxWidth: "460px", padding: "40px" }}
      >
        <div style={{ textAlign: "center", marginBottom: "25px" }}>
          <div style={{ 
            width: "65px", height: "65px", margin: "0 auto 15px auto", 
            background: "rgba(0, 98, 255, 0.1)", border: "1px solid rgba(0, 98, 255, 0.3)", 
            borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" 
          }}>
            <FiLock size={28} color="#0062ff" />
          </div>
          <h1 style={{ color: "#fff", fontSize: "1.8rem", fontWeight: "900", margin: "0 0 8px 0" }}>
            Reset Password
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "0.95rem", margin: 0 }}>
            Enter your secure new password for <span style={{ color: "#38bdf8", fontWeight: "600" }}>PrepPulse</span>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* New Password Input */}
          <div style={{ position: "relative", marginBottom: "15px" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="custom-input"
              style={{
                width: "100%", padding: "14px 45px 14px 18px", borderRadius: "14px",
                border: "1px solid #334155", background: "#1e293b",
                color: "white", fontSize: "0.95rem", transition: "all 0.3s"
              }}
            />
            <div 
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: "absolute", right: "15px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "#94a3b8" }}
            >
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </div>
          </div>

          {/* Confirm Password Input */}
          <div style={{ position: "relative", marginBottom: "15px" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="custom-input"
              style={{
                width: "100%", padding: "14px 45px 14px 18px", borderRadius: "14px",
                border: "1px solid #334155", background: "#1e293b",
                color: "white", fontSize: "0.95rem", transition: "all 0.3s"
              }}
            />
          </div>

          {/* Security Checklist Indicator */}
          <div style={{ background: "rgba(15, 23, 42, 0.5)", padding: "12px 16px", borderRadius: "12px", marginBottom: "20px", border: "1px solid rgba(255,255,255,0.04)" }}>
            <p style={{ fontSize: "0.8rem", color: "#94a3b8", margin: "0 0 8px 0", fontWeight: "bold" }}>Password requirements:</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", fontSize: "0.8rem" }}>
              <span style={{ color: hasMinLength ? "#10b981" : "#64748b" }}>✓ Min 6 characters</span>
              <span style={{ color: hasNumber ? "#10b981" : "#64748b" }}>✓ At least 1 number</span>
              <span style={{ color: hasUpper ? "#10b981" : "#64748b" }}>✓ At least 1 uppercase</span>
              <span style={{ color: passwordsMatch ? "#10b981" : "#64748b" }}>✓ Passwords match</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", fontSize: "1rem" }}
          >
            {loading ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                  <FiRefreshCw size={18} />
                </motion.div>
                Resetting Password...
              </>
            ) : (
              "Update Password"
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default ResetPassword;