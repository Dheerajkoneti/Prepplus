import React, { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  User,
  Bot,
  Pencil,
  Brain,
  FileText,
  FolderOpen,
  Trophy,
  Activity,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  Sparkles,
  GraduationCap,
  MessageSquarePlus,
} from "lucide-react";

import API from "../services/api";

function Sidebar() {
  const location = useLocation();

  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] =
    useState(false);

  // Feedback modal states
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackCategory, setFeedbackCategory] = useState("General Feedback");
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState("");

  // ============================================================
  // GET UNREAD COUNT
  // ============================================================

  const loadUnreadCount = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setUnreadCount(0);
        return;
      }

      setLoadingNotifications(true);

      console.log("🔔 Checking unread notifications...");

      // --------------------------------------------------------
      // FIRST TRY: unread-count endpoint
      // --------------------------------------------------------

      try {
        const response = await API.get(
          "/notifications/unread-count"
        );

        console.log(
          "🔔 Unread count API response:",
          response.data
        );

        const data = response.data;

        let count = null;

        // Possible response formats
        if (typeof data?.count === "number") {
          count = data.count;
        }

        if (
          count === null &&
          typeof data?.unreadCount === "number"
        ) {
          count = data.unreadCount;
        }

        if (
          count === null &&
          typeof data?.unread === "number"
        ) {
          count = data.unread;
        }

        if (
          count === null &&
          typeof data?.data?.count === "number"
        ) {
          count = data.data.count;
        }

        if (
          count === null &&
          typeof data?.data?.unreadCount === "number"
        ) {
          count = data.data.unreadCount;
        }

        if (
          count !== null &&
          Number.isFinite(count)
        ) {
          console.log(
            "✅ Sidebar unread count:",
            count
          );

          setUnreadCount(Math.max(0, count));

          setLoadingNotifications(false);

          return;
        }

        console.warn(
          "⚠️ Could not find unread count in API response."
        );

      } catch (countError) {
        console.warn(
          "⚠️ unread-count endpoint failed:",
          countError.response?.data ||
            countError.message
        );
      }

      // --------------------------------------------------------
      // FALLBACK: GET ALL NOTIFICATIONS
      // --------------------------------------------------------

      console.log(
        "🔄 Using notifications fallback..."
      );

      const notificationResponse = await API.get(
        "/notifications"
      );

      console.log(
        "🔔 Notifications API response:",
        notificationResponse.data
      );

      const notificationData =
        notificationResponse.data;

      let notifications = [];

      // Possible response formats

      if (
        Array.isArray(notificationData)
      ) {
        notifications = notificationData;
      } else if (
        Array.isArray(
          notificationData?.notifications
        )
      ) {
        notifications =
          notificationData.notifications;
      } else if (
        Array.isArray(
          notificationData?.data
        )
      ) {
        notifications =
          notificationData.data;
      } else if (
        Array.isArray(
          notificationData?.data?.notifications
        )
      ) {
        notifications =
          notificationData.data.notifications;
      }

      console.log(
        "📬 Notifications found:",
        notifications.length
      );

      const unread = notifications.filter(
        (notification) => {
          return (
            notification.isRead === false ||
            notification.read === false ||
            notification.status === "unread"
          );
        }
      ).length;

      console.log(
        "🔴 Calculated unread:",
        unread
      );

      setUnreadCount(unread);

    } catch (error) {
      console.error(
        "❌ Notification count error:",
        error.response?.data ||
          error.message
      );

      setUnreadCount(0);

    } finally {
      setLoadingNotifications(false);
    }
  }, []);

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    loadUnreadCount();
  }, [loadUnreadCount]);

  // ============================================================
  // REAL-TIME POLLING
  // Every 3 seconds
  // ============================================================

  useEffect(() => {
    const interval = setInterval(() => {
      loadUnreadCount();
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [loadUnreadCount]);

  // ============================================================
  // REFRESH WHEN TAB GETS FOCUS
  // ============================================================

  useEffect(() => {
    const handleFocus = () => {
      loadUnreadCount();
    };

    window.addEventListener(
      "focus",
      handleFocus
    );

    return () => {
      window.removeEventListener(
        "focus",
        handleFocus
      );
    };
  }, [loadUnreadCount]);

  // ============================================================
  // REFRESH WHEN PAGE BECOMES VISIBLE
  // ============================================================

  useEffect(() => {
    const handleVisibility = () => {
      if (
        document.visibilityState === "visible"
      ) {
        loadUnreadCount();
      }
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };
  }, [loadUnreadCount]);

  // ============================================================
  // CUSTOM EVENTS
  // ============================================================

  useEffect(() => {
    const refresh = () => {
      console.log(
        "🔔 Notification update event received"
      );

      loadUnreadCount();
    };

    window.addEventListener(
      "notification:new",
      refresh
    );

    window.addEventListener(
      "notification:read",
      refresh
    );

    window.addEventListener(
      "notification:updated",
      refresh
    );

    window.addEventListener(
      "notifications:refresh",
      refresh
    );

    return () => {
      window.removeEventListener(
        "notification:new",
        refresh
      );

      window.removeEventListener(
        "notification:read",
        refresh
      );

      window.removeEventListener(
        "notification:updated",
        refresh
      );

      window.removeEventListener(
        "notifications:refresh",
        refresh
      );
    };
  }, [loadUnreadCount]);

  // ============================================================
  // SUBMIT FEEDBACK HANDLER
  // ============================================================

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackMessage.trim()) return;

    try {
      setSubmittingFeedback(true);
      await API.post("/feedback", {
        message: feedbackMessage,
        category: feedbackCategory,
        rating: feedbackRating,
      });

      setFeedbackSuccess("Thank you! Your feedback has been submitted.");
      setFeedbackMessage("");
      setTimeout(() => {
        setFeedbackSuccess("");
        setIsFeedbackOpen(false);
      }, 2000);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit feedback.");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  // ============================================================
  // MENU DATA
  // ============================================================

  const menuItems = [
    {
      title: "MAIN",
      items: [
        {
          name: "Dashboard",
          icon: LayoutDashboard,
          path: "/dashboard",
        },
        {
          name: "Courses",
          icon: BookOpen,
          path: "/courses",
        },
        {
          name: "Progress Analytics",
          icon: BarChart3,
          path: "/progress",
        },
        {
          name: "Profile",
          icon: User,
          path: "/profile",
        },
      ],
    },

    {
      title: "AI TOOLS",
      items: [
        {
          name: "AI Chatbot",
          icon: Bot,
          path: "/chatbot",
        },
        {
          name: "AI Note Maker",
          icon: Pencil,
          path: "/notes",
        },
        {
          name: "Saved Notes",
          icon: BookOpen,
          path: "/saved-notes",
        },
        {
          name: "YouTube MindMap",
          icon: Brain,
          path: "/mindmap",
        },
        {
          name: "Resume Analyzer",
          icon: FileText,
          path: "/resume",
        },
      ],
    },

    {
      title: "LEARNING",
      items: [
        {
          name: "Resource Hub",
          icon: FolderOpen,
          path: "/resources",
        },
        {
          name: "Leaderboard",
          icon: Trophy,
          path: "/leaderboard",
        },
        {
          name: "Habit Tracker",
          icon: Activity,
          path: "/habits",
        },
      ],
    },
  ];

  // ============================================================
  // ACTIVE ROUTE
  // ============================================================

  const isActive = (path) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }

    return (
      location.pathname === path ||
      location.pathname.startsWith(
        `${path}/`
      )
    );
  };

  const notificationsActive =
    location.pathname === "/notifications" ||
    location.pathname.startsWith(
      "/notifications/"
    );

  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("authUser");

    window.location.href = "/login";
  };

  // ============================================================
  // BADGE TEXT
  // ============================================================

  const badgeText =
    unreadCount > 99
      ? "99+"
      : String(unreadCount);

  return (
    <>
      <style>{`

        * {
          box-sizing: border-box;
        }

        /* ======================================================
           SIDEBAR
        ====================================================== */

        .pp-sidebar {
          position: fixed;

          left: 0;
          top: 0;

          width: 280px;
          height: 100vh;

          display: flex;
          flex-direction: column;

          background:
            radial-gradient(
              circle at 0% 0%,
              rgba(139,92,246,0.13),
              transparent 32%
            ),
            radial-gradient(
              circle at 100% 90%,
              rgba(14,165,233,0.06),
              transparent 35%
            ),
            #050816;

          border-right:
            1px solid
            rgba(148,163,184,0.10);

          color: white;

          z-index: 9999;

          overflow: hidden;
        }

        /* ======================================================
           SCROLL AREA
        ====================================================== */

        .pp-sidebar-scroll {
          flex: 1 1 auto;
          min-height: 0;

          overflow-y: auto;

          padding:
            20px 14px 10px;

          scrollbar-width: thin;

          scrollbar-color:
            rgba(139,92,246,0.4)
            transparent;
        }

        .pp-sidebar-scroll::-webkit-scrollbar {
          width: 5px;
        }

        .pp-sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .pp-sidebar-scroll::-webkit-scrollbar-thumb {
          background:
            rgba(139,92,246,0.4);

          border-radius: 20px;
        }

        /* ======================================================
           LOGO
        ====================================================== */

        .pp-logo {
          display: flex;

          align-items: center;

          gap: 12px;

          padding:
            5px 8px 22px;

          color: white;

          text-decoration: none;
        }

        .pp-logo-icon {
          width: 44px;
          height: 44px;

          flex-shrink: 0;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 13px;

          background:
            linear-gradient(
              135deg,
              #6366f1,
              #8b5cf6,
              #ec4899
            );

          box-shadow:
            0 10px 30px
            rgba(139,92,246,0.3);
        }

        .pp-logo-title {
          font-size: 22px;

          font-weight: 900;

          letter-spacing: -0.8px;

          background:
            linear-gradient(
              90deg,
              #c084fc,
              #f472b6,
              #fb923c
            );

          -webkit-background-clip: text;

          -webkit-text-fill-color: transparent;
        }

        .pp-logo-subtitle {
          margin-top: 2px;

          color: #64748b;

          font-size: 9px;

          font-weight: 700;

          letter-spacing: 1px;

          text-transform: uppercase;
        }

        /* ======================================================
           AI BADGE
        ====================================================== */

        .pp-ai-badge {
          display: flex;

          align-items: center;

          gap: 8px;

          margin:
            0 8px 22px;

          padding:
            9px 11px;

          border-radius: 11px;

          border:
            1px solid
            rgba(139,92,246,0.15);

          background:
            rgba(139,92,246,0.06);

          color: #a78bfa;

          font-size: 10px;

          font-weight: 800;
        }

        /* ======================================================
           SECTION
        ====================================================== */

        .pp-sidebar-section {
          margin-bottom: 20px;
        }

        .pp-section-title {
          display: flex;

          align-items: center;

          gap: 8px;

          margin:
            0 10px 8px;

          color: #475569;

          font-size: 10px;

          font-weight: 900;

          letter-spacing: 1.7px;

          text-transform: uppercase;
        }

        .pp-section-line {
          flex: 1;

          height: 1px;

          background:
            linear-gradient(
              90deg,
              rgba(71,85,105,0.15),
              transparent
            );
        }

        /* ======================================================
           MENU ITEM
        ====================================================== */

        .pp-menu-item {
          position: relative;

          display: flex;

          align-items: center;

          width: 100%;

          min-height: 47px;

          gap: 12px;

          padding:
            10px 12px;

          margin-bottom: 4px;

          border-radius: 12px;

          border:
            1px solid transparent;

          color: #94a3b8;

          text-decoration: none;

          transition:
            all 0.2s ease;
        }

        .pp-menu-item:hover {
          color: white;

          background:
            rgba(139,92,246,0.07);

          border-color:
            rgba(139,92,246,0.12);

          transform:
            translateX(2px);
        }

        .pp-menu-item.active {
          color: white;

          background:
            linear-gradient(
              90deg,
              rgba(139,92,246,0.19),
              rgba(99,102,241,0.05)
            );

          border-color:
            rgba(139,92,246,0.27);
        }

        .pp-menu-item.active::before {
          content: "";

          position: absolute;

          left: -1px;

          top: 8px;

          bottom: 8px;

          width: 3px;

          border-radius:
            0 5px 5px 0;

          background:
            linear-gradient(
              180deg,
              #c084fc,
              #6366f1
            );

          box-shadow:
            0 0 13px
            rgba(168,85,247,0.7);
        }

        .pp-menu-icon {
          position: relative;

          width: 22px;
          height: 22px;

          flex-shrink: 0;

          display: flex;

          align-items: center;
          justify-content: center;

          color: #94a3b8;
        }

        .pp-menu-item:hover
          .pp-menu-icon,
        .pp-menu-item.active
          .pp-menu-icon {
          color: #c4b5fd;
        }

        .pp-menu-name {
          flex: 1;

          font-size: 13px;

          font-weight: 650;

          white-space: nowrap;
        }

        .pp-menu-arrow {
          flex-shrink: 0;

          color: #a78bfa;

          opacity: 0;

          transition:
            opacity 0.2s ease;
        }

        .pp-menu-item:hover
          .pp-menu-arrow,
        .pp-menu-item.active
          .pp-menu-arrow {
          opacity: 1;
        }

        /* ======================================================
           NOTIFICATION ITEM
        ====================================================== */

        .pp-notification-item {
          overflow: visible !important;
        }

        .pp-notification-item.has-unread {
          color: white;
        }

        .pp-notification-item.has-unread
          .pp-menu-icon {
          color: #fbbf24;
        }

        /* ======================================================
           RED NUMBER BADGE
        ====================================================== */

        .pp-notification-badge {
          position: relative;

          z-index: 50;

          flex-shrink: 0;

          min-width: 26px;

          height: 26px;

          display: inline-flex;

          align-items: center;

          justify-content: center;

          padding:
            0 7px;

          border-radius: 999px;

          background:
            #ef4444;

          color: white;

          border:
            2px solid
            #050816;

          font-size: 11px;

          font-weight: 900;

          line-height: 1;

          box-shadow:
            0 0 0 1px
            rgba(239,68,68,0.25),
            0 4px 14px
            rgba(239,68,68,0.55);

          animation:
            ppBadgePulse 1.8s infinite;
        }

        @keyframes ppBadgePulse {

          0% {
            transform: scale(1);
          }

          50% {
            transform: scale(1.08);
          }

          100% {
            transform: scale(1);
          }

        }

        /* ======================================================
           UNREAD DOT
        ====================================================== */

        .pp-notification-dot {
          position: absolute;

          top: -3px;

          right: -3px;

          width: 8px;

          height: 8px;

          border-radius: 50%;

          background:
            #ef4444;

          border:
            2px solid
            #050816;

          box-shadow:
            0 0 10px
            rgba(239,68,68,0.8);
        }

        /* ======================================================
           DIVIDER
        ====================================================== */

        .pp-divider {
          height: 1px;

          margin:
            8px 8px 17px;

          background:
            rgba(148,163,184,0.08);
        }

        /* ======================================================
           BOTTOM
        ====================================================== */

        .pp-sidebar-bottom {
          /* Keep the footer visible: do not let flexbox shrink it away. */
          flex: 0 0 auto;
          flex-shrink: 0;
          position: relative;
          z-index: 2;
          min-height: max-content;
          padding: 9px 14px 15px;

          border-top:
            1px solid
            rgba(148,163,184,0.08);

          background:
            rgba(3,7,18,0.4);
        }

        .pp-bottom-item {
          display: flex;

          align-items: center;

          gap: 12px;

          width: 100%;

          min-height: 44px;

          padding:
            10px 12px;

          margin-bottom: 3px;

          border-radius: 11px;

          background: transparent;

          border:
            1px solid transparent;

          color: #94a3b8;

          text-decoration: none;

          cursor: pointer;

          font-family: inherit;

          font-size: 13px;

          font-weight: 600;

          transition:
            all 0.2s ease;
        }

        .pp-bottom-item:hover {
          color: white;

          background:
            rgba(148,163,184,0.06);
        }

        .pp-logout {
          color: #f87171;
        }

        .pp-logout:hover {
          color: #fca5a5;

          background:
            rgba(239,68,68,0.07);
        }

        .pp-feedback-trigger {
          color: #38bdf8;
          display: flex;
          visibility: visible;
          opacity: 1;
        }

        .pp-feedback-trigger:hover {
          color: #7dd3fc;
          background: rgba(56,189,248,0.07);
        }

        .pp-status {
          display: flex;

          align-items: center;

          gap: 7px;

          padding:
            7px 12px 0;

          color: #475569;

          font-size: 8px;

          font-weight: 800;

          letter-spacing: 1px;

          text-transform: uppercase;
        }

        .pp-status-dot {
          width: 6px;

          height: 6px;

          border-radius: 50%;

          background:
            #22c55e;

          box-shadow:
            0 0 8px
            rgba(34,197,94,0.8);
        }

        /* ======================================================
           FEEDBACK MODAL STYLES
        ====================================================== */

        .feedback-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(2, 6, 23, 0.8);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100000;
        }

        .feedback-modal {
          background: #0f172a;
          border: 1px solid rgba(129, 140, 248, 0.2);
          border-radius: 16px;
          width: 90%;
          max-width: 450px;
          padding: 24px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
          color: #f8fafc;
        }

        .feedback-modal h3 {
          margin: 0 0 8px;
          font-size: 18px;
          font-weight: 700;
          color: #f8fafc;
        }

        .feedback-modal p {
          margin: 0 0 16px;
          font-size: 12px;
          color: #94a3b8;
        }

        .feedback-modal label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          color: #cbd5e1;
          margin-bottom: 6px;
          margin-top: 12px;
        }

        .feedback-modal select,
        .feedback-modal textarea {
          width: 100%;
          background: #020617;
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 8px;
          padding: 10px;
          color: #fff;
          font-size: 13px;
          font-family: inherit;
        }

        .feedback-modal select:focus,
        .feedback-modal textarea:focus {
          outline: none;
          border-color: #818cf8;
        }

        .star-rating {
          display: flex;
          gap: 6px;
          cursor: pointer;
          font-size: 22px;
        }

        .star {
          color: #475569;
          transition: color 0.2s;
        }
        .star.active {
          color: #f59e0b;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 20px;
        }

        .cancel-btn, .submit-btn {
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          border: none;
        }

        .cancel-btn {
          background: rgba(148, 163, 184, 0.1);
          color: #94a3b8;
        }
        .cancel-btn:hover {
          background: rgba(148, 163, 184, 0.2);
          color: #fff;
        }

        .submit-btn {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff;
        }
        .submit-btn:hover {
          opacity: 0.9;
        }

        .feedback-success {
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.3);
          color: #4ade80;
          padding: 12px;
          border-radius: 8px;
          text-align: center;
          font-size: 13px;
          font-weight: 600;
        }

        /* ======================================================
           MOBILE
        ====================================================== */

        @media (max-width: 700px) {

          .pp-sidebar {
            width: 76px;
          }

          .pp-sidebar-scroll {
            padding:
              15px 8px;
          }

          .pp-logo {
            justify-content: center;
          }

          .pp-logo-text,
          .pp-ai-badge,
          .pp-section-title,
          .pp-menu-name,
          .pp-menu-arrow,
          .pp-bottom-item span,
          .pp-status {
            display: none;
          }

          .pp-menu-item {
            justify-content: center;
          }

          .pp-notification-badge {
            position: absolute;

            top: -3px;

            right: -2px;

            min-width: 18px;

            height: 18px;

            padding: 0 4px;

            font-size: 8px;
          }

          .pp-notification-dot {
            display: none;
          }

          .pp-sidebar-bottom {
            flex: 0 0 auto;
            flex-shrink: 0;
            padding: 8px;
          }

          .pp-bottom-item {
            justify-content: center;
          }

        }

      `}</style>

      {/* ==========================================================
          SIDEBAR
      ========================================================== */}

      <aside className="pp-sidebar">

        {/* ========================================================
            SCROLL AREA
        ======================================================== */}

        <div className="pp-sidebar-scroll">

          {/* ======================================================
              LOGO
          ====================================================== */}

          <Link
            to="/dashboard"
            className="pp-logo"
          >

            <div className="pp-logo-icon">
              <GraduationCap
                size={24}
                strokeWidth={2.4}
              />
            </div>

            <div className="pp-logo-text">

              <div className="pp-logo-title">
                PrepPulse
              </div>

              <div className="pp-logo-subtitle">
                AI Learning Workspace
              </div>

            </div>

          </Link>

          {/* ======================================================
              AI BADGE
          ====================================================== */}

          <div className="pp-ai-badge">

            <Sparkles size={14} />

            <span>
              AI Learning Hub
            </span>

          </div>

          {/* ======================================================
              NORMAL MENUS
          ====================================================== */}

          {menuItems.map((section) => (

            <div
              key={section.title}
              className="pp-sidebar-section"
            >

              <div className="pp-section-title">

                <span>
                  {section.title}
                </span>

                <div className="pp-section-line" />

              </div>

              {section.items.map((item) => {

                const Icon = item.icon;

                const active =
                  isActive(item.path);

                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`
                      pp-menu-item
                      ${active ? "active" : ""}
                    `}
                  >

                    <div className="pp-menu-icon">

                      <Icon
                        size={20}
                        strokeWidth={
                          active ? 2.4 : 1.9
                        }
                      />

                    </div>

                    <span className="pp-menu-name">
                      {item.name}
                    </span>

                    <ChevronRight
                      className="pp-menu-arrow"
                      size={15}
                    />

                  </Link>
                );
              })}

            </div>
          ))}

          {/* ======================================================
              DIVIDER
          ====================================================== */}

          <div className="pp-divider" />

          {/* ======================================================
              ACTIVITY
          ====================================================== */}

          <div className="pp-sidebar-section">

            <div className="pp-section-title">

              <span>
                ACTIVITY
              </span>

              <div className="pp-section-line" />

            </div>

            <Link
              to="/notifications"
              className={`
                pp-menu-item
                pp-notification-item
                ${
                  notificationsActive
                    ? "active"
                    : ""
                }
                ${
                  unreadCount > 0
                    ? "has-unread"
                    : ""
                }
              `}
            >

              {/* ICON */}

              <div className="pp-menu-icon">

                <Bell
                  size={21}
                  strokeWidth={
                    notificationsActive
                      ? 2.4
                      : 1.9
                  }
                />

                {unreadCount > 0 && (
                  <span className="pp-notification-dot" />
                )}

              </div>

              {/* NAME */}

              <span className="pp-menu-name">
                Notifications
              </span>

              {/* =================================================
                  IMPORTANT:
                  NUMBER BADGE
              ================================================= */}

              {unreadCount > 0 ? (

                <span
                  className="pp-notification-badge"
                  title={`${unreadCount} unread notifications`}
                >
                  {badgeText}
                </span>

              ) : (

                <ChevronRight
                  className="pp-menu-arrow"
                  size={15}
                />

              )}

            </Link>

          </div>

        </div>

        {/* ========================================================
            BOTTOM
        ======================================================== */}

        <div className="pp-sidebar-bottom">

          <Link
            to="/settings"
            className="pp-bottom-item"
          >
            <Settings size={19} />
            <span>Settings</span>
          </Link>

          <button
            type="button"
            className="pp-bottom-item pp-logout"
            onClick={handleLogout}
          >
            <LogOut size={19} />
            <span>Logout</span>
          </button>

          {/* Feedback Button */}
          <button
            type="button"
            className="pp-bottom-item pp-feedback-trigger"
            onClick={() => setIsFeedbackOpen(true)}
          >
            <MessageSquarePlus size={19} />
            <span>Feedback</span>
          </button>

          <div className="pp-status">
            <span className="pp-status-dot" />
            <span>System Online</span>
          </div>

        </div>

      </aside>

      {/* ==========================================================
          FEEDBACK MODAL POPUP
      ========================================================== */}

      {isFeedbackOpen && (
        <div className="feedback-modal-overlay">
          <div className="feedback-modal">
            <h3>Send Feedback</h3>
            <p>We value your thoughts. Let us know how we can improve PrepPulse!</p>

            {feedbackSuccess ? (
              <div className="feedback-success">{feedbackSuccess}</div>
            ) : (
              <form onSubmit={handleFeedbackSubmit}>
                <label>Category</label>
                <select
                  value={feedbackCategory}
                  onChange={(e) => setFeedbackCategory(e.target.value)}
                >
                  <option value="General Feedback">General Feedback</option>
                  <option value="Bug">Bug Report</option>
                  <option value="Feature Request">Feature Request</option>
                  <option value="UI/UX">UI / UX Design</option>
                </select>

                <label>Rating</label>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={feedbackRating >= star ? "star active" : "star"}
                      onClick={() => setFeedbackRating(star)}
                    >
                      ★
                    </span>
                  ))}
                </div>

                <label>Message</label>
                <textarea
                  rows="4"
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  placeholder="Share your thoughts..."
                  required
                />

                <div className="modal-actions">
                  <button
                    type="button"
                    onClick={() => setIsFeedbackOpen(false)}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingFeedback}
                    className="submit-btn"
                  >
                    {submittingFeedback ? "Sending..." : "Submit"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;