import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import {
  FiUser,
  FiMail,
  FiPhone,
  FiShield,
  FiCheckCircle,
  FiAlertCircle,
  FiEdit2,
  FiLock,
  FiLogOut,
  FiRefreshCw,
  FiX,
  FiSave,
  FiAward,
  FiCpu,
  FiCamera,
  FiLock as FiLockIcon,
  FiFileText,
  FiChevronRight,
  FiTarget,
  FiMessageSquare,
  FiTrendingUp,
} from "react-icons/fi";

import { FaFire } from "react-icons/fa";
import API from "../../services/api";

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // PROFILE IMAGE
  // =====================================================

  const [profileImage, setProfileImage] = useState(
    localStorage.getItem("profileImage") || ""
  );

  // =====================================================
  // PROFILE EDIT
  // =====================================================

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  // =====================================================
  // PASSWORD
  // =====================================================

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [actionLoading, setActionLoading] = useState(false);

  // =====================================================
  // AI INTERVIEW REPORTS
  // =====================================================

  const [interviewReports, setInterviewReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [showInterviewReports, setShowInterviewReports] = useState(false);

  // =====================================================
  // TOAST
  // =====================================================

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const timeoutRef = useRef(null);

  // =====================================================
  // TOAST FUNCTION
  // =====================================================

  const showToast = (message, type = "success") => {
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
    }, 3500);
  };

  // =====================================================
  // AUTHENTICATION
  // =====================================================

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    fetchProfile();
  }, [navigate]);

  // =====================================================
  // BACK BUTTON
  // =====================================================

  useEffect(() => {
    const handleBackButton = () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login", { replace: true });
      }
    };

    window.addEventListener("popstate", handleBackButton);

    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, [navigate]);

  // =====================================================
  // FETCH PROFILE
  // =====================================================

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      const { data } = await API.get("/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(data);

      setEditName(data.name || "");
      setEditPhone(data.phone || "");
    } catch (error) {
      console.error(error);

      showToast(
        error.response?.data?.message ||
          "Failed to fetch user profile ❌",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FETCH AI INTERVIEW REPORTS
  // =====================================================

  const fetchInterviewReports = async () => {
    try {
      setReportsLoading(true);

      const token = localStorage.getItem("token");

      const { data } = await API.get(
        "/mock-interview/my-reports",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setInterviewReports(data?.reports || []);
    } catch (error) {
      console.error(
        "Failed to fetch interview reports:",
        error
      );

      showToast(
        error.response?.data?.message ||
          "Failed to load interview reports ❌",
        "error"
      );
    } finally {
      setReportsLoading(false);
    }
  };

  // =====================================================
  // OPEN REPORTS
  // =====================================================

  const openInterviewReports = async () => {
    setShowInterviewReports(true);
    await fetchInterviewReports();
  };

  // =====================================================
  // CLOSE REPORTS
  // =====================================================

  const closeInterviewReports = () => {
    setShowInterviewReports(false);
  };

  // =====================================================
  // PROFILE IMAGE UPLOAD
  // =====================================================

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast(
        "Please select a valid image file.",
        "error"
      );
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setProfileImage(reader.result);

      localStorage.setItem(
        "profileImage",
        reader.result
      );

      showToast(
        "Profile picture updated! ✨",
        "success"
      );
    };

    reader.readAsDataURL(file);
  };

  // =====================================================
  // UPDATE PROFILE
  // =====================================================

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    setActionLoading(true);

    try {
      const token = localStorage.getItem("token");

      const { data } = await API.put(
        "/auth/profile",
        {
          name: editName,
          phone: editPhone,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser(data.user || data);

      setIsEditing(false);

      showToast(
        "Profile updated successfully! ✨",
        "success"
      );
    } catch (error) {
      console.error(error);

      showToast(
        error.response?.data?.message ||
          "Failed to update profile ❌",
        "error"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // CHANGE PASSWORD
  // =====================================================

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!oldPassword || !newPassword) {
      showToast(
        "Please fill all password fields.",
        "error"
      );
      return;
    }

    if (newPassword.length < 6) {
      showToast(
        "New password must be at least 6 characters.",
        "error"
      );
      return;
    }

    setActionLoading(true);

    try {
      const token = localStorage.getItem("token");

      await API.put(
        "/auth/change-password",
        {
          oldPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIsChangingPassword(false);

      setOldPassword("");
      setNewPassword("");

      showToast(
        "Password updated successfully! 🔒",
        "success"
      );
    } catch (error) {
      console.error(error);

      showToast(
        error.response?.data?.message ||
          "Failed to update password ❌",
        "error"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();

    navigate("/login", {
      replace: true,
    });

    window.history.pushState(
      null,
      "",
      "/login"
    );
  };

  // =====================================================
  // STATS
  // =====================================================

  const stats = [
    {
      title: "Courses",
      value: 12,
    },
    {
      title: "AI Chats",
      value: 245,
    },
    {
      title: "Mind Maps",
      value: 18,
    },
    {
      title: "Notes",
      value: 25,
    },
  ];

  // =====================================================
  // LOADING
  // =====================================================

  if (loading || !user) {
    return (
      <div
        style={{
          width: "100vw",
          minHeight: "100vh",
          background: "#020617",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "#38bdf8",
          fontSize: "1.2rem",
          fontWeight: "bold",
        }}
      >
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            repeat: Infinity,
            duration: 1,
            ease: "linear",
          }}
          style={{
            width: "30px",
            height: "30px",
            border:
              "3px solid rgba(56,189,248,0.2)",
            borderTop:
              "3px solid #38bdf8",
            borderRadius: "50%",
            marginRight: "12px",
          }}
        />

        Loading Profile...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background:
          "radial-gradient(circle at top left, rgba(14,165,233,0.08), transparent 30%), radial-gradient(circle at bottom right, rgba(99,102,241,0.10), transparent 30%), #020617",
        color: "#f8fafc",
        padding: "40px 20px",
        boxSizing: "border-box",
      }}
    >
      {/* =====================================================
          MAIN CONTAINER
      ====================================================== */}

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* =====================================================
            PAGE HEADER
        ====================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: -20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          style={{
            marginBottom: "30px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                color: "#38bdf8",
                fontSize: "0.72rem",
                fontWeight: "800",
                letterSpacing: "0.15em",
                marginBottom: "8px",
              }}
            >
              PREPPULSE
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: "2rem",
                fontWeight: "900",
                background:
                  "linear-gradient(90deg,#fff,#67e8f9,#a78bfa)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor:
                  "transparent",
              }}
            >
              My Profile
            </h1>

            <p
              style={{
                margin: "6px 0 0",
                color: "#94a3b8",
              }}
            >
              Manage your account and track your
              learning progress.
            </p>
          </div>

          <motion.button
            whileHover={{
              scale: 1.03,
            }}
            whileTap={{
              scale: 0.97,
            }}
            onClick={fetchProfile}
            style={{
              border: "1px solid rgba(56,189,248,0.25)",
              background:
                "rgba(15,23,42,0.8)",
              color: "#e2e8f0",
              padding: "11px 17px",
              borderRadius: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontWeight: "700",
            }}
          >
            <FiRefreshCw size={16} />

            Refresh
          </motion.button>
        </motion.div>

        {/* =====================================================
            PROFILE GRID
        ====================================================== */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(320px, 1fr) minmax(400px, 1.35fr)",
            gap: "25px",
            alignItems: "start",
          }}
        >
          {/* =====================================================
              LEFT PROFILE CARD
          ====================================================== */}

          <motion.div
            initial={{
              opacity: 0,
              x: -20,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            className="glass-card"
            style={{
              padding: "32px",
              borderRadius: "22px",
              background:
                "linear-gradient(145deg, rgba(30,41,59,0.82), rgba(15,23,42,0.92))",
              border:
                "1px solid rgba(56,189,248,0.25)",
              boxShadow:
                "0 20px 60px rgba(0,0,0,0.25)",
              minHeight: "650px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Profile image */}

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "18px",
              }}
            >
              <div
                style={{
                  position: "relative",
                }}
              >
                <div
                  style={{
                    width: "110px",
                    height: "110px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background:
                      "linear-gradient(135deg,#06b6d4,#3b82f6,#8b5cf6)",
                    color: "#fff",
                    fontSize: "2.6rem",
                    fontWeight: "900",
                    boxShadow:
                      "0 0 35px rgba(56,189,248,0.30)",
                  }}
                >
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    (
                      user.name ||
                      "U"
                    )
                      .charAt(0)
                      .toUpperCase()
                  )}
                </div>

                <label
                  style={{
                    position: "absolute",
                    right: "0",
                    bottom: "2px",
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background:
                      "#0ea5e9",
                    border:
                      "3px solid #0f172a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <FiCamera size={14} />

                  <input
                    type="file"
                    accept="image/*"
                    onChange={
                      handleImageUpload
                    }
                    style={{
                      display: "none",
                    }}
                  />
                </label>
              </div>
            </div>

            <h2
              style={{
                textAlign: "center",
                margin: "0 0 7px",
                fontSize: "1.55rem",
              }}
            >
              {user.name ||
                "Student"}
            </h2>

            <div
              style={{
                textAlign: "center",
                marginBottom: "25px",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  padding:
                    "5px 12px",
                  borderRadius: "999px",
                  background:
                    "rgba(14,165,233,0.12)",
                  border:
                    "1px solid rgba(14,165,233,0.35)",
                  color: "#38bdf8",
                  fontSize: "0.7rem",
                  fontWeight: "800",
                }}
              >
                STUDENT
              </span>
            </div>

            <div
              style={{
                height: "1px",
                background:
                  "rgba(148,163,184,0.15)",
                marginBottom: "20px",
              }}
            />

            {/* Email */}

            <div
              className="badge-card"
              style={{
                padding: "15px",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <FiMail
                color="#38bdf8"
                size={19}
              />

              <div>
                <div
                  style={{
                    color: "#64748b",
                    fontSize: "0.65rem",
                    fontWeight: "800",
                    marginBottom: "4px",
                  }}
                >
                  EMAIL ADDRESS
                </div>

                <div
                  style={{
                    color: "#f8fafc",
                    fontSize: "0.82rem",
                    fontWeight: "700",
                    wordBreak:
                      "break-word",
                  }}
                >
                  {user.email ||
                    "Not available"}
                </div>
              </div>

              <FiCheckCircle
                color="#10b981"
                size={17}
                style={{
                  marginLeft:
                    "auto",
                }}
              />
            </div>

            {/* Phone */}

            <div
              className="badge-card"
              style={{
                padding: "15px",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <FiPhone
                color="#38bdf8"
                size={19}
              />

              <div>
                <div
                  style={{
                    color: "#64748b",
                    fontSize: "0.65rem",
                    fontWeight: "800",
                    marginBottom: "4px",
                  }}
                >
                  PHONE NUMBER
                </div>

                <div
                  style={{
                    color: "#f8fafc",
                    fontSize: "0.82rem",
                    fontWeight: "700",
                  }}
                >
                  {user.phone ||
                    "Not available"}
                </div>
              </div>
            </div>

            {/* Joined */}

            <div
              className="badge-card"
              style={{
                padding: "15px",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <FiShield
                color="#38bdf8"
                size={19}
              />

              <div>
                <div
                  style={{
                    color: "#64748b",
                    fontSize: "0.65rem",
                    fontWeight: "800",
                    marginBottom: "4px",
                  }}
                >
                  JOINED DATE
                </div>

                <div
                  style={{
                    color: "#f8fafc",
                    fontSize: "0.82rem",
                    fontWeight: "700",
                  }}
                >
                  {user.createdAt
                    ? new Date(
                        user.createdAt
                      ).toLocaleDateString()
                    : "Recently"}
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: "auto",
                display: "grid",
                gap: "10px",
              }}
            >
              <button
                onClick={() =>
                  setIsEditing(true)
                }
                style={{
                  background:
                    "linear-gradient(90deg,#2563eb,#38bdf8)",
                  border: "none",
                  color: "#fff",
                  padding: "13px",
                  borderRadius: "11px",
                  fontWeight: "800",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "center",
                  gap: "8px",
                }}
              >
                <FiEdit2 size={16} />

                Edit Profile Details
              </button>

              <button
                onClick={() =>
                  setIsChangingPassword(
                    true
                  )
                }
                style={{
                  background:
                    "rgba(51,65,85,0.7)",
                  border:
                    "1px solid rgba(148,163,184,0.22)",
                  color: "#e2e8f0",
                  padding: "13px",
                  borderRadius: "11px",
                  fontWeight: "800",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "center",
                  gap: "8px",
                }}
              >
                <FiLock size={16} />

                Change Password
              </button>

              <button
                onClick={
                  handleLogout
                }
                style={{
                  background:
                    "rgba(239,68,68,0.15)",
                  border:
                    "1px solid rgba(239,68,68,0.3)",
                  color: "#ef4444",
                  padding: "13px",
                  borderRadius: "11px",
                  fontWeight: "800",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "center",
                  gap: "8px",
                }}
              >
                <FiLogOut size={16} />

                Log Out
              </button>
            </div>
          </motion.div>

          {/* =====================================================
              RIGHT COLUMN
          ====================================================== */}

          <div
            style={{
              display: "grid",
              gap: "25px",
            }}
          >
            {/* =====================================================
                PLATFORM OVERVIEW
            ====================================================== */}

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{
                duration: 0.4,
                delay: 0.05,
              }}
              className="glass-card"
              style={{
                padding: "25px",
                borderRadius: "20px",
                background:
                  "linear-gradient(145deg, rgba(30,41,59,0.80), rgba(15,23,42,0.90))",
                border:
                  "1px solid rgba(56,189,248,0.25)",
              }}
            >
              <h3
                style={{
                  margin:
                    "0 0 15px 0",
                  fontSize:
                    "1.1rem",
                  color:
                    "#f8fafc",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  gap: "8px",
                }}
              >
                <FiCpu color="#38bdf8" />

                Platform Overview
              </h3>

              <div
                style={{
                  display:
                    "grid",
                  gridTemplateColumns:
                    "repeat(2, 1fr)",
                  gap: "15px",
                }}
              >
                {stats.map(
                  (item) => (
                    <div
                      className="badge-card"
                      key={
                        item.title
                      }
                      style={{
                        padding:
                          "16px",
                        borderRadius:
                          "15px",
                        background:
                          "rgba(15,23,42,0.72)",
                        border:
                          "1px solid rgba(148,163,184,0.08)",
                      }}
                    >
                      <h2
                        style={{
                          margin:
                            "0 0 4px 0",
                          fontSize:
                            "1.5rem",
                          color:
                            "#38bdf8",
                        }}
                      >
                        {
                          item.value
                        }
                      </h2>

                      <p
                        style={{
                          margin: 0,
                          fontSize:
                            "0.75rem",
                          color:
                            "#94a3b8",
                        }}
                      >
                        {
                          item.title
                        }
                      </p>
                    </div>
                  )
                )}
              </div>
            </motion.div>

            {/* =====================================================
                AI INTERVIEW REPORTS
                THIS IS NOW INSIDE THE RETURN
            ====================================================== */}

            <motion.div
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.4,
                delay: 0.08,
              }}
              onClick={
                openInterviewReports
              }
              whileHover={{
                y: -3,
                scale: 1.01,
              }}
              whileTap={{
                scale: 0.99,
              }}
              className="glass-card"
              style={{
                padding: "20px",
                cursor: "pointer",
                position:
                  "relative",
                overflow:
                  "hidden",
                border:
                  "1px solid rgba(56,189,248,0.32)",
                borderRadius:
                  "20px",
                background:
                  "linear-gradient(135deg, rgba(8,47,73,0.65), rgba(30,27,75,0.70))",
                boxShadow:
                  "0 15px 45px rgba(0,0,0,0.18)",
              }}
            >
              {/* Glow */}

              <div
                style={{
                  position:
                    "absolute",
                  width:
                    "140px",
                  height:
                    "140px",
                  borderRadius:
                    "50%",
                  right:
                    "-45px",
                  top:
                    "-55px",
                  background:
                    "rgba(56,189,248,0.14)",
                  filter:
                    "blur(8px)",
                  pointerEvents:
                    "none",
                }}
              />

              <div
                style={{
                  display:
                    "flex",
                  alignItems:
                    "center",
                  gap: "14px",
                  position:
                    "relative",
                  zIndex: 1,
                }}
              >
                {/* Icon */}

                <div
                  style={{
                    width:
                      "52px",
                    height:
                      "52px",
                    borderRadius:
                      "15px",
                    display:
                      "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    flexShrink: 0,
                    color:
                      "#67e8f9",
                    background:
                      "linear-gradient(135deg, rgba(6,182,212,0.25), rgba(99,102,241,0.30))",
                    border:
                      "1px solid rgba(103,232,249,0.25)",
                    boxShadow:
                      "0 0 25px rgba(56,189,248,0.15)",
                  }}
                >
                  <FiFileText
                    size={25}
                  />
                </div>

                {/* Text */}

                <div
                  style={{
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      color:
                        "#67e8f9",
                      fontSize:
                        "0.65rem",
                      fontWeight:
                        "800",
                      letterSpacing:
                        "0.12em",
                      marginBottom:
                        "4px",
                    }}
                  >
                    AI INTERVIEW
                  </div>

                  <h3
                    style={{
                      margin: 0,
                      color:
                        "#f8fafc",
                      fontSize:
                        "1.05rem",
                      fontWeight:
                        "800",
                    }}
                  >
                    Interview Reports
                  </h3>

                  <p
                    style={{
                      margin:
                        "5px 0 0",
                      color:
                        "#94a3b8",
                      fontSize:
                        "0.72rem",
                    }}
                  >
                    View scores, feedback
                    & AI analysis
                  </p>
                </div>

                {/* Arrow */}

                <div
                  style={{
                    width:
                      "36px",
                    height:
                      "36px",
                    borderRadius:
                      "10px",
                    display:
                      "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    color:
                      "#38bdf8",
                    background:
                      "rgba(56,189,248,0.08)",
                    border:
                      "1px solid rgba(56,189,248,0.18)",
                  }}
                >
                  <FiChevronRight
                    size={20}
                  />
                </div>
              </div>

              {/* Bottom information */}

              <div
                style={{
                  position:
                    "relative",
                  zIndex: 1,
                  marginTop:
                    "14px",
                  paddingTop:
                    "11px",
                  borderTop:
                    "1px solid rgba(148,163,184,0.08)",
                  display:
                    "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "center",
                  gap: "10px",
                  color:
                    "#64748b",
                  fontSize:
                    "0.65rem",
                }}
              >
                <span>
                  Scores • Questions •
                  Feedback
                </span>

                <span
                  style={{
                    color:
                      "#38bdf8",
                    fontWeight:
                      "800",
                  }}
                >
                  VIEW ALL →
                </span>
              </div>
            </motion.div>

            {/* =====================================================
                ACTIVITY & STREAKS
            ====================================================== */}

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{
                duration: 0.4,
                delay: 0.1,
              }}
              className="glass-card"
              style={{
                padding: "25px",
                borderRadius: "20px",
                background:
                  "linear-gradient(145deg, rgba(30,41,59,0.80), rgba(15,23,42,0.90))",
                border:
                  "1px solid rgba(56,189,248,0.25)",
              }}
            >
              <h3
                style={{
                  margin:
                    "0 0 15px 0",
                  fontSize:
                    "1.1rem",
                  color:
                    "#f8fafc",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  gap: "8px",
                }}
              >
                <FaFire color="#f59e0b" />

                Activity & Streaks
              </h3>

              <div
                style={{
                  display:
                    "grid",
                  gridTemplateColumns:
                    "repeat(3, 1fr)",
                  gap: "12px",
                }}
              >
                <div
                  className="badge-card"
                  style={{
                    padding:
                      "15px",
                    textAlign:
                      "center",
                  }}
                >
                  <span
                    style={{
                      display:
                        "block",
                      fontSize:
                        "1.5rem",
                      fontWeight:
                        "900",
                      color:
                        "#f59e0b",
                    }}
                  >
                    15
                  </span>

                  <span
                    style={{
                      fontSize:
                        "0.7rem",
                      color:
                        "#94a3b8",
                      fontWeight:
                        "600",
                    }}
                  >
                    Day Streak 🔥
                  </span>
                </div>

                <div
                  className="badge-card"
                  style={{
                    padding:
                      "15px",
                    textAlign:
                      "center",
                  }}
                >
                  <span
                    style={{
                      display:
                        "block",
                      fontSize:
                        "1.5rem",
                      fontWeight:
                        "900",
                      color:
                        "#38bdf8",
                    }}
                  >
                    12
                  </span>

                  <span
                    style={{
                      fontSize:
                        "0.7rem",
                      color:
                        "#94a3b8",
                      fontWeight:
                        "600",
                    }}
                  >
                    Courses Done
                  </span>
                </div>

                <div
                  className="badge-card"
                  style={{
                    padding:
                      "15px",
                    textAlign:
                      "center",
                  }}
                >
                  <span
                    style={{
                      display:
                        "block",
                      fontSize:
                        "1.5rem",
                      fontWeight:
                        "900",
                      color:
                        "#10b981",
                    }}
                  >
                    120h
                  </span>

                  <span
                    style={{
                      fontSize:
                        "0.7rem",
                      color:
                        "#94a3b8",
                      fontWeight:
                        "600",
                    }}
                  >
                    Study Hours
                  </span>
                </div>
              </div>
            </motion.div>

            {/* =====================================================
                SECURITY
            ====================================================== */}

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{
                duration: 0.4,
                delay: 0.15,
              }}
              className="glass-card"
              style={{
                padding: "25px",
                borderRadius: "20px",
                background:
                  "linear-gradient(145deg, rgba(30,41,59,0.80), rgba(15,23,42,0.90))",
                border:
                  "1px solid rgba(56,189,248,0.20)",
              }}
            >
              <h3
                style={{
                  margin:
                    "0 0 17px",
                  fontSize:
                    "1.1rem",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  gap: "8px",
                }}
              >
                <FiLock
                  color="#10b981"
                />

                Security
              </h3>

              <div
                style={{
                  display:
                    "grid",
                  gap: "10px",
                  color:
                    "#cbd5e1",
                  fontSize:
                    "0.82rem",
                }}
              >
                <div
                  style={{
                    display:
                      "flex",
                    justifyContent:
                      "space-between",
                  }}
                >
                  <span>
                    Email Verified:
                  </span>

                  <span
                    style={{
                      color:
                        "#10b981",
                      fontWeight:
                        "800",
                    }}
                  >
                    {user.isEmailVerified
                      ? "✅"
                      : "❌"}
                  </span>
                </div>

                <div
                  style={{
                    display:
                      "flex",
                    justifyContent:
                      "space-between",
                  }}
                >
                  <span>
                    Password Protected:
                  </span>

                  <span
                    style={{
                      color:
                        "#10b981",
                      fontWeight:
                        "800",
                    }}
                  >
                    ✅
                  </span>
                </div>

                <div
                  style={{
                    display:
                      "flex",
                    justifyContent:
                      "space-between",
                  }}
                >
                  <span>
                    Last Login:
                  </span>

                  <span
                    style={{
                      color:
                        "#e2e8f0",
                    }}
                  >
                    Today
                  </span>
                </div>
              </div>
            </motion.div>

            {/* =====================================================
                BADGES
            ====================================================== */}

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{
                duration: 0.4,
                delay: 0.2,
              }}
              className="glass-card"
              style={{
                padding: "25px",
                borderRadius: "20px",
                background:
                  "linear-gradient(145deg, rgba(30,41,59,0.80), rgba(15,23,42,0.90))",
                border:
                  "1px solid rgba(56,189,248,0.20)",
              }}
            >
              <h3
                style={{
                  margin:
                    "0 0 17px",
                  fontSize:
                    "1.1rem",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  gap: "8px",
                }}
              >
                <FiAward
                  color="#f59e0b"
                />

                Badges & Achievements
              </h3>

              <div
                style={{
                  display:
                    "grid",
                  gridTemplateColumns:
                    "repeat(3, 1fr)",
                  gap: "10px",
                }}
              >
                <div
                  className="badge-card"
                  style={{
                    padding:
                      "14px 8px",
                    textAlign:
                      "center",
                  }}
                >
                  <div
                    style={{
                      fontSize:
                        "1.1rem",
                      marginBottom:
                        "6px",
                    }}
                  >
                    🚀
                  </div>

                  <div
                    style={{
                      color:
                        "#f8fafc",
                      fontWeight:
                        "800",
                      fontSize:
                        "0.72rem",
                    }}
                  >
                    AI Explorer
                  </div>

                  <div
                    style={{
                      color:
                        "#64748b",
                      fontSize:
                        "0.58rem",
                      marginTop:
                        "3px",
                    }}
                  >
                    First 100 prompts
                  </div>
                </div>

                <div
                  className="badge-card"
                  style={{
                    padding:
                      "14px 8px",
                    textAlign:
                      "center",
                  }}
                >
                  <div
                    style={{
                      fontSize:
                        "1.1rem",
                      marginBottom:
                        "6px",
                    }}
                  >
                    🔥
                  </div>

                  <div
                    style={{
                      color:
                        "#f8fafc",
                      fontWeight:
                        "800",
                      fontSize:
                        "0.72rem",
                    }}
                  >
                    Streak Master
                  </div>

                  <div
                    style={{
                      color:
                        "#64748b",
                      fontSize:
                        "0.58rem",
                      marginTop:
                        "3px",
                    }}
                  >
                    15 days streak
                  </div>
                </div>

                <div
                  className="badge-card"
                  style={{
                    padding:
                      "14px 8px",
                    textAlign:
                      "center",
                  }}
                >
                  <div
                    style={{
                      fontSize:
                        "1.1rem",
                      marginBottom:
                        "6px",
                    }}
                  >
                    📚
                  </div>

                  <div
                    style={{
                      color:
                        "#f8fafc",
                      fontWeight:
                        "800",
                      fontSize:
                        "0.72rem",
                    }}
                  >
                    Fast Learner
                  </div>

                  <div
                    style={{
                      color:
                        "#64748b",
                      fontSize:
                        "0.58rem",
                      marginTop:
                        "3px",
                    }}
                  >
                    10 modules done
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* =====================================================
          EDIT PROFILE MODAL
      ====================================================== */}

      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1000,
              background:
                "rgba(2,6,23,0.78)",
              backdropFilter:
                "blur(10px)",
              display: "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
              padding: "20px",
            }}
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.94,
                y: 20,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.94,
                y: 20,
              }}
              style={{
                width: "100%",
                maxWidth: "500px",
                background:
                  "#0f172a",
                border:
                  "1px solid rgba(56,189,248,0.22)",
                borderRadius:
                  "20px",
                padding: "28px",
                boxShadow:
                  "0 30px 80px rgba(0,0,0,0.45)",
              }}
            >
              <div
                style={{
                  display:
                    "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "center",
                  marginBottom:
                    "22px",
                }}
              >
                <div>
                  <h2
                    style={{
                      margin: 0,
                    }}
                  >
                    Edit Profile
                  </h2>

                  <p
                    style={{
                      margin:
                        "5px 0 0",
                      color:
                        "#64748b",
                      fontSize:
                        "0.8rem",
                    }}
                  >
                    Update your personal
                    information.
                  </p>
                </div>

                <button
                  onClick={() =>
                    setIsEditing(false)
                  }
                  style={{
                    width:
                      "35px",
                    height:
                      "35px",
                    borderRadius:
                      "10px",
                    border:
                      "1px solid rgba(148,163,184,0.15)",
                    background:
                      "rgba(15,23,42,0.8)",
                    color:
                      "#cbd5e1",
                    cursor:
                      "pointer",
                    display:
                      "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                  }}
                >
                  <FiX />
                </button>
              </div>

              <form
                onSubmit={
                  handleUpdateProfile
                }
              >
                <label
                  style={{
                    display:
                      "block",
                    color:
                      "#94a3b8",
                    fontSize:
                      "0.75rem",
                    marginBottom:
                      "7px",
                  }}
                >
                  Name
                </label>

                <input
                  value={editName}
                  onChange={(e) =>
                    setEditName(
                      e.target.value
                    )
                  }
                  style={{
                    width:
                      "100%",
                    boxSizing:
                      "border-box",
                    padding:
                      "13px",
                    borderRadius:
                      "10px",
                    border:
                      "1px solid rgba(148,163,184,0.18)",
                    background:
                      "#020617",
                    color:
                      "#f8fafc",
                    marginBottom:
                      "16px",
                    outline:
                      "none",
                  }}
                />

                <label
                  style={{
                    display:
                      "block",
                    color:
                      "#94a3b8",
                    fontSize:
                      "0.75rem",
                    marginBottom:
                      "7px",
                  }}
                >
                  Phone
                </label>

                <input
                  value={editPhone}
                  onChange={(e) =>
                    setEditPhone(
                      e.target.value
                    )
                  }
                  style={{
                    width:
                      "100%",
                    boxSizing:
                      "border-box",
                    padding:
                      "13px",
                    borderRadius:
                      "10px",
                    border:
                      "1px solid rgba(148,163,184,0.18)",
                    background:
                      "#020617",
                    color:
                      "#f8fafc",
                    marginBottom:
                      "20px",
                    outline:
                      "none",
                  }}
                />

                <button
                  type="submit"
                  disabled={
                    actionLoading
                  }
                  style={{
                    width:
                      "100%",
                    padding:
                      "13px",
                    border: "none",
                    borderRadius:
                      "11px",
                    background:
                      "linear-gradient(90deg,#06b6d4,#6366f1)",
                    color:
                      "#fff",
                    fontWeight:
                      "800",
                    cursor:
                      actionLoading
                        ? "not-allowed"
                        : "pointer",
                    opacity:
                      actionLoading
                        ? 0.7
                        : 1,
                    display:
                      "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    gap: "8px",
                  }}
                >
                  <FiSave size={16} />

                  {actionLoading
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================
          CHANGE PASSWORD MODAL
      ====================================================== */}

      <AnimatePresence>
        {isChangingPassword && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1000,
              background:
                "rgba(2,6,23,0.78)",
              backdropFilter:
                "blur(10px)",
              display: "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
              padding: "20px",
            }}
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.94,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                scale: 0.94,
              }}
              style={{
                width: "100%",
                maxWidth: "500px",
                background:
                  "#0f172a",
                border:
                  "1px solid rgba(56,189,248,0.22)",
                borderRadius:
                  "20px",
                padding: "28px",
                boxShadow:
                  "0 30px 80px rgba(0,0,0,0.45)",
              }}
            >
              <div
                style={{
                  display:
                    "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "center",
                  marginBottom:
                    "22px",
                }}
              >
                <div>
                  <h2
                    style={{
                      margin: 0,
                    }}
                  >
                    Change Password
                  </h2>

                  <p
                    style={{
                      margin:
                        "5px 0 0",
                      color:
                        "#64748b",
                      fontSize:
                        "0.8rem",
                    }}
                  >
                    Keep your account secure.
                  </p>
                </div>

                <button
                  onClick={() =>
                    setIsChangingPassword(
                      false
                    )
                  }
                  style={{
                    width:
                      "35px",
                    height:
                      "35px",
                    borderRadius:
                      "10px",
                    border:
                      "1px solid rgba(148,163,184,0.15)",
                    background:
                      "rgba(15,23,42,0.8)",
                    color:
                      "#cbd5e1",
                    cursor:
                      "pointer",
                    display:
                      "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                  }}
                >
                  <FiX />
                </button>
              </div>

              <form
                onSubmit={
                  handleChangePassword
                }
              >
                <label
                  style={{
                    display:
                      "block",
                    color:
                      "#94a3b8",
                    fontSize:
                      "0.75rem",
                    marginBottom:
                      "7px",
                  }}
                >
                  Current Password
                </label>

                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) =>
                    setOldPassword(
                      e.target.value
                    )
                  }
                  placeholder="Enter current password"
                  style={{
                    width:
                      "100%",
                    boxSizing:
                      "border-box",
                    padding:
                      "13px",
                    borderRadius:
                      "10px",
                    border:
                      "1px solid rgba(148,163,184,0.18)",
                    background:
                      "#020617",
                    color:
                      "#f8fafc",
                    marginBottom:
                      "16px",
                    outline:
                      "none",
                  }}
                />

                <label
                  style={{
                    display:
                      "block",
                    color:
                      "#94a3b8",
                    fontSize:
                      "0.75rem",
                    marginBottom:
                      "7px",
                  }}
                >
                  New Password
                </label>

                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(
                      e.target.value
                    )
                  }
                  placeholder="Enter new password"
                  style={{
                    width:
                      "100%",
                    boxSizing:
                      "border-box",
                    padding:
                      "13px",
                    borderRadius:
                      "10px",
                    border:
                      "1px solid rgba(148,163,184,0.18)",
                    background:
                      "#020617",
                    color:
                      "#f8fafc",
                    marginBottom:
                      "20px",
                    outline:
                      "none",
                  }}
                />

                <button
                  type="submit"
                  disabled={
                    actionLoading
                  }
                  style={{
                    width:
                      "100%",
                    padding:
                      "13px",
                    border: "none",
                    borderRadius:
                      "11px",
                    background:
                      "linear-gradient(90deg,#06b6d4,#6366f1)",
                    color:
                      "#fff",
                    fontWeight:
                      "800",
                    cursor:
                      actionLoading
                        ? "not-allowed"
                        : "pointer",
                    opacity:
                      actionLoading
                        ? 0.7
                        : 1,
                  }}
                >
                  {actionLoading
                    ? "Updating..."
                    : "Update Password"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================
          AI INTERVIEW REPORTS MODAL
      ====================================================== */}

      <AnimatePresence>
        {showInterviewReports && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 2000,
              background:
                "rgba(2,6,23,0.84)",
              backdropFilter:
                "blur(12px)",
              display: "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
              padding: "20px",
            }}
            onClick={
              closeInterviewReports
            }
          >
            <motion.div
              initial={{
                opacity: 0,
                y: 30,
                scale: 0.96,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 30,
                scale: 0.96,
              }}
              onClick={(e) =>
                e.stopPropagation()
              }
              style={{
                width: "100%",
                maxWidth: "1050px",
                maxHeight:
                  "88vh",
                overflowY:
                  "auto",
                background:
                  "linear-gradient(145deg,#0f172a,#020617)",
                border:
                  "1px solid rgba(56,189,248,0.25)",
                borderRadius:
                  "24px",
                padding: "28px",
                boxShadow:
                  "0 30px 100px rgba(0,0,0,0.55)",
              }}
            >
              {/* Modal header */}

              <div
                style={{
                  display:
                    "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "center",
                  gap: "15px",
                  marginBottom:
                    "25px",
                }}
              >
                <div
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap: "14px",
                  }}
                >
                  <div
                    style={{
                      width:
                        "52px",
                      height:
                        "52px",
                      borderRadius:
                        "15px",
                      display:
                        "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      background:
                        "linear-gradient(135deg,#06b6d4,#6366f1,#8b5cf6)",
                      boxShadow:
                        "0 0 30px rgba(99,102,241,0.25)",
                    }}
                  >
                    <FiFileText
                      size={25}
                    />
                  </div>

                  <div>
                    <div
                      style={{
                        color:
                          "#67e8f9",
                        fontSize:
                          "0.68rem",
                        fontWeight:
                          "900",
                        letterSpacing:
                          "0.13em",
                      }}
                    >
                      AI INTERVIEW
                    </div>

                    <h2
                      style={{
                        margin:
                          "3px 0 0",
                        fontSize:
                          "1.45rem",
                      }}
                    >
                      Interview Reports
                    </h2>

                    <p
                      style={{
                        margin:
                          "4px 0 0",
                        color:
                          "#64748b",
                        fontSize:
                          "0.75rem",
                      }}
                    >
                      Your complete interview
                      performance history
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    display:
                      "flex",
                    gap: "8px",
                  }}
                >
                  <button
                    onClick={
                      fetchInterviewReports
                    }
                    disabled={
                      reportsLoading
                    }
                    style={{
                      width:
                        "40px",
                      height:
                        "40px",
                      borderRadius:
                        "10px",
                      border:
                        "1px solid rgba(148,163,184,0.16)",
                      background:
                        "rgba(15,23,42,0.8)",
                      color:
                        "#38bdf8",
                      cursor:
                        "pointer",
                      display:
                        "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                    }}
                  >
                    <FiRefreshCw
                      size={17}
                    />
                  </button>

                  <button
                    onClick={
                      closeInterviewReports
                    }
                    style={{
                      width:
                        "40px",
                      height:
                        "40px",
                      borderRadius:
                        "10px",
                      border:
                        "1px solid rgba(148,163,184,0.16)",
                      background:
                        "rgba(15,23,42,0.8)",
                      color:
                        "#cbd5e1",
                      cursor:
                        "pointer",
                      display:
                        "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                    }}
                  >
                    <FiX size={18} />
                  </button>
                </div>
              </div>

              {/* Loading */}

              {reportsLoading && (
                <div
                  style={{
                    minHeight:
                      "250px",
                    display:
                      "flex",
                    flexDirection:
                      "column",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    color:
                      "#94a3b8",
                  }}
                >
                  <motion.div
                    animate={{
                      rotate: 360,
                    }}
                    transition={{
                      repeat:
                        Infinity,
                      duration: 1,
                      ease: "linear",
                    }}
                    style={{
                      width:
                        "38px",
                      height:
                        "38px",
                      border:
                        "3px solid rgba(56,189,248,0.15)",
                      borderTop:
                        "3px solid #38bdf8",
                      borderRadius:
                        "50%",
                      marginBottom:
                        "14px",
                    }}
                  />

                  Loading interview
                  reports...
                </div>
              )}

              {/* Empty */}

              {!reportsLoading &&
                interviewReports.length ===
                  0 && (
                  <div
                    style={{
                      minHeight:
                        "260px",
                      display:
                        "flex",
                      flexDirection:
                        "column",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      textAlign:
                        "center",
                      padding:
                        "20px",
                    }}
                  >
                    <div
                      style={{
                        width:
                          "70px",
                        height:
                          "70px",
                        borderRadius:
                          "20px",
                        background:
                          "rgba(56,189,248,0.08)",
                        border:
                          "1px solid rgba(56,189,248,0.16)",
                        display:
                          "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        marginBottom:
                          "15px",
                      }}
                    >
                      <FiTarget
                        size={30}
                        color="#38bdf8"
                      />
                    </div>

                    <h3
                      style={{
                        margin:
                          "0 0 7px",
                      }}
                    >
                      No Interview Reports Yet
                    </h3>

                    <p
                      style={{
                        maxWidth:
                          "500px",
                        margin:
                          "0 0 18px",
                        color:
                          "#64748b",
                        fontSize:
                          "0.82rem",
                        lineHeight:
                          1.6,
                      }}
                    >
                      Complete an AI mock interview
                      and your complete performance
                      report will automatically appear
                      here.
                    </p>

                    <button
                      onClick={() => {
                        closeInterviewReports();

                        navigate(
                          "/mock-interview"
                        );
                      }}
                      style={{
                        border: "none",
                        padding:
                          "12px 18px",
                        borderRadius:
                          "11px",
                        background:
                          "linear-gradient(90deg,#06b6d4,#6366f1)",
                        color:
                          "#fff",
                        fontWeight:
                          "800",
                        cursor:
                          "pointer",
                      }}
                    >
                      Start AI Interview
                    </button>
                  </div>
                )}

              {/* Reports */}

              {!reportsLoading &&
                interviewReports.length >
                  0 && (
                  <div
                    style={{
                      display:
                        "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit,minmax(310px,1fr))",
                      gap: "15px",
                    }}
                  >
                    {interviewReports.map(
                      (
                        report,
                        index
                      ) => {
                        const score =
                          Math.round(
                            Number(
                              report.overallScore ||
                                0
                            )
                          );

                        const attempted =
                          Number(
                            report.attemptedQuestions ||
                              0
                          );

                        const total =
                          Number(
                            report.totalQuestions ||
                              0
                          );

                        const evaluated =
                          Number(
                            report.evaluatedQuestions ||
                              0
                          );

                        const completion =
                          total >
                          0
                            ? Math.round(
                                (attempted /
                                  total) *
                                  100
                              )
                            : 0;

                        return (
                          <motion.div
                            key={
                              report._id ||
                              index
                            }
                            initial={{
                              opacity: 0,
                              y: 12,
                            }}
                            animate={{
                              opacity: 1,
                              y: 0,
                            }}
                            transition={{
                              delay:
                                index *
                                0.04,
                            }}
                            style={{
                              padding:
                                "18px",
                              borderRadius:
                                "18px",
                              background:
                                "linear-gradient(145deg,rgba(15,23,42,0.90),rgba(2,6,23,0.78))",
                              border:
                                "1px solid rgba(99,102,241,0.18)",
                              boxShadow:
                                "0 12px 35px rgba(0,0,0,0.20)",
                            }}
                          >
                            {/* Report header */}

                            <div
                              style={{
                                display:
                                  "flex",
                                alignItems:
                                  "flex-start",
                                gap: "11px",
                                marginBottom:
                                  "15px",
                              }}
                            >
                              <div
                                style={{
                                  width:
                                    "43px",
                                  height:
                                    "43px",
                                  flexShrink: 0,
                                  borderRadius:
                                    "12px",
                                  display:
                                    "flex",
                                  alignItems:
                                    "center",
                                  justifyContent:
                                    "center",
                                  background:
                                    "linear-gradient(135deg,#06b6d4,#6366f1)",
                                }}
                              >
                                <FiCpu
                                  size={21}
                                />
                              </div>

                              <div
                                style={{
                                  flex: 1,
                                }}
                              >
                                <h3
                                  style={{
                                    margin:
                                      0,
                                    fontSize:
                                      "0.98rem",
                                  }}
                                >
                                  {report.role ||
                                    "AI Mock Interview"}
                                </h3>

                                <p
                                  style={{
                                    margin:
                                      "4px 0 0",
                                    color:
                                      "#64748b",
                                    fontSize:
                                      "0.7rem",
                                  }}
                                >
                                  {report.company ||
                                    "General"}
                                </p>
                              </div>

                              <div
                                style={{
                                  padding:
                                    "5px 9px",
                                  borderRadius:
                                    "999px",
                                  background:
                                    report.status ===
                                    "Terminated"
                                      ? "rgba(239,68,68,0.12)"
                                      : "rgba(16,185,129,0.10)",
                                  border:
                                    report.status ===
                                    "Terminated"
                                      ? "1px solid rgba(239,68,68,0.22)"
                                      : "1px solid rgba(16,185,129,0.20)",
                                  color:
                                    report.status ===
                                    "Terminated"
                                      ? "#f87171"
                                      : "#34d399",
                                  fontSize:
                                    "0.6rem",
                                  fontWeight:
                                    "800",
                                }}
                              >
                                {report.status ||
                                  "Completed"}
                              </div>
                            </div>

                            {/* Score */}

                            <div
                              style={{
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                gap: "15px",
                                padding:
                                  "15px",
                                borderRadius:
                                  "15px",
                                background:
                                  "rgba(2,6,23,0.55)",
                                border:
                                  "1px solid rgba(148,163,184,0.07)",
                                marginBottom:
                                  "13px",
                              }}
                            >
                              <div
                                style={{
                                  width:
                                    "64px",
                                  height:
                                    "64px",
                                  borderRadius:
                                    "50%",
                                  display:
                                    "flex",
                                  alignItems:
                                    "center",
                                  justifyContent:
                                    "center",
                                  background:
                                    `conic-gradient(#22d3ee ${
                                      score *
                                      3.6
                                    }deg, rgba(71,85,105,0.25) 0deg)`,
                                  position:
                                    "relative",
                                }}
                              >
                                <div
                                  style={{
                                    position:
                                      "absolute",
                                    inset:
                                      "6px",
                                    borderRadius:
                                      "50%",
                                    background:
                                      "#020617",
                                    display:
                                      "flex",
                                    alignItems:
                                      "center",
                                    justifyContent:
                                      "center",
                                  }}
                                >
                                  <span
                                    style={{
                                      fontSize:
                                        "1rem",
                                      fontWeight:
                                        "900",
                                      color:
                                        "#f8fafc",
                                    }}
                                  >
                                    {score}%
                                  </span>
                                </div>
                              </div>

                              <div>
                                <div
                                  style={{
                                    color:
                                      "#64748b",
                                    fontSize:
                                      "0.65rem",
                                    marginBottom:
                                      "5px",
                                  }}
                                >
                                  OVERALL SCORE
                                </div>

                                <div
                                  style={{
                                    color:
                                      score >=
                                      70
                                        ? "#34d399"
                                        : score >=
                                          50
                                        ? "#fbbf24"
                                        : "#f87171",
                                    fontWeight:
                                      "800",
                                    fontSize:
                                      "0.95rem",
                                  }}
                                >
                                  {score >=
                                  70
                                    ? "Strong Performance"
                                    : score >=
                                      50
                                    ? "Good Progress"
                                    : "Needs More Practice"}
                                </div>
                              </div>
                            </div>

                            {/* Stats */}

                            <div
                              style={{
                                display:
                                  "grid",
                                gridTemplateColumns:
                                  "repeat(3,1fr)",
                                gap: "7px",
                                marginBottom:
                                  "13px",
                              }}
                            >
                              <div
                                style={{
                                  padding:
                                    "9px",
                                  borderRadius:
                                    "10px",
                                  background:
                                    "rgba(15,23,42,0.8)",
                                }}
                              >
                                <div
                                  style={{
                                    fontSize:
                                      "0.9rem",
                                    fontWeight:
                                      "900",
                                    color:
                                      "#38bdf8",
                                  }}
                                >
                                  {attempted}
                                </div>

                                <div
                                  style={{
                                    fontSize:
                                      "0.55rem",
                                    color:
                                      "#64748b",
                                  }}
                                >
                                  Attempted
                                </div>
                              </div>

                              <div
                                style={{
                                  padding:
                                    "9px",
                                  borderRadius:
                                    "10px",
                                  background:
                                    "rgba(15,23,42,0.8)",
                                }}
                              >
                                <div
                                  style={{
                                    fontSize:
                                      "0.9rem",
                                    fontWeight:
                                      "900",
                                    color:
                                      "#a78bfa",
                                  }}
                                >
                                  {evaluated}
                                </div>

                                <div
                                  style={{
                                    fontSize:
                                      "0.55rem",
                                    color:
                                      "#64748b",
                                  }}
                                >
                                  AI Evaluated
                                </div>
                              </div>

                              <div
                                style={{
                                  padding:
                                    "9px",
                                  borderRadius:
                                    "10px",
                                  background:
                                    "rgba(15,23,42,0.8)",
                                }}
                              >
                                <div
                                  style={{
                                    fontSize:
                                      "0.9rem",
                                    fontWeight:
                                      "900",
                                    color:
                                      "#10b981",
                                  }}
                                >
                                  {completion}%
                                </div>

                                <div
                                  style={{
                                    fontSize:
                                      "0.55rem",
                                    color:
                                      "#64748b",
                                  }}
                                >
                                  Completion
                                </div>
                              </div>
                            </div>

                            {/* Date */}

                            <div
                              style={{
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                justifyContent:
                                  "space-between",
                                color:
                                  "#64748b",
                                fontSize:
                                  "0.65rem",
                                marginBottom:
                                  "13px",
                              }}
                            >
                              <span>
                                {report.completedAt
                                  ? new Date(
                                      report.completedAt
                                    ).toLocaleDateString(
                                      undefined,
                                      {
                                        year: "numeric",
                                        month:
                                          "short",
                                        day: "numeric",
                                      }
                                    )
                                  : report.createdAt
                                  ? new Date(
                                      report.createdAt
                                    ).toLocaleDateString()
                                  : "Recent"}
                              </span>

                              <span>
                                {total} Questions
                              </span>
                            </div>

                            {/* View report */}

                            <button
                              onClick={() =>
                                navigate(
                                  `/mock-interview/${report._id}/result`
                                )
                              }
                              style={{
                                width:
                                  "100%",
                                border:
                                  "none",
                                padding:
                                  "11px",
                                borderRadius:
                                  "10px",
                                background:
                                  "linear-gradient(90deg,#06b6d4,#6366f1)",
                                color:
                                  "#fff",
                                fontWeight:
                                  "800",
                                cursor:
                                  "pointer",
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                justifyContent:
                                  "center",
                                gap: "7px",
                              }}
                            >
                              View Full Report

                              <FiChevronRight
                                size={
                                  16
                                }
                              />
                            </button>
                          </motion.div>
                        );
                      }
                    )}
                  </div>
                )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================
          TOAST
      ====================================================== */}

      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 20,
              scale: 0.95,
            }}
            style={{
              position: "fixed",
              right: "25px",
              bottom: "25px",
              zIndex: 5000,
              maxWidth: "400px",
              padding:
                "14px 18px",
              borderRadius:
                "12px",
              background:
                toast.type ===
                "error"
                  ? "rgba(127,29,29,0.95)"
                  : "rgba(6,78,59,0.95)",
              border:
                toast.type ===
                "error"
                  ? "1px solid rgba(248,113,113,0.35)"
                  : "1px solid rgba(52,211,153,0.35)",
              color: "#fff",
              boxShadow:
                "0 20px 50px rgba(0,0,0,0.35)",
              display:
                "flex",
              alignItems:
                "center",
              gap: "10px",
              fontSize:
                "0.82rem",
              fontWeight:
                "700",
            }}
          >
            {toast.type ===
            "error" ? (
              <FiAlertCircle
                color="#f87171"
              />
            ) : (
              <FiCheckCircle
                color="#34d399"
              />
            )}

            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================
          RESPONSIVE STYLE
      ====================================================== */}

      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #020617;
        }

        .glass-card {
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .badge-card {
          background: rgba(15,23,42,0.72);
          border: 1px solid rgba(148,163,184,0.08);
          border-radius: 14px;
        }

        button {
          font-family: inherit;
        }

        button:focus-visible,
        input:focus-visible {
          outline: 2px solid #38bdf8;
          outline-offset: 2px;
        }

        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #020617;
        }

        ::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }

        @media (max-width: 900px) {
          .profile-main-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 600px) {
          body {
            overflow-x: hidden;
          }
        }

        @media (max-width: 520px) {
          .profile-mobile-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

export default Profile;