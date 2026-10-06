import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import API from "../../services/api";

/* =========================================================
   HELPERS
========================================================= */

const safeNumber = (value) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
};

const clamp = (
  value,
  min = 0,
  max = 100
) => {
  return Math.min(
    Math.max(
      safeNumber(value),
      min
    ),
    max
  );
};

const formatDate = (date) => {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

const formatTime = (date) => {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};

const formatRelativeTime = (date) => {
  if (!date) return "Recently";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Recently";
  }

  const difference =
    Date.now() -
    parsed.getTime();

  const seconds =
    Math.floor(
      difference / 1000
    );

  if (seconds < 60) {
    return "Just now";
  }

  const minutes =
    Math.floor(
      seconds / 60
    );

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours =
    Math.floor(
      minutes / 60
    );

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days =
    Math.floor(
      hours / 24
    );

  if (days < 7) {
    return `${days}d ago`;
  }

  return formatDate(date);
};

const getActivityIcon = (type) => {
  switch (type) {
    case "NOTE":
      return "🤖";

    case "RESUME":
      return "📄";

    case "INTERVIEW":
      return "🎤";

    case "MOCK_TEST":
      return "📝";

    default:
      return "⚡";
  }
};

const getActivityClass = (type) => {
  switch (type) {
    case "NOTE":
      return "activity-note";

    case "RESUME":
      return "activity-resume";

    case "INTERVIEW":
      return "activity-interview";

    case "MOCK_TEST":
      return "activity-test";

    default:
      return "activity-default";
  }
};

const getScoreClass = (score) => {
  const value = safeNumber(score);

  if (value >= 80) {
    return "score-excellent";
  }

  if (value >= 60) {
    return "score-good";
  }

  if (value >= 40) {
    return "score-average";
  }

  return "score-low";
};

const getScoreLabel = (score) => {
  const value = safeNumber(score);

  if (value >= 80) {
    return "Excellent";
  }

  if (value >= 60) {
    return "Good";
  }

  if (value >= 40) {
    return "Needs Work";
  }

  return "Keep Practicing";
};

const getReadinessMessage = (
  score
) => {
  const value = safeNumber(score);

  if (value === 0) {
    return {
      title: "Your journey starts here",
      description:
        "Complete your first resume analysis, mock test or AI interview to build your readiness score.",
    };
  }

  if (value >= 85) {
    return {
      title: "Interview Ready",
      description:
        "Your current performance shows strong preparation across your completed activities.",
    };
  }

  if (value >= 70) {
    return {
      title: "Strong Progress",
      description:
        "You're building solid preparation. Keep practicing consistently to reach the next level.",
    };
  }

  if (value >= 50) {
    return {
      title: "Good Foundation",
      description:
        "You have started building your preparation. Focus on improving your weaker areas.",
    };
  }

  return {
    title: "Keep Building",
    description:
      "Consistency is the key. Continue practicing and your readiness score will grow.",
  };
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function ProgressTracker() {
  const [analytics, setAnalytics] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [
    selectedActivity,
    setSelectedActivity,
  ] = useState("ALL");

  /*
  |--------------------------------------------------------------------------
  | LOAD ANALYTICS
  |--------------------------------------------------------------------------
  */

  const loadAnalytics =
    useCallback(
      async (
        showLoader = false
      ) => {
        try {
          if (showLoader) {
            setLoading(true);
          } else {
            setRefreshing(true);
          }

          setError("");

          const token =
            localStorage.getItem(
              "token"
            ) ||
            localStorage.getItem(
              "accessToken"
            ) ||
            localStorage.getItem(
              "authToken"
            ) ||
            sessionStorage.getItem(
              "token"
            ) ||
            sessionStorage.getItem(
              "accessToken"
            );

          if (!token) {
            throw new Error(
              "No authentication token found. Please login again."
            );
          }

          const response =
            await API.get(
              "/progress/analytics",
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );

          if (
            response?.data?.success
          ) {
            setAnalytics(
              response.data
            );
          } else {
            throw new Error(
              response?.data
                ?.message ||
                "Unable to load progress analytics."
            );
          }
        } catch (err) {
          console.error(
            "Progress Analytics Error:",
            err
          );

          const message =
            err?.response
              ?.data?.message ||
            err?.message ||
            "Unable to load progress analytics.";

          setError(message);
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      []
    );

  /*
  |--------------------------------------------------------------------------
  | INITIAL LOAD + AUTO REFRESH
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    loadAnalytics(true);

    const interval =
      setInterval(() => {
        loadAnalytics(false);
      }, 5000);

    return () => {
      clearInterval(
        interval
      );
    };
  }, [loadAnalytics]);

  /*
  |--------------------------------------------------------------------------
  | INSTANT CROSS-MODULE REFRESH
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const handleProgressUpdate =
      () => {
        loadAnalytics(false);
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
  }, [loadAnalytics]);

  /*
  |--------------------------------------------------------------------------
  | DATA
  |--------------------------------------------------------------------------
  */

  const overview =
    analytics?.overview || {};

  const notes =
    analytics?.notes || {};

  const resume =
    analytics?.resume || {};

  const interviews =
    analytics?.interviews || {};

  const mockTests =
    analytics?.mockTests || {};

  const streak =
    analytics?.streak || {};

  const weeklyActivity =
    analytics?.weeklyActivity || [];

  const recentActivity =
    analytics?.recentActivity || [];

  const readinessScore =
    clamp(
      overview.readinessScore
    );

  /*
  |--------------------------------------------------------------------------
  | READINESS
  |--------------------------------------------------------------------------
  */

  const readiness =
    useMemo(
      () =>
        getReadinessMessage(
          readinessScore
        ),
      [readinessScore]
    );

  /*
  |--------------------------------------------------------------------------
  | WEEKLY TOTAL
  |--------------------------------------------------------------------------
  */

  const weeklyTotal =
    useMemo(() => {
      return weeklyActivity.reduce(
        (total, item) =>
          total +
          safeNumber(
            item?.total
          ),
        0
      );
    }, [weeklyActivity]);

  const maxWeeklyActivity =
    useMemo(() => {
      const values =
        weeklyActivity.map(
          (item) =>
            safeNumber(
              item?.total
            )
        );

      return Math.max(
        ...values,
        1
      );
    }, [weeklyActivity]);

  /*
  |--------------------------------------------------------------------------
  | ACTIVITY FILTER
  |--------------------------------------------------------------------------
  */

  const filteredActivities =
    useMemo(() => {
      if (
        selectedActivity ===
        "ALL"
      ) {
        return recentActivity;
      }

      return recentActivity.filter(
        (activity) =>
          activity.type ===
          selectedActivity
      );
    }, [
      recentActivity,
      selectedActivity,
    ]);

  /*
  |--------------------------------------------------------------------------
  | LAST UPDATED
  |--------------------------------------------------------------------------
  */

  const latestUpdated =
    analytics?.updatedAt
      ? `${formatDate(
          analytics.updatedAt
        )} ${formatTime(
          analytics.updatedAt
        )}`
      : "Not available";

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="progress-page">
        <ProgressStyles />

        <div className="loading-background">
          <div className="loading-orb orb-one" />
          <div className="loading-orb orb-two" />
          <div className="loading-orb orb-three" />
        </div>

        <main className="progress-container">
          <div className="advanced-loader">
            <div className="loader-ring">
              <div className="loader-core">
                ⚡
              </div>
            </div>

            <div className="loader-status">
              <span className="loader-live-dot" />
              LIVE ANALYTICS ENGINE
            </div>

            <h2>
              Analyzing your progress
            </h2>

            <p>
              Synchronizing your
              notes, resumes,
              interviews and mock
              test performance.
            </p>

            <div className="loader-track">
              <div className="loader-progress" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | ERROR
  |--------------------------------------------------------------------------
  */

  if (
    error &&
    !analytics
  ) {
    return (
      <div className="progress-page">
        <ProgressStyles />

        <main className="progress-container">
          <div className="error-screen">
            <div className="error-glow" />

            <div className="error-icon">
              !
            </div>

            <span className="error-kicker">
              ANALYTICS ERROR
            </span>

            <h2>
              Unable to load progress
            </h2>

            <p>
              {error}
            </p>

            <button
              className="primary-action"
              onClick={() =>
                loadAnalytics(true)
              }
            >
              <span>↻</span>
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="progress-page">
      <ProgressStyles />

      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="background-grid" />

      <div className="background-noise" />

      <div className="background-glow glow-blue" />

      <div className="background-glow glow-purple" />

      <div className="background-glow glow-cyan" />

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="progress-container">

        {/* =====================================================
            HERO HEADER
        ===================================================== */}

        <section className="hero-section">

          <div className="hero-top">

            <div className="brand-block">

              <div className="brand-logo">
                <span>⚡</span>
              </div>

              <div>
                <div className="brand-title">
                  PrepPulse
                  <span>AI</span>
                </div>

                <div className="brand-subtitle">
                  Career Intelligence Platform
                </div>
              </div>

            </div>

            <div className="hero-actions">

              <div className="live-indicator">
                <span className="live-pulse" />
                <span>LIVE</span>
                <small>
                  Real-time
                </small>
              </div>

              <button
                className={`refresh-action ${
                  refreshing
                    ? "is-refreshing"
                    : ""
                }`}
                onClick={() =>
                  loadAnalytics(false)
                }
                title="Refresh analytics"
              >
                <span>↻</span>
              </button>

            </div>

          </div>

          <div className="hero-content">

            <div className="hero-copy">

              <div className="hero-eyebrow">
                <span />
                YOUR PERFORMANCE CENTER
              </div>

              <h1>
                Progress
                <strong>
                  Analytics
                </strong>
              </h1>

              <p>
                A real-time view of
                everything you're
                accomplishing across
                PrepPulse.
              </p>

              <div className="hero-tags">

                <span>
                  <i>●</i>
                  Live Sync
                </span>

                <span>
                  <i>✓</i>
                  Personal Data
                </span>

                <span>
                  <i>↗</i>
                  Performance Tracking
                </span>

              </div>

            </div>

            {/* READINESS HERO */}

            <div className="hero-readiness">

              <div className="hero-readiness-ring">

                <CircularScore
                  value={
                    readinessScore
                  }
                  size={210}
                  stroke={10}
                />

                <div className="hero-score-center">
                  <strong>
                    {readinessScore}
                  </strong>

                  <span>
                    / 100
                  </span>

                  <small>
                    READINESS
                  </small>
                </div>

              </div>

              <div className="hero-readiness-text">

                <span className="mini-label">
                  CURRENT STATUS
                </span>

                <h3>
                  {readiness.title}
                </h3>

                <p>
                  {readiness.description}
                </p>

              </div>

            </div>

          </div>

          {/* UPDATE BAR */}

          <div className="hero-update">

            <div>
              <span className="sync-dot" />
              Analytics automatically
              sync with your activity.
            </div>

            <div>
              Last sync:
              <strong>
                {latestUpdated}
              </strong>
            </div>

          </div>

        </section>

        {/* =====================================================
            KPI CARDS
        ===================================================== */}

        <section className="metrics-grid">

          <MetricCard
            icon="🤖"
            label="AI Notes"
            value={
              safeNumber(
                overview.notesGenerated
              )
            }
            description="Notes generated"
            accent="cyan"
            secondary={
              <>
                <span>
                  <strong>
                    {safeNumber(
                      notes.today
                    )}
                  </strong>
                  today
                </span>

                <span className="separator">
                  /
                </span>

                <span>
                  <strong>
                    {safeNumber(
                      notes.thisWeek
                    )}
                  </strong>
                  this week
                </span>
              </>
            }
          />

          <MetricCard
            icon="📄"
            label="Resume"
            value={
              safeNumber(
                overview.resumesAnalyzed
              )
            }
            description="Analyses completed"
            accent="purple"
            secondary={
              <>
                <span>
                  Avg{" "}
                  <strong>
                    {safeNumber(
                      resume.averageScore
                    )}
                    %
                  </strong>
                </span>

                <span className="separator">
                  /
                </span>

                <span>
                  Best{" "}
                  <strong>
                    {safeNumber(
                      resume.bestScore
                    )}
                    %
                  </strong>
                </span>
              </>
            }
          />

          <MetricCard
            icon="🎤"
            label="Interviews"
            value={
              safeNumber(
                overview.interviewsAttended
              )
            }
            description="Completed"
            accent="pink"
            secondary={
              <>
                <span>
                  Avg{" "}
                  <strong>
                    {safeNumber(
                      interviews.averageScore
                    )}
                    %
                  </strong>
                </span>

                <span className="separator">
                  /
                </span>

                <span>
                  Best{" "}
                  <strong>
                    {safeNumber(
                      interviews.bestScore
                    )}
                    %
                  </strong>
                </span>
              </>
            }
          />

          <MetricCard
            icon="📝"
            label="Mock Tests"
            value={
              safeNumber(
                overview.mockTestsAttempted
              )
            }
            description="Tests completed"
            accent="orange"
            secondary={
              <>
                <span>
                  Avg{" "}
                  <strong>
                    {safeNumber(
                      mockTests.averageScore
                    )}
                    %
                  </strong>
                </span>

                <span className="separator">
                  /
                </span>

                <span>
                  Passed{" "}
                  <strong>
                    {safeNumber(
                      mockTests.passed
                    )}
                  </strong>
                </span>
              </>
            }
          />

          <MetricCard
            icon="🔥"
            label="Daily Streak"
            value={
              safeNumber(
                streak.current
              )
            }
            description={
              safeNumber(
                streak.current
              ) === 1
                ? "Day active"
                : "Days active"
            }
            accent="fire"
            secondary={
              <>
                <span>
                  Best{" "}
                  <strong>
                    {safeNumber(
                      streak.longest
                    )}
                  </strong>
                </span>

                <span className="separator">
                  /
                </span>

                <span>
                  {streak.loggedInToday
                    ? "Active today"
                    : "Login today"}
                </span>
              </>
            }
          />

        </section>

        {/* =====================================================
            WEEKLY + STREAK
        ===================================================== */}

        <section className="main-grid">

          {/* WEEKLY ACTIVITY */}

          <div className="glass-card weekly-card">

            <CardHeader
              eyebrow="ACTIVITY ENGINE"
              title="Weekly Activity"
              description="Your activity across the last 7 days."
              icon="📊"
            />

            <div className="weekly-summary">

              <div>
                <span>
                  TOTAL ACTIVITIES
                </span>

                <strong>
                  {weeklyTotal}
                </strong>
              </div>

              <div className="weekly-trend">
                <span className="trend-icon">
                  ↗
                </span>

                <div>
                  <strong>
                    Live tracking
                  </strong>

                  <small>
                    Activity sync enabled
                  </small>
                </div>
              </div>

            </div>

            <div className="activity-chart">

              {weeklyActivity.length ===
              0 ? (
                <EmptyState
                  icon="📊"
                  title="No activity yet"
                  description="Start using PrepPulse to build your activity graph."
                />
              ) : (
                <>

                  <div className="chart-lines">
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>

                  <div className="bars-container">

                    {weeklyActivity.map(
                      (
                        day,
                        index
                      ) => {
                        const total =
                          safeNumber(
                            day.total
                          );

                        const height =
                          total === 0
                            ? 4
                            : Math.max(
                                10,
                                (total /
                                  maxWeeklyActivity) *
                                  100
                              );

                        return (
                          <div
                            className="bar-column"
                            key={`${day.date}-${index}`}
                          >

                            <div className="bar-tooltip">
                              {total}{" "}
                              activities
                            </div>

                            <div className="bar-value">
                              {total}
                            </div>

                            <div className="bar-track">

                              <div
                                className="activity-bar"
                                style={{
                                  height: `${height}%`,
                                }}
                              >
                                <div className="bar-shimmer" />
                              </div>

                            </div>

                            <span className="bar-day">
                              {day.label}
                            </span>

                          </div>
                        );
                      }
                    )}

                  </div>

                </>
              )}

            </div>

            <div className="activity-legend">

              <Legend
                icon="🤖"
                label="Notes"
              />

              <Legend
                icon="📄"
                label="Resumes"
              />

              <Legend
                icon="🎤"
                label="Interviews"
              />

              <Legend
                icon="📝"
                label="Tests"
              />

            </div>

          </div>

          {/* STREAK CARD */}

          <div className="glass-card streak-panel">

            <div className="streak-background">
              <div />
              <div />
              <div />
            </div>

            <div className="streak-header">

              <div>
                <span className="card-eyebrow">
                  CONSISTENCY
                </span>

                <h2>
                  Daily Streak
                </h2>

                <p>
                  Keep showing up
                  every day.
                </p>
              </div>

              <div className="streak-fire">
                🔥
              </div>

            </div>

            <div className="streak-main">

              <div className="streak-number">
                <strong>
                  {safeNumber(
                    streak.current
                  )}
                </strong>

                <span>
                  DAYS
                </span>
              </div>

              <div
                className={
                  streak.loggedInToday
                    ? "today-status active"
                    : "today-status"
                }
              >
                <span />
                {streak.loggedInToday
                  ? "You're active today"
                  : "Login today to continue"}
              </div>

            </div>

            <div className="streak-stats">

              <div>
                <span>
                  🏆
                </span>

                <div>
                  <small>
                    LONGEST
                  </small>

                  <strong>
                    {safeNumber(
                      streak.longest
                    )}{" "}
                    days
                  </strong>
                </div>
              </div>

              <div>
                <span>
                  📅
                </span>

                <div>
                  <small>
                    TOTAL DAYS
                  </small>

                  <strong>
                    {safeNumber(
                      streak.totalLoginDays
                    )}
                  </strong>
                </div>
              </div>

            </div>

            <div className="streak-message">
              {streak.loggedInToday
                ? "Great work. Your streak is protected for today."
                : "One login today keeps your current streak alive."}
            </div>

          </div>

        </section>

        {/* =====================================================
            PERFORMANCE OVERVIEW
        ===================================================== */}

        <section className="glass-card performance-card">

          <CardHeader
            eyebrow="PERFORMANCE MATRIX"
            title="Performance Overview"
            description="How you're performing across your preparation areas."
            icon="🎯"
          />

          <div className="performance-layout">

            <div className="performance-bars">

              <PerformanceBar
                icon="📄"
                label="Resume Analysis"
                value={
                  resume.averageScore
                }
                count={
                  resume.total
                }
                accent="purple"
              />

              <PerformanceBar
                icon="📝"
                label="Mock Tests"
                value={
                  mockTests.averageScore
                }
                count={
                  mockTests.total
                }
                accent="orange"
              />

              <PerformanceBar
                icon="🎤"
                label="AI Interviews"
                value={
                  interviews.averageScore
                }
                count={
                  interviews.total
                }
                accent="pink"
              />

            </div>

            <div className="performance-readiness">

              <CircularScore
                value={
                  readinessScore
                }
                size={170}
                stroke={9}
              />

              <div className="performance-score-center">
                <strong>
                  {readinessScore}
                </strong>

                <span>
                  %
                </span>

                <small>
                  READINESS
                </small>
              </div>

              <h3>
                {readiness.title}
              </h3>

              <p>
                {readiness.description}
              </p>

            </div>

          </div>

        </section>

        {/* =====================================================
            INTERVIEW PERFORMANCE
        ===================================================== */}

        <section className="glass-card interview-performance">

          <CardHeader
            eyebrow="AI INTERVIEW INTELLIGENCE"
            title="Interview Performance"
            description="Your latest AI interview evaluation averages."
            icon="🎤"
          />

          <div className="interview-grid">

            <ScoreTile
              label="Overall"
              value={
                interviews.averageScore
              }
              icon="🎯"
              accent="cyan"
            />

            <ScoreTile
              label="Technical"
              value={
                interviews.technicalScore
              }
              icon="💻"
              accent="purple"
            />

            <ScoreTile
              label="Communication"
              value={
                interviews.communicationScore
              }
              icon="💬"
              accent="pink"
            />

            <ScoreTile
              label="Confidence"
              value={
                interviews.confidenceScore
              }
              icon="🔥"
              accent="orange"
            />

          </div>

          {interviews.total === 0 && (
            <EmptyState
              compact
              icon="🎤"
              title="No completed interviews yet"
              description="Complete an AI mock interview to see your interview performance here."
            />
          )}

        </section>

        {/* =====================================================
            MOCK TEST SUMMARY
        ===================================================== */}

        <section className="summary-grid">

          <SummaryCard
            icon="🏆"
            label="Best Score"
            value={`${safeNumber(
              mockTests.bestScore
            )}%`}
            description="Highest mock test performance"
            accent="gold"
          />

          <SummaryCard
            icon="✅"
            label="Passed"
            value={
              safeNumber(
                mockTests.passed
              )
            }
            description="Successfully passed tests"
            accent="green"
          />

          <SummaryCard
            icon="❌"
            label="Failed"
            value={
              safeNumber(
                mockTests.failed
              )
            }
            description="Tests requiring improvement"
            accent="red"
          />

          <SummaryCard
            icon="📊"
            label="Average"
            value={`${safeNumber(
              mockTests.averageScore
            )}%`}
            description="Overall mock test average"
            accent="blue"
          />

        </section>

        {/* =====================================================
            RECENT ACTIVITY
        ===================================================== */}

        <section className="glass-card activity-card">

          <div className="activity-header">

            <CardHeader
              eyebrow="LIVE TIMELINE"
              title="Recent Activity"
              description="Your latest PrepPulse actions appear automatically."
              icon="⚡"
            />

            <div className="activity-filters">

              {[
                ["ALL", "All"],
                ["NOTE", "Notes"],
                ["RESUME", "Resumes"],
                ["INTERVIEW", "Interviews"],
                ["MOCK_TEST", "Tests"],
              ].map(
                ([value, label]) => (
                  <button
                    key={value}
                    className={
                      selectedActivity ===
                      value
                        ? "filter active"
                        : "filter"
                    }
                    onClick={() =>
                      setSelectedActivity(
                        value
                      )
                    }
                  >
                    {label}
                  </button>
                )
              )}

            </div>

          </div>

          {filteredActivities.length ===
          0 ? (
            <EmptyState
              icon="🚀"
              title={
                selectedActivity ===
                "ALL"
                  ? "Your journey starts here"
                  : "No matching activity"
              }
              description={
                selectedActivity ===
                "ALL"
                  ? "Generate notes, analyze your resume, attend an AI interview or complete a mock test."
                  : "Complete this type of activity to see it in your timeline."
              }
            />
          ) : (
            <div className="timeline">

              {filteredActivities.map(
                (
                  activity,
                  index
                ) => {
                  const score =
                    activity.score !==
                      null &&
                    activity.score !==
                      undefined
                      ? safeNumber(
                          activity.score
                        )
                      : null;

                  return (
                    <div
                      className="timeline-item"
                      key={`${activity.type}-${activity.date}-${index}`}
                    >

                      <div
                        className={`timeline-icon ${getActivityClass(
                          activity.type
                        )}`}
                      >
                        {getActivityIcon(
                          activity.type
                        )}
                      </div>

                      {index !==
                        filteredActivities.length -
                          1 && (
                        <div className="timeline-connector" />
                      )}

                      <div className="timeline-content">

                        <div className="timeline-main">

                          <div className="timeline-title-area">

                            <span className="timeline-type">
                              {activity.type ===
                              "NOTE"
                                ? "AI NOTES"
                                : activity.type ===
                                  "RESUME"
                                ? "RESUME"
                                : activity.type ===
                                  "INTERVIEW"
                                ? "INTERVIEW"
                                : "MOCK TEST"}
                            </span>

                            <h3>
                              {activity.title ||
                                "PrepPulse Activity"}
                            </h3>

                            <p>
                              {
                                activity.subtitle
                              }
                            </p>

                          </div>

                          {score !==
                            null && (
                            <div
                              className={`timeline-score ${getScoreClass(
                                score
                              )}`}
                            >
                              <strong>
                                {score}
                              </strong>

                              <span>
                                %
                              </span>
                            </div>
                          )}

                        </div>

                        <div className="timeline-meta">

                          <span>
                            🕒{" "}
                            {formatRelativeTime(
                              activity.date
                            )}
                          </span>

                          <span>
                            {formatDate(
                              activity.date
                            )}
                          </span>

                          {score !==
                            null && (
                            <span
                              className={`score-label ${getScoreClass(
                                score
                              )}`}
                            >
                              {getScoreLabel(
                                score
                              )}
                            </span>
                          )}

                        </div>

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          )}

        </section>

        {/* =====================================================
            FOOTER
        ===================================================== */}

        <footer className="progress-footer">

          <div className="footer-brand">
            <span className="footer-dot" />
            PrepPulse Progress Engine
          </div>

          <div>
            Real-time analytics
            <span>•</span>
            Personal performance data
            <span>•</span>
            Auto synchronized
          </div>

        </footer>

      </main>
    </div>
  );
}

/* =========================================================
   METRIC CARD
========================================================= */

function MetricCard({
  icon,
  label,
  value,
  description,
  secondary,
  accent,
}) {
  return (
    <div
      className={`metric-card metric-${accent}`}
    >

      <div className="metric-card-glow" />

      <div className="metric-top">

        <div className="metric-icon">
          {icon}
        </div>

        <div className="metric-label">
          {label}
        </div>

        <span className="metric-live" />

      </div>

      <div className="metric-value">
        {value}
      </div>

      <div className="metric-description">
        {description}
      </div>

      <div className="metric-secondary">
        {secondary}
      </div>

      <div className="metric-progress">
        <span />
      </div>

    </div>
  );
}

/* =========================================================
   CARD HEADER
========================================================= */

function CardHeader({
  eyebrow,
  title,
  description,
  icon,
}) {
  return (
    <div className="card-header">

      <div>

        <span className="card-eyebrow">
          {eyebrow}
        </span>

        <h2>
          {title}
        </h2>

        <p>
          {description}
        </p>

      </div>

      <div className="card-header-icon">
        {icon}
      </div>

    </div>
  );
}

/* =========================================================
   CIRCULAR SCORE
========================================================= */

function CircularScore({
  value,
  size = 160,
  stroke = 9,
}) {
  const percentage =
    clamp(value);

  const radius =
    (size - stroke) /
    2;

  const circumference =
    2 *
    Math.PI *
    radius;

  const offset =
    circumference -
    (percentage /
      100) *
      circumference;

  return (
    <svg
      width={size}
      height={size}
      className="score-ring"
      viewBox={`0 0 ${size} ${size}`}
    >

      <defs>

        <linearGradient
          id={`scoreGradient-${size}`}
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop
            offset="0%"
            stopColor="#22d3ee"
          />

          <stop
            offset="50%"
            stopColor="#6366f1"
          />

          <stop
            offset="100%"
            stopColor="#a855f7"
          />
        </linearGradient>

      </defs>

      <circle
        className="score-ring-background"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={stroke}
      />

      <circle
        className="score-ring-progress"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={`url(#scoreGradient-${size})`}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={
          circumference
        }
        strokeDashoffset={
          offset
        }
      />

    </svg>
  );
}

/* =========================================================
   PERFORMANCE BAR
========================================================= */

function PerformanceBar({
  icon,
  label,
  value,
  count,
  accent,
}) {
  const percentage =
    clamp(value);

  return (
    <div className="performance-row">

      <div className="performance-info">

        <div className="performance-title">

          <div
            className={`performance-icon performance-${accent}`}
          >
            {icon}
          </div>

          <div>

            <strong>
              {label}
            </strong>

            <small>
              {safeNumber(
                count
              )}{" "}
              {safeNumber(
                count
              ) === 1
                ? "activity"
                : "activities"}
            </small>

          </div>

        </div>

        <strong className="performance-value">
          {percentage}%
        </strong>

      </div>

      <div className="performance-track">

        <div
          className={`performance-fill performance-fill-${accent}`}
          style={{
            width: `${percentage}%`,
          }}
        />

      </div>

    </div>
  );
}

/* =========================================================
   SCORE TILE
========================================================= */

function ScoreTile({
  label,
  value,
  icon,
  accent,
}) {
  const score =
    clamp(value);

  return (
    <div
      className={`score-tile score-tile-${accent}`}
    >

      <div className="score-tile-top">

        <div className="score-tile-icon">
          {icon}
        </div>

        <span>
          {label}
        </span>

      </div>

      <div className="score-tile-score">

        <strong>
          {score}
        </strong>

        <span>
          %
        </span>

      </div>

      <div className="score-tile-track">

        <span
          style={{
            width: `${score}%`,
          }}
        />

      </div>

      <small>
        {getScoreLabel(
          score
        )}
      </small>

    </div>
  );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  icon,
  label,
  value,
  description,
  accent,
}) {
  return (
    <div
      className={`summary-card summary-${accent}`}
    >

      <div className="summary-icon">
        {icon}
      </div>

      <div className="summary-content">

        <span>
          {label}
        </span>

        <strong>
          {value}
        </strong>

        <small>
          {description}
        </small>

      </div>

    </div>
  );
}

/* =========================================================
   LEGEND
========================================================= */

function Legend({
  icon,
  label,
}) {
  return (
    <div className="legend-item">
      <span>
        {icon}
      </span>

      <small>
        {label}
      </small>
    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  icon,
  title,
  description,
  compact = false,
}) {
  return (
    <div
      className={`empty-state ${
        compact
          ? "empty-compact"
          : ""
      }`}
    >

      <div className="empty-icon">
        {icon}
      </div>

      <h3>
        {title}
      </h3>

      <p>
        {description}
      </p>

    </div>
  );
}

/* =========================================================
   STYLES
========================================================= */

function ProgressStyles() {
  return (
    <style>{`

      * {
        box-sizing: border-box;
      }

      .progress-page {
        min-height: 100vh;
        position: relative;
        overflow-x: hidden;
        background:
          radial-gradient(
            circle at 15% 5%,
            rgba(34, 211, 238, 0.07),
            transparent 25%
          ),
          radial-gradient(
            circle at 85% 15%,
            rgba(168, 85, 247, 0.08),
            transparent 30%
          ),
          #050914;
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

      .progress-page button {
        font: inherit;
      }

      .background-grid {
        position: fixed;
        inset: 0;
        pointer-events: none;
        opacity: 0.28;
        background-image:
          linear-gradient(
            rgba(148, 163, 184, 0.045) 1px,
            transparent 1px
          ),
          linear-gradient(
            90deg,
            rgba(148, 163, 184, 0.045) 1px,
            transparent 1px
          );
        background-size: 55px 55px;
        mask-image:
          linear-gradient(
            to bottom,
            black,
            transparent 90%
          );
      }

      .background-noise {
        position: fixed;
        inset: 0;
        pointer-events: none;
        opacity: 0.025;
        background-image:
          url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.7'/%3E%3C/svg%3E");
      }

      .background-glow {
        position: fixed;
        width: 500px;
        height: 500px;
        border-radius: 50%;
        filter: blur(120px);
        opacity: 0.12;
        pointer-events: none;
      }

      .glow-blue {
        background: #2563eb;
        top: -250px;
        left: -180px;
      }

      .glow-purple {
        background: #9333ea;
        right: -220px;
        top: 25%;
      }

      .glow-cyan {
        background: #06b6d4;
        bottom: -300px;
        left: 35%;
      }

      .progress-container {
        position: relative;
        z-index: 2;
        width: min(
          calc(100% - 48px),
          1480px
        );
        margin: 0 auto;
        padding: 34px 0 70px;
      }

      /* =====================================================
         HERO
      ===================================================== */

      .hero-section {
        position: relative;
        overflow: hidden;
        margin-bottom: 18px;
        padding: 24px;
        border: 1px solid rgba(
          148,
          163,
          184,
          0.13
        );
        border-radius: 30px;
        background:
          linear-gradient(
            135deg,
            rgba(15, 23, 42, 0.91),
            rgba(7, 12, 26, 0.78)
          );
        box-shadow:
          0 25px 80px rgba(
            0,
            0,
            0,
            0.35
          ),
          inset 0 1px 0 rgba(
            255,
            255,
            255,
            0.045
          );
        backdrop-filter: blur(22px);
      }

      .hero-section::before {
        content: "";
        position: absolute;
        inset: 0;
        pointer-events: none;
        background:
          radial-gradient(
            circle at 85% 30%,
            rgba(99, 102, 241, 0.14),
            transparent 35%
          ),
          radial-gradient(
            circle at 15% 80%,
            rgba(34, 211, 238, 0.08),
            transparent 30%
          );
      }

      .hero-top {
        position: relative;
        z-index: 2;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 20px;
      }

      .brand-block {
        display: flex;
        align-items: center;
        gap: 13px;
      }

      .brand-logo {
        width: 46px;
        height: 46px;
        display: grid;
        place-items: center;
        border-radius: 15px;
        background:
          linear-gradient(
            135deg,
            rgba(34, 211, 238, 0.17),
            rgba(99, 102, 241, 0.19)
          );
        border: 1px solid rgba(
          103,
          232,
          249,
          0.18
        );
        box-shadow:
          0 0 30px rgba(
            34,
            211,
            238,
            0.08
          );
      }

      .brand-logo span {
        font-size: 21px;
      }

      .brand-title {
        font-size: 17px;
        font-weight: 800;
        letter-spacing: -0.03em;
      }

      .brand-title span {
        margin-left: 5px;
        color: #67e8f9;
      }

      .brand-subtitle {
        margin-top: 2px;
        color: #64748b;
        font-size: 10px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .hero-actions {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .live-indicator {
        display: flex;
        align-items: center;
        gap: 8px;
        height: 38px;
        padding: 0 13px;
        border: 1px solid rgba(
          34,
          197,
          94,
          0.18
        );
        border-radius: 999px;
        background: rgba(
          34,
          197,
          94,
          0.06
        );
        color: #86efac;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 0.1em;
      }

      .live-indicator small {
        padding-left: 7px;
        color: #64748b;
        border-left: 1px solid rgba(
          148,
          163,
          184,
          0.18
        );
        font-weight: 500;
        letter-spacing: 0;
      }

      .live-pulse,
      .sync-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #22c55e;
        box-shadow:
          0 0 0 5px rgba(
            34,
            197,
            94,
            0.08
          ),
          0 0 16px rgba(
            34,
            197,
            94,
            0.7
          );
        animation: livePulse 1.8s infinite;
      }

      .refresh-action {
        width: 38px;
        height: 38px;
        display: grid;
        place-items: center;
        border: 1px solid rgba(
          148,
          163,
          184,
          0.14
        );
        border-radius: 12px;
        background: rgba(
          255,
          255,
          255,
          0.035
        );
        color: #cbd5e1;
        cursor: pointer;
        transition: 0.25s ease;
      }

      .refresh-action:hover {
        transform: translateY(-2px);
        border-color: rgba(
          34,
          211,
          238,
          0.35
        );
        color: #67e8f9;
        background: rgba(
          34,
          211,
          238,
          0.07
        );
      }

      .refresh-action span {
        font-size: 19px;
      }

      .refresh-action.is-refreshing span {
        animation: spin 0.8s linear infinite;
      }

      .hero-content {
        position: relative;
        z-index: 2;
        display: grid;
        grid-template-columns:
          minmax(0, 1.2fr)
          minmax(350px, 0.8fr);
        gap: 40px;
        align-items: center;
        padding: 55px 25px 48px;
      }

      .hero-eyebrow,
      .card-eyebrow {
        display: flex;
        align-items: center;
        gap: 9px;
        color: #64748b;
        font-size: 9px;
        font-weight: 800;
        letter-spacing: 0.17em;
      }

      .hero-eyebrow span {
        width: 26px;
        height: 1px;
        background: linear-gradient(
          90deg,
          #22d3ee,
          transparent
        );
      }

      .hero-copy h1 {
        margin: 14px 0 12px;
        font-size: clamp(
          45px,
          6vw,
          76px
        );
        line-height: 0.98;
        letter-spacing: -0.065em;
        font-weight: 800;
      }

      .hero-copy h1 strong {
        display: block;
        background:
          linear-gradient(
            100deg,
            #f8fafc 10%,
            #67e8f9 48%,
            #a78bfa 85%
          );
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
      }

      .hero-copy > p {
        max-width: 590px;
        margin: 0;
        color: #94a3b8;
        font-size: 15px;
        line-height: 1.7;
      }

      .hero-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 25px;
      }

      .hero-tags span {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 11px;
        border: 1px solid rgba(
          148,
          163,
          184,
          0.1
        );
        border-radius: 999px;
        background: rgba(
          255,
          255,
          255,
          0.025
        );
        color: #94a3b8;
        font-size: 10px;
      }

      .hero-tags i {
        color: #67e8f9;
        font-style: normal;
      }

      .hero-readiness {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 20px;
      }

      .hero-readiness-ring {
        position: relative;
        flex: 0 0 auto;
        width: 210px;
        height: 210px;
      }

      .score-ring {
        transform: rotate(-90deg);
        overflow: visible;
      }

      .score-ring-background {
        stroke: rgba(
          148,
          163,
          184,
          0.08
        );
      }

      .score-ring-progress {
        filter:
          drop-shadow(
            0 0 9px
            rgba(
              34,
              211,
              238,
              0.28
            )
          );
        transition:
          stroke-dashoffset
          1s ease;
      }

      .hero-score-center {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }

      .hero-score-center strong {
        font-size: 47px;
        line-height: 1;
        letter-spacing: -0.06em;
      }

      .hero-score-center span {
        margin-top: 3px;
        color: #64748b;
        font-size: 11px;
      }

      .hero-score-center small {
        margin-top: 8px;
        color: #67e8f9;
        font-size: 8px;
        font-weight: 800;
        letter-spacing: 0.17em;
      }

      .hero-readiness-text {
        max-width: 190px;
      }

      .mini-label {
        color: #64748b;
        font-size: 8px;
        font-weight: 800;
        letter-spacing: 0.16em;
      }

      .hero-readiness-text h3 {
        margin: 8px 0;
        font-size: 20px;
      }

      .hero-readiness-text p {
        margin: 0;
        color: #64748b;
        font-size: 11px;
        line-height: 1.65;
      }

      .hero-update {
        position: relative;
        z-index: 2;
        display: flex;
        justify-content: space-between;
        gap: 15px;
        padding: 13px 15px;
        border-top: 1px solid rgba(
          148,
          163,
          184,
          0.08
        );
        color: #64748b;
        font-size: 10px;
      }

      .hero-update > div {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .hero-update strong {
        color: #cbd5e1;
        margin-left: 4px;
      }

      /* =====================================================
         METRICS
      ===================================================== */

      .metrics-grid {
        display: grid;
        grid-template-columns:
          repeat(5, minmax(0, 1fr));
        gap: 13px;
        margin-bottom: 13px;
      }

      .metric-card {
        position: relative;
        min-height: 190px;
        overflow: hidden;
        padding: 20px;
        border: 1px solid rgba(
          148,
          163,
          184,
          0.13
        );
        border-radius: 22px;
        background:
          linear-gradient(
            145deg,
            rgba(15, 23, 42, 0.9),
            rgba(7, 12, 24, 0.82)
          );
        box-shadow:
          0 15px 50px rgba(
            0,
            0,
            0,
            0.19
          ),
          inset 0 1px 0 rgba(
            255,
            255,
            255,
            0.035
          );
        transition:
          transform 0.25s ease,
          border-color 0.25s ease;
      }

      .metric-card:hover {
        transform: translateY(-5px);
        border-color: rgba(
          148,
          163,
          184,
          0.23
        );
      }

      .metric-card-glow {
        position: absolute;
        width: 150px;
        height: 150px;
        right: -70px;
        bottom: -80px;
        border-radius: 50%;
        filter: blur(40px);
        opacity: 0.2;
      }

      .metric-cyan
        .metric-card-glow {
        background: #06b6d4;
      }

      .metric-purple
        .metric-card-glow {
        background: #9333ea;
      }

      .metric-pink
        .metric-card-glow {
        background: #ec4899;
      }

      .metric-orange
        .metric-card-glow {
        background: #f97316;
      }

      .metric-fire
        .metric-card-glow {
        background: #ef4444;
      }

      .metric-top {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .metric-icon {
        width: 42px;
        height: 42px;
        display: grid;
        place-items: center;
        border-radius: 13px;
        background: rgba(
          255,
          255,
          255,
          0.045
        );
        border: 1px solid rgba(
          255,
          255,
          255,
          0.07
        );
        font-size: 19px;
      }

      .metric-label {
        color: #cbd5e1;
        font-size: 12px;
        font-weight: 700;
      }

      .metric-live {
        width: 5px;
        height: 5px;
        margin-left: auto;
        border-radius: 50%;
        background: #22c55e;
        box-shadow:
          0 0 10px
          rgba(
            34,
            197,
            94,
            0.8
          );
      }

      .metric-value {
        margin-top: 25px;
        font-size: 42px;
        line-height: 1;
        font-weight: 800;
        letter-spacing: -0.055em;
      }

      .metric-description {
        margin-top: 7px;
        color: #64748b;
        font-size: 10px;
      }

      .metric-secondary {
        display: flex;
        align-items: center;
        gap: 7px;
        margin-top: 18px;
        color: #64748b;
        font-size: 9px;
      }

      .metric-secondary strong {
        color: #cbd5e1;
        font-weight: 700;
      }

      .separator {
        color: #334155;
      }

      .metric-progress {
        position: absolute;
        right: 20px;
        bottom: 20px;
        left: 20px;
        height: 2px;
        overflow: hidden;
        border-radius: 999px;
        background: rgba(
          255,
          255,
          255,
          0.05
        );
      }

      .metric-progress span {
        display: block;
        width: 38%;
        height: 100%;
        border-radius: inherit;
        animation: metricFlow 3s ease-in-out infinite;
      }

      .metric-cyan
        .metric-progress span {
        background: #22d3ee;
      }

      .metric-purple
        .metric-progress span {
        background: #a855f7;
      }

      .metric-pink
        .metric-progress span {
        background: #ec4899;
      }

      .metric-orange
        .metric-progress span {
        background: #fb923c;
      }

      .metric-fire
        .metric-progress span {
        background: #ef4444;
      }

      /* =====================================================
         COMMON CARDS
      ===================================================== */

      .main-grid {
        display: grid;
        grid-template-columns:
          minmax(0, 1.65fr)
          minmax(320px, 0.8fr);
        gap: 13px;
        margin-bottom: 13px;
      }

      .glass-card {
        position: relative;
        overflow: hidden;
        padding: 23px;
        border: 1px solid rgba(
          148,
          163,
          184,
          0.12
        );
        border-radius: 23px;
        background:
          linear-gradient(
            145deg,
            rgba(15, 23, 42, 0.9),
            rgba(7, 12, 24, 0.8)
          );
        box-shadow:
          0 18px 60px rgba(
            0,
            0,
            0,
            0.18
          ),
          inset 0 1px 0 rgba(
            255,
            255,
            255,
            0.035
          );
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 15px;
      }

      .card-header h2 {
        margin: 7px 0 4px;
        font-size: 19px;
        letter-spacing: -0.025em;
      }

      .card-header p {
        margin: 0;
        color: #64748b;
        font-size: 10px;
      }

      .card-header-icon {
        width: 40px;
        height: 40px;
        display: grid;
        place-items: center;
        border-radius: 12px;
        border: 1px solid rgba(
          148,
          163,
          184,
          0.1
        );
        background: rgba(
          255,
          255,
          255,
          0.035
        );
        font-size: 17px;
      }

      .card-eyebrow {
        font-size: 8px;
      }

      /* =====================================================
         WEEKLY
      ===================================================== */

      .weekly-summary {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin: 28px 0 17px;
      }

      .weekly-summary > div:first-child {
        display: flex;
        align-items: baseline;
        gap: 10px;
      }

      .weekly-summary span {
        color: #475569;
        font-size: 8px;
        font-weight: 800;
        letter-spacing: 0.12em;
      }

      .weekly-summary strong {
        font-size: 22px;
      }

      .weekly-trend {
        display: flex;
        align-items: center;
        gap: 9px;
      }

      .trend-icon {
        width: 28px;
        height: 28px;
        display: grid;
        place-items: center;
        border-radius: 9px;
        background: rgba(
          34,
          197,
          94,
          0.08
        );
        color: #4ade80 !important;
        font-size: 15px !important;
      }

      .weekly-trend div {
        display: flex;
        flex-direction: column;
      }

      .weekly-trend strong {
        font-size: 9px;
        color: #cbd5e1;
      }

      .weekly-trend small {
        margin-top: 2px;
        color: #475569;
        font-size: 8px;
      }

      .activity-chart {
        position: relative;
        min-height: 250px;
        padding: 15px 10px 0;
      }

      .chart-lines {
        position: absolute;
        inset: 15px 10px 35px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        pointer-events: none;
      }

      .chart-lines span {
        border-top: 1px dashed rgba(
          148,
          163,
          184,
          0.08
        );
      }

      .bars-container {
        position: relative;
        z-index: 2;
        height: 220px;
        display: grid;
        grid-template-columns:
          repeat(7, 1fr);
        gap: 15px;
        align-items: end;
      }

      .bar-column {
        position: relative;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-end;
        cursor: default;
      }

      .bar-track {
        width: min(38px, 75%);
        height: 185px;
        display: flex;
        align-items: flex-end;
        overflow: hidden;
        border-radius: 999px 999px 8px 8px;
        background: rgba(
          255,
          255,
          255,
          0.025
        );
      }

      .activity-bar {
        position: relative;
        width: 100%;
        overflow: hidden;
        border-radius: 999px 999px 8px 8px;
        background:
          linear-gradient(
            180deg,
            #22d3ee,
            #6366f1 55%,
            #9333ea
          );
        box-shadow:
          0 0 20px rgba(
            99,
            102,
            241,
            0.22
          );
        transition:
          height 0.7s ease;
      }

      .bar-shimmer {
        position: absolute;
        inset: 0;
        background:
          linear-gradient(
            110deg,
            transparent 25%,
            rgba(
              255,
              255,
              255,
              0.32
            ) 50%,
            transparent 75%
          );
        transform: translateX(-120%);
        animation: shimmer 3.5s infinite;
      }

      .bar-value {
        margin-bottom: 7px;
        color: #cbd5e1;
        font-size: 9px;
        font-weight: 700;
      }

      .bar-day {
        margin-top: 9px;
        color: #475569;
        font-size: 9px;
        font-weight: 700;
      }

      .bar-tooltip {
        position: absolute;
        bottom: calc(
          100% - 5px
        );
        padding: 6px 8px;
        border: 1px solid rgba(
          148,
          163,
          184,
          0.15
        );
        border-radius: 7px;
        background: #0f172a;
        color: #cbd5e1;
        font-size: 8px;
        opacity: 0;
        transform: translateY(5px);
        pointer-events: none;
        white-space: nowrap;
        transition: 0.2s ease;
        z-index: 10;
      }

      .bar-column:hover
        .bar-tooltip {
        opacity: 1;
        transform: translateY(0);
      }

      .activity-legend {
        display: flex;
        gap: 17px;
        flex-wrap: wrap;
        padding-top: 14px;
        border-top: 1px solid rgba(
          148,
          163,
          184,
          0.07
        );
      }

      .legend-item {
        display: flex;
        align-items: center;
        gap: 6px;
        color: #64748b;
      }

      .legend-item span {
        font-size: 11px;
      }

      .legend-item small {
        font-size: 8px;
      }

      /* =====================================================
         STREAK
      ===================================================== */

      .streak-panel {
        min-height: 390px;
      }

      .streak-background {
        position: absolute;
        inset: 0;
        pointer-events: none;
      }

      .streak-background div {
        position: absolute;
        width: 130px;
        height: 130px;
        border-radius: 50%;
        filter: blur(55px);
        opacity: 0.15;
      }

      .streak-background div:nth-child(1) {
        background: #f97316;
        right: -50px;
        top: -40px;
      }

      .streak-background div:nth-child(2) {
        background: #ef4444;
        left: -60px;
        bottom: 0;
      }

      .streak-background div:nth-child(3) {
        background: #facc15;
        right: 30%;
        bottom: -80px;
      }

      .streak-header,
      .streak-main,
      .streak-stats,
      .streak-message {
        position: relative;
        z-index: 2;
      }

      .streak-header {
        display: flex;
        justify-content: space-between;
        gap: 15px;
      }

      .streak-header h2 {
        margin: 7px 0 4px;
        font-size: 19px;
      }

      .streak-header p {
        margin: 0;
        color: #64748b;
        font-size: 10px;
      }

      .streak-fire {
        width: 47px;
        height: 47px;
        display: grid;
        place-items: center;
        border-radius: 15px;
        background:
          linear-gradient(
            135deg,
            rgba(249, 115, 22, 0.16),
            rgba(239, 68, 68, 0.08)
          );
        border: 1px solid rgba(
          249,
          115,
          22,
          0.16
        );
        font-size: 22px;
        animation: fireFloat 2.4s ease-in-out infinite;
      }

      .streak-main {
        margin: 38px 0 30px;
      }

      .streak-number {
        display: flex;
        align-items: baseline;
        gap: 9px;
      }

      .streak-number strong {
        font-size: 75px;
        line-height: 0.85;
        letter-spacing: -0.08em;
        background:
          linear-gradient(
            135deg,
            #fed7aa,
            #fb923c,
            #ef4444
          );
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
      }

      .streak-number span {
        color: #64748b;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 0.14em;
      }

      .today-status {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        margin-top: 15px;
        padding: 7px 10px;
        border-radius: 999px;
        background: rgba(
          148,
          163,
          184,
          0.06
        );
        color: #64748b;
        font-size: 9px;
      }

      .today-status span {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: #64748b;
      }

      .today-status.active {
        background: rgba(
          34,
          197,
          94,
          0.08
        );
        color: #86efac;
      }

      .today-status.active span {
        background: #22c55e;
        box-shadow:
          0 0 10px
          rgba(
            34,
            197,
            94,
            0.7
          );
      }

      .streak-stats {
        display: grid;
        grid-template-columns:
          1fr 1fr;
        gap: 8px;
      }

      .streak-stats > div {
        display: flex;
        align-items: center;
        gap: 9px;
        padding: 12px;
        border: 1px solid rgba(
          148,
          163,
          184,
          0.08
        );
        border-radius: 13px;
        background: rgba(
          255,
          255,
          255,
          0.025
        );
      }

      .streak-stats > div > span {
        font-size: 16px;
      }

      .streak-stats div div {
        display: flex;
        flex-direction: column;
      }

      .streak-stats small {
        color: #475569;
        font-size: 7px;
        font-weight: 800;
        letter-spacing: 0.1em;
      }

      .streak-stats strong {
        margin-top: 3px;
        color: #cbd5e1;
        font-size: 10px;
      }

      .streak-message {
        margin-top: 12px;
        padding: 10px;
        border-radius: 10px;
        background: rgba(
          249,
          115,
          22,
          0.045
        );
        color: #94a3b8;
        font-size: 9px;
        line-height: 1.5;
      }

      /* =====================================================
         PERFORMANCE
      ===================================================== */

      .performance-card {
        margin-bottom: 13px;
      }

      .performance-layout {
        display: grid;
        grid-template-columns:
          minmax(0, 1fr)
          280px;
        gap: 40px;
        align-items: center;
        margin-top: 35px;
      }

      .performance-bars {
        display: flex;
        flex-direction: column;
        gap: 28px;
      }

      .performance-info {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 9px;
      }

      .performance-title {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .performance-icon {
        width: 35px;
        height: 35px;
        display: grid;
        place-items: center;
        border-radius: 10px;
        background: rgba(
          255,
          255,
          255,
          0.035
        );
        font-size: 15px;
      }

      .performance-title div:last-child {
        display: flex;
        flex-direction: column;
      }

      .performance-title strong {
        font-size: 11px;
      }

      .performance-title small {
        margin-top: 3px;
        color: #475569;
        font-size: 8px;
      }

      .performance-value {
        font-size: 15px;
      }

      .performance-track {
        height: 7px;
        overflow: hidden;
        border-radius: 999px;
        background: rgba(
          255,
          255,
          255,
          0.05
        );
      }

      .performance-fill {
        height: 100%;
        border-radius: inherit;
        transition:
          width 1s ease;
      }

      .performance-fill-purple {
        background:
          linear-gradient(
            90deg,
            #7c3aed,
            #a855f7
          );
        box-shadow:
          0 0 14px
          rgba(
            168,
            85,
            247,
            0.3
          );
      }

      .performance-fill-orange {
        background:
          linear-gradient(
            90deg,
            #ea580c,
            #fb923c
          );
      }

      .performance-fill-pink {
        background:
          linear-gradient(
            90deg,
            #db2777,
            #f472b6
          );
      }

      .performance-readiness {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
      }

      .performance-readiness .score-ring {
        filter:
          drop-shadow(
            0 0 20px
            rgba(
              99,
              102,
              241,
              0.1
            )
          );
      }

      .performance-score-center {
        position: absolute;
        top: 48px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        align-items: baseline;
      }

      .performance-score-center strong {
        font-size: 37px;
        letter-spacing: -0.07em;
      }

      .performance-score-center span {
        color: #64748b;
        font-size: 10px;
      }

      .performance-score-center small {
        position: absolute;
        top: 45px;
        left: 50%;
        transform: translateX(-50%);
        color: #67e8f9;
        font-size: 7px;
        font-weight: 800;
        letter-spacing: 0.13em;
        white-space: nowrap;
      }

      .performance-readiness h3 {
        margin: 17px 0 5px;
        font-size: 14px;
      }

      .performance-readiness p {
        max-width: 260px;
        margin: 0;
        color: #64748b;
        font-size: 9px;
        line-height: 1.6;
      }

      /* =====================================================
         INTERVIEW
      ===================================================== */

      .interview-performance {
        margin-bottom: 13px;
      }

      .interview-grid {
        display: grid;
        grid-template-columns:
          repeat(4, 1fr);
        gap: 10px;
        margin-top: 25px;
      }

      .score-tile {
        position: relative;
        overflow: hidden;
        padding: 17px;
        border: 1px solid rgba(
          148,
          163,
          184,
          0.09
        );
        border-radius: 16px;
        background: rgba(
          255,
          255,
          255,
          0.025
        );
      }

      .score-tile-top {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .score-tile-icon {
        width: 30px;
        height: 30px;
        display: grid;
        place-items: center;
        border-radius: 9px;
        background: rgba(
          255,
          255,
          255,
          0.05
        );
        font-size: 13px;
      }

      .score-tile-top span {
        color: #64748b;
        font-size: 9px;
        font-weight: 700;
      }

      .score-tile-score {
        display: flex;
        align-items: baseline;
        gap: 3px;
        margin-top: 22px;
      }

      .score-tile-score strong {
        font-size: 31px;
        letter-spacing: -0.05em;
      }

      .score-tile-score span {
        color: #475569;
        font-size: 10px;
      }

      .score-tile-track {
        height: 3px;
        overflow: hidden;
        margin-top: 13px;
        border-radius: 999px;
        background: rgba(
          255,
          255,
          255,
          0.05
        );
      }

      .score-tile-track span {
        display: block;
        height: 100%;
        border-radius: inherit;
        transition:
          width 1s ease;
      }

      .score-tile small {
        display: block;
        margin-top: 8px;
        color: #475569;
        font-size: 8px;
      }

      .score-tile-cyan
        .score-tile-track
        span {
        background: #22d3ee;
      }

      .score-tile-purple
        .score-tile-track
        span {
        background: #a855f7;
      }

      .score-tile-pink
        .score-tile-track
        span {
        background: #ec4899;
      }

      .score-tile-orange
        .score-tile-track
        span {
        background: #fb923c;
      }

      /* =====================================================
         SUMMARY
      ===================================================== */

      .summary-grid {
        display: grid;
        grid-template-columns:
          repeat(4, 1fr);
        gap: 13px;
        margin-bottom: 13px;
      }

      .summary-card {
        display: flex;
        align-items: center;
        gap: 14px;
        min-height: 115px;
        padding: 18px;
        border: 1px solid rgba(
          148,
          163,
          184,
          0.1
        );
        border-radius: 18px;
        background:
          linear-gradient(
            135deg,
            rgba(15, 23, 42, 0.82),
            rgba(7, 12, 24, 0.78)
          );
      }

      .summary-icon {
        width: 45px;
        height: 45px;
        display: grid;
        place-items: center;
        flex: 0 0 auto;
        border-radius: 13px;
        background: rgba(
          255,
          255,
          255,
          0.04
        );
        font-size: 18px;
      }

      .summary-content {
        display: flex;
        flex-direction: column;
      }

      .summary-content > span {
        color: #64748b;
        font-size: 8px;
        font-weight: 800;
        letter-spacing: 0.1em;
      }

      .summary-content strong {
        margin-top: 5px;
        font-size: 25px;
        letter-spacing: -0.04em;
      }

      .summary-content small {
        margin-top: 3px;
        color: #475569;
        font-size: 8px;
      }

      .summary-gold {
        border-color: rgba(
          250,
          204,
          21,
          0.1
        );
      }

      .summary-green {
        border-color: rgba(
          34,
          197,
          94,
          0.1
        );
      }

      .summary-red {
        border-color: rgba(
          239,
          68,
          68,
          0.1
        );
      }

      .summary-blue {
        border-color: rgba(
          59,
          130,
          246,
          0.1
        );
      }

      /* =====================================================
         ACTIVITY
      ===================================================== */

      .activity-card {
        margin-bottom: 13px;
      }

      .activity-header {
        display: flex;
        justify-content: space-between;
        gap: 20px;
        align-items: flex-start;
      }

      .activity-filters {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
        padding: 4px;
        border: 1px solid rgba(
          148,
          163,
          184,
          0.08
        );
        border-radius: 10px;
        background: rgba(
          255,
          255,
          255,
          0.025
        );
      }

      .filter {
        border: 0;
        padding: 7px 9px;
        border-radius: 7px;
        background: transparent;
        color: #64748b;
        font-size: 8px;
        cursor: pointer;
        transition: 0.2s ease;
      }

      .filter:hover {
        color: #cbd5e1;
      }

      .filter.active {
        background: rgba(
          34,
          211,
          238,
          0.1
        );
        color: #67e8f9;
      }

      .timeline {
        margin-top: 25px;
      }

      .timeline-item {
        position: relative;
        display: grid;
        grid-template-columns:
          44px 1fr;
        gap: 13px;
        min-height: 105px;
      }

      .timeline-icon {
        position: relative;
        z-index: 2;
        width: 40px;
        height: 40px;
        display: grid;
        place-items: center;
        border: 1px solid rgba(
          148,
          163,
          184,
          0.11
        );
        border-radius: 12px;
        background: #0b1222;
        font-size: 16px;
      }

      .activity-note {
        box-shadow:
          0 0 25px
          rgba(
            34,
            211,
            238,
            0.07
          );
      }

      .activity-resume {
        box-shadow:
          0 0 25px
          rgba(
            168,
            85,
            247,
            0.07
          );
      }

      .activity-interview {
        box-shadow:
          0 0 25px
          rgba(
            236,
            72,
            153,
            0.07
          );
      }

      .activity-test {
        box-shadow:
          0 0 25px
          rgba(
            249,
            115,
            22,
            0.07
          );
      }

      .timeline-connector {
        position: absolute;
        left: 20px;
        top: 40px;
        bottom: 0;
        width: 1px;
        background:
          linear-gradient(
            to bottom,
            rgba(
              148,
              163,
              184,
              0.13
            ),
            transparent
          );
      }

      .timeline-content {
        padding: 1px 0 25px;
        border-bottom: 1px solid rgba(
          148,
          163,
          184,
          0.06
        );
      }

      .timeline-main {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 15px;
      }

      .timeline-type {
        color: #475569;
        font-size: 7px;
        font-weight: 800;
        letter-spacing: 0.13em;
      }

      .timeline-title-area h3 {
        margin: 5px 0 4px;
        color: #e2e8f0;
        font-size: 12px;
      }

      .timeline-title-area p {
        margin: 0;
        color: #64748b;
        font-size: 9px;
      }

      .timeline-score {
        display: flex;
        align-items: baseline;
        gap: 2px;
        min-width: 62px;
        justify-content: center;
        padding: 8px 10px;
        border-radius: 9px;
        background: rgba(
          255,
          255,
          255,
          0.035
        );
      }

      .timeline-score strong {
        font-size: 17px;
      }

      .timeline-score span {
        color: #64748b;
        font-size: 8px;
      }

      .timeline-meta {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-top: 12px;
        color: #475569;
        font-size: 8px;
      }

      .score-label {
        padding: 3px 6px;
        border-radius: 999px;
        background: rgba(
          255,
          255,
          255,
          0.035
        );
      }

      .score-excellent {
        color: #4ade80;
      }

      .score-good {
        color: #67e8f9;
      }

      .score-average {
        color: #fbbf24;
      }

      .score-low {
        color: #fb7185;
      }

      /* =====================================================
         EMPTY
      ===================================================== */

      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 210px;
        padding: 30px;
        text-align: center;
      }

      .empty-compact {
        min-height: 140px;
      }

      .empty-icon {
        width: 52px;
        height: 52px;
        display: grid;
        place-items: center;
        margin-bottom: 13px;
        border: 1px solid rgba(
          148,
          163,
          184,
          0.1
        );
        border-radius: 15px;
        background: rgba(
          255,
          255,
          255,
          0.03
        );
        font-size: 22px;
      }

      .empty-state h3 {
        margin: 0 0 6px;
        color: #cbd5e1;
        font-size: 13px;
      }

      .empty-state p {
        max-width: 380px;
        margin: 0;
        color: #475569;
        font-size: 9px;
        line-height: 1.6;
      }

      /* =====================================================
         FOOTER
      ===================================================== */

      .progress-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        padding: 18px 5px 0;
        color: #334155;
        font-size: 8px;
      }

      .progress-footer span {
        margin: 0 7px;
        color: #1e293b;
      }

      .footer-brand {
        display: flex;
        align-items: center;
        gap: 7px;
        color: #475569;
      }

      .footer-dot {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: #22d3ee;
        box-shadow:
          0 0 9px
          rgba(
            34,
            211,
            238,
            0.6
          );
      }

      /* =====================================================
         LOADING
      ===================================================== */

      .loading-background {
        position: fixed;
        inset: 0;
        overflow: hidden;
      }

      .loading-orb {
        position: absolute;
        width: 300px;
        height: 300px;
        border-radius: 50%;
        filter: blur(90px);
        opacity: 0.14;
      }

      .orb-one {
        background: #06b6d4;
        top: 10%;
        left: 10%;
      }

      .orb-two {
        background: #7c3aed;
        right: 10%;
        top: 20%;
      }

      .orb-three {
        background: #ec4899;
        bottom: 5%;
        left: 40%;
      }

      .advanced-loader {
        min-height: 70vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
      }

      .loader-ring {
        position: relative;
        width: 110px;
        height: 110px;
        display: grid;
        place-items: center;
        border: 1px solid rgba(
          34,
          211,
          238,
          0.15
        );
        border-radius: 50%;
        box-shadow:
          0 0 60px
          rgba(
            34,
            211,
            238,
            0.08
          );
        animation: loaderRotate 3s linear infinite;
      }

      .loader-ring::before {
        content: "";
        position: absolute;
        inset: -5px;
        border-radius: inherit;
        border: 2px solid transparent;
        border-top-color: #22d3ee;
        border-right-color: #8b5cf6;
      }

      .loader-core {
        width: 58px;
        height: 58px;
        display: grid;
        place-items: center;
        border-radius: 18px;
        background: #0f172a;
        font-size: 23px;
      }

      .loader-status {
        display: flex;
        align-items: center;
        gap: 7px;
        margin-top: 30px;
        color: #67e8f9;
        font-size: 8px;
        font-weight: 800;
        letter-spacing: 0.16em;
      }

      .loader-live-dot {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: #22c55e;
      }

      .advanced-loader h2 {
        margin: 13px 0 6px;
        font-size: 25px;
      }

      .advanced-loader p {
        max-width: 400px;
        margin: 0;
        color: #64748b;
        font-size: 11px;
        line-height: 1.6;
      }

      .loader-track {
        width: 260px;
        height: 3px;
        overflow: hidden;
        margin-top: 25px;
        border-radius: 999px;
        background: rgba(
          255,
          255,
          255,
          0.06
        );
      }

      .loader-progress {
        width: 40%;
        height: 100%;
        border-radius: inherit;
        background:
          linear-gradient(
            90deg,
            #22d3ee,
            #8b5cf6
          );
        animation:
          loadingMove 1.6s
          ease-in-out infinite;
      }

      /* =====================================================
         ERROR
      ===================================================== */

      .error-screen {
        position: relative;
        min-height: 70vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
      }

      .error-glow {
        position: absolute;
        width: 180px;
        height: 180px;
        border-radius: 50%;
        background: #ef4444;
        opacity: 0.08;
        filter: blur(70px);
      }

      .error-icon {
        position: relative;
        width: 62px;
        height: 62px;
        display: grid;
        place-items: center;
        border: 1px solid rgba(
          248,
          113,
          113,
          0.2
        );
        border-radius: 18px;
        background: rgba(
          239,
          68,
          68,
          0.07
        );
        color: #f87171;
        font-size: 26px;
        font-weight: 800;
      }

      .error-kicker {
        margin-top: 20px;
        color: #f87171;
        font-size: 8px;
        font-weight: 800;
        letter-spacing: 0.16em;
      }

      .error-screen h2 {
        margin: 9px 0;
        font-size: 27px;
      }

      .error-screen p {
        max-width: 500px;
        margin: 0 0 22px;
        color: #64748b;
        font-size: 11px;
      }

      .primary-action {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 11px 17px;
        border: 0;
        border-radius: 10px;
        background:
          linear-gradient(
            135deg,
            #0891b2,
            #6366f1
          );
        color: white;
        font-size: 10px;
        font-weight: 800;
        cursor: pointer;
        box-shadow:
          0 10px 30px
          rgba(
            99,
            102,
            241,
            0.2
          );
      }

      /* =====================================================
         ANIMATIONS
      ===================================================== */

      @keyframes livePulse {
        0%,
        100% {
          transform: scale(1);
          opacity: 1;
        }

        50% {
          transform: scale(0.7);
          opacity: 0.55;
        }
      }

      @keyframes metricFlow {
        0% {
          transform: translateX(-120%);
        }

        50% {
          transform: translateX(140%);
        }

        100% {
          transform: translateX(300%);
        }
      }

      @keyframes shimmer {
        0% {
          transform: translateX(-120%);
        }

        55%,
        100% {
          transform: translateX(120%);
        }
      }

      @keyframes fireFloat {
        0%,
        100% {
          transform: translateY(0);
        }

        50% {
          transform: translateY(-5px);
        }
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      @keyframes loaderRotate {
        to {
          transform: rotate(360deg);
        }
      }

      @keyframes loadingMove {
        0% {
          transform: translateX(-120%);
        }

        50% {
          transform: translateX(150%);
        }

        100% {
          transform: translateX(300%);
        }
      }

      /* =====================================================
         RESPONSIVE
      ===================================================== */

      @media (max-width: 1250px) {
        .metrics-grid {
          grid-template-columns:
            repeat(3, 1fr);
        }

        .main-grid {
          grid-template-columns: 1fr;
        }

        .streak-panel {
          min-height: auto;
        }
      }

      @media (max-width: 1050px) {
        .hero-content {
          grid-template-columns: 1fr;
        }

        .hero-readiness {
          justify-content: flex-start;
        }

        .performance-layout {
          grid-template-columns: 1fr;
        }

        .performance-readiness {
          margin-top: 15px;
        }
      }

      @media (max-width: 800px) {
        .progress-container {
          width: min(
            calc(100% - 24px),
            1480px
          );
          padding-top: 12px;
        }

        .hero-section {
          padding: 17px;
          border-radius: 22px;
        }

        .hero-content {
          padding: 38px 5px 30px;
        }

        .hero-copy h1 {
          font-size: 48px;
        }

        .hero-readiness {
          align-items: center;
        }

        .hero-update {
          flex-direction: column;
          align-items: flex-start;
        }

        .metrics-grid {
          grid-template-columns:
            repeat(2, 1fr);
        }

        .summary-grid {
          grid-template-columns:
            repeat(2, 1fr);
        }

        .interview-grid {
          grid-template-columns:
            repeat(2, 1fr);
        }

        .activity-header {
          flex-direction: column;
        }

        .activity-filters {
          width: 100%;
        }
      }

      @media (max-width: 560px) {
        .progress-container {
          width: calc(100% - 16px);
        }

        .hero-top {
          align-items: flex-start;
        }

        .hero-actions {
          gap: 5px;
        }

        .live-indicator {
          padding: 0 8px;
        }

        .live-indicator small {
          display: none;
        }

        .hero-content {
          padding-top: 30px;
        }

        .hero-copy h1 {
          font-size: 40px;
        }

        .hero-copy > p {
          font-size: 12px;
        }

        .hero-tags span {
          font-size: 8px;
        }

        .hero-readiness {
          flex-direction: column;
          align-items: flex-start;
        }

        .hero-readiness-text {
          max-width: 100%;
        }

        .metrics-grid {
          grid-template-columns: 1fr;
        }

        .metric-card {
          min-height: 175px;
        }

        .glass-card {
          padding: 17px;
          border-radius: 18px;
        }

        .bars-container {
          gap: 7px;
        }

        .bar-track {
          width: 27px;
        }

        .activity-legend {
          gap: 10px;
        }

        .streak-number strong {
          font-size: 64px;
        }

        .performance-layout {
          gap: 20px;
        }

        .interview-grid,
        .summary-grid {
          grid-template-columns: 1fr 1fr;
        }

        .summary-card {
          min-height: 105px;
          padding: 13px;
          gap: 9px;
        }

        .summary-icon {
          width: 38px;
          height: 38px;
        }

        .summary-content strong {
          font-size: 20px;
        }

        .timeline-item {
          grid-template-columns:
            36px 1fr;
        }

        .timeline-icon {
          width: 34px;
          height: 34px;
          font-size: 14px;
        }

        .timeline-connector {
          left: 17px;
          top: 34px;
        }

        .timeline-score {
          min-width: 50px;
          padding: 6px;
        }

        .timeline-score strong {
          font-size: 14px;
        }

        .progress-footer {
          flex-direction: column;
          align-items: flex-start;
        }
      }

      @media (max-width: 400px) {
        .interview-grid,
        .summary-grid {
          grid-template-columns: 1fr;
        }

        .hero-readiness-ring {
          transform: scale(0.9);
          transform-origin: left center;
        }

        .hero-readiness {
          margin-top: -10px;
        }

        .streak-stats {
          grid-template-columns: 1fr;
        }
      }

    `}</style>
  );
}