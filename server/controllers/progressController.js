const Note = require("../models/Notes");
const Resume = require("../models/Resume");
const MockInterview = require("../models/MockInterview");
const MockResult = require("../models/MockResult");
const LoginStreak = require("../models/LoginStreak");

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

const getUserId = (req) => {
  return req.user?._id || req.user?.id;
};

/*
|--------------------------------------------------------------------------
| INDIA DATE HELPERS
|--------------------------------------------------------------------------
|
| Streaks are based on calendar days in India.
| This prevents server timezone differences from breaking streaks.
|
*/

const getIndiaDateKey = (date = new Date()) => {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
};

const getPreviousDateKey = (dateKey) => {
  const [year, month, day] = dateKey
    .split("-")
    .map(Number);

  const date = new Date(
    Date.UTC(
      year,
      month - 1,
      day
    )
  );

  date.setUTCDate(
    date.getUTCDate() - 1
  );

  return date.toISOString().slice(0, 10);
};

const getNextDateKey = (dateKey) => {
  const [year, month, day] = dateKey
    .split("-")
    .map(Number);

  const date = new Date(
    Date.UTC(
      year,
      month - 1,
      day
    )
  );

  date.setUTCDate(
    date.getUTCDate() + 1
  );

  return date.toISOString().slice(0, 10);
};

const startOfDay = (date = new Date()) => {
  const d = new Date(date);

  d.setHours(
    0,
    0,
    0,
    0
  );

  return d;
};

const startOfWeek = (date = new Date()) => {
  const d = startOfDay(date);

  const day = d.getDay();

  const diff =
    day === 0
      ? 6
      : day - 1;

  d.setDate(
    d.getDate() - diff
  );

  return d;
};

const getLastSevenDays = () => {
  const days = [];

  for (
    let i = 6;
    i >= 0;
    i--
  ) {
    const date = startOfDay();

    date.setDate(
      date.getDate() - i
    );

    days.push(date);
  }

  return days;
};

const safeNumber = (value) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
};

const average = (values = []) => {
  if (!values.length) {
    return 0;
  }

  return (
    values.reduce(
      (sum, value) =>
        sum + safeNumber(value),
      0
    ) / values.length
  );
};

/*
|--------------------------------------------------------------------------
| CALCULATE STREAK
|--------------------------------------------------------------------------
*/

const calculateStreak = (loginRecords) => {
  const loginDates = new Set(
    loginRecords.map(
      (record) => record.loginDate
    )
  );

  const today = getIndiaDateKey();

  /*
  |--------------------------------------------------------------------------
  | CURRENT STREAK
  |--------------------------------------------------------------------------
  */

  let currentStreak = 0;

  let cursor = today;

  while (
    loginDates.has(cursor)
  ) {
    currentStreak++;

    cursor =
      getPreviousDateKey(cursor);
  }

  /*
  |--------------------------------------------------------------------------
  | LONGEST STREAK
  |--------------------------------------------------------------------------
  */

  const sortedDates = [
    ...loginDates,
  ].sort();

  let longestStreak = 0;

  let runningStreak = 0;

  let previousDate = null;

  for (
    const date of sortedDates
  ) {
    if (!previousDate) {
      runningStreak = 1;
    } else {
      const expectedNext =
        getNextDateKey(
          previousDate
        );

      if (
        date === expectedNext
      ) {
        runningStreak++;
      } else {
        runningStreak = 1;
      }
    }

    longestStreak =
      Math.max(
        longestStreak,
        runningStreak
      );

    previousDate = date;
  }

  return {
    current: currentStreak,
    longest: longestStreak,
    today,

    loggedInToday:
      loginDates.has(today),

    totalLoginDays:
      loginDates.size,

    lastLoginDate:
      sortedDates.length
        ? sortedDates[
            sortedDates.length - 1
          ]
        : null,
  };
};

/*
|--------------------------------------------------------------------------
| RECORD LOGIN STREAK
|--------------------------------------------------------------------------
|
| Called immediately after successful login.
|
*/

exports.recordLoginStreak =
  async (req, res) => {
    try {
      const userId =
        getUserId(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "User authentication required",
        });
      }

      const today =
        getIndiaDateKey();

      /*
      |--------------------------------------------------------------------------
      | CREATE TODAY'S LOGIN
      |--------------------------------------------------------------------------
      |
      | updateOne + upsert prevents duplicate
      | records when user logs in multiple times.
      |
      */

      try {
        await LoginStreak.updateOne(
          {
            userId,
            loginDate: today,
          },
          {
            $setOnInsert: {
              userId,
              loginDate: today,
            },
          },
          {
            upsert: true,
          }
        );
      } catch (error) {
        /*
        | Duplicate key can happen if two login
        | requests arrive at exactly the same time.
        | The record already exists, so continue.
        */

        if (
          error.code !== 11000
        ) {
          throw error;
        }
      }

      /*
      |--------------------------------------------------------------------------
      | GET ALL LOGIN DAYS
      |--------------------------------------------------------------------------
      */

      const loginRecords =
        await LoginStreak.find({
          userId,
        })
          .sort({
            loginDate: 1,
          })
          .lean();

      const streak =
        calculateStreak(
          loginRecords
        );

      return res.status(200).json({
        success: true,

        message:
          "Login streak updated",

        streak,
      });
    } catch (error) {
      console.error(
        "LOGIN STREAK ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update login streak",
      });
    }
  };

/*
|--------------------------------------------------------------------------
| MAIN PROGRESS ANALYTICS
|--------------------------------------------------------------------------
*/

exports.getProgressAnalytics =
  async (req, res) => {
    try {
      const userId =
        getUserId(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "User authentication required",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | DATES
      |--------------------------------------------------------------------------
      */

      const today =
        startOfDay();

      const weekStart =
        startOfWeek();

      /*
      |--------------------------------------------------------------------------
      | FETCH USER DATA
      |--------------------------------------------------------------------------
      */

      const [
        notes,
        resumes,
        interviews,
        mockResults,
        loginRecords,
      ] = await Promise.all([
        /*
        |--------------------------------------------------------------------------
        | NOTES
        |--------------------------------------------------------------------------
        */

        Note.find({
          userId,
        })
          .sort({
            createdAt: -1,
          })
          .lean(),

        /*
        |--------------------------------------------------------------------------
        | RESUMES
        |--------------------------------------------------------------------------
        */

        Resume.find({
          userId,
        })
          .sort({
            createdAt: -1,
          })
          .lean(),

        /*
        |--------------------------------------------------------------------------
        | IMPORTANT INTERVIEW FIX
        |--------------------------------------------------------------------------
        |
        | MockInterview uses `user`, NOT `userId`.
        |
        | Existing interview controller:
        | MockInterview.create({
        |   user: req.user._id
        | })
        |
        */

        MockInterview.find({
          user: userId,
        })
          .sort({
            createdAt: -1,
          })
          .lean(),

        /*
        |--------------------------------------------------------------------------
        | MOCK TEST RESULTS
        |--------------------------------------------------------------------------
        */

        MockResult.find({
          userId,
        })
          .sort({
            submittedAt: -1,
            createdAt: -1,
          })
          .lean(),

        /*
        |--------------------------------------------------------------------------
        | LOGIN STREAK
        |--------------------------------------------------------------------------
        */

        LoginStreak.find({
          userId,
        })
          .sort({
            loginDate: 1,
          })
          .lean(),
      ]);

      /*
      |--------------------------------------------------------------------------
      | STREAK
      |--------------------------------------------------------------------------
      */

      const streak =
        calculateStreak(
          loginRecords
        );

      /*
      |--------------------------------------------------------------------------
      | NOTES
      |--------------------------------------------------------------------------
      */

      const notesToday =
        notes.filter(
          (note) =>
            new Date(
              note.createdAt
            ) >= today
        ).length;

      const notesThisWeek =
        notes.filter(
          (note) =>
            new Date(
              note.createdAt
            ) >= weekStart
        ).length;

      /*
      |--------------------------------------------------------------------------
      | RESUME
      |--------------------------------------------------------------------------
      */

      const resumeScores =
        resumes
          .map((resume) =>
            safeNumber(
              resume.score ??
                resume.atsScore ??
                resume.analysis?.score
            )
          )
          .filter(
            (score) =>
              score > 0
          );

      const latestResume =
        resumes[0] || null;

      const latestResumeScore =
        latestResume
          ? safeNumber(
              latestResume.score ??
                latestResume.atsScore ??
                latestResume.analysis?.score
            )
          : 0;

      /*
      |--------------------------------------------------------------------------
      | INTERVIEWS
      |--------------------------------------------------------------------------
      |
      | A completed interview can be identified by:
      |
      | 1. status === Completed
      | 2. reportGenerated === true
      | 3. completedAt exists
      |
      */

      const completedInterviews =
        interviews.filter(
          (interview) => {
            const status =
              String(
                interview.status ||
                  ""
              )
                .trim()
                .toLowerCase();

            return (
              status ===
                "completed" ||
              interview.reportGenerated ===
                true ||
              Boolean(
                interview.completedAt
              )
            );
          }
        );

      /*
      |--------------------------------------------------------------------------
      | INTERVIEW SCORES
      |--------------------------------------------------------------------------
      */

      const interviewScores =
        completedInterviews
          .map((interview) =>
            safeNumber(
              interview.overallScore ??
                interview.score
            )
          )
          .filter(
            (score) =>
              score >= 0
          );

      const technicalScores =
        completedInterviews
          .map((interview) =>
            safeNumber(
              interview.technicalScore
            )
          )
          .filter(
            (score) =>
              score > 0
          );

      const communicationScores =
        completedInterviews
          .map((interview) =>
            safeNumber(
              interview.communicationScore
            )
          )
          .filter(
            (score) =>
              score > 0
          );

      const confidenceScores =
        completedInterviews
          .map((interview) =>
            safeNumber(
              interview.confidenceScore
            )
          )
          .filter(
            (score) =>
              score > 0
          );

      /*
      |--------------------------------------------------------------------------
      | MOCK TESTS
      |--------------------------------------------------------------------------
      */

      const testScores =
        mockResults
          .map((result) =>
            safeNumber(
              result.percentage
            )
          )
          .filter(
            (score) =>
              score >= 0
          );

      const passedTests =
        mockResults.filter(
          (result) =>
            result.passed ===
            true
        ).length;

      const failedTests =
        mockResults.filter(
          (result) =>
            result.passed ===
            false
        ).length;

      /*
      |--------------------------------------------------------------------------
      | WEEKLY ACTIVITY
      |--------------------------------------------------------------------------
      */

      const lastSevenDays =
        getLastSevenDays();

      const weeklyActivity =
        lastSevenDays.map(
          (date) => {
            const nextDate =
              new Date(date);

            nextDate.setDate(
              nextDate.getDate() + 1
            );

            const noteCount =
              notes.filter(
                (item) => {
                  const created =
                    new Date(
                      item.createdAt
                    );

                  return (
                    created >= date &&
                    created < nextDate
                  );
                }
              ).length;

            const resumeCount =
              resumes.filter(
                (item) => {
                  const created =
                    new Date(
                      item.createdAt
                    );

                  return (
                    created >= date &&
                    created < nextDate
                  );
                }
              ).length;

            const interviewCount =
              completedInterviews.filter(
                (item) => {
                  const created =
                    new Date(
                      item.completedAt ||
                        item.createdAt
                    );

                  return (
                    created >= date &&
                    created < nextDate
                  );
                }
              ).length;

            const testCount =
              mockResults.filter(
                (item) => {
                  const created =
                    new Date(
                      item.submittedAt ||
                        item.createdAt
                    );

                  return (
                    created >= date &&
                    created < nextDate
                  );
                }
              ).length;

            return {
              date:
                date.toISOString(),

              label:
                date.toLocaleDateString(
                  "en-IN",
                  {
                    weekday:
                      "short",
                  }
                ),

              notes:
                noteCount,

              resumes:
                resumeCount,

              interviews:
                interviewCount,

              tests:
                testCount,

              total:
                noteCount +
                resumeCount +
                interviewCount +
                testCount,
            };
          }
        );

      /*
      |--------------------------------------------------------------------------
      | RECENT ACTIVITY
      |--------------------------------------------------------------------------
      */

      const activities = [];

      /*
      |--------------------------------------------------------------------------
      | NOTES ACTIVITY
      |--------------------------------------------------------------------------
      */

      notes
        .slice(0, 5)
        .forEach(
          (note) => {
            activities.push({
              type: "NOTE",

              title:
                note.title ||
                "AI Study Notes",

              subtitle:
                "AI notes generated",

              score: null,

              date:
                note.createdAt,
            });
          }
        );

      /*
      |--------------------------------------------------------------------------
      | RESUME ACTIVITY
      |--------------------------------------------------------------------------
      */

      resumes
        .slice(0, 5)
        .forEach(
          (resume) => {
            activities.push({
              type: "RESUME",

              title:
                resume.title ||
                resume.fileName ||
                "Resume Analysis",

              subtitle:
                "Resume analyzed",

              score:
                safeNumber(
                  resume.score ??
                    resume.atsScore ??
                    resume.analysis?.score
                ),

              date:
                resume.createdAt,
            });
          }
        );

      /*
      |--------------------------------------------------------------------------
      | INTERVIEW ACTIVITY
      |--------------------------------------------------------------------------
      */

      completedInterviews
        .slice(0, 5)
        .forEach(
          (interview) => {
            activities.push({
              type:
                "INTERVIEW",

              title:
                interview.role ||
                "AI Mock Interview",

              subtitle:
                "Interview completed",

              score:
                safeNumber(
                  interview.overallScore ??
                    interview.score
                ),

              date:
                interview.completedAt ||
                interview.createdAt,
            });
          }
        );

      /*
      |--------------------------------------------------------------------------
      | MOCK TEST ACTIVITY
      |--------------------------------------------------------------------------
      */

      mockResults
        .slice(0, 5)
        .forEach(
          (result) => {
            activities.push({
              type:
                "MOCK_TEST",

              title:
                result.testTitle ||
                "Mock Test",

              subtitle:
                result.passed
                  ? "Mock test passed"
                  : "Mock test completed",

              score:
                safeNumber(
                  result.percentage
                ),

              date:
                result.submittedAt ||
                result.createdAt,
            });
          }
        );

      /*
      |--------------------------------------------------------------------------
      | SORT ACTIVITY
      |--------------------------------------------------------------------------
      */

      activities.sort(
        (a, b) =>
          new Date(b.date) -
          new Date(a.date)
      );

      /*
      |--------------------------------------------------------------------------
      | READINESS SCORE
      |--------------------------------------------------------------------------
      */

      const components = [];

      if (
        resumeScores.length
      ) {
        components.push(
          average(
            resumeScores
          )
        );
      }

      if (
        interviewScores.length
      ) {
        components.push(
          average(
            interviewScores
          )
        );
      }

      if (
        testScores.length
      ) {
        components.push(
          average(
            testScores
          )
        );
      }

      const readinessScore =
        Math.round(
          average(
            components
          )
        );

      /*
      |--------------------------------------------------------------------------
      | RESPONSE
      |--------------------------------------------------------------------------
      */

      return res.status(200).json({
        success: true,

        updatedAt:
          new Date(),

        /*
        |--------------------------------------------------------------------------
        | STREAK
        |--------------------------------------------------------------------------
        */

        streak,

        /*
        |--------------------------------------------------------------------------
        | OVERVIEW
        |--------------------------------------------------------------------------
        */

        overview: {
          notesGenerated:
            notes.length,

          notesToday,

          notesThisWeek,

          resumesAnalyzed:
            resumes.length,

          interviewsAttended:
            completedInterviews.length,

          mockTestsAttempted:
            mockResults.length,

          passedTests,

          failedTests,

          readinessScore,

          currentStreak:
            streak.current,

          longestStreak:
            streak.longest,
        },

        /*
        |--------------------------------------------------------------------------
        | NOTES
        |--------------------------------------------------------------------------
        */

        notes: {
          total:
            notes.length,

          today:
            notesToday,

          thisWeek:
            notesThisWeek,

          latest:
            notes[0] ||
            null,
        },

        /*
        |--------------------------------------------------------------------------
        | RESUME
        |--------------------------------------------------------------------------
        */

        resume: {
          total:
            resumes.length,

          latestScore:
            latestResumeScore,

          averageScore:
            Math.round(
              average(
                resumeScores
              )
            ),

          bestScore:
            resumeScores.length
              ? Math.max(
                  ...resumeScores
                )
              : 0,

          latest:
            latestResume,
        },

        /*
        |--------------------------------------------------------------------------
        | INTERVIEWS
        |--------------------------------------------------------------------------
        */

        interviews: {
          total:
            completedInterviews.length,

          averageScore:
            Math.round(
              average(
                interviewScores
              )
            ),

          bestScore:
            interviewScores.length
              ? Math.max(
                  ...interviewScores
                )
              : 0,

          technicalScore:
            Math.round(
              average(
                technicalScores
              )
            ),

          communicationScore:
            Math.round(
              average(
                communicationScores
              )
            ),

          confidenceScore:
            Math.round(
              average(
                confidenceScores
              )
            ),

          latest:
            completedInterviews[0] ||
            null,
        },

        /*
        |--------------------------------------------------------------------------
        | MOCK TESTS
        |--------------------------------------------------------------------------
        */

        mockTests: {
          total:
            mockResults.length,

          averageScore:
            Math.round(
              average(
                testScores
              )
            ),

          bestScore:
            testScores.length
              ? Math.max(
                  ...testScores
                )
              : 0,

          passed:
            passedTests,

          failed:
            failedTests,

          latest:
            mockResults[0] ||
            null,
        },

        /*
        |--------------------------------------------------------------------------
        | WEEKLY ACTIVITY
        |--------------------------------------------------------------------------
        */

        weeklyActivity,

        /*
        |--------------------------------------------------------------------------
        | RECENT ACTIVITY
        |--------------------------------------------------------------------------
        */

        recentActivity:
          activities.slice(
            0,
            15
          ),
      });
    } catch (error) {
      console.error(
        "Progress Analytics Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load progress analytics",
      });
    }
  };