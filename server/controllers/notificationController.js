const mongoose = require("mongoose");
const Notification = require("../models/Notification");

const getUserId = (req) => {
  return req.user?._id || req.user?.id || null;
};

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/*
=========================================================
GET NOTIFICATIONS
GET /api/notifications
=========================================================
*/

exports.getNotifications = async (
  req,
  res
) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const page = Math.max(
      Number(req.query.page) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        Number(req.query.limit) || 20,
        1
      ),
      100
    );

    const skip = (page - 1) * limit;

    const filter = {
      userId,
    };

    /*
    UNREAD
    */

    if (
      req.query.unread === "true" ||
      req.query.filter === "unread"
    ) {
      filter.isRead = false;
    }

    /*
    READ
    */

    if (req.query.filter === "read") {
      filter.isRead = true;
    }

    /*
    TYPE
    */

    if (
      req.query.type &&
      req.query.type !== "ALL"
    ) {
      filter.type = req.query.type;
    }

    const [
      notifications,
      total,
      unreadCount,
    ] = await Promise.all([
      Notification.find(filter)
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      Notification.countDocuments(filter),

      Notification.countDocuments({
        userId,
        isRead: false,
      }),
    ]);

    return res.status(200).json({
      success: true,

      notifications,

      pagination: {
        page,
        limit,
        total,
        totalPages:
          Math.ceil(total / limit),
        hasNextPage:
          page * limit < total,
      },

      unreadCount,
    });
  } catch (error) {
    console.error(
      "Get Notifications Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load notifications",
    });
  }
};

/*
=========================================================
GET UNREAD COUNT
GET /api/notifications/unread-count
=========================================================
*/

exports.getUnreadCount = async (
  req,
  res
) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    const count =
      await Notification.countDocuments({
        userId,
        isRead: false,
      });

    return res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    console.error(
      "Unread Count Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to get unread count",
    });
  }
};

/*
=========================================================
CREATE NOTIFICATION
POST /api/notifications
=========================================================
*/

exports.createNotification = async (
  req,
  res
) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    const {
      type,
      title,
      message,
      icon,
      link,
    } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message:
          "Title and message are required",
      });
    }

    const notification =
      await Notification.create({
        userId,
        type: type || "GENERAL",
        title: String(title).trim(),
        message: String(message).trim(),
        icon: icon || "🔔",
        link: link || "",
        isRead: false,
      });

    return res.status(201).json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error(
      "Create Notification Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create notification",
    });
  }
};

/*
=========================================================
MARK ONE AS READ
PATCH /api/notifications/:id/read
=========================================================
*/

exports.markAsRead = async (
  req,
  res
) => {
  try {
    const userId = getUserId(req);

    if (
      !userId ||
      !isValidObjectId(req.params.id)
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Notification not found",
      });
    }

    const notification =
      await Notification.findOneAndUpdate(
        {
          _id: req.params.id,
          userId,
        },
        {
          $set: {
            isRead: true,
          },
        },
        {
          new: true,
        }
      );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message:
          "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error(
      "Mark Notification Read Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update notification",
    });
  }
};

/*
=========================================================
MARK ALL AS READ
PATCH /api/notifications/read-all
=========================================================
*/

exports.markAllAsRead = async (
  req,
  res
) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    const result =
      await Notification.updateMany(
        {
          userId,
          isRead: false,
        },
        {
          $set: {
            isRead: true,
          },
        }
      );

    return res.status(200).json({
      success: true,
      message:
        "All notifications marked as read",
      updated:
        result.modifiedCount || 0,
    });
  } catch (error) {
    console.error(
      "Mark All Read Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to mark notifications as read",
    });
  }
};

/*
=========================================================
DELETE ONE
DELETE /api/notifications/:id
=========================================================
*/

exports.deleteNotification = async (
  req,
  res
) => {
  try {
    const userId = getUserId(req);

    if (
      !userId ||
      !isValidObjectId(req.params.id)
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Notification not found",
      });
    }

    const deleted =
      await Notification.findOneAndDelete({
        _id: req.params.id,
        userId,
      });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message:
          "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Notification deleted",
    });
  } catch (error) {
    console.error(
      "Delete Notification Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete notification",
    });
  }
};

/*
=========================================================
DELETE ALL
DELETE /api/notifications
=========================================================
*/

exports.clearNotifications = async (
  req,
  res
) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    const result =
      await Notification.deleteMany({
        userId,
      });

    return res.status(200).json({
      success: true,
      message:
        "Notifications cleared",
      deleted:
        result.deletedCount || 0,
    });
  } catch (error) {
    console.error(
      "Clear Notifications Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to clear notifications",
    });
  }
};