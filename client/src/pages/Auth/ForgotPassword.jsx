import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiMail, FiCheckCircle, FiAlertCircle, FiRefreshCw, FiArrowLeft } from "react-icons/fi";
import API from "../../services/api";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // Toast notification state with useRef cleanup
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const timeoutRef = useRef(null);

  const showToast = (message, type = "success") => {
    clearTimeout(timeoutRef.current);
    setToast({ show: true, message, type });
    timeoutRef.current = setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await API.post("/auth/forgot-password", { email });

      showToast(res.data.message || "Password reset link sent successfully! 🚀", "success");
      setEmail("");
    } catch (error) {
      showToast(error.response?.data?.message || "Something went wrong. Please try again ❌", "error");
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
          .btn-primary { background: linear-gradient(135deg, #2563eb, #38bdf8); color: white; border: none; padding: 14px 24px; border-radius: 14px; font-weight: bold; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 15px rgba(56, 189, 248, 0.3); }
          .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(56, 189, 248, 0.5); }
          .custom-input:focus { border-color: #38bdf8 !important; outline: none; box-shadow: 0 0 12px rgba(56, 189, 248, 0.25); }
        `}
      </style>

      {/* Toast Notification Popup */}
      <AnimatePresence>
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
      </AnimatePresence>

      {/* Card Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="glass-card"
        style={{ width: "100%", maxWidth: "440px", padding: "40px" }}
      >
        <div style={{ textAlign: "center", marginBottom: "25px" }}>
          <div style={{ 
            width: "60px", height: "60px", margin: "0 auto 15px auto", 
            background: "rgba(56, 189, 248, 0.1)", border: "1px solid rgba(56, 189, 248, 0.3)", 
            borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" 
          }}>
            <FiMail size={26} color="#38bdf8" />
          </div>
          <h2 style={{ color: "#fff", fontSize: "1.8rem", fontWeight: "900", margin: "0 0 8px 0" }}>
            Forgot Password?
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "0.95rem", margin: 0, lineHeight: "1.5" }}>
            Enter your registered email address and we’ll send you a secure link to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ position: "relative", marginBottom: "20px" }}>
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="custom-input"
              style={{
                width: "100%", padding: "14px 18px", borderRadius: "14px",
                border: "1px solid #334155", background: "#1e293b",
                color: "white", fontSize: "0.95rem", transition: "all 0.3s"
              }}
            />
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
                Sending Link...
              </>
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "25px" }}>
          <Link 
            to="/login" 
            style={{ 
              color: "#38bdf8", fontSize: "0.9rem", textDecoration: "none", 
              display: "inline-flex", alignItems: "center", gap: "6px", fontWeight: "600" 
            }}
          >
            <FiArrowLeft size={15} /> Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default ForgotPassword;