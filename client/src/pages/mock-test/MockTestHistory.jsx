import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMockTestHistory } from "../../services/mockTestService";

const MockTestHistory = () => {
  const navigate = useNavigate();

  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const loadHistory = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await getMockTestHistory();

      const data =
        response?.attempts ||
        response?.data?.attempts ||
        response?.history ||
        response?.data?.history ||
        response?.results ||
        response?.data?.results ||
        response?.data ||
        response;

      setAttempts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load mock test history:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load mock test history."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const getId = (item) => {
    return (
      item?._id ||
      item?.id ||
      item?.attemptId ||
      item?.resultId ||
      null
    );
  };

  const getStatus = (item) => {
    return String(
      item?.status ||
        item?.attemptStatus ||
        "UNKNOWN"
    ).toUpperCase();
  };

  const getTitle = (item) => {
    return (
      item?.testTitle ||
      item?.test?.title ||
      item?.title ||
      "Mock Test"
    );
  };

  const getCategory = (item) => {
    return (
      item?.category ||
      item?.test?.category ||
      "General"
    );
  };

  const getDifficulty = (item) => {
    return (
      item?.difficulty ||
      item?.test?.difficulty ||
      "Mixed"
    );
  };

  const getPercentage = (item) => {
    if (typeof item?.percentage === "number") {
      return item.percentage;
    }

    if (typeof item?.result?.percentage === "number") {
      return item.result.percentage;
    }

    if (
      typeof item?.obtainedMarks === "number" &&
      typeof item?.totalMarks === "number" &&
      item.totalMarks > 0
    ) {
      return (item.obtainedMarks / item.totalMarks) * 100;
    }

    if (
      typeof item?.result?.obtainedMarks === "number" &&
      typeof item?.result?.totalMarks === "number" &&
      item.result.totalMarks > 0
    ) {
      return (
        (item.result.obtainedMarks /
          item.result.totalMarks) *
        100
      );
    }

    return 0;
  };

  const getObtainedMarks = (item) => {
    return (
      item?.obtainedMarks ??
      item?.result?.obtainedMarks ??
      item?.score ??
      item?.result?.score ??
      0
    );
  };

  const getTotalMarks = (item) => {
    return (
      item?.totalMarks ??
      item?.result?.totalMarks ??
      item?.test?.totalMarks ??
      0
    );
  };

  const getTotalQuestions = (item) => {
    return (
      item?.totalQuestions ??
      item?.result?.totalQuestions ??
      item?.test?.totalQuestions ??
      item?.questions?.length ??
      0
    );
  };

  const getAnsweredQuestions = (item) => {
    return (
      item?.answeredQuestions ??
      item?.result?.answeredQuestions ??
      item?.progress?.answeredQuestions ??
      0
    );
  };

  const getTimeTaken = (item) => {
    const seconds =
      item?.timeTakenSeconds ??
      item?.result?.timeTakenSeconds ??
      item?.durationSeconds ??
      0;

    if (!seconds) {
      return "—";
    }

    const totalSeconds = Number(seconds);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor(
      (totalSeconds % 3600) / 60
    );
    const remainingSeconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }

    return `${remainingSeconds}s`;
  };

  const getDate = (item) => {
    return (
      item?.submittedAt ||
      item?.completedAt ||
      item?.updatedAt ||
      item?.startedAt ||
      item?.createdAt ||
      item?.result?.submittedAt ||
      null
    );
  };

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getResultId = (item) => {
    return (
      item?.resultId ||
      item?.result?._id ||
      item?.result?.id ||
      null
    );
  };

  const getAttemptId = (item) => {
    return (
      item?._id ||
      item?.attemptId ||
      item?.attempt?._id ||
      item?.attempt?.id ||
      item?.id ||
      null
    );
  };

  const filteredAttempts = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return attempts.filter((item) => {
      const title =
        getTitle(item).toLowerCase();

      const category =
        getCategory(item);

      const status =
        getStatus(item);

      const matchesSearch =
        !normalizedSearch ||
        title.includes(normalizedSearch) ||
        String(category)
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "ALL" ||
        status === statusFilter;

      const matchesCategory =
        categoryFilter === "ALL" ||
        String(category) === categoryFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory
      );
    });
  }, [
    attempts,
    search,
    statusFilter,
    categoryFilter,
  ]);

  const categories = useMemo(() => {
    const values = attempts.map((item) =>
      getCategory(item)
    );

    return [
      ...new Set(values.filter(Boolean)),
    ];
  }, [attempts]);

  const statistics = useMemo(() => {
    const completed = attempts.filter((item) =>
      ["COMPLETED", "EVALUATING"].includes(
        getStatus(item)
      )
    );

    const passed = attempts.filter(
      (item) =>
        item?.passed === true ||
        item?.result?.passed === true
    );

    const percentages = completed
      .map((item) => getPercentage(item))
      .filter((value) =>
        Number.isFinite(value)
      );

    const average = percentages.length
      ? percentages.reduce(
          (sum, value) => sum + value,
          0
        ) / percentages.length
      : 0;

    const bestScore = percentages.length
      ? Math.max(...percentages)
      : 0;

    return {
      total: attempts.length,
      completed: completed.length,
      passed: passed.length,
      average,
      bestScore,
    };
  }, [attempts]);

  const handleOpenResult = (item) => {
    const resultId = getResultId(item);

    if (resultId) {
      navigate(
        `/mock-tests/result/${resultId}`
      );
      return;
    }

    const attemptId = getAttemptId(item);

    if (
      attemptId &&
      getStatus(item) === "IN_PROGRESS"
    ) {
      navigate(
        `/mock-tests/attempt/${attemptId}`
      );
    }
  };

  const handleContinue = (item) => {
    const attemptId = getAttemptId(item);

    if (attemptId) {
      navigate(
        `/mock-tests/attempt/${attemptId}`
      );
    }
  };

  const getStatusConfig = (status, item) => {
    if (
      item?.passed === true ||
      item?.result?.passed === true
    ) {
      return {
        label: "PASSED",
        className:
          "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
        dot: "bg-emerald-400",
        icon: "✓",
      };
    }

    if (status === "COMPLETED") {
      return {
        label: "COMPLETED",
        className:
          "border-cyan-400/30 bg-cyan-400/10 text-cyan-300",
        dot: "bg-cyan-400",
        icon: "✓",
      };
    }

    if (status === "EVALUATING") {
      return {
        label: "AI EVALUATING",
        className:
          "border-yellow-400/30 bg-yellow-400/10 text-yellow-300",
        dot: "bg-yellow-400",
        icon: "✦",
      };
    }

    if (status === "IN_PROGRESS") {
      return {
        label: "IN PROGRESS",
        className:
          "border-blue-400/30 bg-blue-400/10 text-blue-300",
        dot: "bg-blue-400",
        icon: "▶",
      };
    }

    if (
      status === "TERMINATED" ||
      status === "EXPIRED"
    ) {
      return {
        label: status,
        className:
          "border-red-400/30 bg-red-400/10 text-red-300",
        dot: "bg-red-400",
        icon: "!",
      };
    }

    if (status === "ABANDONED") {
      return {
        label: "ABANDONED",
        className:
          "border-slate-400/30 bg-slate-400/10 text-slate-300",
        dot: "bg-slate-400",
        icon: "—",
      };
    }

    return {
      label: status,
      className:
        "border-slate-400/30 bg-slate-400/10 text-slate-300",
      dot: "bg-slate-400",
      icon: "?",
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] text-white overflow-hidden relative">
        <AnimatedBackground />

        <div className="relative min-h-screen flex items-center justify-center px-6">
          <div className="text-center animate-[fadeUp_.7s_ease-out]">
            <div className="relative mx-auto mb-6 h-20 w-20">
              <div className="absolute inset-0 rounded-3xl bg-cyan-400/20 blur-xl animate-pulse" />

              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-400/30 bg-slate-900/80 shadow-2xl">
                <span className="text-3xl animate-bounce">
                  📊
                </span>
              </div>
            </div>

            <h2 className="text-xl font-bold">
              Loading Performance Center
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Fetching your mock test history...
            </p>

            <div className="mx-auto mt-6 h-1.5 w-48 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full w-1/2 animate-[loadingBar_1.4s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" />
            </div>
          </div>
        </div>

        <style>{`
          @keyframes fadeUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes loadingBar {
            0% {
              transform: translateX(-120%);
            }
            50% {
              transform: translateX(80%);
            }
            100% {
              transform: translateX(260%);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020617] text-white">
      <AnimatedBackground />

      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,.35)_70%)]" />

      <main className="relative z-10 mx-auto w-full max-w-[1550px] px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <header className="mb-10 animate-[fadeUp_.6s_ease-out]">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <button
                onClick={() =>
                  navigate("/mock-tests", {
                    replace: true,
                  })
                }
                className="group mb-6 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-slate-400 backdrop-blur-xl transition-all duration-300 hover:-translate-x-1 hover:border-cyan-400/30 hover:bg-cyan-400/5 hover:text-cyan-300"
              >
                <span className="transition-transform duration-300 group-hover:-translate-x-1">
                  ←
                </span>
                Back to Mock Tests
              </button>

              <div className="mb-4 flex items-center gap-3">
                <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 shadow-lg shadow-cyan-500/10">
                  <span className="text-xl">
                    📈
                  </span>

                  <span className="absolute -right-1 -top-1 h-2.5 w-2.5 animate-ping rounded-full bg-cyan-400" />
                  <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-cyan-400" />
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-400">
                    Performance Center
                  </p>

                  <p className="text-xs text-slate-500">
                    Your learning analytics
                  </p>
                </div>
              </div>

              <h1 className="bg-gradient-to-r from-white via-white to-slate-400 bg-clip-text text-4xl font-black tracking-tight text-transparent sm:text-5xl lg:text-6xl">
                Mock Test History
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                Track your progress, review previous
                attempts and discover where you can
                improve.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() =>
                  loadHistory(true)
                }
                disabled={refreshing}
                className="group inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3.5 text-sm font-semibold text-slate-200 shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-cyan-400/5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span
                  className={
                    refreshing
                      ? "animate-spin"
                      : "transition-transform duration-500 group-hover:rotate-180"
                  }
                >
                  ↻
                </span>
                Refresh
              </button>

              <button
                onClick={() =>
                  navigate(
                    "/mock-tests/create"
                  )
                }
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 px-6 py-3.5 text-sm font-black text-slate-950 shadow-xl shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-cyan-500/30"
              >
                <span className="relative z-10">
                  ✨ Create AI Test
                </span>

                <span className="absolute inset-0 -translate-x-full bg-white/30 transition-transform duration-700 group-hover:translate-x-full" />
              </button>
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-8 animate-[fadeUp_.5s_ease-out] rounded-3xl border border-red-400/20 bg-red-500/[0.06] p-5 shadow-xl shadow-red-950/20 backdrop-blur-xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-400/10 text-xl">
                  ⚠️
                </div>

                <div>
                  <h2 className="font-bold text-red-300">
                    Unable to Load History
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    {error}
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  loadHistory()
                }
                className="rounded-xl bg-red-500/10 px-5 py-2.5 text-sm font-bold text-red-300 transition hover:bg-red-500/20"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        <section className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Total Attempts"
            value={statistics.total}
            icon="📝"
            accent="cyan"
            delay="0ms"
          />

          <StatCard
            label="Completed"
            value={statistics.completed}
            icon="✓"
            accent="blue"
            delay="100ms"
          />

          <StatCard
            label="Passed"
            value={statistics.passed}
            icon="🏆"
            accent="emerald"
            delay="200ms"
          />

          <StatCard
            label="Average Score"
            value={`${statistics.average.toFixed(
              1
            )}%`}
            icon="📊"
            accent="violet"
            delay="300ms"
          />
        </section>

        <section className="mb-8 grid gap-6 lg:grid-cols-[1.5fr_.8fr]">
          <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-2xl backdrop-blur-2xl transition-all duration-500 hover:border-cyan-400/20">
            <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl transition-all duration-700 group-hover:bg-cyan-500/20" />

            <div className="relative">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
                    Performance Overview
                  </p>

                  <h2 className="mt-1 text-xl font-bold">
                    Your average performance
                  </h2>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-400">
                  {statistics.completed} completed
                </div>
              </div>

              <div className="flex flex-col items-center gap-6 sm:flex-row">
                <ScoreRing
                  value={statistics.average}
                />

                <div className="grid w-full grid-cols-2 gap-3">
                  <MiniStat
                    label="Best Score"
                    value={`${statistics.bestScore.toFixed(
                      1
                    )}%`}
                  />

                  <MiniStat
                    label="Passed"
                    value={statistics.passed}
                  />

                  <MiniStat
                    label="Completed"
                    value={statistics.completed}
                  />

                  <MiniStat
                    label="Attempts"
                    value={statistics.total}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-violet-400/10 bg-gradient-to-br from-violet-500/[0.08] via-white/[0.03] to-cyan-500/[0.05] p-6 shadow-2xl backdrop-blur-2xl">
            <div className="absolute -bottom-16 -right-16 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl" />

            <div className="relative">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-400/10 text-xl">
                  🧠
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-300">
                    Smart Insight
                  </p>

                  <h2 className="font-bold">
                    Keep improving
                  </h2>
                </div>
              </div>

              <p className="text-sm leading-7 text-slate-400">
                Consistent practice is the fastest way
                to improve your interview performance.
                Review your results and focus on topics
                where your scores are lower.
              </p>

              <button
                onClick={() =>
                  navigate("/mock-tests")
                }
                className="mt-6 rounded-xl border border-violet-400/20 bg-violet-400/10 px-4 py-2.5 text-sm font-bold text-violet-200 transition-all hover:-translate-y-0.5 hover:bg-violet-400/20"
              >
                Practice Again →
              </button>
            </div>
          </div>
        </section>

        <section className="mb-8 rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl backdrop-blur-2xl">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                History Explorer
              </p>

              <h2 className="mt-1 text-xl font-bold">
                Find an attempt
              </h2>
            </div>

            <span className="text-xs text-slate-500">
              {filteredAttempts.length} of{" "}
              {attempts.length} results
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-[1.5fr_1fr_1fr]">
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                ⌕
              </span>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search tests or categories..."
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 py-3.5 pl-11 pr-4 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-cyan-400/40 focus:bg-slate-950 focus:ring-4 focus:ring-cyan-400/5"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3.5 text-sm text-white outline-none transition-all focus:border-cyan-400/40 focus:ring-4 focus:ring-cyan-400/5"
            >
              <option value="ALL">
                All Statuses
              </option>
              <option value="COMPLETED">
                Completed
              </option>
              <option value="EVALUATING">
                AI Evaluating
              </option>
              <option value="IN_PROGRESS">
                In Progress
              </option>
              <option value="TERMINATED">
                Terminated
              </option>
              <option value="EXPIRED">
                Expired
              </option>
              <option value="ABANDONED">
                Abandoned
              </option>
            </select>

            <select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(
                  event.target.value
                )
              }
              className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3.5 text-sm text-white outline-none transition-all focus:border-cyan-400/40 focus:ring-4 focus:ring-cyan-400/5"
            >
              <option value="ALL">
                All Categories
              </option>

              {categories.map((category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              ))}
            </select>
          </div>

          {(search ||
            statusFilter !== "ALL" ||
            categoryFilter !== "ALL") && (
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("ALL");
                setCategoryFilter("ALL");
              }}
              className="mt-4 text-xs font-semibold text-cyan-400 transition hover:text-cyan-300"
            >
              Clear all filters ×
            </button>
          )}
        </section>

        {!error &&
          filteredAttempts.length === 0 && (
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] px-6 py-20 text-center shadow-2xl backdrop-blur-2xl">
              <div className="absolute left-1/2 top-0 h-48 w-48 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />

              <div className="relative">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-400/20 bg-cyan-400/10 text-4xl shadow-lg shadow-cyan-500/10">
                  📊
                </div>

                <h2 className="text-2xl font-black">
                  No Test Attempts Found
                </h2>

                <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500">
                  {attempts.length === 0
                    ? "You haven't attempted any mock tests yet. Start your first AI-powered assessment."
                    : "No tests match your current filters. Try changing your search criteria."}
                </p>

                <button
                  onClick={() =>
                    attempts.length === 0
                      ? navigate("/mock-tests")
                      : (() => {
                          setSearch("");
                          setStatusFilter("ALL");
                          setCategoryFilter("ALL");
                        })()
                  }
                  className="mt-7 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3.5 font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-cyan-500/30"
                >
                  {attempts.length === 0
                    ? "Browse Mock Tests"
                    : "Clear Filters"}
                </button>
              </div>
            </div>
          )}

        {filteredAttempts.length > 0 && (
          <section className="space-y-5">
            {filteredAttempts.map(
              (item, index) => {
                const id =
                  getId(item) || index;

                const status =
                  getStatus(item);

                const statusConfig =
                  getStatusConfig(
                    status,
                    item
                  );

                const percentage =
                  getPercentage(item);

                const obtained =
                  getObtainedMarks(item);

                const total =
                  getTotalMarks(item);

                const totalQuestions =
                  getTotalQuestions(item);

                const answered =
                  getAnsweredQuestions(item);

                const resultId =
                  getResultId(item);

                const attemptId =
                  getAttemptId(item);

                const canViewResult =
                  Boolean(resultId);

                const canContinue =
                  status ===
                    "IN_PROGRESS" &&
                  Boolean(attemptId);

                const answerPercentage =
                  totalQuestions > 0
                    ? Math.round(
                        (answered /
                          totalQuestions) *
                          100
                      )
                    : 0;

                return (
                  <article
                    key={id}
                    className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-xl backdrop-blur-2xl transition-all duration-500 hover:-translate-y-1 hover:border-cyan-400/20 hover:bg-white/[0.05] hover:shadow-2xl hover:shadow-cyan-950/20 sm:p-6"
                    style={{
                      animation:
                        "fadeUp .55s ease-out both",
                      animationDelay: `${
                        Math.min(
                          index,
                          8
                        ) * 70
                      }ms`,
                    }}
                  >
                    <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-cyan-500/0 blur-3xl transition-all duration-700 group-hover:bg-cyan-500/10" />

                    <div className="relative">
                      <div className="flex flex-col gap-6 xl:flex-row xl:items-center">
                        <div className="min-w-0 flex-1">
                          <div className="mb-4 flex flex-wrap items-center gap-2">
                            <Badge>
                              {getCategory(item)}
                            </Badge>

                            <Badge muted>
                              {getDifficulty(item)}
                            </Badge>

                            <span
                              className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-[10px] font-black tracking-wide ${statusConfig.className}`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot} ${
                                  status ===
                                    "IN_PROGRESS" ||
                                  status ===
                                    "EVALUATING"
                                    ? "animate-pulse"
                                    : ""
                                }`}
                              />

                              {
                                statusConfig.icon
                              }

                              {
                                statusConfig.label
                              }
                            </span>
                          </div>

                          <h2 className="truncate text-xl font-black text-white transition-colors group-hover:text-cyan-100 sm:text-2xl">
                            {getTitle(item)}
                          </h2>

                          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                            <span className="inline-flex items-center gap-1.5">
                              <span>◷</span>
                              {formatDate(
                                getDate(item)
                              )}
                            </span>

                            <span className="hidden h-1 w-1 rounded-full bg-slate-700 sm:block" />

                            <span>
                              {getDifficulty(
                                item
                              )}{" "}
                              assessment
                            </span>
                          </div>

                          <div className="mt-6 max-w-xl">
                            <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-wider">
                              <span className="text-slate-600">
                                Question Progress
                              </span>

                              <span className="font-bold text-slate-400">
                                {answered}/
                                {
                                  totalQuestions
                                }
                              </span>
                            </div>

                            <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-1000"
                                style={{
                                  width: `${Math.min(
                                    answerPercentage,
                                    100
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:w-[520px]">
                          <HistoryMetric
                            label="Score"
                            value={`${Number(
                              percentage
                            ).toFixed(
                              1
                            )}%`}
                            highlight
                          />

                          <HistoryMetric
                            label="Marks"
                            value={`${obtained}/${total}`}
                          />

                          <HistoryMetric
                            label="Questions"
                            value={`${answered}/${totalQuestions}`}
                          />

                          <HistoryMetric
                            label="Time"
                            value={getTimeTaken(
                              item
                            )}
                          />
                        </div>

                        <div className="flex gap-3 xl:w-[180px] xl:flex-col">
                          {canViewResult && (
                            <button
                              onClick={() =>
                                handleOpenResult(
                                  item
                                )
                              }
                              className="group/button flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-3.5 text-sm font-black text-slate-950 shadow-lg shadow-cyan-500/10 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-cyan-500/20"
                            >
                              View Result
                              <span className="transition-transform group-hover/button:translate-x-1">
                                →
                              </span>
                            </button>
                          )}

                          {canContinue && (
                            <button
                              onClick={() =>
                                handleContinue(
                                  item
                                )
                              }
                              className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-blue-400/20 bg-blue-400/10 px-4 py-3.5 text-sm font-bold text-blue-300 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-400/15"
                            >
                              Continue
                              <span>
                                →
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              }
            )}
          </section>
        )}

        <div className="mt-10 flex justify-center">
          <button
            onClick={() =>
              navigate("/mock-tests", {
                replace: true,
              })
            }
            className="group inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-3.5 text-sm font-semibold text-slate-400 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/20 hover:bg-cyan-400/5 hover:text-white"
          >
            <span className="transition-transform duration-300 group-hover:-translate-x-1">
              ←
            </span>
            Back to Mock Tests
          </button>
        </div>
      </main>

      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes floatOne {
          0%, 100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(30px, -25px, 0);
          }
        }

        @keyframes floatTwo {
          0%, 100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(-35px, 25px, 0);
          }
        }

        @keyframes floatThree {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          50% {
            transform: translate3d(20px, 30px, 0) rotate(8deg);
          }
        }
      `}</style>
    </div>
  );
};

const AnimatedBackground = () => {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div
        className="absolute left-[5%] top-[8%] h-[420px] w-[420px] rounded-full bg-cyan-500/[0.07] blur-[120px]"
        style={{
          animation:
            "floatOne 9s ease-in-out infinite",
        }}
      />

      <div
        className="absolute right-[5%] top-[25%] h-[380px] w-[380px] rounded-full bg-blue-600/[0.07] blur-[120px]"
        style={{
          animation:
            "floatTwo 11s ease-in-out infinite",
        }}
      />

      <div
        className="absolute bottom-[5%] left-[40%] h-[300px] w-[300px] rounded-full bg-violet-600/[0.06] blur-[110px]"
        style={{
          animation:
            "floatThree 13s ease-in-out infinite",
        }}
      />

      <div className="absolute inset-0 opacity-[0.025] [background-image:linear-gradient(rgba(255,255,255,.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.5)_1px,transparent_1px)] [background-size:60px_60px]" />
    </div>
  );
};

const StatCard = ({
  label,
  value,
  icon,
  accent,
  delay,
}) => {
  const accentClasses = {
    cyan: {
      glow: "group-hover:bg-cyan-500/10",
      icon: "bg-cyan-400/10 text-cyan-300 border-cyan-400/20",
      value: "text-cyan-300",
    },
    blue: {
      glow: "group-hover:bg-blue-500/10",
      icon: "bg-blue-400/10 text-blue-300 border-blue-400/20",
      value: "text-blue-300",
    },
    emerald: {
      glow: "group-hover:bg-emerald-500/10",
      icon: "bg-emerald-400/10 text-emerald-300 border-emerald-400/20",
      value: "text-emerald-300",
    },
    violet: {
      glow: "group-hover:bg-violet-500/10",
      icon: "bg-violet-400/10 text-violet-300 border-violet-400/20",
      value: "text-violet-300",
    },
  };

  const colors =
    accentClasses[accent];

  return (
    <div
      className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-xl backdrop-blur-2xl transition-all duration-500 hover:-translate-y-1 hover:border-white/20 hover:shadow-2xl ${colors.glow}`}
      style={{
        animation:
          "fadeUp .6s ease-out both",
        animationDelay: delay,
      }}
    >
      <div className="relative flex items-start justify-between">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl border text-xl ${colors.icon}`}
        >
          {icon}
        </div>

        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-50" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-400" />
        </span>
      </div>

      <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>

      <p
        className={`mt-1 text-3xl font-black ${colors.value}`}
      >
        {value}
      </p>
    </div>
  );
};

const ScoreRing = ({ value }) => {
  const safeValue = Math.min(
    Math.max(Number(value) || 0, 0),
    100
  );

  const radius = 48;
  const circumference =
    2 * Math.PI * radius;

  const offset =
    circumference -
    (safeValue / 100) *
      circumference;

  return (
    <div className="relative flex h-40 w-40 shrink-0 items-center justify-center">
      <svg
        className="-rotate-90"
        width="160"
        height="160"
        viewBox="0 0 120 120"
      >
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,.06)"
          strokeWidth="8"
        />

        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />

        <defs>
          <linearGradient
            id="scoreGradient"
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
              offset="100%"
              stopColor="#6366f1"
            />
          </linearGradient>
        </defs>
      </svg>

      <div className="absolute text-center">
        <p className="text-3xl font-black text-white">
          {safeValue.toFixed(1)}%
        </p>

        <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-slate-500">
          Average
        </p>
      </div>
    </div>
  );
};

const MiniStat = ({
  label,
  value,
}) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 transition-all duration-300 hover:border-cyan-400/20 hover:bg-cyan-400/[0.03]">
      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-600">
        {label}
      </p>

      <p className="mt-1 text-xl font-black text-white">
        {value}
      </p>
    </div>
  );
};

const Badge = ({
  children,
  muted = false,
}) => {
  return (
    <span
      className={`rounded-xl border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide ${
        muted
          ? "border-white/10 bg-white/[0.04] text-slate-400"
          : "border-cyan-400/20 bg-cyan-400/[0.06] text-cyan-300"
      }`}
    >
      {children}
    </span>
  );
};

const HistoryMetric = ({
  label,
  value,
  highlight = false,
}) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-4 transition-all duration-300 group-hover:border-white/15">
      <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-600">
        {label}
      </p>

      <p
        className={`mt-1 text-lg font-black ${
          highlight
            ? "text-cyan-300"
            : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
};

export default MockTestHistory;