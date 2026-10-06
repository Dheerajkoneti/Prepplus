import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateAIMockTest } from "../../services/mockTestService";

const SUBJECTS = [
  "Aptitude",
  "Reasoning",
  "Java",
  "Python",
  "SQL",
  "DSA",
  "Web Development",
  "Full Stack",
  "AI/ML",
  "Computer Science",
  "Technical",
];

const TOPICS = {
  Java: [
    "OOP",
    "Collections",
    "Exception Handling",
    "Java 8",
    "Multithreading",
    "JVM",
    "Strings",
    "Generics",
    "Streams",
  ],

  Python: [
    "Python Basics",
    "OOP",
    "Functions",
    "Collections",
    "Exception Handling",
    "File Handling",
    "Modules",
  ],

  SQL: [
    "SELECT",
    "Joins",
    "Subqueries",
    "Group By",
    "Aggregate Functions",
    "Indexes",
    "Normalization",
    "Transactions",
  ],

  DSA: [
    "Arrays",
    "Strings",
    "Linked Lists",
    "Stacks",
    "Queues",
    "Trees",
    "Graphs",
    "Sorting",
    "Searching",
    "Dynamic Programming",
  ],

  "Computer Science": [
    "Operating Systems",
    "Computer Networks",
    "DBMS",
    "OOP",
    "Software Engineering",
    "Computer Architecture",
  ],

  "Web Development": [
    "HTML",
    "CSS",
    "JavaScript",
    "React",
    "REST API",
    "HTTP",
  ],

  "Full Stack": [
    "React",
    "Node.js",
    "Express",
    "MongoDB",
    "REST API",
    "Authentication",
  ],

  "AI/ML": [
    "Machine Learning",
    "Deep Learning",
    "NLP",
    "Neural Networks",
    "Python",
    "Model Evaluation",
  ],

  Aptitude: [
    "Percentages",
    "Profit and Loss",
    "Time and Work",
    "Time Speed Distance",
    "Ratio",
    "Average",
    "Probability",
  ],

  Reasoning: [
    "Number Series",
    "Coding Decoding",
    "Blood Relations",
    "Direction Sense",
    "Analogy",
    "Classification",
    "Puzzles",
  ],

  Technical: [
    "Programming Fundamentals",
    "DBMS",
    "OS",
    "Networks",
    "OOP",
    "Data Structures",
  ],
};

const SUBJECT_META = {
  Aptitude: {
    icon: "📐",
    color: "from-orange-400 to-amber-500",
    description: "Quantitative aptitude and problem solving",
  },
  Reasoning: {
    icon: "🧩",
    color: "from-violet-400 to-purple-500",
    description: "Logical reasoning and analytical thinking",
  },
  Java: {
    icon: "☕",
    color: "from-red-400 to-orange-500",
    description: "Core Java and advanced programming",
  },
  Python: {
    icon: "🐍",
    color: "from-blue-400 to-yellow-400",
    description: "Python programming and development",
  },
  SQL: {
    icon: "🗄️",
    color: "from-cyan-400 to-blue-500",
    description: "Queries, databases and data management",
  },
  DSA: {
    icon: "🌳",
    color: "from-emerald-400 to-green-500",
    description: "Algorithms and data structures",
  },
  "Web Development": {
    icon: "🌐",
    color: "from-cyan-400 to-blue-600",
    description: "Modern frontend and web technologies",
  },
  "Full Stack": {
    icon: "⚡",
    color: "from-indigo-400 to-violet-500",
    description: "Frontend, backend and databases",
  },
  "AI/ML": {
    icon: "🤖",
    color: "from-fuchsia-400 to-purple-600",
    description: "Machine learning and artificial intelligence",
  },
  "Computer Science": {
    icon: "💻",
    color: "from-slate-300 to-blue-500",
    description: "Core computer science concepts",
  },
  Technical: {
    icon: "⚙️",
    color: "from-slate-300 to-cyan-500",
    description: "Technical interview preparation",
  },
};

const QUESTION_TYPES = [
  {
    type: "MCQ_SINGLE",
    label: "Single Choice",
    icon: "◉",
    description: "One correct answer",
  },
  {
    type: "MCQ_MULTIPLE",
    label: "Multiple Choice",
    icon: "☑",
    description: "Multiple correct answers",
  },
  {
    type: "TRUE_FALSE",
    label: "True / False",
    icon: "◐",
    description: "Binary questions",
  },
  {
    type: "THEORY",
    label: "Theory",
    icon: "✍",
    description: "AI evaluated answers",
  },
];

const DIFFICULTIES = [
  {
    value: "Easy",
    icon: "🌱",
    description: "Build confidence",
  },
  {
    value: "Medium",
    icon: "🔥",
    description: "Balanced challenge",
  },
  {
    value: "Hard",
    icon: "⚡",
    description: "Interview level",
  },
];

const TestSettings = () => {
  const navigate = useNavigate();

  const [category, setCategory] = useState("Java");
  const [topics, setTopics] = useState([]);
  const [difficulty, setDifficulty] = useState("Medium");
  const [questionCount, setQuestionCount] = useState(20);
  const [durationMinutes, setDurationMinutes] = useState(30);

  const [questionTypes, setQuestionTypes] = useState([
    "MCQ_SINGLE",
    "MCQ_MULTIPLE",
    "TRUE_FALSE",
    "THEORY",
  ]);

  const [negativeMarking, setNegativeMarking] = useState(true);
  const [negativeMarks, setNegativeMarks] = useState(0.5);
  const [aiEvaluation, setAiEvaluation] = useState(true);

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const availableTopics = TOPICS[category] || [];

  const subjectMeta =
    SUBJECT_META[category] || {
      icon: "📚",
      color: "from-cyan-400 to-blue-500",
      description: "Personalized mock assessment",
    };

  const selectedQuestionTypes = QUESTION_TYPES.filter((item) =>
    questionTypes.includes(item.type)
  );

  const estimatedTimePerQuestion =
    questionCount > 0
      ? (durationMinutes / questionCount).toFixed(1)
      : "0";

  const toggleTopic = (topic) => {
    setTopics((prev) =>
      prev.includes(topic)
        ? prev.filter((item) => item !== topic)
        : [...prev, topic]
    );
  };

  const toggleQuestionType = (type) => {
    setQuestionTypes((prev) =>
      prev.includes(type)
        ? prev.filter((item) => item !== type)
        : [...prev, type]
    );
  };

  const selectAllTopics = () => {
    setTopics(availableTopics);
  };

  const clearTopics = () => {
    setTopics([]);
  };

  const handleCategoryChange = (value) => {
    setCategory(value);
    setTopics([]);
  };

  const handleGenerate = async () => {
    try {
      setError("");

      if (questionTypes.length === 0) {
        setError("Select at least one question type.");
        return;
      }

      if (topics.length === 0) {
        setError("Select at least one topic.");
        return;
      }

      if (Number(questionCount) < 5) {
        setError("Please select at least 5 questions.");
        return;
      }

      if (Number(questionCount) > 100) {
        setError("Maximum 100 questions are allowed.");
        return;
      }

      setGenerating(true);

      const configuration = {
        category,
        topics,
        difficulty,
        questionCount: Number(questionCount),
        durationMinutes: Number(durationMinutes),
        questionTypes,
        negativeMarking,
        negativeMarks: negativeMarking
          ? Number(negativeMarks)
          : 0,
        aiEvaluation,
      };

      console.log("AI TEST CONFIG:", configuration);

      localStorage.setItem(
        "mockTestConfiguration",
        JSON.stringify(configuration)
      );

      const response = await generateAIMockTest(configuration);

      const testId =
        response?.test?._id ||
        response?.testId ||
        response?.data?.testId ||
        response?.data?.test?._id;

      if (!testId) {
        throw new Error(
          "Test was generated but no test ID was returned."
        );
      }

      navigate(`/mock-tests/${testId}`);
    } catch (err) {
      console.error("AI GENERATION ERROR:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to generate mock test."
      );
    } finally {
      setGenerating(false);
    }
  };

  if (generating) {
    return <GeneratingScreen />;
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[#020617] text-white">
      <style>
        {`
          @keyframes floatA {
            0%, 100% {
              transform: translate3d(0, 0, 0);
            }
            50% {
              transform: translate3d(35px, -25px, 0);
            }
          }

          @keyframes floatB {
            0%, 100% {
              transform: translate3d(0, 0, 0);
            }
            50% {
              transform: translate3d(-30px, 30px, 0);
            }
          }

          @keyframes pulseGlow {
            0%, 100% {
              opacity: .35;
              transform: scale(.95);
            }
            50% {
              opacity: .7;
              transform: scale(1.08);
            }
          }

          @keyframes shimmer {
            0% {
              transform: translateX(-120%);
            }
            100% {
              transform: translateX(220%);
            }
          }

          @keyframes fadeUp {
            from {
              opacity: 0;
              transform: translateY(25px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes slideRight {
            from {
              opacity: 0;
              transform: translateX(-20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes rotateSlow {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          @keyframes particle {
            0%, 100% {
              opacity: .15;
              transform: translateY(0);
            }
            50% {
              opacity: .9;
              transform: translateY(-18px);
            }
          }

          .float-a {
            animation: floatA 10s ease-in-out infinite;
          }

          .float-b {
            animation: floatB 12s ease-in-out infinite;
          }

          .pulse-glow {
            animation: pulseGlow 4s ease-in-out infinite;
          }

          .fade-up {
            animation: fadeUp .7s ease-out both;
          }

          .slide-right {
            animation: slideRight .6s ease-out both;
          }

          .rotate-slow {
            animation: rotateSlow 18s linear infinite;
          }

          .particle {
            animation: particle 4s ease-in-out infinite;
          }

          .glass-card {
            background: rgba(15, 23, 42, .62);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
          }

          .select-modern option {
            background: #0f172a;
            color: white;
          }

          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }

          .hide-scrollbar {
            scrollbar-width: none;
          }
        `}
      </style>

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(6,182,212,.08),transparent_35%)]" />

        <div className="absolute inset-0 opacity-[0.13] [background-image:linear-gradient(rgba(148,163,184,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,.08)_1px,transparent_1px)] [background-size:60px_60px]" />

        <div className="float-a absolute -left-48 -top-48 h-[650px] w-[650px] rounded-full bg-cyan-500/[0.07] blur-[150px]" />

        <div className="float-b absolute -right-48 top-1/3 h-[600px] w-[600px] rounded-full bg-violet-600/[0.07] blur-[150px]" />

        <div className="absolute bottom-[-250px] left-1/3 h-[550px] w-[550px] rounded-full bg-blue-600/[0.06] blur-[150px]" />

        <div className="particle absolute left-[10%] top-[20%] h-1 w-1 rounded-full bg-cyan-300" />
        <div className="particle absolute left-[80%] top-[18%] h-1.5 w-1.5 rounded-full bg-blue-300" />
        <div className="particle absolute left-[18%] top-[75%] h-1 w-1 rounded-full bg-violet-300" />
        <div className="particle absolute left-[88%] top-[70%] h-1 w-1 rounded-full bg-cyan-300" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#020617]/75 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-4 sm:px-8">
          <button
            type="button"
            onClick={() => navigate("/mock-tests")}
            className="group flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/15 bg-cyan-400/[0.05] text-lg transition duration-300 group-hover:scale-105 group-hover:border-cyan-400/30">
              ✦
            </div>

            <div className="text-left">
              <p className="text-sm font-black">
                PrepPulse
              </p>

              <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-slate-600">
                AI Test Builder
              </p>
            </div>
          </button>

          <div className="hidden items-center gap-2 rounded-full border border-emerald-400/10 bg-emerald-400/[0.03] px-3 py-1.5 sm:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
              <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
            </span>

            <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-400">
              AI Ready
            </span>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <section className="fade-up mb-8">
              <button
                type="button"
                onClick={() => navigate("/mock-tests")}
                className="mb-6 text-xs font-semibold text-slate-500 transition hover:text-cyan-400"
              >
                ← Back to Mock Tests
              </button>

              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/[0.04] px-4 py-2">
                  <span className="text-cyan-400">
                    ✦
                  </span>

                  <span className="text-[9px] font-black uppercase tracking-[0.25em] text-cyan-300">
                    Intelligent Assessment Builder
                  </span>
                </div>

                <span className="rounded-full border border-violet-400/10 bg-violet-400/[0.03] px-3 py-1.5 text-[9px] font-bold text-violet-300">
                  Gemini Powered
                </span>
              </div>

              <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                Build your
                <span className="block bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                  perfect mock test.
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
                Customize every part of your assessment. Choose your
                subject, topics, difficulty, question types and timing.
                PrepPulse AI will generate the test for you.
              </p>
            </section>

            {error && (
              <div className="fade-up mb-6 flex items-start gap-4 rounded-2xl border border-red-400/15 bg-red-400/[0.04] p-4 shadow-lg shadow-red-950/10">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-400/10 text-lg">
                  ⚠️
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-bold text-red-300">
                    Configuration Error
                  </p>

                  <p className="mt-1 text-xs leading-5 text-red-200/70">
                    {error}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-5">
              <SettingsCard
                number="01"
                icon="📚"
                title="Choose your subject"
                description="What do you want to practice today?"
              >
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {SUBJECTS.map((subject) => {
                    const meta = SUBJECT_META[subject];

                    const selected =
                      category === subject;

                    return (
                      <button
                        key={subject}
                        type="button"
                        onClick={() =>
                          handleCategoryChange(subject)
                        }
                        className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 ${
                          selected
                            ? "border-cyan-400/30 bg-cyan-400/[0.07] shadow-lg shadow-cyan-950/20"
                            : "border-white/[0.06] bg-white/[0.018] hover:-translate-y-1 hover:border-white/10 hover:bg-white/[0.035]"
                        }`}
                      >
                        {selected && (
                          <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-400 text-[10px] font-black text-slate-950">
                            ✓
                          </div>
                        )}

                        <div
                          className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${meta.color} bg-opacity-10 text-xl shadow-lg transition duration-300 group-hover:scale-110`}
                        >
                          {meta.icon}
                        </div>

                        <p
                          className={`text-sm font-bold ${
                            selected
                              ? "text-cyan-300"
                              : "text-slate-200"
                          }`}
                        >
                          {subject}
                        </p>

                        <p className="mt-1 text-[9px] leading-4 text-slate-600">
                          {meta.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </SettingsCard>

              <SettingsCard
                number="02"
                icon="🧠"
                title="Select topics"
                description={`Choose the concepts you want AI to focus on`}
                badge={`${topics.length}/${availableTopics.length}`}
              >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-cyan-400" />

                    <span className="text-xs text-slate-500">
                      {topics.length === 0
                        ? "No topics selected"
                        : `${topics.length} topics selected`}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={selectAllTopics}
                      className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-[9px] font-bold text-slate-500 transition hover:bg-white/[0.06] hover:text-cyan-300"
                    >
                      Select All
                    </button>

                    <button
                      type="button"
                      onClick={clearTopics}
                      className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-[9px] font-bold text-slate-500 transition hover:bg-white/[0.06] hover:text-red-300"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="grid max-h-[360px] gap-2.5 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
                  {availableTopics.map((topic) => {
                    const selected = topics.includes(topic);

                    return (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => toggleTopic(topic)}
                        className={`group flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-300 ${
                          selected
                            ? "border-cyan-400/25 bg-cyan-400/[0.06] text-cyan-300"
                            : "border-white/[0.05] bg-white/[0.015] text-slate-500 hover:border-white/10 hover:bg-white/[0.035] hover:text-slate-300"
                        }`}
                      >
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[10px] transition-all duration-300 ${
                            selected
                              ? "border-cyan-400/30 bg-cyan-400 text-slate-950"
                              : "border-white/10 bg-white/[0.02] text-slate-700"
                          }`}
                        >
                          {selected ? "✓" : "+"}
                        </span>

                        <span className="text-xs font-semibold">
                          {topic}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </SettingsCard>

              <SettingsCard
                number="03"
                icon="🔥"
                title="Set difficulty"
                description="Choose the challenge level"
              >
                <div className="grid gap-3 md:grid-cols-3">
                  {DIFFICULTIES.map((level) => {
                    const selected =
                      difficulty === level.value;

                    return (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() =>
                          setDifficulty(level.value)
                        }
                        className={`group relative overflow-hidden rounded-2xl border p-5 text-left transition-all duration-300 ${
                          selected
                            ? "border-cyan-400/25 bg-cyan-400/[0.06]"
                            : "border-white/[0.06] bg-white/[0.015] hover:-translate-y-1 hover:border-white/10"
                        }`}
                      >
                        {selected && (
                          <div className="absolute right-4 top-4 text-xs text-cyan-400">
                            ✓
                          </div>
                        )}

                        <div className="text-2xl transition duration-300 group-hover:scale-110">
                          {level.icon}
                        </div>

                        <p
                          className={`mt-4 text-sm font-bold ${
                            selected
                              ? "text-cyan-300"
                              : "text-slate-200"
                          }`}
                        >
                          {level.value}
                        </p>

                        <p className="mt-1 text-[10px] text-slate-600">
                          {level.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </SettingsCard>

              <div className="grid gap-5 md:grid-cols-2">
                <SettingsCard
                  number="04"
                  icon="📝"
                  title="Questions"
                  description="How many questions?"
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      min="5"
                      max="100"
                      value={questionCount}
                      onChange={(e) =>
                        setQuestionCount(e.target.value)
                      }
                      className="w-full rounded-2xl border border-white/[0.07] bg-slate-950/70 px-5 py-4 text-2xl font-black text-white outline-none transition focus:border-cyan-400/30 focus:ring-4 focus:ring-cyan-400/[0.04]"
                    />

                    <div className="shrink-0 text-right">
                      <p className="text-[9px] uppercase tracking-wider text-slate-600">
                        Questions
                      </p>

                      <p className="mt-1 text-xs font-bold text-cyan-400">
                        5 - 100
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(
                            5,
                            Number(questionCount) || 5
                          )
                        )}%`,
                      }}
                    />
                  </div>
                </SettingsCard>

                <SettingsCard
                  number="05"
                  icon="⏱"
                  title="Duration"
                  description="Set your test time"
                >
                  <select
                    value={durationMinutes}
                    onChange={(e) =>
                      setDurationMinutes(
                        e.target.value
                      )
                    }
                    className="select-modern w-full rounded-2xl border border-white/[0.07] bg-slate-950/70 px-5 py-4 text-lg font-bold text-white outline-none transition focus:border-cyan-400/30"
                  >
                    <option value={10}>
                      10 Minutes
                    </option>

                    <option value={20}>
                      20 Minutes
                    </option>

                    <option value={30}>
                      30 Minutes
                    </option>

                    <option value={45}>
                      45 Minutes
                    </option>

                    <option value={60}>
                      60 Minutes
                    </option>

                    <option value={90}>
                      90 Minutes
                    </option>

                    <option value={120}>
                      120 Minutes
                    </option>
                  </select>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[10px] text-slate-600">
                      Average time / question
                    </span>

                    <span className="text-xs font-bold text-cyan-400">
                      {estimatedTimePerQuestion} min
                    </span>
                  </div>
                </SettingsCard>
              </div>

              <SettingsCard
                number="06"
                icon="🎯"
                title="Question types"
                description="Customize how your assessment works"
                badge={`${questionTypes.length} selected`}
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  {QUESTION_TYPES.map((item) => {
                    const selected =
                      questionTypes.includes(
                        item.type
                      );

                    return (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() =>
                          toggleQuestionType(
                            item.type
                          )
                        }
                        className={`group relative flex items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-300 ${
                          selected
                            ? "border-cyan-400/25 bg-cyan-400/[0.055]"
                            : "border-white/[0.06] bg-white/[0.015] hover:border-white/10 hover:bg-white/[0.03]"
                        }`}
                      >
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl transition duration-300 ${
                            selected
                              ? "bg-cyan-400/10 text-cyan-300 group-hover:scale-110"
                              : "bg-white/[0.03] text-slate-600"
                          }`}
                        >
                          {item.icon}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p
                              className={`text-sm font-bold ${
                                selected
                                  ? "text-cyan-300"
                                  : "text-slate-300"
                              }`}
                            >
                              {item.label}
                            </p>

                            {selected && (
                              <span className="text-[10px] text-cyan-400">
                                ✓
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-[10px] text-slate-600">
                            {item.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </SettingsCard>

              <SettingsCard
                number="07"
                icon="⚙️"
                title="Advanced settings"
                description="Fine-tune your assessment"
              >
                <div className="space-y-3">
                  <ToggleSetting
                    enabled={negativeMarking}
                    onChange={setNegativeMarking}
                    icon="−"
                    title="Negative Marking"
                    description="Deduct marks for incorrect answers"
                  />

                  {negativeMarking && (
                    <div className="ml-0 rounded-2xl border border-white/[0.05] bg-white/[0.015] p-4 sm:ml-14">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs font-bold text-slate-300">
                            Penalty per incorrect answer
                          </p>

                          <p className="mt-1 text-[9px] text-slate-600">
                            Marks deducted when an answer is incorrect
                          </p>
                        </div>

                        <select
                          value={negativeMarks}
                          onChange={(e) =>
                            setNegativeMarks(
                              e.target.value
                            )
                          }
                          className="select-modern rounded-xl border border-white/[0.07] bg-slate-950 px-4 py-2.5 text-sm font-bold text-white outline-none"
                        >
                          <option value={0.25}>
                            -0.25
                          </option>

                          <option value={0.5}>
                            -0.50
                          </option>

                          <option value={1}>
                            -1.00
                          </option>
                        </select>
                      </div>
                    </div>
                  )}

                  <ToggleSetting
                    enabled={aiEvaluation}
                    onChange={setAiEvaluation}
                    icon="✦"
                    title="AI Evaluation"
                    description="Enable AI evaluation for theory answers"
                    accent
                  />
                </div>
              </SettingsCard>
            </div>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="fade-up glass-card relative overflow-hidden rounded-[28px] border border-white/[0.07] shadow-2xl shadow-black/20">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

              <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-cyan-400/[0.06] blur-3xl" />

              <div className="relative p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.22em] text-cyan-400">
                      Live Preview
                    </p>

                    <h2 className="mt-1 text-xl font-black">
                      Your Assessment
                    </h2>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/15 bg-cyan-400/[0.05] text-lg">
                    ✦
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-white/[0.05] bg-slate-950/60 p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${subjectMeta.color} text-xl`}
                    >
                      {subjectMeta.icon}
                    </div>

                    <div className="min-w-0">
                      <p className="text-[9px] uppercase tracking-wider text-slate-600">
                        Subject
                      </p>

                      <p className="mt-1 truncate text-sm font-bold text-white">
                        {category}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <PreviewStat
                    icon="🔥"
                    label="Difficulty"
                    value={difficulty}
                  />

                  <PreviewStat
                    icon="📝"
                    label="Questions"
                    value={questionCount}
                  />

                  <PreviewStat
                    icon="⏱"
                    label="Duration"
                    value={`${durationMinutes}m`}
                  />

                  <PreviewStat
                    icon="🧠"
                    label="Topics"
                    value={topics.length}
                  />
                </div>

                <div className="mt-5 rounded-2xl border border-white/[0.05] bg-white/[0.015] p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-600">
                      Configuration
                    </span>

                    <span className="text-[9px] font-bold text-cyan-400">
                      {questionTypes.length}/4 types
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    <PreviewRow
                      label="Topics selected"
                      value={
                        topics.length > 0
                          ? `${topics.length} topics`
                          : "None"
                      }
                      positive={topics.length > 0}
                    />

                    <PreviewRow
                      label="Question types"
                      value={
                        questionTypes.length > 0
                          ? `${questionTypes.length} types`
                          : "None"
                      }
                      positive={
                        questionTypes.length > 0
                      }
                    />

                    <PreviewRow
                      label="Negative marking"
                      value={
                        negativeMarking
                          ? `-${negativeMarks}`
                          : "Disabled"
                      }
                      positive={!negativeMarking}
                    />

                    <PreviewRow
                      label="AI evaluation"
                      value={
                        aiEvaluation
                          ? "Enabled"
                          : "Disabled"
                      }
                      positive={aiEvaluation}
                    />
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-violet-400/10 bg-violet-400/[0.025] p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-400/10">
                      🤖
                    </div>

                    <div>
                      <p className="text-xs font-bold text-violet-300">
                        AI Generation
                      </p>

                      <p className="mt-0.5 text-[9px] text-slate-600">
                        Gemini will create your questions
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={
                    generating ||
                    topics.length === 0 ||
                    questionTypes.length === 0
                  }
                  onClick={handleGenerate}
                  className="group relative mt-6 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 px-6 py-4 text-sm font-black text-slate-950 shadow-xl shadow-cyan-500/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <span className="absolute inset-y-0 left-0 w-1/3 -translate-x-full bg-white/20 blur-md transition-transform duration-700 group-hover:translate-x-[400%]" />

                  <span className="relative flex items-center justify-center gap-2">
                    <span className="text-lg">
                      ✦
                    </span>

                    Generate AI Mock Test

                    <span className="text-lg transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                </button>

                <p className="mt-4 text-center text-[9px] leading-5 text-slate-700">
                  Your configuration will be used to generate a
                  personalized assessment.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

const SettingsCard = ({
  number,
  icon,
  title,
  description,
  badge,
  children,
}) => {
  return (
    <section className="slide-right glass-card relative overflow-hidden rounded-[26px] border border-white/[0.06] p-5 shadow-xl shadow-black/10 sm:p-6">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

      <div className="relative mb-5 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/[0.04] text-sm">
            {icon}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-black tracking-[0.2em] text-cyan-500/60">
                {number}
              </span>

              <h2 className="text-base font-black text-slate-100">
                {title}
              </h2>
            </div>

            <p className="mt-1 text-[10px] leading-5 text-slate-600">
              {description}
            </p>
          </div>
        </div>

        {badge && (
          <span className="shrink-0 rounded-full border border-white/[0.06] bg-white/[0.025] px-3 py-1.5 text-[8px] font-bold text-slate-500">
            {badge}
          </span>
        )}
      </div>

      {children}
    </section>
  );
};

const PreviewStat = ({
  icon,
  label,
  value,
}) => {
  return (
    <div className="rounded-xl border border-white/[0.05] bg-white/[0.018] p-3">
      <div className="flex items-center gap-2">
        <span className="text-sm">{icon}</span>

        <span className="truncate text-[8px] font-bold uppercase tracking-wider text-slate-600">
          {label}
        </span>
      </div>

      <p className="mt-2 truncate text-xs font-black text-slate-200">
        {value}
      </p>
    </div>
  );
};

const PreviewRow = ({
  label,
  value,
  positive,
}) => {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[10px] text-slate-600">
        {label}
      </span>

      <div className="flex items-center gap-1.5">
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            positive
              ? "bg-emerald-400"
              : "bg-slate-700"
          }`}
        />

        <span
          className={`text-[10px] font-bold ${
            positive
              ? "text-slate-300"
              : "text-slate-600"
          }`}
        >
          {value}
        </span>
      </div>
    </div>
  );
};

const ToggleSetting = ({
  enabled,
  onChange,
  icon,
  title,
  description,
  accent = false,
}) => {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`group flex w-full items-center justify-between rounded-2xl border p-4 text-left transition-all duration-300 ${
        enabled
          ? accent
            ? "border-violet-400/15 bg-violet-400/[0.035]"
            : "border-cyan-400/15 bg-cyan-400/[0.035]"
          : "border-white/[0.05] bg-white/[0.015]"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg transition duration-300 group-hover:scale-105 ${
            enabled
              ? accent
                ? "bg-violet-400/10 text-violet-300"
                : "bg-cyan-400/10 text-cyan-300"
              : "bg-white/[0.03] text-slate-600"
          }`}
        >
          {icon}
        </div>

        <div>
          <p
            className={`text-xs font-bold ${
              enabled
                ? "text-slate-200"
                : "text-slate-500"
            }`}
          >
            {title}
          </p>

          <p className="mt-1 text-[9px] text-slate-600">
            {description}
          </p>
        </div>
      </div>

      <div
        className={`relative h-6 w-11 shrink-0 rounded-full p-1 transition-all duration-300 ${
          enabled
            ? accent
              ? "bg-violet-500"
              : "bg-cyan-500"
            : "bg-slate-800"
        }`}
      >
        <div
          className={`h-4 w-4 rounded-full bg-white shadow-md transition-transform duration-300 ${
            enabled
              ? "translate-x-5"
              : "translate-x-0"
          }`}
        />
      </div>
    </button>
  );
};

const GeneratingScreen = () => {
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) {
          return 92;
        }

        return prev + Math.floor(Math.random() * 4) + 1;
      });
    }, 700);

    return () => clearInterval(interval);
  }, []);

  const steps = [
    {
      icon: "◈",
      title: "Analyzing configuration",
      description: "Understanding your selected requirements",
    },
    {
      icon: "✦",
      title: "Generating questions",
      description: "Creating intelligent AI questions",
    },
    {
      icon: "✓",
      title: "Building answer keys",
      description: "Preparing scoring and validation",
    },
    {
      icon: "◎",
      title: "Preparing evaluation",
      description: "Configuring AI assessment",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020617] text-white">
      <style>
        {`
          @keyframes aiPulse {
            0%, 100% {
              transform: scale(.9);
              box-shadow: 0 0 30px rgba(34,211,238,.12);
            }
            50% {
              transform: scale(1.08);
              box-shadow: 0 0 80px rgba(34,211,238,.25);
            }
          }

          @keyframes orbit {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          @keyframes orbitReverse {
            from {
              transform: rotate(360deg);
            }
            to {
              transform: rotate(0deg);
            }
          }

          @keyframes shimmer {
            from {
              transform: translateX(-150%);
            }
            to {
              transform: translateX(300%);
            }
          }

          @keyframes fade {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .ai-pulse {
            animation: aiPulse 3s ease-in-out infinite;
          }

          .orbit {
            animation: orbit 12s linear infinite;
          }

          .orbit-reverse {
            animation: orbitReverse 18s linear infinite;
          }

          .generation-fade {
            animation: fade .7s ease-out both;
          }
        `}
      </style>

      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(6,182,212,.08),transparent_35%)]" />

        <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(148,163,184,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,.08)_1px,transparent_1px)] [background-size:60px_60px]" />

        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/[0.05] blur-[150px]" />
      </div>

      <main className="relative flex min-h-screen items-center justify-center px-5 py-10">
        <div className="generation-fade w-full max-w-2xl rounded-[36px] border border-cyan-400/10 bg-slate-900/65 p-6 shadow-2xl shadow-cyan-950/20 backdrop-blur-2xl sm:p-10">
          <div className="relative mx-auto flex h-48 w-48 items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-cyan-400/[0.08]" />

            <div className="absolute inset-5 rounded-full border border-blue-400/[0.08] border-dashed orbit" />

            <div className="absolute inset-10 rounded-full border border-violet-400/[0.1] border-dashed orbit-reverse" />

            <div className="ai-pulse flex h-24 w-24 flex-col items-center justify-center rounded-[28px] border border-cyan-400/20 bg-slate-950 text-center">
              <span className="text-3xl">
                ✦
              </span>

              <span className="mt-1 text-xl font-black">
                {progress}%
              </span>
            </div>
          </div>

          <div className="mt-3 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/10 bg-cyan-400/[0.04] px-4 py-2">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />

              <span className="text-[9px] font-black uppercase tracking-[0.22em] text-cyan-300">
                AI Engine Working
              </span>
            </div>

            <h1 className="mt-5 text-3xl font-black sm:text-4xl">
              Building your test
            </h1>

            <p className="mx-auto mt-3 max-w-md text-xs leading-6 text-slate-500">
              Gemini is generating a personalized assessment
              based on your selected configuration.
            </p>
          </div>

          <div className="mt-8">
            <div className="mb-2 flex justify-between">
              <span className="text-[9px] text-slate-600">
                Generation progress
              </span>

              <span className="text-[9px] font-black text-cyan-400">
                {progress}%
              </span>
            </div>

            <div className="relative h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                className="relative h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 transition-all duration-700"
                style={{
                  width: `${progress}%`,
                }}
              >
                <div
                  className="absolute inset-y-0 left-0 w-1/3 bg-white/30 blur-sm"
                  style={{
                    animation:
                      "shimmer 1.5s linear infinite",
                  }}
                />
              </div>
            </div>
          </div>

          <div className="mt-7 space-y-2">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className={`flex items-center gap-3 rounded-2xl border p-3 ${
                  index === 1
                    ? "border-cyan-400/15 bg-cyan-400/[0.035]"
                    : "border-white/[0.04] bg-white/[0.015]"
                }`}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/[0.05] text-sm text-cyan-400">
                  {index === 1 ? (
                    <span className="animate-pulse">
                      {step.icon}
                    </span>
                  ) : (
                    step.icon
                  )}
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-300">
                    {step.title}
                  </p>

                  <p className="mt-0.5 text-[9px] text-slate-600">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-7 text-center text-[9px] text-slate-700">
            Please keep this page open while your assessment is
            being generated.
          </p>
        </div>
      </main>
    </div>
  );
};

export default TestSettings;