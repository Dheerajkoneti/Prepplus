import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { generateAIMockTest } from "../../services/mockTestService";

const TestGenerating = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [configuration, setConfiguration] = useState(null);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [status, setStatus] = useState("Preparing your test...");
  const [error, setError] = useState("");

  const steps = [
    {
      title: "Understanding your topics",
      description: "Analyzing your selected subject and topics",
      icon: "🧠",
    },
    {
      title: "Generating questions",
      description: "Creating intelligent questions using AI",
      icon: "✨",
    },
    {
      title: "Creating answer keys",
      description: "Validating answers and scoring logic",
      icon: "✓",
    },
    {
      title: "Preparing AI evaluation",
      description: "Configuring feedback and evaluation",
      icon: "🤖",
    },
  ];

  useEffect(() => {
    let config = location.state?.configuration;

    if (!config) {
      try {
        const saved = localStorage.getItem(
          "mockTestConfiguration"
        );

        if (saved) {
          config = JSON.parse(saved);
        }
      } catch (error) {
        console.error(
          "Failed to read saved configuration:",
          error
        );
      }
    }

    if (!config) {
      setError(
        "Mock test configuration was not found."
      );

      return;
    }

    console.log(
      "Mock Test Configuration:",
      config
    );

    setConfiguration(config);
  }, [location.state]);

  useEffect(() => {
    if (!configuration) {
      return;
    }

    let cancelled = false;

    const generateTest = async () => {
      try {
        setError("");

        setCurrentStep(0);
        setProgress(8);
        setStatus(
          "Understanding your selected topics..."
        );

        await new Promise((resolve) =>
          setTimeout(resolve, 900)
        );

        if (cancelled) return;

        setCurrentStep(1);
        setProgress(28);
        setStatus(
          "Generating questions with AI..."
        );

        const response =
          await generateAIMockTest(
            configuration
          );

        if (cancelled) return;

        console.log(
          "AI Mock Test Response:",
          response
        );

        setCurrentStep(2);
        setProgress(62);
        setStatus(
          "Creating answer keys..."
        );

        await new Promise((resolve) =>
          setTimeout(resolve, 900)
        );

        if (cancelled) return;

        setCurrentStep(3);
        setProgress(84);
        setStatus(
          "Preparing AI evaluation..."
        );

        await new Promise((resolve) =>
          setTimeout(resolve, 900)
        );

        if (cancelled) return;

        setProgress(100);
        setStatus(
          "Your mock test is ready!"
        );

        const testId =
          response?.testId ||
          response?.data?.testId ||
          response?.test?._id ||
          response?.data?.test?._id;

        if (!testId) {
          throw new Error(
            "Test was generated but test ID was not returned."
          );
        }

        await new Promise((resolve) =>
          setTimeout(resolve, 1000)
        );

        if (cancelled) return;

        navigate(
          `/mock-tests/${testId}`,
          {
            replace: true,
          }
        );
      } catch (err) {
        console.error(
          "AI test generation failed:",
          err?.response?.data || err
        );

        if (cancelled) return;

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to generate mock test."
        );
      }
    };

    generateTest();

    return () => {
      cancelled = true;
    };
  }, [configuration, navigate]);

  const handleBack = () => {
    navigate("/mock-tests/create");
  };

  if (error) {
    return (
      <ErrorScreen
        error={error}
        onBack={handleBack}
        onRetry={() =>
          window.location.reload()
        }
      />
    );
  }

  const questionCount =
    configuration?.questionCount ||
    configuration?.totalQuestions ||
    configuration?.numberOfQuestions ||
    "—";

  const duration =
    configuration?.durationMinutes ||
    configuration?.duration ||
    0;

  const category =
    configuration?.category ||
    configuration?.subject ||
    "Not specified";

  const difficulty =
    configuration?.difficulty ||
    "Mixed";

  return (
    <div className="min-h-screen overflow-hidden bg-[#020617] text-white">
      <style>
        {`
          @keyframes floatOrb {
            0%, 100% {
              transform: translateY(0px) scale(1);
            }

            50% {
              transform: translateY(-18px) scale(1.03);
            }
          }

          @keyframes pulseGlow {
            0%, 100% {
              opacity: .25;
              transform: scale(1);
            }

            50% {
              opacity: .65;
              transform: scale(1.15);
            }
          }

          @keyframes rotateRing {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          @keyframes rotateRingReverse {
            from {
              transform: rotate(360deg);
            }

            to {
              transform: rotate(0deg);
            }
          }

          @keyframes shimmer {
            0% {
              transform: translateX(-130%);
            }

            100% {
              transform: translateX(130%);
            }
          }

          @keyframes scan {
            0% {
              transform: translateY(-100%);
              opacity: 0;
            }

            30% {
              opacity: 1;
            }

            70% {
              opacity: 1;
            }

            100% {
              transform: translateY(500%);
              opacity: 0;
            }
          }

          @keyframes dotPulse {
            0%, 100% {
              opacity: .25;
              transform: scale(.7);
            }

            50% {
              opacity: 1;
              transform: scale(1);
            }
          }

          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(25px);
            }

            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes scaleIn {
            from {
              opacity: 0;
              transform: scale(.88);
            }

            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          @keyframes borderGlow {
            0%, 100% {
              border-color: rgba(34,211,238,.10);
            }

            50% {
              border-color: rgba(34,211,238,.35);
            }
          }

          .float-orb {
            animation: floatOrb 5s ease-in-out infinite;
          }

          .pulse-glow {
            animation: pulseGlow 4s ease-in-out infinite;
          }

          .rotate-ring {
            animation: rotateRing 18s linear infinite;
          }

          .rotate-ring-reverse {
            animation: rotateRingReverse 13s linear infinite;
          }

          .slide-up {
            animation: slideUp .7s ease-out both;
          }

          .scale-in {
            animation: scaleIn .6s ease-out both;
          }

          .border-glow {
            animation: borderGlow 3s ease-in-out infinite;
          }

          .shimmer {
            position: absolute;
            top: 0;
            bottom: 0;
            width: 35%;
            transform: translateX(-130%);
            background: linear-gradient(
              90deg,
              transparent,
              rgba(255,255,255,.20),
              transparent
            );
            animation: shimmer 2.8s ease-in-out infinite;
          }

          .grid-bg {
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

          .scan-line {
            animation: scan 4s ease-in-out infinite;
          }

          .dot-pulse {
            animation: dotPulse 1.4s ease-in-out infinite;
          }
        `}
      </style>

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="grid-bg absolute inset-0 opacity-70" />

        <div className="absolute left-1/2 top-[-180px] h-[550px] w-[550px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[150px] pulse-glow" />

        <div className="absolute bottom-[-180px] left-[-100px] h-[450px] w-[450px] rounded-full bg-blue-600/10 blur-[150px]" />

        <div className="absolute right-[-150px] top-[25%] h-[450px] w-[450px] rounded-full bg-violet-600/10 blur-[150px] pulse-glow" />

        <div className="absolute left-[12%] top-[20%] h-2 w-2 rounded-full bg-cyan-400 dot-pulse" />

        <div
          className="absolute left-[78%] top-[30%] h-2 w-2 rounded-full bg-blue-400 dot-pulse"
          style={{ animationDelay: "300ms" }}
        />

        <div
          className="absolute left-[20%] top-[75%] h-2 w-2 rounded-full bg-violet-400 dot-pulse"
          style={{ animationDelay: "700ms" }}
        />
      </div>

      <header className="relative z-20 border-b border-white/5 bg-[#020617]/70 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <button
            type="button"
            onClick={handleBack}
            className="group flex items-center gap-3 text-sm font-semibold text-slate-400 transition hover:text-white"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] transition group-hover:-translate-x-1 group-hover:border-cyan-400/30 group-hover:bg-cyan-400/5">
              ←
            </span>

            <span className="hidden sm:block">
              Mock Test Builder
            </span>
          </button>

          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />

            <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-slate-500">
              AI Engine Active
            </span>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-73px)] max-w-7xl items-center px-4 py-8 sm:px-6 lg:py-12">
        <div className="grid w-full items-center gap-8 lg:grid-cols-[1fr_420px]">
          <section className="slide-up">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/[0.04] px-4 py-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-50" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
              </span>

              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-300">
                AI Test Generation
              </span>
            </div>

            <h1 className="max-w-3xl text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Building your
              <span className="block bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                perfect mock test.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
              PrepPulse AI is analyzing your configuration,
              generating questions, validating answer keys,
              and preparing your personalized assessment
              environment.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <FeaturePill
                icon="🧠"
                label="AI Generated"
              />

              <FeaturePill
                icon="🎯"
                label="Personalized"
              />

              <FeaturePill
                icon="⚡"
                label="Real-Time"
              />

              <FeaturePill
                icon="🔒"
                label="Secure"
              />
            </div>

            <div className="mt-10 hidden lg:block">
              <GenerationTimeline
                steps={steps}
                currentStep={currentStep}
                progress={progress}
              />
            </div>
          </section>

          <section className="scale-in">
            <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-slate-900/60 p-6 shadow-2xl shadow-cyan-950/20 backdrop-blur-2xl sm:p-8">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.045] via-transparent to-violet-500/[0.045]" />

              <div className="absolute right-[-80px] top-[-80px] h-52 w-52 rounded-full bg-cyan-500/10 blur-3xl pulse-glow" />

              <div className="relative">
                <div className="flex justify-center">
                  <AIOrb progress={progress} />
                </div>

                <div className="mt-7 text-center">
                  <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-cyan-400">
                    {status}
                  </p>

                  <h2 className="mt-3 text-2xl font-black sm:text-3xl">
                    {progress >= 100
                      ? "Test Ready"
                      : "Generating Test"}
                  </h2>

                  <p className="mt-3 text-xs leading-5 text-slate-600">
                    This usually takes a few moments.
                    Please keep this page open.
                  </p>
                </div>

                <div className="mt-7">
                  <ProgressBar
                    progress={progress}
                  />
                </div>

                <div className="mt-3 flex items-center justify-between text-[10px]">
                  <span className="text-slate-600">
                    Generation progress
                  </span>

                  <span className="font-bold text-cyan-400">
                    {progress}%
                  </span>
                </div>

                <div className="mt-7 rounded-2xl border border-white/5 bg-black/20 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-lg">
                      ⚡
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-bold">
                        AI Processing
                      </p>

                      <div className="mt-1 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />

                        <span className="truncate text-[10px] text-slate-600">
                          Gemini generation engine connected
                        </span>
                      </div>
                    </div>

                    <span className="ml-auto rounded-full border border-emerald-400/15 bg-emerald-400/5 px-2 py-1 text-[8px] font-bold uppercase tracking-wider text-emerald-400">
                      Online
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <ConfigurationPanel
                    category={category}
                    difficulty={difficulty}
                    questionCount={questionCount}
                    duration={duration}
                  />
                </div>

                <p className="mt-6 text-center text-[9px] leading-5 text-slate-700">
                  Do not refresh or close this page while
                  your mock test is being generated.
                </p>

                <button
                  type="button"
                  onClick={handleBack}
                  className="mx-auto mt-4 block text-[10px] font-semibold text-slate-600 underline transition hover:text-cyan-400"
                >
                  Cancel and return to settings
                </button>
              </div>
            </div>
          </section>

          <div className="lg:hidden">
            <GenerationTimeline
              steps={steps}
              currentStep={currentStep}
              progress={progress}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

const AIOrb = ({ progress }) => {
  return (
    <div className="relative flex h-56 w-56 items-center justify-center">
      <div className="absolute h-44 w-44 rounded-full bg-cyan-400/10 blur-3xl pulse-glow" />

      <div className="absolute inset-1 rounded-full border border-cyan-400/10 rotate-ring" />

      <div className="absolute inset-5 rounded-full border border-dashed border-blue-400/15 rotate-ring-reverse" />

      <div className="absolute inset-10 rounded-full border border-violet-400/10 rotate-ring" />

      <svg
        className="absolute inset-0 h-full w-full -rotate-90"
        viewBox="0 0 224 224"
      >
        <circle
          cx="112"
          cy="112"
          r="94"
          fill="none"
          stroke="rgba(255,255,255,.035)"
          strokeWidth="3"
        />

        <circle
          cx="112"
          cy="112"
          r="94"
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={590}
          strokeDashoffset={
            590 - (590 * progress) / 100
          }
          style={{
            transition:
              "stroke-dashoffset 800ms ease",
          }}
        />

        <defs>
          <linearGradient
            id="progressGradient"
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
              stopColor="#3b82f6"
            />

            <stop
              offset="100%"
              stopColor="#8b5cf6"
            />
          </linearGradient>
        </defs>
      </svg>

      <div className="float-orb relative flex h-32 w-32 items-center justify-center rounded-[35px] border border-cyan-400/20 bg-slate-950/80 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl">
        <div className="absolute inset-3 rounded-[28px] border border-white/5" />

        <div className="relative text-center">
          <div className="text-5xl">
            🤖
          </div>

          <p className="mt-2 text-[8px] font-black uppercase tracking-[0.3em] text-cyan-400">
            AI CORE
          </p>
        </div>
      </div>

      <div className="absolute right-0 top-8 flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-xs">
        ✦
      </div>

      <div className="absolute bottom-7 left-1 flex h-8 w-8 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-400/10 text-xs">
        AI
      </div>
    </div>
  );
};

const ProgressBar = ({ progress }) => {
  return (
    <div className="relative h-3 overflow-hidden rounded-full bg-slate-800/80">
      <div
        className="relative h-full overflow-hidden rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 shadow-lg shadow-cyan-500/20 transition-all duration-700 ease-out"
        style={{
          width: `${progress}%`,
        }}
      >
        <div className="shimmer" />
      </div>
    </div>
  );
};

const GenerationTimeline = ({
  steps,
  currentStep,
  progress,
}) => {
  return (
    <div className="rounded-3xl border border-white/5 bg-white/[0.018] p-5 backdrop-blur-xl">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-slate-600">
            Generation Pipeline
          </p>

          <h3 className="mt-1 text-sm font-bold">
            Building your assessment
          </h3>
        </div>

        <div className="rounded-full border border-cyan-400/10 bg-cyan-400/5 px-3 py-1 text-[9px] font-bold text-cyan-400">
          {progress}%
        </div>
      </div>

      <div className="space-y-2">
        {steps.map((step, index) => {
          const completed =
            index < currentStep ||
            progress >= 100;

          const active =
            index === currentStep &&
            progress < 100;

          return (
            <div
              key={step.title}
              className={`group relative flex gap-4 rounded-2xl border p-3 transition-all duration-500 ${
                active
                  ? "border-cyan-400/15 bg-cyan-400/[0.035]"
                  : completed
                  ? "border-emerald-400/10 bg-emerald-400/[0.025]"
                  : "border-transparent bg-transparent"
              }`}
            >
              <div className="relative flex shrink-0 flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border text-sm transition-all duration-500 ${
                    completed
                      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-400"
                      : active
                      ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-400"
                      : "border-white/5 bg-slate-900 text-slate-700"
                  }`}
                >
                  {completed
                    ? "✓"
                    : step.icon}
                </div>

                {index <
                  steps.length - 1 && (
                  <div
                    className={`mt-1 h-full min-h-[18px] w-px ${
                      completed
                        ? "bg-emerald-400/20"
                        : "bg-white/5"
                    }`}
                  />
                )}
              </div>

              <div className="min-w-0 flex-1 pt-1">
                <div className="flex items-center gap-2">
                  <p
                    className={`text-xs font-semibold ${
                      completed
                        ? "text-emerald-300"
                        : active
                        ? "text-white"
                        : "text-slate-600"
                    }`}
                  >
                    {step.title}
                  </p>

                  {active && (
                    <span className="flex gap-0.5">
                      <span className="h-1 w-1 animate-bounce rounded-full bg-cyan-400" />
                      <span
                        className="h-1 w-1 animate-bounce rounded-full bg-cyan-400"
                        style={{
                          animationDelay:
                            "100ms",
                        }}
                      />
                      <span
                        className="h-1 w-1 animate-bounce rounded-full bg-cyan-400"
                        style={{
                          animationDelay:
                            "200ms",
                        }}
                      />
                    </span>
                  )}
                </div>

                <p
                  className={`mt-1 text-[10px] leading-5 ${
                    completed || active
                      ? "text-slate-500"
                      : "text-slate-700"
                  }`}
                >
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ConfigurationPanel = ({
  category,
  difficulty,
  questionCount,
  duration,
}) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/5 bg-black/20">
      <div className="border-b border-white/5 px-4 py-3">
        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600">
          Test Configuration
        </p>
      </div>

      <div className="grid grid-cols-2 gap-px bg-white/5">
        <ConfigItem
          icon="📚"
          label="Subject"
          value={category}
        />

        <ConfigItem
          icon="🔥"
          label="Difficulty"
          value={difficulty}
        />

        <ConfigItem
          icon="📝"
          label="Questions"
          value={questionCount}
        />

        <ConfigItem
          icon="⏱"
          label="Duration"
          value={`${duration} min`}
        />
      </div>
    </div>
  );
};

const ConfigItem = ({
  icon,
  label,
  value,
}) => {
  return (
    <div className="bg-slate-950/60 p-3">
      <div className="flex items-center gap-2">
        <span className="text-xs">
          {icon}
        </span>

        <p className="text-[9px] text-slate-600">
          {label}
        </p>
      </div>

      <p className="mt-1 truncate text-xs font-bold text-slate-300">
        {value}
      </p>
    </div>
  );
};

const FeaturePill = ({
  icon,
  label,
}) => {
  return (
    <div className="group flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.025] px-3 py-2 transition hover:-translate-y-0.5 hover:border-cyan-400/20 hover:bg-cyan-400/[0.03]">
      <span className="text-xs transition group-hover:scale-110">
        {icon}
      </span>

      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </span>
    </div>
  );
};

const ErrorScreen = ({
  error,
  onBack,
  onRetry,
}) => {
  return (
    <div className="min-h-screen overflow-hidden bg-[#020617] px-4 py-8 text-white">
      <style>
        {`
          @keyframes errorFloat {
            0%, 100% {
              transform: translateY(0);
            }

            50% {
              transform: translateY(-8px);
            }
          }
        `}
      </style>

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500/5 blur-[150px]" />
      </div>

      <div className="relative mx-auto flex min-h-[90vh] max-w-3xl items-center justify-center">
        <div className="w-full rounded-[32px] border border-red-500/15 bg-red-500/[0.025] p-7 text-center shadow-2xl shadow-red-950/20 backdrop-blur-xl sm:p-12">
          <div
            className="mx-auto flex h-24 w-24 items-center justify-center rounded-[30px] border border-red-400/20 bg-red-400/10 text-4xl shadow-xl shadow-red-500/5"
            style={{
              animation:
                "errorFloat 3s ease-in-out infinite",
            }}
          >
            ⚠️
          </div>

          <p className="mt-7 text-[9px] font-bold uppercase tracking-[0.3em] text-red-400">
            Generation Error
          </p>

          <h1 className="mt-3 text-3xl font-black sm:text-4xl">
            Test Generation Failed
          </h1>

          <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-slate-500">
            {error}
          </p>

          <div className="mx-auto mt-7 max-w-md rounded-2xl border border-white/5 bg-black/20 p-4 text-left">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10">
                💡
              </div>

              <div>
                <p className="text-xs font-bold">
                  What you can do
                </p>

                <p className="mt-1 text-[10px] leading-5 text-slate-600">
                  Try generating the assessment again or
                  return to settings and verify your configuration.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onRetry}
              className="rounded-xl bg-gradient-to-r from-red-500 to-rose-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-red-500/10 transition hover:-translate-y-0.5 hover:from-red-400 hover:to-rose-500"
            >
              ↻ Try Again
            </button>

            <button
              type="button"
              onClick={onBack}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.07] hover:text-white"
            >
              ← Back to Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestGenerating;