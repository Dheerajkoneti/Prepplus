import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import {
  FiActivity,
  FiArchive,
  FiAward,
  FiBarChart2,
  FiBell,
  FiBookOpen,
  FiBriefcase,
  FiCalendar,
  FiCheck,
  FiCheckCircle,
  FiChevronDown,
  FiClock,
  FiCode,
  FiEdit2,
  FiHeart,
  FiHome,
  FiLayers,
  FiPlus,
  FiRefreshCw,
  FiTarget,
  FiTrash2,
  FiTrendingUp,
  FiUser,
  FiX,
  FiZap,
} from "react-icons/fi";

import {
  createHabit,
  deleteHabit,
  getHabitSummary,
  getHabits,
  toggleHabit,
  updateHabit,
} from "../../services/habitService";

/* =========================================================
   CONSTANTS
========================================================= */

const COLORS = [
  "#8b5cf6",
  "#3b82f6",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#f97316",
  "#ec4899",
  "#ef4444",
];

const CATEGORIES = [
  "Study",
  "Coding",
  "Fitness",
  "Health",
  "Career",
  "Personal",
  "Productivity",
  "Other",
];

const DAYS = [
  {
    value: 1,
    short: "M",
    name: "Monday",
  },
  {
    value: 2,
    short: "T",
    name: "Tuesday",
  },
  {
    value: 3,
    short: "W",
    name: "Wednesday",
  },
  {
    value: 4,
    short: "T",
    name: "Thursday",
  },
  {
    value: 5,
    short: "F",
    name: "Friday",
  },
  {
    value: 6,
    short: "S",
    name: "Saturday",
  },
  {
    value: 0,
    short: "S",
    name: "Sunday",
  },
];

/* =========================================================
   HELPERS
========================================================= */

const getToday = () => {
  const date = new Date();

  return [
    date.getFullYear(),
    String(
      date.getMonth() + 1
    ).padStart(2, "0"),
    String(
      date.getDate()
    ).padStart(2, "0"),
  ].join("-");
};

const getDateObject = (
  dateString
) => {
  const [
    year,
    month,
    day,
  ] = dateString
    .split("-")
    .map(Number);

  return new Date(
    year,
    month - 1,
    day
  );
};

const formatDate = (
  dateString
) => {
  if (!dateString) {
    return "";
  }

  return getDateObject(
    dateString
  ).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

const addDays = (
  dateString,
  amount
) => {
  const date =
    getDateObject(
      dateString
    );

  date.setDate(
    date.getDate() +
      amount
  );

  return [
    date.getFullYear(),
    String(
      date.getMonth() + 1
    ).padStart(2, "0"),
    String(
      date.getDate()
    ).padStart(2, "0"),
  ].join("-");
};

const getInitials = (
  name = ""
) => {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map(
        (item) =>
          item[0]?.toUpperCase()
      )
      .join("") || "U"
  );
};

const getCategoryIcon = (
  category
) => {
  switch (category) {
    case "Study":
      return <FiBookOpen />;

    case "Coding":
      return <FiCode />;

    case "Fitness":
      return <FiActivity />;

    case "Health":
      return <FiHeart />;

    case "Career":
      return <FiBriefcase />;

    case "Personal":
      return <FiUser />;

    case "Productivity":
      return <FiZap />;

    default:
      return <FiLayers />;
  }
};

const getHeatClass = (
  percentage
) => {
  if (percentage === 0) {
    return "heat-0";
  }

  if (percentage < 25) {
    return "heat-1";
  }

  if (percentage < 50) {
    return "heat-2";
  }

  if (percentage < 75) {
    return "heat-3";
  }

  return "heat-4";
};

/* =========================================================
   HABIT MODAL
========================================================= */

function HabitModal({
  open,
  onClose,
  onSaved,
  editingHabit,
}) {
  const [name, setName] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [category, setCategory] =
    useState("Productivity");

  const [frequency, setFrequency] =
    useState("daily");

  const [targetDays, setTargetDays] =
    useState([]);

  const [color, setColor] =
    useState(
      COLORS[0]
    );

  const [reminderTime, setReminderTime] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    if (editingHabit) {
      setName(
        editingHabit.name ||
          ""
      );

      setDescription(
        editingHabit.description ||
          ""
      );

      setCategory(
        editingHabit.category ||
          "Productivity"
      );

      setFrequency(
        editingHabit.frequency ||
          "daily"
      );

      setTargetDays(
        editingHabit.targetDays ||
          []
      );

      setColor(
        editingHabit.color ||
          COLORS[0]
      );

      setReminderTime(
        editingHabit.reminderTime ||
          ""
      );
    } else {
      setName("");
      setDescription(
        ""
      );
      setCategory(
        "Productivity"
      );
      setFrequency(
        "daily"
      );
      setTargetDays(
        []
      );
      setColor(
        COLORS[0]
      );
      setReminderTime(
        ""
      );
    }

    setError("");
  }, [
    open,
    editingHabit,
  ]);

  const toggleDay = (
    day
  ) => {
    setTargetDays(
      (previous) =>
        previous.includes(day)
          ? previous.filter(
              (item) =>
                item !== day
            )
          : [
              ...previous,
              day,
            ]
    );
  };

  const submit = async (
    event
  ) => {
    event.preventDefault();

    if (!name.trim()) {
      setError(
        "Please enter a habit name."
      );
      return;
    }

    if (
      frequency ===
        "custom" &&
      targetDays.length === 0
    ) {
      setError(
        "Select at least one day."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      const payload = {
        name:
          name.trim(),

        description:
          description.trim(),

        category,

        frequency,

        targetDays,

        color,

        reminderTime,
      };

      if (editingHabit) {
        await updateHabit(
          editingHabit._id,
          payload
        );
      } else {
        await createHabit(
          payload
        );
      }

      onSaved();
      onClose();
    } catch (err) {
      setError(
        err?.response?.data
          ?.message ||
          "Unable to save habit."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        className="habit-modal-backdrop"
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        exit={{
          opacity: 0,
        }}
        onMouseDown={(event) => {
          if (
            event.target ===
            event.currentTarget
          ) {
            onClose();
          }
        }}
      >
        <motion.div
          className="habit-modal"
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
        >
          <div className="modal-header">
            <div>
              <span className="modal-eyebrow">
                {editingHabit
                  ? "UPDATE HABIT"
                  : "NEW HABIT"}
              </span>

              <h2>
                {editingHabit
                  ? "Edit your habit"
                  : "Build a better routine"}
              </h2>

              <p>
                Small actions,
                repeated
                consistently,
                create big results.
              </p>
            </div>

            <button
              className="icon-button"
              onClick={onClose}
            >
              <FiX />
            </button>
          </div>

          <form
            onSubmit={submit}
          >
            <div className="form-grid">

              <div className="form-group full">
                <label>
                  Habit name
                </label>

                <input
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target
                        .value
                    )
                  }
                  placeholder="e.g. Practice Java for 60 minutes"
                  maxLength={80}
                />
              </div>

              <div className="form-group full">
                <label>
                  Description
                </label>

                <textarea
                  value={
                    description
                  }
                  onChange={(event) =>
                    setDescription(
                      event.target
                        .value
                    )
                  }
                  placeholder="What do you want to accomplish?"
                  maxLength={250}
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>
                  Category
                </label>

                <div className="select-wrapper">
                  <select
                    value={
                      category
                    }
                    onChange={(
                      event
                    ) =>
                      setCategory(
                        event.target
                          .value
                      )
                    }
                  >
                    {CATEGORIES.map(
                      (
                        item
                      ) => (
                        <option
                          key={
                            item
                          }
                          value={
                            item
                          }
                        >
                          {item}
                        </option>
                      )
                    )}
                  </select>

                  <FiChevronDown />
                </div>
              </div>

              <div className="form-group">
                <label>
                  Frequency
                </label>

                <div className="select-wrapper">
                  <select
                    value={
                      frequency
                    }
                    onChange={(
                      event
                    ) =>
                      setFrequency(
                        event.target
                          .value
                      )
                    }
                  >
                    <option value="daily">
                      Every day
                    </option>

                    <option value="weekdays">
                      Weekdays
                    </option>

                    <option value="custom">
                      Custom days
                    </option>
                  </select>

                  <FiChevronDown />
                </div>
              </div>

              {frequency ===
                "custom" && (
                <div className="form-group full">
                  <label>
                    Target days
                  </label>

                  <div className="day-selector">
                    {DAYS.map(
                      (
                        day
                      ) => (
                        <button
                          type="button"
                          key={
                            day.value
                          }
                          className={
                            targetDays.includes(
                              day.value
                            )
                              ? "day-selected"
                              : ""
                          }
                          onClick={() =>
                            toggleDay(
                              day.value
                            )
                          }
                        >
                          {
                            day.short
                          }
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>
                  Reminder
                </label>

                <div className="input-icon">
                  <FiBell />

                  <input
                    type="time"
                    value={
                      reminderTime
                    }
                    onChange={(
                      event
                    ) =>
                      setReminderTime(
                        event.target
                          .value
                      )
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label>
                  Theme color
                </label>

                <div className="color-selector">
                  {COLORS.map(
                    (
                      item
                    ) => (
                      <button
                        type="button"
                        key={
                          item
                        }
                        className={
                          color ===
                          item
                            ? "color-selected"
                            : ""
                        }
                        style={{
                          "--habit-color":
                            item,
                        }}
                        onClick={() =>
                          setColor(
                            item
                          )
                        }
                      />
                    )
                  )}
                </div>
              </div>
            </div>

            {error && (
              <div className="form-error">
                {error}
              </div>
            )}

            <div className="modal-footer">
              <button
                type="button"
                className="secondary-button"
                onClick={onClose}
                disabled={
                  loading
                }
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
                disabled={
                  loading
                }
              >
                {loading ? (
                  <FiRefreshCw className="spin" />
                ) : (
                  <FiCheck />
                )}

                {editingHabit
                  ? "Save Changes"
                  : "Create Habit"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* =========================================================
   HABIT CARD
========================================================= */

function HabitCard({
  habit,
  onToggle,
  onEdit,
  onDelete,
  onArchive,
}) {
  return (
    <motion.article
      layout
      initial={{
        opacity: 0,
        y: 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        scale: 0.95,
      }}
      className="habit-card"
      style={{
        "--habit-color":
          habit.color ||
          "#8b5cf6",
      }}
    >
      <div className="habit-card-glow" />

      <div className="habit-card-top">
        <div className="habit-icon">
          {getCategoryIcon(
            habit.category
          )}
        </div>

        <div className="habit-card-actions">
          <button
            onClick={() =>
              onEdit(habit)
            }
            title="Edit"
          >
            <FiEdit2 />
          </button>

          <button
            onClick={() =>
              onArchive(
                habit
              )
            }
            title="Archive"
          >
            <FiArchive />
          </button>

          <button
            className="delete-button"
            onClick={() =>
              onDelete(
                habit._id
              )
            }
            title="Delete"
          >
            <FiTrash2 />
          </button>
        </div>
      </div>

      <div className="habit-card-content">
        <div className="habit-title-row">
          <div>
            <h3>
              {habit.name}
            </h3>

            <span>
              {habit.category}
            </span>
          </div>

          {habit.completedToday && (
            <div className="completed-badge">
              <FiCheck />
              Done
            </div>
          )}
        </div>

        {habit.description && (
          <p className="habit-description">
            {habit.description}
          </p>
        )}

        <div className="habit-card-stats">

          <div>
            <FiTrendingUp />

            <span>
              {habit.currentStreak ||
                0}
            </span>

            <small>
              Day streak
            </small>
          </div>

          <div>
            <FiAward />

            <span>
              {habit.longestStreak ||
                0}
            </span>

            <small>
              Best
            </small>
          </div>

          <div>
            <FiCalendar />

            <span>
              {habit.completedDates
                ?.length ||
                0}
            </span>

            <small>
              Completed
            </small>
          </div>

        </div>

        <div className="habit-card-bottom">

          <div className="habit-frequency">
            <FiClock />

            {habit.frequency ===
            "daily"
              ? "Every day"
              : habit.frequency ===
                "weekdays"
              ? "Weekdays"
              : "Custom schedule"}
          </div>

          {habit.reminderTime && (
            <div className="reminder-label">
              <FiBell />
              {
                habit.reminderTime
              }
            </div>
          )}

        </div>

        <button
          className={
            habit.completedToday
              ? "habit-check checked"
              : "habit-check"
          }
          onClick={() =>
            onToggle(habit)
          }
          disabled={
            !habit.scheduledToday
          }
        >
          <span className="check-circle">
            {habit.completedToday && (
              <FiCheck />
            )}
          </span>

          {habit.completedToday
            ? "Completed today"
            : habit.scheduledToday
            ? "Mark as complete"
            : "Not scheduled today"}
        </button>
      </div>
    </motion.article>
  );
}

/* =========================================================
   MAIN
========================================================= */

function Habits() {
  const [
    habits,
    setHabits,
  ] = useState([]);

  const [
    summary,
    setSummary,
  ] = useState({
    totalHabits: 0,
    completedToday: 0,
    scheduledToday: 0,
    completionRate: 0,
    currentStreak: 0,
    longestStreak: 0,
  });

  const [
    todayActivity,
    setTodayActivity,
  ] = useState([]);

  const [
    last30Days,
    setLast30Days,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    modalOpen,
    setModalOpen,
  ] = useState(false);

  const [
    editingHabit,
    setEditingHabit,
  ] = useState(null);

  const [
    activeCategory,
    setActiveCategory,
  ] = useState("All");

  const [
    showArchived,
    setShowArchived,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  /* =======================================================
     LOAD
  ======================================================= */

  const loadData =
    useCallback(
      async (
        refresh = false
      ) => {
        try {
          setError("");

          if (refresh) {
            setRefreshing(
              true
            );
          } else {
            setLoading(
              true
            );
          }

          const [
            habitsResponse,
            summaryResponse,
          ] =
            await Promise.all([
              getHabits(),
              getHabitSummary(),
            ]);

          if (
            habitsResponse?.success
          ) {
            setHabits(
              habitsResponse.habits ||
                []
            );
          }

          if (
            summaryResponse?.success
          ) {
            setSummary(
              summaryResponse.summary ||
                {}
            );

            setTodayActivity(
              summaryResponse.todayActivity ||
                []
            );

            setLast30Days(
              summaryResponse.last30Days ||
                []
            );
          }
        } catch (err) {
          console.error(
            "Habit Tracker Error:",
            err
          );

          if (
            err?.response?.status ===
            401
          ) {
            setError(
              "Your session has expired. Please login again."
            );
          } else {
            setError(
              err?.response?.data
                ?.message ||
                "Unable to load habit tracker."
            );
          }
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      []
    );

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* =======================================================
     REAL-TIME REFRESH
  ======================================================= */

  useEffect(() => {
    const interval =
      setInterval(() => {
        loadData(true);
      }, 30000);

    return () =>
      clearInterval(
        interval
      );
  }, [loadData]);

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredHabits =
    useMemo(() => {
      return habits.filter(
        (habit) => {
          if (
            !showArchived &&
            habit.archived
          ) {
            return false;
          }

          if (
            activeCategory !==
              "All" &&
            habit.category !==
              activeCategory
          ) {
            return false;
          }

          return true;
        }
      );
    }, [
      habits,
      activeCategory,
      showArchived,
    ]);

  /* =======================================================
     TODAY
  ======================================================= */

  const today =
    getToday();

  const todayPercentage =
    summary.scheduledToday >
    0
      ? Math.round(
          (summary.completedToday /
            summary.scheduledToday) *
            100
        )
      : 0;

  /* =======================================================
     DELETE
  ======================================================= */

  const handleDelete =
    async (id) => {
      const confirmed =
        window.confirm(
          "Delete this habit permanently?"
        );

      if (!confirmed) {
        return;
      }

      try {
        await deleteHabit(
          id
        );

        await loadData(
          true
        );
      } catch (err) {
        setError(
          err?.response?.data
            ?.message ||
            "Unable to delete habit."
        );
      }
    };

  /* =======================================================
     TOGGLE
  ======================================================= */

  const handleToggle =
    async (habit) => {
      try {
        await toggleHabit(
          habit._id,
          today
        );

        window.dispatchEvent(
          new CustomEvent(
            "preppulse:progress-updated",
            {
              detail: {
                type:
                  "HABIT_UPDATED",
              },
            }
          )
        );

        await loadData(
          true
        );
      } catch (err) {
        setError(
          err?.response?.data
            ?.message ||
            "Unable to update habit."
        );
      }
    };

  /* =======================================================
     EDIT
  ======================================================= */

  const handleEdit =
    (habit) => {
      setEditingHabit(
        habit
      );

      setModalOpen(
        true
      );
    };

  /* =======================================================
     ARCHIVE
  ======================================================= */

  const handleArchive =
    async (habit) => {
      try {
        await updateHabit(
          habit._id,
          {
            archived:
              !habit.archived,
          }
        );

        await loadData(
          true
        );
      } catch (err) {
        setError(
          err?.response?.data
            ?.message ||
            "Unable to archive habit."
        );
      }
    };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <>
        <HabitStyles />

        <div className="habits-loading">
          <div className="loading-orb">
            <FiActivity />
          </div>

          <h2>
            Building Your Routine
          </h2>

          <p>
            Loading your habits...
          </p>

          <div className="loading-bar">
            <span />
          </div>
        </div>
      </>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      <HabitStyles />

      <div className="habits-page">

        {/* BACKGROUND */}

        <div className="habits-background">
          <div className="habit-grid" />

          <div className="habit-glow glow-one" />
          <div className="habit-glow glow-two" />
          <div className="habit-glow glow-three" />

          <div className="habit-particle p-one" />
          <div className="habit-particle p-two" />
          <div className="habit-particle p-three" />
          <div className="habit-particle p-four" />
        </div>

        <main className="habits-container">

          {/* =================================================
              TOP BAR
          ================================================= */}

          <header className="habits-topbar">

            <div className="brand-block">

              <div className="brand-icon">
                <FiActivity />
              </div>

              <div>
                <strong>
                  PrepPulse
                </strong>

                <span>
                  HABIT SYSTEM
                </span>
              </div>

            </div>

            <div className="topbar-actions">

              <div className="sync-status">
                <span />
                Synced
              </div>

              <button
                className="refresh-button"
                onClick={() =>
                  loadData(true)
                }
              >
                <FiRefreshCw
                  className={
                    refreshing
                      ? "spin"
                      : ""
                  }
                />
              </button>

            </div>

          </header>

          {/* =================================================
              HERO
          ================================================= */}

          <section className="habit-hero">

            <div className="hero-content">

              <div className="hero-badge">
                <FiZap />
                BUILD CONSISTENCY
              </div>

              <h1>
                Your habits.
                <br />

                <span>
                  Your momentum.
                </span>
              </h1>

              <p>
                Turn small daily
                actions into
                measurable progress.
                Build routines that
                move you closer to
                your goals.
              </p>

              <button
                className="create-habit-button"
                onClick={() => {
                  setEditingHabit(
                    null
                  );

                  setModalOpen(
                    true
                  );
                }}
              >
                <FiPlus />
                Create New Habit
              </button>

            </div>

            <div className="hero-progress">

              <div className="progress-orbit">
                <div className="progress-ring">
                  <svg
                    viewBox="0 0 120 120"
                  >
                    <circle
                      cx="60"
                      cy="60"
                      r="48"
                      className="ring-bg"
                    />

                    <circle
                      cx="60"
                      cy="60"
                      r="48"
                      className="ring-progress"
                      style={{
                        strokeDashoffset:
                          301 -
                          (301 *
                            todayPercentage) /
                            100,
                      }}
                    />
                  </svg>

                  <div className="progress-center">
                    <strong>
                      {
                        todayPercentage
                      }
                      %
                    </strong>

                    <span>
                      TODAY
                    </span>
                  </div>
                </div>
              </div>

              <div className="hero-progress-info">
                <span>
                  TODAY'S PROGRESS
                </span>

                <strong>
                  {
                    summary.completedToday
                  }{" "}
                  /{" "}
                  {
                    summary.scheduledToday
                  }
                </strong>

                <small>
                  habits completed
                </small>
              </div>

            </div>

          </section>

          {/* =================================================
              KPI
          ================================================= */}

          <section className="habit-kpis">

            <div className="kpi-card">
              <div className="kpi-icon purple">
                <FiActivity />
              </div>

              <div>
                <span>
                  Current Streak
                </span>

                <strong>
                  {
                    summary.currentStreak
                  }
                  <small>
                    days
                  </small>
                </strong>

                <p>
                  Keep the momentum
                </p>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon cyan">
                <FiAward />
              </div>

              <div>
                <span>
                  Longest Streak
                </span>

                <strong>
                  {
                    summary.longestStreak
                  }
                  <small>
                    days
                  </small>
                </strong>

                <p>
                  Your personal best
                </p>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon green">
                <FiCheckCircle />
              </div>

              <div>
                <span>
                  Today's Wins
                </span>

                <strong>
                  {
                    summary.completedToday
                  }
                </strong>

                <p>
                  Completed today
                </p>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon gold">
                <FiTarget />
              </div>

              <div>
                <span>
                  Active Habits
                </span>

                <strong>
                  {
                    summary.totalHabits
                  }
                </strong>

                <p>
                  Building consistency
                </p>
              </div>
            </div>

          </section>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="habit-error">
              <FiX />

              <span>
                {error}
              </span>

              <button
                onClick={() =>
                  setError("")
                }
              >
                Dismiss
              </button>
            </div>
          )}

          {/* =================================================
              TODAY HABITS
          ================================================= */}

          <section className="today-section">

            <div className="section-header">

              <div>
                <span className="section-label">
                  <FiCalendar />
                  {formatDate(
                    today
                  )}
                </span>

                <h2>
                  Today's Habits
                </h2>

                <p>
                  One check at a time.
                </p>
              </div>

              <div className="today-count">
                <strong>
                  {
                    summary.completedToday
                  }
                </strong>

                <span>
                  /
                  {
                    summary.scheduledToday
                  }{" "}
                  complete
                </span>
              </div>

            </div>

            <div className="today-progress">
              <div
                className="today-progress-fill"
                style={{
                  width: `${todayPercentage}%`,
                }}
              />
            </div>

            <div className="today-list">

              {todayActivity.length ===
              0 ? (
                <div className="empty-today">
                  <div>
                    <FiTarget />
                  </div>

                  <h3>
                    No habits yet
                  </h3>

                  <p>
                    Create your first
                    habit and start
                    building momentum.
                  </p>

                  <button
                    onClick={() => {
                      setEditingHabit(
                        null
                      );

                      setModalOpen(
                        true
                      );
                    }}
                  >
                    <FiPlus />
                    Create Habit
                  </button>
                </div>
              ) : (
                todayActivity.map(
                  (item) => (
                    <motion.div
                      key={item.id}
                      className={
                        item.completed
                          ? "today-item completed"
                          : "today-item"
                      }
                      whileHover={{
                        y: -2,
                      }}
                    >
                      <div
                        className="today-item-icon"
                        style={{
                          "--habit-color":
                            item.color,
                        }}
                      >
                        {getCategoryIcon(
                          item.category
                        )}
                      </div>

                      <div className="today-item-main">
                        <strong>
                          {item.name}
                        </strong>

                        <span>
                          {item.streak ||
                            0}{" "}
                          day streak
                        </span>
                      </div>

                      <button
                        className="today-check"
                        onClick={() => {
                          const habit =
                            habits.find(
                              (itemHabit) =>
                                String(
                                  itemHabit._id
                                ) ===
                                String(
                                  item.id
                                )
                            );

                          if (
                            habit
                          ) {
                            handleToggle(
                              habit
                            );
                          }
                        }}
                      >
                        {item.completed ? (
                          <FiCheck />
                        ) : null}
                      </button>
                    </motion.div>
                  )
                )
              )}

            </div>

          </section>

          {/* =================================================
              HEATMAP
          ================================================= */}

          <section className="analytics-section">

            <div className="section-header">

              <div>
                <span className="section-label">
                  <FiBarChart2 />
                  CONSISTENCY
                </span>

                <h2>
                  Your Activity
                </h2>

                <p>
                  Your last 30 days
                  of progress.
                </p>
              </div>

              <div className="heat-legend">
                <span>
                  Less
                </span>

                <i className="heat-0" />
                <i className="heat-1" />
                <i className="heat-2" />
                <i className="heat-3" />
                <i className="heat-4" />

                <span>
                  More
                </span>
              </div>

            </div>

            <div className="heatmap">
              {last30Days.map(
                (day) => (
                  <div
                    key={
                      day.date
                    }
                    className={`heat-cell ${getHeatClass(
                      day.percentage
                    )}`}
                    title={`${formatDate(
                      day.date
                    )}: ${
                      day.completed
                    } / ${
                      day.scheduled
                    } completed`}
                  />
                )
              )}
            </div>

            <div className="activity-footer">

              <div>
                <FiTrendingUp />

                <span>
                  30-day completion
                </span>

                <strong>
                  {last30Days.length
                    ? Math.round(
                        last30Days.reduce(
                          (
                            sum,
                            item
                          ) =>
                            sum +
                            item.percentage,
                          0
                        ) /
                          last30Days.length
                      )
                    : 0}
                  %
                </strong>
              </div>

              <div>
                <FiCheckCircle />

                <span>
                  Total check-ins
                </span>

                <strong>
                  {last30Days.reduce(
                    (
                      sum,
                      item
                    ) =>
                      sum +
                      item.completed,
                    0
                  )}
                </strong>
              </div>

            </div>

          </section>

          {/* =================================================
              HABIT LIBRARY
          ================================================= */}

          <section className="library-section">

            <div className="section-header library-header">

              <div>
                <span className="section-label">
                  <FiLayers />
                  HABIT LIBRARY
                </span>

                <h2>
                  Your Habits
                </h2>

                <p>
                  Manage your routines
                  and keep improving.
                </p>
              </div>

              <button
                className="small-create-button"
                onClick={() => {
                  setEditingHabit(
                    null
                  );

                  setModalOpen(
                    true
                  );
                }}
              >
                <FiPlus />
                Add Habit
              </button>

            </div>

            <div className="library-toolbar">

              <div className="category-filter">

                {[
                  "All",
                  ...CATEGORIES,
                ].map(
                  (category) => (
                    <button
                      key={
                        category
                      }
                      className={
                        activeCategory ===
                        category
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        setActiveCategory(
                          category
                        )
                      }
                    >
                      {category}
                    </button>
                  )
                )}

              </div>

              <button
                className={
                  showArchived
                    ? "archive-toggle active"
                    : "archive-toggle"
                }
                onClick={() =>
                  setShowArchived(
                    (
                      value
                    ) => !value
                  )
                }
              >
                <FiArchive />
                Archived
              </button>

            </div>

            <div className="habits-grid">

              <AnimatePresence>
                {filteredHabits.map(
                  (habit) => (
                    <HabitCard
                      key={
                        habit._id
                      }
                      habit={
                        habit
                      }
                      onToggle={
                        handleToggle
                      }
                      onEdit={
                        handleEdit
                      }
                      onDelete={
                        handleDelete
                      }
                      onArchive={
                        handleArchive
                      }
                    />
                  )
                )}
              </AnimatePresence>

              {filteredHabits.length ===
                0 && (
                <div className="empty-library">
                  <div>
                    <FiLayers />
                  </div>

                  <h3>
                    No habits here
                  </h3>

                  <p>
                    Start with one
                    small routine.
                  </p>

                  <button
                    onClick={() => {
                      setEditingHabit(
                        null
                      );

                      setModalOpen(
                        true
                      );
                    }}
                  >
                    <FiPlus />
                    Create Habit
                  </button>
                </div>
              )}

            </div>

          </section>

          {/* =================================================
              MOTIVATION
          ================================================= */}

          <section className="motivation-card">

            <div className="motivation-icon">
              <FiZap />
            </div>

            <div>
              <span>
                YOUR NEXT LEVEL
              </span>

              <h2>
                Consistency beats
                motivation.
              </h2>

              <p>
                You don't need to be
                perfect. You just need
                to keep showing up.
              </p>
            </div>

            <div className="motivation-stat">
              <strong>
                {
                  summary.currentStreak
                }
              </strong>

              <span>
                day streak
              </span>
            </div>

          </section>

          {/* =================================================
              FOOTER
          ================================================= */}

          <footer className="habits-footer">

            <div>
              <FiActivity />
              PrepPulse Habit System
            </div>

            <span>
              Build • Track • Improve
            </span>

            <span className="footer-status">
              <i />
              All progress saved
            </span>

          </footer>

        </main>

        <HabitModal
          open={modalOpen}
          onClose={() =>
            setModalOpen(
              false
            )
          }
          onSaved={() =>
            loadData(true)
          }
          editingHabit={
            editingHabit
          }
        />

      </div>
    </>
  );
}

/* =========================================================
   COMPLETE STYLES
========================================================= */

function HabitStyles() {
  return (
    <style>{`

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        background: #020617;
        color: #f8fafc;
        font-family:
          Inter,
          ui-sans-serif,
          system-ui,
          -apple-system,
          BlinkMacSystemFont,
          "Segoe UI",
          sans-serif;
      }

      button,
      input,
      textarea,
      select {
        font-family: inherit;
      }

      button {
        cursor: pointer;
      }

      /* ================================================
         PAGE
      ================================================ */

      .habits-page {
        position: relative;
        min-height: 100vh;
        overflow-x: hidden;
        background:
          radial-gradient(
            circle at 10% 10%,
            rgba(124,58,237,.1),
            transparent 30%
          ),
          radial-gradient(
            circle at 90% 30%,
            rgba(6,182,212,.07),
            transparent 28%
          ),
          #020617;
      }

      .habits-container {
        position: relative;
        z-index: 3;
        width:
          min(
            1450px,
            calc(100% - 44px)
          );
        margin: auto;
        padding:
          20px 0 50px;
      }

      /* ================================================
         BACKGROUND
      ================================================ */

      .habits-background {
        position: fixed;
        inset: 0;
        pointer-events: none;
        overflow: hidden;
      }

      .habit-grid {
        position: absolute;
        inset: 0;
        opacity: .04;
        background-image:
          linear-gradient(
            rgba(148,163,184,.4) 1px,
            transparent 1px
          ),
          linear-gradient(
            90deg,
            rgba(148,163,184,.4) 1px,
            transparent 1px
          );
        background-size:
          55px 55px;
        mask-image:
          linear-gradient(
            to bottom,
            black,
            transparent
          );
      }

      .habit-glow {
        position: absolute;
        border-radius: 50%;
        filter: blur(110px);
        opacity: .13;
        animation:
          glowFloat 13s
          ease-in-out
          infinite;
      }

      .glow-one {
        width: 500px;
        height: 500px;
        left: -250px;
        top: 15%;
        background: #7c3aed;
      }

      .glow-two {
        width: 450px;
        height: 450px;
        right: -200px;
        top: 35%;
        background: #0891b2;
        animation-delay: -4s;
      }

      .glow-three {
        width: 350px;
        height: 350px;
        left: 40%;
        bottom: -200px;
        background: #2563eb;
        animation-delay: -8s;
      }

      .habit-particle {
        position: absolute;
        width: 3px;
        height: 3px;
        border-radius: 50%;
        background: #a78bfa;
        box-shadow:
          0 0 12px
          rgba(167,139,250,.9);
        animation:
          particleMove 7s
          ease-in-out
          infinite;
      }

      .p-one {
        left: 20%;
        top: 25%;
      }

      .p-two {
        left: 75%;
        top: 22%;
        animation-delay: -2s;
      }

      .p-three {
        left: 82%;
        top: 72%;
        animation-delay: -4s;
      }

      .p-four {
        left: 35%;
        top: 78%;
        animation-delay: -1s;
      }

      /* ================================================
         TOPBAR
      ================================================ */

      .habits-topbar {
        height: 58px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 15px;
      }

      .brand-block {
        display: flex;
        align-items: center;
        gap: 9px;
      }

      .brand-icon {
        width: 36px;
        height: 36px;
        display: grid;
        place-items: center;
        color: white;
        border-radius: 11px;
        background:
          linear-gradient(
            135deg,
            #7c3aed,
            #2563eb
          );
        box-shadow:
          0 0 25px
          rgba(124,58,237,.25);
      }

      .brand-icon svg {
        font-size: 17px;
      }

      .brand-block strong {
        display: block;
        font-size: .72rem;
      }

      .brand-block span {
        display: block;
        margin-top: 1px;
        color: #475569;
        font-size: .4rem;
        font-weight: 900;
        letter-spacing: 1px;
      }

      .topbar-actions {
        display: flex;
        align-items: center;
        gap: 7px;
      }

      .sync-status {
        height: 33px;
        display: flex;
        align-items: center;
        gap: 6px;
        padding:
          0 10px;
        color: #6ee7b7;
        border:
          1px solid
          rgba(52,211,153,.12);
        border-radius: 9px;
        background:
          rgba(16,185,129,.04);
        font-size: .48rem;
        font-weight: 800;
      }

      .sync-status span,
      .footer-status i {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #34d399;
        box-shadow:
          0 0 10px
          rgba(52,211,153,.8);
      }

      .refresh-button {
        width: 33px;
        height: 33px;
        display: grid;
        place-items: center;
        color: #64748b;
        background:
          rgba(15,23,42,.65);
        border:
          1px solid
          rgba(148,163,184,.08);
        border-radius: 9px;
      }

      .refresh-button:hover {
        color: white;
        border-color:
          rgba(167,139,250,.2);
      }

      /* ================================================
         HERO
      ================================================ */

      .habit-hero {
        position: relative;
        min-height: 330px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        overflow: hidden;
        padding:
          45px 55px;
        border-radius: 25px;
        background:
          radial-gradient(
            circle at 80% 50%,
            rgba(124,58,237,.15),
            transparent 30%
          ),
          linear-gradient(
            120deg,
            rgba(15,23,42,.97),
            rgba(7,13,29,.92)
          );
        border:
          1px solid
          rgba(148,163,184,.08);
        box-shadow:
          0 35px 100px
          rgba(0,0,0,.25);
      }

      .habit-hero::after {
        content: "";
        position: absolute;
        inset: 0;
        background:
          linear-gradient(
            90deg,
            transparent,
            rgba(124,58,237,.025)
          );
        pointer-events: none;
      }

      .hero-content {
        position: relative;
        z-index: 2;
      }

      .hero-badge {
        width: fit-content;
        display: flex;
        align-items: center;
        gap: 6px;
        padding:
          6px 8px;
        color: #c4b5fd;
        background:
          rgba(124,58,237,.07);
        border:
          1px solid
          rgba(167,139,250,.12);
        border-radius: 8px;
        font-size: .47rem;
        font-weight: 900;
        letter-spacing: .9px;
      }

      .hero-badge svg {
        color: #c084fc;
      }

      .hero-content h1 {
        margin:
          17px 0 13px;
        font-size:
          clamp(
            2.7rem,
            5vw,
            4.8rem
          );
        line-height: .93;
        letter-spacing: -4px;
      }

      .hero-content h1 span {
        background:
          linear-gradient(
            90deg,
            #a78bfa,
            #60a5fa,
            #22d3ee
          );
        -webkit-background-clip:
          text;
        -webkit-text-fill-color:
          transparent;
      }

      .hero-content p {
        max-width: 560px;
        margin: 0;
        color: #64748b;
        font-size: .7rem;
        line-height: 1.8;
      }

      .create-habit-button {
        display: flex;
        align-items: center;
        gap: 7px;
        margin-top: 22px;
        padding:
          11px 15px;
        color: white;
        background:
          linear-gradient(
            135deg,
            #7c3aed,
            #2563eb
          );
        border: 0;
        border-radius: 11px;
        box-shadow:
          0 12px 35px
          rgba(124,58,237,.22);
        font-size: .57rem;
        font-weight: 900;
        transition: .2s ease;
      }

      .create-habit-button:hover {
        transform:
          translateY(-2px);
        box-shadow:
          0 18px 40px
          rgba(124,58,237,.3);
      }

      .hero-progress {
        position: relative;
        z-index: 2;
        display: flex;
        align-items: center;
        gap: 25px;
      }

      .progress-orbit {
        position: relative;
        width: 190px;
        height: 190px;
        display: grid;
        place-items: center;
      }

      .progress-orbit::before,
      .progress-orbit::after {
        content: "";
        position: absolute;
        border-radius: 50%;
        border:
          1px solid
          rgba(167,139,250,.1);
      }

      .progress-orbit::before {
        inset: -12px;
      }

      .progress-orbit::after {
        inset: -25px;
        border-color:
          rgba(34,211,238,.06);
      }

      .progress-ring {
        position: relative;
        width: 180px;
        height: 180px;
      }

      .progress-ring svg {
        width: 100%;
        height: 100%;
        transform:
          rotate(-90deg);
      }

      .progress-ring circle {
        fill: none;
        stroke-width: 7;
      }

      .ring-bg {
        stroke:
          rgba(255,255,255,.05);
      }

      .ring-progress {
        stroke:
          url(#habitGradient);
        stroke: #8b5cf6;
        stroke-linecap: round;
        stroke-dasharray: 301;
        transition:
          stroke-dashoffset .8s
          ease;
        filter:
          drop-shadow(
            0 0 8px
            rgba(139,92,246,.5)
          );
      }

      .progress-center {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }

      .progress-center strong {
        font-size: 2.2rem;
        letter-spacing: -2px;
      }

      .progress-center span {
        margin-top: 2px;
        color: #475569;
        font-size: .43rem;
        font-weight: 900;
        letter-spacing: 1px;
      }

      .hero-progress-info span {
        display: block;
        color: #64748b;
        font-size: .47rem;
        font-weight: 900;
        letter-spacing: .7px;
      }

      .hero-progress-info strong {
        display: block;
        margin-top: 5px;
        color: #e2e8f0;
        font-size: 1.3rem;
      }

      .hero-progress-info small {
        display: block;
        margin-top: 3px;
        color: #334155;
        font-size: .46rem;
      }

      /* ================================================
         KPI
      ================================================ */

      .habit-kpis {
        display: grid;
        grid-template-columns:
          repeat(4, 1fr);
        gap: 10px;
        margin-top: 12px;
      }

      .kpi-card {
        display: flex;
        align-items: center;
        gap: 11px;
        min-height: 90px;
        padding: 14px;
        overflow: hidden;
        border-radius: 15px;
        background:
          rgba(8,15,30,.78);
        border:
          1px solid
          rgba(148,163,184,.06);
      }

      .kpi-icon {
        width: 42px;
        height: 42px;
        display: grid;
        place-items: center;
        flex-shrink: 0;
        border-radius: 12px;
      }

      .kpi-icon.purple {
        color: #c084fc;
        background:
          rgba(124,58,237,.1);
      }

      .kpi-icon.cyan {
        color: #22d3ee;
        background:
          rgba(34,211,238,.08);
      }

      .kpi-icon.green {
        color: #34d399;
        background:
          rgba(16,185,129,.08);
      }

      .kpi-icon.gold {
        color: #fbbf24;
        background:
          rgba(251,191,36,.08);
      }

      .kpi-card span {
        display: block;
        color: #64748b;
        font-size: .48rem;
      }

      .kpi-card strong {
        display: block;
        margin-top: 3px;
        color: #e2e8f0;
        font-size: 1.05rem;
      }

      .kpi-card strong small {
        margin-left: 3px;
        color: #475569;
        font-size: .43rem;
      }

      .kpi-card p {
        margin:
          2px 0 0;
        color: #334155;
        font-size: .4rem;
      }

      /* ================================================
         ERROR
      ================================================ */

      .habit-error {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 12px;
        padding: 11px 13px;
        color: #fca5a5;
        background:
          rgba(239,68,68,.05);
        border:
          1px solid
          rgba(239,68,68,.13);
        border-radius: 11px;
        font-size: .52rem;
      }

      .habit-error button {
        margin-left: auto;
        color: #c084fc;
        background: transparent;
        border: 0;
        font-size: .5rem;
        font-weight: 800;
      }

      /* ================================================
         SECTIONS
      ================================================ */

      .today-section,
      .analytics-section,
      .library-section {
        margin-top: 35px;
      }

      .section-header {
        display: flex;
        align-items: end;
        justify-content: space-between;
        margin-bottom: 13px;
      }

      .section-label {
        display: flex;
        align-items: center;
        gap: 5px;
        color: #a78bfa;
        font-size: .47rem;
        font-weight: 900;
        letter-spacing: .9px;
      }

      .section-label svg {
        font-size: 10px;
      }

      .section-header h2 {
        margin:
          6px 0 3px;
        font-size: 1.25rem;
        letter-spacing: -.5px;
      }

      .section-header p {
        margin: 0;
        color: #475569;
        font-size: .54rem;
      }

      .today-count {
        text-align: right;
      }

      .today-count strong {
        color: #e2e8f0;
        font-size: 1.4rem;
      }

      .today-count span {
        margin-left: 3px;
        color: #475569;
        font-size: .47rem;
      }

      .today-progress {
        height: 4px;
        overflow: hidden;
        margin-bottom: 12px;
        border-radius: 99px;
        background:
          rgba(255,255,255,.045);
      }

      .today-progress-fill {
        height: 100%;
        width: 0;
        border-radius: inherit;
        background:
          linear-gradient(
            90deg,
            #7c3aed,
            #2563eb,
            #22d3ee
          );
        box-shadow:
          0 0 12px
          rgba(124,58,237,.3);
        transition:
          width .6s cubic-bezier(.22,1,.36,1);
      }

      /* ================================================
         TODAY LIST
      ================================================ */

      .today-list {
        display: grid;
        grid-template-columns:
          repeat(
            auto-fit,
            minmax(
              260px,
              1fr
            )
          );
        gap: 8px;
      }

      .today-item {
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: 68px;
        padding: 10px;
        border-radius: 13px;
        background:
          rgba(8,15,30,.75);
        border:
          1px solid
          rgba(148,163,184,.06);
        transition: .2s ease;
      }

      .today-item.completed {
        border-color:
          rgba(52,211,153,.12);
        background:
          linear-gradient(
            135deg,
            rgba(16,185,129,.05),
            rgba(8,15,30,.75)
          );
      }

      .today-item-icon {
        width: 37px;
        height: 37px;
        display: grid;
        place-items: center;
        flex-shrink: 0;
        color: var(--habit-color);
        border-radius: 10px;
        background:
          color-mix(
            in srgb,
            var(--habit-color) 10%,
            transparent
          );
      }

      .today-item-main {
        min-width: 0;
        flex: 1;
      }

      .today-item-main strong {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: #dbe4f0;
        font-size: .58rem;
      }

      .today-item-main span {
        display: block;
        margin-top: 3px;
        color: #475569;
        font-size: .43rem;
      }

      .today-check {
        width: 31px;
        height: 31px;
        display: grid;
        place-items: center;
        flex-shrink: 0;
        color: white;
        background:
          rgba(255,255,255,.025);
        border:
          1px solid
          rgba(255,255,255,.07);
        border-radius: 9px;
      }

      .today-item.completed
      .today-check {
        color: white;
        background:
          linear-gradient(
            135deg,
            #10b981,
            #059669
          );
        border-color:
          transparent;
      }

      /* ================================================
         HEATMAP
      ================================================ */

      .analytics-section {
        padding: 20px;
        border-radius: 18px;
        background:
          rgba(8,15,30,.7);
        border:
          1px solid
          rgba(148,163,184,.06);
      }

      .heat-legend {
        display: flex;
        align-items: center;
        gap: 4px;
        color: #334155;
        font-size: .42rem;
      }

      .heat-legend i {
        width: 12px;
        height: 12px;
        display: block;
        border-radius: 3px;
      }

      .heatmap {
        display: grid;
        grid-template-columns:
          repeat(
            30,
            1fr
          );
        gap: 5px;
        margin-top: 15px;
      }

      .heat-cell {
        aspect-ratio: 1;
        min-width: 8px;
        border-radius: 4px;
        border:
          1px solid
          rgba(255,255,255,.025);
        transition: .2s ease;
      }

      .heat-cell:hover {
        transform:
          scale(1.18);
        border-color:
          rgba(255,255,255,.15);
      }

      .heat-0 {
        background:
          rgba(255,255,255,.035);
      }

      .heat-1 {
        background:
          rgba(124,58,237,.2);
      }

      .heat-2 {
        background:
          rgba(124,58,237,.4);
      }

      .heat-3 {
        background:
          rgba(124,58,237,.65);
      }

      .heat-4 {
        background:
          linear-gradient(
            135deg,
            #7c3aed,
            #22d3ee
          );
        box-shadow:
          0 0 10px
          rgba(124,58,237,.18);
      }

      .activity-footer {
        display: flex;
        justify-content: space-between;
        margin-top: 17px;
        padding-top: 14px;
        border-top:
          1px solid
          rgba(255,255,255,.04);
      }

      .activity-footer > div {
        display: flex;
        align-items: center;
        gap: 7px;
      }

      .activity-footer svg {
        color: #a78bfa;
        font-size: 12px;
      }

      .activity-footer span {
        color: #475569;
        font-size: .46rem;
      }

      .activity-footer strong {
        color: #cbd5e1;
        font-size: .57rem;
      }

      /* ================================================
         LIBRARY
      ================================================ */

      .library-header {
        margin-bottom: 12px;
      }

      .small-create-button {
        display: flex;
        align-items: center;
        gap: 6px;
        padding:
          9px 12px;
        color: #c4b5fd;
        background:
          rgba(124,58,237,.08);
        border:
          1px solid
          rgba(167,139,250,.12);
        border-radius: 9px;
        font-size: .5rem;
        font-weight: 850;
      }

      .small-create-button:hover {
        background:
          rgba(124,58,237,.14);
      }

      .library-toolbar {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        margin-bottom: 12px;
        overflow-x: auto;
      }

      .category-filter {
        display: flex;
        gap: 4px;
      }

      .category-filter button,
      .archive-toggle {
        height: 31px;
        flex-shrink: 0;
        padding:
          0 10px;
        color: #475569;
        background:
          rgba(8,15,30,.72);
        border:
          1px solid
          rgba(148,163,184,.06);
        border-radius: 8px;
        font-size: .45rem;
        font-weight: 750;
      }

      .category-filter button:hover,
      .category-filter button.active {
        color: #e2e8f0;
        background:
          rgba(124,58,237,.1);
        border-color:
          rgba(167,139,250,.13);
      }

      .archive-toggle {
        display: flex;
        align-items: center;
        gap: 5px;
      }

      .archive-toggle.active {
        color: #c084fc;
        border-color:
          rgba(167,139,250,.14);
      }

      .habits-grid {
        display: grid;
        grid-template-columns:
          repeat(
            3,
            minmax(
              0,
              1fr
            )
          );
        gap: 11px;
      }

      /* ================================================
         HABIT CARD
      ================================================ */

      .habit-card {
        position: relative;
        overflow: hidden;
        border-radius: 17px;
        background:
          linear-gradient(
            145deg,
            rgba(15,23,42,.9),
            rgba(6,12,26,.9)
          );
        border:
          1px solid
          rgba(148,163,184,.07);
        transition:
          transform .25s ease,
          border-color .25s ease,
          box-shadow .25s ease;
      }

      .habit-card:hover {
        transform:
          translateY(-3px);
        border-color:
          color-mix(
            in srgb,
            var(--habit-color) 25%,
            transparent
          );
        box-shadow:
          0 20px 55px
          rgba(0,0,0,.2);
      }

      .habit-card-glow {
        position: absolute;
        width: 180px;
        height: 100px;
        right: -80px;
        top: -50px;
        border-radius: 50%;
        background:
          var(--habit-color);
        opacity: .07;
        filter: blur(35px);
      }

      .habit-card-top {
        position: relative;
        z-index: 2;
        display: flex;
        justify-content: space-between;
        padding: 13px 13px 0;
      }

      .habit-icon {
        width: 39px;
        height: 39px;
        display: grid;
        place-items: center;
        color: var(--habit-color);
        border-radius: 11px;
        background:
          color-mix(
            in srgb,
            var(--habit-color) 10%,
            transparent
          );
        border:
          1px solid
          color-mix(
            in srgb,
            var(--habit-color) 13%,
            transparent
          );
      }

      .habit-card-actions {
        display: flex;
        gap: 3px;
      }

      .habit-card-actions button {
        width: 28px;
        height: 28px;
        display: grid;
        place-items: center;
        color: #475569;
        background:
          transparent;
        border: 0;
        border-radius: 7px;
      }

      .habit-card-actions button:hover {
        color: #cbd5e1;
        background:
          rgba(255,255,255,.035);
      }

      .habit-card-actions
      .delete-button:hover {
        color: #f87171;
      }

      .habit-card-content {
        position: relative;
        z-index: 2;
        padding: 12px 13px 13px;
      }

      .habit-title-row {
        display: flex;
        align-items: start;
        justify-content: space-between;
        gap: 8px;
      }

      .habit-title-row h3 {
        max-width: 210px;
        margin: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: #e2e8f0;
        font-size: .7rem;
      }

      .habit-title-row span {
        display: block;
        margin-top: 4px;
        color: #475569;
        font-size: .42rem;
      }

      .completed-badge {
        display: flex;
        align-items: center;
        gap: 4px;
        padding:
          4px 6px;
        color: #6ee7b7;
        background:
          rgba(16,185,129,.06);
        border:
          1px solid
          rgba(52,211,153,.1);
        border-radius: 6px;
        font-size: .39rem;
        font-weight: 900;
      }

      .habit-description {
        min-height: 28px;
        margin:
          9px 0;
        color: #475569;
        font-size: .49rem;
        line-height: 1.5;
      }

      .habit-card-stats {
        display: grid;
        grid-template-columns:
          repeat(3, 1fr);
        padding:
          9px 0;
        border-top:
          1px solid
          rgba(255,255,255,.04);
        border-bottom:
          1px solid
          rgba(255,255,255,.04);
      }

      .habit-card-stats > div {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
      }

      .habit-card-stats svg {
        color: var(--habit-color);
        font-size: 10px;
      }

      .habit-card-stats span {
        color: #cbd5e1;
        font-size: .58rem;
        font-weight: 850;
      }

      .habit-card-stats small {
        color: #334155;
        font-size: .38rem;
      }

      .habit-card-bottom {
        display: flex;
        justify-content: space-between;
        gap: 7px;
        padding: 9px 0;
      }

      .habit-frequency,
      .reminder-label {
        display: flex;
        align-items: center;
        gap: 4px;
        color: #475569;
        font-size: .43rem;
      }

      .habit-frequency svg,
      .reminder-label svg {
        color: #64748b;
        font-size: 9px;
      }

      .reminder-label {
        color: #64748b;
      }

      .habit-check {
        width: 100%;
        height: 37px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        color: #94a3b8;
        background:
          rgba(255,255,255,.025);
        border:
          1px solid
          rgba(255,255,255,.055);
        border-radius: 9px;
        font-size: .48rem;
        font-weight: 850;
        transition: .2s ease;
      }

      .habit-check:hover:not(:disabled) {
        color: white;
        background:
          color-mix(
            in srgb,
            var(--habit-color) 12%,
            transparent
          );
        border-color:
          color-mix(
            in srgb,
            var(--habit-color) 20%,
            transparent
          );
      }

      .habit-check.checked {
        color: #6ee7b7;
        background:
          rgba(16,185,129,.05);
        border-color:
          rgba(52,211,153,.11);
      }

      .check-circle {
        width: 18px;
        height: 18px;
        display: grid;
        place-items: center;
        border-radius: 50%;
        border:
          1px solid
          rgba(148,163,184,.18);
      }

      .checked .check-circle {
        color: white;
        background: #10b981;
        border-color: #10b981;
      }

      .check-circle svg {
        font-size: 9px;
      }

      /* ================================================
         EMPTY
      ================================================ */

      .empty-today,
      .empty-library {
        grid-column: 1 / -1;
        min-height: 190px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 20px;
        border-radius: 16px;
        background:
          rgba(8,15,30,.6);
        border:
          1px dashed
          rgba(148,163,184,.09);
      }

      .empty-today > div,
      .empty-library > div {
        width: 45px;
        height: 45px;
        display: grid;
        place-items: center;
        color: #a78bfa;
        border-radius: 13px;
        background:
          rgba(124,58,237,.08);
      }

      .empty-today h3,
      .empty-library h3 {
        margin:
          10px 0 3px;
        font-size: .7rem;
      }

      .empty-today p,
      .empty-library p {
        margin: 0;
        color: #475569;
        font-size: .48rem;
      }

      .empty-today button,
      .empty-library button {
        display: flex;
        align-items: center;
        gap: 5px;
        margin-top: 12px;
        padding:
          8px 11px;
        color: #c4b5fd;
        background:
          rgba(124,58,237,.08);
        border:
          1px solid
          rgba(167,139,250,.12);
        border-radius: 8px;
        font-size: .46rem;
        font-weight: 850;
      }

      /* ================================================
         MOTIVATION
      ================================================ */

      .motivation-card {
        position: relative;
        display: flex;
        align-items: center;
        gap: 15px;
        margin-top: 35px;
        padding: 22px;
        overflow: hidden;
        border-radius: 20px;
        background:
          radial-gradient(
            circle at 85% 50%,
            rgba(124,58,237,.14),
            transparent 30%
          ),
          linear-gradient(
            120deg,
            rgba(20,15,45,.72),
            rgba(7,13,28,.8)
          );
        border:
          1px solid
          rgba(167,139,250,.09);
      }

      .motivation-icon {
        width: 50px;
        height: 50px;
        display: grid;
        place-items: center;
        flex-shrink: 0;
        color: #fbbf24;
        border-radius: 15px;
        background:
          rgba(251,191,36,.07);
        border:
          1px solid
          rgba(251,191,36,.12);
      }

      .motivation-icon svg {
        font-size: 21px;
      }

      .motivation-card > div:nth-child(2) {
        flex: 1;
      }

      .motivation-card span {
        color: #a78bfa;
        font-size: .43rem;
        font-weight: 900;
        letter-spacing: .8px;
      }

      .motivation-card h2 {
        margin:
          4px 0;
        font-size: 1rem;
      }

      .motivation-card p {
        margin: 0;
        color: #475569;
        font-size: .52rem;
      }

      .motivation-stat {
        text-align: center;
        padding-left: 25px;
        border-left:
          1px solid
          rgba(255,255,255,.06);
      }

      .motivation-stat strong {
        display: block;
        color: #c084fc;
        font-size: 1.7rem;
      }

      .motivation-stat span {
        display: block;
        margin-top: 2px;
        color: #475569;
        font-size: .42rem;
      }

      /* ================================================
         FOOTER
      ================================================ */

      .habits-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 35px;
        padding-top: 18px;
        border-top:
          1px solid
          rgba(255,255,255,.04);
        color: #334155;
        font-size: .45rem;
      }

      .habits-footer > div {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .habits-footer svg {
        color: #a78bfa;
      }

      .footer-status {
        display: flex;
        align-items: center;
        gap: 5px;
      }

      /* ================================================
         MODAL
      ================================================ */

      .habit-modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 100;
        display: grid;
        place-items: center;
        padding: 20px;
        background:
          rgba(2,6,23,.78);
        backdrop-filter:
          blur(15px);
      }

      .habit-modal {
        width:
          min(
            620px,
            100%
          );
        max-height:
          calc(100vh - 40px);
        overflow-y: auto;
        border-radius: 21px;
        background:
          linear-gradient(
            145deg,
            #111827,
            #070d1d
          );
        border:
          1px solid
          rgba(167,139,250,.13);
        box-shadow:
          0 40px 100px
          rgba(0,0,0,.6),
          0 0 50px
          rgba(124,58,237,.08);
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        gap: 20px;
        padding: 23px 23px 16px;
      }

      .modal-eyebrow {
        color: #a78bfa;
        font-size: .44rem;
        font-weight: 900;
        letter-spacing: .9px;
      }

      .modal-header h2 {
        margin:
          5px 0 3px;
        font-size: 1.15rem;
      }

      .modal-header p {
        margin: 0;
        color: #475569;
        font-size: .5rem;
      }

      .icon-button {
        width: 32px;
        height: 32px;
        display: grid;
        place-items: center;
        flex-shrink: 0;
        color: #64748b;
        background:
          rgba(255,255,255,.025);
        border:
          1px solid
          rgba(255,255,255,.06);
        border-radius: 9px;
      }

      .icon-button:hover {
        color: white;
      }

      .habit-modal form {
        padding:
          0 23px 23px;
      }

      .form-grid {
        display: grid;
        grid-template-columns:
          1fr 1fr;
        gap: 12px;
      }

      .form-group {
        min-width: 0;
      }

      .form-group.full {
        grid-column:
          1 / -1;
      }

      .form-group label {
        display: block;
        margin-bottom: 6px;
        color: #64748b;
        font-size: .48rem;
        font-weight: 800;
      }

      .form-group input,
      .form-group textarea,
      .form-group select {
        width: 100%;
        color: #e2e8f0;
        outline: none;
        background:
          rgba(255,255,255,.025);
        border:
          1px solid
          rgba(255,255,255,.07);
        border-radius: 9px;
        font-size: .54rem;
      }

      .form-group input,
      .form-group select {
        height: 39px;
        padding:
          0 10px;
      }

      .form-group textarea {
        resize: vertical;
        padding:
          10px;
        line-height: 1.5;
      }

      .form-group input:focus,
      .form-group textarea:focus,
      .form-group select:focus {
        border-color:
          rgba(167,139,250,.3);
        box-shadow:
          0 0 0 3px
          rgba(124,58,237,.06);
      }

      .select-wrapper {
        position: relative;
      }

      .select-wrapper select {
        appearance: none;
        padding-right: 30px;
      }

      .select-wrapper > svg {
        position: absolute;
        right: 10px;
        top: 50%;
        transform:
          translateY(-50%);
        pointer-events: none;
        color: #475569;
        font-size: 11px;
      }

      .input-icon {
        position: relative;
      }

      .input-icon > svg {
        position: absolute;
        left: 10px;
        top: 50%;
        transform:
          translateY(-50%);
        color: #64748b;
        font-size: 11px;
        pointer-events: none;
      }

      .input-icon input {
        padding-left: 29px;
      }

      .day-selector {
        display: flex;
        gap: 5px;
      }

      .day-selector button {
        width: 34px;
        height: 34px;
        display: grid;
        place-items: center;
        color: #64748b;
        background:
          rgba(255,255,255,.025);
        border:
          1px solid
          rgba(255,255,255,.07);
        border-radius: 8px;
        font-size: .49rem;
        font-weight: 900;
      }

      .day-selector button.day-selected {
        color: white;
        background:
          linear-gradient(
            135deg,
            #7c3aed,
            #2563eb
          );
        border-color:
          transparent;
      }

      .color-selector {
        display: flex;
        gap: 8px;
        align-items: center;
        height: 39px;
      }

      .color-selector button {
        width: 23px;
        height: 23px;
        border-radius: 50%;
        border:
          2px solid
          transparent;
        background:
          var(--habit-color);
      }

      .color-selector button.color-selected {
        border-color: white;
        box-shadow:
          0 0 0 3px
          color-mix(
            in srgb,
            var(--habit-color) 25%,
            transparent
          );
      }

      .form-error {
        margin-top: 12px;
        padding: 9px;
        color: #fca5a5;
        background:
          rgba(239,68,68,.05);
        border:
          1px solid
          rgba(239,68,68,.1);
        border-radius: 8px;
        font-size: .48rem;
      }

      .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 7px;
        margin-top: 18px;
        padding-top: 15px;
        border-top:
          1px solid
          rgba(255,255,255,.05);
      }

      .secondary-button,
      .primary-button {
        height: 37px;
        display: flex;
        align-items: center;
        gap: 6px;
        padding:
          0 13px;
        border-radius: 9px;
        font-size: .5rem;
        font-weight: 850;
      }

      .secondary-button {
        color: #64748b;
        background:
          rgba(255,255,255,.025);
        border:
          1px solid
          rgba(255,255,255,.06);
      }

      .primary-button {
        color: white;
        background:
          linear-gradient(
            135deg,
            #7c3aed,
            #2563eb
          );
        border: 0;
      }

      /* ================================================
         LOADING
      ================================================ */

      .habits-loading {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background:
          radial-gradient(
            circle,
            rgba(124,58,237,.12),
            transparent 35%
          ),
          #020617;
      }

      .loading-orb {
        width: 72px;
        height: 72px;
        display: grid;
        place-items: center;
        color: #c084fc;
        border-radius: 22px;
        background:
          rgba(124,58,237,.09);
        border:
          1px solid
          rgba(167,139,250,.15);
        box-shadow:
          0 0 50px
          rgba(124,58,237,.14);
        animation:
          loadingPulse 2s
          infinite;
      }

      .loading-orb svg {
        font-size: 27px;
      }

      .habits-loading h2 {
        margin:
          17px 0 4px;
        font-size: 1rem;
      }

      .habits-loading p {
        margin: 0;
        color: #475569;
        font-size: .52rem;
      }

      .loading-bar {
        width: 150px;
        height: 3px;
        overflow: hidden;
        margin-top: 17px;
        border-radius: 99px;
        background:
          rgba(255,255,255,.05);
      }

      .loading-bar span {
        display: block;
        width: 50%;
        height: 100%;
        background:
          linear-gradient(
            90deg,
            #7c3aed,
            #22d3ee
          );
        animation:
          loadingMove 1.2s
          infinite;
      }

      .spin {
        animation:
          spin 1s linear infinite;
      }

      /* ================================================
         ANIMATIONS
      ================================================ */

      @keyframes glowFloat {
        0%,100% {
          transform:
            translate(0,0);
        }

        50% {
          transform:
            translate(25px,-25px);
        }
      }

      @keyframes particleMove {
        0%,100% {
          opacity: .2;
          transform:
            translateY(0);
        }

        50% {
          opacity: 1;
          transform:
            translateY(-20px);
        }
      }

      @keyframes spin {
        to {
          transform:
            rotate(360deg);
        }
      }

      @keyframes loadingPulse {
        0%,100% {
          transform:
            scale(1);
        }

        50% {
          transform:
            scale(1.06);
        }
      }

      @keyframes loadingMove {
        from {
          transform:
            translateX(-100%);
        }

        to {
          transform:
            translateX(300%);
        }
      }

      /* ================================================
         RESPONSIVE
      ================================================ */

      @media (max-width: 1100px) {

        .habits-container {
          width:
            calc(100% - 28px);
        }

        .habit-hero {
          padding:
            40px 35px;
        }

        .habit-kpis {
          grid-template-columns:
            repeat(2,1fr);
        }

        .habits-grid {
          grid-template-columns:
            repeat(2,1fr);
        }
      }

      @media (max-width: 800px) {

        .habit-hero {
          min-height: 450px;
        }

        .hero-progress {
          position: absolute;
          right: 20px;
          bottom: 30px;
          transform:
            scale(.8);
          opacity: .6;
        }

        .hero-content {
          max-width: 70%;
        }

        .heatmap {
          grid-template-columns:
            repeat(15,1fr);
        }

        .habits-grid {
          grid-template-columns:
            1fr;
        }
      }

      @media (max-width: 600px) {

        .habits-container {
          width:
            calc(100% - 16px);
        }

        .brand-block {
          transform:
            scale(.9);
          transform-origin:
            left center;
        }

        .sync-status {
          display: none;
        }

        .habit-hero {
          min-height: 480px;
          padding:
            30px 22px;
          border-radius: 20px;
        }

        .hero-content {
          max-width: 100%;
        }

        .hero-content h1 {
          font-size: 3rem;
          letter-spacing: -3px;
        }

        .hero-progress {
          right: 50%;
          bottom: -20px;
          transform:
            translateX(50%)
            scale(.65);
          opacity: .25;
        }

        .habit-kpis {
          grid-template-columns:
            1fr 1fr;
        }

        .kpi-card {
          min-height: 78px;
          padding: 10px;
        }

        .kpi-icon {
          width: 34px;
          height: 34px;
        }

        .section-header {
          align-items: start;
        }

        .heat-legend {
          display: none;
        }

        .heatmap {
          grid-template-columns:
            repeat(10,1fr);
        }

        .activity-footer {
          flex-direction: column;
          gap: 9px;
        }

        .library-toolbar {
          flex-direction: column;
        }

        .category-filter {
          overflow-x: auto;
        }

        .motivation-card {
          align-items: flex-start;
        }

        .motivation-stat {
          display: none;
        }

        .habits-footer {
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
        }

        .form-grid {
          grid-template-columns:
            1fr;
        }

        .form-group.full {
          grid-column:
            auto;
        }

        .habit-modal-backdrop {
          padding: 10px;
        }
      }

      @media (max-width: 400px) {

        .habit-kpis {
          grid-template-columns:
            1fr;
        }

        .hero-content h1 {
          font-size: 2.6rem;
        }

        .today-list {
          grid-template-columns:
            1fr;
        }
      }

    `}</style>
  );
}

export default Habits;