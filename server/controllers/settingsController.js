const UserSettings = require("../models/UserSettings");

const getUserId = (req) => {
  return req.user?._id || req.user?.id || null;
};

const defaultSettings = {
  appearance: {
    theme: "dark",
    accentColor: "cyan",
    compactMode: false,
  },

  notifications: {
    enabled: true,
    mockTests: true,
    mockInterviews: true,
    resume: true,
    notes: true,
    resources: true,
    habits: true,
    placement: true,
  },

  study: {
    dailyGoal: 120,
    reminderEnabled: true,
    reminderTime: "19:00",
    preferredDifficulty: "mixed",
    preferredTopics: [],
  },
};

// GET /api/settings
exports.getSettings = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    let settings = await UserSettings.findOne({
      userId,
    }).lean();

    if (!settings) {
      settings = await UserSettings.create({
        userId,
        ...defaultSettings,
      });

      settings = settings.toObject();
    }

    return res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("Get Settings Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load settings",
    });
  }
};

// PUT /api/settings
exports.updateSettings = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const body = req.body || {};
    const update = {};

    // -------------------------
    // APPEARANCE
    // -------------------------
    if (body.appearance) {
      if (
        ["dark", "light", "system"].includes(
          body.appearance.theme
        )
      ) {
        update["appearance.theme"] =
          body.appearance.theme;
      }

      if (body.appearance.accentColor) {
        update["appearance.accentColor"] =
          String(body.appearance.accentColor);
      }

      if (
        typeof body.appearance.compactMode ===
        "boolean"
      ) {
        update["appearance.compactMode"] =
          body.appearance.compactMode;
      }
    }

    // -------------------------
    // NOTIFICATIONS
    // -------------------------
    if (body.notifications) {
      const notificationFields = [
        "enabled",
        "mockTests",
        "mockInterviews",
        "resume",
        "notes",
        "resources",
        "habits",
        "placement",
      ];

      notificationFields.forEach((field) => {
        if (
          typeof body.notifications[field] ===
          "boolean"
        ) {
          update[
            `notifications.${field}`
          ] = body.notifications[field];
        }
      });
    }

    // -------------------------
    // STUDY
    // -------------------------
    if (body.study) {
      if (body.study.dailyGoal !== undefined) {
        const goal = Number(
          body.study.dailyGoal
        );

        if (
          Number.isFinite(goal) &&
          goal >= 15 &&
          goal <= 720
        ) {
          update["study.dailyGoal"] = goal;
        }
      }

      if (
        typeof body.study.reminderEnabled ===
        "boolean"
      ) {
        update["study.reminderEnabled"] =
          body.study.reminderEnabled;
      }

      if (
        typeof body.study.reminderTime ===
          "string" &&
        /^\d{2}:\d{2}$/.test(
          body.study.reminderTime
        )
      ) {
        update["study.reminderTime"] =
          body.study.reminderTime;
      }

      if (
        ["easy", "medium", "hard", "mixed"].includes(
          body.study.preferredDifficulty
        )
      ) {
        update[
          "study.preferredDifficulty"
        ] = body.study.preferredDifficulty;
      }

      if (
        Array.isArray(
          body.study.preferredTopics
        )
      ) {
        update[
          "study.preferredTopics"
        ] = body.study.preferredTopics
          .map((topic) =>
            String(topic).trim()
          )
          .filter(Boolean)
          .slice(0, 20);
      }
    }

    const settings =
      await UserSettings.findOneAndUpdate(
        { userId },
        {
          $set: update,
          $setOnInsert: {
            userId,
          },
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
        }
      );

    return res.status(200).json({
      success: true,
      message: "Settings saved successfully",
      settings,
    });
  } catch (error) {
    console.error(
      "Update Settings Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to save settings",
    });
  }
};

// POST /api/settings/reset
exports.resetSettings = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const settings =
      await UserSettings.findOneAndUpdate(
        { userId },
        {
          $set: {
            ...defaultSettings,
          },
          $setOnInsert: {
            userId,
          },
        },
        {
          new: true,
          upsert: true,
        }
      );

    return res.status(200).json({
      success: true,
      message: "Settings reset successfully",
      settings,
    });
  } catch (error) {
    console.error(
      "Reset Settings Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to reset settings",
    });
  }
};