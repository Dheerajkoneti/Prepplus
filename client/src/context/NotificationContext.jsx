import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import API from "../services/api";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Fetch notifications
  |--------------------------------------------------------------------------
  */

  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUnreadCount(0);
      setNotifications([]);
      return;
    }

    try {
      setLoading(true);

      const response = await API.get("/notifications");

      console.log(
        "🔔 Notification API:",
        response.data
      );

      /*
      |--------------------------------------------------------------------------
      | Support different backend response structures
      |--------------------------------------------------------------------------
      */

      const data = response.data || {};

      const notificationList =
        Array.isArray(data.notifications)
          ? data.notifications
          : Array.isArray(data.data)
          ? data.data
          : [];

      setNotifications(notificationList);

      /*
      |--------------------------------------------------------------------------
      | Prefer backend unreadCount
      |--------------------------------------------------------------------------
      */

      if (
        typeof data.unreadCount === "number"
      ) {
        setUnreadCount(data.unreadCount);
        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Otherwise calculate from notifications
      |--------------------------------------------------------------------------
      */

      const unread = notificationList.filter(
        (notification) =>
          notification.read === false ||
          notification.isRead === false ||
          notification.status === "unread"
      ).length;

      setUnreadCount(unread);
    } catch (error) {
      console.error(
        "❌ Failed to fetch notification count:",
        error
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Initial fetch
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  /*
  |--------------------------------------------------------------------------
  | Real-time style polling
  |
  | Every 10 seconds
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications();
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [fetchNotifications]);

  /*
  |--------------------------------------------------------------------------
  | Refresh when user returns to tab
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const handleVisibility = () => {
      if (
        document.visibilityState === "visible"
      ) {
        fetchNotifications();
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
  }, [fetchNotifications]);

  /*
  |--------------------------------------------------------------------------
  | Refresh when browser gets focus
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const handleFocus = () => {
      fetchNotifications();
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
  }, [fetchNotifications]);

  /*
  |--------------------------------------------------------------------------
  | Mark all as read
  |--------------------------------------------------------------------------
  */

  const markAllAsRead = async () => {
    try {
      await API.put(
        "/notifications/read-all"
      );

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          read: true,
          isRead: true,
          status: "read",
        }))
      );

      setUnreadCount(0);

      await fetchNotifications();
    } catch (error) {
      console.error(
        "❌ Mark all notifications as read failed:",
        error
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Mark one as read
  |--------------------------------------------------------------------------
  */

  const markAsRead = async (notificationId) => {
    try {
      await API.put(
        `/notifications/${notificationId}/read`
      );

      setNotifications((previous) =>
        previous.map((notification) =>
          String(notification._id) ===
          String(notificationId)
            ? {
                ...notification,
                read: true,
                isRead: true,
                status: "read",
              }
            : notification
        )
      );

      setUnreadCount((previous) =>
        Math.max(0, previous - 1)
      );
    } catch (error) {
      console.error(
        "❌ Mark notification as read failed:",
        error
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Context
  |--------------------------------------------------------------------------
  */

  const value = {
    unreadCount,
    notifications,
    loading,
    fetchNotifications,
    markAllAsRead,
    markAsRead,
  };

  return (
    <NotificationContext.Provider
      value={value}
    >
      {children}
    </NotificationContext.Provider>
  );
};

/*
|--------------------------------------------------------------------------
| Hook
|--------------------------------------------------------------------------
*/

export const useNotifications = () => {
  const context = useContext(
    NotificationContext
  );

  if (!context) {
    throw new Error(
      "useNotifications must be used inside NotificationProvider"
    );
  }

  return context;
};

export default NotificationContext;