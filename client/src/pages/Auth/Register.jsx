import { useState } from "react";
import API from "../../services/api";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiMail, FiLock, FiPhone, FiCheckCircle, FiAlertCircle, FiArrowRight } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { GoogleLogin } from "@react-oauth/google";

// Import your logo and the background image
import logoImage from "../../assets/images/Gemini_Generated_Image_70rl6i70rl6i70rl.png";
import bgImage from "../../assets/images/ChatGPT Image Aug 22, 2026, 11_38_02 PM.png";

const glassStyle = {
  background: "rgba(15, 23, 42, 0.6)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "1px solid rgba(56, 189, 248, 0.35)",
  borderRadius: "32px",
  boxShadow: "0 30px 60px rgba(0, 0, 0, 0.85), 0 0 50px rgba(56, 189, 248, 0.15)",
};

const gradientText = {
  background: "linear-gradient(to right, #38bdf8, #818cf8)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
};

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Custom Toast Notification State
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 4000);
  };

  const handleSendOtp = async () => {
    if (!email || !email.includes("@")) {
      showToast("Please enter a valid email address first ⚠️", "error");
      return;
    }
    try {
      const res = await API.post("/auth/send-otp", { email });
      setIsOtpSent(true);
      showToast(res.data.message || "Verification code sent to your email 📧", "success");
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to send OTP ❌", "error");
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const res = await API.post("/auth/verify-otp", { email, otp });
      setIsVerified(true);
      showToast(res.data.message || "Email Address Verified Successfully! ✅", "success");
    } catch (error) {
      showToast(error.response?.data?.message || "OTP Verification Failed ❌", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isVerified) {
      showToast("Please verify your email address first! ⚠️", "error");
      return;
    }
    setIsLoading(true);

    try {
      await API.post("/auth/register", {
        name,
        email,
        phone,
        password,
      });

      showToast("Registration Successful 🎉 Redirecting to login...", "success");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.message || "Registration Failed ❌", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await API.post("/auth/google-login", {
        credential: credentialResponse.credential,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data));

      showToast("Google Login Successful! Redirecting... 🚀", "success");
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (err) {
      console.log(err);
      showToast("Google Login Failed ❌", "error");
    }
  };

  return (
    <>
      <style>
        {`
          body, html {
            margin: 0;
            padding: 0;
            background-color: #020617;
            color: #f8fafc;
            font-family: system-ui, -apple-system, sans-serif;
            overflow-x: hidden;
          }
          .input-field:focus {
            border-color: #38bdf8 !important;
            box-shadow: 0 0 25px rgba(56, 189, 248, 0.4);
            outline: none;
            background: rgba(15, 23, 42, 0.85) !important;
          }
          .register-btn {
            background: linear-gradient(135deg, #2563eb, #38bdf8);
            color: white;
            transition: all 0.3s ease;
            box-shadow: 0 4px 20px rgba(56, 189, 248, 0.4);
          }
          .register-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 30px rgba(56, 189, 248, 0.7);
          }
          .otp-btn {
            background: rgba(56, 189, 248, 0.15);
            border: 1px solid rgba(56, 189, 248, 0.5);
            color: #38bdf8;
            padding: 0 16px;
            border-radius: 14px;
            font-weight: 600;
            font-size: 0.9rem;
            cursor: pointer;
            transition: all 0.2s;
            white-space: nowrap;
          }
          .otp-btn:hover {
            background: rgba(56, 189, 248, 0.3);
          }
          /* Custom Unique Sleek Google Button */
          .custom-google-container {
            position: relative;
            width: 100%;
            height: 52px;
            border-radius: 16px;
            overflow: hidden;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.15);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .custom-google-container:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: #38bdf8;
            transform: translateY(-2px);
            box-shadow: 0 6px 25px rgba(56, 189, 248, 0.3);
          }
          /* Invisible Google login overlay to preserve full OAuth functionality */
          .google-oauth-hidden {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0;
            cursor: pointer;
            z-index: 5;
          }
          @keyframes floatOrb {
            0% { transform: translateY(0px) scale(1); }
            50% { transform: translateY(-25px) scale(1.08); }
            100% { transform: translateY(0px) scale(1); }
          }
          .floating-orb {
            animation: floatOrb 8s ease-in-out infinite;
          }
        `}
      </style>

      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundImage: `linear-gradient(to bottom, rgba(2, 6, 23, 0.65), rgba(15, 23, 42, 0.85)), url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
          padding: "30px 20px",
          overflow: "hidden"
        }}
      >
        {/* Floating Ambient Glowing Orbs */}
        <div className="floating-orb" style={{ position: "absolute", top: "10%", left: "10%", width: "350px", height: "350px", background: "rgba(56, 189, 248, 0.22)", filter: "blur(120px)", borderRadius: "50%", pointerEvents: "none" }} />
        <div className="floating-orb" style={{ position: "absolute", bottom: "10%", right: "10%", width: "400px", height: "400px", background: "rgba(129, 140, 248, 0.2)", filter: "blur(130px)", borderRadius: "50%", pointerEvents: "none", animationDelay: "4s" }} />

        {/* Custom Unique Toast Notification */}
        <AnimatePresence>
          {toast.show && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              style={{
                position: "fixed",
                top: "25px",
                zIndex: 9999,
                background: toast.type === "success" ? "rgba(16, 185, 129, 0.9)" : "rgba(239, 68, 68, 0.9)",
                backdropFilter: "blur(12px)",
                color: "white",
                padding: "14px 25px",
                borderRadius: "16px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                fontWeight: "bold",
                border: "1px solid rgba(255,255,255,0.2)"
              }}
            >
              {toast.type === "success" ? <FiCheckCircle size={22} /> : <FiAlertCircle size={22} />}
              <span>{toast.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{
            width: "100%",
            maxWidth: "460px",
            padding: "40px",
            ...glassStyle,
            zIndex: 10
          }}
        >
          {/* Logo & Header */}
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <Link to="/" style={{ display: "inline-block", textDecoration: "none", marginBottom: "12px" }}>
              <img 
                src={logoImage} 
                alt="PrepPulse Logo" 
                style={{
                  height: "65px",
                  borderRadius: "14px",
                  boxShadow: "0 0 25px rgba(56, 189, 248, 0.5)"
                }}
              />
            </Link>
            <h2 style={{ fontSize: "2.2rem", fontWeight: "900", margin: "0 0 6px 0", color: "#f8fafc", letterSpacing: "-0.5px" }}>
              Create <span style={gradientText}>Account</span>
            </h2>
            <p style={{ color: "#cbd5e1", fontSize: "0.95rem", margin: 0 }}>
              Join PrepPulse and accelerate your learning
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            
            {/* Full Name */}
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "#cbd5e1", marginBottom: "6px", letterSpacing: "0.5px" }}>
                FULL NAME
              </label>
              <div style={{ position: "relative" }}>
                <FiUser style={{ position: "absolute", top: "15px", left: "16px", color: "#38bdf8", fontSize: "1.3rem" }} />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="input-field"
                  style={{
                    width: "100%", padding: "14px 15px 14px 50px", background: "rgba(15, 23, 42, 0.6)",
                    border: "1px solid rgba(255, 255, 255, 0.2)", borderRadius: "14px", color: "white", fontSize: "1rem", boxSizing: "border-box"
                  }}
                />
              </div>
            </div>

            {/* Email Address & Verification Button */}
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "#cbd5e1", marginBottom: "6px", letterSpacing: "0.5px" }}>
                EMAIL ADDRESS
              </label>
              <div style={{ position: "relative", display: "flex", gap: "10px" }}>
                <div style={{ position: "relative", flex: 1 }}>
                  <FiMail style={{ position: "absolute", top: "15px", left: "16px", color: "#38bdf8", fontSize: "1.3rem" }} />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isVerified}
                    className="input-field"
                    style={{
                      width: "100%", padding: "14px 15px 14px 50px", background: "rgba(15, 23, 42, 0.6)",
                      border: "1px solid rgba(255, 255, 255, 0.2)", borderRadius: "14px", color: "white", fontSize: "1rem", boxSizing: "border-box"
                    }}
                  />
                </div>
                {!isVerified && (
                  <button type="button" onClick={handleSendOtp} className="otp-btn">
                    {isOtpSent ? "Resend" : "Verify"}
                  </button>
                )}
                {isVerified && (
                  <div style={{ display: "flex", alignItems: "center", color: "#10b981", fontWeight: "bold", padding: "0 10px", gap: "5px", whiteSpace: "nowrap" }}>
                    <FiCheckCircle size={20} /> Verified
                  </div>
                )}
              </div>
            </div>

            {/* Email OTP Input box if triggered */}
            {isOtpSent && !isVerified && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} style={{ display: "flex", gap: "10px" }}>
                <input
                  type="text"
                  placeholder="Enter OTP code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="input-field"
                  style={{
                    flex: 1, padding: "12px 15px", background: "rgba(15, 23, 42, 0.6)",
                    border: "1px solid rgba(56, 189, 248, 0.4)", borderRadius: "12px", color: "white", fontSize: "0.95rem", boxSizing: "border-box"
                  }}
                />
                <button type="button" onClick={handleVerifyOtp} style={{ background: "#10b981", color: "white", border: "none", padding: "0 20px", borderRadius: "12px", fontWeight: "bold", cursor: "pointer", whiteSpace: "nowrap" }}>
                  Confirm
                </button>
              </motion.div>
            )}

            {/* Phone Number */}
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "#cbd5e1", marginBottom: "6px", letterSpacing: "0.5px" }}>
                PHONE NUMBER
              </label>
              <div style={{ position: "relative" }}>
                <FiPhone style={{ position: "absolute", top: "15px", left: "16px", color: "#38bdf8", fontSize: "1.3rem" }} />
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="input-field"
                  style={{
                    width: "100%", padding: "14px 15px 14px 50px", background: "rgba(15, 23, 42, 0.6)",
                    border: "1px solid rgba(255, 255, 255, 0.2)", borderRadius: "14px", color: "white", fontSize: "1rem", boxSizing: "border-box"
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "#cbd5e1", marginBottom: "6px", letterSpacing: "0.5px" }}>
                PASSWORD
              </label>
              <div style={{ position: "relative" }}>
                <FiLock style={{ position: "absolute", top: "15px", left: "16px", color: "#38bdf8", fontSize: "1.3rem" }} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-field"
                  style={{
                    width: "100%", padding: "14px 15px 14px 50px", background: "rgba(15, 23, 42, 0.6)",
                    border: "1px solid rgba(255, 255, 255, 0.2)", borderRadius: "14px", color: "white", fontSize: "1rem", boxSizing: "border-box"
                  }}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !isVerified}
              className="register-btn"
              style={{
                width: "100%", padding: "15px", borderRadius: "14px", fontWeight: "bold", fontSize: "1.05rem",
                border: "none", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", marginTop: "5px",
                opacity: !isVerified ? 0.6 : 1
              }}
            >
              {isLoading ? "Creating account..." : <>Get Started <FiArrowRight size={20} /></>}
            </button>
          </form>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              margin: "20px 0",
              color: "#64748b",
              fontSize: "0.85rem",
            }}
          >
            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }} />
            <span style={{ padding: "0 12px", textTransform: "uppercase", letterSpacing: "1px" }}>
              Or continue with
            </span>
            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }} />
          </div>

          {/* Ultra-Modern Custom Google Button Wrapper */}
          <div className="custom-google-container">
            <FcGoogle size={24} />
            <span style={{ fontWeight: "600", fontSize: "1rem", color: "#f8fafc" }}>Continue with Google</span>
            <div className="google-oauth-hidden">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => showToast("Google Login Failed ❌", "error")}
                size="large"
                width="400"
              />
            </div>
          </div>

          {/* Bottom Link */}
          <div style={{ textAlign: "center", marginTop: "25px" }}>
            <p style={{ margin: 0, color: "#cbd5e1", fontSize: "0.95rem" }}>
              Already have an account?{" "}
              <Link to="/login" style={{ color: "#38bdf8", textDecoration: "none", fontWeight: "bold" }}>
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
}

export default Register;