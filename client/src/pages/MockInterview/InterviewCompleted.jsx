import React, { useEffect, useState } from "react";
import {
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  FileText,
  Home,
  Copy,
  Check,
  ArrowRight,
  BarChart3,
  Loader2,
  AlertCircle,
  Clock3,
  Brain,
  Target,
} from "lucide-react";

import {
  useNavigate,
  useLocation,
  useParams,
} from "react-router-dom";

import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

export default function InterviewCompleted() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const [copied, setCopied] = useState(false);

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // GET INTERVIEW ID
  // --------------------------------------------------

  const interviewId =
    params.id ||
    location.state?.interviewId ||
    location.state?.id ||
    localStorage.getItem("mockInterviewId") ||
    "";

  // --------------------------------------------------
  // FETCH RESULT
  // --------------------------------------------------

  const fetchInterviewResult = async () => {
    if (!interviewId) {
      setError("Interview ID not found.");
      setLoading(false);
      return;
    }

    try {
      setError("");

      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${API_URL}/api/mock-interview/${interviewId}/result`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setInterview(
        response.data?.interview ||
        response.data
      );
    } catch (err) {
      console.error(
        "Failed to fetch interview:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Unable to load interview status."
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // GENERATE REPORT
  // --------------------------------------------------

  const generateReport = async () => {
    if (!interviewId) return;

    try {
      setReportLoading(true);

      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${API_URL}/api/mock-interview/${interviewId}/report`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.interview) {
        setInterview(response.data.interview);
      }

      await fetchInterviewResult();
    } catch (err) {
      console.error(
        "Report generation error:",
        err
      );

      setError(
        err.response?.data?.message ||
        "AI report is not available yet."
      );
    } finally {
      setReportLoading(false);
    }
  };

  // --------------------------------------------------
  // INITIAL LOAD
  // --------------------------------------------------

  useEffect(() => {
    fetchInterviewResult();
  }, [interviewId]);

  // --------------------------------------------------
  // COPY ID
  // --------------------------------------------------

  const handleCopyId = async () => {
    if (!interviewId) return;

    try {
      await navigator.clipboard.writeText(
        interviewId
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error(error);
    }
  };

  // --------------------------------------------------
  // VIEW RESULTS
  // --------------------------------------------------

  const handleViewSummary = () => {
    if (!interviewId) {
      setError("Interview ID not found.");
      return;
    }

    navigate(
      `/mock-interview/results/${interviewId}`
    );
  };

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">

        <div className="text-center">

          <div className="w-20 h-20 rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center mx-auto mb-6">

            <Brain
              size={35}
              className="text-sky-400 animate-pulse"
            />

          </div>

          <h2 className="text-2xl font-bold">
            Loading Interview...
          </h2>

          <p className="text-slate-400 mt-2">
            Checking your interview status
          </p>

          <Loader2
            size={22}
            className="animate-spin text-sky-400 mx-auto mt-5"
          />

        </div>

      </div>
    );
  }

  // --------------------------------------------------
  // STATUS
  // --------------------------------------------------

  const totalQuestions =
    interview?.totalQuestions || 0;

  const attemptedQuestions =
    interview?.attemptedQuestions || 0;

  const score =
    interview?.overallScore ?? null;

  const reportGenerated =
    interview?.reportGenerated === true;

  const interviewStatus =
    interview?.status || "Completed";

  const securityStatus =
    interview?.security?.status ||
    "Secure";

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <div className="relative min-h-screen bg-slate-950 flex items-center justify-center p-4 md:p-6 text-white overflow-hidden font-sans">

      {/* BACKGROUND */}

      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />

      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-purple-600/30 via-indigo-500/20 to-sky-500/30 rounded-full blur-[140px] pointer-events-none" />

      <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-full blur-[140px] pointer-events-none" />

      {/* CARD */}

      <div className="relative max-w-2xl w-full bg-slate-900/70 backdrop-blur-2xl border border-slate-800/80 rounded-[2.5rem] p-6 sm:p-10 text-center shadow-2xl z-10">

        {/* BADGE */}

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium mb-6">

          <CheckCircle2 size={14} />

          Interview Submitted

        </div>

        {/* ICON */}

        <div className="relative mx-auto w-24 h-24 mb-6 flex items-center justify-center">

          <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping opacity-40" />

          <div className="relative w-20 h-20 rounded-full bg-slate-950 border border-emerald-500/40 flex items-center justify-center">

            <CheckCircle2
              size={44}
              className="text-emerald-400"
            />

          </div>

        </div>

        {/* TITLE */}

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent mb-3">

          Interview Submitted

        </h1>

        <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-8 max-w-xl mx-auto">

          Your interview answers have been securely
          recorded. Check the live status below and
          open the detailed AI evaluation when it is ready.

        </p>

        {/* STATUS GRID */}

        <div className="grid grid-cols-2 gap-3 mb-4">

          {/* PROCTOR */}

          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">

            <p className="text-slate-400 text-xs font-medium">
              Proctor Status
            </p>

            <div className="flex items-center justify-center gap-1.5 mt-2 font-semibold text-sm">

              {securityStatus === "Terminated" ? (
                <>
                  <AlertCircle
                    size={16}
                    className="text-rose-400"
                  />

                  <span className="text-rose-400">
                    Terminated
                  </span>
                </>
              ) : securityStatus === "Warning" ? (
                <>
                  <AlertCircle
                    size={16}
                    className="text-amber-400"
                  />

                  <span className="text-amber-400">
                    Warning
                  </span>
                </>
              ) : (
                <>
                  <ShieldCheck
                    size={16}
                    className="text-emerald-400"
                  />

                  <span className="text-emerald-400">
                    Secure
                  </span>
                </>
              )}

            </div>

          </div>

          {/* AI REPORT */}

          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">

            <p className="text-slate-400 text-xs font-medium">
              AI Analysis
            </p>

            <div className="flex items-center justify-center gap-1.5 mt-2 font-semibold text-sm">

              {reportGenerated ? (
                <>
                  <BarChart3
                    size={16}
                    className="text-sky-400"
                  />

                  <span className="text-sky-400">
                    Ready
                  </span>
                </>
              ) : (
                <>
                  <Clock3
                    size={16}
                    className="text-amber-400"
                  />

                  <span className="text-amber-400">
                    Processing
                  </span>
                </>
              )}

            </div>

          </div>

        </div>

        {/* INTERVIEW STATISTICS */}

        <div className="grid grid-cols-3 gap-3 mb-6">

          <StatCard
            icon={Target}
            title="Answered"
            value={`${attemptedQuestions}/${totalQuestions}`}
          />

          <StatCard
            icon={BarChart3}
            title="Score"
            value={
              score !== null
                ? `${score}%`
                : "--"
            }
          />

          <StatCard
            icon={CheckCircle2}
            title="Status"
            value={interviewStatus}
          />

        </div>

        {/* PROCESSING */}

        {!reportGenerated && (
          <div className="mb-6 p-5 rounded-2xl bg-sky-500/5 border border-sky-500/20">

            <div className="flex items-center justify-center gap-2 text-sky-300 font-semibold text-sm">

              <Loader2
                size={17}
                className="animate-spin"
              />

              AI evaluation is being prepared
            </div>

            <p className="text-xs text-slate-400 mt-2">
              Your answers are already saved. The
              detailed technical, communication and
              confidence analysis will appear when
              processing finishes.
            </p>

            <button
              onClick={generateReport}
              disabled={reportLoading}
              className="mt-4 px-5 py-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-300 text-sm font-semibold hover:bg-sky-500/20 transition disabled:opacity-50"
            >
              {reportLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2
                    size={15}
                    className="animate-spin"
                  />
                  Generating...
                </span>
              ) : (
                "Generate AI Report"
              )}
            </button>

          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center gap-3 text-left">

            <AlertCircle
              size={18}
              className="shrink-0"
            />

            <span>{error}</span>

          </div>
        )}

        {/* BUTTONS */}

        <div className="space-y-4">

          <div className="relative group">

            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 rounded-full blur opacity-40 group-hover:opacity-100 transition" />

            <button
              onClick={handleViewSummary}
              disabled={!interviewId}
              className="relative w-full py-4 px-8 rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-semibold flex items-center justify-center gap-3 transition disabled:opacity-40"
            >

              <FileText size={20} />

              View Detailed Results

              <ArrowRight size={18} />

            </button>

          </div>

          <button
            onClick={() => navigate("/dashboard")}
            className="w-full py-4 px-8 rounded-full bg-slate-900 border border-slate-700 text-slate-200 font-semibold flex items-center justify-center gap-2 hover:bg-slate-800 transition"
          >

            <Home size={20} />

            Back To Dashboard

          </button>

        </div>

        {/* INTERVIEW ID */}

        {interviewId && (
          <div className="mt-8 pt-5 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400 bg-slate-950/60 px-4 py-3 rounded-2xl">

            <span className="truncate">
              ID:
              <span className="font-mono text-slate-300 ml-1">
                {interviewId}
              </span>
            </span>

            <button
              onClick={handleCopyId}
              className="flex items-center gap-1.5 text-slate-400 hover:text-white ml-2"
            >

              {copied ? (
                <>
                  <Check
                    size={14}
                    className="text-emerald-400"
                  />

                  <span className="text-emerald-400">
                    Copied
                  </span>
                </>
              ) : (
                <>
                  <Copy size={14} />

                  <span>
                    Copy
                  </span>
                </>
              )}

            </button>

          </div>
        )}

      </div>
    </div>
  );
}

// ======================================================
// STAT CARD
// ======================================================

function StatCard({
  icon: Icon,
  title,
  value,
}) {
  return (
    <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4">

      <Icon
        size={18}
        className="mx-auto text-sky-400 mb-2"
      />

      <p className="text-[11px] text-slate-500">
        {title}
      </p>

      <p className="text-sm font-bold text-white mt-1 truncate">
        {value}
      </p>

    </div>
  );
}