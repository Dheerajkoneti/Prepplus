import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  deleteAllNotifications,
  deleteNotification,
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../../services/notificationService";

import { useNavigate } from "react-router-dom";

const formatTime = (date) => {
  if (!date) return "";

  const diff =
    Date.now() - new Date(date).getTime();

  const minutes = Math.floor(
    diff / 60000
  );

  if (minutes < 1) return "Just now";

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(
    minutes / 60
  );

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(
    hours / 24
  );

  if (days < 7) {
    return `${days}d ago`;
  }

  return new Date(date).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

const categoryNames = {
  ALL: "All",
  UNREAD: "Unread",
  SYSTEM: "System",
  MOCK_TEST: "Tests",
  MOCK_INTERVIEW: "Interviews",
  RESUME: "Resume",
  NOTES: "Notes",
  RESOURCE: "Resources",
  HABIT: "Habits",
  PLACEMENT: "Placement",
};

export default function Notifications() {
  const navigate = useNavigate();

  const [notifications, setNotifications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [activeFilter, setActiveFilter] =
    useState("ALL");

  const [unreadCount, setUnreadCount] =
    useState(0);

  const loadNotifications =
    useCallback(async (refresh = false) => {
      try {
        if (refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const result =
          await getNotifications({
            page: 1,
            limit: 50,
          });

        if (result?.success) {
          setNotifications(
            result.notifications || []
          );

          setUnreadCount(
            result.unreadCount || 0
          );
        }
      } catch (error) {
        console.error(
          "Notifications Error:",
          error
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }, []);

  useEffect(() => {
    loadNotifications();

    const interval = setInterval(() => {
      loadNotifications(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [loadNotifications]);

  const filteredNotifications =
    useMemo(() => {
      if (activeFilter === "ALL") {
        return notifications;
      }

      if (activeFilter === "UNREAD") {
        return notifications.filter(
          (notification) =>
            !notification.isRead
        );
      }

      return notifications.filter(
        (notification) =>
          notification.type ===
          activeFilter
      );
    }, [
      notifications,
      activeFilter,
    ]);

  const handleRead = async (
    notification
  ) => {
    try {
      if (!notification.isRead) {
        await markNotificationAsRead(
          notification._id
        );

        setNotifications((current) =>
          current.map((item) =>
            item._id === notification._id
              ? {
                  ...item,
                  isRead: true,
                }
              : item
          )
        );

        setUnreadCount((count) =>
          Math.max(count - 1, 0)
        );
      }

      if (notification.link) {
        navigate(notification.link);
      }
    } catch (error) {
      console.error(
        "Read Notification Error:",
        error
      );
    }
  };

  const handleMarkAllRead =
    async () => {
      try {
        await markAllNotificationsAsRead();

        setNotifications((current) =>
          current.map((item) => ({
            ...item,
            isRead: true,
          }))
        );

        setUnreadCount(0);
      } catch (error) {
        console.error(
          "Mark All Read Error:",
          error
        );
      }
    };

  const handleDelete = async (
    id
  ) => {
    try {
      const notification =
        notifications.find(
          (item) => item._id === id
        );

      await deleteNotification(id);

      setNotifications((current) =>
        current.filter(
          (item) => item._id !== id
        )
      );

      if (
        notification &&
        !notification.isRead
      ) {
        setUnreadCount((count) =>
          Math.max(count - 1, 0)
        );
      }
    } catch (error) {
      console.error(
        "Delete Notification Error:",
        error
      );
    }
  };

  const handleDeleteAll = async () => {
    const confirmed = window.confirm(
      "Delete all notifications?"
    );

    if (!confirmed) return;

    try {
      await deleteAllNotifications();

      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error(
        "Delete All Error:",
        error
      );
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.backgroundGlow} />

      <div style={styles.container}>
        {/* HEADER */}
        <div style={styles.header}>
          <div>
            <div style={styles.eyebrow}>
              PREPPULSE • ACTIVITY CENTER
            </div>

            <h1 style={styles.title}>
              Notifications
            </h1>

            <p style={styles.subtitle}>
              Stay updated with your learning,
              tests, interviews and progress.
            </p>
          </div>

          <div style={styles.headerActions}>
            <button
              onClick={() =>
                loadNotifications(true)
              }
              style={styles.secondaryButton}
              disabled={refreshing}
            >
              {refreshing
                ? "Refreshing..."
                : "↻ Refresh"}
            </button>

            <button
              onClick={handleMarkAllRead}
              style={styles.primaryButton}
              disabled={unreadCount === 0}
            >
              ✓ Mark all read
            </button>
          </div>
        </div>

        {/* STATS */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <span style={styles.statIcon}>
              🔔
            </span>

            <div>
              <div style={styles.statValue}>
                {notifications.length}
              </div>

              <div style={styles.statLabel}>
                Total notifications
              </div>
            </div>
          </div>

          <div style={styles.statCard}>
            <span style={styles.statIcon}>
              🔴
            </span>

            <div>
              <div style={styles.statValue}>
                {unreadCount}
              </div>

              <div style={styles.statLabel}>
                Unread
              </div>
            </div>
          </div>
        </div>

        {/* FILTERS */}
        <div style={styles.filterBar}>
          {Object.entries(categoryNames).map(
            ([key, label]) => (
              <button
                key={key}
                onClick={() =>
                  setActiveFilter(key)
                }
                style={{
                  ...styles.filterButton,
                  ...(activeFilter === key
                    ? styles.filterActive
                    : {}),
                }}
              >
                {label}
              </button>
            )
          )}

          <button
            onClick={handleDeleteAll}
            style={styles.deleteAllButton}
            disabled={
              notifications.length === 0
            }
          >
            Delete all
          </button>
        </div>

        {/* CONTENT */}
        {loading ? (
          <div style={styles.emptyCard}>
            <div style={styles.spinner}>
              ◌
            </div>

            <h3>Loading notifications...</h3>
          </div>
        ) : filteredNotifications.length ===
          0 ? (
          <div style={styles.emptyCard}>
            <div style={styles.emptyIcon}>
              🔔
            </div>

            <h2>No notifications</h2>

            <p>
              You're all caught up. New
              activity will appear here.
            </p>
          </div>
        ) : (
          <div style={styles.list}>
            {filteredNotifications.map(
              (notification) => (
                <div
                  key={notification._id}
                  onClick={() =>
                    handleRead(notification)
                  }
                  style={{
                    ...styles.notificationCard,
                    ...(notification.isRead
                      ? {}
                      : styles.unreadCard),
                  }}
                >
                  <div style={styles.iconBox}>
                    {notification.icon ||
                      "🔔"}
                  </div>

                  <div style={styles.content}>
                    <div
                      style={
                        styles.notificationTop
                      }
                    >
                      <div>
                        <h3
                          style={
                            styles.notificationTitle
                          }
                        >
                          {notification.title}
                        </h3>

                        <span
                          style={
                            styles.category
                          }
                        >
                          {notification.type?.replace(
                            "_",
                            " "
                          )}
                        </span>
                      </div>

                      <span
                        style={styles.time}
                      >
                        {formatTime(
                          notification.createdAt
                        )}
                      </span>
                    </div>

                    <p
                      style={
                        styles.notificationMessage
                      }
                    >
                      {notification.message}
                    </p>

                    <div
                      style={styles.cardBottom}
                    >
                      {!notification.isRead && (
                        <span
                          style={styles.unreadBadge}
                        >
                          ● Unread
                        </span>
                      )}

                      {notification.link && (
                        <span
                          style={
                            styles.viewLink
                          }
                        >
                          Open →
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      handleDelete(
                        notification._id
                      );
                    }}
                    style={styles.deleteButton}
                    title="Delete"
                  >
                    ×
                  </button>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at 10% 10%, rgba(88,70,220,.16), transparent 28%), radial-gradient(circle at 90% 20%, rgba(0,210,255,.10), transparent 25%), #070912",
    color: "#f8fafc",
    padding: "32px",
    position: "relative",
    overflow: "hidden",
  },

  backgroundGlow: {
    position: "fixed",
    width: 500,
    height: 500,
    borderRadius: "50%",
    background:
      "rgba(84,68,255,.08)",
    filter: "blur(100px)",
    top: 100,
    right: -200,
    pointerEvents: "none",
  },

  container: {
    maxWidth: 1250,
    margin: "0 auto",
    position: "relative",
    zIndex: 1,
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 24,
    marginBottom: 30,
  },

  eyebrow: {
    color: "#7dd3fc",
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: 700,
    marginBottom: 10,
  },

  title: {
    fontSize: 38,
    margin: 0,
    fontWeight: 800,
  },

  subtitle: {
    color: "#94a3b8",
    marginTop: 10,
    fontSize: 15,
  },

  headerActions: {
    display: "flex",
    gap: 10,
  },

  primaryButton: {
    border: "none",
    borderRadius: 12,
    padding: "12px 18px",
    background:
      "linear-gradient(135deg,#06b6d4,#6366f1)",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },

  secondaryButton: {
    border: "1px solid rgba(148,163,184,.2)",
    borderRadius: 12,
    padding: "12px 18px",
    background:
      "rgba(15,23,42,.7)",
    color: "#e2e8f0",
    cursor: "pointer",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",
    gap: 16,
    marginBottom: 22,
  },

  statCard: {
    display: "flex",
    gap: 16,
    alignItems: "center",
    padding: 20,
    borderRadius: 18,
    border:
      "1px solid rgba(148,163,184,.13)",
    background:
      "linear-gradient(145deg,rgba(17,24,39,.88),rgba(10,14,27,.75))",
    backdropFilter: "blur(18px)",
  },

  statIcon: {
    fontSize: 28,
  },

  statValue: {
    fontSize: 27,
    fontWeight: 800,
  },

  statLabel: {
    color: "#94a3b8",
    fontSize: 13,
    marginTop: 3,
  },

  filterBar: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    padding: 12,
    marginBottom: 18,
    borderRadius: 16,
    background:
      "rgba(15,23,42,.65)",
    border:
      "1px solid rgba(148,163,184,.12)",
  },

  filterButton: {
    border: "1px solid transparent",
    background: "transparent",
    color: "#94a3b8",
    padding: "9px 14px",
    borderRadius: 10,
    cursor: "pointer",
  },

  filterActive: {
    color: "#fff",
    background:
      "rgba(99,102,241,.2)",
    border:
      "1px solid rgba(99,102,241,.35)",
  },

  deleteAllButton: {
    marginLeft: "auto",
    border: "none",
    background: "transparent",
    color: "#f87171",
    cursor: "pointer",
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },

  notificationCard: {
    display: "flex",
    gap: 16,
    alignItems: "flex-start",
    padding: 20,
    borderRadius: 18,
    background:
      "rgba(15,23,42,.72)",
    border:
      "1px solid rgba(148,163,184,.12)",
    cursor: "pointer",
    transition:
      "transform .2s ease, border .2s ease",
    position: "relative",
  },

  unreadCard: {
    border:
      "1px solid rgba(34,211,238,.28)",
    background:
      "linear-gradient(135deg,rgba(15,36,55,.85),rgba(25,20,50,.75))",
  },

  iconBox: {
    width: 50,
    height: 50,
    minWidth: 50,
    display: "grid",
    placeItems: "center",
    borderRadius: 14,
    background:
      "rgba(99,102,241,.14)",
    fontSize: 24,
  },

  content: {
    flex: 1,
    minWidth: 0,
  },

  notificationTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 20,
  },

  notificationTitle: {
    margin: 0,
    fontSize: 16,
  },

  category: {
    display: "inline-block",
    marginTop: 5,
    fontSize: 10,
    color: "#67e8f9",
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  time: {
    color: "#64748b",
    fontSize: 12,
    whiteSpace: "nowrap",
  },

  notificationMessage: {
    color: "#94a3b8",
    margin: "10px 0",
    lineHeight: 1.6,
    fontSize: 14,
  },

  cardBottom: {
    display: "flex",
    gap: 15,
  },

  unreadBadge: {
    color: "#22d3ee",
    fontSize: 12,
    fontWeight: 700,
  },

  viewLink: {
    color: "#a5b4fc",
    fontSize: 12,
    fontWeight: 700,
  },

  deleteButton: {
    border: "none",
    background: "transparent",
    color: "#64748b",
    fontSize: 22,
    cursor: "pointer",
  },

  emptyCard: {
    minHeight: 350,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    borderRadius: 20,
    border:
      "1px solid rgba(148,163,184,.12)",
    background:
      "rgba(15,23,42,.65)",
  },

  emptyIcon: {
    fontSize: 48,
    marginBottom: 15,
  },

  spinner: {
    fontSize: 40,
    color: "#22d3ee",
    marginBottom: 10,
  },
};