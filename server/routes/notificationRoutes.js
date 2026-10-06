const express = require("express");

const router = express.Router();

const {
  getNotifications,
  getUnreadCount,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearNotifications,
} = require("../controllers/notificationController");

const {
  protect,
} = require("../middleware/authMiddleware");

router.get(
  "/",
  protect,
  getNotifications
);

router.get(
  "/unread-count",
  protect,
  getUnreadCount
);

router.post(
  "/",
  protect,
  createNotification
);

router.patch(
  "/read-all",
  protect,
  markAllAsRead
);

router.patch(
  "/:id/read",
  protect,
  markAsRead
);

router.delete(
  "/:id",
  protect,
  deleteNotification
);

router.delete(
  "/",
  protect,
  clearNotifications
);

module.exports = router;