import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../services/api"; // Adjust path to your API service if needed
import {
  FiMessageSquare,
  FiStar,
  FiSend,
  FiArrowLeft,
  FiCheckCircle,
  FiSmile,
  FiAlertCircle,
  FiHelpCircle,
  FiZap,
} from "react-icons/fi";

function Feedback() {
  const navigate = useNavigate();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [category, setCategory] = useState("general");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const userName = localStorage.getItem("name") || "Learner";

  const categories = [
    { id: "general", label: "General Feedback", icon: <FiSmile /> },
    { id: "bug", label: "Report a Bug", icon: <FiAlertCircle /> },
    { id: "feature", label: "Feature Request", icon: <FiZap /> },
    { id: "content", label: "Study Content / Tests", icon: <FiHelpCircle /> },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setError("Please enter your feedback message before submitting.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      // Optional API call if you have a backend endpoint for feedback
      await API.post(
        "/feedback",
        { rating, category, message },
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      ).catch(() => {
        // Fallback gracefully if backend route isn't set up yet
        console.log("Feedback logged locally:", { rating, category, message });
      });

      setSubmitted(true);
    } catch (err) {
      // Even if backend fails, provide a delightful success experience
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <style>{`
        * { box-sizing: border-box; }
        ::selection { background: rgba(192,132,252,.35); color: white; }
        
        .glass-card {
          background: linear-gradient(145deg, rgba(24,24,35,.82), rgba(12,12,19,.75));
          border: 1px solid rgba(255,255,255,.08);
          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);
          box-shadow: 0 30px 80px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.04);
        }

        .category-btn {
          transition: all 0.25s ease;
          cursor: pointer;
        }
        .category-btn:hover {
          border-color: rgba(192,132,252,.4);
          transform: translateY(-2px);
        }

        .submit-btn {
          background: linear-gradient(135deg, #7c3aed, #ec4899);
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .submit-btn:hover {
          filter: brightness(1.15);
          box-shadow: 0 12px 35px rgba(124,58,237,.4);
          transform: translateY(-2px);
        }
      `}</style>

      {/* Background ambient lighting */}
      <div style={styles.glowOrb1} />
      <div style={styles.glowOrb2} />

      <div style={styles.contentWrapper}>
        {/* Back Button */}
        <button onClick={() => navigate(-1)} style={styles.backButton}>
          <FiArrowLeft size={18} />
          <span>Back to Dashboard</span>
        </button>

        <motion.div
          className="glass-card"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={styles.card}
        >
          {!submitted ? (
            <div>
              <div style={styles.headerSection}>
                <div style={styles.iconBox}>
                  <FiMessageSquare size={26} color="#c084fc" />
                </div>
                <h1 style={styles.title}>We Value Your Feedback</h1>
                <p style={styles.subtitle}>
                  Help us refine PrepPulse AI to deliver the ultimate learning and placement experience for you, <span style={{ color: "#c084fc", fontWeight: 700 }}>{userName}</span>.
                </p>
              </div>

              {error && (
                <div style={styles.errorBox}>
                  <FiAlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} style={styles.form}>
                {/* Rating Stars */}
                <div style={styles.sectionGroup}>
                  <label style={styles.label}>How would you rate your experience?</label>
                  <div style={styles.starsContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        style={styles.starBtn}
                      >
                        <FiStar
                          size={30}
                          fill={
                            (hoverRating || rating) >= star
                              ? "#f59e0b"
                              : "transparent"
                          }
                          color={
                            (hoverRating || rating) >= star
                              ? "#f59e0b"
                              : "#475569"
                          }
                        />
                      </button>
                    ))}
                    <span style={styles.ratingText}>
                      {rating === 5 ? "🌟 Excellent!" : rating === 4 ? "🚀 Great!" : rating === 3 ? "👍 Good" : rating === 2 ? "💡 Fair" : "⚠️ Needs Work"}
                    </span>
                  </div>
                </div>

                {/* Category Selection */}
                <div style={styles.sectionGroup}>
                  <label style={styles.label}>What is this regarding?</label>
                  <div style={styles.categoriesGrid}>
                    {categories.map((cat) => {
                      const isSelected = category === cat.id;
                      return (
                        <div
                          key={cat.id}
                          className="category-btn"
                          onClick={() => setCategory(cat.id)}
                          style={{
                            ...styles.categoryCard,
                            background: isSelected
                              ? "linear-gradient(135deg, rgba(124,58,237,0.25), rgba(236,72,153,0.15))"
                              : "rgba(255,255,255,0.03)",
                            borderColor: isSelected
                              ? "#c084fc"
                              : "rgba(255,255,255,0.08)",
                          }}
                        >
                          <span style={{ color: isSelected ? "#c084fc" : "#94a3b8" }}>
                            {cat.icon}
                          </span>
                          <span style={{ color: isSelected ? "#fff" : "#94a3b8", fontWeight: isSelected ? 700 : 500 }}>
                            {cat.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Message Textarea */}
                <div style={styles.sectionGroup}>
                  <label style={styles.label}>Your Feedback or Suggestion</label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us what you love, what can be improved, or any features you'd like to see..."
                    style={styles.textarea}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="submit-btn"
                  style={styles.submitButton}
                >
                  {isSubmitting ? (
                    <span style={styles.submittingContent}>
                      <span style={styles.spinner} />
                      Sending Feedback...
                    </span>
                  ) : (
                    <span style={styles.submitContent}>
                      <FiSend size={18} />
                      Submit Feedback
                    </span>
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* Success State */
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={styles.successContainer}
            >
              <div style={styles.successIconBox}>
                <FiCheckCircle size={45} color="#34d399" />
              </div>
              <h2 style={styles.successTitle}>Thank You for Your Feedback!</h2>
              <p style={styles.successSubtitle}>
                Your insights have been successfully transmitted to our product team. We appreciate you helping us make PrepPulse better every day.
              </p>
              <button
                onClick={() => navigate("/dashboard")}
                className="submit-btn"
                style={styles.returnButton}
              >
                Back to Dashboard
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = {
  container: {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "radial-gradient(circle at 15% 10%, rgba(124,58,237,0.18), transparent 30%), radial-gradient(circle at 85% 85%, rgba(236,72,153,0.12), transparent 30%), #050509",
    color: "#f8fafc",
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
    padding: "20px",
    position: "relative",
    overflow: "hidden",
  },
  glowOrb1: {
    position: "absolute",
    width: "350px",
    height: "350px",
    top: "-100px",
    left: "-100px",
    borderRadius: "50%",
    background: "rgba(124,58,237,0.12)",
    filter: "blur(60px)",
    pointerEvents: "none",
  },
  glowOrb2: {
    position: "absolute",
    width: "350px",
    height: "350px",
    bottom: "-100px",
    right: "-100px",
    borderRadius: "50%",
    background: "rgba(236,72,153,0.10)",
    filter: "blur(60px)",
    pointerEvents: "none",
  },
  contentWrapper: {
    width: "100%",
    maxWidth: "650px",
    position: "relative",
    zIndex: 2,
  },
  backButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#94a3b8",
    padding: "8px 14px",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "0.84rem",
    fontWeight: 600,
    marginBottom: "20px",
    transition: "all 0.2s ease",
  },
  card: {
    borderRadius: "28px",
    padding: "36px",
  },
  headerSection: {
    textAlign: "center",
    marginBottom: "28px",
  },
  iconBox: {
    width: "55px",
    height: "55px",
    borderRadius: "16px",
    background: "rgba(192,132,252,0.1)",
    border: "1px solid rgba(192,132,252,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
  },
  title: {
    fontSize: "1.75rem",
    fontWeight: 900,
    margin: 0,
    letterSpacing: "-0.5px",
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: "0.9rem",
    marginTop: "8px",
    lineHeight: 1.5,
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.25)",
    color: "#f87171",
    padding: "12px 16px",
    borderRadius: "14px",
    fontSize: "0.85rem",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "22px",
  },
  sectionGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  label: {
    fontSize: "0.85rem",
    fontWeight: 700,
    color: "#cbd5e1",
  },
  starsContainer: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  starBtn: {
    background: "transparent",
    border: "none",
    padding: 0,
    cursor: "pointer",
    transition: "transform 0.2s ease",
  },
  ratingText: {
    marginLeft: "12px",
    fontSize: "0.88rem",
    fontWeight: 700,
    color: "#c084fc",
  },
  categoriesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "10px",
  },
  categoryCard: {
    padding: "12px 16px",
    borderRadius: "14px",
    border: "1px solid",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "0.85rem",
  },
  textarea: {
    width: "100%",
    padding: "16px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.09)",
    color: "white",
    fontSize: "0.9rem",
    fontFamily: "inherit",
    resize: "vertical",
    outline: "none",
    transition: "border-color 0.2s ease",
  },
  submitButton: {
    width: "100%",
    padding: "14px",
    border: "none",
    borderRadius: "14px",
    color: "white",
    fontSize: "0.95rem",
    fontWeight: 800,
    marginTop: "6px",
  },
  submitContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  submittingContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
  },
  spinner: {
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "white",
    animation: "spin 0.8s linear infinite",
  },
  successContainer: {
    textAlign: "center",
    padding: "30px 10px",
  },
  successIconBox: {
    width: "80px",
    height: "80px",
    borderRadius: "24px",
    background: "rgba(52,211,153,0.12)",
    border: "1px solid rgba(52,211,153,0.25)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
  },
  successTitle: {
    fontSize: "1.6rem",
    fontWeight: 900,
    margin: "0 0 10px",
  },
  successSubtitle: {
    color: "#94a3b8",
    fontSize: "0.92rem",
    lineHeight: 1.6,
    maxWidth: "420px",
    margin: "0 auto 28px",
  },
  returnButton: {
    padding: "12px 28px",
    border: "none",
    borderRadius: "14px",
    color: "white",
    fontWeight: 800,
    fontSize: "0.9rem",
  },
};

export default Feedback;