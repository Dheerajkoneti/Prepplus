import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import TestCard from "../../components/mock-test/TestCard";

import {
  getMockTests,
} from "../../services/mockTestService";

const MockTests = () => {
  const navigate = useNavigate();

  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    category: "",
    difficulty: "",
  });

  const [activeCategory, setActiveCategory] = useState("");

  const categories = [
    {
      name: "Aptitude",
      icon: "🧮",
      description: "Quantitative & verbal",
      gradient: "from-cyan-500 to-blue-600",
    },
    {
      name: "Reasoning",
      icon: "🧠",
      description: "Logical thinking",
      gradient: "from-violet-500 to-purple-600",
    },
    {
      name: "Java",
      icon: "☕",
      description: "Core Java & OOP",
      gradient: "from-orange-500 to-red-600",
    },
    {
      name: "Python",
      icon: "🐍",
      description: "Python programming",
      gradient: "from-yellow-400 to-blue-600",
    },
    {
      name: "SQL",
      icon: "🗄️",
      description: "Queries & databases",
      gradient: "from-emerald-400 to-cyan-600",
    },
    {
      name: "DSA",
      icon: "⚡",
      description: "Algorithms & coding",
      gradient: "from-pink-500 to-rose-600",
    },
    {
      name: "Full Stack",
      icon: "🌐",
      description: "Frontend & backend",
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      name: "AI/ML",
      icon: "🤖",
      description: "AI & machine learning",
      gradient: "from-fuchsia-500 to-violet-600",
    },
  ];

  const loadTests = async () => {
    try {
      setLoading(true);

      const response = await getMockTests(filters);

      console.log("Mock Tests Response:", response);

      let testData = [];

      if (Array.isArray(response)) {
        testData = response;
      } else if (Array.isArray(response?.tests)) {
        testData = response.tests;
      } else if (Array.isArray(response?.data)) {
        testData = response.data;
      } else if (Array.isArray(response?.data?.tests)) {
        testData = response.data.tests;
      }

      setTests(testData);
    } catch (error) {
      console.error(
        "Failed to load mock tests:",
        error
      );

      setTests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTests();
  }, [
    filters.category,
    filters.difficulty,
  ]);

  const handleCreateAITest = () => {
    navigate("/mock-tests/create");
  };

  const handleStart = (test) => {
    if (!test?._id) {
      return;
    }

    navigate(`/mock-tests/${test._id}`);
  };

  const handleReset = () => {
    setFilters({
      category: "",
      difficulty: "",
    });

    setActiveCategory("");
  };

  const handleCategory = (category) => {
    setActiveCategory(category);

    setFilters((previous) => ({
      ...previous,
      category:
        previous.category === category
          ? ""
          : category,
    }));
  };

  const totalQuestions = useMemo(() => {
    return tests.reduce(
      (total, test) =>
        total +
        Number(test?.totalQuestions || 0),
      0
    );
  }, [tests]);

  const averageDuration = useMemo(() => {
    if (!tests.length) {
      return 0;
    }

    const total = tests.reduce(
      (sum, test) =>
        sum +
        Number(test?.durationMinutes || 0),
      0
    );

    return Math.round(total / tests.length);
  }, [tests]);

  const difficultyCount = useMemo(() => {
    return {
      Easy: tests.filter(
        (test) =>
          test?.difficulty === "Easy"
      ).length,

      Medium: tests.filter(
        (test) =>
          test?.difficulty === "Medium"
      ).length,

      Hard: tests.filter(
        (test) =>
          test?.difficulty === "Hard"
      ).length,
    };
  }, [tests]);

  return (
    <div className="min-h-screen overflow-hidden bg-[#020617] text-white">

      <style>
        {`
          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-18px);
            }
          }

          @keyframes floatSlow {
            0%, 100% {
              transform: translate3d(0, 0, 0);
            }
            50% {
              transform: translate3d(25px, -20px, 0);
            }
          }

          @keyframes pulseGlow {
            0%, 100% {
              opacity: .35;
              transform: scale(1);
            }
            50% {
              opacity: .65;
              transform: scale(1.08);
            }
          }

          @keyframes shimmer {
            0% {
              background-position: -1000px 0;
            }
            100% {
              background-position: 1000px 0;
            }
          }

          @keyframes gradientMove {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }

          @keyframes spinSlow {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          .float-animation {
            animation: float 5s ease-in-out infinite;
          }

          .float-slow {
            animation: floatSlow 9s ease-in-out infinite;
          }

          .pulse-glow {
            animation: pulseGlow 4s ease-in-out infinite;
          }

          .gradient-animation {
            background-size: 200% 200%;
            animation: gradientMove 8s ease infinite;
          }

          .spin-slow {
            animation: spinSlow 18s linear infinite;
          }

          .glass-card {
            background:
              linear-gradient(
                135deg,
                rgba(255,255,255,.065),
                rgba(255,255,255,.02)
              );
            border: 1px solid rgba(255,255,255,.09);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
          }

          .glass-card:hover {
            border-color: rgba(34,211,238,.28);
            background:
              linear-gradient(
                135deg,
                rgba(34,211,238,.075),
                rgba(255,255,255,.025)
              );
          }

          .grid-bg {
            background-image:
              linear-gradient(
                rgba(148,163,184,.045) 1px,
                transparent 1px
              ),
              linear-gradient(
                90deg,
                rgba(148,163,184,.045) 1px,
                transparent 1px
              );
            background-size: 45px 45px;
          }

          .hero-shadow {
            box-shadow:
              0 0 80px rgba(6,182,212,.10),
              inset 0 1px 0 rgba(255,255,255,.04);
          }
        `}
      </style>

      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        <div className="grid-bg absolute inset-0 opacity-40" />

        <div
          className="
            absolute
            left-[-180px]
            top-[-150px]
            h-[550px]
            w-[550px]
            rounded-full
            bg-cyan-500/10
            blur-[150px]
            pulse-glow
          "
        />

        <div
          className="
            absolute
            right-[-150px]
            top-[15%]
            h-[500px]
            w-[500px]
            rounded-full
            bg-violet-600/10
            blur-[150px]
            float-slow
          "
        />

        <div
          className="
            absolute
            bottom-[-200px]
            left-[35%]
            h-[500px]
            w-[500px]
            rounded-full
            bg-blue-600/10
            blur-[160px]
          "
        />

      </div>

      <main
        className="
          relative
          z-10
          mx-auto
          max-w-[1500px]
          px-4
          py-6
          sm:px-6
          lg:px-8
        "
      >

        <section
          className="
            relative
            mb-8
            overflow-hidden
            rounded-[32px]
            border
            border-white/10
            bg-white/[0.025]
            p-6
            shadow-2xl
            shadow-cyan-950/20
            md:p-10
            lg:p-14
          "
        >

          <div
            className="
              absolute
              right-[-100px]
              top-[-100px]
              h-[400px]
              w-[400px]
              rounded-full
              border
              border-cyan-400/10
              spin-slow
            "
          />

          <div
            className="
              absolute
              right-[70px]
              top-[50px]
              h-[220px]
              w-[220px]
              rounded-full
              border
              border-blue-400/10
            "
          />

          <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_420px]">

            <div>

              <div
                className="
                  mb-6
                  inline-flex
                  items-center
                  gap-3
                  rounded-full
                  border
                  border-cyan-400/20
                  bg-cyan-400/[0.06]
                  px-4
                  py-2
                  text-xs
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-cyan-300
                "
              >
                <span
                  className="
                    relative
                    flex
                    h-2.5
                    w-2.5
                  "
                >
                  <span
                    className="
                      absolute
                      inline-flex
                      h-full
                      w-full
                      animate-ping
                      rounded-full
                      bg-cyan-400
                      opacity-75
                    "
                  />
                  <span
                    className="
                      relative
                      inline-flex
                      h-2.5
                      w-2.5
                      rounded-full
                      bg-cyan-400
                    "
                  />
                </span>

                AI-Powered Assessment Platform
              </div>

              <h1
                className="
                  max-w-4xl
                  text-4xl
                  font-black
                  leading-[1.05]
                  tracking-tight
                  sm:text-5xl
                  lg:text-7xl
                "
              >
                Practice like it's
                <span
                  className="
                    ml-3
                    bg-gradient-to-r
                    from-cyan-300
                    via-blue-400
                    to-violet-400
                    bg-clip-text
                    text-transparent
                  "
                >
                  the real interview.
                </span>
              </h1>

              <p
                className="
                  mt-6
                  max-w-2xl
                  text-sm
                  leading-7
                  text-slate-400
                  sm:text-base
                  lg:text-lg
                "
              >
                Build confidence with AI-generated
                mock tests, real-time exams, smart
                evaluation and detailed performance
                analytics designed for serious
                placement preparation.
              </p>

              <div
                className="
                  mt-8
                  flex
                  flex-col
                  gap-3
                  sm:flex-row
                "
              >

                <button
                  type="button"
                  onClick={handleCreateAITest}
                  className="
                    group
                    relative
                    overflow-hidden
                    rounded-2xl
                    bg-gradient-to-r
                    from-cyan-500
                    via-blue-500
                    to-violet-600
                    px-7
                    py-4
                    font-bold
                    shadow-xl
                    shadow-cyan-500/20
                    transition
                    duration-300
                    hover:-translate-y-1
                    hover:shadow-cyan-500/30
                  "
                >
                  <span
                    className="
                      absolute
                      inset-0
                      -translate-x-full
                      bg-white/20
                      transition
                      duration-700
                      group-hover:translate-x-full
                    "
                  />

                  <span className="relative flex items-center justify-center gap-2">
                    ✨
                    Create AI Mock Test
                    <span className="transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/mock-tests/history")
                  }
                  className="
                    rounded-2xl
                    border
                    border-white/10
                    bg-white/[0.04]
                    px-7
                    py-4
                    font-semibold
                    text-slate-200
                    transition
                    duration-300
                    hover:-translate-y-1
                    hover:border-white/20
                    hover:bg-white/[0.08]
                  "
                >
                  <span className="flex items-center justify-center gap-2">
                    📊
                    View My History
                  </span>
                </button>

              </div>

              <div
                className="
                  mt-8
                  flex
                  flex-wrap
                  gap-x-6
                  gap-y-3
                  text-xs
                  text-slate-500
                "
              >
                <span className="flex items-center gap-2">
                  <span className="text-emerald-400">
                    ✓
                  </span>
                  AI Generated Questions
                </span>

                <span className="flex items-center gap-2">
                  <span className="text-emerald-400">
                    ✓
                  </span>
                  Real-Time Evaluation
                </span>

                <span className="flex items-center gap-2">
                  <span className="text-emerald-400">
                    ✓
                  </span>
                  Secure Exam Mode
                </span>
              </div>

            </div>

            <div className="relative hidden min-h-[360px] items-center justify-center lg:flex">

              <div
                className="
                  absolute
                  h-[280px]
                  w-[280px]
                  rounded-full
                  bg-cyan-500/10
                  blur-[60px]
                  pulse-glow
                "
              />

              <div
                className="
                  relative
                  flex
                  h-[270px]
                  w-[270px]
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-cyan-400/20
                  bg-slate-950/60
                  shadow-2xl
                  shadow-cyan-500/20
                  backdrop-blur-xl
                "
              >

                <div
                  className="
                    absolute
                    inset-5
                    rounded-full
                    border
                    border-dashed
                    border-cyan-400/20
                    spin-slow
                  "
                />

                <div
                  className="
                    absolute
                    inset-10
                    rounded-full
                    border
                    border-blue-400/10
                  "
                />

                <div className="relative text-center float-animation">

                  <div className="mb-3 text-7xl">
                    🤖
                  </div>

                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-400">
                    AI ENGINE
                  </p>

                  <p className="mt-2 text-sm text-slate-400">
                    Ready to challenge you
                  </p>

                </div>

              </div>

              <div
                className="
                  absolute
                  left-0
                  top-12
                  rounded-2xl
                  border
                  border-white/10
                  bg-slate-900/80
                  px-4
                  py-3
                  shadow-xl
                  backdrop-blur-xl
                "
              >
                <p className="text-[10px] uppercase tracking-wider text-slate-500">
                  AI Evaluation
                </p>
                <p className="mt-1 text-sm font-bold text-emerald-400">
                  ● Active
                </p>
              </div>

              <div
                className="
                  absolute
                  bottom-12
                  right-0
                  rounded-2xl
                  border
                  border-white/10
                  bg-slate-900/80
                  px-4
                  py-3
                  shadow-xl
                  backdrop-blur-xl
                "
              >
                <p className="text-[10px] uppercase tracking-wider text-slate-500">
                  Exam Mode
                </p>
                <p className="mt-1 text-sm font-bold text-cyan-400">
                  🔒 Secure
                </p>
              </div>

            </div>

          </div>

        </section>

        <section
          className="
            mb-8
            grid
            gap-4
            sm:grid-cols-2
            lg:grid-cols-4
          "
        >

          <StatCard
            icon="📝"
            label="Available Tests"
            value={loading ? "—" : tests.length}
            description="Practice assessments"
            gradient="from-cyan-500/20 to-blue-500/5"
          />

          <StatCard
            icon="🎯"
            label="Questions"
            value={
              loading
                ? "—"
                : totalQuestions
            }
            description="Across available tests"
            gradient="from-violet-500/20 to-purple-500/5"
          />

          <StatCard
            icon="⏱️"
            label="Avg Duration"
            value={
              loading
                ? "—"
                : `${averageDuration}m`
            }
            description="Average test time"
            gradient="from-emerald-500/20 to-cyan-500/5"
          />

          <StatCard
            icon="🔥"
            label="Difficulty"
            value={
              loading
                ? "—"
                : `${difficultyCount.Hard || 0}`
            }
            description="Hard-level challenges"
            gradient="from-orange-500/20 to-red-500/5"
          />

        </section>

        <section className="mb-10">

          <div className="mb-5 flex items-end justify-between gap-4">

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                Explore
              </p>

              <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                Practice by skill
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Pick a domain and start sharpening
                your skills.
              </p>
            </div>

            <span className="hidden text-xs text-slate-600 sm:block">
              {categories.length} categories
            </span>

          </div>

          <div
            className="
              grid
              gap-3
              sm:grid-cols-2
              md:grid-cols-4
            "
          >

            {categories.map((category) => {
              const selected =
                activeCategory ===
                category.name;

              return (
                <button
                  key={category.name}
                  type="button"
                  onClick={() =>
                    handleCategory(
                      category.name
                    )
                  }
                  className={`
                    group
                    relative
                    overflow-hidden
                    rounded-2xl
                    border
                    p-4
                    text-left
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    ${
                      selected
                        ? "border-cyan-400/50 bg-cyan-400/[0.08] shadow-lg shadow-cyan-500/10"
                        : "border-white/8 bg-white/[0.025] hover:border-white/15 hover:bg-white/[0.05]"
                    }
                  `}
                >

                  <div
                    className={`
                      absolute
                      right-0
                      top-0
                      h-20
                      w-20
                      rounded-full
                      bg-gradient-to-br
                      ${category.gradient}
                      opacity-0
                      blur-2xl
                      transition
                      duration-500
                      group-hover:opacity-30
                    `}
                  />

                  <div className="relative flex items-center gap-3">

                    <div
                      className="
                        flex
                        h-11
                        w-11
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-white/[0.06]
                        text-xl
                        transition
                        duration-300
                        group-hover:scale-110
                      "
                    >
                      {category.icon}
                    </div>

                    <div className="min-w-0">

                      <p className="truncate text-sm font-bold text-white">
                        {category.name}
                      </p>

                      <p className="mt-1 truncate text-[11px] text-slate-500">
                        {category.description}
                      </p>

                    </div>

                    <span
                      className="
                        ml-auto
                        text-slate-600
                        transition
                        group-hover:translate-x-1
                        group-hover:text-cyan-400
                      "
                    >
                      →
                    </span>

                  </div>

                </button>
              );
            })}

          </div>

        </section>

        <section
          className="
            mb-8
            glass-card
            rounded-3xl
            p-5
            shadow-xl
            shadow-black/20
            md:p-6
          "
        >

          <div
            className="
              flex
              flex-col
              gap-5
              lg:flex-row
              lg:items-center
              lg:justify-between
            "
          >

            <div>

              <div className="flex items-center gap-3">

                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-cyan-500/10
                    text-lg
                  "
                >
                  🎛️
                </div>

                <div>
                  <h2 className="font-bold">
                    Find your perfect test
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Filter assessments by category
                    and difficulty.
                  </p>
                </div>

              </div>

            </div>

            <div
              className="
                flex
                flex-col
                gap-3
                sm:flex-row
              "
            >

              <div className="relative">

                <span
                  className="
                    pointer-events-none
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-sm
                    text-slate-500
                  "
                >
                  ◉
                </span>

                <select
                  value={filters.category}
                  onChange={(event) =>
                    setFilters(
                      (previous) => ({
                        ...previous,
                        category:
                          event.target.value,
                      })
                    )
                  }
                  className="
                    min-w-[190px]
                    appearance-none
                    rounded-xl
                    border
                    border-white/10
                    bg-slate-950
                    py-3
                    pl-10
                    pr-10
                    text-sm
                    text-white
                    outline-none
                    transition
                    focus:border-cyan-400/50
                    focus:ring-2
                    focus:ring-cyan-400/10
                  "
                >
                  <option value="">
                    All Categories
                  </option>

                  <option value="Aptitude">
                    Aptitude
                  </option>

                  <option value="Reasoning">
                    Reasoning
                  </option>

                  <option value="Java">
                    Java
                  </option>

                  <option value="Python">
                    Python
                  </option>

                  <option value="SQL">
                    SQL
                  </option>

                  <option value="DSA">
                    DSA
                  </option>

                  <option value="Web Development">
                    Web Development
                  </option>

                  <option value="Full Stack">
                    Full Stack
                  </option>

                  <option value="AI/ML">
                    AI/ML
                  </option>

                  <option value="Computer Science">
                    Computer Science
                  </option>

                  <option value="Technical">
                    Technical
                  </option>
                </select>

              </div>

              <div className="relative">

                <span
                  className="
                    pointer-events-none
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-sm
                    text-slate-500
                  "
                >
                  ◈
                </span>

                <select
                  value={filters.difficulty}
                  onChange={(event) =>
                    setFilters(
                      (previous) => ({
                        ...previous,
                        difficulty:
                          event.target.value,
                      })
                    )
                  }
                  className="
                    min-w-[180px]
                    appearance-none
                    rounded-xl
                    border
                    border-white/10
                    bg-slate-950
                    py-3
                    pl-10
                    pr-10
                    text-sm
                    text-white
                    outline-none
                    transition
                    focus:border-cyan-400/50
                    focus:ring-2
                    focus:ring-cyan-400/10
                  "
                >
                  <option value="">
                    All Difficulties
                  </option>

                  <option value="Easy">
                    Easy
                  </option>

                  <option value="Medium">
                    Medium
                  </option>

                  <option value="Hard">
                    Hard
                  </option>

                  <option value="Mixed">
                    Mixed
                  </option>
                </select>

              </div>

              <button
                type="button"
                onClick={handleReset}
                className="
                  rounded-xl
                  border
                  border-white/10
                  bg-white/[0.03]
                  px-5
                  py-3
                  text-sm
                  font-semibold
                  text-slate-300
                  transition
                  hover:border-red-400/30
                  hover:bg-red-400/5
                  hover:text-red-300
                "
              >
                ↻ Reset
              </button>

            </div>

          </div>

          {(filters.category ||
            filters.difficulty) && (
            <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-white/5 pt-4">

              <span className="text-xs text-slate-500">
                Active:
              </span>

              {filters.category && (
                <FilterBadge
                  label={filters.category}
                  onRemove={() =>
                    setFilters(
                      (previous) => ({
                        ...previous,
                        category: "",
                      })
                    )
                  }
                />
              )}

              {filters.difficulty && (
                <FilterBadge
                  label={filters.difficulty}
                  onRemove={() =>
                    setFilters(
                      (previous) => ({
                        ...previous,
                        difficulty: "",
                      })
                    )
                  }
                />
              )}

            </div>
          )}

        </section>

        <section>

          <div
            className="
              mb-6
              flex
              flex-col
              gap-3
              sm:flex-row
              sm:items-end
              sm:justify-between
            "
          >

            <div>

              <div className="flex items-center gap-3">

                <div
                  className="
                    h-8
                    w-1
                    rounded-full
                    bg-gradient-to-b
                    from-cyan-400
                    to-blue-600
                  "
                />

                <div>

                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-400">
                    Assessment Library
                  </p>

                  <h2 className="mt-1 text-2xl font-bold">
                    Available Mock Tests
                  </h2>

                </div>

              </div>

            </div>

            {!loading && (
              <div className="text-xs text-slate-500">
                {tests.length} test
                {tests.length !== 1
                  ? "s"
                  : ""}{" "}
                available
              </div>
            )}

          </div>

          {loading && (
            <div
              className="
                grid
                gap-6
                md:grid-cols-2
                lg:grid-cols-3
              "
            >
              {[1, 2, 3, 4, 5, 6].map(
                (item) => (
                  <TestSkeleton
                    key={item}
                  />
                )
              )}
            </div>
          )}

          {!loading &&
            tests.length > 0 && (
              <div
                className="
                  grid
                  gap-6
                  md:grid-cols-2
                  lg:grid-cols-3
                "
              >
                {tests.map((test, index) => (
                  <div
                    key={
                      test?._id ||
                      `test-${index}`
                    }
                    className="
                      group
                      transition
                      duration-500
                      hover:-translate-y-1
                    "
                  >
                    <div
                      className="
                        relative
                        h-full
                        overflow-hidden
                        rounded-3xl
                      "
                    >

                      <div
                        className="
                          pointer-events-none
                          absolute
                          -inset-[1px]
                          rounded-3xl
                          bg-gradient-to-br
                          from-cyan-500/0
                          via-blue-500/0
                          to-violet-500/0
                          opacity-0
                          blur-sm
                          transition
                          duration-500
                          group-hover:from-cyan-500/30
                          group-hover:via-blue-500/20
                          group-hover:to-violet-500/30
                          group-hover:opacity-100
                        "
                      />

                      <div className="relative h-full">

                        <TestCard
                          test={test}
                          onStart={handleStart}
                        />

                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}

          {!loading &&
            tests.length === 0 && (
              <div
                className="
                  relative
                  overflow-hidden
                  rounded-[32px]
                  border
                  border-white/10
                  bg-white/[0.025]
                  px-6
                  py-16
                  text-center
                  shadow-2xl
                "
              >

                <div
                  className="
                    absolute
                    left-1/2
                    top-0
                    h-40
                    w-80
                    -translate-x-1/2
                    rounded-full
                    bg-cyan-500/10
                    blur-[80px]
                  "
                />

                <div className="relative">

                  <div
                    className="
                      mx-auto
                      flex
                      h-24
                      w-24
                      items-center
                      justify-center
                      rounded-3xl
                      border
                      border-cyan-400/20
                      bg-cyan-400/5
                      text-5xl
                      shadow-xl
                      shadow-cyan-500/10
                      float-animation
                    "
                  >
                    🤖
                  </div>

                  <p className="mt-7 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                    No matching tests
                  </p>

                  <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
                    Build your own AI challenge
                  </h2>

                  <p
                    className="
                      mx-auto
                      mt-3
                      max-w-xl
                      text-sm
                      leading-6
                      text-slate-500
                    "
                  >
                    Create a personalized mock
                    test with your preferred
                    subject, difficulty, number
                    of questions and duration.
                  </p>

                  <div
                    className="
                      mt-7
                      flex
                      flex-col
                      justify-center
                      gap-3
                      sm:flex-row
                    "
                  >

                    <button
                      type="button"
                      onClick={handleCreateAITest}
                      className="
                        rounded-2xl
                        bg-gradient-to-r
                        from-cyan-500
                        to-blue-600
                        px-7
                        py-3.5
                        font-bold
                        shadow-lg
                        shadow-cyan-500/20
                        transition
                        hover:-translate-y-1
                      "
                    >
                      ✨ Generate AI Test
                    </button>

                    {(filters.category ||
                      filters.difficulty) && (
                      <button
                        type="button"
                        onClick={handleReset}
                        className="
                          rounded-2xl
                          border
                          border-white/10
                          bg-white/[0.03]
                          px-7
                          py-3.5
                          font-semibold
                          text-slate-300
                          transition
                          hover:bg-white/[0.07]
                        "
                      >
                        Clear Filters
                      </button>
                    )}

                  </div>

                </div>

              </div>
            )}

        </section>

        <section className="mt-14">

          <div className="mb-6">

            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Built for placement preparation
            </p>

            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
              Everything you need to prepare smarter
            </h2>

          </div>

          <div
            className="
              grid
              gap-4
              md:grid-cols-2
              lg:grid-cols-4
            "
          >

            <FeatureCard
              icon="🤖"
              title="AI Question Generation"
              description="Generate questions tailored to your selected subject, topics and difficulty."
            />

            <FeatureCard
              icon="🔒"
              title="Secure Exam Mode"
              description="Practice in a controlled environment with real-time security monitoring."
            />

            <FeatureCard
              icon="🧠"
              title="Smart Evaluation"
              description="Get detailed evaluation, explanations and AI-powered feedback."
            />

            <FeatureCard
              icon="📊"
              title="Performance Analytics"
              description="Track your scores, strengths, weaknesses and preparation progress."
            />

          </div>

        </section>

        <section
          className="
            relative
            mt-10
            overflow-hidden
            rounded-3xl
            border
            border-cyan-400/10
            bg-gradient-to-r
            from-cyan-500/[0.08]
            via-blue-500/[0.05]
            to-violet-500/[0.08]
            p-6
            md:p-8
          "
        >

          <div
            className="
              absolute
              right-[-60px]
              top-[-100px]
              h-64
              w-64
              rounded-full
              bg-cyan-500/10
              blur-[70px]
            "
          />

          <div
            className="
              relative
              flex
              flex-col
              gap-5
              md:flex-row
              md:items-center
              md:justify-between
            "
          >

            <div>

              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                <span>⚡</span>
                Ready when you are
              </div>

              <h2 className="mt-2 text-2xl font-bold">
                Turn practice into confidence.
              </h2>

              <p className="mt-2 max-w-xl text-sm text-slate-500">
                Stop just watching tutorials.
                Start testing yourself under
                real exam conditions.
              </p>

            </div>

            <button
              type="button"
              onClick={handleCreateAITest}
              className="
                shrink-0
                rounded-2xl
                bg-white
                px-6
                py-3.5
                font-bold
                text-slate-950
                shadow-xl
                transition
                hover:-translate-y-1
                hover:bg-cyan-50
              "
            >
              Start Practicing →
            </button>

          </div>

        </section>

        <footer
          className="
            mt-10
            border-t
            border-white/5
            py-6
            text-center
            text-xs
            text-slate-600
          "
        >
          <span>
            PrepPulse AI Assessment Platform
          </span>

          <span className="mx-2">
            •
          </span>

          <span>
            Practice smarter. Perform better.
          </span>
        </footer>

      </main>
    </div>
  );
};

const StatCard = ({
  icon,
  label,
  value,
  description,
  gradient,
}) => {
  return (
    <div
      className="
        group
        relative
        overflow-hidden
        rounded-2xl
        border
        border-white/8
        bg-white/[0.025]
        p-5
        transition
        duration-300
        hover:-translate-y-1
        hover:border-white/15
      "
    >

      <div
        className={`
          absolute
          right-0
          top-0
          h-28
          w-28
          rounded-full
          bg-gradient-to-br
          ${gradient}
          blur-2xl
          opacity-60
        `}
      />

      <div className="relative">

        <div className="flex items-start justify-between">

          <div
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-xl
              bg-white/[0.06]
              text-xl
              transition
              duration-300
              group-hover:scale-110
            "
          >
            {icon}
          </div>

          <span className="text-xs text-slate-600">
            LIVE
          </span>

        </div>

        <p className="mt-5 text-3xl font-black tracking-tight">
          {value}
        </p>

        <p className="mt-1 text-sm font-semibold text-slate-300">
          {label}
        </p>

        <p className="mt-1 text-xs text-slate-600">
          {description}
        </p>

      </div>

    </div>
  );
};

const FeatureCard = ({
  icon,
  title,
  description,
}) => {
  return (
    <div
      className="
        glass-card
        group
        rounded-2xl
        p-5
        transition
        duration-300
        hover:-translate-y-1
      "
    >

      <div
        className="
          mb-5
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-xl
          bg-white/[0.06]
          text-2xl
          transition
          duration-300
          group-hover:scale-110
        "
      >
        {icon}
      </div>

      <h3 className="font-bold">
        {title}
      </h3>

      <p className="mt-2 text-xs leading-6 text-slate-500">
        {description}
      </p>

      <div
        className="
          mt-5
          h-px
          w-0
          bg-gradient-to-r
          from-cyan-400
          to-blue-500
          transition-all
          duration-500
          group-hover:w-full
        "
      />

    </div>
  );
};

const FilterBadge = ({
  label,
  onRemove,
}) => {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="
        inline-flex
        items-center
        gap-2
        rounded-full
        border
        border-cyan-400/20
        bg-cyan-400/5
        px-3
        py-1.5
        text-xs
        font-medium
        text-cyan-300
        transition
        hover:border-red-400/30
        hover:bg-red-400/5
        hover:text-red-300
      "
    >
      {label}

      <span>
        ×
      </span>
    </button>
  );
};

const TestSkeleton = () => {
  return (
    <div
      className="
        overflow-hidden
        rounded-3xl
        border
        border-white/5
        bg-white/[0.025]
        p-5
      "
    >

      <div
        className="
          h-36
          animate-pulse
          rounded-2xl
          bg-white/[0.05]
        "
      />

      <div
        className="
          mt-5
          h-5
          w-3/4
          animate-pulse
          rounded-lg
          bg-white/[0.05]
        "
      />

      <div
        className="
          mt-3
          h-3
          w-full
          animate-pulse
          rounded-lg
          bg-white/[0.04]
        "
      />

      <div
        className="
          mt-2
          h-3
          w-2/3
          animate-pulse
          rounded-lg
          bg-white/[0.04]
        "
      />

      <div
        className="
          mt-7
          h-11
          w-full
          animate-pulse
          rounded-xl
          bg-white/[0.05]
        "
      />

    </div>
  );
};

export default MockTests;