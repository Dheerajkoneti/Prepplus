import { useState } from "react";
import API from "../../services/api";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiMail, FiLock, FiArrowRight, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { GoogleLogin } from "@react-oauth/google";

// Import your logo and custom background image
import logoImage from "../../assets/images/Gemini_Generated_Image_70rl6i70rl6i70rl.png";
import bgImage from "../../assets/images/in-this-img-add-students-studying-and-working-on-l.png";

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

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Custom Unique Toast Notification State
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await API.post("/auth/login", {
        email,
        password,
      });
      // Save User Data
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data._id);
      localStorage.setItem("name", res.data.name);
      localStorage.setItem("email", res.data.email);
      localStorage.setItem("role", res.data.role || "student");
      try {
        await API.post(
          "/progress/login-streak",
          {},
          {
            headers: {
              Authorization: `Bearer ${res.data.token}`,
            },
          }
        );
      } catch (streakError) {
        console.error(
          "Failed to record login streak:",
          streakError
        );
      }
      showToast(
        "Login Successful! Redirecting to dashboard... 🚀",
        "success"
      );
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (error) {
      console.error(error);
      showToast(
        error.response?.data?.message || "Login Failed. Please check your credentials ❌",
        "error"
      );
    } finally {
      setIsLoading(false);
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
            background: rgba(15, 23, 42, 0.8) !important;
          }
          .login-btn {
            background: linear-gradient(135deg, #2563eb, #38bdf8);
            color: white;
            transition: all 0.3s ease;
            box-shadow: 0 4px 20px rgba(56, 189, 248, 0.4);
          }
          .login-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 30px rgba(56, 189, 248, 0.7);
          }
          .custom-google-btn {
            width: 100%;
            padding: 14px 20px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 16px;
            color: #ffffff;
            font-weight: 600;
            font-size: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            cursor: pointer;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          }
          .custom-google-btn:hover {
            background: rgba(255, 255, 255, 0.12);
            border-color: #38bdf8;
            transform: translateY(-2px);
            box-shadow: 0 6px 25px rgba(56, 189, 248, 0.25);
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
          backgroundImage: `linear-gradient(to bottom, rgba(2, 6, 23, 0.6), rgba(15, 23, 42, 0.85)), url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
          padding: "20px",
          overflow: "hidden"
        }}
      >
        {/* Floating Ambient Glowing Orbs */}
        <div className="floating-orb" style={{ position: "absolute", top: "10%", left: "10%", width: "350px", height: "350px", background: "rgba(56, 189, 248, 0.22)", filter: "blur(120px)", borderRadius: "50%", pointerEvents: "none" }} />
        <div className="floating-orb" style={{ position: "absolute", bottom: "10%", right: "10%", width: "400px", height: "400px", background: "rgba(129, 140, 248, 0.2)", filter: "blur(130px)", borderRadius: "50%", pointerEvents: "none", animationDelay: "4s" }} />

        {/* Custom Unique Toast Notification Popup */}
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
            maxWidth: "440px",
            padding: "45px 40px",
            ...glassStyle,
            zIndex: 10
          }}
        >
          {/* Logo & Header */}
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <Link to="/" style={{ display: "inline-block", textDecoration: "none", marginBottom: "15px" }}>
              <img 
                src={logoImage} 
                alt="PrepPulse Logo" 
                style={{
                  height: "70px",
                  borderRadius: "16px",
                  boxShadow: "0 0 30px rgba(56, 189, 248, 0.5)"
                }}
              />
            </Link>
            <h2 style={{ fontSize: "2.3rem", fontWeight: "900", margin: "0 0 8px 0", color: "#f8fafc", letterSpacing: "-0.5px" }}>
              Welcome <span style={gradientText}>Back</span>
            </h2>
            <p style={{ color: "#cbd5e1", fontSize: "0.95rem", margin: 0 }}>
              Access your intelligent learning hub
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {/* Email Field */}
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#cbd5e1", marginBottom: "8px", letterSpacing: "0.5px" }}>
                EMAIL ADDRESS
              </label>
              <div style={{ position: "relative" }}>
                <FiMail style={{ position: "absolute", top: "16px", left: "16px", color: "#38bdf8", fontSize: "1.4rem" }} />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-field"
                  style={{
                    width: "100%",
                    padding: "15px 15px 15px 52px",
                    background: "rgba(15, 23, 42, 0.6)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "16px",
                    color: "white",
                    fontSize: "1rem",
                    boxSizing: "border-box",
                    transition: "all 0.3s",
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#cbd5e1", marginBottom: "8px", letterSpacing: "0.5px" }}>
                PASSWORD
              </label>
              <div style={{ position: "relative" }}>
                <FiLock style={{ position: "absolute", top: "16px", left: "16px", color: "#38bdf8", fontSize: "1.4rem" }} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-field"
                  style={{
                    width: "100%",
                    padding: "15px 15px 15px 52px",
                    background: "rgba(15, 23, 42, 0.6)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "16px",
                    color: "white",
                    fontSize: "1rem",
                    boxSizing: "border-box",
                    transition: "all 0.3s",
                  }}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="login-btn"
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "16px",
                fontWeight: "bold",
                fontSize: "1.05rem",
                border: "none",
                cursor: "pointer",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "10px",
                marginTop: "5px"
              }}
            >
              {isLoading ? "Signing in..." : <>Sign In <FiArrowRight size={20} /></>}
            </button>
          </form>

          {/* Forgot Password Below Sign In Button */}
          <div style={{ textAlign: "right", marginTop: "10px" }}>
            <Link 
              to="/forgot-password" 
              style={{ color: "#38bdf8", fontSize: "0.88rem", textDecoration: "none", fontWeight: "600", transition: "color 0.2s" }}
            >
              Forgot Password?
            </Link>
          </div>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", margin: "20px 0", color: "#64748b", fontSize: "0.85rem" }}>
            <div style={{ flex: 1, height: "1px", background: "rgba(255, 255, 255, 0.15)" }} />
            <span style={{ padding: "0 12px", textTransform: "uppercase", letterSpacing: "1px" }}>Or continue with</span>
            <div style={{ flex: 1, height: "1px", background: "rgba(255, 255, 255, 0.15)" }} />
          </div>

          {/* Clean Unified Google Auth Button */}
          <button
            type="button"
            onClick={() => {
              window.location.href = "http://localhost:5000/api/auth/google";
            }}
            className="custom-google-btn"
          >
            <FcGoogle size={22} />
            <span>Continue with Google</span>
          </button>

          {/* Bottom Register Link */}
          <div style={{ textAlign: "center", marginTop: "25px" }}>
            <p style={{ margin: 0, color: "#cbd5e1", fontSize: "0.95rem" }}>
              Don't have an account?{" "}
              <Link to="/register" style={{ color: "#38bdf8", textDecoration: "none", fontWeight: "bold" }}>
                Sign up
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
}

export default Login;