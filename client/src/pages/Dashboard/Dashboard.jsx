import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../services/api";

import {
  FiHome,
  FiBarChart2,
  FiUser,
  FiCpu,
  FiEdit3,
  FiCompass,
  FiFileText,
  FiBookOpen,
  FiAward,
  FiActivity,
  FiBell,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiArrowUpRight,
  FiBook,
  FiClipboard,
  FiMic,
  FiRefreshCw,
  FiTrendingUp,
  FiTarget,
  FiCheckCircle,
  FiClock,
  FiZap,
  FiChevronRight,
  FiAlertCircle,
  FiDatabase,
  FiLayers,
  FiMessageSquare,
  FiPlayCircle,
  FiShield,
  FiStar,
  FiCalendar,
  FiExternalLink,
} from "react-icons/fi";

import logoImage from "../../assets/images/Gemini_Generated_Image_70rl6i70rl6i70rl.png";

/* =========================================================
   HELPERS
========================================================= */

const safeNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const clamp = (value, min = 0, max = 100) => {
  return Math.min(Math.max(value, min), max);
};

const formatDate = (date) => {
  if (!date) return "Recently";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Recently";
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTimeAgo = (date) => {
  if (!date) return "Recently";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Recently";
  }

  const diff = Date.now() - parsed.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return formatDate(date);
};

const getInitials = (name = "User") => {
  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const getActivityIcon = (type) => {
  switch (type) {
    case "NOTE":
      return <FiEdit3 size={17} />;

    case "RESUME":
      return <FiFileText size={17} />;

    case "INTERVIEW":
      return <FiMic size={17} />;

    case "MOCK_TEST":
      return <FiClipboard size={17} />;

    default:
      return <FiActivity size={17} />;
  }
};

const getActivityColor = (type) => {
  switch (type) {
    case "NOTE":
      return "#c084fc";

    case "RESUME":
      return "#f59e0b";

    case "INTERVIEW":
      return "#fb7185";

    case "MOCK_TEST":
      return "#34d399";

    default:
      return "#a78bfa";
  }
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

function Dashboard() {
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [lastUpdated, setLastUpdated] = useState(null);

  const userName = localStorage.getItem("name") || "Learner";
  const token = localStorage.getItem("token");

  /* =========================================================
     RESPONSIVE SIDEBAR
  ========================================================= */

  useEffect(() => {
    const checkScreen = () => {
      const mobile = window.innerWidth < 900;

      setIsMobile(mobile);

      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    checkScreen();

    window.addEventListener("resize", checkScreen);

    return () => {
      window.removeEventListener("resize", checkScreen);
    };
  }, []);

  /* =========================================================
     FETCH REAL ANALYTICS
  ========================================================= */

  const fetchAnalytics = useCallback(
    async (showLoader = false) => {
      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      if (showLoader) {
        setIsRefreshing(true);
      }

      try {
        setError("");

        const response = await API.get("/progress/analytics", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const payload = response?.data;

        if (!payload?.success) {
          throw new Error(
            payload?.message || "Unable to load dashboard analytics."
          );
        }

        setAnalytics(payload);
        setLastUpdated(new Date());
      } catch (err) {
        console.error("Dashboard analytics error:", err);

        if (err?.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login", { replace: true });
          return;
        }

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load dashboard data."
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [navigate, token]
  );

  useEffect(() => {
    fetchAnalytics(false);

    const interval = setInterval(() => {
      fetchAnalytics(false);
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [fetchAnalytics]);

  /* =========================================================
     REAL-TIME PROGRESS EVENT
  ========================================================= */

  useEffect(() => {
    const handleProgressUpdate = () => {
      fetchAnalytics(true);
    };

    window.addEventListener(
      "preppulse:progress-updated",
      handleProgressUpdate
    );

    return () => {
      window.removeEventListener(
        "preppulse:progress-updated",
        handleProgressUpdate
      );
    };
  }, [fetchAnalytics]);

  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("name");
    localStorage.removeItem("email");

    navigate("/login", {
      replace: true,
    });
  };

  /* =========================================================
     CLOSE MOBILE SIDEBAR
  ========================================================= */

  const navigateTo = (path) => {
    navigate(path);

    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  /* =========================================================
     ANALYTICS VALUES
  ========================================================= */

  const overview = analytics?.overview || {};

  const notes = analytics?.notes || {};

  const resume = analytics?.resume || {};

  const interviews = analytics?.interviews || {};

  const mockTests = analytics?.mockTests || {};

  const weeklyActivity = analytics?.weeklyActivity || [];

  const recentActivity = analytics?.recentActivity || [];

  const readinessScore = clamp(
    safeNumber(overview.readinessScore)
  );

  const notesGenerated = safeNumber(overview.notesGenerated);

  const resumesAnalyzed = safeNumber(overview.resumesAnalyzed);

  const interviewsAttended = safeNumber(
    overview.interviewsAttended
  );

  const mockTestsAttempted = safeNumber(
    overview.mockTestsAttempted
  );

  const totalLearningActivities = useMemo(() => {
    return weeklyActivity.reduce(
      (total, item) => total + safeNumber(item.total),
      0
    );
  }, [weeklyActivity]);

  const activeDays = useMemo(() => {
    return weeklyActivity.filter(
      (item) => safeNumber(item.total) > 0
    ).length;
  }, [weeklyActivity]);

  const maxWeeklyActivity = useMemo(() => {
    const values = weeklyActivity.map((item) =>
      safeNumber(item.total)
    );

    return Math.max(...values, 1);
  }, [weeklyActivity]);

  const weeklyAverage = useMemo(() => {
    if (!weeklyActivity.length) return 0;

    return Math.round(
      weeklyActivity.reduce(
        (sum, item) => sum + safeNumber(item.total),
        0
      ) / weeklyActivity.length
    );
  }, [weeklyActivity]);

  const interviewAverage = safeNumber(interviews.averageScore);

  const mockTestAverage = safeNumber(mockTests.averageScore);

  const resumeAverage = safeNumber(resume.averageScore);

  /* =========================================================
     SIDEBAR DATA
  ========================================================= */

  const navItems = [
    {
      label: "Dashboard",
      icon: <FiHome size={19} />,
      path: "/dashboard",
    },
    {
      label: "Courses",
      icon: <FiBook size={19} />,
      path: "/courses",
    },
    {
      label: "Progress Analytics",
      icon: <FiBarChart2 size={19} />,
      path: "/progress",
    },
    {
      label: "Profile",
      icon: <FiUser size={19} />,
      path: "/profile",
    },
  ];

  const aiToolsItems = [
    {
      label: "AI Chatbot",
      icon: <FiCpu size={19} />,
      path: "/chatbot",
    },
    {
      label: "AI Note Maker",
      icon: <FiEdit3 size={19} />,
      path: "/notes",
    },
    {
      label: "Saved Notes",
      icon: <FiBookOpen size={19} />,
      path: "/saved-notes",
    },
    {
      label: "YouTube MindMap",
      icon: <FiCompass size={19} />,
      path: "/mindmap",
    },
    {
      label: "Resume Analyzer",
      icon: <FiFileText size={19} />,
      path: "/resume",
    },
    {
      label: "Mock Tests",
      icon: <FiClipboard size={19} />,
      path: "/mock-tests",
    },
    {
      label: "Mock Interview",
      icon: <FiMic size={19} />,
      path: "/mock-interview",
    },
  ];

  const learningItems = [
    {
      label: "Resource Hub",
      icon: <FiBookOpen size={19} />,
      path: "/resources",
    },
    {
      label: "Leaderboard",
      icon: <FiAward size={19} />,
      path: "/leaderboard",
    },
    {
      label: "Habit Tracker",
      icon: <FiActivity size={19} />,
      path: "/habits",
    },
  ];

  /* =========================================================
     QUICK ACTIONS
  ========================================================= */

  const quickActions = [
    {
      title: "AI Chat",
      description: "Ask anything and learn faster",
      icon: <FiMessageSquare size={23} />,
      path: "/chatbot",
      className: "action-purple",
    },
    {
      title: "Generate Notes",
      description: "Turn topics into smart notes",
      icon: <FiEdit3 size={23} />,
      path: "/notes",
      className: "action-pink",
    },
    {
      title: "Mock Test",
      description: "Practice placement questions",
      icon: <FiClipboard size={23} />,
      path: "/mock-tests",
      className: "action-orange",
    },
    {
      title: "Mock Interview",
      description: "Practice with AI interviewer",
      icon: <FiMic size={23} />,
      path: "/mock-interview",
      className: "action-green",
    },
  ];

  /* =========================================================
     STAT CARDS
  ========================================================= */

  const stats = [
    {
      title: "AI Notes",
      value: notesGenerated,
      subtitle: `${safeNumber(notes.today)} generated today`,
      icon: <FiEdit3 />,
      color: "#c084fc",
      path: "/notes",
    },
    {
      title: "Resume Analysis",
      value: resumesAnalyzed,
      subtitle:
        resumeAverage > 0
          ? `Average score ${resumeAverage}%`
          : "No resume score yet",
      icon: <FiFileText />,
      color: "#f59e0b",
      path: "/resume",
    },
    {
      title: "Mock Interviews",
      value: interviewsAttended,
      subtitle:
        interviewAverage > 0
          ? `Average ${interviewAverage}%`
          : "No interviews completed",
      icon: <FiMic />,
      color: "#fb7185",
      path: "/mock-interview",
    },
    {
      title: "Mock Tests",
      value: mockTestsAttempted,
      subtitle:
        mockTestAverage > 0
          ? `Average ${mockTestAverage}%`
          : "No tests attempted",
      icon: <FiClipboard />,
      color: "#34d399",
      path: "/mock-tests",
    },
  ];

  /* =========================================================
     STYLES
  ========================================================= */

  const styles = {
    app: {
      minHeight: "100vh",
      width: "100%",
      display: "flex",
      background:
        "radial-gradient(circle at 15% 10%, rgba(124,58,237,0.16), transparent 28%), radial-gradient(circle at 85% 20%, rgba(236,72,153,0.10), transparent 28%), radial-gradient(circle at 70% 90%, rgba(245,158,11,0.08), transparent 25%), #050509",
      color: "#f8fafc",
      fontFamily:
        "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      overflow: "hidden",
      position: "relative",
    },

    sidebar: {
      width: isSidebarOpen ? "278px" : "82px",
      minWidth: isSidebarOpen ? "278px" : "82px",
      height: "100vh",
      background:
        "linear-gradient(180deg, rgba(15,15,23,0.97), rgba(8,8,13,0.98))",
      backdropFilter: "blur(25px)",
      WebkitBackdropFilter: "blur(25px)",
      borderRight: "1px solid rgba(255,255,255,0.07)",
      padding: "20px 13px",
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      position: isMobile ? "fixed" : "relative",
      left: isMobile
        ? isSidebarOpen
          ? "0"
          : "-300px"
        : "0",
      top: 0,
      zIndex: 1000,
      transition:
        "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
      boxShadow: isMobile && isSidebarOpen
        ? "30px 0 80px rgba(0,0,0,0.6)"
        : "none",
    },

    main: {
      flex: 1,
      minWidth: 0,
      height: "100vh",
      overflowY: "auto",
      overflowX: "hidden",
      position: "relative",
    },

    content: {
      maxWidth: "1600px",
      margin: "0 auto",
      padding: isMobile
        ? "18px 15px 40px"
        : "28px 38px 50px",
      boxSizing: "border-box",
    },
  };

  /* =========================================================
     LOADING SCREEN
  ========================================================= */

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <style>{`
          .dashboard-loading {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background:
              radial-gradient(circle at 50% 40%, rgba(124,58,237,.2), transparent 30%),
              #050509;
            color: white;
            font-family: Inter, system-ui, sans-serif;
          }

          .loading-box {
            width: min(420px, 90vw);
            padding: 40px;
            border-radius: 28px;
            text-align: center;
            background: rgba(20,20,30,.72);
            border: 1px solid rgba(255,255,255,.09);
            backdrop-filter: blur(25px);
            box-shadow: 0 30px 100px rgba(0,0,0,.5);
          }

          .loading-logo {
            width: 70px;
            height: 70px;
            object-fit: cover;
            border-radius: 20px;
            margin-bottom: 20px;
            box-shadow:
              0 0 40px rgba(168,85,247,.35);
          }

          .loading-spinner {
            width: 35px;
            height: 35px;
            border-radius: 50%;
            border: 3px solid rgba(255,255,255,.1);
            border-top-color: #c084fc;
            border-right-color: #f472b6;
            margin: 22px auto 0;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>

        <div className="loading-box">
          <img
            src={logoImage}
            alt="PrepPulse"
            className="loading-logo"
          />

          <h2
            style={{
              margin: 0,
              fontSize: "1.5rem",
              fontWeight: 800,
            }}
          >
            Loading PrepPulse
          </h2>

          <p
            style={{
              color: "#94a3b8",
              margin: "10px 0 0",
            }}
          >
            Preparing your learning dashboard...
          </p>

          <div className="loading-spinner" />
        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR SCREEN
  ========================================================= */

  if (error && !analytics) {
    return (
      <div className="dashboard-error">
        <style>{`
          .dashboard-error {
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
            background: #050509;
            color: white;
            font-family: Inter, system-ui, sans-serif;
          }

          .error-card {
            max-width: 500px;
            width: 100%;
            padding: 40px;
            border-radius: 28px;
            background: rgba(20,20,30,.75);
            border: 1px solid rgba(248,113,113,.2);
            text-align: center;
            backdrop-filter: blur(25px);
          }

          .error-icon {
            width: 65px;
            height: 65px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            border-radius: 20px;
            background: rgba(248,113,113,.1);
            color: #f87171;
            font-size: 28px;
          }

          .error-button {
            border: 0;
            padding: 12px 22px;
            border-radius: 14px;
            background: linear-gradient(135deg,#7c3aed,#ec4899);
            color: white;
            font-weight: 700;
            cursor: pointer;
            margin-top: 20px;
          }
        `}</style>

        <div className="error-card">
          <div className="error-icon">
            <FiAlertCircle />
          </div>

          <h2>Unable to load dashboard</h2>

          <p
            style={{
              color: "#94a3b8",
              lineHeight: 1.6,
            }}
          >
            {error}
          </p>

          <button
            className="error-button"
            onClick={() => fetchAnalytics(true)}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.app}>
      <style>{`
        * {
          box-sizing: border-box;
        }

        html,
        body,
        #root {
          margin: 0;
          padding: 0;
          min-height: 100%;
          background: #050509;
        }

        body {
          overflow: hidden;
        }

        button {
          font-family: inherit;
        }

        ::selection {
          background: rgba(192,132,252,.35);
          color: white;
        }

        ::-webkit-scrollbar {
          width: 7px;
          height: 7px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(192,132,252,.22);
          border-radius: 20px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(192,132,252,.45);
        }

        .sidebar-nav-item {
          position: relative;
          display: flex;
          align-items: center;
          gap: 13px;
          width: 100%;
          padding: 11px 12px;
          margin-bottom: 5px;
          border-radius: 13px;
          border: 1px solid transparent;
          background: transparent;
          color: #94a3b8;
          cursor: pointer;
          transition: all .25s ease;
          overflow: hidden;
        }

        .sidebar-nav-item:hover {
          color: white;
          background: linear-gradient(
            90deg,
            rgba(124,58,237,.15),
            rgba(236,72,153,.08)
          );
          border-color: rgba(192,132,252,.18);
          transform: translateX(3px);
        }

        .sidebar-nav-item.active {
          color: white;
          background: linear-gradient(
            90deg,
            rgba(124,58,237,.24),
            rgba(236,72,153,.11)
          );
          border-color: rgba(192,132,252,.24);
          box-shadow:
            inset 3px 0 0 #c084fc,
            0 8px 25px rgba(124,58,237,.08);
        }

        .glass-card {
          background:
            linear-gradient(
              145deg,
              rgba(24,24,35,.78),
              rgba(12,12,19,.68)
            );
          border: 1px solid rgba(255,255,255,.075);
          backdrop-filter: blur(22px);
          -webkit-backdrop-filter: blur(22px);
          box-shadow:
            0 25px 70px rgba(0,0,0,.28),
            inset 0 1px 0 rgba(255,255,255,.035);
        }

        .metric-card {
          position: relative;
          overflow: hidden;
          cursor: pointer;
          transition:
            transform .3s ease,
            border-color .3s ease,
            box-shadow .3s ease;
        }

        .metric-card:hover {
          transform: translateY(-5px);
          border-color: rgba(192,132,252,.25);
          box-shadow:
            0 25px 55px rgba(0,0,0,.4),
            0 0 30px rgba(124,58,237,.08);
        }

        .metric-card::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            radial-gradient(
              circle at top right,
              rgba(255,255,255,.06),
              transparent 35%
            );
          pointer-events: none;
        }

        .quick-action {
          position: relative;
          overflow: hidden;
          cursor: pointer;
          transition: all .3s ease;
        }

        .quick-action:hover {
          transform: translateY(-6px);
          box-shadow:
            0 25px 55px rgba(0,0,0,.4),
            0 0 35px rgba(168,85,247,.12);
        }

        .quick-action::after {
          content: "";
          position: absolute;
          width: 120px;
          height: 120px;
          right: -40px;
          bottom: -50px;
          border-radius: 50%;
          background: rgba(255,255,255,.08);
          filter: blur(5px);
        }

        .action-purple {
          background:
            linear-gradient(
              135deg,
              rgba(124,58,237,.32),
              rgba(91,33,182,.10)
            );
        }

        .action-pink {
          background:
            linear-gradient(
              135deg,
              rgba(236,72,153,.30),
              rgba(157,23,77,.10)
            );
        }

        .action-orange {
          background:
            linear-gradient(
              135deg,
              rgba(245,158,11,.27),
              rgba(180,83,9,.10)
            );
        }

        .action-green {
          background:
            linear-gradient(
              135deg,
              rgba(16,185,129,.25),
              rgba(4,120,87,.10)
            );
        }

        .section-heading {
          font-size: 1.08rem;
          font-weight: 800;
          color: #f8fafc;
          margin: 0;
          letter-spacing: -.2px;
        }

        .section-subtitle {
          color: #64748b;
          font-size: .78rem;
          margin-top: 4px;
        }

        .chart-bar {
          transition: all .3s ease;
        }

        .chart-bar:hover {
          filter: brightness(1.35);
        }

        .activity-row {
          transition: background .2s ease;
        }

        .activity-row:hover {
          background: rgba(255,255,255,.035);
        }

        .mobile-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,.62);
          backdrop-filter: blur(4px);
          z-index: 999;
        }

        .top-action {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 13px;
          background: rgba(255,255,255,.035);
          border: 1px solid rgba(255,255,255,.08);
          color: #94a3b8;
          cursor: pointer;
          transition: all .2s ease;
        }

        .top-action:hover {
          color: white;
          border-color: rgba(192,132,252,.25);
          background: rgba(124,58,237,.12);
        }

        @media (max-width: 1200px) {
          .dashboard-main-grid {
            grid-template-columns: 1fr !important;
          }

          .dashboard-bottom-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 700px) {
          .metric-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }

          .quick-grid {
            grid-template-columns: 1fr !important;
          }

          .hero-grid {
            grid-template-columns: 1fr !important;
          }

          .hero-card {
            padding: 24px !important;
          }

          .hero-title {
            font-size: 1.75rem !important;
          }

          .chart-container {
            height: 190px !important;
          }
        }

        @media (max-width: 470px) {
          .metric-grid {
            grid-template-columns: 1fr !important;
          }

          .hero-title {
            font-size: 1.5rem !important;
          }
        }
      `}</style>

      {/* =====================================================
          MOBILE OVERLAY
      ===================================================== */}

      {isMobile && isSidebarOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside style={styles.sidebar}>
        {/* Logo */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "25px",
            padding: "2px 4px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "11px",
              overflow: "hidden",
            }}
          >
            <img
              src={logoImage}
              alt="PrepPulse"
              style={{
                width: "39px",
                height: "39px",
                objectFit: "cover",
                borderRadius: "12px",
                flexShrink: 0,
                boxShadow:
                  "0 0 28px rgba(168,85,247,.3)",
              }}
            />

            {isSidebarOpen && (
              <div
                style={{
                  fontSize: "1.35rem",
                  fontWeight: 900,
                  letterSpacing: "-.4px",
                  background:
                    "linear-gradient(90deg,#c084fc,#f472b6,#f59e0b)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  whiteSpace: "nowrap",
                }}
              >
                PrepPulse
              </div>
            )}
          </div>

          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{
              width: "35px",
              height: "35px",
              borderRadius: "11px",
              border:
                "1px solid rgba(255,255,255,.08)",
              background:
                "rgba(255,255,255,.035)",
              color: "#c084fc",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            {isSidebarOpen ? (
              <FiX size={18} />
            ) : (
              <FiMenu size={18} />
            )}
          </button>
        </div>

        {/* User mini profile */}

        {isSidebarOpen && (
          <div
            style={{
              padding: "13px",
              borderRadius: "17px",
              marginBottom: "20px",
              background:
                "linear-gradient(135deg,rgba(124,58,237,.13),rgba(236,72,153,.07))",
              border:
                "1px solid rgba(192,132,252,.13)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "11px",
              }}
            >
              <div
                style={{
                  width: "39px",
                  height: "39px",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "linear-gradient(135deg,#7c3aed,#ec4899)",
                  fontWeight: 900,
                  fontSize: ".8rem",
                  boxShadow:
                    "0 8px 25px rgba(124,58,237,.25)",
                }}
              >
                {getInitials(userName)}
              </div>

              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: ".88rem",
                    fontWeight: 800,
                    color: "#f8fafc",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {userName}
                </div>

                <div
                  style={{
                    color: "#64748b",
                    fontSize: ".7rem",
                    marginTop: "2px",
                  }}
                >
                  PrepPulse AI Learning Workspace
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main */}

        <div
          style={{
            color: "#475569",
            fontSize: ".64rem",
            fontWeight: 900,
            letterSpacing: "1.5px",
            padding: "0 10px 9px",
            display: isSidebarOpen
              ? "block"
              : "none",
          }}
        >
          MAIN
        </div>

        <nav>
          {navItems.map((item) => {
            const active =
              window.location.pathname === item.path;

            return (
              <button
                key={item.path}
                className={`sidebar-nav-item ${
                  active ? "active" : ""
                }`}
                onClick={() => navigateTo(item.path)}
                title={!isSidebarOpen ? item.label : ""}
              >
                <span
                  style={{
                    color: active
                      ? "#c084fc"
                      : "#64748b",
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </span>

                {isSidebarOpen && (
                  <span
                    style={{
                      fontSize: ".84rem",
                      fontWeight: active ? 700 : 500,
                    }}
                  >
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* AI Tools */}

        <div
          style={{
            color: "#475569",
            fontSize: ".64rem",
            fontWeight: 900,
            letterSpacing: "1.5px",
            padding: "18px 10px 9px",
            display: isSidebarOpen
              ? "block"
              : "none",
          }}
        >
          AI TOOLS
        </div>

        <nav
          style={{
            overflowY: "auto",
            flex: 1,
            paddingRight: "2px",
          }}
        >
          {aiToolsItems.map((item) => (
            <button
              key={item.path}
              className="sidebar-nav-item"
              onClick={() => navigateTo(item.path)}
              title={!isSidebarOpen ? item.label : ""}
            >
              <span
                style={{
                  color: "#a78bfa",
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </span>

              {isSidebarOpen && (
                <span
                  style={{
                    fontSize: ".84rem",
                  }}
                >
                  {item.label}
                </span>
              )}
            </button>
          ))}

          <div
            style={{
              color: "#475569",
              fontSize: ".64rem",
              fontWeight: 900,
              letterSpacing: "1.5px",
              padding: "18px 10px 9px",
              display: isSidebarOpen
                ? "block"
                : "none",
            }}
          >
            LEARNING
          </div>

          {learningItems.map((item) => (
            <button
              key={item.path}
              className="sidebar-nav-item"
              onClick={() => navigateTo(item.path)}
              title={!isSidebarOpen ? item.label : ""}
            >
              <span
                style={{
                  color: "#34d399",
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </span>

              {isSidebarOpen && (
                <span
                  style={{
                    fontSize: ".84rem",
                  }}
                >
                  {item.label}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Account */}

        <div
          style={{
            borderTop:
              "1px solid rgba(255,255,255,.06)",
            paddingTop: "12px",
            marginTop: "10px",
          }}
        >
          <button
            className={`sidebar-nav-item ${
              window.location.pathname === "/notifications"
                ? "active"
                : ""
            }`}
            onClick={() => navigateTo("/notifications")}
            title={!isSidebarOpen ? "Notifications" : ""}
          >
            <span
              style={{
                color:
                  window.location.pathname === "/notifications"
                    ? "#f59e0b"
                    : "#f59e0b",
                flexShrink: 0,
              }}
            >
              <FiBell size={19} />
            </span>

            {isSidebarOpen && (
              <span
                style={{
                  fontSize: ".84rem",
                  fontWeight:
                    window.location.pathname === "/notifications"
                      ? 700
                      : 500,
                }}
              >
                Notifications
              </span>
            )}
          </button>

          <button
            className={`sidebar-nav-item ${
              window.location.pathname === "/settings"
                ? "active"
                : ""
            }`}
            onClick={() => navigateTo("/settings")}
            title={!isSidebarOpen ? "Settings" : ""}
          >
            <span
              style={{
                color:
                  window.location.pathname === "/settings"
                    ? "#c084fc"
                    : "#94a3b8",
                flexShrink: 0,
              }}
            >
              <FiSettings size={19} />
            </span>

            {isSidebarOpen && (
              <span
                style={{
                  fontSize: ".84rem",
                  fontWeight:
                    window.location.pathname === "/settings"
                      ? 700
                      : 500,
                }}
              >
                Settings
              </span>
            )}
          </button>

          <button
            className="sidebar-nav-item"
            onClick={handleLogout}
            title={!isSidebarOpen ? "Logout" : ""}
            style={{
              color: "#f87171",
            }}
          >
            <span>
              <FiLogOut size={19} />
            </span>

            {isSidebarOpen && (
              <span style={{ fontSize: ".84rem" }}>
                Logout
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main style={styles.main}>
        <div style={styles.content}>
          {/* =================================================
              TOP BAR
          ================================================= */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "15px",
              marginBottom: "25px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              {isMobile && (
                <button
                  className="top-action"
                  onClick={() =>
                    setIsSidebarOpen(true)
                  }
                >
                  <FiMenu size={20} />
                </button>
              )}

              <div>
                <div
                  style={{
                    color: "#64748b",
                    fontSize: ".72rem",
                    fontWeight: 700,
                    letterSpacing: ".6px",
                  }}
                >
                  LEARNING COMMAND CENTER
                </div>

                <div
                  style={{
                    fontSize: ".95rem",
                    fontWeight: 800,
                    marginTop: "3px",
                  }}
                >
                  Your PrepPulse Dashboard
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "9px",
              }}
            >
              <div
                style={{
                  display: isMobile
                    ? "none"
                    : "flex",
                  alignItems: "center",
                  gap: "7px",
                  padding: "8px 11px",
                  borderRadius: "12px",
                  background:
                    "rgba(16,185,129,.07)",
                  border:
                    "1px solid rgba(16,185,129,.14)",
                  color: "#6ee7b7",
                  fontSize: ".68rem",
                  fontWeight: 700,
                }}
              >
                <span
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    background: "#34d399",
                    boxShadow:
                      "0 0 12px rgba(52,211,153,.7)",
                  }}
                />

                LIVE
              </div>

              <button
                className="top-action"
                onClick={() => fetchAnalytics(true)}
                title="Refresh dashboard"
                style={{
                  transform: isRefreshing
                    ? "rotate(180deg)"
                    : "none",
                  transition:
                    "transform .5s ease",
                }}
              >
                <FiRefreshCw size={17} />
              </button>
            </div>
          </div>

          {/* =================================================
              HERO
          ================================================= */}

          <motion.section
            className="glass-card hero-card"
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
            }}
            style={{
              position: "relative",
              overflow: "hidden",
              borderRadius: "28px",
              padding: "32px",
              marginBottom: "22px",
              background:
                "linear-gradient(135deg,rgba(91,33,182,.27),rgba(24,24,35,.84) 45%,rgba(157,23,77,.12))",
            }}
          >
            {/* Decorative lights */}

            <div
              style={{
                position: "absolute",
                width: "250px",
                height: "250px",
                right: "-70px",
                top: "-100px",
                borderRadius: "50%",
                background:
                  "rgba(192,132,252,.13)",
                filter: "blur(25px)",
              }}
            />

            <div
              style={{
                position: "absolute",
                width: "190px",
                height: "190px",
                right: "22%",
                bottom: "-130px",
                borderRadius: "50%",
                background:
                  "rgba(236,72,153,.09)",
                filter: "blur(35px)",
              }}
            />

            <div
              className="hero-grid"
              style={{
                display: "grid",
                gridTemplateColumns:
                  "1fr auto",
                gap: "35px",
                alignItems: "center",
                position: "relative",
                zIndex: 1,
              }}
            >
              <div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "7px",
                    padding: "7px 11px",
                    borderRadius: "999px",
                    background:
                      "rgba(255,255,255,.055)",
                    border:
                      "1px solid rgba(255,255,255,.08)",
                    color: "#c084fc",
                    fontSize: ".67rem",
                    fontWeight: 800,
                    letterSpacing: ".7px",
                    marginBottom: "14px",
                  }}
                >
                  <FiZap size={13} />
                  PREPPULSE AI
                </div>

                <h1
                  className="hero-title"
                  style={{
                    fontSize: "2.45rem",
                    lineHeight: 1.08,
                    margin: 0,
                    fontWeight: 900,
                    letterSpacing: "-1.2px",
                  }}
                >
                  Welcome back,{" "}
                  <span
                    style={{
                      background:
                        "linear-gradient(90deg,#c084fc,#f472b6,#f59e0b)",
                      WebkitBackgroundClip:
                        "text",
                      WebkitTextFillColor:
                        "transparent",
                    }}
                  >
                    {userName}
                  </span>
                  .
                </h1>

                <p
                  style={{
                    maxWidth: "700px",
                    color: "#94a3b8",
                    lineHeight: 1.7,
                    margin:
                      "14px 0 20px",
                    fontSize: ".92rem",
                  }}
                >
                  Your AI-powered learning workspace is
                  ready. Track your preparation, analyze
                  your performance, practice interviews and
                  keep building momentum toward your career
                  goals.
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    onClick={() =>
                      navigateTo("/progress")
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding:
                        "11px 15px",
                      border: 0,
                      borderRadius: "13px",
                      background:
                        "linear-gradient(135deg,#7c3aed,#ec4899)",
                      color: "white",
                      fontWeight: 800,
                      cursor: "pointer",
                      boxShadow:
                        "0 10px 30px rgba(124,58,237,.25)",
                    }}
                  >
                    View Analytics
                    <FiArrowUpRight />
                  </button>

                  <button
                    onClick={() =>
                      navigateTo("/mock-interview")
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding:
                        "11px 15px",
                      border:
                        "1px solid rgba(255,255,255,.1)",
                      borderRadius: "13px",
                      background:
                        "rgba(255,255,255,.035)",
                      color: "#e2e8f0",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    <FiMic />
                    Practice Interview
                  </button>
                </div>
              </div>

              {/* Readiness Ring */}

              <div
                style={{
                  width: "190px",
                  height: "190px",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg
                  width="190"
                  height="190"
                  viewBox="0 0 190 190"
                  style={{
                    transform:
                      "rotate(-90deg)",
                  }}
                >
                  <circle
                    cx="95"
                    cy="95"
                    r="75"
                    fill="none"
                    stroke="rgba(255,255,255,.06)"
                    strokeWidth="13"
                  />

                  <motion.circle
                    cx="95"
                    cy="95"
                    r="75"
                    fill="none"
                    stroke="url(#readinessGradient)"
                    strokeWidth="13"
                    strokeLinecap="round"
                    strokeDasharray={
                      2 * Math.PI * 75
                    }
                    initial={{
                      strokeDashoffset:
                        2 * Math.PI * 75,
                    }}
                    animate={{
                      strokeDashoffset:
                        2 *
                        Math.PI *
                        75 *
                        (1 -
                          readinessScore /
                            100),
                    }}
                    transition={{
                      duration: 1.2,
                      ease: "easeOut",
                    }}
                  />

                  <defs>
                    <linearGradient
                      id="readinessGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop
                        offset="0%"
                        stopColor="#c084fc"
                      />
                      <stop
                        offset="50%"
                        stopColor="#ec4899"
                      />
                      <stop
                        offset="100%"
                        stopColor="#f59e0b"
                      />
                    </linearGradient>
                  </defs>
                </svg>

                <div
                  style={{
                    position: "absolute",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "2.25rem",
                      fontWeight: 900,
                      lineHeight: 1,
                    }}
                  >
                    {readinessScore}
                    <span
                      style={{
                        fontSize: "1rem",
                        color: "#94a3b8",
                      }}
                    >
                      %
                    </span>
                  </div>

                  <div
                    style={{
                      color: "#94a3b8",
                      fontSize: ".66rem",
                      fontWeight: 700,
                      marginTop: "7px",
                    }}
                  >
                    READINESS
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* =================================================
              LIVE STATUS
          ================================================= */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "10px",
              marginBottom: "18px",
              color: "#64748b",
              fontSize: ".7rem",
            }}
          >
            <span>
              {lastUpdated
                ? `Last synchronized ${formatTimeAgo(
                    lastUpdated
                  )}`
                : "Synchronizing analytics..."}
            </span>

            {error && (
              <span
                style={{
                  color: "#fbbf24",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <FiAlertCircle />
                Temporary sync issue
              </span>
            )}
          </div>

          {/* =================================================
              REAL METRICS
          ================================================= */}

          <div
            className="metric-grid"
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(4,minmax(0,1fr))",
              gap: "14px",
              marginBottom: "24px",
            }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                className="glass-card metric-card"
                initial={{
                  opacity: 0,
                  y: 15,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: index * 0.07,
                }}
                onClick={() =>
                  navigateTo(stat.path)
                }
                style={{
                  padding: "20px",
                  borderRadius: "20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "flex-start",
                    gap: "10px",
                  }}
                >
                  <div>
                    <div
                      style={{
                        color: "#64748b",
                        fontSize: ".7rem",
                        fontWeight: 700,
                        textTransform:
                          "uppercase",
                        letterSpacing: ".5px",
                      }}
                    >
                      {stat.title}
                    </div>

                    <div
                      style={{
                        fontSize: "2rem",
                        fontWeight: 900,
                        marginTop: "8px",
                        letterSpacing:
                          "-.8px",
                      }}
                    >
                      {stat.value}
                    </div>
                  </div>

                  <div
                    style={{
                      width: "43px",
                      height: "43px",
                      borderRadius: "14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent:
                        "center",
                      color: stat.color,
                      background: `${stat.color}12`,
                      border: `1px solid ${stat.color}25`,
                    }}
                  >
                    {stat.icon}
                  </div>
                </div>

                <div
                  style={{
                    color: "#64748b",
                    fontSize: ".72rem",
                    marginTop: "11px",
                  }}
                >
                  {stat.subtitle}
                </div>
              </motion.div>
            ))}
          </div>

          {/* =================================================
              MAIN ANALYTICS GRID
          ================================================= */}

          <div
            className="dashboard-main-grid"
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(0,1.55fr) minmax(320px,.8fr)",
              gap: "18px",
              marginBottom: "18px",
            }}
          >
            {/* WEEKLY ACTIVITY */}

            <section
              className="glass-card"
              style={{
                borderRadius: "22px",
                padding: "22px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "flex-start",
                  gap: "10px",
                  marginBottom: "20px",
                }}
              >
                <div>
                  <h2 className="section-heading">
                    Weekly Activity
                  </h2>

                  <div className="section-subtitle">
                    Your real learning activity from
                    the last 7 days
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                    padding: "7px 10px",
                    borderRadius: "10px",
                    background:
                      "rgba(192,132,252,.07)",
                    border:
                      "1px solid rgba(192,132,252,.1)",
                    color: "#c084fc",
                    fontSize: ".68rem",
                    fontWeight: 700,
                  }}
                >
                  <FiTrendingUp />
                  {weeklyAverage}/day
                </div>
              </div>

              {weeklyActivity.length > 0 ? (
                <div
                  className="chart-container"
                  style={{
                    height: "235px",
                    display: "flex",
                    alignItems: "flex-end",
                    gap: "10px",
                    padding:
                      "10px 4px 0",
                  }}
                >
                  {weeklyActivity.map(
                    (item, index) => {
                      const value =
                        safeNumber(
                          item.total
                        );

                      const height =
                        value === 0
                          ? 5
                          : Math.max(
                              10,
                              (value /
                                maxWeeklyActivity) *
                                170
                            );

                      return (
                        <div
                          key={`${item.date}-${index}`}
                          style={{
                            flex: 1,
                            height: "100%",
                            display: "flex",
                            flexDirection:
                              "column",
                            alignItems:
                              "center",
                            justifyContent:
                              "flex-end",
                            gap: "9px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: ".65rem",
                              color:
                                value > 0
                                  ? "#cbd5e1"
                                  : "#475569",
                              fontWeight: 700,
                            }}
                          >
                            {value}
                          </span>

                          <div
                            className="chart-bar"
                            style={{
                              width:
                                "min(38px,70%)",
                              height: `${height}px`,
                              borderRadius:
                                "10px 10px 5px 5px",
                              background:
                                value > 0
                                  ? "linear-gradient(180deg,#c084fc,#7c3aed)"
                                  : "rgba(255,255,255,.055)",
                              boxShadow:
                                value > 0
                                  ? "0 0 22px rgba(124,58,237,.18)"
                                  : "none",
                            }}
                          />

                          <span
                            style={{
                              color:
                                "#64748b",
                              fontSize: ".65rem",
                              fontWeight: 700,
                            }}
                          >
                            {item.label ||
                              "--"}
                          </span>
                        </div>
                      );
                    }
                  )}
                </div>
              ) : (
                <div
                  style={{
                    minHeight: "220px",
                    display: "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    textAlign: "center",
                    color: "#64748b",
                  }}
                >
                  <div>
                    <FiActivity
                      size={32}
                      style={{
                        marginBottom: "10px",
                      }}
                    />

                    <div>
                      No activity data yet.
                    </div>

                    <div
                      style={{
                        fontSize: ".75rem",
                        marginTop: "5px",
                      }}
                    >
                      Start learning to build your
                      activity graph.
                    </div>
                  </div>
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  gap: "25px",
                  borderTop:
                    "1px solid rgba(255,255,255,.06)",
                  paddingTop: "16px",
                  marginTop: "10px",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "1.2rem",
                      fontWeight: 900,
                    }}
                  >
                    {activeDays}
                  </div>

                  <div
                    style={{
                      color: "#64748b",
                      fontSize: ".68rem",
                    }}
                  >
                    Active Days
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: "1.2rem",
                      fontWeight: 900,
                    }}
                  >
                    {totalLearningActivities}
                  </div>

                  <div
                    style={{
                      color: "#64748b",
                      fontSize: ".68rem",
                    }}
                  >
                    Activities
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: "1.2rem",
                      fontWeight: 900,
                    }}
                  >
                    {weeklyAverage}
                  </div>

                  <div
                    style={{
                      color: "#64748b",
                      fontSize: ".68rem",
                    }}
                  >
                    Daily Average
                  </div>
                </div>
              </div>
            </section>

            {/* PERFORMANCE */}

            <section
              className="glass-card"
              style={{
                borderRadius: "22px",
                padding: "22px",
              }}
            >
              <div
                style={{
                  marginBottom: "22px",
                }}
              >
                <h2 className="section-heading">
                  Performance
                </h2>

                <div className="section-subtitle">
                  Current scores across your preparation
                </div>
              </div>

              {[
                {
                  label: "Resume",
                  value: resumeAverage,
                  icon: <FiFileText />,
                  color: "#f59e0b",
                },
                {
                  label: "Interviews",
                  value: interviewAverage,
                  icon: <FiMic />,
                  color: "#fb7185",
                },
                {
                  label: "Mock Tests",
                  value: mockTestAverage,
                  icon: <FiClipboard />,
                  color: "#34d399",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    marginBottom: "20px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        color: "#cbd5e1",
                        fontSize: ".76rem",
                        fontWeight: 700,
                      }}
                    >
                      <span
                        style={{
                          color: item.color,
                        }}
                      >
                        {item.icon}
                      </span>

                      {item.label}
                    </div>

                    <strong
                      style={{
                        color: item.color,
                        fontSize: ".78rem",
                      }}
                    >
                      {item.value > 0
                        ? `${item.value}%`
                        : "—"}
                    </strong>
                  </div>

                  <div
                    style={{
                      height: "7px",
                      borderRadius: "20px",
                      background:
                        "rgba(255,255,255,.055)",
                      overflow: "hidden",
                    }}
                  >
                    <motion.div
                      initial={{
                        width: 0,
                      }}
                      animate={{
                        width: `${clamp(
                          item.value
                        )}%`,
                      }}
                      transition={{
                        duration: 1,
                      }}
                      style={{
                        height: "100%",
                        borderRadius:
                          "inherit",
                        background: item.color,
                        boxShadow: `0 0 14px ${item.color}55`,
                      }}
                    />
                  </div>
                </div>
              ))}

              <div
                style={{
                  marginTop: "10px",
                  padding: "15px",
                  borderRadius: "15px",
                  background:
                    "linear-gradient(135deg,rgba(124,58,237,.12),rgba(236,72,153,.06))",
                  border:
                    "1px solid rgba(192,132,252,.12)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#c084fc",
                    fontSize: ".72rem",
                    fontWeight: 800,
                  }}
                >
                  <FiTarget />
                  READINESS SCORE
                </div>

                <div
                  style={{
                    fontSize: "1.8rem",
                    fontWeight: 900,
                    marginTop: "5px",
                  }}
                >
                  {readinessScore}%
                </div>

                <div
                  style={{
                    color: "#64748b",
                    fontSize: ".67rem",
                    lineHeight: 1.5,
                  }}
                >
                  Based on your available resume,
                  interview and mock-test performance.
                </div>
              </div>
            </section>
          </div>

          {/* =================================================
              QUICK ACTIONS
          ================================================= */}

          <section style={{ marginBottom: "22px" }}>
            <div
              style={{
                marginBottom: "12px",
              }}
            >
              <h2 className="section-heading">
                Quick Actions
              </h2>

              <div className="section-subtitle">
                Jump directly into your preparation
              </div>
            </div>

            <div
              className="quick-grid"
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(4,minmax(0,1fr))",
                gap: "13px",
              }}
            >
              {quickActions.map(
                (action, index) => (
                  <motion.div
                    key={action.title}
                    className={`glass-card quick-action ${action.className}`}
                    initial={{
                      opacity: 0,
                      y: 12,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay: index * 0.06,
                    }}
                    onClick={() =>
                      navigateTo(
                        action.path
                      )
                    }
                    style={{
                      padding: "19px",
                      borderRadius: "19px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent:
                          "space-between",
                      }}
                    >
                      <div
                        style={{
                          width: "43px",
                          height: "43px",
                          borderRadius:
                            "13px",
                          display: "flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "center",
                          background:
                            "rgba(255,255,255,.06)",
                          color: "#f8fafc",
                        }}
                      >
                        {action.icon}
                      </div>

                      <FiArrowUpRight
                        color="#64748b"
                      />
                    </div>

                    <div
                      style={{
                        marginTop: "20px",
                        position:
                          "relative",
                        zIndex: 1,
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 850,
                          fontSize: ".9rem",
                        }}
                      >
                        {action.title}
                      </div>

                      <div
                        style={{
                          color: "#94a3b8",
                          fontSize: ".69rem",
                          marginTop: "5px",
                        }}
                      >
                        {action.description}
                      </div>
                    </div>
                  </motion.div>
                )
              )}
            </div>
          </section>

          {/* =================================================
              INTERVIEW + MOCK TEST
          ================================================= */}

          <div
            className="dashboard-bottom-grid"
            style={{
              display: "grid",
              gridTemplateColumns:
                "1fr 1fr",
              gap: "18px",
              marginBottom: "22px",
            }}
          >
            {/* INTERVIEW */}

            <section
              className="glass-card"
              style={{
                borderRadius: "22px",
                padding: "22px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  marginBottom: "18px",
                }}
              >
                <div>
                  <h2 className="section-heading">
                    AI Interview Performance
                  </h2>

                  <div className="section-subtitle">
                    Your interview preparation snapshot
                  </div>
                </div>

                <button
                  onClick={() =>
                    navigateTo(
                      "/mock-interview"
                    )
                  }
                  style={{
                    border: 0,
                    background:
                      "transparent",
                    color: "#c084fc",
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: ".7rem",
                  }}
                >
                  Open <FiChevronRight />
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(3,1fr)",
                  gap: "9px",
                }}
              >
                {[
                  {
                    label: "Technical",
                    value:
                      safeNumber(
                        interviews.technicalScore
                      ),
                  },
                  {
                    label: "Communication",
                    value:
                      safeNumber(
                        interviews.communicationScore
                      ),
                  },
                  {
                    label: "Confidence",
                    value:
                      safeNumber(
                        interviews.confidenceScore
                      ),
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      padding: "15px 10px",
                      borderRadius: "15px",
                      background:
                        "rgba(255,255,255,.025)",
                      border:
                        "1px solid rgba(255,255,255,.06)",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize:
                          "1.25rem",
                        fontWeight: 900,
                      }}
                    >
                      {item.value > 0
                        ? `${item.value}%`
                        : "—"}
                    </div>

                    <div
                      style={{
                        color: "#64748b",
                        fontSize: ".6rem",
                        marginTop: "5px",
                        lineHeight: 1.3,
                      }}
                    >
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  marginTop: "13px",
                  padding: "12px",
                  borderRadius: "14px",
                  background:
                    "rgba(251,113,133,.055)",
                  border:
                    "1px solid rgba(251,113,133,.1)",
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div
                    style={{
                      color: "#64748b",
                      fontSize: ".63rem",
                    }}
                  >
                    Interviews completed
                  </div>

                  <strong>
                    {interviewsAttended}
                  </strong>
                </div>

                <FiMic
                  color="#fb7185"
                  size={20}
                />
              </div>
            </section>

            {/* MOCK TEST */}

            <section
              className="glass-card"
              style={{
                borderRadius: "22px",
                padding: "22px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  marginBottom: "18px",
                }}
              >
                <div>
                  <h2 className="section-heading">
                    Mock Test Performance
                  </h2>

                  <div className="section-subtitle">
                    Placement practice results
                  </div>
                </div>

                <button
                  onClick={() =>
                    navigateTo(
                      "/mock-tests"
                    )
                  }
                  style={{
                    border: 0,
                    background:
                      "transparent",
                    color: "#34d399",
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: ".7rem",
                  }}
                >
                  Practice{" "}
                  <FiChevronRight />
                </button>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "18px",
                }}
              >
                <div
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    background:
                      `conic-gradient(#34d399 ${
                        mockTestAverage *
                        3.6
                      }deg,rgba(255,255,255,.06) 0deg)`,
                    position: "relative",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: "76px",
                      height: "76px",
                      borderRadius:
                        "50%",
                      background:
                        "#111119",
                      display: "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      fontSize: "1.25rem",
                      fontWeight: 900,
                    }}
                  >
                    {mockTestAverage > 0
                      ? `${mockTestAverage}%`
                      : "—"}
                  </div>
                </div>

                <div
                  style={{
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      marginBottom: "9px",
                    }}
                  >
                    <span
                      style={{
                        color: "#64748b",
                        fontSize: ".68rem",
                      }}
                    >
                      Attempted
                    </span>

                    <strong>
                      {mockTestsAttempted}
                    </strong>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                        marginBottom: "9px",
                    }}
                  >
                    <span
                      style={{
                        color: "#64748b",
                        fontSize: ".68rem",
                      }}
                    >
                      Passed
                    </span>

                    <strong
                      style={{
                        color: "#34d399",
                      }}
                    >
                      {safeNumber(
                        mockTests.passed
                      )}
                    </strong>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                    }}
                  >
                    <span
                      style={{
                        color: "#64748b",
                        fontSize: ".68rem",
                      }}
                    >
                      Best Score
                    </span>

                    <strong
                      style={{
                        color: "#f59e0b",
                      }}
                    >
                      {safeNumber(
                        mockTests.bestScore
                      ) > 0
                        ? `${safeNumber(
                            mockTests.bestScore
                          )}%`
                        : "—"}
                    </strong>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* =================================================
              RECENT ACTIVITY
          ================================================= */}

          <section
            className="glass-card"
            style={{
              borderRadius: "22px",
              padding: "22px",
              marginBottom: "22px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                marginBottom: "18px",
              }}
            >
              <div>
                <h2 className="section-heading">
                  Recent Activity
                </h2>

                <div className="section-subtitle">
                  Latest actions recorded by PrepPulse
                </div>
              </div>

              <button
                onClick={() =>
                  navigateTo("/progress")
                }
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  border: 0,
                  background:
                    "transparent",
                  color: "#c084fc",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: ".7rem",
                }}
              >
                Full Analytics
                <FiExternalLink size={13} />
              </button>
            </div>

            {recentActivity.length > 0 ? (
              <div>
                {recentActivity
                  .slice(0, 8)
                  .map((activity, index) => {
                    const activityColor =
                      getActivityColor(
                        activity.type
                      );

                    return (
                      <div
                        className="activity-row"
                        key={`${activity.type}-${activity.date}-${index}`}
                        style={{
                          display: "flex",
                          alignItems:
                            "center",
                          gap: "13px",
                          padding:
                            "12px 8px",
                          borderRadius:
                            "12px",
                          borderBottom:
                            index ===
                            Math.min(
                              recentActivity.length,
                              8
                            ) -
                              1
                              ? "none"
                              : "1px solid rgba(255,255,255,.045)",
                        }}
                      >
                        <div
                          style={{
                            width: "38px",
                            height: "38px",
                            borderRadius:
                              "12px",
                            display: "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "center",
                            flexShrink: 0,
                            color:
                              activityColor,
                            background:
                              `${activityColor}10`,
                            border: `1px solid ${activityColor}22`,
                          }}
                        >
                          {getActivityIcon(
                            activity.type
                          )}
                        </div>

                        <div
                          style={{
                            minWidth: 0,
                            flex: 1,
                          }}
                        >
                          <div
                            style={{
                              fontSize: ".78rem",
                              fontWeight: 750,
                              color:
                                "#e2e8f0",
                              whiteSpace:
                                "nowrap",
                              overflow:
                                "hidden",
                              textOverflow:
                                "ellipsis",
                            }}
                          >
                            {activity.title ||
                              "Learning Activity"}
                          </div>

                          <div
                            style={{
                              fontSize: ".66rem",
                              color:
                                "#64748b",
                              marginTop:
                                "3px",
                            }}
                          >
                            {activity.subtitle ||
                              "Activity completed"}{" "}
                            •{" "}
                            {formatTimeAgo(
                              activity.date
                            )}
                          </div>
                        </div>

                        {activity.score !==
                          null &&
                          activity.score !==
                            undefined && (
                            <div
                              style={{
                                color:
                                  activityColor,
                                fontSize: ".75rem",
                                fontWeight: 900,
                              }}
                            >
                              {safeNumber(
                                activity.score
                              )}
                              %
                            </div>
                          )}

                        <FiChevronRight
                          size={15}
                          color="#475569"
                        />
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div
                style={{
                  padding: "35px 20px",
                  textAlign: "center",
                  color: "#64748b",
                }}
              >
                <FiActivity
                  size={30}
                  style={{
                    marginBottom: "10px",
                  }}
                />

                <div
                  style={{
                    fontSize: ".8rem",
                  }}
                >
                  No recent activity yet.
                </div>

                <div
                  style={{
                    fontSize: ".68rem",
                    marginTop: "5px",
                  }}
                >
                  Start using PrepPulse to see your
                  learning activity here.
                </div>
              </div>
            )}
          </section>

          {/* =================================================
              AI ECOSYSTEM
          ================================================= */}

          <section>
            <div
              style={{
                marginBottom: "13px",
              }}
            >
              <h2 className="section-heading">
                PrepPulse AI Ecosystem
              </h2>

              <div className="section-subtitle">
                Everything you need for learning and
                placement preparation
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(220px,1fr))",
                gap: "12px",
              }}
            >
              {[
                {
                  title: "AI Chatbot",
                  desc: "Intelligent learning assistant",
                  icon: <FiCpu />,
                  path: "/chatbot",
                  color: "#c084fc",
                },
                {
                  title: "AI Notes",
                  desc: "Smart notes and summaries",
                  icon: <FiEdit3 />,
                  path: "/notes",
                  color: "#f472b6",
                },
                {
                  title: "YouTube MindMap",
                  desc: "Transform videos into visual learning",
                  icon: <FiCompass />,
                  path: "/mindmap",
                  color: "#a78bfa",
                },
                {
                  title: "Resume Analyzer",
                  desc: "Improve your career profile",
                  icon: <FiFileText />,
                  path: "/resume",
                  color: "#f59e0b",
                },
                {
                  title: "Mock Tests",
                  desc: "Practice aptitude and technical skills",
                  icon: <FiClipboard />,
                  path: "/mock-tests",
                  color: "#34d399",
                },
                {
                  title: "AI Interview",
                  desc: "Simulate real interviews",
                  icon: <FiMic />,
                  path: "/mock-interview",
                  color: "#fb7185",
                },
                {
                  title: "Resource Hub",
                  desc: "Discover learning resources",
                  icon: <FiBookOpen />,
                  path: "/resources",
                  color: "#38bdf8",
                },
                {
                  title: "Progress Analytics",
                  desc: "Understand your growth",
                  icon: <FiBarChart2 />,
                  path: "/progress",
                  color: "#818cf8",
                },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  whileHover={{
                    y: -4,
                  }}
                  onClick={() =>
                    navigateTo(item.path)
                  }
                  style={{
                    padding: "17px",
                    borderRadius: "17px",
                    background:
                      "rgba(255,255,255,.025)",
                    border:
                      "1px solid rgba(255,255,255,.065)",
                    cursor: "pointer",
                    transition:
                      "border-color .2s ease",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems:
                        "center",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        width: "39px",
                        height: "39px",
                        borderRadius:
                          "12px",
                        display: "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        color: item.color,
                        background:
                          `${item.color}10`,
                        border: `1px solid ${item.color}20`,
                      }}
                    >
                      {item.icon}
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: ".77rem",
                          fontWeight: 800,
                        }}
                      >
                        {item.title}
                      </div>

                      <div
                        style={{
                          color:
                            "#64748b",
                          fontSize: ".63rem",
                          marginTop:
                            "3px",
                          lineHeight:
                            1.4,
                        }}
                      >
                        {item.desc}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* FOOTER */}

          <div
            style={{
              textAlign: "center",
              color: "#334155",
              fontSize: ".65rem",
              padding:
                "35px 0 10px",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <FiShield />
              PrepPulse AI Learning Platform
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;