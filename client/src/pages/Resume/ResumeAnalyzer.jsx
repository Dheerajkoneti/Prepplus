import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  deleteResume,
  getResumeHistory,
  getResumeById,
  uploadResume,
} from "../../services/resumeService";

const ResumeAnalyzer = () => {
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [resume, setResume] = useState(null);
  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] =
    useState(true);

  const [reportLoading, setReportLoading] =
    useState(false);

  const [printing, setPrinting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [dragActive, setDragActive] =
    useState(false);

  const [search, setSearch] = useState("");

  const [historyFilter, setHistoryFilter] =
    useState("ALL");

  const [activeTab, setActiveTab] =
    useState("analysis");

  const [analysisStage, setAnalysisStage] =
    useState(0);

  const [animatedScore, setAnimatedScore] =
    useState(0);

  const [selectedHistoryId, setSelectedHistoryId] =
    useState(null);

  const stages = [
    {
      title: "Reading resume",
      description:
        "Extracting content from your PDF",
      icon: "◌",
    },
    {
      title: "Analyzing skills",
      description:
        "Identifying technical skills and experience",
      icon: "✦",
    },
    {
      title: "Checking ATS compatibility",
      description:
        "Evaluating keywords and resume structure",
      icon: "⌁",
    },
    {
      title: "Generating recommendations",
      description:
        "Preparing personalized improvements",
      icon: "✧",
    },
  ];

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    if (!loading) return;

    setAnalysisStage(0);

    const timers = [
      setTimeout(() => {
        setAnalysisStage(1);
      }, 1200),

      setTimeout(() => {
        setAnalysisStage(2);
      }, 3000),

      setTimeout(() => {
        setAnalysisStage(3);
      }, 5000),
    ];

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [loading]);

  useEffect(() => {
    if (!resume) {
      setAnimatedScore(0);
      return;
    }

    const target = Math.min(
      100,
      Math.max(
        0,
        Number(resume.score || 0)
      )
    );

    let current = 0;

    const interval = setInterval(() => {
      current += Math.max(
        1,
        Math.ceil((target - current) / 8)
      );

      if (current >= target) {
        current = target;
        clearInterval(interval);
      }

      setAnimatedScore(current);
    }, 25);

    return () => clearInterval(interval);
  }, [resume]);

  const loadHistory = async () => {
    try {
      setHistoryLoading(true);

      const response =
        await getResumeHistory();

      const items =
        response?.resumes || [];

      setHistory(items);

      if (
        selectedHistoryId &&
        !items.some(
          (item) =>
            getResumeId(item) ===
            selectedHistoryId
        )
      ) {
        setSelectedHistoryId(null);
      }
    } catch (err) {
      console.error(
        "Resume history error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to load resume history."
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleFile = (selectedFile) => {
    setError("");
    setSuccess("");

    if (!selectedFile) return;

    const isPDF =
      selectedFile.type ===
        "application/pdf" ||
      selectedFile.name
        ?.toLowerCase()
        .endsWith(".pdf");

    if (!isPDF) {
      setError(
        "Please upload a PDF resume."
      );
      return;
    }

    if (
      selectedFile.size >
      5 * 1024 * 1024
    ) {
      setError(
        "Resume must be smaller than 5 MB."
      );
      return;
    }

    setFile(selectedFile);
  };

  const handleFileChange = (event) => {
    const selectedFile =
      event.target.files?.[0];

    handleFile(selectedFile);
  };

  const handleDrop = (event) => {
    event.preventDefault();

    setDragActive(false);

    const droppedFile =
      event.dataTransfer.files?.[0];

    handleFile(droppedFile);
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError(
        "Please select a PDF resume first."
      );
      return;
    }

    try {
      setError("");
      setSuccess("");
      setLoading(true);

      setResume(null);
      setSelectedHistoryId(null);
      setActiveTab("analysis");

      const response =
        await uploadResume(file);

      const result =
        response?.resume;

      if (!result) {
        throw new Error(
          "Resume analysis response was invalid."
        );
      }

      const resultId =
        getResumeId(result);

      setResume(result);
      setSelectedHistoryId(
        resultId || null
      );

      setSuccess(
        "Resume analyzed successfully."
      );

      await loadHistory();

      setFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      console.error(
        "Resume analysis failed:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Resume analysis failed."
      );
    } finally {
      setLoading(false);
    }
  };

  const openHistory = async (item) => {
    const id = getResumeId(item);

    if (!id) {
      setError(
        "Unable to open this resume report."
      );
      return;
    }

    try {
      setError("");
      setSuccess("");
      setReportLoading(true);

      const response =
        await getResumeById(id);

      const report =
        response?.resume;

      if (!report) {
        throw new Error(
          "Resume report was not found."
        );
      }

      setResume(report);
      setSelectedHistoryId(id);
      setActiveTab("analysis");

      setTimeout(() => {
        document
          .getElementById(
            "resume-analysis"
          )
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      }, 50);
    } catch (err) {
      console.error(
        "Open resume report error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load resume report."
      );
    } finally {
      setReportLoading(false);
    }
  };

  const handlePrintResume = async (
    itemOrId
  ) => {
    const id =
      typeof itemOrId === "object"
        ? getResumeId(itemOrId)
        : itemOrId;

    if (!id) {
      setError(
        "Unable to print this resume report."
      );
      return;
    }

    try {
      setError("");
      setSuccess("");
      setPrinting(true);

      const response =
        await getResumeById(id);

      const report =
        response?.resume;

      if (!report) {
        throw new Error(
          "Resume report was not found."
        );
      }

      setResume(report);
      setSelectedHistoryId(id);
      setActiveTab("analysis");

      await new Promise((resolve) =>
        setTimeout(resolve, 500)
      );

      window.print();
    } catch (err) {
      console.error(
        "Print resume report error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to print this report."
      );
    } finally {
      setPrinting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;

    const confirmed =
      window.confirm(
        "Delete this resume analysis permanently?"
      );

    if (!confirmed) return;

    try {
      setError("");

      await deleteResume(id);

      setHistory((prev) =>
        prev.filter(
          (item) =>
            getResumeId(item) !== id
        )
      );

      if (
        getResumeId(resume) === id
      ) {
        setResume(null);
        setSelectedHistoryId(null);
        setActiveTab("history");
      }

      setSuccess(
        "Resume analysis deleted successfully."
      );
    } catch (err) {
      console.error(
        "Delete resume error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to delete analysis."
      );
    }
  };

  const showHistory = () => {
    setActiveTab("history");

    setTimeout(() => {
      document
        .getElementById(
          "resume-history"
        )
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 50);
  };

  const showAnalysis = () => {
    if (!resume) return;

    setActiveTab("analysis");

    setTimeout(() => {
      document
        .getElementById(
          "resume-analysis"
        )
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 50);
  };

  const filteredHistory = useMemo(() => {
    let items = [...history];

    if (
      historyFilter !== "ALL"
    ) {
      if (
        historyFilter === "HIGH"
      ) {
        items = items.filter(
          (item) =>
            Number(item.score || 0) >=
            75
        );
      }

      if (
        historyFilter === "MEDIUM"
      ) {
        items = items.filter(
          (item) => {
            const score =
              Number(
                item.score || 0
              );

            return (
              score >= 50 &&
              score < 75
            );
          }
        );
      }

      if (
        historyFilter === "LOW"
      ) {
        items = items.filter(
          (item) =>
            Number(item.score || 0) <
            50
        );
      }
    }

    if (search.trim()) {
      const query =
        search
          .trim()
          .toLowerCase();

      items = items.filter(
        (item) =>
          item.fileName
            ?.toLowerCase()
            .includes(query)
      );
    }

    return items;
  }, [
    history,
    historyFilter,
    search,
  ]);

  const scoreLabel = useMemo(() => {
    const score =
      Number(resume?.score || 0);

    if (score >= 85)
      return "Excellent ATS Match";

    if (score >= 75)
      return "Strong ATS Match";

    if (score >= 60)
      return "Good Match";

    if (score >= 40)
      return "Needs Improvement";

    return "Major Improvements Needed";
  }, [resume]);

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <Background />

      <div className="relative z-10 mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">

        <Header
          historyCount={history.length}
          onHistory={showHistory}
        />

        {success && (
          <Alert
            type="success"
            message={success}
            onClose={() =>
              setSuccess("")
            }
          />
        )}

        {error && (
          <Alert
            type="error"
            message={error}
            onClose={() =>
              setError("")
            }
          />
        )}

        <div className="no-print mb-8 grid gap-5 lg:grid-cols-[1fr_360px]">
          <UploadPanel
            file={file}
            loading={loading}
            dragActive={dragActive}
            fileInputRef={
              fileInputRef
            }
            onFileChange={
              handleFileChange
            }
            onDrop={handleDrop}
            onDragEnter={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setDragActive(false);
            }}
            onAnalyze={
              handleAnalyze
            }
            onRemove={() => {
              setFile(null);

              if (
                fileInputRef.current
              ) {
                fileInputRef.current.value =
                  "";
              }
            }}
          />

          <LiveStatus
            loading={loading}
            stage={analysisStage}
            stages={stages}
            resume={resume}
          />
        </div>

        {loading && (
          <div className="no-print">
            <AnalysisProgress
              stage={analysisStage}
              stages={stages}
            />
          </div>
        )}

        {reportLoading && (
          <div className="no-print mb-6 flex items-center justify-center gap-3 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 px-5 py-4 text-sm text-cyan-300">
            <Spinner dark />
            Loading saved resume report...
          </div>
        )}

        {resume && !loading && (
          <div
            id="resume-analysis"
            className="animate-[fadeIn_.6s_ease-out]"
          >
            <div className="no-print">
              <AnalysisHero
                resume={resume}
                animatedScore={
                  animatedScore
                }
                scoreLabel={
                  scoreLabel
                }
                onPrint={() =>
                  handlePrintResume(
                    getResumeId(resume)
                  )
                }
                printing={printing}
              />

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.025] p-2 backdrop-blur-xl">
                <div className="flex flex-wrap gap-2">
                  <TabButton
                    active={
                      activeTab ===
                      "analysis"
                    }
                    onClick={
                      showAnalysis
                    }
                  >
                    ✦ Analysis
                  </TabButton>

                  <TabButton
                    active={
                      activeTab ===
                      "history"
                    }
                    onClick={
                      showHistory
                    }
                  >
                    ◷ History
                  </TabButton>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handlePrintResume(
                      getResumeId(
                        resume
                      )
                    )
                  }
                  disabled={printing}
                  className="flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2.5 text-xs font-black text-cyan-300 transition hover:-translate-y-0.5 hover:bg-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {printing ? (
                    <>
                      <Spinner dark />
                      Preparing...
                    </>
                  ) : (
                    <>
                      🖨 Print Report
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {!resume &&
          !loading &&
          activeTab !== "history" && (
            <div className="no-print">
              <EmptyState
                onUpload={() =>
                  fileInputRef.current?.click()
                }
              />
            </div>
          )}

        {resume &&
          !loading &&
          activeTab === "analysis" && (
            <div className="print-report">
              <AnalysisDashboard
                resume={resume}
              />
            </div>
          )}

        {activeTab ===
          "history" && (
          <div className="no-print">
            <HistorySection
              history={
                filteredHistory
              }
              totalHistory={
                history.length
              }
              loading={
                historyLoading
              }
              search={search}
              setSearch={setSearch}
              filter={
                historyFilter
              }
              setFilter={
                setHistoryFilter
              }
              selectedId={
                selectedHistoryId
              }
              onOpen={
                openHistory
              }
              onPrint={
                handlePrintResume
              }
              onDelete={
                handleDelete
              }
              onUpload={() => {
                setActiveTab(
                  "analysis"
                );

                setTimeout(() => {
                  fileInputRef.current?.click();
                }, 100);
              }}
            />
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(18px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }

          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes pulseGlow {
          0%, 100% {
            opacity: .35;
            transform: scale(1);
          }

          50% {
            opacity: .65;
            transform: scale(1.12);
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

        @media print {
          @page {
            size: A4;
            margin: 12mm;
          }

          html,
          body {
            background: white !important;
            color: #111827 !important;
          }

          body {
            min-width: 0 !important;
          }

          body * {
            visibility: hidden !important;
          }

          .print-report,
          .print-report * {
            visibility: visible !important;
          }

          .print-report {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: white !important;
            color: #111827 !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          .print-report section {
            background: white !important;
            color: #111827 !important;
            border-color: #d1d5db !important;
            box-shadow: none !important;
            backdrop-filter: none !important;
          }

          .print-report h1,
          .print-report h2,
          .print-report h3,
          .print-report p,
          .print-report span,
          .print-report div {
            color: #111827 !important;
            text-shadow: none !important;
          }

          .print-report .text-slate-400,
          .print-report .text-slate-500,
          .print-report .text-slate-600 {
            color: #4b5563 !important;
          }

          .print-report .text-cyan-400,
          .print-report .text-cyan-300 {
            color: #0891b2 !important;
          }

          .print-report .text-emerald-400,
          .print-report .text-emerald-300 {
            color: #059669 !important;
          }

          .print-report .text-amber-400,
          .print-report .text-amber-300 {
            color: #d97706 !important;
          }

          .print-report .text-red-400,
          .print-report .text-red-300 {
            color: #dc2626 !important;
          }

          .print-report .bg-black\\/10,
          .print-report .bg-white\\/\\[0\\.025\\],
          .print-report .bg-\\[\\#0b1224\\]\\/85,
          .print-report .bg-\\[\\#0b1224\\]\\/90 {
            background: #ffffff !important;
          }

          .print-report .bg-cyan-400\\/10 {
            background: #ecfeff !important;
          }

          .print-report .bg-emerald-400\\/10 {
            background: #ecfdf5 !important;
          }

          .print-report .bg-amber-400\\/10 {
            background: #fffbeb !important;
          }

          .print-report .bg-red-400\\/10 {
            background: #fef2f2 !important;
          }

          .print-report .bg-violet-400\\/10 {
            background: #f5f3ff !important;
          }

          .print-report .border-white\\/10,
          .print-report .border-white\\/5 {
            border-color: #d1d5db !important;
          }

          .print-report .shadow-xl,
          .print-report .shadow-2xl {
            box-shadow: none !important;
          }

          .print-report .rounded-\\[28px\\],
          .print-report .rounded-\\[32px\\] {
            border-radius: 10px !important;
          }

          .print-report .break-inside-avoid {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .print-report section {
            break-inside: avoid;
            page-break-inside: avoid;
            margin-bottom: 14px !important;
          }

          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

const Background = () => {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute left-[8%] top-[8%] h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-[120px] animate-[pulseGlow_7s_ease-in-out_infinite]" />

      <div className="absolute right-[5%] top-[30%] h-[360px] w-[360px] rounded-full bg-blue-600/10 blur-[120px] animate-[pulseGlow_9s_ease-in-out_infinite]" />

      <div className="absolute bottom-[5%] left-[40%] h-[300px] w-[300px] rounded-full bg-violet-600/10 blur-[110px]" />

      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
          backgroundSize:
            "45px 45px",
        }}
      />
    </div>
  );
};

const Header = ({
  historyCount,
  onHistory,
}) => {
  return (
    <header className="no-print mb-8 flex flex-col gap-5 border-b border-white/10 pb-7 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-4">
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 text-2xl shadow-[0_0_40px_rgba(34,211,238,.12)]">
          📄

          <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,.8)]" />
        </div>

        <div>
          <div className="text-xs font-bold uppercase tracking-[.28em] text-cyan-400">
            PrepPulse AI
          </div>

          <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
            Resume Analyzer
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Real ATS analysis powered by
            your uploaded resume.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onHistory}
        className="group flex items-center justify-center gap-3 rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.05] px-5 py-3 text-sm font-bold text-slate-200 transition duration-300 hover:-translate-y-0.5 hover:border-cyan-400/40 hover:bg-cyan-400/10"
      >
        <span className="text-cyan-400">
          ◷
        </span>

        Analysis History

        <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-slate-300">
          {historyCount}
        </span>
      </button>
    </header>
  );
};

const UploadPanel = ({
  file,
  loading,
  dragActive,
  fileInputRef,
  onFileChange,
  onDrop,
  onDragEnter,
  onDragLeave,
  onAnalyze,
  onRemove,
}) => {
  return (
    <section className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0b1224]/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
      <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl transition group-hover:bg-cyan-500/20" />

      <div className="relative">
        <div className="mb-7">
          <div className="mb-2 text-xs font-bold uppercase tracking-[.24em] text-cyan-400">
            ATS Intelligence
          </div>

          <h2 className="text-2xl font-black">
            Analyze your resume
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Upload your actual PDF and
            PrepPulse will analyze the
            content using Gemini and store
            the result in your account.
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={
            onFileChange
          }
        />

        <div
          onDragEnter={
            onDragEnter
          }
          onDragOver={(e) =>
            e.preventDefault()
          }
          onDragLeave={
            onDragLeave
          }
          onDrop={onDrop}
          onClick={() =>
            !loading &&
            fileInputRef.current?.click()
          }
          className={`relative cursor-pointer rounded-3xl border-2 border-dashed p-8 text-center transition-all duration-300 sm:p-12 ${
            dragActive
              ? "border-cyan-400 bg-cyan-400/10 scale-[1.01]"
              : file
              ? "border-emerald-400/40 bg-emerald-400/[0.04]"
              : "border-white/10 bg-white/[0.025] hover:border-cyan-400/40 hover:bg-cyan-400/[0.035]"
          }`}
        >
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-400/20 to-blue-500/20 text-4xl shadow-[0_0_50px_rgba(34,211,238,.1)] transition duration-500 group-hover:scale-105">
            {file ? "✓" : "↑"}
          </div>

          {file ? (
            <>
              <h3 className="break-all text-lg font-bold text-white">
                {file.name}
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                {formatBytes(file.size)}{" "}
                • PDF document
              </p>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                className="mt-5 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-2 text-xs font-bold text-red-300 transition hover:bg-red-400/10"
              >
                Remove file
              </button>
            </>
          ) : (
            <>
              <h3 className="text-lg font-bold">
                Drop your resume here
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                or click to browse your
                computer
              </p>

              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <Badge>
                  PDF only
                </Badge>

                <Badge>
                  Max 5 MB
                </Badge>

                <Badge>
                  Gemini AI
                </Badge>
              </div>
            </>
          )}
        </div>

        <button
          type="button"
          disabled={!file || loading}
          onClick={onAnalyze}
          className="mt-5 flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 px-6 py-4 text-sm font-black text-slate-950 shadow-[0_10px_40px_rgba(34,211,238,.15)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_15px_50px_rgba(34,211,238,.25)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? (
            <>
              <Spinner />
              Analyzing Resume...
            </>
          ) : (
            <>
              ✦ Analyze Resume
              <span>→</span>
            </>
          )}
        </button>
      </div>
    </section>
  );
};

const LiveStatus = ({
  loading,
  stage,
  stages,
  resume,
}) => {
  if (!loading && !resume) {
    return (
      <section className="rounded-[28px] border border-white/10 bg-[#0b1224]/80 p-6 shadow-2xl backdrop-blur-xl">
        <div className="mb-6 flex items-center gap-3">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-500" />

          <span className="text-xs font-bold uppercase tracking-[.2em] text-slate-500">
            Analyzer Status
          </span>
        </div>

        <div className="space-y-5">
          <StatusItem
            icon="1"
            title="Upload resume"
            description="Choose your PDF"
          />

          <StatusItem
            icon="2"
            title="AI analysis"
            description="Gemini evaluates the resume"
          />

          <StatusItem
            icon="3"
            title="ATS report"
            description="Get personalized insights"
          />

          <StatusItem
            icon="4"
            title="History"
            description="Results are stored securely"
          />
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="relative overflow-hidden rounded-[28px] border border-cyan-400/20 bg-[#0b1224]/90 p-6 shadow-2xl backdrop-blur-xl">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />

        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-[.2em] text-cyan-400">
              Live Analysis
            </div>

            <h3 className="mt-2 text-xl font-black">
              AI is working
            </h3>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-xl text-cyan-300 animate-pulse">
            ✦
          </div>
        </div>

        <div className="space-y-4">
          {stages.map(
            (item, index) => {
              const active =
                index === stage;

              const completed =
                index < stage;

              return (
                <div
                  key={item.title}
                  className={`flex gap-3 rounded-2xl border p-3 transition-all duration-500 ${
                    active
                      ? "border-cyan-400/20 bg-cyan-400/[0.06]"
                      : completed
                      ? "border-emerald-400/10 bg-emerald-400/[0.03]"
                      : "border-transparent"
                  }`}
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-black ${
                      completed
                        ? "bg-emerald-400/10 text-emerald-400"
                        : active
                        ? "bg-cyan-400/10 text-cyan-400 animate-pulse"
                        : "bg-white/5 text-slate-600"
                    }`}
                  >
                    {completed
                      ? "✓"
                      : item.icon}
                  </div>

                  <div>
                    <p
                      className={`text-sm font-bold ${
                        active ||
                        completed
                          ? "text-white"
                          : "text-slate-600"
                      }`}
                    >
                      {item.title}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[28px] border border-emerald-400/20 bg-[#0b1224]/90 p-6 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/10 text-2xl text-emerald-400">
          ✓
        </div>

        <div>
          <div className="text-xs font-bold uppercase tracking-[.2em] text-emerald-400">
            Analysis Complete
          </div>

          <h3 className="mt-1 text-xl font-black">
            Your ATS report is ready
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            Result loaded from your saved
            analysis.
          </p>
        </div>
      </div>
    </section>
  );
};

const AnalysisProgress = ({
  stage,
  stages,
}) => {
  const percentage =
    Math.min(
      100,
      ((stage + 1) /
        stages.length) *
        100
    );

  return (
    <section className="mb-8 overflow-hidden rounded-3xl border border-cyan-400/10 bg-[#0b1224]/80 p-5 backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-[.2em] text-cyan-400">
          Processing
        </span>

        <span className="text-xs text-slate-500">
          AI analysis in progress
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 transition-all duration-700"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </section>
  );
};

const AnalysisHero = ({
  resume,
  animatedScore,
  scoreLabel,
  onPrint,
  printing,
}) => {
  return (
    <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#0b1224]/90 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
      <div className="absolute right-[-100px] top-[-100px] h-[300px] w-[300px] rounded-full bg-cyan-500/10 blur-[100px]" />

      <div className="relative grid gap-8 lg:grid-cols-[280px_1fr]">
        <div className="flex flex-col items-center justify-center">
          <ScoreRing
            score={animatedScore}
          />

          <div className="mt-5 text-center">
            <p className="text-lg font-black">
              {scoreLabel}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Based on your uploaded resume
            </p>
          </div>
        </div>

        <div>
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <Badge>
              {resume.fileName}
            </Badge>

            <Badge green>
              {resume.status ||
                "Analysis completed"}
            </Badge>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-2xl font-black sm:text-3xl">
                Resume performance
              </h2>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
                {resume.executiveSummary ||
                  resume.analysis ||
                  "Your resume has been analyzed using the uploaded document."}
              </p>
            </div>

            <button
              type="button"
              onClick={onPrint}
              disabled={printing}
              className="no-print shrink-0 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-xs font-black text-cyan-300 transition hover:bg-cyan-400/15 disabled:opacity-50"
            >
              {printing
                ? "Preparing..."
                : "🖨 Print"}
            </button>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <Metric
              label="Keyword Relevance"
              value={
                resume.metrics
                  ?.keywordRelevance
              }
            />

            <Metric
              label="Skills Match"
              value={
                resume.metrics
                  ?.skillsMatch
              }
            />

            <Metric
              label="Formatting"
              value={
                resume.metrics
                  ?.formatting
              }
            />

            <Metric
              label="Action Verbs"
              value={
                resume.metrics
                  ?.actionVerbImpact
              }
            />

            <Metric
              label="Experience"
              value={
                resume.metrics
                  ?.experienceRelevance
              }
            />

            <Metric
              label="Projects"
              value={
                resume.metrics
                  ?.projectRelevance
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
};

const AnalysisDashboard = ({
  resume,
}) => {
  return (
    <div className="mt-6 space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <DataCard
          title="Skills Found"
          icon="✓"
          tone="cyan"
          items={resume.skills}
          empty="No skills were detected from the resume."
        />

        <DataCard
          title="Missing / Recommended Skills"
          icon="!"
          tone="red"
          items={resume.missingSkills}
          empty="No missing skills were identified."
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DataCard
          title="Strengths"
          icon="↗"
          tone="green"
          items={resume.strengths}
          empty="No strengths were returned."
        />

        <DataCard
          title="Weaknesses"
          icon="!"
          tone="amber"
          items={resume.weaknesses}
          empty="No weaknesses were identified."
        />
      </div>

      <section className="rounded-[28px] border border-white/10 bg-[#0b1224]/85 p-6 shadow-xl backdrop-blur-xl sm:p-8">
        <SectionHeading
          icon="✦"
          title="AI Recommendations"
          subtitle="Actionable improvements generated from your resume"
        />

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {(resume.suggestions ||
            []).map(
            (item, index) => (
              <div
                key={`${item}-${index}`}
                className="break-inside-avoid group rounded-2xl border border-white/10 bg-white/[0.025] p-4 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/20 hover:bg-cyan-400/[0.03]"
              >
                <div className="flex gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-sm font-black text-cyan-400">
                    {String(
                      index + 1
                    ).padStart(
                      2,
                      "0"
                    )}
                  </div>

                  <p className="text-sm leading-6 text-slate-300">
                    {item}
                  </p>
                </div>
              </div>
            )
          )}

          {!resume.suggestions
            ?.length && (
            <EmptyInline>
              No recommendations were returned.
            </EmptyInline>
          )}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[#0b1224]/85 p-6 shadow-xl backdrop-blur-xl sm:p-8">
        <SectionHeading
          icon="⚠"
          title="ATS Issues"
          subtitle="Potential problems detected from the uploaded resume"
        />

        <div className="mt-6 space-y-3">
          {(resume.atsIssues ||
            []).map(
            (item, index) => (
              <div
                key={`${item}-${index}`}
                className="break-inside-avoid flex gap-3 rounded-2xl border border-amber-400/10 bg-amber-400/[0.035] p-4"
              >
                <span className="mt-0.5 text-amber-400">
                  ⚠
                </span>

                <p className="text-sm leading-6 text-slate-300">
                  {item}
                </p>
              </div>
            )
          )}

          {!resume.atsIssues
            ?.length && (
            <EmptyInline>
              No major ATS issues were detected.
            </EmptyInline>
          )}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[#0b1224]/85 p-6 shadow-xl backdrop-blur-xl sm:p-8">
        <SectionHeading
          icon="AI"
          title="Detailed Analysis"
          subtitle="AI-generated evaluation based on the actual uploaded resume"
        />

        <div className="mt-6 rounded-2xl border border-white/10 bg-black/10 p-5">
          <p className="whitespace-pre-line text-sm leading-7 text-slate-300">
            {resume.analysis ||
              "No detailed analysis was returned."}
          </p>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-gradient-to-br from-cyan-400/[0.07] via-blue-500/[0.04] to-violet-500/[0.07] p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-[.2em] text-cyan-400">
              Analysis Metadata
            </div>

            <h3 className="mt-2 text-lg font-black">
              Real stored result
            </h3>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-xs text-slate-400">
            {resume.analyzedAt
              ? formatDate(
                  resume.analyzedAt
                )
              : formatDate(
                  resume.createdAt
                )}
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <MiniInfo
            label="File"
            value={
              resume.fileName ||
              "Resume PDF"
            }
          />

          <MiniInfo
            label="Status"
            value={
              resume.status ||
              "COMPLETED"
            }
          />

          <MiniInfo
            label="ATS Score"
            value={`${Number(
              resume.score || 0
            )}%`}
          />
        </div>
      </section>
    </div>
  );
};

const HistorySection = ({
  history,
  totalHistory,
  loading,
  search,
  setSearch,
  filter,
  setFilter,
  selectedId,
  onOpen,
  onPrint,
  onDelete,
  onUpload,
}) => {
  return (
    <section
      id="resume-history"
      className="mt-6 scroll-mt-6 rounded-[32px] border border-white/10 bg-[#0b1224]/85 p-5 shadow-2xl backdrop-blur-xl sm:p-8"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-[.24em] text-cyan-400">
            Performance Center
          </div>

          <h2 className="mt-2 text-2xl font-black sm:text-3xl">
            Resume History
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Every completed analysis stored
            in your account.
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-[1fr_150px]">
          <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.03] px-4">
            <span className="mr-3 text-cyan-400">
              ⌕
            </span>

            <input
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search resumes..."
              className="w-full bg-transparent py-3 text-sm text-white outline-none placeholder:text-slate-600"
            />
          </div>

          <select
            value={filter}
            onChange={(e) =>
              setFilter(
                e.target.value
              )
            }
            className="rounded-xl border border-white/10 bg-[#111a30] px-4 py-3 text-sm text-slate-300 outline-none"
          >
            <option value="ALL">
              All scores
            </option>

            <option value="HIGH">
              75%+
            </option>

            <option value="MEDIUM">
              50–74%
            </option>

            <option value="LOW">
              Below 50%
            </option>
          </select>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="rounded-full border border-white/10 bg-white/[0.025] px-3 py-1.5 text-xs text-slate-400">
          Showing{" "}
          <span className="font-black text-cyan-400">
            {history.length}
          </span>{" "}
          of{" "}
          <span className="font-black text-white">
            {totalHistory}
          </span>{" "}
          reports
        </div>

        <button
          type="button"
          onClick={onUpload}
          className="rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2.5 text-xs font-black text-slate-950 transition hover:-translate-y-0.5 hover:brightness-110"
        >
          + Analyze New Resume
        </button>
      </div>

      {loading ? (
        <HistorySkeleton />
      ) : history.length === 0 ? (
        <EmptyHistory
          filtered={
            Boolean(
              search.trim() ||
                filter !== "ALL"
            )
          }
          onClear={() => {
            setSearch("");
            setFilter("ALL");
          }}
        />
      ) : (
        <div className="mt-7 grid gap-4">
          {history.map(
            (item, index) => (
              <HistoryCard
                key={
                  getResumeId(item) ||
                  index
                }
                item={item}
                selected={
                  selectedId ===
                  getResumeId(item)
                }
                onOpen={
                  onOpen
                }
                onPrint={
                  onPrint
                }
                onDelete={
                  onDelete
                }
              />
            )
          )}
        </div>
      )}
    </section>
  );
};

const HistoryCard = ({
  item,
  selected,
  onOpen,
  onPrint,
  onDelete,
}) => {
  const id =
    getResumeId(item);

  const score =
    Number(item.score || 0);

  const status =
    String(
      item.status ||
        "COMPLETED"
    ).toUpperCase();

  return (
    <div
      className={`group rounded-3xl border p-5 transition-all duration-300 hover:-translate-y-1 ${
        selected
          ? "border-cyan-400/30 bg-cyan-400/[0.04] shadow-[0_0_35px_rgba(34,211,238,.05)]"
          : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.035]"
      }`}
    >
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/10 text-xl">
            📄

            {status ===
              "COMPLETED" && (
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-emerald-400" />
            )}
          </div>

          <div className="min-w-0">
            <h3 className="truncate font-bold text-white">
              {item.fileName ||
                "Resume"}
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              {formatDate(
                item.createdAt
              )}
            </p>

            <span
              className={`mt-2 inline-flex rounded-full border px-2 py-1 text-[9px] font-black ${
                status ===
                "COMPLETED"
                  ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-400"
                  : status ===
                    "FAILED"
                  ? "border-red-400/20 bg-red-400/10 text-red-400"
                  : "border-amber-400/20 bg-amber-400/10 text-amber-400"
              }`}
            >
              {status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:w-[390px]">
          <HistoryStat
            label="ATS"
            value={`${score}%`}
            accent={
              score >= 75
                ? "text-emerald-400"
                : score >= 50
                ? "text-cyan-400"
                : "text-amber-400"
            }
          />

          <HistoryStat
            label="Skills"
            value={
              item.skills
                ?.length || 0
            }
          />

          <HistoryStat
            label="Issues"
            value={
              item.atsIssues
                ?.length || 0
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <button
            type="button"
            disabled={!id}
            onClick={() =>
              onOpen(item)
            }
            className="rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-3 text-xs font-black text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            View Analysis →
          </button>

          <button
            type="button"
            disabled={!id}
            onClick={() =>
              onPrint(item)
            }
            className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 px-4 py-3 text-xs font-bold text-cyan-300 transition hover:bg-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            🖨 Print
          </button>

          <button
            type="button"
            disabled={!id}
            onClick={() =>
              onDelete(id)
            }
            className="rounded-xl border border-red-400/10 bg-red-400/5 px-4 py-3 text-xs font-bold text-red-300 transition hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-40 sm:col-span-2"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const ScoreRing = ({
  score,
}) => {
  const radius = 78;

  const circumference =
    2 * Math.PI * radius;

  const safeScore = Math.min(
    100,
    Math.max(
      0,
      Number(score || 0)
    )
  );

  const progress =
    circumference -
    (safeScore / 100) *
      circumference;

  return (
    <div className="relative h-52 w-52">
      <svg
        viewBox="0 0 200 200"
        className="h-full w-full -rotate-90"
      >
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,.06)"
          strokeWidth="12"
        />

        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={
            circumference
          }
          strokeDashoffset={
            progress
          }
          className="transition-all duration-700"
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

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-black tracking-tight">
          {Math.round(
            safeScore
          )}
        </span>

        <span className="text-xs font-bold uppercase tracking-[.2em] text-slate-500">
          ATS Score
        </span>
      </div>
    </div>
  );
};

const Metric = ({
  label,
  value,
}) => {
  const safeValue = Math.min(
    100,
    Math.max(
      0,
      Number(value || 0)
    )
  );

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-xs text-slate-500">
          {label}
        </span>

        <span className="text-sm font-black text-cyan-400">
          {safeValue}%
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-1000"
          style={{
            width: `${safeValue}%`,
          }}
        />
      </div>
    </div>
  );
};

const DataCard = ({
  title,
  icon,
  tone,
  items,
  empty,
}) => {
  const toneClasses = {
    cyan:
      "text-cyan-400 bg-cyan-400/10 border-cyan-400/10",
    red:
      "text-red-400 bg-red-400/10 border-red-400/10",
    green:
      "text-emerald-400 bg-emerald-400/10 border-emerald-400/10",
    amber:
      "text-amber-400 bg-amber-400/10 border-amber-400/10",
  };

  return (
    <section className="rounded-[28px] border border-white/10 bg-[#0b1224]/85 p-6 shadow-xl backdrop-blur-xl sm:p-7">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl border font-black ${toneClasses[tone]}`}
          >
            {icon}
          </div>

          <div>
            <h3 className="font-black">
              {title}
            </h3>

            <p className="mt-0.5 text-xs text-slate-500">
              {items?.length || 0}{" "}
              detected
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {(items || []).map(
          (item, index) => (
            <span
              key={`${item}-${index}`}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${toneClasses[tone]}`}
            >
              {item}
            </span>
          )
        )}

        {!items?.length && (
          <p className="text-sm text-slate-500">
            {empty}
          </p>
        )}
      </div>
    </section>
  );
};

const SectionHeading = ({
  icon,
  title,
  subtitle,
}) => {
  return (
    <div className="flex gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-400/10 text-violet-300">
        {icon}
      </div>

      <div>
        <h3 className="font-black">
          {title}
        </h3>

        <p className="mt-1 text-xs text-slate-500">
          {subtitle}
        </p>
      </div>
    </div>
  );
};

const MiniInfo = ({
  label,
  value,
}) => {
  return (
    <div className="rounded-xl border border-white/10 bg-black/10 p-4">
      <p className="text-[10px] font-bold uppercase tracking-[.15em] text-slate-600">
        {label}
      </p>

      <p className="mt-2 truncate text-sm font-bold text-slate-300">
        {value}
      </p>
    </div>
  );
};

const HistoryStat = ({
  label,
  value,
  accent = "text-white",
}) => {
  return (
    <div className="rounded-xl border border-white/10 bg-black/10 px-3 py-2">
      <p className="text-[9px] font-bold uppercase tracking-[.15em] text-slate-600">
        {label}
      </p>

      <p
        className={`mt-1 text-sm font-black ${accent}`}
      >
        {value}
      </p>
    </div>
  );
};

const StatusItem = ({
  icon,
  title,
  description,
}) => {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-xs font-black text-slate-500">
        {icon}
      </div>

      <div>
        <p className="text-sm font-bold text-slate-300">
          {title}
        </p>

        <p className="mt-1 text-xs text-slate-600">
          {description}
        </p>
      </div>
    </div>
  );
};

const TabButton = ({
  active,
  children,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-5 py-2.5 text-sm font-bold transition ${
        active
          ? "bg-cyan-400 text-slate-950 shadow-[0_0_25px_rgba(34,211,238,.15)]"
          : "text-slate-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
};

const Badge = ({
  children,
  green = false,
}) => {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-bold ${
        green
          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-400"
          : "border-white/10 bg-white/[0.04] text-slate-400"
      }`}
    >
      {children}
    </span>
  );
};

const Alert = ({
  type,
  message,
  onClose,
}) => {
  const success =
    type === "success";

  return (
    <div
      className={`no-print mb-5 flex items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-sm ${
        success
          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
          : "border-red-400/20 bg-red-400/10 text-red-300"
      }`}
    >
      <div className="flex items-center gap-3">
        <span>
          {success ? "✓" : "!"}
        </span>

        <span>{message}</span>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="opacity-60 hover:opacity-100"
      >
        ×
      </button>
    </div>
  );
};

const EmptyState = ({
  onUpload,
}) => {
  return (
    <section className="no-print flex min-h-[380px] items-center justify-center rounded-[32px] border border-white/10 bg-[#0b1224]/60 p-8 text-center backdrop-blur-xl">
      <div>
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-cyan-400/10 text-4xl">
          ✦
        </div>

        <h2 className="mt-6 text-2xl font-black">
          Your ATS report will appear here
        </h2>

        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
          Upload a PDF resume to generate
          a real AI analysis. Previous
          analyses are automatically saved
          to your history.
        </p>

        <button
          type="button"
          onClick={onUpload}
          className="mt-6 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3 text-sm font-black text-slate-950 transition hover:scale-[1.02]"
        >
          Upload Resume →
        </button>
      </div>
    </section>
  );
};

const EmptyHistory = ({
  filtered,
  onClear,
}) => {
  return (
    <div className="mt-8 rounded-3xl border border-dashed border-white/10 p-12 text-center">
      <div className="text-4xl">
        ◷
      </div>

      <h3 className="mt-4 font-black">
        {filtered
          ? "No matching reports"
          : "No resume analyses yet"}
      </h3>

      <p className="mt-2 text-sm text-slate-500">
        {filtered
          ? "Try changing your search or score filter."
          : "Upload your first resume to create your analysis history."}
      </p>

      {filtered && (
        <button
          type="button"
          onClick={onClear}
          className="mt-5 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-bold text-cyan-300"
        >
          Clear filters
        </button>
      )}
    </div>
  );
};

const EmptyInline = ({
  children,
}) => {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-500">
      {children}
    </div>
  );
};

const HistorySkeleton = () => {
  return (
    <div className="mt-7 space-y-4">
      {[1, 2, 3].map(
        (item) => (
          <div
            key={item}
            className="h-32 animate-pulse rounded-3xl bg-white/[0.04]"
          />
        )
      )}
    </div>
  );
};

const Spinner = ({
  dark = false,
}) => {
  return (
    <span
      className={`h-4 w-4 animate-spin rounded-full border-2 ${
        dark
          ? "border-cyan-400/20 border-t-cyan-400"
          : "border-slate-950/30 border-t-slate-950"
      }`}
    />
  );
};

const getResumeId = (
  resume
) => {
  if (!resume) return null;

  return (
    resume._id ||
    resume.id ||
    null
  );
};

const formatBytes = (
  bytes
) => {
  if (!bytes) return "0 KB";

  const mb =
    bytes / 1024 / 1024;

  if (mb >= 1) {
    return `${mb.toFixed(2)} MB`;
  }

  return `${Math.round(
    bytes / 1024
  )} KB`;
};

const formatDate = (
  value
) => {
  if (!value) return "Recently";

  try {
    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "Recently";
    }

    return date.toLocaleString(
      undefined,
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  } catch {
    return "Recently";
  }
};

export default ResumeAnalyzer;