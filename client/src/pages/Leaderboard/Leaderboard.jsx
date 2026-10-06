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
  FiAward,
  FiBarChart2,
  FiBookOpen,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiCpu,
  FiFilter,
  FiGrid,
  FiLayers,
  FiRefreshCw,
  FiSearch,
  FiShield,
  FiStar,
  FiTarget,
  FiTrendingUp,
  FiUser,
  FiUsers,
  FiZap,
} from "react-icons/fi";

import {
  useNavigate,
} from "react-router-dom";

import API from "../../services/api";

/* =========================================================
   HELPERS
========================================================= */

const formatNumber = (value) => {
  const number = Number(value) || 0;

  if (number >= 1000000) {
    return `${(number / 1000000).toFixed(1)}M`;
  }

  if (number >= 1000) {
    return `${(number / 1000).toFixed(1)}K`;
  }

  return number.toLocaleString("en-IN");
};

const getInitials = (name = "") => {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((item) => item[0]?.toUpperCase())
    .join("");

  return initials || "U";
};

const getRankClass = (rank) => {
  if (rank === 1) return "rank-gold";
  if (rank === 2) return "rank-silver";
  if (rank === 3) return "rank-bronze";

  return "rank-default";
};

const getRankIcon = (rank) => {
  if (rank === 1) return <FiAward />;
  if (rank === 2) return <FiStar />;
  if (rank === 3) return <FiStar />;

  return <span>{rank}</span>;
};

const formatDate = (value) => {
  if (!value) return "No activity";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "No activity";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/* =========================================================
   AVATAR
========================================================= */

function Avatar({
  user,
  size = 56,
}) {
  const initials = getInitials(user?.name);

  if (user?.profilePicture) {
    return (
      <img
        src={user.profilePicture}
        alt={user?.name || "User"}
        className="leader-avatar-image"
        style={{
          width: size,
          height: size,
        }}
      />
    );
  }

  return (
    <div
      className="leader-avatar"
      style={{
        width: size,
        height: size,
      }}
    >
      <span>{initials}</span>
    </div>
  );
}

/* =========================================================
   STAT ICON
========================================================= */

function StatIcon({
  icon,
  type = "purple",
}) {
  return (
    <div className={`stat-icon ${type}`}>
      <div className="stat-icon-glow" />
      {icon}
    </div>
  );
}

/* =========================================================
   PODIUM PLAYER
========================================================= */

function PodiumPlayer({
  user,
  rank,
  position,
}) {
  if (!user) {
    return (
      <div
        className={`podium-empty podium-position-${position}`}
      >
        <div className="empty-rank">
          {getRankIcon(rank)}
        </div>

        <div className="empty-user-icon">
          <FiUser />
        </div>

        <span>
          Waiting for
          <br />
          player
        </span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 35,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.6,
        delay: position * 0.12,
      }}
      className={`podium-player podium-position-${position} ${getRankClass(
        rank
      )}`}
    >
      {/* Rank Badge */}
      <div className="podium-rank-badge">
        <span className="rank-icon">
          {getRankIcon(rank)}
        </span>

        <span>
          #{rank}
        </span>
      </div>

      {/* Glow */}
      <div className="podium-player-glow" />

      {/* Avatar */}
      <div className="podium-avatar-area">
        <div className="avatar-ring ring-outer" />
        <div className="avatar-ring ring-middle" />
        <div className="avatar-ring ring-inner" />

        <div className="podium-avatar">
          <Avatar
            user={user}
            size={
              rank === 1
                ? 92
                : 72
            }
          />
        </div>

        {rank === 1 && (
          <div className="winner-crown">
            <FiAward />
          </div>
        )}
      </div>

      {/* Player */}
      <div className="podium-player-info">
        <h3>
          {user.name || "Learner"}
        </h3>

        <p>
          {user.isCurrentUser
            ? "You are here"
            : user.email || "PrepPulse Student"}
        </p>
      </div>

      {/* XP */}
      <div className="podium-xp">
        <FiZap />

        <strong>
          {formatNumber(
            user.rankingPoints
          )}
        </strong>

        <span>
          XP
        </span>
      </div>

      {/* Stats */}
      <div className="podium-mini-stats">
        <div>
          <FiTarget />
          <span>
            {user.mockTests || 0}
          </span>
          <small>
            Tests
          </small>
        </div>

        <div>
          <FiCpu />
          <span>
            {user.interviews || 0}
          </span>
          <small>
            Interviews
          </small>
        </div>

        <div>
          <FiBookOpen />
          <span>
            {(user.notes || 0) +
              (user.resumes || 0)}
          </span>
          <small>
            Learning
          </small>
        </div>
      </div>

      {user.isCurrentUser && (
        <div className="podium-you">
          <FiCheckCircle />
          YOU
        </div>
      )}

      {/* Platform */}
      <div className="podium-platform">
        <div className="platform-top" />
        <div className="platform-front" />
      </div>
    </motion.div>
  );
}

/* =========================================================
   LEADERBOARD ROW
========================================================= */

function LeaderboardRow({
  user,
  index,
}) {
  const rank = user.rank;

  const scoreProgress = Math.min(
    100,
    Math.max(
      4,
      Number(user.bestTestScore || 0)
    )
  );

  return (
    <motion.div
      layout
      initial={{
        opacity: 0,
        x: -15,
      }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      exit={{
        opacity: 0,
        x: 15,
      }}
      transition={{
        delay: index * 0.035,
      }}
      className={`leader-row ${
        user.isCurrentUser
          ? "leader-row-current"
          : ""
      }`}
    >
      {/* Rank */}
      <div className="row-rank">
        <div
          className={`row-rank-icon ${getRankClass(
            rank
          )}`}
        >
          {getRankIcon(rank)}
        </div>
      </div>

      {/* Student */}
      <div className="row-student">
        <div className="row-avatar-wrapper">
          <Avatar
            user={user}
            size={46}
          />

          {user.isCurrentUser && (
            <span className="online-dot" />
          )}
        </div>

        <div className="row-student-info">
          <div className="row-name-line">
            <strong>
              {user.name ||
                "Learner"}
            </strong>

            {user.isCurrentUser && (
              <span className="you-label">
                YOU
              </span>
            )}
          </div>

          <span>
            {user.email ||
              "PrepPulse Student"}
          </span>
        </div>
      </div>

      {/* XP */}
      <div className="row-xp">
        <FiZap />

        <strong>
          {formatNumber(
            user.rankingPoints
          )}
        </strong>
      </div>

      {/* Tests */}
      <div className="row-metric">
        <div className="metric-icon blue">
          <FiTarget />
        </div>

        <span>
          {user.mockTests || 0}
        </span>
      </div>

      {/* Interviews */}
      <div className="row-metric">
        <div className="metric-icon purple">
          <FiCpu />
        </div>

        <span>
          {user.interviews || 0}
        </span>
      </div>

      {/* Learning */}
      <div className="row-metric">
        <div className="metric-icon cyan">
          <FiBookOpen />
        </div>

        <span>
          {(user.notes || 0) +
            (user.resumes || 0)}
        </span>
      </div>

      {/* Performance */}
      <div className="row-performance">
        <div className="performance-top">
          <span>
            Best Test
          </span>

          <strong>
            {user.bestTestScore || 0}%
          </strong>
        </div>

        <div className="performance-track">
          <motion.div
            initial={{
              width: 0,
            }}
            animate={{
              width: `${scoreProgress}%`,
            }}
            transition={{
              duration: 0.8,
              delay:
                index * 0.035,
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}

/* =========================================================
   MAIN
========================================================= */

function Leaderboard() {
  const navigate =
    useNavigate();

  const token =
    localStorage.getItem(
      "token"
    );

  const [data, setData] =
    useState({
      leaderboard: [],
      podium: [],
      currentUser: null,
      summary: {
        totalStudents: 0,
        totalPoints: 0,
        topScore: 0,
      },
      pagination: {
        page: 1,
        pages: 1,
        total: 0,
      },
    });

  const [range, setRange] =
    useState("all");

  const [category, setCategory] =
    useState("overall");

  const [search, setSearch] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  /* =======================================================
     FETCH LEADERBOARD
  ======================================================= */

  const fetchLeaderboard =
    useCallback(
      async (
        refresh = false
      ) => {
        if (!token) {
          navigate(
            "/login",
            {
              replace: true,
            }
          );

          return;
        }

        try {
          setError("");

          if (refresh) {
            setIsRefreshing(true);
          } else {
            setIsLoading(true);
          }

          const response =
            await API.get(
              "/leaderboard",
              {
                params: {
                  range,
                  category,
                  search:
                    search.trim(),
                  page,
                  limit: 10,
                },

                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );

          if (
            response?.data
              ?.success
          ) {
            setData(
              response.data
            );
          } else {
            setError(
              response?.data
                ?.message ||
                "Unable to load leaderboard."
            );
          }
        } catch (err) {
          console.error(
            "Leaderboard Error:",
            err
          );

          if (
            err?.response
              ?.status === 401
          ) {
            localStorage.removeItem(
              "token"
            );

            navigate(
              "/login",
              {
                replace: true,
              }
            );

            return;
          }

          setError(
            err?.response?.data
              ?.message ||
              "Unable to load leaderboard."
          );
        } finally {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      },
      [
        token,
        navigate,
        range,
        category,
        search,
        page,
      ]
    );

  useEffect(() => {
    fetchLeaderboard();
  }, [
    fetchLeaderboard,
  ]);

  /* =======================================================
     AUTO REFRESH
  ======================================================= */

  useEffect(() => {
    const timer =
      setInterval(() => {
        fetchLeaderboard(true);
      }, 30000);

    return () =>
      clearInterval(timer);
  }, [
    fetchLeaderboard,
  ]);

  /* =======================================================
     PODIUM
  ======================================================= */

  const podium =
    useMemo(() => {
      const list =
        data.podium || [];

      return {
        first:
          list.find(
            (item) =>
              item.rank === 1
          ) || null,

        second:
          list.find(
            (item) =>
              item.rank === 2
          ) || null,

        third:
          list.find(
            (item) =>
              item.rank === 3
          ) || null,
      };
    }, [
      data.podium,
    ]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (isLoading) {
    return (
      <div className="leaderboard-app">
        <LeaderboardStyles />

        <div className="leader-loading">
          <div className="loading-logo">
            <FiAward />
          </div>

          <h2>
            Preparing the Arena
          </h2>

          <p>
            Calculating live
            PrepPulse rankings...
          </p>

          <div className="loading-line">
            <span />
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="leaderboard-app">
      <LeaderboardStyles />

      {/* BACKGROUND */}
      <div className="advanced-background">
        <div className="bg-grid" />

        <div className="bg-noise" />

        <div className="glow glow-purple" />
        <div className="glow glow-blue" />
        <div className="glow glow-cyan" />

        <div className="floating-particle particle-1" />
        <div className="floating-particle particle-2" />
        <div className="floating-particle particle-3" />
        <div className="floating-particle particle-4" />
        <div className="floating-particle particle-5" />
      </div>

      <main className="leader-container">

        {/* =================================================
            TOP NAV
        ================================================= */}

        <header className="leader-nav">

          <button
            className="back-dashboard"
            onClick={() =>
              navigate(
                "/dashboard"
              )
            }
          >
            <span className="back-icon">
              ←
            </span>

            <span>
              Dashboard
            </span>
          </button>

          <div className="nav-center">
            <div className="nav-brand-mark">
              <FiZap />
            </div>

            <div>
              <strong>
                PrepPulse
              </strong>

              <span>
                COMPETITIVE HUB
              </span>
            </div>
          </div>

          <div className="nav-actions">

            <div className="live-pill">
              <span className="live-dot" />
              LIVE
            </div>

            <button
              className="nav-refresh"
              onClick={() =>
                fetchLeaderboard(
                  true
                )
              }
              title="Refresh"
            >
              <FiRefreshCw
                className={
                  isRefreshing
                    ? "refresh-spin"
                    : ""
                }
              />
            </button>

          </div>
        </header>

        {/* =================================================
            HERO
        ================================================= */}

        <section className="leader-hero">

          <div className="hero-left">

            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="hero-label"
            >
              <span>
                <FiActivity />
              </span>

              LIVE PERFORMANCE ARENA
            </motion.div>

            <motion.h1
              initial={{
                opacity: 0,
                y: 25,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.1,
              }}
            >
              Compete.
              <br />

              <span>
                Improve.
              </span>

              <br />

              Get Hired.
            </motion.h1>

            <motion.p
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.2,
              }}
            >
              Track your performance,
              earn XP and compete with
              learners across the
              PrepPulse platform.
            </motion.p>

            <motion.div
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.3,
              }}
              className="hero-achievements"
            >
              <div>
                <div className="achievement-icon">
                  <FiZap />
                </div>

                <span>
                  Earn XP
                </span>
              </div>

              <div>
                <div className="achievement-icon">
                  <FiTarget />
                </div>

                <span>
                  Master Skills
                </span>
              </div>

              <div>
                <div className="achievement-icon">
                  <FiTrendingUp />
                </div>

                <span>
                  Climb Ranks
                </span>
              </div>
            </motion.div>

          </div>

          {/* HERO VISUAL */}

          <div className="hero-right">

            <div className="hero-orbit orbit-large" />
            <div className="hero-orbit orbit-small" />

            <div className="hero-core">

              <div className="core-ring ring-a" />
              <div className="core-ring ring-b" />

              <motion.div
                animate={{
                  y: [
                    0,
                    -10,
                    0,
                  ],
                  rotate: [
                    -3,
                    3,
                    -3,
                  ],
                }}
                transition={{
                  duration: 4,
                  repeat:
                    Infinity,
                  ease:
                    "easeInOut",
                }}
                className="hero-award"
              >
                <FiAward />
              </motion.div>

              <div className="core-xp">
                <FiZap />
                XP
              </div>

            </div>

            <div className="hero-floating-card card-one">
              <div>
                <FiTrendingUp />
              </div>

              <span>
                Ranking
              </span>

              <strong>
                LIVE
              </strong>
            </div>

            <div className="hero-floating-card card-two">
              <div>
                <FiStar />
              </div>

              <span>
                Performance
              </span>

              <strong>
                TOP
              </strong>
            </div>

          </div>
        </section>

        {/* =================================================
            FILTER BAR
        ================================================= */}

        <section className="filter-panel">

          <div className="category-tabs">

            {[
              {
                value: "overall",
                label: "Overall",
                icon: (
                  <FiGrid />
                ),
              },
              {
                value: "tests",
                label: "Mock Tests",
                icon: (
                  <FiTarget />
                ),
              },
              {
                value:
                  "interviews",
                label:
                  "Interviews",
                icon: (
                  <FiCpu />
                ),
              },
              {
                value:
                  "learning",
                label:
                  "Learning",
                icon: (
                  <FiBookOpen />
                ),
              },
            ].map(
              (item) => (
                <button
                  key={
                    item.value
                  }
                  className={
                    category ===
                    item.value
                      ? "filter-active"
                      : ""
                  }
                  onClick={() => {
                    setCategory(
                      item.value
                    );

                    setPage(1);
                  }}
                >
                  <span>
                    {item.icon}
                  </span>

                  {item.label}
                </button>
              )
            )}

          </div>

          <div className="filter-right">

            <div className="search-box">
              <FiSearch />

              <input
                value={search}
                onChange={(event) => {
                  setSearch(
                    event.target
                      .value
                  );

                  setPage(1);
                }}
                placeholder="Find a student..."
              />
            </div>

            <div className="period-select">
              <FiClock />

              <select
                value={range}
                onChange={(event) => {
                  setRange(
                    event.target
                      .value
                  );

                  setPage(1);
                }}
              >
                <option value="all">
                  All Time
                </option>

                <option value="month">
                  This Month
                </option>

                <option value="week">
                  This Week
                </option>

                <option value="today">
                  Today
                </option>
              </select>
            </div>

          </div>
        </section>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="leader-error">
            <FiShield />

            <span>
              {error}
            </span>

            <button
              onClick={() =>
                fetchLeaderboard(
                  true
                )
              }
            >
              Retry
            </button>
          </div>
        )}

        {/* =================================================
            YOUR POSITION
        ================================================= */}

        {data.currentUser && (
          <motion.section
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="your-position"
          >
            <div className="your-position-main">

              <div className="your-avatar-glow">
                <Avatar
                  user={
                    data.currentUser
                  }
                  size={58}
                />
              </div>

              <div>
                <span>
                  YOUR CURRENT POSITION
                </span>

                <strong>
                  {data.currentUser.name}
                </strong>
              </div>

            </div>

            <div className="position-stat">
              <span>
                Rank
              </span>

              <strong>
                #{data.currentUser.rank}
              </strong>
            </div>

            <div className="position-stat">
              <span>
                XP
              </span>

              <strong>
                {formatNumber(
                  data.currentUser
                    .rankingPoints
                )}
              </strong>
            </div>

            <div className="position-stat">
              <span>
                Percentile
              </span>

              <strong>
                Top{" "}
                {Math.max(
                  1,
                  100 -
                    data.currentUser
                      .percentile
                )}
                %
              </strong>
            </div>

            <div className="position-stat">
              <span>
                Activity
              </span>

              <strong>
                {(
                  data.currentUser
                    .mockTests ||
                  0
                ) +
                  (
                    data.currentUser
                      .interviews ||
                    0
                  ) +
                  (
                    data.currentUser
                      .notes ||
                    0
                  ) +
                  (
                    data.currentUser
                      .resumes ||
                    0
                  )}
              </strong>
            </div>

          </motion.section>
        )}

        {/* =================================================
            PODIUM HEADER
        ================================================= */}

        <section className="section-heading">

          <div>
            <div className="section-eyebrow">
              <FiAward />
              TOP PERFORMERS
            </div>

            <h2>
              Current Champions
            </h2>

            <p>
              The learners leading
              the PrepPulse arena.
            </p>
          </div>

          <div className="total-learners">
            <div className="total-icon">
              <FiUsers />
            </div>

            <div>
              <strong>
                {formatNumber(
                  data.summary
                    ?.totalStudents
                )}
              </strong>

              <span>
                Active Learners
              </span>
            </div>
          </div>

        </section>

        {/* =================================================
            PODIUM
        ================================================= */}

        <section className="champions-arena">

          <div className="arena-top-glow" />

          <div className="arena-particles">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>

          <div className="podium-layout">

            {/* SECOND */}

            <div className="podium-slot second">
              <PodiumPlayer
                user={podium.second}
                rank={2}
                position={2}
              />
            </div>

            {/* FIRST */}

            <div className="podium-slot first">
              <PodiumPlayer
                user={podium.first}
                rank={1}
                position={1}
              />
            </div>

            {/* THIRD */}

            <div className="podium-slot third">
              <PodiumPlayer
                user={podium.third}
                rank={3}
                position={3}
              />
            </div>

          </div>
        </section>

        {/* =================================================
            SUMMARY CARDS
        ================================================= */}

        <section className="summary-grid">

          <div className="summary-card">
            <StatIcon
              type="purple"
              icon={
                <FiUsers />
              }
            />

            <div>
              <span>
                Active Students
              </span>

              <strong>
                {formatNumber(
                  data.summary
                    ?.totalStudents
                )}
              </strong>

              <small>
                Competing now
              </small>
            </div>
          </div>

          <div className="summary-card">
            <StatIcon
              type="cyan"
              icon={
                <FiZap />
              }
            />

            <div>
              <span>
                Total XP
              </span>

              <strong>
                {formatNumber(
                  data.summary
                    ?.totalPoints
                )}
              </strong>

              <small>
                Earned by learners
              </small>
            </div>
          </div>

          <div className="summary-card">
            <StatIcon
              type="gold"
              icon={
                <FiAward />
              }
            />

            <div>
              <span>
                Leader Score
              </span>

              <strong>
                {formatNumber(
                  data.summary
                    ?.topScore
                )}
              </strong>

              <small>
                Current #1
              </small>
            </div>
          </div>

          <div className="summary-card">
            <StatIcon
              type="pink"
              icon={
                <FiTrendingUp />
              }
            />

            <div>
              <span>
                Ranking Period
              </span>

              <strong>
                {range === "all"
                  ? "ALL TIME"
                  : range.toUpperCase()}
              </strong>

              <small>
                Live leaderboard
              </small>
            </div>
          </div>

        </section>

        {/* =================================================
            LEADERBOARD
        ================================================= */}

        <section className="leader-section">

          <div className="leader-section-heading">

            <div>
              <div className="section-eyebrow">
                <FiBarChart2 />
                LIVE RANKINGS
              </div>

              <h2>
                Leaderboard
              </h2>

              <p>
                Rankings update
                automatically as
                students complete
                activities.
              </p>
            </div>

            <div className="live-status">
              <span />
              Real-time
            </div>

          </div>

          <div className="leader-table">

            {/* HEADER */}

            <div className="leader-table-header">

              <span>
                RANK
              </span>

              <span>
                STUDENT
              </span>

              <span>
                XP
              </span>

              <span>
                TESTS
              </span>

              <span>
                INTERVIEWS
              </span>

              <span>
                LEARNING
              </span>

              <span>
                PERFORMANCE
              </span>

            </div>

            {/* ROWS */}

            <AnimatePresence
              mode="popLayout"
            >
              {data.leaderboard
                ?.length > 0 ? (
                data.leaderboard.map(
                  (
                    user,
                    index
                  ) => (
                    <LeaderboardRow
                      key={
                        user.userId
                      }
                      user={user}
                      index={index}
                    />
                  )
                )
              ) : (
                <div className="empty-leaderboard">
                  <div>
                    <FiUsers />
                  </div>

                  <h3>
                    No learners found
                  </h3>

                  <p>
                    Try another
                    search or
                    ranking period.
                  </p>
                </div>
              )}
            </AnimatePresence>

          </div>

          {/* PAGINATION */}

          {data.pagination
            ?.pages > 1 && (
            <div className="pagination">

              <button
                disabled={
                  page === 1
                }
                onClick={() =>
                  setPage(
                    (previous) =>
                      Math.max(
                        1,
                        previous -
                          1
                      )
                  )
                }
              >
                <FiChevronLeft />
              </button>

              {Array.from(
                {
                  length:
                    data.pagination
                      .pages,
                },
                (_, index) =>
                  index + 1
              )
                .slice(
                  0,
                  7
                )
                .map(
                  (
                    pageNumber
                  ) => (
                    <button
                      key={
                        pageNumber
                      }
                      className={
                        page ===
                        pageNumber
                          ? "pagination-active"
                          : ""
                      }
                      onClick={() =>
                        setPage(
                          pageNumber
                        )
                      }
                    >
                      {
                        pageNumber
                      }
                    </button>
                  )
                )}

              <button
                disabled={
                  page ===
                  data.pagination
                    ?.pages
                }
                onClick={() =>
                  setPage(
                    (previous) =>
                      Math.min(
                        data
                          .pagination
                          .pages,
                        previous +
                          1
                      )
                  )
                }
              >
                <FiChevronRight />
              </button>

            </div>
          )}

        </section>

        {/* =================================================
            XP SYSTEM
        ================================================= */}

        <section className="xp-system">

          <div className="xp-system-header">

            <div>
              <div className="section-eyebrow">
                <FiZap />
                XP SYSTEM
              </div>

              <h2>
                How You Climb
              </h2>

              <p>
                Every meaningful
                action on PrepPulse
                contributes to your
                competitive score.
              </p>
            </div>

            <div className="xp-system-icon">
              <FiZap />
            </div>

          </div>

          <div className="xp-cards">

            <div className="xp-card">
              <div className="xp-card-icon blue">
                <FiTarget />
              </div>

              <div>
                <strong>
                  Mock Tests
                </strong>

                <p>
                  Score higher and
                  pass tests to earn
                  more XP.
                </p>

                <span>
                  PERFORMANCE XP
                </span>
              </div>
            </div>

            <div className="xp-card">
              <div className="xp-card-icon purple">
                <FiCpu />
              </div>

              <div>
                <strong>
                  AI Interviews
                </strong>

                <p>
                  Complete mock
                  interviews and
                  improve your score.
                </p>

                <span>
                  INTERVIEW XP
                </span>
              </div>
            </div>

            <div className="xp-card">
              <div className="xp-card-icon cyan">
                <FiBookOpen />
              </div>

              <div>
                <strong>
                  Learning
                </strong>

                <p>
                  Generate notes and
                  analyze your resume.
                </p>

                <span>
                  LEARNING XP
                </span>
              </div>
            </div>

            <div className="xp-card">
                <div className="xp-card-icon pink">
                    <FiTrendingUp />
                </div>

                <div>
                    <strong>
                    Stay Consistent
                    </strong>

                    <p>
                    Keep practicing and
                    move up the rankings.
                    </p>

                    <span>
                    CONSISTENCY
                    </span>
                </div>
            </div>

          </div>
        </section>

        {/* =================================================
            FOOTER
        ================================================= */}

        <footer className="leader-footer">

          <div className="footer-brand">
            <div>
              <FiZap />
            </div>

            <span>
              PrepPulse
            </span>
          </div>

          <span>
            Learn • Practice •
            Compete • Get Hired
          </span>

          <div className="footer-live">
            <span />
            Rankings are live
          </div>

        </footer>

      </main>
    </div>
  );
}

/* =========================================================
   COMPLETE STYLES
========================================================= */

function LeaderboardStyles() {
  return (
    <style>{`

      /* =====================================================
         GLOBAL
      ===================================================== */

      * {
        box-sizing: border-box;
      }

      html,
      body,
      #root {
        min-height: 100%;
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
      select {
        font-family: inherit;
      }

      button {
        cursor: pointer;
      }

      button:disabled {
        cursor: not-allowed;
        opacity: .4;
      }

      /* =====================================================
         APP
      ===================================================== */

      .leaderboard-app {
        position: relative;
        min-height: 100vh;
        overflow-x: hidden;
        background:
          radial-gradient(
            circle at 15% 10%,
            rgba(124,58,237,.12),
            transparent 28%
          ),
          radial-gradient(
            circle at 85% 18%,
            rgba(14,165,233,.08),
            transparent 25%
          ),
          #020617;
      }

      .leader-container {
        position: relative;
        z-index: 5;
        width: min(
          1480px,
          calc(100% - 48px)
        );
        margin: 0 auto;
        padding:
          22px 0 55px;
      }

      /* =====================================================
         BACKGROUND
      ===================================================== */

      .advanced-background {
        position: fixed;
        inset: 0;
        z-index: 0;
        pointer-events: none;
        overflow: hidden;
      }

      .bg-grid {
        position: absolute;
        inset: 0;
        opacity: .045;

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
            transparent 90%
          );
      }

      .bg-noise {
        position: absolute;
        inset: 0;
        opacity: .025;
        background:
          radial-gradient(
            circle at 20% 30%,
            white 0 1px,
            transparent 1px
          );
        background-size: 17px 17px;
      }

      .glow {
        position: absolute;
        border-radius: 50%;
        filter: blur(110px);
        opacity: .13;
        animation:
          backgroundFloat 15s
          ease-in-out
          infinite;
      }

      .glow-purple {
        width: 500px;
        height: 500px;
        top: 20%;
        left: -220px;
        background: #7c3aed;
      }

      .glow-blue {
        width: 450px;
        height: 450px;
        right: -180px;
        top: 38%;
        background: #2563eb;
        animation-delay: -5s;
      }

      .glow-cyan {
        width: 400px;
        height: 400px;
        bottom: -250px;
        left: 42%;
        background: #0891b2;
        animation-delay: -9s;
      }

      .floating-particle {
        position: absolute;
        width: 3px;
        height: 3px;
        border-radius: 50%;
        background: #a78bfa;
        box-shadow:
          0 0 15px
          rgba(167,139,250,.9);

        animation:
          particleFloat 7s
          ease-in-out
          infinite;
      }

      .particle-1 {
        left: 16%;
        top: 28%;
      }

      .particle-2 {
        left: 74%;
        top: 22%;
        animation-delay: -2s;
      }

      .particle-3 {
        left: 83%;
        top: 65%;
        animation-delay: -4s;
      }

      .particle-4 {
        left: 30%;
        top: 78%;
        animation-delay: -1s;
      }

      .particle-5 {
        left: 58%;
        top: 42%;
        animation-delay: -3s;
      }

      /* =====================================================
         NAVIGATION
      ===================================================== */

      .leader-nav {
        height: 58px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 18px;
      }

      .back-dashboard {
        display: flex;
        align-items: center;
        gap: 8px;
        height: 38px;
        padding: 0 12px;
        color: #94a3b8;
        background:
          rgba(15,23,42,.55);
        border:
          1px solid
          rgba(148,163,184,.09);
        border-radius: 11px;
        font-size: .62rem;
        transition: .2s ease;
      }

      .back-dashboard:hover {
        color: white;
        border-color:
          rgba(167,139,250,.3);
        background:
          rgba(124,58,237,.08);
        transform:
          translateX(-2px);
      }

      .back-icon {
        font-size: 15px;
      }

      .nav-center {
        display: flex;
        align-items: center;
        gap: 9px;
        position: absolute;
        left: 50%;
        transform:
          translateX(-50%);
      }

      .nav-brand-mark {
        width: 33px;
        height: 33px;
        display: grid;
        place-items: center;
        color: white;
        border-radius: 10px;
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

      .nav-brand-mark svg {
        font-size: 15px;
      }

      .nav-center strong {
        display: block;
        font-size: .72rem;
        letter-spacing: -.2px;
      }

      .nav-center span {
        display: block;
        margin-top: 1px;
        color: #475569;
        font-size: .4rem;
        letter-spacing: 1px;
        font-weight: 800;
      }

      .nav-actions {
        display: flex;
        align-items: center;
        gap: 7px;
      }

      .live-pill {
        height: 34px;
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 0 10px;
        color: #6ee7b7;
        background:
          rgba(16,185,129,.045);
        border:
          1px solid
          rgba(52,211,153,.13);
        border-radius: 9px;
        font-size: .48rem;
        font-weight: 900;
        letter-spacing: .5px;
      }

      .live-dot,
      .footer-live span {
        width: 6px;
        height: 6px;
        display: block;
        border-radius: 50%;
        background: #34d399;
        box-shadow:
          0 0 10px
          rgba(52,211,153,.8);
        animation:
          pulseDot 1.6s
          infinite;
      }

      .nav-refresh {
        width: 34px;
        height: 34px;
        display: grid;
        place-items: center;
        color: #94a3b8;
        background:
          rgba(15,23,42,.55);
        border:
          1px solid
          rgba(148,163,184,.09);
        border-radius: 9px;
      }

      .nav-refresh:hover {
        color: white;
        border-color:
          rgba(167,139,250,.3);
      }

      .refresh-spin {
        animation:
          spin 1s linear infinite;
      }

      /* =====================================================
         HERO
      ===================================================== */

      .leader-hero {
        position: relative;
        min-height: 420px;
        display: grid;
        grid-template-columns:
          1.15fr .85fr;
        overflow: hidden;
        border-radius: 27px;

        background:
          linear-gradient(
            115deg,
            rgba(15,23,42,.96),
            rgba(7,13,29,.9)
          );

        border:
          1px solid
          rgba(148,163,184,.09);

        box-shadow:
          0 35px 100px
          rgba(0,0,0,.3),
          inset 0 1px 0
          rgba(255,255,255,.035);
      }

      .leader-hero::before {
        content: "";
        position: absolute;
        inset: 0;
        pointer-events: none;

        background:
          radial-gradient(
            circle at 20% 45%,
            rgba(124,58,237,.15),
            transparent 35%
          ),
          radial-gradient(
            circle at 80% 50%,
            rgba(14,165,233,.11),
            transparent 32%
          );
      }

      .hero-left {
        position: relative;
        z-index: 3;
        padding:
          54px
          0
          48px
          clamp(28px,5vw,65px);
      }

      .hero-label {
        width: fit-content;
        display: flex;
        align-items: center;
        gap: 8px;
        color: #c4b5fd;
        font-size: .56rem;
        letter-spacing: 1.1px;
        font-weight: 900;
      }

      .hero-label > span {
        width: 25px;
        height: 25px;
        display: grid;
        place-items: center;
        color: #c084fc;
        border-radius: 8px;
        background:
          rgba(124,58,237,.12);
        border:
          1px solid
          rgba(167,139,250,.14);
      }

      .hero-label svg {
        font-size: 12px;
      }

      .hero-left h1 {
        margin:
          18px
          0
          15px;

        font-size:
          clamp(
            3.1rem,
            6vw,
            5.4rem
          );

        line-height: .9;
        letter-spacing: -5px;
        font-weight: 950;
      }

      .hero-left h1 span {
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

      .hero-left p {
        max-width: 580px;
        margin: 0;
        color: #64748b;
        line-height: 1.8;
        font-size: .75rem;
      }

      .hero-achievements {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 25px;
      }

      .hero-achievements > div {
        display: flex;
        align-items: center;
        gap: 7px;
        height: 35px;
        padding:
          0 9px;
        color: #94a3b8;
        background:
          rgba(255,255,255,.025);
        border:
          1px solid
          rgba(255,255,255,.055);
        border-radius: 9px;
        font-size: .54rem;
        font-weight: 750;
      }

      .achievement-icon {
        width: 23px;
        height: 23px;
        display: grid;
        place-items: center;
        color: #a78bfa;
        border-radius: 7px;
        background:
          rgba(124,58,237,.11);
      }

      .hero-right {
        position: relative;
        min-height: 420px;
        display: grid;
        place-items: center;
      }

      .hero-orbit {
        position: absolute;
        border:
          1px solid
          rgba(167,139,250,.1);
        border-radius: 50%;
      }

      .orbit-large {
        width: 350px;
        height: 350px;
        animation:
          orbitRotate 18s
          linear
          infinite;
      }

      .orbit-small {
        width: 230px;
        height: 230px;
        border-color:
          rgba(34,211,238,.1);
        animation:
          orbitRotate 12s
          linear
          infinite
          reverse;
      }

      .hero-core {
        position: relative;
        width: 180px;
        height: 180px;
        display: grid;
        place-items: center;
        border-radius: 50%;

        background:
          radial-gradient(
            circle at 35% 25%,
            rgba(124,58,237,.42),
            rgba(15,23,42,.96) 65%
          );

        border:
          1px solid
          rgba(167,139,250,.2);

        box-shadow:
          0 0 70px
          rgba(124,58,237,.18),
          inset 0 0 50px
          rgba(59,130,246,.08);
      }

      .core-ring {
        position: absolute;
        inset: -11px;
        border-radius: 50%;
        border:
          1px solid
          rgba(167,139,250,.12);
      }

      .ring-b {
        inset: -24px;
        border-color:
          rgba(34,211,238,.07);
      }

      .hero-award {
        width: 83px;
        height: 83px;
        display: grid;
        place-items: center;
        color: #fbbf24;
        border-radius: 25px;
        background:
          linear-gradient(
            145deg,
            rgba(251,191,36,.15),
            rgba(124,58,237,.12)
          );
        border:
          1px solid
          rgba(251,191,36,.18);
        box-shadow:
          0 0 40px
          rgba(251,191,36,.09);
      }

      .hero-award svg {
        font-size: 39px;
        filter:
          drop-shadow(
            0 0 13px
            rgba(251,191,36,.4)
          );
      }

      .core-xp {
        position: absolute;
        bottom: 17px;
        display: flex;
        align-items: center;
        gap: 4px;
        color: #64748b;
        font-size: .43rem;
        font-weight: 900;
        letter-spacing: 1px;
      }

      .core-xp svg {
        color: #22d3ee;
        font-size: 9px;
      }

      .hero-floating-card {
        position: absolute;
        display: flex;
        align-items: center;
        gap: 7px;
        padding: 9px;
        border-radius: 11px;
        background:
          rgba(7,13,29,.78);
        border:
          1px solid
          rgba(255,255,255,.08);
        backdrop-filter:
          blur(16px);
        box-shadow:
          0 15px 40px
          rgba(0,0,0,.22);
      }

      .hero-floating-card > div {
        width: 28px;
        height: 28px;
        display: grid;
        place-items: center;
        color: #a78bfa;
        border-radius: 8px;
        background:
          rgba(124,58,237,.1);
      }

      .hero-floating-card span {
        color: #64748b;
        font-size: .43rem;
      }

      .hero-floating-card strong {
        color: #cbd5e1;
        font-size: .52rem;
      }

      .card-one {
        top: 65px;
        right: 20px;
        animation:
          floatCard 5s ease-in-out
          infinite;
      }

      .card-two {
        bottom: 62px;
        left: 30px;
        animation:
          floatCard 5s ease-in-out
          infinite
          -2.3s;
      }

      /* =====================================================
         FILTERS
      ===================================================== */

      .filter-panel {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-top: 14px;
        padding: 9px;

        background:
          rgba(7,13,29,.78);

        border:
          1px solid
          rgba(148,163,184,.08);

        border-radius: 16px;

        box-shadow:
          0 20px 50px
          rgba(0,0,0,.18);
      }

      .category-tabs {
        display: flex;
        gap: 3px;
        flex: 1;
      }

      .category-tabs button {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        min-height: 38px;
        padding: 0 13px;
        color: #64748b;
        background: transparent;
        border: 0;
        border-radius: 9px;
        font-size: .56rem;
        font-weight: 800;
        white-space: nowrap;
        transition: .2s ease;
      }

      .category-tabs button span {
        width: 24px;
        height: 24px;
        display: grid;
        place-items: center;
        border-radius: 7px;
        background:
          rgba(255,255,255,.025);
      }

      .category-tabs button:hover {
        color: #cbd5e1;
      }

      .category-tabs button.filter-active {
        color: white;
        background:
          linear-gradient(
            135deg,
            rgba(124,58,237,.2),
            rgba(37,99,235,.12)
          );
        border:
          1px solid
          rgba(167,139,250,.13);
      }

      .category-tabs button.filter-active span {
        color: #c084fc;
        background:
          rgba(124,58,237,.15);
      }

      .filter-right {
        display: flex;
        align-items: center;
        gap: 7px;
      }

      .search-box,
      .period-select {
        height: 38px;
        display: flex;
        align-items: center;
        gap: 7px;
        padding: 0 10px;
        border-radius: 9px;
        background:
          rgba(255,255,255,.025);
        border:
          1px solid
          rgba(255,255,255,.055);
      }

      .search-box {
        width: 205px;
      }

      .search-box > svg,
      .period-select > svg {
        flex-shrink: 0;
        color: #475569;
        font-size: 13px;
      }

      .search-box input {
        width: 100%;
        min-width: 0;
        color: #e2e8f0;
        outline: 0;
        border: 0;
        background: transparent;
        font-size: .55rem;
      }

      .search-box input::placeholder {
        color: #475569;
      }

      .period-select select {
        min-width: 95px;
        color: #94a3b8;
        outline: 0;
        border: 0;
        background: transparent;
        font-size: .55rem;
      }

      /* =====================================================
         ERROR
      ===================================================== */

      .leader-error {
        display: flex;
        align-items: center;
        gap: 9px;
        margin-top: 12px;
        padding: 12px;
        color: #fca5a5;
        background:
          rgba(239,68,68,.055);
        border:
          1px solid
          rgba(239,68,68,.13);
        border-radius: 12px;
        font-size: .57rem;
      }

      .leader-error button {
        margin-left: auto;
        color: #c084fc;
        background: transparent;
        border: 0;
        font-weight: 850;
      }

      /* =====================================================
         YOUR POSITION
      ===================================================== */

      .your-position {
        display: grid;
        grid-template-columns:
          2fr
          repeat(4, 1fr);
        align-items: center;
        gap: 15px;
        margin-top: 14px;
        padding: 15px 18px;
        border-radius: 18px;

        background:
          linear-gradient(
            90deg,
            rgba(124,58,237,.11),
            rgba(15,23,42,.75)
          );

        border:
          1px solid
          rgba(167,139,250,.12);

        box-shadow:
          0 20px 55px
          rgba(0,0,0,.15);
      }

      .your-position-main {
        display: flex;
        align-items: center;
        gap: 11px;
      }

      .your-avatar-glow {
        position: relative;
        padding: 3px;
        border-radius: 17px;
        background:
          linear-gradient(
            135deg,
            #7c3aed,
            #22d3ee
          );
        box-shadow:
          0 0 25px
          rgba(124,58,237,.2);
      }

      .your-position-main span {
        display: block;
        color: #64748b;
        font-size: .46rem;
        font-weight: 900;
        letter-spacing: .8px;
      }

      .your-position-main strong {
        display: block;
        margin-top: 3px;
        color: #e2e8f0;
        font-size: .69rem;
      }

      .position-stat {
        padding-left: 14px;
        border-left:
          1px solid
          rgba(255,255,255,.055);
      }

      .position-stat span {
        display: block;
        color: #475569;
        font-size: .47rem;
      }

      .position-stat strong {
        display: block;
        margin-top: 4px;
        color: #cbd5e1;
        font-size: .84rem;
      }

      /* =====================================================
         SECTION HEADINGS
      ===================================================== */

      .section-heading,
      .leader-section-heading {
        display: flex;
        align-items: end;
        justify-content: space-between;
        margin-top: 35px;
        margin-bottom: 14px;
      }

      .section-eyebrow {
        display: flex;
        align-items: center;
        gap: 6px;
        color: #a78bfa;
        font-size: .5rem;
        font-weight: 900;
        letter-spacing: 1px;
      }

      .section-eyebrow svg {
        font-size: 11px;
      }

      .section-heading h2,
      .leader-section-heading h2 {
        margin:
          6px 0 3px;
        font-size: 1.25rem;
        letter-spacing: -.4px;
      }

      .section-heading p,
      .leader-section-heading p {
        margin: 0;
        color: #475569;
        font-size: .56rem;
      }

      .total-learners {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .total-icon {
        width: 35px;
        height: 35px;
        display: grid;
        place-items: center;
        color: #a78bfa;
        border-radius: 10px;
        background:
          rgba(124,58,237,.09);
        border:
          1px solid
          rgba(167,139,250,.12);
      }

      .total-learners strong {
        display: block;
        font-size: .75rem;
      }

      .total-learners span {
        display: block;
        margin-top: 2px;
        color: #475569;
        font-size: .46rem;
      }

      /* =====================================================
         CHAMPION ARENA
      ===================================================== */

      .champions-arena {
        position: relative;
        min-height: 390px;
        overflow: hidden;
        border-radius: 23px;

        background:
          radial-gradient(
            circle at 50% 42%,
            rgba(124,58,237,.13),
            transparent 28%
          ),
          linear-gradient(
            180deg,
            rgba(9,15,32,.95),
            rgba(4,9,21,.95)
          );

        border:
          1px solid
          rgba(148,163,184,.08);

        box-shadow:
          0 30px 80px
          rgba(0,0,0,.22);
      }

      .champions-arena::before {
        content: "";
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 100px;
        background:
          linear-gradient(
            to top,
            rgba(124,58,237,.06),
            transparent
          );
      }

      .arena-top-glow {
        position: absolute;
        width: 500px;
        height: 160px;
        left: 50%;
        top: -90px;
        transform:
          translateX(-50%);
        border-radius: 50%;
        background:
          rgba(124,58,237,.12);
        filter: blur(45px);
      }

      .arena-particles span {
        position: absolute;
        width: 3px;
        height: 3px;
        border-radius: 50%;
        background: #a78bfa;
        box-shadow:
          0 0 10px
          rgba(167,139,250,.8);
        animation:
          arenaParticle 5s
          infinite;
      }

      .arena-particles span:nth-child(1) {
        left: 14%;
        top: 30%;
      }

      .arena-particles span:nth-child(2) {
        left: 26%;
        top: 62%;
        animation-delay: -1s;
      }

      .arena-particles span:nth-child(3) {
        right: 18%;
        top: 27%;
        animation-delay: -2s;
      }

      .arena-particles span:nth-child(4) {
        right: 29%;
        top: 65%;
        animation-delay: -3s;
      }

      .arena-particles span:nth-child(5) {
        left: 50%;
        top: 15%;
        animation-delay: -4s;
      }

      .podium-layout {
        position: relative;
        z-index: 2;
        width: min(
          1080px,
          92%
        );
        min-height: 390px;
        margin: 0 auto;
        display: grid;
        grid-template-columns:
          1fr
          1.16fr
          1fr;
        align-items: end;
        gap: 18px;
        padding:
          45px 0 0;
      }

      .podium-slot {
        position: relative;
        display: flex;
        align-items: end;
      }

      .podium-slot.first {
        height: 345px;
      }

      .podium-slot.second,
      .podium-slot.third {
        height: 295px;
      }

      /* =====================================================
         PODIUM PLAYER
      ===================================================== */

      .podium-player {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        padding:
          18px
          15px
          30px;
        overflow: hidden;

        border-radius:
          21px
          21px
          12px
          12px;

        background:
          linear-gradient(
            145deg,
            rgba(20,30,51,.95),
            rgba(6,12,26,.96)
          );

        border:
          1px solid
          rgba(148,163,184,.08);

        box-shadow:
          0 25px 70px
          rgba(0,0,0,.28);
      }

      .podium-player.rank-gold {
        border-color:
          rgba(251,191,36,.25);

        background:
          radial-gradient(
            circle at 50% 20%,
            rgba(251,191,36,.07),
            transparent 35%
          ),
          linear-gradient(
            145deg,
            rgba(28,32,51,.98),
            rgba(8,13,27,.98)
          );

        box-shadow:
          0 30px 80px
          rgba(251,191,36,.08);
      }

      .podium-player.rank-silver {
        border-color:
          rgba(203,213,225,.14);
      }

      .podium-player.rank-bronze {
        border-color:
          rgba(217,119,6,.17);
      }

      .podium-player-glow {
        position: absolute;
        width: 190px;
        height: 100px;
        top: -50px;
        border-radius: 50%;
        background:
          rgba(124,58,237,.13);
        filter: blur(35px);
      }

      .rank-gold
      .podium-player-glow {
        background:
          rgba(251,191,36,.13);
      }

      .podium-rank-badge {
        position: absolute;
        top: 13px;
        left: 13px;
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 5px 7px;
        color: #64748b;
        background:
          rgba(255,255,255,.035);
        border:
          1px solid
          rgba(255,255,255,.055);
        border-radius: 7px;
        font-size: .46rem;
        font-weight: 900;
      }

      .rank-gold
      .podium-rank-badge {
        color: #fbbf24;
      }

      .rank-silver
      .podium-rank-badge {
        color: #cbd5e1;
      }

      .rank-bronze
      .podium-rank-badge {
        color: #d97706;
      }

      .rank-icon {
        display: grid;
        place-items: center;
      }

      .rank-icon svg {
        font-size: 12px;
      }

      .podium-avatar-area {
        position: relative;
        margin-top: 24px;
        margin-bottom: 12px;
      }

      .podium-avatar {
        position: relative;
        z-index: 4;
        display: grid;
        place-items: center;
        padding: 5px;
        border-radius: 50%;
        background:
          linear-gradient(
            135deg,
            rgba(124,58,237,.9),
            rgba(34,211,238,.8)
          );
        box-shadow:
          0 0 35px
          rgba(124,58,237,.22);
      }

      .rank-gold .podium-avatar {
        background:
          linear-gradient(
            135deg,
            #f59e0b,
            #fbbf24,
            #a78bfa
          );

        box-shadow:
          0 0 45px
          rgba(251,191,36,.18);
      }

      .leader-avatar {
        position: relative;
        display: grid;
        place-items: center;
        flex-shrink: 0;
        border-radius: 50%;
        color: white;
        font-size: .75rem;
        font-weight: 950;

        background:
          linear-gradient(
            135deg,
            #7c3aed,
            #2563eb
          );

        border:
          2px solid
          rgba(255,255,255,.12);
      }

      .leader-avatar-image {
        object-fit: cover;
        flex-shrink: 0;
        border-radius: 50%;
        border:
          2px solid
          rgba(255,255,255,.13);
      }

      .avatar-ring {
        position: absolute;
        inset: -10px;
        border-radius: 50%;
        border:
          1px solid
          rgba(167,139,250,.13);
        animation:
          ringPulse 3s
          ease-in-out
          infinite;
      }

      .ring-middle {
        inset: -18px;
        border-color:
          rgba(34,211,238,.07);
        animation-delay:
          -.8s;
      }

      .ring-inner {
        inset: -5px;
        border-color:
          rgba(255,255,255,.07);
        animation-delay:
          -1.5s;
      }

      .winner-crown {
        position: absolute;
        right: -4px;
        bottom: -3px;
        z-index: 5;
        width: 29px;
        height: 29px;
        display: grid;
        place-items: center;
        color: #fbbf24;
        border-radius: 9px;
        background:
          #111827;
        border:
          1px solid
          rgba(251,191,36,.25);
        box-shadow:
          0 0 20px
          rgba(251,191,36,.18);
      }

      .winner-crown svg {
        font-size: 14px;
      }

      .podium-player-info {
        position: relative;
        z-index: 3;
        text-align: center;
      }

      .podium-player-info h3 {
        max-width: 190px;
        margin: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: #f1f5f9;
        font-size: .75rem;
        font-weight: 900;
      }

      .podium-player-info p {
        max-width: 180px;
        margin:
          4px 0 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: #475569;
        font-size: .45rem;
      }

      .podium-xp {
        position: relative;
        z-index: 3;
        display: flex;
        align-items: baseline;
        gap: 4px;
        margin-top: 10px;
        color: #fbbf24;
      }

      .podium-xp svg {
        align-self: center;
        font-size: 11px;
      }

      .podium-xp strong {
        font-size: 1.05rem;
        font-weight: 950;
      }

      .podium-xp span {
        color: #64748b;
        font-size: .43rem;
        font-weight: 800;
      }

      .podium-mini-stats {
        position: relative;
        z-index: 3;
        display: grid;
        grid-template-columns:
          repeat(3, 1fr);
        width: 100%;
        margin-top: 12px;
        padding-top: 11px;
        border-top:
          1px solid
          rgba(255,255,255,.055);
      }

      .podium-mini-stats > div {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
      }

      .podium-mini-stats svg {
        color: #64748b;
        font-size: 10px;
      }

      .podium-mini-stats span {
        color: #cbd5e1;
        font-size: .57rem;
        font-weight: 800;
      }

      .podium-mini-stats small {
        color: #334155;
        font-size: .4rem;
      }

      .podium-you {
        position: absolute;
        top: 13px;
        right: 13px;
        z-index: 5;
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 5px 7px;
        color: #6ee7b7;
        background:
          rgba(16,185,129,.06);
        border:
          1px solid
          rgba(52,211,153,.14);
        border-radius: 7px;
        font-size: .42rem;
        font-weight: 900;
      }

      .podium-platform {
        position: absolute;
        left: 8%;
        right: 8%;
        bottom: 0;
        height: 28px;
        z-index: 1;
        perspective: 400px;
      }

      .platform-top {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        height: 14px;
        border-radius: 50%;
        background:
          linear-gradient(
            90deg,
            rgba(124,58,237,.18),
            rgba(34,211,238,.1)
          );
        border:
          1px solid
          rgba(167,139,250,.12);
      }

      .platform-front {
        position: absolute;
        left: 5%;
        right: 5%;
        top: 9px;
        height: 19px;
        border-radius:
          0 0 9px 9px;
        background:
          linear-gradient(
            180deg,
            rgba(30,41,59,.95),
            rgba(8,13,26,.98)
          );
        border:
          1px solid
          rgba(255,255,255,.05);
        box-shadow:
          0 10px 25px
          rgba(0,0,0,.25);
      }

      .podium-empty {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding-bottom: 25px;
        border-radius: 20px 20px 10px 10px;
        border:
          1px dashed
          rgba(148,163,184,.1);
        background:
          rgba(255,255,255,.012);
      }

      .empty-rank {
        position: absolute;
        top: 15px;
        left: 15px;
        color: #475569;
      }

      .empty-user-icon {
        width: 58px;
        height: 58px;
        display: grid;
        place-items: center;
        color: #334155;
        border-radius: 50%;
        background:
          rgba(255,255,255,.025);
        border:
          1px solid
          rgba(255,255,255,.055);
      }

      .empty-user-icon svg {
        font-size: 23px;
      }

      .podium-empty > span {
        margin-top: 9px;
        color: #334155;
        text-align: center;
        font-size: .5rem;
        line-height: 1.5;
      }

      /* =====================================================
         SUMMARY
      ===================================================== */

      .summary-grid {
        display: grid;
        grid-template-columns:
          repeat(4, 1fr);
        gap: 10px;
        margin-top: 13px;
      }

      .summary-card {
        position: relative;
        display: flex;
        align-items: center;
        gap: 11px;
        min-height: 87px;
        padding: 14px;
        overflow: hidden;
        border-radius: 16px;
        background:
          rgba(8,15,30,.75);
        border:
          1px solid
          rgba(148,163,184,.065);
        transition:
          transform .2s ease,
          border-color .2s ease;
      }

      .summary-card:hover {
        transform:
          translateY(-2px);
        border-color:
          rgba(167,139,250,.15);
      }

      .summary-card::after {
        content: "";
        position: absolute;
        width: 100px;
        height: 100px;
        right: -60px;
        top: -60px;
        border-radius: 50%;
        background:
          rgba(124,58,237,.08);
        filter: blur(25px);
      }

      .stat-icon {
        position: relative;
        width: 42px;
        height: 42px;
        flex-shrink: 0;
        display: grid;
        place-items: center;
        border-radius: 12px;
        border: 1px solid;
      }

      .stat-icon-glow {
        position: absolute;
        inset: 5px;
        border-radius: inherit;
        filter: blur(8px);
        opacity: .4;
      }

      .stat-icon svg {
        position: relative;
        z-index: 2;
        font-size: 17px;
      }

      .stat-icon.purple {
        color: #c084fc;
        background:
          rgba(124,58,237,.1);
        border-color:
          rgba(167,139,250,.15);
      }

      .stat-icon.purple .stat-icon-glow {
        background: #7c3aed;
      }

      .stat-icon.cyan {
        color: #22d3ee;
        background:
          rgba(34,211,238,.08);
        border-color:
          rgba(34,211,238,.13);
      }

      .stat-icon.cyan .stat-icon-glow {
        background: #0891b2;
      }

      .stat-icon.gold {
        color: #fbbf24;
        background:
          rgba(251,191,36,.08);
        border-color:
          rgba(251,191,36,.13);
      }

      .stat-icon.gold .stat-icon-glow {
        background: #f59e0b;
      }

      .stat-icon.pink {
        color: #f472b6;
        background:
          rgba(244,114,182,.08);
        border-color:
          rgba(244,114,182,.13);
      }

      .stat-icon.pink .stat-icon-glow {
        background: #db2777;
      }

      .summary-card > div:last-child {
        position: relative;
        z-index: 2;
        min-width: 0;
      }

      .summary-card span {
        display: block;
        color: #64748b;
        font-size: .49rem;
      }

      .summary-card strong {
        display: block;
        margin-top: 3px;
        color: #e2e8f0;
        font-size: .92rem;
        font-weight: 950;
      }

      .summary-card small {
        display: block;
        margin-top: 2px;
        color: #334155;
        font-size: .4rem;
      }

      /* =====================================================
         LEADERBOARD
      ===================================================== */

      .leader-section {
        margin-top: 35px;
      }

      .live-status {
        display: flex;
        align-items: center;
        gap: 6px;
        color: #6ee7b7;
        font-size: .49rem;
        font-weight: 800;
      }

      .live-status span {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #34d399;
        box-shadow:
          0 0 10px
          rgba(52,211,153,.8);
        animation:
          pulseDot 1.5s infinite;
      }

      .leader-table {
        overflow: hidden;
        border-radius: 20px;
        background:
          rgba(7,13,27,.84);
        border:
          1px solid
          rgba(148,163,184,.07);
        box-shadow:
          0 25px 70px
          rgba(0,0,0,.2);
      }

      .leader-table-header,
      .leader-row {
        display: grid;
        grid-template-columns:
          70px
          2.15fr
          100px
          80px
          105px
          90px
          1.45fr;
        align-items: center;
      }

      .leader-table-header {
        min-height: 45px;
        padding:
          0 17px;
        color: #334155;
        background:
          rgba(255,255,255,.016);
        border-bottom:
          1px solid
          rgba(255,255,255,.05);
        font-size: .45rem;
        font-weight: 900;
        letter-spacing: .8px;
      }

      .leader-row {
        position: relative;
        min-height: 78px;
        padding:
          0 17px;
        border-bottom:
          1px solid
          rgba(255,255,255,.04);
        transition:
          background .2s ease;
      }

      .leader-row:last-child {
        border-bottom: 0;
      }

      .leader-row:hover {
        background:
          rgba(124,58,237,.035);
      }

      .leader-row-current {
        background:
          linear-gradient(
            90deg,
            rgba(124,58,237,.09),
            rgba(8,13,27,.1)
          );
      }

      .leader-row-current::before {
        content: "";
        position: absolute;
        left: 0;
        top: 11px;
        bottom: 11px;
        width: 2px;
        border-radius: 5px;
        background:
          linear-gradient(
            #a78bfa,
            #22d3ee
          );
        box-shadow:
          0 0 12px
          rgba(167,139,250,.35);
      }

      .row-rank {
        display: flex;
        align-items: center;
      }

      .row-rank-icon {
        width: 29px;
        height: 29px;
        display: grid;
        place-items: center;
        color: #475569;
        border-radius: 9px;
        background:
          rgba(255,255,255,.025);
        border:
          1px solid
          rgba(255,255,255,.045);
        font-size: .53rem;
        font-weight: 950;
      }

      .row-rank-icon.rank-gold {
        color: #fbbf24;
        background:
          rgba(251,191,36,.07);
        border-color:
          rgba(251,191,36,.14);
      }

      .row-rank-icon.rank-silver {
        color: #cbd5e1;
        background:
          rgba(203,213,225,.06);
        border-color:
          rgba(203,213,225,.1);
      }

      .row-rank-icon.rank-bronze {
        color: #d97706;
        background:
          rgba(217,119,6,.06);
        border-color:
          rgba(217,119,6,.12);
      }

      .row-student {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
      }

      .row-avatar-wrapper {
        position: relative;
      }

      .online-dot {
        position: absolute;
        right: -1px;
        bottom: 1px;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #34d399;
        border: 2px solid #08101f;
      }

      .row-student-info {
        min-width: 0;
      }

      .row-name-line {
        display: flex;
        align-items: center;
        gap: 6px;
        min-width: 0;
      }

      .row-name-line strong {
        max-width: 180px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: #dbe4f0;
        font-size: .62rem;
      }

      .row-student-info > span {
        display: block;
        max-width: 190px;
        margin-top: 3px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: #334155;
        font-size: .44rem;
      }

      .you-label {
        flex-shrink: 0;
        padding: 3px 5px;
        color: #6ee7b7;
        background:
          rgba(16,185,129,.06);
        border:
          1px solid
          rgba(52,211,153,.12);
        border-radius: 5px;
        font-size: .37rem;
        font-weight: 900;
      }

      .row-xp {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .row-xp svg {
        color: #fbbf24;
        font-size: 11px;
      }

      .row-xp strong {
        color: #c084fc;
        font-size: .68rem;
      }

      .row-metric {
        display: flex;
        align-items: center;
        gap: 7px;
      }

      .metric-icon {
        width: 26px;
        height: 26px;
        display: grid;
        place-items: center;
        border-radius: 8px;
      }

      .metric-icon svg {
        font-size: 11px;
      }

      .metric-icon.blue {
        color: #60a5fa;
        background:
          rgba(59,130,246,.08);
      }

      .metric-icon.purple {
        color: #c084fc;
        background:
          rgba(124,58,237,.08);
      }

      .metric-icon.cyan {
        color: #22d3ee;
        background:
          rgba(34,211,238,.07);
      }

      .row-metric > span {
        color: #64748b;
        font-size: .58rem;
        font-weight: 800;
      }

      .row-performance {
        min-width: 0;
        padding-right: 10px;
      }

      .performance-top {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 6px;
      }

      .performance-top span {
        color: #334155;
        font-size: .42rem;
      }

      .performance-top strong {
        color: #64748b;
        font-size: .45rem;
      }

      .performance-track {
        height: 5px;
        overflow: hidden;
        border-radius: 99px;
        background:
          rgba(255,255,255,.045);
      }

      .performance-track > div {
        height: 100%;
        border-radius: inherit;
        background:
          linear-gradient(
            90deg,
            #7c3aed,
            #2563eb,
            #22d3ee
          );
        box-shadow:
          0 0 10px
          rgba(34,211,238,.2);
      }

      .empty-leaderboard {
        min-height: 250px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
      }

      .empty-leaderboard > div {
        width: 50px;
        height: 50px;
        display: grid;
        place-items: center;
        color: #64748b;
        border-radius: 15px;
        background:
          rgba(255,255,255,.025);
        border:
          1px solid
          rgba(255,255,255,.05);
      }

      .empty-leaderboard svg {
        font-size: 20px;
      }

      .empty-leaderboard h3 {
        margin:
          12px 0 4px;
        font-size: .75rem;
      }

      .empty-leaderboard p {
        margin: 0;
        color: #334155;
        font-size: .5rem;
      }

      /* =====================================================
         PAGINATION
      ===================================================== */

      .pagination {
        display: flex;
        justify-content: center;
        gap: 5px;
        margin-top: 14px;
      }

      .pagination button {
        width: 31px;
        height: 31px;
        display: grid;
        place-items: center;
        color: #64748b;
        background:
          rgba(15,23,42,.65);
        border:
          1px solid
          rgba(255,255,255,.055);
        border-radius: 8px;
        font-size: .5rem;
      }

      .pagination button:hover:not(:disabled) {
        color: white;
        border-color:
          rgba(167,139,250,.2);
      }

      .pagination button.pagination-active {
        color: white;
        background:
          linear-gradient(
            135deg,
            #7c3aed,
            #2563eb
          );
        border-color:
          transparent;
        box-shadow:
          0 5px 20px
          rgba(124,58,237,.18);
      }

      /* =====================================================
         XP SYSTEM
      ===================================================== */

      .xp-system {
        position: relative;
        margin-top: 35px;
        padding: 25px;
        overflow: hidden;
        border-radius: 22px;
        background:
          radial-gradient(
            circle at 90% 20%,
            rgba(124,58,237,.12),
            transparent 30%
          ),
          linear-gradient(
            135deg,
            rgba(20,15,45,.72),
            rgba(7,13,28,.85)
          );
        border:
          1px solid
          rgba(167,139,250,.09);
      }

      .xp-system-header {
        display: flex;
        justify-content: space-between;
        align-items: start;
      }

      .xp-system-header h2 {
        margin:
          6px 0 4px;
        font-size: 1.05rem;
      }

      .xp-system-header p {
        margin: 0;
        max-width: 580px;
        color: #475569;
        font-size: .54rem;
        line-height: 1.6;
      }

      .xp-system-icon {
        width: 48px;
        height: 48px;
        display: grid;
        place-items: center;
        color: #c084fc;
        border-radius: 14px;
        background:
          rgba(124,58,237,.09);
        border:
          1px solid
          rgba(167,139,250,.13);
        box-shadow:
          0 0 30px
          rgba(124,58,237,.1);
      }

      .xp-system-icon svg {
        font-size: 21px;
      }

      .xp-cards {
        display: grid;
        grid-template-columns:
          repeat(4, 1fr);
        gap: 9px;
        margin-top: 20px;
      }

      .xp-card {
        display: flex;
        gap: 10px;
        padding: 14px;
        border-radius: 14px;
        background:
          rgba(255,255,255,.022);
        border:
          1px solid
          rgba(255,255,255,.05);
        transition: .2s ease;
      }

      .xp-card:hover {
        transform:
          translateY(-2px);
        border-color:
          rgba(167,139,250,.13);
      }

      .xp-card-icon {
        width: 35px;
        height: 35px;
        flex-shrink: 0;
        display: grid;
        place-items: center;
        border-radius: 10px;
      }

      .xp-card-icon svg {
        font-size: 14px;
      }

      .xp-card-icon.blue {
        color: #60a5fa;
        background:
          rgba(59,130,246,.08);
      }

      .xp-card-icon.purple {
        color: #c084fc;
        background:
          rgba(124,58,237,.08);
      }

      .xp-card-icon.cyan {
        color: #22d3ee;
        background:
          rgba(34,211,238,.07);
      }

      .xp-card-icon.pink {
        color: #f472b6;
        background:
          rgba(244,114,182,.07);
      }

      .xp-card strong {
        display: block;
        color: #dbe4f0;
        font-size: .61rem;
      }

      .xp-card p {
        margin:
          4px 0 7px;
        color: #475569;
        font-size: .48rem;
        line-height: 1.55;
      }

      .xp-card span {
        color: #334155;
        font-size: .4rem;
        font-weight: 900;
        letter-spacing: .7px;
      }

      /* =====================================================
         FOOTER
      ===================================================== */

      .leader-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 40px;
        padding:
          18px 3px 0;
        border-top:
          1px solid
          rgba(255,255,255,.045);
        color: #334155;
        font-size: .47rem;
      }

      .footer-brand {
        display: flex;
        align-items: center;
        gap: 7px;
        color: #64748b;
        font-weight: 850;
      }

      .footer-brand > div {
        width: 25px;
        height: 25px;
        display: grid;
        place-items: center;
        color: #c084fc;
        border-radius: 7px;
        background:
          rgba(124,58,237,.09);
      }

      .footer-live {
        display: flex;
        align-items: center;
        gap: 6px;
        color: #475569;
      }

      /* =====================================================
         LOADING
      ===================================================== */

      .leader-loading {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background:
          radial-gradient(
            circle at center,
            rgba(124,58,237,.12),
            transparent 35%
          ),
          #020617;
      }

      .loading-logo {
        width: 75px;
        height: 75px;
        display: grid;
        place-items: center;
        color: #fbbf24;
        border-radius: 22px;
        background:
          linear-gradient(
            145deg,
            rgba(251,191,36,.12),
            rgba(124,58,237,.12)
          );
        border:
          1px solid
          rgba(251,191,36,.18);
        box-shadow:
          0 0 55px
          rgba(124,58,237,.14);
        animation:
          loadingPulse 2s
          ease-in-out
          infinite;
      }

      .loading-logo svg {
        font-size: 31px;
      }

      .leader-loading h2 {
        margin:
          18px 0 5px;
        font-size: 1rem;
      }

      .leader-loading p {
        margin: 0;
        color: #475569;
        font-size: .57rem;
      }

      .loading-line {
        width: 150px;
        height: 3px;
        margin-top: 18px;
        overflow: hidden;
        border-radius: 99px;
        background:
          rgba(255,255,255,.05);
      }

      .loading-line span {
        display: block;
        width: 50%;
        height: 100%;
        border-radius: inherit;
        background:
          linear-gradient(
            90deg,
            #7c3aed,
            #22d3ee
          );
        animation:
          loadingMove 1.2s
          ease-in-out
          infinite;
      }

      /* =====================================================
         ANIMATIONS
      ===================================================== */

      @keyframes backgroundFloat {
        0%,100% {
          transform:
            translate3d(
              0,
              0,
              0
            );
        }

        50% {
          transform:
            translate3d(
              30px,
              -25px,
              0
            );
        }
      }

      @keyframes particleFloat {
        0%,100% {
          opacity: .2;
          transform:
            translateY(0);
        }

        50% {
          opacity: 1;
          transform:
            translateY(-22px);
        }
      }

      @keyframes pulseDot {
        0%,100% {
          transform: scale(1);
          opacity: 1;
        }

        50% {
          transform: scale(1.5);
          opacity: .5;
        }
      }

      @keyframes spin {
        to {
          transform:
            rotate(360deg);
        }
      }

      @keyframes orbitRotate {
        from {
          transform:
            rotate(0deg);
        }

        to {
          transform:
            rotate(360deg);
        }
      }

      @keyframes floatCard {
        0%,100% {
          transform:
            translateY(0);
        }

        50% {
          transform:
            translateY(-7px);
        }
      }

      @keyframes ringPulse {
        0%,100% {
          opacity: .3;
          transform: scale(1);
        }

        50% {
          opacity: .7;
          transform: scale(1.035);
        }
      }

      @keyframes arenaParticle {
        0%,100% {
          opacity: .15;
          transform:
            translateY(0);
        }

        50% {
          opacity: .9;
          transform:
            translateY(-20px);
        }
      }

      @keyframes loadingPulse {
        0%,100% {
          transform: scale(1);
        }

        50% {
          transform: scale(1.06);
        }
      }

      @keyframes loadingMove {
        0% {
          transform:
            translateX(-100%);
        }

        100% {
          transform:
            translateX(300%);
        }
      }

      /* =====================================================
         RESPONSIVE
      ===================================================== */

      @media (max-width: 1150px) {

        .leader-container {
          width:
            min(
              100% - 28px,
              1100px
            );
        }

        .leader-hero {
          grid-template-columns:
            1fr .7fr;
        }

        .hero-left {
          padding-left: 38px;
        }

        .hero-right {
          opacity: .75;
        }

        .summary-grid {
          grid-template-columns:
            repeat(2, 1fr);
        }

        .xp-cards {
          grid-template-columns:
            repeat(2, 1fr);
        }

        .leader-table {
          overflow-x: auto;
        }

        .leader-table-header,
        .leader-row {
          min-width: 920px;
        }
      }

      @media (max-width: 850px) {

        .leader-hero {
          min-height: 470px;
          grid-template-columns: 1fr;
        }

        .hero-left {
          padding:
            42px 30px;
        }

        .hero-right {
          position: absolute;
          right: -100px;
          bottom: -90px;
          width: 500px;
          min-height: 400px;
          opacity: .3;
        }

        .filter-panel {
          flex-direction: column;
          align-items: stretch;
        }

        .category-tabs {
          overflow-x: auto;
        }

        .filter-right {
          width: 100%;
        }

        .search-box {
          flex: 1;
          width: auto;
        }

        .your-position {
          grid-template-columns:
            2fr 1fr 1fr;
        }

        .position-stat:nth-child(
          n+5
        ) {
          display: none;
        }

        .podium-layout {
          width: 96%;
          gap: 10px;
        }

        .podium-slot.first {
          height: 330px;
        }

        .podium-slot.second,
        .podium-slot.third {
          height: 280px;
        }
      }

      @media (max-width: 650px) {

        .leader-container {
          width:
            calc(100% - 18px);
          padding-top: 12px;
        }

        .leader-nav {
          height: 48px;
        }

        .nav-center {
          display: none;
        }

        .back-dashboard span:last-child {
          display: none;
        }

        .back-dashboard {
          width: 36px;
          justify-content: center;
          padding: 0;
        }

        .leader-hero {
          min-height: 490px;
          border-radius: 20px;
        }

        .hero-left {
          padding:
            35px 22px;
        }

        .hero-left h1 {
          font-size:
            clamp(
              2.8rem,
              14vw,
              4rem
            );
          letter-spacing: -3px;
        }

        .hero-left p {
          max-width: 90%;
          font-size: .67rem;
        }

        .hero-achievements {
          flex-direction: column;
          align-items: flex-start;
        }

        .hero-right {
          right: -130px;
          bottom: -120px;
          transform:
            scale(.82);
        }

        .category-tabs {
          width: 100%;
        }

        .category-tabs button {
          flex-shrink: 0;
          min-width: 105px;
        }

        .filter-right {
          flex-direction: column;
        }

        .search-box,
        .period-select {
          width: 100%;
        }

        .your-position {
          grid-template-columns:
            1fr 1fr;
          gap: 10px;
        }

        .your-position-main {
          grid-column:
            1 / -1;
        }

        .position-stat {
          padding-left: 10px;
        }

        .section-heading,
        .leader-section-heading {
          align-items: start;
        }

        .total-learners {
          display: none;
        }

        .champions-arena {
          min-height: 650px;
        }

        .podium-layout {
          width: 92%;
          min-height: 650px;
          display: grid;
          grid-template-columns:
            1fr 1fr;
          grid-template-rows:
            350px
            245px;
          align-items: end;
          gap: 9px;
        }

        .podium-slot.first {
          grid-column:
            1 / -1;
          grid-row: 1;
          width: 80%;
          justify-self: center;
          height: 340px;
        }

        .podium-slot.second {
          grid-column: 1;
          grid-row: 2;
          height: 235px;
        }

        .podium-slot.third {
          grid-column: 2;
          grid-row: 2;
          height: 235px;
        }

        .podium-player {
          padding:
            16px 9px 28px;
        }

        .podium-player-info h3 {
          font-size: .65rem;
          max-width: 125px;
        }

        .podium-player-info p {
          max-width: 120px;
        }

        .podium-xp strong {
          font-size: .85rem;
        }

        .podium-mini-stats {
          gap: 1px;
        }

        .podium-mini-stats small {
          font-size: .34rem;
        }

        .summary-grid {
          grid-template-columns:
            1fr 1fr;
        }

        .summary-card {
          min-height: 80px;
          padding: 10px;
        }

        .stat-icon {
          width: 36px;
          height: 36px;
        }

        .summary-card strong {
          font-size: .76rem;
        }

        .xp-system {
          padding: 17px;
        }

        .xp-cards {
          grid-template-columns: 1fr;
        }

        .leader-table {
          overflow-x: auto;
        }

        .leader-table-header,
        .leader-row {
          min-width: 920px;
        }

        .leader-footer {
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
        }
      }

      @media (max-width: 420px) {

        .summary-grid {
          grid-template-columns: 1fr;
        }

        .podium-layout {
          width: 96%;
        }

        .podium-slot.first {
          width: 90%;
        }

        .hero-floating-card {
          display: none;
        }
      }

    `}</style>
  );
}

export default Leaderboard;