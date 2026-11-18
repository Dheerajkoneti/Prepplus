import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import {
  FiLock,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiEye,
  FiEyeOff,
  FiArrowLeft,
  FiShield,
  FiKey,
  FiCheck,
  FiX,
  FiZap,
} from "react-icons/fi";

import API from "../../services/api";


// ======================================================
// RESET PASSWORD
// ======================================================

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  // ====================================================
  // STATE
  // ====================================================

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [focusedInput, setFocusedInput] =
    useState("");

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });


  // ====================================================
  // TOAST
  // ====================================================

  const showToast = (
    message,
    type = "success"
  ) => {
    setToast({
      show: true,
      message,
      type,
    });

    setTimeout(() => {
      setToast({
        show: false,
        message: "",
        type: "success",
      });
    }, 3500);
  };


  // ====================================================
  // PASSWORD RULES
  // ====================================================

  const hasMinLength =
    password.length >= 8;

  const hasUpper =
    /[A-Z]/.test(password);

  const hasLower =
    /[a-z]/.test(password);

  const hasNumber =
    /[0-9]/.test(password);

  const hasSpecial =
    /[^A-Za-z0-9]/.test(password);

  const passwordsMatch =
    password.length > 0 &&
    password === confirmPassword;


  // ====================================================
  // PASSWORD STRENGTH
  // ====================================================

  const passwordStrength = useMemo(() => {

    if (!password) {
      return {
        score: 0,
        label: "Enter a password",
        color: "#475569",
      };
    }

    let score = 0;

    if (password.length >= 8)
      score++;

    if (password.length >= 12)
      score++;

    if (hasUpper)
      score++;

    if (hasLower)
      score++;

    if (hasNumber)
      score++;

    if (hasSpecial)
      score++;


    if (score <= 2) {
      return {
        score: 1,
        label: "Weak",
        color: "#ef4444",
      };
    }

    if (score <= 3) {
      return {
        score: 2,
        label: "Fair",
        color: "#f59e0b",
      };
    }

    if (score <= 4) {
      return {
        score: 3,
        label: "Good",
        color: "#3b82f6",
      };
    }

    return {
      score: 4,
      label: "Strong",
      color: "#22c55e",
    };

  }, [
    password,
    hasUpper,
    hasLower,
    hasNumber,
    hasSpecial,
  ]);


  // ====================================================
  // PASSWORD VALIDATION
  // ====================================================

  const isPasswordValid =
    hasMinLength &&
    hasUpper &&
    hasLower &&
    hasNumber &&
    hasSpecial &&
    passwordsMatch;


  // ====================================================
  // SUBMIT
  // ====================================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!token) {

      showToast(
        "Invalid or missing password reset link.",
        "error"
      );

      return;
    }


    if (!isPasswordValid) {

      showToast(
        "Please meet all password requirements.",
        "error"
      );

      return;
    }


    try {

      setLoading(true);

      const res = await API.post(
        `/auth/reset-password/${token}`,
        {
          password,
        }
      );


      showToast(
        res.data.message ||
          "Password reset successful! 🚀",
        "success"
      );


      setTimeout(() => {

        navigate("/login");

      }, 2200);

    } catch (error) {

      console.error(
        "Reset password error:",
        error
      );

      showToast(
        error.response?.data?.message ||
          "Password reset failed. Please try again.",
        "error"
      );

    } finally {

      setLoading(false);

    }

  };


  // ====================================================
  // REQUIREMENT COMPONENT
  // ====================================================

  const Requirement = ({
    valid,
    children,
  }) => {

    return (
      <motion.div
        animate={{
          x: valid ? 2 : 0,
        }}
        transition={{
          duration: 0.2,
        }}
        style={{
          ...styles.requirement,
          color: valid
            ? "#22c55e"
            : "#64748b",
        }}
      >

        <div
          style={{
            ...styles.requirementIcon,
            background: valid
              ? "rgba(34,197,94,.12)"
              : "rgba(100,116,139,.08)",
            borderColor: valid
              ? "rgba(34,197,94,.25)"
              : "rgba(100,116,139,.15)",
          }}
        >

          {valid ? (
            <FiCheck size={11} />
          ) : (
            <FiX size={11} />
          )}

        </div>

        <span>
          {children}
        </span>

      </motion.div>
    );
  };


  // ====================================================
  // PAGE
  // ====================================================

  return (

    <div style={styles.page}>

      {/* ==================================================
          BACKGROUND
      ================================================== */}

      <div style={styles.backgroundGrid} />

      <motion.div
        style={{
          ...styles.orb,
          ...styles.orbOne,
        }}
        animate={{
          x: [0, 40, 0],
          y: [0, -30, 0],
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        style={{
          ...styles.orb,
          ...styles.orbTwo,
        }}
        animate={{
          x: [0, -30, 0],
          y: [0, 30, 0],
          scale: [1, 1.12, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />


      {/* ==================================================
          TOAST
      ================================================== */}

      <AnimatePresence>

        {toast.show && (

          <motion.div
            initial={{
              opacity: 0,
              y: -30,
              scale: 0.9,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: -20,
              scale: 0.95,
            }}
            style={{
              ...styles.toast,
              background:
                toast.type === "success"
                  ? "rgba(16,185,129,.95)"
                  : "rgba(239,68,68,.95)",
            }}
          >

            {toast.type === "success" ? (
              <FiCheckCircle size={21} />
            ) : (
              <FiAlertCircle size={21} />
            )}

            <span>
              {toast.message}
            </span>

          </motion.div>

        )}

      </AnimatePresence>


      {/* ==================================================
          MAIN CONTENT
      ================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          y: 25,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.55,
        }}
        style={styles.wrapper}
      >

        {/* =================================================
            BRAND
        ================================================= */}

        <div style={styles.brand}>

          <motion.div
            initial={{
              scale: 0.7,
              rotate: -10,
            }}
            animate={{
              scale: 1,
              rotate: 0,
            }}
            transition={{
              duration: 0.5,
              type: "spring",
            }}
            style={styles.brandIcon}
          >
            <span>⚡</span>
          </motion.div>

          <div>

            <div style={styles.brandName}>
              PrepPulse
            </div>

            <div style={styles.brandTagline}>
              Your preparation. Your progress.
            </div>

          </div>

        </div>


        {/* =================================================
            CARD
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            scale: 0.96,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            duration: 0.45,
            delay: 0.1,
          }}
          style={styles.card}
        >

          {/* TOP GLOW */}

          <div style={styles.cardGlow} />


          {/* =================================================
              ICON
          ================================================= */}

          <div style={styles.hero}>

            <motion.div
              animate={{
                boxShadow: [
                  "0 0 0 rgba(6,182,212,0)",
                  "0 0 35px rgba(6,182,212,.25)",
                  "0 0 0 rgba(6,182,212,0)",
                ],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
              }}
              style={styles.lockIcon}
            >

              <FiShield
                size={30}
                strokeWidth={1.7}
              />

              <div style={styles.lockBadge}>
                <FiCheck size={11} />
              </div>

            </motion.div>


            <h1 style={styles.title}>
              Create a New Password
            </h1>

            <p style={styles.subtitle}>
              Secure your PrepPulse account with
              a strong new password.
            </p>

          </div>


          {/* =================================================
              SECURITY BANNER
          ================================================= */}

          <div style={styles.securityBanner}>

            <div style={styles.securityBannerIcon}>
              <FiLock size={17} />
            </div>

            <div>

              <strong style={styles.securityTitle}>
                Secure password reset
              </strong>

              <p style={styles.securityText}>
                Your reset link is protected and
                can only be used for this account.
              </p>

            </div>

          </div>


          {/* =================================================
              FORM
          ================================================= */}

          <form onSubmit={handleSubmit}>


            {/* =================================================
                NEW PASSWORD
            ================================================= */}

            <div style={styles.field}>

              <label style={styles.label}>
                New Password
              </label>

              <div
                style={{
                  ...styles.inputWrapper,
                  borderColor:
                    focusedInput === "password"
                      ? "#06b6d4"
                      : isPasswordValid &&
                        password
                      ? "rgba(34,197,94,.6)"
                      : "rgba(148,163,184,.15)",
                  boxShadow:
                    focusedInput === "password"
                      ? "0 0 0 4px rgba(6,182,212,.08)"
                      : "none",
                }}
              >

                <FiKey
                  size={18}
                  style={styles.inputIcon}
                />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your new password"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  onFocus={() =>
                    setFocusedInput(
                      "password"
                    )
                  }
                  onBlur={() =>
                    setFocusedInput("")
                  }
                  disabled={loading}
                  required
                  autoComplete="new-password"
                  style={styles.input}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  style={styles.eyeButton}
                  tabIndex={-1}
                >

                  {showPassword ? (
                    <FiEyeOff size={19} />
                  ) : (
                    <FiEye size={19} />
                  )}

                </button>

              </div>


              {/* STRENGTH */}

              {password && (

                <motion.div
                  initial={{
                    opacity: 0,
                    height: 0,
                  }}
                  animate={{
                    opacity: 1,
                    height: "auto",
                  }}
                  style={styles.strengthContainer}
                >

                  <div
                    style={
                      styles.strengthHeader
                    }
                  >

                    <span>
                      Password strength
                    </span>

                    <span
                      style={{
                        color:
                          passwordStrength.color,
                        fontWeight: 800,
                      }}
                    >
                      {
                        passwordStrength.label
                      }
                    </span>

                  </div>


                  <div style={styles.strengthBars}>

                    {[1, 2, 3, 4].map(
                      (bar) => (

                        <motion.div
                          key={bar}
                          animate={{
                            opacity:
                              bar <=
                              passwordStrength.score
                                ? 1
                                : 0.2,
                          }}
                          style={{
                            ...styles.strengthBar,
                            background:
                              bar <=
                              passwordStrength.score
                                ? passwordStrength.color
                                : "#334155",
                          }}
                        />

                      )
                    )}

                  </div>

                </motion.div>

              )}

            </div>


            {/* =================================================
                CONFIRM PASSWORD
            ================================================= */}

            <div style={styles.field}>

              <label style={styles.label}>
                Confirm Password
              </label>

              <div
                style={{
                  ...styles.inputWrapper,
                  borderColor:
                    focusedInput ===
                    "confirm"
                      ? "#06b6d4"
                      : passwordsMatch
                      ? "rgba(34,197,94,.6)"
                      : "rgba(148,163,184,.15)",
                  boxShadow:
                    focusedInput ===
                    "confirm"
                      ? "0 0 0 4px rgba(6,182,212,.08)"
                      : "none",
                }}
              >

                <FiLock
                  size={18}
                  style={styles.inputIcon}
                />

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Confirm your new password"
                  value={
                    confirmPassword
                  }
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  onFocus={() =>
                    setFocusedInput(
                      "confirm"
                    )
                  }
                  onBlur={() =>
                    setFocusedInput("")
                  }
                  disabled={loading}
                  required
                  autoComplete="new-password"
                  style={styles.input}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  style={styles.eyeButton}
                  tabIndex={-1}
                >

                  {showConfirmPassword ? (
                    <FiEyeOff size={19} />
                  ) : (
                    <FiEye size={19} />
                  )}

                </button>

              </div>


              {confirmPassword && (

                <motion.div
                  initial={{
                    opacity: 0,
                    y: -5,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  style={{
                    ...styles.matchMessage,
                    color: passwordsMatch
                      ? "#22c55e"
                      : "#ef4444",
                  }}
                >

                  {passwordsMatch ? (
                    <>
                      <FiCheck />
                      Passwords match
                    </>
                  ) : (
                    <>
                      <FiX />
                      Passwords do not match
                    </>
                  )}

                </motion.div>

              )}

            </div>


            {/* =================================================
                REQUIREMENTS
            ================================================= */}

            <div style={styles.requirementsCard}>

              <div
                style={
                  styles.requirementsHeader
                }
              >

                <div
                  style={
                    styles.requirementsIcon
                  }
                >
                  <FiShield size={16} />
                </div>

                <div>

                  <div
                    style={
                      styles.requirementsTitle
                    }
                  >
                    Password Requirements
                  </div>

                  <div
                    style={
                      styles.requirementsSubtitle
                    }
                  >
                    Make your password stronger
                  </div>

                </div>

              </div>


              <div style={styles.requirementsGrid}>

                <Requirement
                  valid={hasMinLength}
                >
                  At least 8 characters
                </Requirement>

                <Requirement
                  valid={hasUpper}
                >
                  One uppercase letter
                </Requirement>

                <Requirement
                  valid={hasLower}
                >
                  One lowercase letter
                </Requirement>

                <Requirement
                  valid={hasNumber}
                >
                  One number
                </Requirement>

                <Requirement
                  valid={hasSpecial}
                >
                  One special character
                </Requirement>

                <Requirement
                  valid={passwordsMatch}
                >
                  Passwords match
                </Requirement>

              </div>

            </div>


            {/* =================================================
                SUBMIT
            ================================================= */}

            <motion.button
              whileHover={{
                y: -2,
              }}
              whileTap={{
                scale: 0.98,
              }}
              type="submit"
              disabled={
                loading ||
                !isPasswordValid
              }
              style={{
                ...styles.submitButton,
                opacity:
                  loading ||
                  !isPasswordValid
                    ? 0.55
                    : 1,
                cursor:
                  loading ||
                  !isPasswordValid
                    ? "not-allowed"
                    : "pointer",
              }}
            >

              {loading ? (

                <>

                  <motion.div
                    animate={{
                      rotate: 360,
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 1,
                      ease: "linear",
                    }}
                  >
                    <FiRefreshCw
                      size={19}
                    />
                  </motion.div>

                  Updating Password...

                </>

              ) : (

                <>

                  <FiZap size={18} />

                  Update Password

                </>

              )}

            </motion.button>

          </form>


          {/* =================================================
              BACK TO LOGIN
          ================================================= */}

          <button
            type="button"
            onClick={() =>
              navigate("/login")
            }
            style={styles.backButton}
          >

            <FiArrowLeft size={16} />

            Back to Login

          </button>


          {/* =================================================
              FOOTER SECURITY
          ================================================= */}

          <div style={styles.footerSecurity}>

            <FiShield size={14} />

            <span>
              Protected by PrepPulse Security
            </span>

            <span style={styles.dot}>
              •
            </span>

            <span>
              Your password is encrypted
            </span>

          </div>

        </motion.div>


        {/* =================================================
            BOTTOM TEXT
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 0.5,
          }}
          style={styles.bottomText}
        >

          <span>
            Need help?
          </span>

          <button
            onClick={() =>
              navigate("/login")
            }
            style={styles.helpButton}
          >
            Return to login
          </button>

        </motion.div>

      </motion.div>

    </div>
  );
}


// ======================================================
// STYLES
// ======================================================

const styles = {

  // ====================================================
  // PAGE
  // ====================================================

  page: {
    minHeight: "100vh",
    width: "100%",
    position: "relative",
    overflow: "hidden",

    display: "flex",
    justifyContent: "center",
    alignItems: "center",

    padding: "35px 20px",

    background:
      "radial-gradient(circle at 50% -10%, rgba(6,182,212,.12), transparent 35%), linear-gradient(135deg, #020617 0%, #07111f 48%, #020617 100%)",

    color: "#f8fafc",

    boxSizing: "border-box",
  },


  backgroundGrid: {
    position: "absolute",
    inset: 0,

    backgroundImage:
      "linear-gradient(rgba(148,163,184,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,.035) 1px, transparent 1px)",

    backgroundSize:
      "50px 50px",

    maskImage:
      "linear-gradient(to bottom, black, transparent 80%)",

    pointerEvents: "none",
  },


  orb: {
    position: "absolute",
    borderRadius: "50%",
    filter: "blur(80px)",
    pointerEvents: "none",
  },


  orbOne: {
    width: "350px",
    height: "350px",
    background:
      "rgba(6,182,212,.08)",
    top: "-130px",
    left: "-120px",
  },


  orbTwo: {
    width: "400px",
    height: "400px",
    background:
      "rgba(59,130,246,.07)",
    bottom: "-180px",
    right: "-150px",
  },


  // ====================================================
  // TOAST
  // ====================================================

  toast: {
    position: "fixed",
    top: "25px",
    right: "25px",
    zIndex: 9999,

    maxWidth: "420px",

    display: "flex",
    alignItems: "center",
    gap: "10px",

    padding: "14px 19px",

    borderRadius: "14px",

    color: "#fff",

    fontSize: "14px",
    fontWeight: 700,

    boxShadow:
      "0 20px 50px rgba(0,0,0,.45)",

    border:
      "1px solid rgba(255,255,255,.15)",

    backdropFilter: "blur(15px)",
  },


  // ====================================================
  // WRAPPER
  // ====================================================

  wrapper: {
    width: "100%",
    maxWidth: "520px",
    position: "relative",
    zIndex: 2,
  },


  // ====================================================
  // BRAND
  // ====================================================

  brand: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    marginBottom: "20px",
  },


  brandIcon: {
    width: "43px",
    height: "43px",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    borderRadius: "13px",

    background:
      "linear-gradient(135deg, #06b6d4, #2563eb)",

    boxShadow:
      "0 10px 30px rgba(6,182,212,.25)",

    fontSize: "21px",
  },


  brandName: {
    fontSize: "18px",
    fontWeight: 900,
    letterSpacing: "-.4px",
  },


  brandTagline: {
    color: "#64748b",
    fontSize: "10px",
    marginTop: "2px",
  },


  // ====================================================
  // CARD
  // ====================================================

  card: {
    position: "relative",
    overflow: "hidden",

    padding: "34px",

    borderRadius: "28px",

    background:
      "linear-gradient(145deg, rgba(15,23,42,.94), rgba(8,15,30,.96))",

    border:
      "1px solid rgba(148,163,184,.12)",

    boxShadow:
      "0 35px 100px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.04)",

    backdropFilter:
      "blur(25px)",
  },


  cardGlow: {
    position: "absolute",
    width: "280px",
    height: "180px",

    top: "-100px",
    left: "50%",

    transform:
      "translateX(-50%)",

    background:
      "rgba(6,182,212,.08)",

    filter: "blur(60px)",

    pointerEvents: "none",
  },


  // ====================================================
  // HERO
  // ====================================================

  hero: {
    position: "relative",
    textAlign: "center",
    marginBottom: "25px",
  },


  lockIcon: {
    width: "72px",
    height: "72px",

    margin:
      "0 auto 18px",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    borderRadius: "22px",

    position: "relative",

    color: "#67e8f9",

    background:
      "linear-gradient(145deg, rgba(6,182,212,.14), rgba(37,99,235,.10))",

    border:
      "1px solid rgba(6,182,212,.25)",
  },


  lockBadge: {
    position: "absolute",

    right: "-5px",
    bottom: "-5px",

    width: "23px",
    height: "23px",

    borderRadius: "50%",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    background: "#22c55e",
    color: "#fff",

    border:
      "3px solid #0f172a",
  },


  title: {
    margin: 0,

    fontSize: "27px",
    lineHeight: 1.2,

    fontWeight: 900,

    letterSpacing: "-.7px",

    color: "#f8fafc",
  },


  subtitle: {
    maxWidth: "400px",

    margin:
      "10px auto 0",

    color: "#94a3b8",

    fontSize: "14px",
    lineHeight: 1.6,
  },


  // ====================================================
  // SECURITY BANNER
  // ====================================================

  securityBanner: {
    display: "flex",
    alignItems: "center",
    gap: "12px",

    padding: "13px",

    marginBottom: "24px",

    borderRadius: "14px",

    background:
      "linear-gradient(135deg, rgba(6,182,212,.07), rgba(59,130,246,.05))",

    border:
      "1px solid rgba(6,182,212,.12)",
  },


  securityBannerIcon: {
    width: "38px",
    height: "38px",

    flexShrink: 0,

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    borderRadius: "10px",

    background:
      "rgba(6,182,212,.1)",

    color: "#22d3ee",
  },


  securityTitle: {
    display: "block",

    fontSize: "12px",

    color: "#e2e8f0",

    marginBottom: "2px",
  },


  securityText: {
    margin: 0,

    color: "#64748b",

    fontSize: "11px",

    lineHeight: 1.4,
  },


  // ====================================================
  // FORM
  // ====================================================

  field: {
    marginBottom: "18px",
  },


  label: {
    display: "block",

    marginBottom: "8px",

    color: "#cbd5e1",

    fontSize: "12px",

    fontWeight: 800,
  },


  inputWrapper: {
    width: "100%",

    display: "flex",
    alignItems: "center",

    minHeight: "52px",

    borderRadius: "14px",

    background:
      "rgba(2,6,23,.65)",

    border:
      "1px solid rgba(148,163,184,.15)",

    transition:
      "border-color .2s, box-shadow .2s",
  },


  inputIcon: {
    flexShrink: 0,

    marginLeft: "15px",

    color: "#64748b",
  },


  input: {
    flex: 1,

    minWidth: 0,

    padding:
      "14px 10px 14px 12px",

    border: "none",
    outline: "none",

    background: "transparent",

    color: "#f8fafc",

    fontSize: "14px",

    fontFamily:
      "inherit",
  },


  eyeButton: {
    width: "48px",
    height: "50px",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    flexShrink: 0,

    border: "none",

    background:
      "transparent",

    color: "#64748b",

    cursor: "pointer",
  },


  // ====================================================
  // STRENGTH
  // ====================================================

  strengthContainer: {
    marginTop: "9px",
  },


  strengthHeader: {
    display: "flex",
    justifyContent: "space-between",

    fontSize: "10px",

    color: "#64748b",

    marginBottom: "6px",
  },


  strengthBars: {
    display: "grid",

    gridTemplateColumns:
      "repeat(4, 1fr)",

    gap: "5px",
  },


  strengthBar: {
    height: "4px",

    borderRadius: "10px",

    transition:
      "background .25s",
  },


  // ====================================================
  // MATCH
  // ====================================================

  matchMessage: {
    display: "flex",
    alignItems: "center",
    gap: "5px",

    marginTop: "7px",

    fontSize: "11px",
    fontWeight: 700,
  },


  // ====================================================
  // REQUIREMENTS
  // ====================================================

  requirementsCard: {
    marginBottom: "20px",

    padding: "15px",

    borderRadius: "16px",

    background:
      "rgba(2,6,23,.4)",

    border:
      "1px solid rgba(148,163,184,.09)",
  },


  requirementsHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",

    marginBottom: "13px",
  },


  requirementsIcon: {
    width: "34px",
    height: "34px",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    borderRadius: "9px",

    background:
      "rgba(6,182,212,.08)",

    color: "#22d3ee",
  },


  requirementsTitle: {
    fontSize: "12px",
    fontWeight: 800,
    color: "#e2e8f0",
  },


  requirementsSubtitle: {
    fontSize: "10px",
    color: "#64748b",
    marginTop: "2px",
  },


  requirementsGrid: {
    display: "grid",

    gridTemplateColumns:
      "repeat(2, 1fr)",

    gap: "7px",
  },


  requirement: {
    display: "flex",
    alignItems: "center",
    gap: "7px",

    fontSize: "10px",

    transition:
      "color .2s",
  },


  requirementIcon: {
    width: "19px",
    height: "19px",

    flexShrink: 0,

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    borderRadius: "50%",

    border: "1px solid",

    transition:
      "all .2s",
  },


  // ====================================================
  // SUBMIT
  // ====================================================

  submitButton: {
    width: "100%",

    minHeight: "53px",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    gap: "9px",

    border: "none",

    borderRadius: "14px",

    background:
      "linear-gradient(135deg, #06b6d4, #2563eb)",

    color: "#fff",

    fontSize: "14px",
    fontWeight: 900,

    boxShadow:
      "0 12px 30px rgba(6,182,212,.18)",

    transition:
      "transform .2s, box-shadow .2s",
  },


  // ====================================================
  // BACK BUTTON
  // ====================================================

  backButton: {
    width: "100%",

    marginTop: "14px",

    padding: "11px",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    gap: "7px",

    border: "none",

    background:
      "transparent",

    color: "#64748b",

    fontSize: "12px",

    fontWeight: 700,

    cursor: "pointer",

    transition:
      "color .2s",
  },


  // ====================================================
  // FOOTER
  // ====================================================

  footerSecurity: {
    marginTop: "19px",
    paddingTop: "17px",

    borderTop:
      "1px solid rgba(148,163,184,.08)",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    flexWrap: "wrap",

    gap: "6px",

    color: "#475569",

    fontSize: "9px",
  },


  dot: {
    color: "#334155",
  },


  // ====================================================
  // BOTTOM
  // ====================================================

  bottomText: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "6px",

    marginTop: "18px",

    color: "#475569",

    fontSize: "11px",
  },


  helpButton: {
    border: "none",
    background: "transparent",

    color: "#22d3ee",

    fontWeight: 700,

    cursor: "pointer",

    padding: 0,
  },

};


export default ResetPassword;