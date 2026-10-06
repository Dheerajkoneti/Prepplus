const mongoose = require("mongoose");

const Habit = require("../models/Habit");

const {
  notifyHabitCompleted,
} = require("../services/notificationService");

/* =========================================================
   HELPERS
========================================================= */

const getUserId = (req) =>
  req.user?._id || req.user?.id || null;

const isValidObjectId = (id) =>
  mongoose.Types.ObjectId.isValid(id);

const getTodayString = () => {
  const now = new Date();

  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
};

const normalizeDate = (value) => {
  if (!value) {
    return getTodayString();
  }

  const date = String(value).trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return getTodayString();
  }

  return date;
};

const safeArray = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => Number(item))
    .filter(
      (item) =>
        Number.isInteger(item) &&
        item >= 0 &&
        item <= 6
    );
};

const dateToNumber = (dateString) => {
  const [year, month, day] =
    dateString.split("-").map(Number);

  return new Date(
    year,
    month - 1,
    day
  );
};

const formatDate = (date) => {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
};

const addDays = (dateString, amount) => {
  const date = dateToNumber(dateString);

  date.setDate(
    date.getDate() + amount
  );

  return formatDate(date);
};

const getPreviousDate = (dateString) =>
  addDays(dateString, -1);

/* =========================================================
   STREAK
========================================================= */

const calculateStreak = (
  completedDates = [],
  today = getTodayString()
) => {
  const completed = new Set(
    completedDates
  );

  let currentStreak = 0;
  let cursor = today;

  while (completed.has(cursor)) {
    currentStreak += 1;

    cursor =
      getPreviousDate(cursor);

    if (currentStreak > 10000) {
      break;
    }
  }

  let longestStreak = 0;
  let running = 0;

  const sortedDates = [
    ...completed,
  ].sort();

  let previous = null;

  for (const date of sortedDates) {
    if (!previous) {
      running = 1;
    } else {
      const expected =
        addDays(previous, 1);

      if (date === expected) {
        running += 1;
      } else {
        running = 1;
      }
    }

    longestStreak = Math.max(
      longestStreak,
      running
    );

    previous = date;
  }

  return {
    currentStreak,
    longestStreak,
  };
};

/* =========================================================
   FREQUENCY
========================================================= */

const isHabitScheduledForDate = (
  habit,
  dateString
) => {
  const date =
    dateToNumber(dateString);

  const day =
    date.getDay();

  if (habit.frequency === "daily") {
    return true;
  }

  if (
    habit.frequency ===
    "weekdays"
  ) {
    return day >= 1 && day <= 5;
  }

  if (
    habit.frequency === "custom"
  ) {
    return habit.targetDays?.includes(
      day
    );
  }

  return true;
};

/* =========================================================
   GET HABITS
========================================================= */

exports.getHabits = async (
  req,
  res
) => {
  try {
    const userId =
      getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    const today =
      normalizeDate(
        req.query.today
      );

    const includeArchived =
      String(
        req.query.includeArchived
      ) === "true";

    const filter = {
      userId,
      ...(includeArchived
        ? {}
        : {
            archived: false,
          }),
    };

    const habits =
      await Habit.find(filter)
        .sort({
          archived: 1,
          createdAt: -1,
        })
        .lean();

    const result =
      habits.map((habit) => {
        const streak =
          calculateStreak(
            habit.completedDates,
            today
          );

        const scheduledToday =
          isHabitScheduledForDate(
            habit,
            today
          );

        const completedToday =
          habit.completedDates.includes(
            today
          );

        return {
          ...habit,
          currentStreak:
            streak.currentStreak,
          longestStreak:
            streak.longestStreak,
          scheduledToday,
          completedToday,
        };
      });

    return res.json({
      success: true,
      habits: result,
      today,
    });
  } catch (error) {
    console.error(
      "Get Habits Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load habits",
    });
  }
};

/* =========================================================
   CREATE
========================================================= */

exports.createHabit = async (
  req,
  res
) => {
  try {
    const userId =
      getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    const {
      name,
      description,
      icon,
      color,
      category,
      frequency,
      targetDays,
      reminderTime,
      startDate,
    } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Habit name is required",
      });
    }

    const normalizedFrequency =
      [
        "daily",
        "weekdays",
        "custom",
      ].includes(frequency)
        ? frequency
        : "daily";

    const normalizedTargetDays =
      safeArray(targetDays);

    if (
      normalizedFrequency ===
        "custom" &&
      normalizedTargetDays.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Select at least one day for a custom habit",
      });
    }

    const habit =
      await Habit.create({
        userId,

        name:
          name.trim(),

        description:
          description?.trim() ||
          "",

        icon:
          icon ||
          "check",

        color:
          color ||
          "#8b5cf6",

        category:
          category ||
          "Productivity",

        frequency:
          normalizedFrequency,

        targetDays:
          normalizedTargetDays,

        reminderTime:
          reminderTime || "",

        startDate:
          normalizeDate(
            startDate
          ),

        completedDates: [],
      });

    return res.status(201).json({
      success: true,
      message:
        "Habit created successfully",
      habit,
    });
  } catch (error) {
    console.error(
      "Create Habit Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create habit",
    });
  }
};

/* =========================================================
   UPDATE
========================================================= */

exports.updateHabit = async (
  req,
  res
) => {
  try {
    const userId =
      getUserId(req);

    const {
      id,
    } = req.params;

    if (
      !userId ||
      !isValidObjectId(id)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid request",
      });
    }

    const habit =
      await Habit.findOne({
        _id: id,
        userId,
      });

    if (!habit) {
      return res.status(404).json({
        success: false,
        message:
          "Habit not found",
      });
    }

    const {
      name,
      description,
      icon,
      color,
      category,
      frequency,
      targetDays,
      reminderTime,
      startDate,
      archived,
    } = req.body;

    if (
      name !== undefined
    ) {
      if (!String(name).trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Habit name cannot be empty",
        });
      }

      habit.name =
        String(name).trim();
    }

    if (
      description !==
      undefined
    ) {
      habit.description =
        String(description).trim();
    }

    if (icon !== undefined) {
      habit.icon = icon;
    }

    if (color !== undefined) {
      habit.color = color;
    }

    if (
      category !== undefined
    ) {
      habit.category =
        category;
    }

    if (
      frequency !== undefined
    ) {
      if (
        ![
          "daily",
          "weekdays",
          "custom",
        ].includes(frequency)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid frequency",
        });
      }

      habit.frequency =
        frequency;
    }

    if (
      targetDays !==
      undefined
    ) {
      habit.targetDays =
        safeArray(targetDays);
    }

    if (
      habit.frequency ===
        "custom" &&
      habit.targetDays.length ===
        0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Custom habits need at least one target day",
      });
    }

    if (
      reminderTime !==
      undefined
    ) {
      habit.reminderTime =
        reminderTime;
    }

    if (
      startDate !==
      undefined
    ) {
      habit.startDate =
        normalizeDate(
          startDate
        );
    }

    if (
      archived !==
      undefined
    ) {
      habit.archived =
        Boolean(archived);

      habit.archivedAt =
        archived
          ? getTodayString()
          : null;
    }

    await habit.save();

    return res.json({
      success: true,
      message:
        "Habit updated successfully",
      habit,
    });
  } catch (error) {
    console.error(
      "Update Habit Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update habit",
    });
  }
};

/* =========================================================
   TOGGLE TODAY
========================================================= */

exports.toggleHabit = async (
  req,
  res
) => {
  try {
    const userId =
      getUserId(req);

    const {
      id,
    } = req.params;

    if (
      !userId ||
      !isValidObjectId(id)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid request",
      });
    }

    const habit =
      await Habit.findOne({
        _id: id,
        userId,
      });

    if (!habit) {
      return res.status(404).json({
        success: false,
        message:
          "Habit not found",
      });
    }

    const date =
      normalizeDate(
        req.body?.date
      );

    const index =
      habit.completedDates.indexOf(
        date
      );

    let completed;

    if (index >= 0) {
      habit.completedDates.splice(
        index,
        1
      );

      completed = false;
    } else {
      habit.completedDates.push(
        date
      );

      completed = true;
    }

    habit.completedDates = [
      ...new Set(
        habit.completedDates
      ),
    ].sort();

    /*
     * IMPORTANT:
     * Save the habit first.
     * The notification is sent only after
     * MongoDB successfully saves the completion.
     */
    await habit.save();

    /*
     * Send notification only when the habit
     * has been completed, not when it is unchecked.
     */
    if (completed) {
      await notifyHabitCompleted({
        userId: req.user._id,
        habitName:
          habit.name ||
          "Study Habit",
      });
    }

    const streak =
      calculateStreak(
        habit.completedDates,
        date
      );

    return res.json({
      success: true,
      completed,
      currentStreak:
        streak.currentStreak,
      longestStreak:
        streak.longestStreak,
      completedDates:
        habit.completedDates,
      message: completed
        ? "Habit completed 🎉"
        : "Habit unchecked",
    });
  } catch (error) {
    console.error(
      "Toggle Habit Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update habit",
    });
  }
};

/* =========================================================
   DELETE
========================================================= */

exports.deleteHabit = async (
  req,
  res
) => {
  try {
    const userId =
      getUserId(req);

    const {
      id,
    } = req.params;

    if (
      !userId ||
      !isValidObjectId(id)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid request",
      });
    }

    const habit =
      await Habit.findOneAndDelete({
        _id: id,
        userId,
      });

    if (!habit) {
      return res.status(404).json({
        success: false,
        message:
          "Habit not found",
      });
    }

    return res.json({
      success: true,
      message:
        "Habit deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete Habit Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete habit",
    });
  }
};

/* =========================================================
   SUMMARY
========================================================= */

exports.getHabitSummary = async (
  req,
  res
) => {
  try {
    const userId =
      getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    const today =
      normalizeDate(
        req.query.today
      );

    const habits =
      await Habit.find({
        userId,
        archived: false,
      }).lean();

    let totalCompleted = 0;
    let totalScheduled = 0;

    let bestCurrentStreak = 0;
    let bestLongestStreak = 0;

    const todayActivity = [];

    habits.forEach((habit) => {
      const streak =
        calculateStreak(
          habit.completedDates,
          today
        );

      bestCurrentStreak =
        Math.max(
          bestCurrentStreak,
          streak.currentStreak
        );

      bestLongestStreak =
        Math.max(
          bestLongestStreak,
          streak.longestStreak
        );

      const scheduled =
        isHabitScheduledForDate(
          habit,
          today
        );

      const completed =
        habit.completedDates.includes(
          today
        );

      if (scheduled) {
        totalScheduled += 1;

        if (completed) {
          totalCompleted += 1;
        }
      }

      todayActivity.push({
        id: habit._id,
        name: habit.name,
        icon: habit.icon,
        color: habit.color,
        scheduled,
        completed,
        streak:
          streak.currentStreak,
      });
    });

    const completionRate =
      totalScheduled > 0
        ? Math.round(
            (totalCompleted /
              totalScheduled) *
              100
          )
        : 0;

    const last30Days = [];

    for (
      let i = 29;
      i >= 0;
      i--
    ) {
      const date =
        addDays(
          today,
          -i
        );

      let completed = 0;
      let scheduled = 0;

      habits.forEach(
        (habit) => {
          if (
            isHabitScheduledForDate(
              habit,
              date
            )
          ) {
            scheduled += 1;

            if (
              habit.completedDates.includes(
                date
              )
            ) {
              completed += 1;
            }
          }
        }
      );

      last30Days.push({
        date,
        completed,
        scheduled,
        percentage:
          scheduled > 0
            ? Math.round(
                (completed /
                  scheduled) *
                  100
              )
            : 0,
      });
    }

    return res.json({
      success: true,

      summary: {
        totalHabits:
          habits.length,

        completedToday:
          totalCompleted,

        scheduledToday:
          totalScheduled,

        completionRate,

        currentStreak:
          bestCurrentStreak,

        longestStreak:
          bestLongestStreak,
      },

      todayActivity,

      last30Days,

      today,
    });
  } catch (error) {
    console.error(
      "Habit Summary Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load habit summary",
    });
  }
};