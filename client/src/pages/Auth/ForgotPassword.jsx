import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMail,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiArrowLeft,
  FiShield,
  FiLock,
  FiArrowRight,
  FiCheck,
  FiClock,
  FiSend,
} from "react-icons/fi";
import API from "../../services/api";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const [submitted, setSubmitted] = useState(false);

  const timeoutRef = useRef(null);

  /*
  |--------------------------------------------------------------------------
  | TOAST
  |--------------------------------------------------------------------------
  */

  const showToast = (
    message,
    type = "success"
  ) => {
    clearTimeout(timeoutRef.current);

    setToast({
      show: true,
      message,
      type,
    });

    timeoutRef.current = setTimeout(() => {
      setToast({
        show: false,
        message: "",
        type: "success",
      });
    }, 4000);
  };

  /*
  |--------------------------------------------------------------------------
  | CLEANUP
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | EMAIL VALIDATION
  |--------------------------------------------------------------------------
  */

  const isValidEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      value.trim()
    );
  };

  /*
  |--------------------------------------------------------------------------
  | SUBMIT
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      showToast(
        "Please enter your email address.",
        "error"
      );
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      showToast(
        "Please enter a valid email address.",
        "error"
      );
      return;
    }

    try {
      setLoading(true);

      const res = await API.post(
        "/auth/forgot-password",
        {
          email: cleanEmail,
        }
      );

      showToast(
        res.data?.message ||
          "Password reset link sent successfully! 🚀",
        "success"
      );

      setSubmitted(true);
    } catch (error) {
      console.error(
        "Forgot Password Error:",
        error
      );

      showToast(
        error.response?.data?.message ||
          "Something went wrong. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | RESEND
  |--------------------------------------------------------------------------
  */

  const handleResend = async () => {
    if (!email.trim()) {
      showToast(
        "Please enter your email address.",
        "error"
      );
      return;
    }

    try {
      setLoading(true);

      const res = await API.post(
        "/auth/forgot-password",
        {
          email: email.trim(),
        }
      );

      showToast(
        res.data?.message ||
          "Reset link sent again.",
        "success"
      );
    } catch (error) {
      showToast(
        error.response?.data?.message ||
          "Unable to resend the reset link.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | ANIMATION
  |--------------------------------------------------------------------------
  */

  const containerVariants = {
    hidden: {
      opacity: 0,
      y: 20,
    },

    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: "easeOut",
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 15,
    },

    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="forgot-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        html,
        body,
        #root {
          margin: 0;
          padding: 0;
          width: 100%;
          min-height: 100%;
        }

        body {
          overflow-x: hidden;
          background: #020617;
          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .forgot-page {
          min-height: 100vh;
          width: 100%;
          position: relative;
          overflow: hidden;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 32px;

          background:
            radial-gradient(
              circle at 15% 15%,
              rgba(99, 102, 241, 0.18),
              transparent 30%
            ),
            radial-gradient(
              circle at 85% 20%,
              rgba(6, 182, 212, 0.15),
              transparent 28%
            ),
            radial-gradient(
              circle at 50% 100%,
              rgba(168, 85, 247, 0.13),
              transparent 35%
            ),
            linear-gradient(
              135deg,
              #020617 0%,
              #071126 45%,
              #020617 100%
            );
        }

        .background-grid {
          position: absolute;
          inset: 0;
          opacity: 0.22;
          pointer-events: none;

          background-image:
            linear-gradient(
              rgba(148, 163, 184, 0.06) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(148, 163, 184, 0.06) 1px,
              transparent 1px
            );

          background-size: 50px 50px;

          mask-image: linear-gradient(
            to bottom,
            black,
            transparent 85%
          );
        }

        .orb {
          position: absolute;
          border-radius: 999px;
          pointer-events: none;
          filter: blur(2px);
        }

        .orb-one {
          width: 280px;
          height: 280px;
          top: -100px;
          left: -80px;

          background:
            radial-gradient(
              circle,
              rgba(99, 102, 241, 0.25),
              transparent 70%
            );
        }

        .orb-two {
          width: 350px;
          height: 350px;
          right: -140px;
          bottom: -120px;

          background:
            radial-gradient(
              circle,
              rgba(6, 182, 212, 0.18),
              transparent 70%
            );
        }

        .orb-three {
          width: 180px;
          height: 180px;
          right: 20%;
          top: 8%;

          background:
            radial-gradient(
              circle,
              rgba(168, 85, 247, 0.12),
              transparent 70%
            );
        }

        .auth-shell {
          width: 100%;
          max-width: 1080px;

          min-height: 650px;

          display: grid;
          grid-template-columns: 0.95fr 1.05fr;

          position: relative;
          z-index: 5;

          border:
            1px solid
            rgba(255, 255, 255, 0.09);

          background:
            linear-gradient(
              145deg,
              rgba(15, 23, 42, 0.78),
              rgba(2, 6, 23, 0.88)
            );

          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);

          border-radius: 32px;

          box-shadow:
            0 40px 100px
              rgba(0, 0, 0, 0.55),
            inset 0 1px 0
              rgba(255, 255, 255, 0.05);

          overflow: hidden;
        }

        .brand-panel {
          position: relative;
          padding: 54px;

          display: flex;
          flex-direction: column;
          justify-content: space-between;

          background:
            radial-gradient(
              circle at 20% 20%,
              rgba(99, 102, 241, 0.18),
              transparent 35%
            ),
            linear-gradient(
              145deg,
              rgba(30, 41, 59, 0.4),
              rgba(15, 23, 42, 0.18)
            );

          border-right:
            1px solid
            rgba(255, 255, 255, 0.06);
        }

        .brand-top {
          position: relative;
          z-index: 2;
        }

        .logo-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 60px;
        }

        .logo-mark {
          width: 44px;
          height: 44px;

          border-radius: 13px;

          display: flex;
          align-items: center;
          justify-content: center;

          color: white;

          background:
            linear-gradient(
              135deg,
              #06b6d4,
              #6366f1,
              #a855f7
            );

          box-shadow:
            0 10px 30px
              rgba(99, 102, 241, 0.35);
        }

        .brand-name {
          color: #f8fafc;
          font-size: 1.1rem;
          font-weight: 900;
          letter-spacing: -0.03em;
        }

        .brand-name span {
          color: #22d3ee;
        }

        .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;

          color: #67e8f9;

          font-size: 0.72rem;
          font-weight: 900;

          letter-spacing: 0.16em;
          text-transform: uppercase;

          margin-bottom: 16px;
        }

        .brand-heading {
          color: white;
          font-size: clamp(2.2rem, 4vw, 3.7rem);
          line-height: 1.02;
          letter-spacing: -0.055em;
          margin: 0 0 20px;
          font-weight: 950;
        }

        .gradient-text {
          background:
            linear-gradient(
              90deg,
              #22d3ee,
              #818cf8,
              #c084fc
            );

          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .brand-description {
          max-width: 410px;
          color: #94a3b8;
          font-size: 0.98rem;
          line-height: 1.75;
          margin: 0;
        }

        .feature-list {
          display: grid;
          gap: 14px;
          margin-top: 40px;
        }

        .feature {
          display: flex;
          align-items: center;
          gap: 13px;

          color: #cbd5e1;
          font-size: 0.86rem;
        }

        .feature-icon {
          width: 31px;
          height: 31px;
          flex-shrink: 0;

          border-radius: 9px;

          display: flex;
          align-items: center;
          justify-content: center;

          color: #67e8f9;

          background:
            rgba(34, 211, 238, 0.08);

          border:
            1px solid
            rgba(34, 211, 238, 0.14);
        }

        .brand-footer {
          display: flex;
          align-items: center;
          gap: 10px;

          color: #64748b;
          font-size: 0.74rem;
        }

        .security-pill {
          display: inline-flex;
          align-items: center;
          gap: 7px;

          padding: 8px 12px;

          border-radius: 999px;

          background:
            rgba(16, 185, 129, 0.07);

          border:
            1px solid
            rgba(16, 185, 129, 0.16);

          color: #6ee7b7;
        }

        .form-panel {
          padding: 54px;

          display: flex;
          align-items: center;
          justify-content: center;
        }

        .form-content {
          width: 100%;
          max-width: 450px;
        }

        .mobile-logo {
          display: none;
        }

        .icon-container {
          width: 70px;
          height: 70px;

          position: relative;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 21px;

          background:
            linear-gradient(
              135deg,
              rgba(34, 211, 238, 0.12),
              rgba(99, 102, 241, 0.13)
            );

          border:
            1px solid
            rgba(103, 232, 249, 0.2);

          box-shadow:
            0 15px 40px
              rgba(34, 211, 238, 0.08);

          margin-bottom: 25px;
        }

        .icon-ring {
          position: absolute;
          inset: -8px;

          border-radius: 28px;

          border:
            1px solid
            rgba(99, 102, 241, 0.14);

          animation:
            pulseRing 2.5s ease-in-out infinite;
        }

        @keyframes pulseRing {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.35;
          }

          50% {
            transform: scale(1.06);
            opacity: 0.7;
          }
        }

        .form-eyebrow {
          color: #67e8f9;
          font-size: 0.72rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          margin-bottom: 9px;
        }

        .form-title {
          margin: 0;
          color: white;

          font-size: clamp(
            2rem,
            4vw,
            2.65rem
          );

          font-weight: 950;
          letter-spacing: -0.055em;
        }

        .form-subtitle {
          color: #94a3b8;
          font-size: 0.92rem;
          line-height: 1.7;
          margin: 12px 0 30px;
        }

        .input-label {
          display: block;

          color: #cbd5e1;

          font-size: 0.78rem;
          font-weight: 800;

          margin-bottom: 9px;
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 17px;
          top: 50%;
          transform: translateY(-50%);

          color: #64748b;

          pointer-events: none;
        }

        .email-input {
          width: 100%;

          padding:
            15px
            16px
            15px
            47px;

          border-radius: 14px;

          border:
            1px solid
            rgba(148, 163, 184, 0.16);

          background:
            rgba(2, 6, 23, 0.62);

          color: white;

          font-size: 0.92rem;

          outline: none;

          transition:
            border-color 0.25s ease,
            box-shadow 0.25s ease,
            background 0.25s ease;
        }

        .email-input::placeholder {
          color: #475569;
        }

        .email-input:hover {
          border-color:
            rgba(148, 163, 184, 0.28);
        }

        .email-input:focus {
          border-color: #22d3ee;

          background:
            rgba(8, 20, 45, 0.8);

          box-shadow:
            0 0 0 4px
              rgba(34, 211, 238, 0.08),
            0 10px 30px
              rgba(34, 211, 238, 0.06);
        }

        .email-input.has-value {
          border-color:
            rgba(99, 102, 241, 0.5);
        }

        .input-check {
          position: absolute;
          right: 15px;
          top: 50%;
          transform: translateY(-50%);

          color: #34d399;
        }

        .send-button {
          width: 100%;

          position: relative;
          overflow: hidden;

          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;

          margin-top: 18px;

          padding: 15px 20px;

          border: none;
          border-radius: 14px;

          color: white;

          font-size: 0.91rem;
          font-weight: 900;

          cursor: pointer;

          background:
            linear-gradient(
              100deg,
              #0891b2,
              #2563eb,
              #7c3aed
            );

          box-shadow:
            0 12px 35px
              rgba(37, 99, 235, 0.24);

          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease,
            opacity 0.25s ease;
        }

        .send-button::before {
          content: "";
          position: absolute;
          inset: 0;

          background:
            linear-gradient(
              110deg,
              transparent 20%,
              rgba(255, 255, 255, 0.22) 50%,
              transparent 80%
            );

          transform: translateX(-120%);
          transition: transform 0.6s ease;
        }

        .send-button:hover::before {
          transform: translateX(120%);
        }

        .send-button:hover:not(:disabled) {
          transform: translateY(-2px);

          box-shadow:
            0 16px 40px
              rgba(37, 99, 235, 0.36);
        }

        .send-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .send-button:disabled {
          cursor: not-allowed;
          opacity: 0.65;
        }

        .info-box {
          display: flex;
          gap: 12px;

          margin-top: 22px;
          padding: 14px;

          border-radius: 14px;

          background:
            rgba(15, 23, 42, 0.6);

          border:
            1px solid
            rgba(148, 163, 184, 0.08);
        }

        .info-icon {
          width: 32px;
          height: 32px;

          flex-shrink: 0;

          border-radius: 9px;

          display: flex;
          align-items: center;
          justify-content: center;

          color: #a5b4fc;

          background:
            rgba(99, 102, 241, 0.1);
        }

        .info-title {
          color: #cbd5e1;
          font-size: 0.77rem;
          font-weight: 800;
          margin-bottom: 3px;
        }

        .info-text {
          color: #64748b;
          font-size: 0.72rem;
          line-height: 1.5;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 7px;

          margin-top: 27px;

          color: #94a3b8;

          font-size: 0.82rem;
          font-weight: 700;

          text-decoration: none;

          transition:
            color 0.2s ease,
            transform 0.2s ease;
        }

        .back-link:hover {
          color: #67e8f9;
          transform: translateX(-3px);
        }

        .success-state {
          text-align: center;
        }

        .success-icon {
          width: 82px;
          height: 82px;

          margin: 0 auto 25px;

          border-radius: 26px;

          display: flex;
          align-items: center;
          justify-content: center;

          color: #6ee7b7;

          background:
            rgba(16, 185, 129, 0.09);

          border:
            1px solid
            rgba(16, 185, 129, 0.2);

          box-shadow:
            0 15px 45px
              rgba(16, 185, 129, 0.08);
        }

        .success-title {
          color: white;
          margin: 0;
          font-size: 2rem;
          font-weight: 950;
          letter-spacing: -0.05em;
        }

        .success-description {
          color: #94a3b8;
          font-size: 0.9rem;
          line-height: 1.7;
          margin: 13px auto 25px;
          max-width: 390px;
        }

        .email-highlight {
          display: inline-block;

          color: #67e8f9;

          font-weight: 800;

          word-break: break-word;
        }

        .steps {
          display: grid;
          gap: 10px;

          text-align: left;

          padding: 18px;

          border-radius: 16px;

          background:
            rgba(15, 23, 42, 0.55);

          border:
            1px solid
            rgba(148, 163, 184, 0.08);
        }

        .step {
          display: flex;
          align-items: center;
          gap: 10px;

          color: #94a3b8;
          font-size: 0.78rem;
        }

        .step-number {
          width: 23px;
          height: 23px;

          border-radius: 50%;

          display: flex;
          align-items: center;
          justify-content: center;

          flex-shrink: 0;

          color: #67e8f9;

          background:
            rgba(34, 211, 238, 0.08);

          border:
            1px solid
            rgba(34, 211, 238, 0.15);
        }

        .success-actions {
          display: flex;
          gap: 10px;

          margin-top: 20px;
        }

        .secondary-button {
          flex: 1;

          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;

          padding: 13px;

          border-radius: 12px;

          border:
            1px solid
            rgba(148, 163, 184, 0.13);

          background:
            rgba(15, 23, 42, 0.65);

          color: #cbd5e1;

          font-size: 0.78rem;
          font-weight: 800;

          cursor: pointer;

          transition: 0.2s ease;
        }

        .secondary-button:hover {
          border-color:
            rgba(34, 211, 238, 0.3);

          color: #67e8f9;
        }

        .toast {
          position: fixed;
          top: 25px;
          right: 25px;

          z-index: 99999;

          max-width: min(
            390px,
            calc(100vw - 40px)
          );

          display: flex;
          align-items: center;
          gap: 11px;

          padding: 13px 17px;

          border-radius: 14px;

          color: white;

          backdrop-filter: blur(20px);

          box-shadow:
            0 20px 50px
              rgba(0, 0, 0, 0.4);

          border:
            1px solid
            rgba(255, 255, 255, 0.12);
        }

        .toast-success {
          background:
            rgba(5, 150, 105, 0.88);
        }

        .toast-error {
          background:
            rgba(185, 28, 28, 0.9);
        }

        .toast-message {
          font-size: 0.8rem;
          font-weight: 700;
          line-height: 1.4;
        }

        .copyright {
          position: absolute;
          bottom: 18px;
          left: 50%;

          transform: translateX(-50%);

          color: #475569;

          font-size: 0.68rem;

          z-index: 2;
          white-space: nowrap;
        }

        @media (max-width: 900px) {
          .forgot-page {
            padding: 20px;
          }

          .auth-shell {
            max-width: 600px;
            grid-template-columns: 1fr;
            min-height: auto;
          }

          .brand-panel {
            display: none;
          }

          .form-panel {
            padding: 45px 32px;
          }

          .mobile-logo {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;

            color: white;
            font-weight: 900;

            margin-bottom: 35px;
          }
        }

        @media (max-width: 520px) {
          .forgot-page {
            padding: 14px;
          }

          .auth-shell {
            border-radius: 24px;
          }

          .form-panel {
            padding: 35px 22px;
          }

          .form-title {
            font-size: 2rem;
          }

          .success-actions {
            flex-direction: column;
          }

          .toast {
            top: 14px;
            right: 14px;
          }

          .copyright {
            display: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      {/* Background */}

      <div className="background-grid" />

      <motion.div
        className="orb orb-one"
        animate={{
          x: [0, 30, 0],
          y: [0, 20, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="orb orb-two"
        animate={{
          x: [0, -25, 0],
          y: [0, -25, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="orb orb-three"
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.5, 0.9, 0.5],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Toast */}

      <AnimatePresence>
        {toast.show && (
          <motion.div
            className={`toast ${
              toast.type === "success"
                ? "toast-success"
                : "toast-error"
            }`}
            initial={{
              opacity: 0,
              y: -20,
              x: 20,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              y: 0,
              x: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: -15,
              x: 20,
              scale: 0.95,
            }}
          >
            {toast.type === "success" ? (
              <FiCheckCircle size={19} />
            ) : (
              <FiAlertCircle size={19} />
            )}

            <span className="toast-message">
              {toast.message}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main */}

      <motion.div
        className="auth-shell"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Left Brand Panel */}

        <motion.section
          className="brand-panel"
          variants={itemVariants}
        >
          <div className="brand-top">
            <div className="logo-row">
              <div className="logo-mark">
                <FiShield size={22} />
              </div>

              <div className="brand-name">
                PREP<span>PULSE</span>
              </div>
            </div>

            <div className="eyebrow">
              <FiLock size={12} />
              Account Security
            </div>

            <h1 className="brand-heading">
              Secure your
              <br />
              <span className="gradient-text">
                learning journey.
              </span>
            </h1>

            <p className="brand-description">
              Forgot your password? No problem.
              We'll help you securely regain
              access to your PrepPulse account
              in just a few steps.
            </p>

            <div className="feature-list">
              <div className="feature">
                <span className="feature-icon">
                  <FiShield size={15} />
                </span>
                Secure password recovery
              </div>

              <div className="feature">
                <span className="feature-icon">
                  <FiMail size={15} />
                </span>
                Reset link sent to your email
              </div>

              <div className="feature">
                <span className="feature-icon">
                  <FiClock size={15} />
                </span>
                Quick and simple recovery
              </div>
            </div>
          </div>

          <div className="brand-footer">
            <span className="security-pill">
              <FiShield size={12} />
              Protected Account Recovery
            </span>
          </div>
        </motion.section>

        {/* Right Form Panel */}

        <section className="form-panel">
          <motion.div
            className="form-content"
            variants={itemVariants}
          >
            {/* Mobile logo */}

            <div className="mobile-logo">
              <div className="logo-mark">
                <FiShield size={20} />
              </div>

              PREP<span
                style={{
                  color: "#22d3ee",
                }}
              >
                PULSE
              </span>
            </div>

            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.div
                  key="form"
                  initial={{
                    opacity: 0,
                    x: 20,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  exit={{
                    opacity: 0,
                    x: -20,
                  }}
                  transition={{
                    duration: 0.35,
                  }}
                >
                  <motion.div
                    className="icon-container"
                    animate={{
                      y: [0, -4, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <div className="icon-ring" />

                    <FiMail
                      size={30}
                      color="#67e8f9"
                    />
                  </motion.div>

                  <div className="form-eyebrow">
                    Password Recovery
                  </div>

                  <h2 className="form-title">
                    Forgot your
                    <br />
                    password?
                  </h2>

                  <p className="form-subtitle">
                    Enter the email associated with
                    your PrepPulse account. We'll send
                    you a secure password reset link.
                  </p>

                  <form
                    onSubmit={handleSubmit}
                  >
                    <label className="input-label">
                      Registered Email
                    </label>

                    <div className="input-wrapper">
                      <FiMail
                        className="input-icon"
                        size={18}
                      />

                      <input
                        type="email"
                        value={email}
                        onChange={(e) =>
                          setEmail(
                            e.target.value
                          )
                        }
                        placeholder="you@example.com"
                        autoComplete="email"
                        autoFocus
                        disabled={loading}
                        className={`email-input ${
                          email
                            ? "has-value"
                            : ""
                        }`}
                      />

                      {isValidEmail(
                        email
                      ) && (
                        <FiCheck
                          className="input-check"
                          size={17}
                        />
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="send-button"
                    >
                      {loading ? (
                        <>
                          <motion.span
                            animate={{
                              rotate: 360,
                            }}
                            transition={{
                              repeat: Infinity,
                              duration: 0.8,
                              ease: "linear",
                            }}
                          >
                            <FiRefreshCw
                              size={18}
                            />
                          </motion.span>

                          Sending Secure Link...
                        </>
                      ) : (
                        <>
                          <FiSend
                            size={17}
                          />

                          Send Reset Link

                          <FiArrowRight
                            size={16}
                          />
                        </>
                      )}
                    </button>
                  </form>

                  <div className="info-box">
                    <div className="info-icon">
                      <FiShield
                        size={16}
                      />
                    </div>

                    <div>
                      <div className="info-title">
                        Your security matters
                      </div>

                      <div className="info-text">
                        The password reset process
                        is designed to keep your
                        account protected.
                      </div>
                    </div>
                  </div>

                  <Link
                    to="/login"
                    className="back-link"
                  >
                    <FiArrowLeft
                      size={15}
                    />
                    Back to Login
                  </Link>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  className="success-state"
                  initial={{
                    opacity: 0,
                    scale: 0.96,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  transition={{
                    duration: 0.4,
                  }}
                >
                  <motion.div
                    className="success-icon"
                    initial={{
                      scale: 0,
                      rotate: -15,
                    }}
                    animate={{
                      scale: 1,
                      rotate: 0,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 180,
                      damping: 12,
                    }}
                  >
                    <FiCheckCircle
                      size={38}
                    />
                  </motion.div>

                  <div className="form-eyebrow">
                    Email Sent
                  </div>

                  <h2 className="success-title">
                    Check your inbox
                  </h2>

                  <p className="success-description">
                    We've sent a secure password
                    reset link to{" "}
                    <span className="email-highlight">
                      {email}
                    </span>
                    .
                  </p>

                  <div className="steps">
                    <div className="step">
                      <span className="step-number">
                        <FiCheck
                          size={12}
                        />
                      </span>

                      Open the email from
                      PrepPulse.
                    </div>

                    <div className="step">
                      <span className="step-number">
                        <FiCheck
                          size={12}
                        />
                      </span>

                      Click the secure reset
                      link.
                    </div>

                    <div className="step">
                      <span className="step-number">
                        <FiCheck
                          size={12}
                        />
                      </span>

                      Create your new
                      password.
                    </div>
                  </div>

                  <div className="success-actions">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() =>
                        setSubmitted(
                          false
                        )
                      }
                    >
                      <FiArrowLeft
                        size={15}
                      />
                      Change Email
                    </button>

                    <button
                      type="button"
                      className="secondary-button"
                      onClick={handleResend}
                      disabled={loading}
                    >
                      {loading ? (
                        <motion.span
                          animate={{
                            rotate: 360,
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 0.8,
                            ease: "linear",
                          }}
                        >
                          <FiRefreshCw
                            size={15}
                          />
                        </motion.span>
                      ) : (
                        <FiRefreshCw
                          size={15}
                        />
                      )}

                      Resend
                    </button>
                  </div>

                  <Link
                    to="/login"
                    className="back-link"
                  >
                    <FiArrowLeft
                      size={15}
                    />
                    Return to Login
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </section>
      </motion.div>

      <div className="copyright">
        © {new Date().getFullYear()} PrepPulse
        • Learn. Practice. Get Ready.
      </div>
    </div>
  );
}

export default ForgotPassword;