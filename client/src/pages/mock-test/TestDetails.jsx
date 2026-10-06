import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getMockTest, startMockTest } from "../../services/mockTestService";

const TestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTest = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getMockTest(id);

        console.log("Mock Test Details:", response);

        const testData =
          response?.test ||
          response?.data?.test ||
          response?.data ||
          response;

        if (!testData || !testData._id) {
          throw new Error("Mock test not found.");
        }

        setTest(testData);
      } catch (err) {
        console.error("Failed to load test:", err);

        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load mock test.";

        setError(message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadTest();
    }
  }, [id]);

  const handleStartTest = async () => {
    try {
      setStarting(true);
      setError("");

      const response = await startMockTest(id);

      console.log("Start Test Response:", response);

      const attempt =
        response?.attempt ||
        response?.data?.attempt ||
        response;

      if (!attempt?._id) {
        throw new Error(
          "Unable to start test. Attempt ID was not returned."
        );
      }

      navigate(`/mock-tests/attempt/${attempt._id}`);
    } catch (err) {
      console.error("Failed to start test:", err);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to start test.";

      setError(message);
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (error && !test) {
    return (
      <ErrorScreen
        error={error}
        onBack={() => navigate("/mock-tests")}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (!test) {
    return null;
  }

  const duration = test.durationMinutes || 30;
  const totalQuestions = test.totalQuestions || 0;
  const totalMarks = test.totalMarks || 0;
  const passingMarks = test.passingMarks || 0;
  const difficulty = test.difficulty || "Medium";

  const questionTypes = Array.isArray(test.questionTypes)
    ? test.questionTypes
    : [];

  const security = test.security || {};
  const aiEvaluation = test.aiEvaluation || {};

  const passPercentage =
    totalMarks > 0
      ? Math.round((passingMarks / totalMarks) * 100)
      : 0;

  const difficultyConfig = getDifficultyConfig(difficulty);

  const securityFeatures = [
    {
      enabled: security.fullscreenRequired,
      icon: "⛶",
      title: "Fullscreen",
      description: "Required during assessment",
    },
    {
      enabled: security.tabSwitchMonitoring,
      icon: "👁",
      title: "Tab Monitoring",
      description: "Tab switches are monitored",
    },
    {
      enabled: security.copyPasteMonitoring,
      icon: "📋",
      title: "Copy Protection",
      description: "Copy and paste monitoring",
    },
    {
      enabled: security.contextMenuDisabled,
      icon: "🖱",
      title: "Right Click",
      description: "Context menu protection",
    },
  ];

  return (
    <div className="min-h-screen overflow-hidden bg-[#020617] text-white">
      <style>
        {`
          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-14px);
            }
          }

          @keyframes floatReverse {
            0%, 100% {
              transform: translate(0, 0);
            }
            50% {
              transform: translate(-18px, 12px);
            }
          }

          @keyframes pulseGlow {
            0%, 100% {
              opacity: .25;
              transform: scale(1);
            }
            50% {
              opacity: .6;
              transform: scale(1.1);
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

          @keyframes shimmer {
            0% {
              transform: translateX(-120%);
            }
            100% {
              transform: translateX(120%);
            }
          }

          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(18px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes scaleIn {
            from {
              opacity: 0;
              transform: scale(.94);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          @keyframes borderPulse {
            0%, 100% {
              border-color: rgba(34,211,238,.12);
            }
            50% {
              border-color: rgba(34,211,238,.35);
            }
          }

          .float-animation {
            animation: float 5s ease-in-out infinite;
          }

          .float-reverse {
            animation: floatReverse 7s ease-in-out infinite;
          }

          .pulse-glow {
            animation: pulseGlow 4s ease-in-out infinite;
          }

          .rotate-slow {
            animation: rotateSlow 18s linear infinite;
          }

          .slide-up {
            animation: slideUp .55s ease-out both;
          }

          .scale-in {
            animation: scaleIn .5s ease-out both;
          }

          .border-pulse {
            animation: borderPulse 3s ease-in-out infinite;
          }

          .glass {
            background:
              linear-gradient(
                135deg,
                rgba(255,255,255,.065),
                rgba(255,255,255,.018)
              );
            border: 1px solid rgba(255,255,255,.09);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
          }

          .grid-background {
            background-image:
              linear-gradient(
                rgba(148,163,184,.035) 1px,
                transparent 1px
              ),
              linear-gradient(
                90deg,
                rgba(148,163,184,.035) 1px,
                transparent 1px
              );
            background-size: 45px 45px;
          }

          .shimmer-line {
            position: absolute;
            inset: 0;
            width: 35%;
            transform: translateX(-120%);
            background: linear-gradient(
              90deg,
              transparent,
              rgba(255,255,255,.12),
              transparent
            );
            animation: shimmer 4s ease-in-out infinite;
          }
        `}
      </style>

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="grid-background absolute inset-0 opacity-50" />

        <div className="absolute left-[-180px] top-[-160px] h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[150px] pulse-glow" />

        <div className="absolute right-[-180px] top-[20%] h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[150px] float-reverse" />

        <div className="absolute bottom-[-200px] left-[35%] h-[450px] w-[450px] rounded-full bg-blue-600/10 blur-[150px]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#020617]/85 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[1450px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => navigate("/mock-tests")}
            className="group flex items-center gap-3 text-sm font-semibold text-slate-400 transition hover:text-white"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] transition group-hover:-translate-x-1 group-hover:border-cyan-400/30 group-hover:bg-cyan-400/5">
              ←
            </span>

            <span className="hidden sm:block">
              Back to Mock Tests
            </span>
          </button>

          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />

            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
              Assessment Preview
            </span>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-[1450px] px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
        {error && (
          <div className="slide-up mb-6 flex items-start gap-4 rounded-2xl border border-red-500/20 bg-red-500/[0.06] p-4 text-red-300 shadow-lg shadow-red-950/10">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10">
              ⚠️
            </div>

            <div>
              <p className="font-bold">
                Something went wrong
              </p>

              <p className="mt-1 text-sm text-red-300/70">
                {error}
              </p>
            </div>
          </div>
        )}

        <section className="relative mb-8 overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.025] p-6 shadow-2xl shadow-black/20 sm:p-8 lg:p-12">
          <div className="absolute right-[-120px] top-[-120px] h-[420px] w-[420px] rounded-full border border-cyan-400/10 rotate-slow" />

          <div className="absolute right-[60px] top-[60px] h-[250px] w-[250px] rounded-full border border-dashed border-blue-400/10 rotate-slow" />

          <div className="absolute bottom-[-150px] left-[35%] h-[300px] w-[300px] rounded-full bg-cyan-500/10 blur-[100px] pulse-glow" />

          <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_330px]">
            <div className="slide-up">
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <Badge
                  label={test.category || "Technical"}
                  color="cyan"
                />

                <Badge
                  label={difficulty}
                  color={difficultyConfig.color}
                />

                {aiEvaluation.enabled && (
                  <Badge
                    label="AI Powered"
                    color="emerald"
                    icon="✦"
                  />
                )}
              </div>

              <h1 className="max-w-4xl text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                {test.title}
              </h1>

              <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-400 sm:text-base lg:text-lg">
                {test.description ||
                  "AI-generated mock assessment designed to test your technical knowledge and interview readiness."}
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.035] px-4 py-2.5">
                  <span className="text-cyan-400">
                    ⏱
                  </span>

                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-slate-600">
                      Duration
                    </p>

                    <p className="text-sm font-bold">
                      {duration} min
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.035] px-4 py-2.5">
                  <span className="text-violet-400">
                    ◈
                  </span>

                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-slate-600">
                      Questions
                    </p>

                    <p className="text-sm font-bold">
                      {totalQuestions}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.035] px-4 py-2.5">
                  <span className="text-amber-400">
                    ★
                  </span>

                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-slate-600">
                      Total Marks
                    </p>

                    <p className="text-sm font-bold">
                      {totalMarks}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative hidden min-h-[280px] items-center justify-center lg:flex">
              <div className="absolute h-56 w-56 rounded-full bg-cyan-500/10 blur-[65px] pulse-glow" />

              <div className="relative flex h-56 w-56 items-center justify-center rounded-full border border-cyan-400/15 bg-slate-950/60 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl">
                <div className="absolute inset-4 rounded-full border border-dashed border-cyan-400/15 rotate-slow" />

                <div className="absolute inset-10 rounded-full border border-blue-400/10" />

                <div className="relative text-center float-animation">
                  <div className="text-6xl">
                    🤖
                  </div>

                  <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-400">
                    AI Assessment
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Ready to challenge you
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <StatCard
            icon="⏱️"
            label="Duration"
            value={`${duration} min`}
            color="cyan"
          />

          <StatCard
            icon="📝"
            label="Questions"
            value={totalQuestions}
            color="violet"
          />

          <StatCard
            icon="🏆"
            label="Total Marks"
            value={totalMarks}
            color="amber"
          />

          <StatCard
            icon="🎯"
            label="Pass Marks"
            value={passingMarks}
            color="emerald"
          />
        </section>

        <div className="grid gap-7 lg:grid-cols-[1fr_390px]">
          <div className="space-y-7">
            <Section
              eyebrow="Assessment Structure"
              title="Question Types"
              icon="◈"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {questionTypes.includes("MCQ_SINGLE") && (
                  <InfoItem
                    icon="🔘"
                    title="Single Choice"
                    description="Select one correct answer."
                    accent="cyan"
                  />
                )}

                {questionTypes.includes("MCQ_MULTIPLE") && (
                  <InfoItem
                    icon="☑️"
                    title="Multiple Choice"
                    description="Select all correct answers."
                    accent="violet"
                  />
                )}

                {questionTypes.includes("TRUE_FALSE") && (
                  <InfoItem
                    icon="⚖️"
                    title="True / False"
                    description="Choose the correct statement."
                    accent="emerald"
                  />
                )}

                {questionTypes.includes("THEORY") && (
                  <InfoItem
                    icon="✍️"
                    title="Theory"
                    description="Write a descriptive answer."
                    accent="amber"
                  />
                )}
              </div>

              {questionTypes.length === 0 && (
                <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-5 text-sm text-slate-500">
                  Question type information is not available.
                </div>
              )}
            </Section>

            <Section
              eyebrow="Before You Begin"
              title="Test Instructions"
              icon="✓"
            >
              <div className="relative space-y-1">
                <Instruction
                  number="01"
                  title="Time Limit"
                  text={`You will have ${duration} minutes to complete the assessment.`}
                />

                <Instruction
                  number="02"
                  title="Questions & Marks"
                  text={`There are ${totalQuestions} questions carrying ${totalMarks} total marks.`}
                />

                <Instruction
                  number="03"
                  title="Stable Connection"
                  text="Make sure you have a stable internet connection before starting."
                />

                <Instruction
                  number="04"
                  title="Automatic Saving"
                  text="Your answers are automatically saved while you progress through the test."
                />

                <Instruction
                  number="05"
                  title="Stay on the Test"
                  text="Do not refresh or close the browser while the assessment is running."
                />

                {security.fullscreenRequired && (
                  <Instruction
                    number="06"
                    title="Fullscreen Required"
                    text="Fullscreen mode is required during the assessment."
                    warning
                  />
                )}

                {security.tabSwitchMonitoring && (
                  <Instruction
                    number="07"
                    title="Tab Monitoring"
                    text="Switching browser tabs may be recorded as a security violation."
                    warning
                  />
                )}

                {security.copyPasteMonitoring && (
                  <Instruction
                    number="08"
                    title="Copy & Paste Monitoring"
                    text="Copy and paste actions may be monitored during the assessment."
                    warning
                  />
                )}

                {security.contextMenuDisabled && (
                  <Instruction
                    number="09"
                    title="Right Click Disabled"
                    text="The browser context menu is disabled during the test."
                    warning
                  />
                )}
              </div>
            </Section>

            <Section
              eyebrow="Scoring"
              title="Marking Scheme"
              icon="★"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="group relative overflow-hidden rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.035] p-5 transition hover:border-emerald-400/25">
                  <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-emerald-400/10 blur-2xl" />

                  <div className="relative">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400/10 text-xl">
                      ✓
                    </div>

                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      Correct Answer
                    </p>

                    <p className="mt-2 text-2xl font-black text-emerald-400">
                      +Marks
                    </p>

                    <p className="mt-2 text-xs leading-5 text-slate-600">
                      Based on each question's configured marks.
                    </p>
                  </div>
                </div>

                <div className="group relative overflow-hidden rounded-2xl border border-red-400/10 bg-red-400/[0.035] p-5 transition hover:border-red-400/25">
                  <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-red-400/10 blur-2xl" />

                  <div className="relative">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-red-400/10 text-xl">
                      −
                    </div>

                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      Negative Marking
                    </p>

                    <p className="mt-2 text-2xl font-black text-red-400">
                      {test.negativeMarking?.enabled
                        ? `-${test.negativeMarking.defaultMarks || 0}`
                        : "None"}
                    </p>

                    <p className="mt-2 text-xs leading-5 text-slate-600">
                      Applied according to the test configuration.
                    </p>
                  </div>
                </div>
              </div>
            </Section>

            <Section
              eyebrow="Security"
              title="Secure Assessment Mode"
              icon="🔒"
            >
              <div className="mb-5 rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.035] p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/10 text-2xl">
                    🔐
                  </div>

                  <div>
                    <h3 className="font-bold">
                      Protected Test Environment
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      This assessment may use browser security monitoring
                      to maintain a fair testing environment.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {securityFeatures.map((feature) => (
                  <div
                    key={feature.title}
                    className={`rounded-2xl border p-4 transition ${
                      feature.enabled
                        ? "border-emerald-400/10 bg-emerald-400/[0.025]"
                        : "border-white/5 bg-white/[0.015]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                          feature.enabled
                            ? "bg-emerald-400/10"
                            : "bg-slate-800"
                        }`}
                      >
                        {feature.icon}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold">
                            {feature.title}
                          </p>

                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              feature.enabled
                                ? "bg-emerald-400"
                                : "bg-slate-600"
                            }`}
                          />
                        </div>

                        <p className="mt-1 text-[11px] text-slate-600">
                          {feature.enabled
                            ? feature.description
                            : "Not enabled"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {security.maxViolations && (
                <div className="mt-4 flex items-center justify-between rounded-2xl border border-amber-400/10 bg-amber-400/[0.025] px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">
                      ⚠️
                    </span>

                    <div>
                      <p className="text-xs font-semibold text-slate-300">
                        Security violation limit
                      </p>

                      <p className="mt-1 text-[11px] text-slate-600">
                        The assessment may be terminated after the configured limit.
                      </p>
                    </div>
                  </div>

                  <span className="rounded-lg border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-sm font-bold text-amber-400">
                    {security.maxViolations}
                  </span>
                </div>
              )}
            </Section>

            {aiEvaluation.enabled && (
              <Section
                eyebrow="Artificial Intelligence"
                title="AI-Powered Evaluation"
                icon="🤖"
              >
                <div className="relative overflow-hidden rounded-3xl border border-cyan-400/15 bg-gradient-to-br from-cyan-500/[0.08] via-blue-500/[0.04] to-violet-500/[0.08] p-6">
                  <div className="shimmer-line" />

                  <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-3xl shadow-lg shadow-cyan-500/10">
                      🤖
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold">
                          Intelligent Performance Analysis
                        </h3>

                        <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                          Enabled
                        </span>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-slate-400">
                        Theory answers can be evaluated using AI.
                        After completing the test, PrepPulse can
                        generate feedback, identify strengths and
                        weaknesses, and provide personalized
                        recommendations.
                      </p>

                      <div className="mt-5 flex flex-wrap gap-2">
                        {aiEvaluation.theoryEvaluation && (
                          <MiniBadge label="Theory Evaluation" />
                        )}

                        {aiEvaluation.generateFeedback && (
                          <MiniBadge label="AI Feedback" />
                        )}

                        {aiEvaluation.generateRecommendations && (
                          <MiniBadge label="Recommendations" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Section>
            )}
          </div>

          <aside>
            <div className="sticky top-24 space-y-5">
              <div className="relative overflow-hidden rounded-[30px] border border-cyan-400/15 bg-slate-900/75 p-6 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl">
                <div className="absolute right-[-70px] top-[-70px] h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl pulse-glow" />

                <div className="relative">
                  <div className="mb-6 flex items-start justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
                        Assessment Ready
                      </p>

                      <h2 className="mt-2 text-2xl font-black">
                        Ready to Begin?
                      </h2>
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-lg">
                      ✓
                    </div>
                  </div>

                  <div className="mb-6 rounded-2xl border border-white/5 bg-slate-950/50 p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-400">
                        Passing Requirement
                      </span>

                      <span className="text-sm font-bold text-emerald-400">
                        {passPercentage}%
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all"
                        style={{
                          width: `${Math.min(
                            passPercentage,
                            100
                          )}%`,
                        }}
                      />
                    </div>

                    <p className="mt-2 text-[10px] text-slate-600">
                      {passingMarks} out of {totalMarks} marks required
                    </p>
                  </div>

                  <div className="space-y-1">
                    <SummaryRow
                      icon="📚"
                      label="Subject"
                      value={test.category}
                    />

                    <SummaryRow
                      icon="🔥"
                      label="Difficulty"
                      value={difficulty}
                    />

                    <SummaryRow
                      icon="📝"
                      label="Questions"
                      value={totalQuestions}
                    />

                    <SummaryRow
                      icon="⏱️"
                      label="Duration"
                      value={`${duration} minutes`}
                    />

                    <SummaryRow
                      icon="🎯"
                      label="Pass Marks"
                      value={passingMarks}
                    />
                  </div>

                  <div className="my-6 h-px bg-white/5" />

                  <button
                    type="button"
                    onClick={handleStartTest}
                    disabled={starting}
                    className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-600 px-5 py-4 font-black text-slate-950 shadow-xl shadow-cyan-500/15 transition duration-300 hover:-translate-y-1 hover:shadow-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="absolute inset-0 -translate-x-full bg-white/20 transition duration-700 group-hover:translate-x-full" />

                    <span className="relative flex items-center justify-center gap-3">
                      {starting ? (
                        <>
                          <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                          Starting Assessment...
                        </>
                      ) : (
                        <>
                          🚀
                          Start Mock Test
                          <span className="text-lg transition-transform group-hover:translate-x-1">
                            →
                          </span>
                        </>
                      )}
                    </span>
                  </button>

                  <p className="mt-4 text-center text-[10px] leading-5 text-slate-600">
                    By starting this assessment, the timer and
                    security monitoring may begin immediately.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/5 bg-white/[0.025] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10">
                    💡
                  </div>

                  <div>
                    <p className="text-sm font-bold">
                      Quick Tip
                    </p>

                    <p className="mt-1 text-[11px] text-slate-600">
                      Find a quiet place before starting.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.025] p-5">
                <div className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />

                  <div>
                    <p className="text-sm font-bold text-emerald-300">
                      System Ready
                    </p>

                    <p className="mt-1 text-[11px] text-slate-600">
                      Assessment service is available.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/5 py-6 text-center text-[10px] text-slate-700 sm:flex-row sm:text-left">
          <span>
            PrepPulse AI Assessment Platform
          </span>

          <span>
            Practice smarter • Perform better
          </span>
        </div>
      </main>
    </div>
  );
};

const LoadingScreen = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#020617] px-6 text-white">
      <style>
        {`
          @keyframes loadingPulse {
            0%, 100% {
              transform: scale(.9);
              opacity: .5;
            }
            50% {
              transform: scale(1.1);
              opacity: 1;
            }
          }
        `}
      </style>

      <div className="text-center">
        <div className="relative mx-auto mb-7 flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 animate-spin rounded-full border border-cyan-400/20 border-t-cyan-400" />

          <div className="absolute inset-3 rounded-2xl bg-cyan-400/10 blur-xl" />

          <div
            className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/20 bg-slate-900 text-3xl"
            style={{
              animation:
                "loadingPulse 2s ease-in-out infinite",
            }}
          >
            🤖
          </div>
        </div>

        <p className="text-sm font-semibold text-white">
          Loading assessment
        </p>

        <p className="mt-2 text-xs text-slate-600">
          Preparing your test environment...
        </p>
      </div>
    </div>
  );
};

const ErrorScreen = ({
  error,
  onBack,
  onRetry,
}) => {
  return (
    <div className="min-h-screen bg-[#020617] px-6 py-12 text-white">
      <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center">
        <div className="w-full rounded-[30px] border border-red-500/15 bg-red-500/[0.035] p-8 text-center shadow-2xl shadow-red-950/10 sm:p-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-red-400/20 bg-red-400/10 text-4xl">
            ⚠️
          </div>

          <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-red-400">
            Assessment unavailable
          </p>

          <h2 className="mt-3 text-3xl font-black">
            Unable to Load Test
          </h2>

          <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-slate-500">
            {error}
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onRetry}
              className="rounded-xl bg-red-500 px-6 py-3 font-bold text-white transition hover:bg-red-400"
            >
              Try Again
            </button>

            <button
              type="button"
              onClick={onBack}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3 font-semibold text-slate-300 transition hover:bg-white/[0.07]"
            >
              ← Back to Mock Tests
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const getDifficultyConfig = (difficulty) => {
  switch (difficulty) {
    case "Easy":
      return {
        color: "emerald",
        label: "Beginner Friendly",
      };

    case "Hard":
      return {
        color: "red",
        label: "Advanced",
      };

    case "Mixed":
      return {
        color: "violet",
        label: "Mixed Difficulty",
      };

    default:
      return {
        color: "amber",
        label: "Intermediate",
      };
  }
};

const Badge = ({
  label,
  color = "cyan",
  icon,
}) => {
  const styles = {
    cyan:
      "border-cyan-400/20 bg-cyan-400/[0.06] text-cyan-300",
    purple:
      "border-purple-400/20 bg-purple-400/[0.06] text-purple-300",
    violet:
      "border-violet-400/20 bg-violet-400/[0.06] text-violet-300",
    emerald:
      "border-emerald-400/20 bg-emerald-400/[0.06] text-emerald-300",
    amber:
      "border-amber-400/20 bg-amber-400/[0.06] text-amber-300",
    red:
      "border-red-400/20 bg-red-400/[0.06] text-red-300",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${
        styles[color] || styles.cyan
      }`}
    >
      {icon && <span>{icon}</span>}
      {label}
    </span>
  );
};

const StatCard = ({
  icon,
  label,
  value,
  color,
}) => {
  const colors = {
    cyan:
      "border-cyan-400/10 bg-cyan-400/[0.025] text-cyan-400",
    violet:
      "border-violet-400/10 bg-violet-400/[0.025] text-violet-400",
    amber:
      "border-amber-400/10 bg-amber-400/[0.025] text-amber-400",
    emerald:
      "border-emerald-400/10 bg-emerald-400/[0.025] text-emerald-400",
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border p-5 transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
        colors[color] || colors.cyan
      }`}
    >
      <div className="absolute right-[-20px] top-[-20px] h-24 w-24 rounded-full bg-current opacity-[0.04] blur-2xl transition group-hover:opacity-[0.09]" />

      <div className="relative">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05] text-lg">
            {icon}
          </div>

          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-600">
            INFO
          </span>
        </div>

        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
          {label}
        </p>

        <p className="mt-1 text-2xl font-black text-white">
          {value}
        </p>
      </div>
    </div>
  );
};

const Section = ({
  eyebrow,
  title,
  icon,
  children,
}) => {
  return (
    <section className="glass rounded-[28px] p-5 shadow-xl shadow-black/10 sm:p-7">
      <div className="mb-6 flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/15 bg-cyan-400/[0.06] text-lg text-cyan-400">
          {icon}
        </div>

        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-cyan-400">
            {eyebrow}
          </p>

          <h2 className="mt-1 text-xl font-bold">
            {title}
          </h2>
        </div>
      </div>

      {children}
    </section>
  );
};

const InfoItem = ({
  icon,
  title,
  description,
  accent = "cyan",
}) => {
  const accents = {
    cyan:
      "border-cyan-400/10 bg-cyan-400/[0.025] group-hover:border-cyan-400/25",
    violet:
      "border-violet-400/10 bg-violet-400/[0.025] group-hover:border-violet-400/25",
    emerald:
      "border-emerald-400/10 bg-emerald-400/[0.025] group-hover:border-emerald-400/25",
    amber:
      "border-amber-400/10 bg-amber-400/[0.025] group-hover:border-amber-400/25",
  };

  return (
    <div
      className={`group rounded-2xl border p-4 transition duration-300 hover:-translate-y-0.5 ${
        accents[accent] || accents.cyan
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] text-xl transition group-hover:scale-110">
          {icon}
        </div>

        <div>
          <h3 className="font-semibold">
            {title}
          </h3>

          <p className="mt-1 text-xs leading-5 text-slate-600">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

const Instruction = ({
  number,
  title,
  text,
  warning = false,
}) => {
  return (
    <div className="group relative flex gap-4 py-2">
      <div className="relative flex shrink-0 flex-col items-center">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl border text-[10px] font-black transition group-hover:scale-105 ${
            warning
              ? "border-amber-400/20 bg-amber-400/[0.06] text-amber-400"
              : "border-cyan-400/15 bg-cyan-400/[0.05] text-cyan-400"
          }`}
        >
          {number}
        </div>

        <div className="mt-2 h-full w-px bg-gradient-to-b from-white/10 to-transparent" />
      </div>

      <div className="pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold">
            {title}
          </h3>

          {warning && (
            <span className="rounded-full border border-amber-400/15 bg-amber-400/5 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-amber-400">
              Important
            </span>
          )}
        </div>

        <p className="mt-1 text-xs leading-6 text-slate-500">
          {text}
        </p>
      </div>
    </div>
  );
};

const SummaryRow = ({
  icon,
  label,
  value,
}) => {
  return (
    <div className="group flex items-center justify-between gap-4 rounded-xl px-2 py-3 transition hover:bg-white/[0.025]">
      <div className="flex items-center gap-3">
        {icon && (
          <span className="text-sm opacity-70">
            {icon}
          </span>
        )}

        <span className="text-xs text-slate-500">
          {label}
        </span>
      </div>

      <span className="text-right text-sm font-bold text-slate-200">
        {value || "—"}
      </span>
    </div>
  );
};

const MiniBadge = ({
  label,
}) => {
  return (
    <span className="rounded-full border border-cyan-400/15 bg-cyan-400/5 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-cyan-300">
      ✓ {label}
    </span>
  );
};

export default TestDetails;