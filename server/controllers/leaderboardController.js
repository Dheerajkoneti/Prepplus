const User = require("../models/User");
const MockResult = require("../models/MockResult");
const MockInterview = require("../models/MockInterview");
const Note = require("../models/Notes");
const Resume = require("../models/Resume");

/* =========================================================
   HELPERS
========================================================= */

const getUserId = (req) => {
  return req.user?._id || req.user?.id || null;
};

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
    max,
    Math.max(
      min,
      safeNumber(value)
    )
  );
};

const normalizeInterviewScore = (
  score
) => {
  const value = safeNumber(score);

  /*
    Your interview system can contain
    scores on either:

    0 - 10
    or
    0 - 100

    Normalize both to 0 - 100.
  */

  if (value <= 10) {
    return clamp(
      value * 10
    );
  }

  return clamp(value);
};

const getDateRange = (
  range = "all"
) => {
  const now = new Date();

  if (range === "today") {
    const start = new Date(now);

    start.setHours(
      0,
      0,
      0,
      0
    );

    return {
      $gte: start,
    };
  }

  if (range === "week") {
    const start = new Date(now);

    start.setHours(
      0,
      0,
      0,
      0
    );

    const day =
      start.getDay();

    const diff =
      day === 0
        ? 6
        : day - 1;

    start.setDate(
      start.getDate() - diff
    );

    return {
      $gte: start,
    };
  }

  if (range === "month") {
    const start = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    return {
      $gte: start,
    };
  }

  return null;
};

const buildDateMatch = (
  field,
  range
) => {
  const dateFilter =
    getDateRange(range);

  if (!dateFilter) {
    return {};
  }

  return {
    [field]: dateFilter,
  };
};

const createEmptyStats = (
  user
) => {
  return {
    userId: String(
      user._id
    ),

    name:
      user.name ||
      "Learner",

    email:
      user.email ||
      "",

    profilePicture:
      user.profilePicture ||
      "",

    role:
      user.role ||
      "student",

    points: 0,

    testPoints: 0,

    interviewPoints: 0,

    learningPoints: 0,

    mockTests: 0,

    passedTests: 0,

    interviews: 0,

    notes: 0,

    resumes: 0,

    averageTestScore: 0,

    averageInterviewScore: 0,

    bestTestScore: 0,

    bestInterviewScore: 0,

    totalCorrectAnswers: 0,

    totalQuestions: 0,

    lastActivityAt: null,
  };
};

/* =========================================================
   GET LEADERBOARD
========================================================= */

exports.getLeaderboard = async (
  req,
  res
) => {
  try {
    const currentUserId =
      getUserId(req);

    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message:
          "User authentication required",
      });
    }

    const range = String(
      req.query.range ||
        "all"
    ).toLowerCase();

    const category = String(
      req.query.category ||
        "overall"
    ).toLowerCase();

    const search = String(
      req.query.search ||
        ""
    )
      .trim()
      .toLowerCase();

    const page = Math.max(
      1,
      Number(req.query.page) || 1
    );

    const limit = Math.min(
      50,
      Math.max(
        5,
        Number(req.query.limit) || 10
      )
    );

    const validRanges = [
      "today",
      "week",
      "month",
      "all",
    ];

    const validCategories = [
      "overall",
      "tests",
      "interviews",
      "learning",
    ];

    const selectedRange =
      validRanges.includes(range)
        ? range
        : "all";

    const selectedCategory =
      validCategories.includes(
        category
      )
        ? category
        : "overall";

    /* =====================================================
       USERS
    ===================================================== */

    const users =
      await User.find({
        role: {
          $ne: "admin",
        },
      })
        .select(
          "_id name email role profilePicture"
        )
        .lean();

    if (!users.length) {
      return res.json({
        success: true,
        leaderboard: [],
        podium: [],
        currentUser: null,
        pagination: {
          page: 1,
          limit,
          total: 0,
          pages: 0,
        },
      });
    }

    const userIds =
      users.map(
        (user) =>
          user._id
      );

    /* =====================================================
       FETCH ACTIVITY
    ===================================================== */

    const [
      mockResults,
      interviews,
      notes,
      resumes,
    ] = await Promise.all([
      MockResult.find({
        userId: {
          $in: userIds,
        },

        ...buildDateMatch(
          "submittedAt",
          selectedRange
        ),
      })
        .select(
          [
            "userId",
            "percentage",
            "passed",
            "correctAnswers",
            "totalQuestions",
            "submittedAt",
            "status",
            "category",
          ].join(" ")
        )
        .lean(),

      MockInterview.find({
        user: {
          $in: userIds,
        },

        ...buildDateMatch(
          "completedAt",
          selectedRange
        ),
      })
        .select(
          [
            "user",
            "overallScore",
            "score",
            "technicalScore",
            "communicationScore",
            "confidenceScore",
            "status",
            "completedAt",
            "updatedAt",
            "createdAt",
          ].join(" ")
        )
        .lean(),

      Note.find({
        userId: {
          $in: userIds,
        },

        ...buildDateMatch(
          "createdAt",
          selectedRange
        ),
      })
        .select(
          "userId createdAt"
        )
        .lean(),

      Resume.find({
        userId: {
          $in: userIds,
        },

        ...buildDateMatch(
          "createdAt",
          selectedRange
        ),
      })
        .select(
          "userId score atsScore analysis createdAt"
        )
        .lean(),
    ]);

    /* =====================================================
       INITIAL STATS
    ===================================================== */

    const statsMap =
      new Map();

    users.forEach(
      (user) => {
        statsMap.set(
          String(user._id),
          createEmptyStats(
            user
          )
        );
      }
    );

    /* =====================================================
       MOCK TEST POINTS
    ===================================================== */

    mockResults.forEach(
      (result) => {
        const userId =
          String(
            result.userId
          );

        const stats =
          statsMap.get(
            userId
          );

        if (!stats) return;

        const percentage =
          clamp(
            result.percentage
          );

        /*
          Scoring:

          100% test
          = 500 base XP

          Passed bonus
          = +100 XP
        */

        const testPoints =
          Math.round(
            percentage * 5
          ) +
          (result.passed
            ? 100
            : 0);

        stats.testPoints +=
          testPoints;

        stats.mockTests +=
          1;

        if (result.passed) {
          stats.passedTests +=
            1;
        }

        stats.averageTestScore +=
          percentage;

        stats.bestTestScore =
          Math.max(
            stats.bestTestScore,
            percentage
          );

        stats.totalCorrectAnswers +=
          safeNumber(
            result.correctAnswers
          );

        stats.totalQuestions +=
          safeNumber(
            result.totalQuestions
          );

        const date =
          result.submittedAt;

        if (
          date &&
          (
            !stats.lastActivityAt ||
            new Date(date) >
              new Date(
                stats.lastActivityAt
              )
          )
        ) {
          stats.lastActivityAt =
            date;
        }
      }
    );

    /* =====================================================
       INTERVIEW POINTS
    ===================================================== */

    interviews.forEach(
      (interview) => {
        const userId =
          String(
            interview.user
          );

        const stats =
          statsMap.get(
            userId
          );

        if (!stats) return;

        const status =
          String(
            interview.status ||
              ""
          ).toLowerCase();

        const completed =
          status ===
            "completed" ||
          interview.reportGenerated ===
            true ||
          Boolean(
            interview.completedAt
          );

        if (!completed) {
          return;
        }

        const score =
          normalizeInterviewScore(
            interview.overallScore ??
              interview.score
          );

        /*
          Maximum:
          100 score
          = 500 XP
        */

        const interviewPoints =
          Math.round(
            score * 5
          );

        stats.interviewPoints +=
          interviewPoints;

        stats.interviews +=
          1;

        stats.averageInterviewScore +=
          score;

        stats.bestInterviewScore =
          Math.max(
            stats.bestInterviewScore,
            score
          );

        const date =
          interview.completedAt ||
          interview.updatedAt ||
          interview.createdAt;

        if (
          date &&
          (
            !stats.lastActivityAt ||
            new Date(date) >
              new Date(
                stats.lastActivityAt
              )
          )
        ) {
          stats.lastActivityAt =
            date;
        }
      }
    );

    /* =====================================================
       NOTES
    ===================================================== */

    notes.forEach(
      (note) => {
        const userId =
          String(
            note.userId
          );

        const stats =
          statsMap.get(
            userId
          );

        if (!stats) return;

        /*
          Every generated note:
          +25 XP
        */

        stats.learningPoints +=
          25;

        stats.notes +=
          1;

        const date =
          note.createdAt;

        if (
          date &&
          (
            !stats.lastActivityAt ||
            new Date(date) >
              new Date(
                stats.lastActivityAt
              )
          )
        ) {
          stats.lastActivityAt =
            date;
        }
      }
    );

    /* =====================================================
       RESUMES
    ===================================================== */

    resumes.forEach(
      (resume) => {
        const userId =
          String(
            resume.userId
          );

        const stats =
          statsMap.get(
            userId
          );

        if (!stats) return;

        const score =
          clamp(
            resume.score ??
              resume.atsScore ??
              resume.analysis?.score
          );

        /*
          Resume analysis:

          Base = 100 XP
          Score bonus = up to 200 XP

          Maximum = 300 XP
        */

        const resumePoints =
          100 +
          Math.round(
            score * 2
          );

        stats.learningPoints +=
          resumePoints;

        stats.resumes +=
          1;

        const date =
          resume.createdAt;

        if (
          date &&
          (
            !stats.lastActivityAt ||
            new Date(date) >
              new Date(
                stats.lastActivityAt
              )
          )
        ) {
          stats.lastActivityAt =
            date;
        }
      }
    );

    /* =====================================================
       FINAL SCORE
    ===================================================== */

    const allStats =
      Array.from(
        statsMap.values()
      );

    allStats.forEach(
      (stats) => {
        if (
          stats.mockTests >
          0
        ) {
          stats.averageTestScore =
            Math.round(
              stats.averageTestScore /
                stats.mockTests
            );
        }

        if (
          stats.interviews >
          0
        ) {
          stats.averageInterviewScore =
            Math.round(
              stats.averageInterviewScore /
                stats.interviews
            );
        }

        stats.points =
          stats.testPoints +
          stats.interviewPoints +
          stats.learningPoints;
      }
    );

    /* =====================================================
       CATEGORY SCORE
    ===================================================== */

    const rankedStats =
      allStats.map(
        (stats) => {
          let rankingPoints =
            stats.points;

          if (
            selectedCategory ===
            "tests"
          ) {
            rankingPoints =
              stats.testPoints;
          }

          if (
            selectedCategory ===
            "interviews"
          ) {
            rankingPoints =
              stats.interviewPoints;
          }

          if (
            selectedCategory ===
            "learning"
          ) {
            rankingPoints =
              stats.learningPoints;
          }

          return {
            ...stats,
            rankingPoints,
          };
        }
      );

    /* =====================================================
       SEARCH
    ===================================================== */

    let filtered =
      rankedStats;

    if (search) {
      filtered =
        filtered.filter(
          (item) => {
            return (
              item.name
                .toLowerCase()
                .includes(search) ||
              item.email
                .toLowerCase()
                .includes(search)
            );
          }
        );
    }

    /* =====================================================
       SORT
    ===================================================== */

    filtered.sort(
      (a, b) => {
        if (
          b.rankingPoints !==
          a.rankingPoints
        ) {
          return (
            b.rankingPoints -
            a.rankingPoints
          );
        }

        if (
          b.bestTestScore !==
          a.bestTestScore
        ) {
          return (
            b.bestTestScore -
            a.bestTestScore
          );
        }

        return a.name.localeCompare(
          b.name
        );
      }
    );

    /* =====================================================
       RANK
    ===================================================== */

    const total =
      filtered.length;

    filtered =
      filtered.map(
        (item, index) => ({
          ...item,
          rank:
            index + 1,
        })
      );

    /* =====================================================
       PAGINATION
    ===================================================== */

    const totalPages =
      Math.ceil(
        total / limit
      );

    const start =
      (page - 1) *
      limit;

    const paginated =
      filtered.slice(
        start,
        start + limit
      );

    /* =====================================================
       CURRENT USER
    ===================================================== */

    const currentUser =
      filtered.find(
        (item) =>
          String(
            item.userId
          ) ===
          String(
            currentUserId
          )
      );

    let currentUserPayload =
      null;

    if (currentUser) {
      const percentile =
        total > 0
          ? Math.round(
              ((total -
                currentUser.rank) /
                total) *
                100
            )
          : 0;

      currentUserPayload = {
        ...currentUser,
        percentile,
        isCurrentUser: true,
      };
    }

    /* =====================================================
       PODIUM
    ===================================================== */

    const podium =
      filtered
        .slice(0, 3)
        .map(
          (item) => ({
            ...item,
            isCurrentUser:
              String(
                item.userId
              ) ===
              String(
                currentUserId
              ),
          })
        );

    /* =====================================================
       RESPONSE
    ===================================================== */

    return res.status(200).json({
      success: true,

      range: selectedRange,

      category:
        selectedCategory,

      leaderboard:
        paginated.map(
          (item) => ({
            ...item,

            isCurrentUser:
              String(
                item.userId
              ) ===
              String(
                currentUserId
              ),
          })
        ),

      podium,

      currentUser:
        currentUserPayload,

      summary: {
        totalStudents:
          total,

        totalPoints:
          filtered.reduce(
            (
              sum,
              item
            ) =>
              sum +
              item.rankingPoints,
            0
          ),

        topScore:
          filtered.length
            ? filtered[0]
                .rankingPoints
            : 0,
      },

      pagination: {
        page,
        limit,
        total,
        pages:
          totalPages,
      },

      updatedAt:
        new Date(),
    });
  } catch (error) {
    console.error(
      "Leaderboard Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load leaderboard",
      error:
        process.env.NODE_ENV ===
        "development"
          ? error.message
          : undefined,
    });
  }
};