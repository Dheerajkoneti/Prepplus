import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import axios from "axios";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  Brain,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Loader2,
  MessageSquare,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  XCircle,
} from "lucide-react";

/* =========================================================
   CONFIG
   ========================================================= */

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

/* =========================================================
   AUTH TOKEN
   ========================================================= */

const getToken = () =>
  localStorage.getItem("token") ||
  localStorage.getItem("accessToken") ||
  localStorage.getItem("authToken") ||
  "";

/* =========================================================
   API HELPER
   ========================================================= */

const api = (config) =>
  axios({
    ...config,
    headers: {
      ...(config.headers || {}),
      ...(getToken()
        ? {
            Authorization: `Bearer ${getToken()}`,
          }
        : {}),
    },
  });

/* =========================================================
   HELPERS
   ========================================================= */

const pct = (value) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? Math.min(100, Math.max(0, Math.round(number)))
    : 0;
};

const arr = (value) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  return value ? [String(value)] : [];
};

/* =========================================================
   SCORE RING
   ========================================================= */

function ScoreRing({ score }) {
  const radius = 62;
  const circumference = 2 * Math.PI * radius;

  const percentage = pct(score);

  const offset =
    circumference - (percentage / 100) * circumference;

  return (
    <div className="mir-ring">
      <svg viewBox="0 0 160 160">
        <circle
          cx="80"
          cy="80"
          r={radius}
          className="mir-track"
        />

        <circle
          cx="80"
          cy="80"
          r={radius}
          className="mir-progress"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>

      <div className="mir-ring-text">
        <strong>{percentage}%</strong>
        <span>Overall</span>
      </div>
    </div>
  );
}

/* =========================================================
   METRIC
   ========================================================= */

function Metric({
  icon: Icon,
  title,
  score,
}) {
  const percentage = pct(score);

  return (
    <div className="mir-metric">
      <div className="mir-icon">
        <Icon size={20} />
      </div>

      <div className="mir-metric-content">
        <span>{title}</span>
        <strong>{percentage}%</strong>
      </div>

      <div className="mir-bar">
        <i
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}

/* =========================================================
   ANSWER CARD
   ========================================================= */

function AnswerCard({
  item,
  index,
}) {
  const [open, setOpen] = useState(index === 0);

  const score = Math.min(
    10,
    Math.max(0, Number(item?.score || 0))
  );

  const questionNumber = Number.isFinite(
    Number(item?.questionIndex)
  )
    ? Number(item.questionIndex) + 1
    : index + 1;

  return (
    <article
      className={`mir-answer ${
        open ? "open" : ""
      }`}
    >
      <button
        type="button"
        className="mir-answer-head"
        onClick={() => setOpen((value) => !value)}
      >
        <b>Q{questionNumber}</b>

        <div className="mir-answer-question">
          <small>Interview Question</small>

          <strong>
            {item?.question ||
              "Question unavailable"}
          </strong>
        </div>

        <em>{score}/10</em>

        {open ? (
          <ChevronUp size={18} />
        ) : (
          <ChevronDown size={18} />
        )}
      </button>

      {open && (
        <div className="mir-answer-body">
          <Box
            icon={MessageSquare}
            title="Your Answer"
          >
            <p className="mir-user-answer">
              {item?.answer?.trim() ||
                "No answer was submitted."}
            </p>
          </Box>

          <div className="mir-feedback-grid">
            <Box
              icon={Check}
              title="What You Did Well"
              good
            >
              <p>
                {item?.whatWasGood ||
                  "No positive points were returned."}
              </p>
            </Box>

            <Box
              icon={XCircle}
              title="What Was Missing / Wrong"
              warn
            >
              <p>
                {item?.whatWasWrong ||
                  "No additional issue was returned."}
              </p>
            </Box>
          </div>

          <Box
            icon={TrendingUp}
            title="How To Improve"
          >
            <p>
              {item?.improvement ||
                "Explain the concept clearly and include a practical example."}
            </p>
          </Box>

          <Box
            icon={Sparkles}
            title="AI Feedback"
            ai
          >
            <p>
              {item?.feedback ||
                "No additional AI feedback was returned."}
            </p>
          </Box>

          <Box
            icon={Brain}
            title="Expected / Ideal Answer"
          >
            <p>
              {item?.expectedAnswer ||
                "Expected answer unavailable."}
            </p>
          </Box>
        </div>
      )}
    </article>
  );
}

/* =========================================================
   BOX
   ========================================================= */

function Box({
  icon: Icon,
  title,
  children,
  good,
  warn,
  ai,
}) {
  return (
    <section
      className={`mir-box ${
        good ? "good" : ""
      } ${warn ? "warn" : ""} ${
        ai ? "ai" : ""
      }`}
    >
      <h4>
        <Icon size={16} />
        {title}
      </h4>

      {children}
    </section>
  );
}

/* =========================================================
   SECURITY
   ========================================================= */

function Security({
  security,
}) {
  const s = security || {};

  const events = Array.isArray(s.events)
    ? s.events
    : [];

  return (
    <section className="mir-panel">
      <Title
        icon={ShieldCheck}
        eyebrow="AI PROCTORING"
        title="Security Summary"
      />

      <div className="mir-security-grid">
        <div>
          <strong>
            {Number(s.violationCount || 0)}/3
          </strong>
          <span>Strikes</span>
        </div>

        <div>
          <strong>
            {Number(s.tabSwitches || 0)}
          </strong>
          <span>Tab Switches</span>
        </div>

        <div>
          <strong>
            {Number(s.fullscreenExits || 0)}
          </strong>
          <span>Fullscreen Exits</span>
        </div>

        <div>
          <strong>
            {Number(s.faceWarnings || 0)}
          </strong>
          <span>Face Warnings</span>
        </div>

        <div>
          <strong>
            {Number(s.multipleFaceWarnings || 0)}
          </strong>
          <span>Multiple Face</span>
        </div>

        <div>
          <strong>
            {Number(s.copyPasteAttempts || 0)}
          </strong>
          <span>Copy/Paste</span>
        </div>
      </div>

      {events.length > 0 && (
        <div className="mir-events">
          {events
            .slice(-8)
            .reverse()
            .map((event, index) => (
              <div
                className="mir-event"
                key={`${
                  event.timestamp || ""
                }-${index}`}
              >
                {event.countedAsViolation ? (
                  <ShieldAlert size={17} />
                ) : (
                  <ShieldCheck size={17} />
                )}

                <div>
                  <strong>
                    {event.type ||
                      "SECURITY EVENT"}
                  </strong>

                  <p>
                    {event.message ||
                      "Security event recorded."}
                  </p>
                </div>

                <small>
                  {event.timestamp
                    ? new Date(
                        event.timestamp
                      ).toLocaleString()
                    : ""}
                </small>
              </div>
            ))}
        </div>
      )}
    </section>
  );
}

/* =========================================================
   TITLE
   ========================================================= */

function Title({
  icon: Icon,
  eyebrow,
  title,
}) {
  return (
    <div className="mir-title">
      <div className="mir-title-icon">
        <Icon size={20} />
      </div>

      <div className="mir-title-content">
        <small>{eyebrow}</small>
        <h2>{title}</h2>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN RESULT PAGE
   ========================================================= */

function MockInterviewResult() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [data, setData] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [reporting, setReporting] =
    useState(false);

  /* =======================================================
     LOAD RESULT
     ======================================================= */

  const load = useCallback(async () => {
    if (!id) {
      setError("Interview ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      let response = await api({
        method: "GET",
        url: `${API_URL}/api/mock-interview/${id}/result`,
      });

      let result =
        response.data?.interview ||
        response.data?.data ||
        response.data;

      /*
       * If final report has not been generated,
       * generate it first.
       */

      if (
        result &&
        result.reportGenerated === false
      ) {
        setReporting(true);

        try {
          await api({
            method: "GET",
            url: `${API_URL}/api/mock-interview/${id}/report`,
            timeout: 120000,
          });

          response = await api({
            method: "GET",
            url: `${API_URL}/api/mock-interview/${id}/result`,
          });

          result =
            response.data?.interview ||
            response.data?.data ||
            response.data;
        } finally {
          setReporting(false);
        }
      }

      if (!result) {
        throw new Error(
          "Interview result was not returned."
        );
      }

      setData(result);
    } catch (err) {
      console.error(
        "RESULT PAGE ERROR:",
        errF
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load interview result."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  /* =======================================================
     INITIAL LOAD
     ======================================================= */

  useEffect(() => {
    load();
  }, [load]);

  /* =======================================================
     ANSWERS
     ======================================================= */

  const answers = useMemo(() => {
    if (!data) {
      return [];
    }

    if (Array.isArray(data.answers)) {
      return data.answers;
    }

    if (
      Array.isArray(
        data.questionAnalysis
      )
    ) {
      return data.questionAnalysis;
    }

    return [];
  }, [data]);

  /* =======================================================
     LOADING
     ======================================================= */

  if (loading) {
    return (
      <>
        <style>{css}</style>

        <div className="mir-page mir-center">
          <div className="mir-loading">
            <div className="mir-loading-orb">
              <Brain size={38} />
            </div>

            <Loader2
              className="spin"
              size={30}
            />

            <h1>
              Preparing Your AI Report
            </h1>

            <p>
              {reporting
                ? "Generating final AI assessment..."
                : "Loading interview results..."}
            </p>
          </div>
        </div>
      </>
    );
  }

  /* =======================================================
     ERROR
     ======================================================= */

  if (error) {
    return (
      <>
        <style>{css}</style>

        <div className="mir-page mir-center">
          <div className="mir-loading">
            <XCircle size={48} />

            <h1>
              Unable to Load Results
            </h1>

            <p>{error}</p>

            <button
              className="mir-primary"
              onClick={load}
              type="button"
            >
              <RefreshCw size={17} />
              Try Again
            </button>
          </div>
        </div>
      </>
    );
  }

  /* =======================================================
     RESULT DATA
     ======================================================= */

  const attempted = Number(
    data?.attemptedQuestions ??
      answers.filter((answer) =>
        String(
          answer?.answer || ""
        ).trim()
      ).length
  );

  const total = Number(
    data?.totalQuestions ??
      answers.length
  );

  const evaluated = Number(
    data?.evaluatedQuestions ??
      answers.filter(
        (answer) =>
          answer?.evaluationStatus ===
          "completed"
      ).length
  );

  const score =
    data?.overallScore ??
    data?.score ??
    0;

  const strengths = arr(
    data?.strengths
  );

  const weaknesses = arr(
    data?.weaknesses
  );

  const suggestions = arr(
    data?.suggestions
  );

  const completion =
    total > 0
      ? Math.round(
          (attempted / total) * 100
        )
      : 0;

  /* =======================================================
     PAGE
     ======================================================= */

  return (
    <>
      <style>{css}</style>

      <div className="mir-page">
        {/* =================================================
            HEADER
            ================================================= */}

        <header className="mir-header">
          <div className="mir-header-inner">
            <button
              className="mir-secondary"
              onClick={() => navigate("/dashboard")}
              type="button"
            >
              <ArrowLeft size={17} />
              Dashboard
            </button>

            <div className="mir-brand">
              <div className="mir-brand-icon">
                <Brain size={22} />
              </div>

              <div>
                <b>PrepPulse AI</b>
                <span>
                  Interview Intelligence Report
                </span>
              </div>
            </div>

            <button
              className="mir-secondary"
              onClick={load}
              type="button"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </header>

        {/* =================================================
            MAIN
            ================================================= */}

        <main className="mir-main">
          {/* =================================================
              HERO
              ================================================= */}

          <section className="mir-hero">
            <div>
              <div className="mir-eyebrow">
                <Sparkles size={15} />
                INTERVIEW COMPLETED
              </div>

              <h1>
                Your AI Interview
                <span>
                  Performance Report
                </span>
              </h1>

              <p>
                {data?.role ||
                  "Technical Interview"}

                {data?.company
                  ? ` • ${data.company}`
                  : ""}

                {data?.level
                  ? ` • ${data.level}`
                  : ""}
              </p>
            </div>

            <div className="mir-status">
              <Trophy size={17} />

              {data?.status ||
                "Completed"}
            </div>
          </section>

          {/* =================================================
              OVERVIEW
              ================================================= */}

          <section className="mir-overview">
            <div className="mir-score-area">
              <ScoreRing score={score} />

              <div>
                <small>
                  FINAL SCORE
                </small>

                <h2>
                  {Number(score) >= 80
                    ? "Excellent Performance"
                    : Number(score) >= 60
                    ? "Good Performance"
                    : Number(score) >= 40
                    ? "Keep Improving"
                    : "Needs More Practice"}
                </h2>

                <p>
                  {attempted} of{" "}
                  {total || "—"}{" "}
                  questions attempted
                  {" • "}
                  {evaluated} AI evaluated
                </p>
              </div>
            </div>

            <div className="mir-stats">
              <div>
                <b>{attempted}</b>
                <span>Attempted</span>
              </div>

              <div>
                <b>{total}</b>
                <span>Total</span>
              </div>

              <div>
                <b>{evaluated}</b>
                <span>AI Evaluated</span>
              </div>

              <div>
                <b>{completion}%</b>
                <span>Completion</span>
              </div>
            </div>
          </section>

          {/* =================================================
              METRICS
              ================================================= */}

          <section className="mir-metrics">
            <Metric
              icon={Target}
              title="Technical"
              score={
                data?.technicalScore
              }
            />

            <Metric
              icon={MessageSquare}
              title="Communication"
              score={
                data?.communicationScore
              }
            />

            <Metric
              icon={TrendingUp}
              title="Confidence"
              score={
                data?.confidenceScore
              }
            />
          </section>

          {/* =================================================
              STRENGTHS / WEAKNESSES
              ================================================= */}

          <section className="mir-two">
            <div className="mir-panel">
              <Title
                icon={CheckCircle2}
                eyebrow="AI INSIGHTS"
                title="Strengths"
              />

              {strengths.length > 0 ? (
                <ul>
                  {strengths.map(
                    (item, index) => (
                      <li key={index}>
                        <Check size={16} />
                        {item}
                      </li>
                    )
                  )}
                </ul>
              ) : (
                <p className="muted">
                  No specific strengths
                  were generated.
                </p>
              )}
            </div>

            <div className="mir-panel">
              <Title
                icon={Target}
                eyebrow="AI INSIGHTS"
                title="Areas To Improve"
              />

              {weaknesses.length > 0 ? (
                <ul>
                  {weaknesses.map(
                    (item, index) => (
                      <li key={index}>
                        <Lightbulb
                          size={16}
                        />
                        {item}
                      </li>
                    )
                  )}
                </ul>
              ) : (
                <p className="muted">
                  No specific weaknesses
                  were generated.
                </p>
              )}
            </div>
          </section>

          {/* =================================================
              OVERALL FEEDBACK
              ================================================= */}

          <section className="mir-panel">
            <Title
              icon={Sparkles}
              eyebrow="FINAL AI ASSESSMENT"
              title="Overall Feedback"
            />

            <div className="mir-feedback">
              {data?.feedback ||
                (attempted === 0
                  ? "No answers were submitted for this interview."
                  : "Final AI feedback is not available. Review the question-level evaluations below.")}
            </div>
          </section>

          {/* =================================================
              SUGGESTIONS
              ================================================= */}

          <section className="mir-panel">
            <Title
              icon={Lightbulb}
              eyebrow="NEXT STEPS"
              title="Personalized Suggestions"
            />

            {suggestions.length > 0 ? (
              <div className="mir-suggestions">
                {suggestions.map(
                  (item, index) => (
                    <div key={index}>
                      <b>{index + 1}</b>
                      <span>{item}</span>
                    </div>
                  )
                )}
              </div>
            ) : (
              <p className="muted">
                No personalized
                suggestions were generated.
              </p>
            )}
          </section>

          {/* =================================================
              QUESTION BREAKDOWN
              ================================================= */}

          <section className="mir-panel">
            <Title
              icon={Brain}
              eyebrow="QUESTION-BY-QUESTION"
              title="AI Evaluation Breakdown"
            />

            {answers.length > 0 ? (
              <div className="mir-answer-list">
                {answers.map(
                  (answer, index) => (
                    <AnswerCard
                      key={`${
                        answer?.questionIndex ??
                        index
                      }-${index}`}
                      item={answer}
                      index={index}
                    />
                  )
                )}
              </div>
            ) : (
              <div className="mir-empty">
                <MessageSquare size={30} />

                <h3>
                  No Answers Submitted
                </h3>

                <p>
                  There are no
                  question-level answers
                  available for this
                  interview.
                </p>
              </div>
            )}
          </section>

          {/* =================================================
              SECURITY
              ================================================= */}

          <Security
            security={data?.security}
          />

          {/* =================================================
              ACTIONS
              ================================================= */}

          <div className="mir-actions">
            <button
              className="mir-secondary"
              onClick={() => navigate("/dashboard")}
              type="button"
            >
              <ArrowLeft size={17} />
              Dashboard
            </button>

            <button
              className="mir-primary"
              onClick={() =>
                navigate(
                  "/mock-interview"
                )
              }
              type="button"
            >
              <RefreshCw size={17} />
              Start New Interview
            </button>
          </div>
        </main>
      </div>
    </>
  );
}

/* =========================================================
   COMPLETE PAGE CSS
   ========================================================= */

const css = `
/* =========================================================
   GLOBAL RESET
   THIS REMOVES THE WHITE SPACE
   ========================================================= */

html,
body,
#root {
  margin: 0 !important;
  padding: 0 !important;
  width: 100% !important;
  min-width: 100% !important;
  min-height: 100% !important;
  background: #020617 !important;
}

html {
  background: #020617 !important;
}

body {
  min-height: 100vh !important;
  min-height: 100dvh !important;
  overflow-x: hidden !important;
  background: #020617 !important;
}

#root {
  min-height: 100vh !important;
  min-height: 100dvh !important;
  background: #020617 !important;
}

* {
  box-sizing: border-box;
}

/* =========================================================
   PAGE
   ========================================================= */

.mir-page {
  position: relative;
  width: 100%;
  min-width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  margin: 0 !important;
  padding: 0;
  overflow-x: hidden;

  background:
    radial-gradient(
      circle at 10% 0%,
      rgba(34, 211, 238, 0.12),
      transparent 30%
    ),
    radial-gradient(
      circle at 90% 10%,
      rgba(139, 92, 246, 0.13),
      transparent 30%
    ),
    #020617;

  color: #f8fafc;

  font-family:
    Inter,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
}

/* =========================================================
   HEADER
   ========================================================= */

.mir-header {
  position: sticky;
  top: 0;
  z-index: 100;

  width: 100%;
  margin: 0;

  background: rgba(2, 6, 23, 0.94);

  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);

  border-bottom:
    1px solid
    rgba(148, 163, 184, 0.12);
}

.mir-header-inner {
  width: min(
    1380px,
    calc(100% - 36px)
  );

  min-height: 72px;

  margin: 0 auto;

  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 16px;
}

/* =========================================================
   BRAND
   ========================================================= */

.mir-brand {
  display: flex;
  align-items: center;
  gap: 11px;
}

.mir-brand-icon {
  width: 42px;
  height: 42px;

  border-radius: 13px;

  display: grid;
  place-items: center;

  background:
    linear-gradient(
      135deg,
      #06b6d4,
      #6366f1,
      #8b5cf6
    );

  box-shadow:
    0 0 25px
    rgba(99, 102, 241, 0.25);
}

.mir-brand b {
  display: block;
  font-size: 15px;
}

.mir-brand span {
  display: block;

  color: #94a3b8;

  font-size: 11px;

  margin-top: 2px;
}

/* =========================================================
   MAIN
   ========================================================= */

.mir-main {
  width: min(
    1380px,
    calc(100% - 36px)
  );

  margin: 0 auto;

  padding: 45px 0 80px;

  min-height:
    calc(100vh - 72px);

  min-height:
    calc(100dvh - 72px);
}

/* =========================================================
   HERO
   ========================================================= */

.mir-hero {
  display: flex;

  justify-content: space-between;

  align-items: flex-end;

  gap: 20px;

  margin-bottom: 25px;
}

.mir-eyebrow {
  display: flex;

  align-items: center;

  gap: 7px;

  color: #67e8f9;

  font-size: 11px;

  font-weight: 800;

  letter-spacing: 0.12em;

  margin-bottom: 12px;
}

.mir-hero h1 {
  font-size:
    clamp(32px, 5vw, 57px);

  line-height: 1.05;

  letter-spacing: -0.045em;

  margin: 0;
}

.mir-hero h1 span {
  display: block;

  background:
    linear-gradient(
      90deg,
      #67e8f9,
      #818cf8,
      #c084fc
    );

  -webkit-background-clip: text;

  background-clip: text;

  color: transparent;
}

.mir-hero p {
  color: #94a3b8;

  margin-top: 10px;

  font-size: 14px;
}

/* =========================================================
   BUTTONS
   ========================================================= */

button {
  font: inherit;
  cursor: pointer;
}

.mir-status,
.mir-secondary,
.mir-primary {
  display: inline-flex;

  align-items: center;

  justify-content: center;

  gap: 8px;

  border-radius: 13px;

  padding: 10px 14px;

  font-size: 12px;

  font-weight: 800;

  transition:
    transform 0.2s ease,
    opacity 0.2s ease,
    border-color 0.2s ease;
}

.mir-secondary:hover,
.mir-primary:hover {
  transform: translateY(-1px);
}

.mir-secondary {
  color: #cbd5e1;

  background:
    rgba(15, 23, 42, 0.7);

  border:
    1px solid
    rgba(148, 163, 184, 0.14);
}

.mir-secondary:hover {
  border-color:
    rgba(103, 232, 249, 0.35);
}

.mir-primary {
  color: white;

  background:
    linear-gradient(
      135deg,
      #06b6d4,
      #6366f1,
      #8b5cf6
    );

  border: 0;

  box-shadow:
    0 10px 30px
    rgba(99, 102, 241, 0.2);
}

.mir-status {
  color: #67e8f9;

  border:
    1px solid
    rgba(34, 211, 238, 0.2);

  background:
    rgba(34, 211, 238, 0.08);
}

/* =========================================================
   COMMON CARDS
   ========================================================= */

.mir-overview,
.mir-panel,
.mir-metric {
  border:
    1px solid
    rgba(129, 140, 248, 0.17);

  background:
    linear-gradient(
      145deg,
      rgba(15, 23, 42, 0.9),
      rgba(7, 13, 32, 0.82)
    );

  border-radius: 24px;

  box-shadow:
    0 25px 80px
    rgba(0, 0, 0, 0.2);
}

/* =========================================================
   OVERVIEW
   ========================================================= */

.mir-overview {
  padding: 27px;

  display: grid;

  grid-template-columns:
    1.2fr 1fr;

  gap: 25px;

  align-items: center;
}

.mir-score-area {
  display: flex;

  align-items: center;

  gap: 25px;
}

/* =========================================================
   SCORE RING
   ========================================================= */

.mir-ring {
  width: 185px;
  height: 185px;

  position: relative;

  flex: 0 0 185px;
}

.mir-ring svg {
  width: 100%;
  height: 100%;

  transform: rotate(-90deg);
}

.mir-track,
.mir-progress {
  fill: none;

  stroke-width: 10;
}

.mir-track {
  stroke:
    rgba(148, 163, 184, 0.1);
}

.mir-progress {
  stroke: #67e8f9;

  stroke-linecap: round;

  filter:
    drop-shadow(
      0 0 8px
      rgba(34, 211, 238, 0.5)
    );

  transition:
    stroke-dashoffset 0.7s ease;
}

.mir-ring-text {
  position: absolute;

  inset: 0;

  display: grid;

  place-content: center;

  text-align: center;
}

.mir-ring-text strong {
  font-size: 37px;
}

.mir-ring-text span {
  font-size: 11px;

  color: #94a3b8;
}

.mir-score-area small {
  color: #94a3b8;

  font-size: 10px;

  letter-spacing: 0.1em;
}

.mir-score-area h2 {
  font-size: 25px;

  margin: 7px 0;
}

.mir-score-area p {
  color: #94a3b8;

  font-size: 13px;
}

/* =========================================================
   STATS
   ========================================================= */

.mir-stats {
  display: grid;

  grid-template-columns:
    repeat(2, 1fr);

  gap: 10px;
}

.mir-stats > div {
  padding: 16px;

  border:
    1px solid
    rgba(148, 163, 184, 0.09);

  border-radius: 16px;

  background:
    rgba(2, 6, 23, 0.35);
}

.mir-stats b {
  font-size: 25px;

  display: block;
}

.mir-stats span {
  font-size: 11px;

  color: #94a3b8;
}

/* =========================================================
   METRICS
   ========================================================= */

.mir-metrics {
  display: grid;

  grid-template-columns:
    repeat(3, 1fr);

  gap: 15px;

  margin: 16px 0;
}

.mir-metric {
  min-height: 96px;

  padding: 18px;

  display: flex;

  align-items: center;

  gap: 12px;

  position: relative;

  overflow: hidden;
}

.mir-icon,
.mir-title-icon {
  width: 42px;
  height: 42px;

  display: grid;

  place-items: center;

  border-radius: 13px;

  color: #67e8f9;

  background:
    rgba(34, 211, 238, 0.09);

  flex: 0 0 auto;
}

.mir-metric-content span {
  display: block;

  color: #94a3b8;

  font-size: 11px;
}

.mir-metric-content strong {
  font-size: 24px;
}

.mir-bar {
  position: absolute;

  left: 0;
  right: 0;

  bottom: 0;

  height: 3px;

  background:
    rgba(148, 163, 184, 0.08);
}

.mir-bar i {
  display: block;

  height: 100%;

  background:
    linear-gradient(
      90deg,
      #06b6d4,
      #818cf8
    );

  transition: width 0.5s ease;
}

/* =========================================================
   TWO COLUMN
   ========================================================= */

.mir-two {
  display: grid;

  grid-template-columns:
    1fr 1fr;

  gap: 16px;
}

.mir-panel {
  padding: 24px;

  margin-top: 16px;
}

/* =========================================================
   TITLE
   ========================================================= */

.mir-title {
  display: flex;

  align-items: center;

  gap: 12px;

  margin-bottom: 18px;
}

.mir-title-content {
  flex: 1;
}

.mir-title small {
  color: #94a3b8;

  font-size: 10px;

  font-weight: 800;

  letter-spacing: 0.12em;
}

.mir-title h2 {
  margin: 3px 0 0;

  font-size: 20px;
}

/* =========================================================
   LISTS
   ========================================================= */

.mir-panel ul {
  list-style: none;

  padding: 0;

  margin: 0;

  display: grid;

  gap: 10px;
}

.mir-panel li {
  display: flex;

  gap: 9px;

  color: #cbd5e1;

  font-size: 13px;

  line-height: 1.55;
}

.mir-panel li svg {
  color: #34d399;

  flex: 0 0 auto;

  margin-top: 3px;
}

.muted {
  color: #64748b;

  font-size: 13px;
}

/* =========================================================
   FEEDBACK
   ========================================================= */

.mir-feedback {
  padding: 19px;

  border-radius: 16px;

  background:
    rgba(2, 6, 23, 0.4);

  border:
    1px solid
    rgba(129, 140, 248, 0.12);

  color: #dbeafe;

  line-height: 1.75;

  font-size: 14px;
}

/* =========================================================
   SUGGESTIONS
   ========================================================= */

.mir-suggestions {
  display: grid;

  grid-template-columns:
    repeat(2, 1fr);

  gap: 10px;
}

.mir-suggestions > div {
  display: flex;

  gap: 10px;

  padding: 14px;

  border-radius: 15px;

  background:
    rgba(2, 6, 23, 0.38);

  border:
    1px solid
    rgba(148, 163, 184, 0.09);

  color: #cbd5e1;

  font-size: 13px;
}

.mir-suggestions b {
  width: 27px;
  height: 27px;

  border-radius: 9px;

  display: grid;

  place-items: center;

  color: #67e8f9;

  background:
    rgba(34, 211, 238, 0.1);

  flex: 0 0 auto;
}

/* =========================================================
   ANSWERS
   ========================================================= */

.mir-answer-list {
  display: grid;

  gap: 12px;
}

.mir-answer {
  border:
    1px solid
    rgba(148, 163, 184, 0.1);

  border-radius: 17px;

  overflow: hidden;

  background:
    rgba(2, 6, 23, 0.35);
}

.mir-answer.open {
  border-color:
    rgba(129, 140, 248, 0.28);
}

.mir-answer-head {
  width: 100%;

  border: 0;

  background: transparent;

  color: inherit;

  padding: 15px;

  display: grid;

  grid-template-columns:
    44px 1fr auto 22px;

  gap: 12px;

  align-items: center;

  text-align: left;
}

.mir-answer-head:hover {
  background:
    rgba(99, 102, 241, 0.05);
}

.mir-answer-head > b {
  width: 42px;
  height: 42px;

  display: grid;

  place-items: center;

  border-radius: 13px;

  color: #67e8f9;

  background:
    rgba(34, 211, 238, 0.1);

  font-size: 11px;
}

.mir-answer-question small {
  display: block;

  color: #64748b;

  font-size: 9px;

  text-transform: uppercase;
}

.mir-answer-question strong {
  display: block;

  font-size: 13px;

  line-height: 1.45;

  margin-top: 3px;
}

.mir-answer-head em {
  font-style: normal;

  color: #34d399;

  font-weight: 900;
}

.mir-answer-body {
  padding: 18px;

  border-top:
    1px solid
    rgba(148, 163, 184, 0.08);

  display: grid;

  gap: 12px;
}

/* =========================================================
   ANSWER BOX
   ========================================================= */

.mir-box {
  padding: 15px;

  border-radius: 15px;

  background:
    rgba(15, 23, 42, 0.58);

  border:
    1px solid
    rgba(148, 163, 184, 0.09);
}

.mir-box.good {
  border-color:
    rgba(52, 211, 153, 0.17);
}

.mir-box.warn {
  border-color:
    rgba(251, 191, 36, 0.17);
}

.mir-box.ai {
  border-color:
    rgba(167, 139, 250, 0.2);
}

.mir-box h4 {
  display: flex;

  align-items: center;

  gap: 7px;

  margin: 0 0 8px;

  color: #a5b4fc;

  font-size: 12px;
}

.mir-box p {
  margin: 0;

  color: #cbd5e1;

  line-height: 1.65;

  font-size: 13px;
}

.mir-user-answer {
  white-space: pre-wrap;
}

.mir-feedback-grid {
  display: grid;

  grid-template-columns:
    1fr 1fr;

  gap: 12px;
}

/* =========================================================
   EMPTY
   ========================================================= */

.mir-empty {
  text-align: center;

  padding: 45px;

  color: #64748b;
}

.mir-empty h3 {
  color: #e2e8f0;

  margin: 12px 0 5px;
}

/* =========================================================
   SECURITY
   ========================================================= */

.mir-security-grid {
  display: grid;

  grid-template-columns:
    repeat(6, 1fr);

  gap: 9px;
}

.mir-security-grid > div {
  padding: 14px;

  border-radius: 14px;

  background:
    rgba(2, 6, 23, 0.4);

  border:
    1px solid
    rgba(148, 163, 184, 0.08);
}

.mir-security-grid strong {
  display: block;

  font-size: 20px;
}

.mir-security-grid span {
  font-size: 10px;

  color: #64748b;
}

/* =========================================================
   SECURITY EVENTS
   ========================================================= */

.mir-events {
  margin-top: 18px;

  border-top:
    1px solid
    rgba(148, 163, 184, 0.08);

  padding-top: 15px;
}

.mir-event {
  display: grid;

  grid-template-columns:
    25px 1fr auto;

  gap: 9px;

  align-items: center;

  padding: 9px 0;

  border-bottom:
    1px solid
    rgba(148, 163, 184, 0.06);

  color: #fbbf24;
}

.mir-event strong {
  color: #cbd5e1;

  font-size: 11px;
}

.mir-event p {
  margin: 2px 0 0;

  color: #64748b;

  font-size: 10px;
}

.mir-event small {
  color: #64748b;

  font-size: 9px;
}

/* =========================================================
   ACTIONS
   ========================================================= */

.mir-actions {
  display: flex;

  justify-content: center;

  gap: 10px;

  margin-top: 24px;

  padding-bottom: 10px;
}

/* =========================================================
   LOADING / ERROR
   ========================================================= */

.mir-center {
  width: 100%;

  min-height: 100vh;

  min-height: 100dvh;

  display: grid;

  place-items: center;

  padding: 25px;

  background: #020617;
}

.mir-loading {
  width: min(520px, 100%);

  text-align: center;

  padding: 35px;

  border:
    1px solid
    rgba(129, 140, 248, 0.2);

  border-radius: 25px;

  background:
    rgba(15, 23, 42, 0.82);

  box-shadow:
    0 30px 100px
    rgba(0, 0, 0, 0.35);
}

.mir-loading-orb {
  width: 70px;
  height: 70px;

  margin: 0 auto 18px;

  border-radius: 22px;

  display: grid;

  place-items: center;

  background:
    linear-gradient(
      135deg,
      #06b6d4,
      #6366f1,
      #8b5cf6
    );
}

.mir-loading h1 {
  font-size: 22px;
}

.mir-loading p {
  color: #94a3b8;

  font-size: 13px;
}

.spin {
  animation:
    spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* =========================================================
   FORCE DARK BOTTOM
   ========================================================= */

.mir-page::after {
  content: "";

  display: block;

  width: 100%;

  height: 1px;

  background: #020617;
}

/* =========================================================
   RESPONSIVE
   ========================================================= */

@media (max-width: 900px) {
  .mir-overview,
  .mir-two {
    grid-template-columns: 1fr;
  }

  .mir-metrics {
    grid-template-columns: 1fr;
  }

  .mir-security-grid {
    grid-template-columns:
      repeat(3, 1fr);
  }

  .mir-hero {
    align-items: flex-start;

    flex-direction: column;
  }
}

@media (max-width: 620px) {
  .mir-header-inner,
  .mir-main {
    width:
      calc(100% - 22px);
  }

  .mir-header-inner {
    min-height: 64px;
  }

  .mir-brand span {
    display: none;
  }

  .mir-brand-icon {
    width: 38px;
    height: 38px;
  }

  .mir-score-area {
    flex-direction: column;

    align-items: flex-start;
  }

  .mir-feedback-grid,
  .mir-suggestions {
    grid-template-columns: 1fr;
  }

  .mir-security-grid {
    grid-template-columns:
      repeat(2, 1fr);
  }

  .mir-answer-head {
    grid-template-columns:
      42px 1fr auto;
  }

  .mir-answer-head > svg {
    display: none;
  }

  .mir-event {
    grid-template-columns:
      25px 1fr;
  }

  .mir-event small {
    grid-column: 2;
  }

  .mir-actions {
    flex-direction: column;
  }

  .mir-actions button {
    width: 100%;
  }

  .mir-main {
    padding-top: 30px;
    padding-bottom: 50px;
  }

  .mir-overview {
    padding: 20px;
  }

  .mir-panel {
    padding: 18px;
  }
}
`;

export default MockInterviewResult;