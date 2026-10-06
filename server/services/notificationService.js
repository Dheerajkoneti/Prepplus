const Notification = require("../models/Notification");
const User = require("../models/User");

/*
=========================================================
CREATE NOTIFICATION FOR ONE USER
=========================================================
*/

const createNotification = async ({
  userId,
  type = "GENERAL",
  title,
  message,
  icon = "🔔",
  link = "",
}) => {
  try {
    if (!userId) {
      console.warn(
        "Notification skipped: userId missing"
      );

      return null;
    }

    if (!title || !message) {
      console.warn(
        "Notification skipped: title/message missing"
      );

      return null;
    }

    const notification =
      await Notification.create({
        userId,
        type,
        title: String(title).trim(),
        message: String(message).trim(),
        icon,
        link,
        isRead: false,
      });

    return notification;
  } catch (error) {
    /*
      Notification failure should NEVER break
      the original application operation.
    */

    console.error(
      "Notification Service Error:",
      error
    );

    return null;
  }
};

/*
=========================================================
NOTIFY ALL USERS
=========================================================
Used when admin adds a new resource, placement update,
system announcement, etc.
=========================================================
*/

const notifyAllUsers = async ({
  type = "SYSTEM",
  title,
  message,
  icon = "🔔",
  link = "",
}) => {
  try {
    if (!title || !message) {
      return {
        success: false,
        count: 0,
      };
    }

    const users = await User.find({})
      .select("_id")
      .lean();

    if (!users.length) {
      return {
        success: true,
        count: 0,
      };
    }

    const notifications = users.map(
      (user) => ({
        userId: user._id,
        type,
        title: String(title).trim(),
        message: String(message).trim(),
        icon,
        link,
        isRead: false,
      })
    );

    const result =
      await Notification.insertMany(
        notifications
      );

    return {
      success: true,
      count: result.length,
    };
  } catch (error) {
    console.error(
      "Notify All Users Error:",
      error
    );

    return {
      success: false,
      count: 0,
    };
  }
};

/*
=========================================================
HELPER NOTIFICATIONS
=========================================================
*/

const notifyMockTestCompleted = async ({
  userId,
  testTitle = "Mock Test",
  percentage = 0,
  passed = false,
}) => {
  return createNotification({
    userId,
    type: "MOCK_TEST",
    title: passed
      ? "🎯 Mock Test Passed"
      : "📊 Mock Test Completed",
    message: `${testTitle} completed with ${percentage}% score.`,
    icon: passed ? "🏆" : "📝",
    link: "/mock-tests",
  });
};

const notifyMockInterviewCompleted = async ({
  userId,
  role = "AI Mock Interview",
  score = 0,
}) => {
  return createNotification({
    userId,
    type: "MOCK_INTERVIEW",
    title: "🎤 Mock Interview Completed",
    message: `${role} completed with an overall score of ${score}%.`,
    icon: "🎤",
    link: "/mock-interview",
  });
};

const notifyResumeAnalyzed = async ({
  userId,
  score = 0,
}) => {
  return createNotification({
    userId,
    type: "RESUME",
    title: "📄 Resume Analysis Complete",
    message: `Your resume analysis is complete. Your score is ${score}%.`,
    icon: "📄",
    link: "/resume",
  });
};

const notifyNotesGenerated = async ({
  userId,
  title = "AI Notes",
}) => {
  return createNotification({
    userId,
    type: "NOTES",
    title: "📝 AI Notes Generated",
    message: `"${title}" has been generated successfully.`,
    icon: "📝",
    link: "/notes",
  });
};

const notifyNoteSaved = async ({
  userId,
  title = "Study Note",
}) => {
  return createNotification({
    userId,
    type: "NOTES",
    title: "💾 Note Saved",
    message: `"${title}" has been saved successfully.`,
    icon: "💾",
    link: "/saved-notes",
  });
};

const notifyAIChat = async ({
  userId,
}) => {
  return createNotification({
    userId,
    type: "AI_CHAT",
    title: "🤖 AI Chat Activity",
    message:
      "Your AI learning session has been completed.",
    icon: "🤖",
    link: "/chatbot",
  });
};

const notifyHabitCompleted = async ({
  userId,
  habitName = "Study Habit",
}) => {
  return createNotification({
    userId,
    type: "HABIT",
    title: "🔥 Habit Completed",
    message: `Great job! You completed "${habitName}".`,
    icon: "🔥",
    link: "/habits",
  });
};

const notifyAccountUpdated = async ({
  userId,
  message = "Your account settings were updated successfully.",
}) => {
  return createNotification({
    userId,
    type: "ACCOUNT",
    title: "⚙️ Account Updated",
    message,
    icon: "⚙️",
    link: "/settings",
  });
};

const notifyNewResource = async ({
  title,
  resourceType = "Resource",
}) => {
  return notifyAllUsers({
    type: "RESOURCE",
    title: "📚 New Learning Resource",
    message: `A new ${resourceType} "${title}" has been added to PrepPulse.`,
    icon: "📚",
    link: "/resources",
  });
};

const notifyPlacementUpdate = async ({
  title,
  message,
}) => {
  return notifyAllUsers({
    type: "PLACEMENT",
    title:
      title || "💼 Placement Update",
    message,
    icon: "💼",
    link: "/resources",
  });
};

module.exports = {
  createNotification,
  notifyAllUsers,

  notifyMockTestCompleted,
  notifyMockInterviewCompleted,
  notifyResumeAnalyzed,
  notifyNotesGenerated,
  notifyNoteSaved,
  notifyAIChat,
  notifyHabitCompleted,
  notifyAccountUpdated,
  notifyNewResource,
  notifyPlacementUpdate,
};