import React, {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
import { getMockTestResult } from "../../services/mockTestService";

const MockTestResult = () => {
  const { resultId } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] = useState("");
  const [expandedQuestion, setExpandedQuestion] =
    useState(null);

  useEffect(() => {
    loadResult();
  }, [resultId]);

  const loadResult = async () => {
    try {
      setLoading(true);
      setError("");

      if (!resultId) {
        throw new Error(
          "Result ID is missing."
        );
      }

      const response =
        await getMockTestResult(
          resultId
        );

      const data =
        response?.result ||
        response?.data?.result ||
        response?.data ||
        response;

      if (!data) {
        throw new Error(
          "Result details could not be found."
        );
      }

      setResult(data);
    } catch (err) {
      console.error(
        "Failed to load result:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load test result."
      );
    } finally {
      setLoading(false);
    }
  };

  const percentage = useMemo(() => {
    const value = Number(
      result?.percentage
    );

    if (Number.isFinite(value)) {
      return Math.max(
        0,
        Math.min(100, value)
      );
    }

    const totalMarks = Number(
      result?.totalMarks
    );

    const obtainedMarks = Number(
      result?.obtainedMarks
    );

    if (
      totalMarks > 0 &&
      Number.isFinite(
        obtainedMarks
      )
    ) {
      return Math.max(
        0,
        Math.min(
          100,
          (obtainedMarks /
            totalMarks) *
            100
        )
      );
    }

    return 0;
  }, [result]);

  const passed =
    result?.passed === true;

  const totalQuestions =
    Number(
      result?.totalQuestions
    ) || 0;

  const answeredQuestions =
    Number(
      result?.answeredQuestions
    ) || 0;

  const unansweredQuestions =
    Number(
      result?.unansweredQuestions
    ) ||
    Math.max(
      0,
      totalQuestions -
        answeredQuestions
    );

  const correctAnswers =
    Number(
      result?.correctAnswers
    ) || 0;

  const wrongAnswers =
    Number(
      result?.wrongAnswers
    ) || 0;

  const obtainedMarks =
    Number(
      result?.obtainedMarks
    ) || 0;

  const totalMarks =
    Number(
      result?.totalMarks
    ) || 0;

  const passingMarks =
    Number(
      result?.passingMarks
    ) || 0;

  const mcqScore =
    Number(result?.mcqScore) ||
    0;

  const mcqMaxScore =
    Number(
      result?.mcqMaxScore
    ) || 0;

  const theoryScore =
    Number(
      result?.theoryScore
    ) || 0;

  const theoryMaxScore =
    Number(
      result?.theoryMaxScore
    ) || 0;

  const questions =
    Array.isArray(
      result?.questions
    )
      ? result.questions
      : [];

  const security =
    result?.security || {};

  const aiReport =
    result?.aiReport || {};

  const isPartial =
    result?.status === "PARTIAL";

  const isGenerating =
    result?.status === "GENERATING";

  const isFailed =
    result?.status === "FAILED";

  const formatDuration = (
    seconds
  ) => {
    const value =
      Number(seconds) || 0;

    const hours = Math.floor(
      value / 3600
    );

    const minutes = Math.floor(
      (value % 3600) / 60
    );

    const remainingSeconds =
      value % 60;

    if (hours > 0) {
      return `${hours}h ${String(
        minutes
      ).padStart(2, "0")}m`;
    }

    return `${minutes}m ${String(
      remainingSeconds
    ).padStart(2, "0")}s`;
  };

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsed =
      new Date(date);

    if (
      Number.isNaN(
        parsed.getTime()
      )
    ) {
      return "—";
    }

    return parsed.toLocaleString(
      "en-IN",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  };

  const getQuestionTypeLabel = (
    type
  ) => {
    const labels = {
      MCQ_SINGLE: "MCQ",
      MCQ_MULTIPLE:
        "Multiple Choice",
      TRUE_FALSE: "True / False",
      THEORY: "Theory",
    };

    return (
      labels[type] ||
      type ||
      "Question"
    );
  };

  const normalizeAnswer = (
    answer
  ) => {
    if (
      answer === undefined ||
      answer === null
    ) {
      return [];
    }

    if (Array.isArray(answer)) {
      return answer;
    }

    return [answer];
  };

  const formatAnswer = (
    answer
  ) => {
    const values =
      normalizeAnswer(answer);

    if (values.length === 0) {
      return "Not answered";
    }

    return values.join(", ");
  };

  const getQuestionStatus = (
    question
  ) => {
    const evaluationStatus =
      question?.aiEvaluation
        ?.status;

    if (
      evaluationStatus ===
      "PENDING"
    ) {
      return {
        label: "AI Evaluation Pending",
        className:
          "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
      };
    }

    if (
      evaluationStatus ===
      "FAILED"
    ) {
      return {
        label: "AI Evaluation Failed",
        className:
          "text-red-400 bg-red-500/10 border-red-500/30",
      };
    }

    if (
      question?.isCorrect === true
    ) {
      return {
        label: "Correct",
        className:
          "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
      };
    }

    if (
      question?.isCorrect === false
    ) {
      return {
        label: "Incorrect",
        className:
          "text-red-400 bg-red-500/10 border-red-500/30",
      };
    }

    return {
      label: "Not Answered",
      className:
        "text-slate-400 bg-slate-500/10 border-slate-500/30",
    };
  };

  const toggleQuestion = (
    questionNumber
  ) => {
    setExpandedQuestion(
      (previous) =>
        previous ===
        questionNumber
          ? null
          : questionNumber
    );
  };

  const handleRetake = () => {
    if (!result?.testId) {
      navigate("/mock-tests");
      return;
    }

    const testId =
      result.testId?._id ||
      result.testId;

    navigate(
      `/mock-tests/${testId}/instructions`
    );
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-5" />

          <p className="text-slate-400">
            Loading your result...
          </p>
        </div>
      </div>
    );
  }

  if (
    error ||
    !result
  ) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center px-6">
        <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5 text-2xl">
            !
          </div>

          <h1 className="text-2xl font-bold mb-3">
            Result Not Found
          </h1>

          <p className="text-slate-400 mb-7">
            {error ||
              "We could not load your test result."}
          </p>

           <button
            onClick={() =>
                navigate("/mock-tests", {
                replace: true,
                })
            }
            className="px-6 py-3 rounded-xl bg-cyan-500 text-slate-950 font-bold"
            >
            Back to Mock Tests
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="print:hidden sticky top-0 z-50 bg-[#020617]/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">
              Mock Test Result
            </p>

            <h1 className="text-lg md:text-xl font-bold truncate max-w-[60vw]">
              {result.testTitle ||
                "Mock Test"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={
                handlePrint
              }
              className="hidden sm:block px-4 py-2 rounded-xl border border-slate-700 hover:border-slate-500 text-sm"
            >
              Print
            </button>

            <button
              onClick={() =>
                navigate(
                  "/mock-tests"
                )
              }
              className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-semibold text-sm"
            >
              Mock Tests
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <section className="mb-7">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                {result.category && (
                  <Badge>
                    {result.category}
                  </Badge>
                )}

                {result.difficulty && (
                  <Badge>
                    {result.difficulty}
                  </Badge>
                )}

                {result.status && (
                  <Badge>
                    {result.status}
                  </Badge>
                )}
              </div>

              <h2 className="text-3xl md:text-4xl font-bold">
                {result.testTitle ||
                  "Mock Test Result"}
              </h2>

              <p className="text-slate-500 mt-2">
                Submitted{" "}
                {formatDate(
                  result.submittedAt
                )}
              </p>
            </div>

            <div
              className={`inline-flex items-center gap-3 px-5 py-3 rounded-2xl border ${
                passed
                  ? "border-emerald-500/30 bg-emerald-500/10"
                  : "border-red-500/30 bg-red-500/10"
              }`}
            >
              <span
                className={`w-3 h-3 rounded-full ${
                  passed
                    ? "bg-emerald-400"
                    : "bg-red-400"
                }`}
              />

              <span
                className={
                  passed
                    ? "text-emerald-400 font-bold"
                    : "text-red-400 font-bold"
                }
              >
                {passed
                  ? "PASSED"
                  : "NOT PASSED"}
              </span>
            </div>
          </div>
        </section>

        {isGenerating && (
          <div className="mb-6 p-5 rounded-2xl border border-cyan-500/30 bg-cyan-500/10">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />

              <div>
                <h3 className="font-bold text-cyan-300">
                  Generating your result
                </h3>

                <p className="text-sm text-slate-400">
                  Your test result is
                  being prepared.
                </p>
              </div>
            </div>
          </div>
        )}

        {isPartial && (
          <div className="mb-6 p-5 rounded-2xl border border-yellow-500/30 bg-yellow-500/10">
            <h3 className="font-bold text-yellow-300 mb-1">
              AI evaluation is still
              in progress
            </h3>

            <p className="text-sm text-slate-400">
              Objective questions have
              been scored. Theory
              questions may receive AI
              feedback after evaluation
              finishes.
            </p>
          </div>
        )}

        {isFailed && (
          <div className="mb-6 p-5 rounded-2xl border border-red-500/30 bg-red-500/10">
            <h3 className="font-bold text-red-300 mb-1">
              Result processing
              encountered an issue
            </h3>

            <p className="text-sm text-slate-400">
              Some evaluation data may
              be unavailable.
            </p>
          </div>
        )}

        <section className="grid lg:grid-cols-[1fr_360px] gap-6 mb-7">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative w-44 h-44 flex-shrink-0">
                <div className="absolute inset-0 rounded-full border-[14px] border-slate-800" />

                <div
                  className="absolute inset-0 rounded-full border-[14px] border-cyan-400"
                  style={{
                    clipPath: `inset(${
                      100 - percentage
                    }% 0 0 0)`,
                  }}
                />

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black">
                    {percentage.toFixed(
                      1
                    )}
                    %
                  </span>

                  <span className="text-xs text-slate-500">
                    SCORE
                  </span>
                </div>
              </div>

              <div className="flex-1 w-full">
                <p className="text-sm text-slate-500 mb-1">
                  Overall Score
                </p>

                <h3 className="text-4xl font-black mb-2">
                  {obtainedMarks}
                  <span className="text-xl text-slate-500">
                    {" "}
                    / {totalMarks}
                  </span>
                </h3>

                <div className="h-3 bg-slate-800 rounded-full overflow-hidden mb-5">
                  <div
                    className="h-full bg-cyan-400 rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(
                          0,
                          percentage
                        )
                      )}%`,
                    }}
                  />
                </div>

                <div className="flex flex-wrap gap-3 text-sm">
                  <span className="text-slate-500">
                    Passing:{" "}
                    <strong className="text-white">
                      {
                        passingMarks
                      }
                    </strong>
                  </span>

                  <span className="text-slate-700">
                    |
                  </span>

                  <span className="text-slate-500">
                    Time:{" "}
                    <strong className="text-white">
                      {formatDuration(
                        result.timeTakenSeconds
                      )}
                    </strong>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <StatCard
              label="Questions"
              value={
                totalQuestions
              }
              icon="◉"
            />

            <StatCard
              label="Answered"
              value={
                answeredQuestions
              }
              icon="✓"
              valueClass="text-emerald-400"
            />

            <StatCard
              label="Correct"
              value={
                correctAnswers
              }
              icon="✓"
              valueClass="text-emerald-400"
            />

            <StatCard
              label="Wrong"
              value={
                wrongAnswers
              }
              icon="×"
              valueClass="text-red-400"
            />

            <StatCard
              label="Unanswered"
              value={
                unansweredQuestions
              }
              icon="−"
              valueClass="text-yellow-400"
            />

            <StatCard
              label="Accuracy"
              value={`${(
                (correctAnswers /
                  Math.max(
                    answeredQuestions,
                    1
                  )) *
                100
              ).toFixed(1)}%`}
              icon="%"
              valueClass="text-cyan-400"
            />
          </div>
        </section>

        <section className="grid md:grid-cols-2 gap-6 mb-7">
          <ScoreBreakdown
            title="MCQ Performance"
            score={mcqScore}
            maxScore={mcqMaxScore}
          />

          <ScoreBreakdown
            title="Theory Performance"
            score={theoryScore}
            maxScore={theoryMaxScore}
            pending={
              isPartial &&
              theoryMaxScore >
                theoryScore
            }
          />
        </section>

        {(aiReport.enabled ||
          aiReport.summary ||
          aiReport.overallFeedback ||
          aiReport.strengths?.length ||
          aiReport.weaknesses?.length ||
          aiReport.recommendations
            ?.length) && (
          <section className="mb-7">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    ✦
                  </div>

                  <div>
                    <h2 className="text-xl font-bold">
                      AI Performance
                      Report
                    </h2>

                    <p className="text-sm text-slate-500">
                      Personalized analysis
                      of your performance
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {aiReport.summary && (
                  <div>
                    <h3 className="font-bold mb-2">
                      Summary
                    </h3>

                    <p className="text-slate-400 leading-7">
                      {
                        aiReport.summary
                      }
                    </p>
                  </div>
                )}

                {aiReport.overallFeedback && (
                  <div>
                    <h3 className="font-bold mb-2">
                      Overall Feedback
                    </h3>

                    <p className="text-slate-400 leading-7">
                      {
                        aiReport.overallFeedback
                      }
                    </p>
                  </div>
                )}

                <div className="grid md:grid-cols-3 gap-5">
                  <InsightCard
                    title="Strengths"
                    items={
                      aiReport.strengths ||
                      []
                    }
                    type="success"
                  />

                  <InsightCard
                    title="Areas to Improve"
                    items={
                      aiReport.weaknesses ||
                      []
                    }
                    type="warning"
                  />

                  <InsightCard
                    title="Recommendations"
                    items={
                      aiReport.recommendations ||
                      []
                    }
                    type="info"
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="mb-7">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-2xl font-bold">
                Question Analysis
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Review every question and
                your submitted answer.
              </p>
            </div>

            <span className="text-sm text-slate-500">
              {questions.length} questions
            </span>
          </div>

          <div className="space-y-3">
            {questions.map(
              (
                question,
                index
              ) => {
                const questionNumber =
                  question.questionNumber ||
                  index + 1;

                const status =
                  getQuestionStatus(
                    question
                  );

                const expanded =
                  expandedQuestion ===
                  questionNumber;

                return (
                  <div
                    key={`${questionNumber}-${question.questionId || index}`}
                    className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden"
                  >
                    <button
                      onClick={() =>
                        toggleQuestion(
                          questionNumber
                        )
                      }
                      className="w-full text-left p-5 flex items-start gap-4"
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold flex-shrink-0 ${
                          question.isCorrect ===
                          true
                            ? "bg-emerald-500/10 text-emerald-400"
                            : question.isCorrect ===
                              false
                            ? "bg-red-500/10 text-red-400"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {questionNumber}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span
                            className={`px-2.5 py-1 rounded-lg border text-xs font-semibold ${status.className}`}
                          >
                            {
                              status.label
                            }
                          </span>

                          <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-500 text-xs">
                            {getQuestionTypeLabel(
                              question.type
                            )}
                          </span>

                          {question.difficulty && (
                            <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-500 text-xs">
                              {
                                question.difficulty
                              }
                            </span>
                          )}
                        </div>

                        <p className="font-medium text-slate-200 line-clamp-2">
                          {
                            question.question
                          }
                        </p>
                      </div>

                      <div className="text-slate-500">
                        {expanded
                          ? "⌃"
                          : "⌄"}
                      </div>
                    </button>

                    {expanded && (
                      <div className="border-t border-slate-800 p-5 space-y-5">
                        <div>
                          <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">
                            Question
                          </p>

                          <p className="text-slate-200 leading-7">
                            {
                              question.question
                            }
                          </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <AnswerBox
                            title="Your Answer"
                            value={formatAnswer(
                              question.userAnswer
                            )}
                            type={
                              question.isCorrect ===
                              true
                                ? "success"
                                : question.isCorrect ===
                                  false
                                ? "error"
                                : "neutral"
                            }
                          />

                          {question.type !==
                            "THEORY" && (
                            <AnswerBox
                              title="Correct Answer"
                              value={formatAnswer(
                                question.correctAnswer
                              )}
                              type="success"
                            />
                          )}
                        </div>

                        <div className="flex flex-wrap gap-4">
                          <div className="px-4 py-3 rounded-xl bg-slate-950 border border-slate-800">
                            <span className="text-xs text-slate-500 block">
                              Marks
                            </span>

                            <span className="font-bold">
                              {question.marksAwarded ??
                                0}{" "}
                              /{" "}
                              {question.marks ??
                                0}
                            </span>
                          </div>

                          {question.negativeMarks >
                            0 && (
                            <div className="px-4 py-3 rounded-xl bg-slate-950 border border-slate-800">
                              <span className="text-xs text-slate-500 block">
                                Negative Marks
                              </span>

                              <span className="font-bold text-red-400">
                                {
                                  question.negativeMarks
                                }
                              </span>
                            </div>
                          )}

                          {question.topic && (
                            <div className="px-4 py-3 rounded-xl bg-slate-950 border border-slate-800">
                              <span className="text-xs text-slate-500 block">
                                Topic
                              </span>

                              <span className="font-bold">
                                {
                                  question.topic
                                }
                              </span>
                            </div>
                          )}
                        </div>

                        {question.explanation && (
                          <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                            <p className="text-xs uppercase tracking-wider text-cyan-400 mb-2">
                              Explanation
                            </p>

                            <p className="text-slate-400 leading-7">
                              {
                                question.explanation
                              }
                            </p>
                          </div>
                        )}

                        {question.aiEvaluation && (
                          <div className="p-5 rounded-xl bg-purple-500/5 border border-purple-500/20">
                            <div className="flex items-center justify-between gap-3 mb-4">
                              <div>
                                <p className="text-xs uppercase tracking-wider text-purple-400">
                                  AI Evaluation
                                </p>

                                <h4 className="font-bold mt-1">
                                  Theory
                                  Assessment
                                </h4>
                              </div>

                              <span className="text-sm font-bold text-purple-300">
                                {question.aiEvaluation.score ??
                                  0}{" "}
                                /{" "}
                                {question.aiEvaluation.maxScore ??
                                  question.marks ??
                                  0}
                              </span>
                            </div>

                            {question
                              .aiEvaluation
                              .status ===
                              "PENDING" && (
                              <p className="text-yellow-400 text-sm mb-4">
                                AI evaluation
                                is still
                                pending.
                              </p>
                            )}

                            {question
                              .aiEvaluation
                              .feedback && (
                              <p className="text-slate-400 leading-7 mb-4">
                                {
                                  question
                                    .aiEvaluation
                                    .feedback
                                }
                              </p>
                            )}

                            <div className="grid md:grid-cols-2 gap-4">
                              <InsightList
                                title="Strengths"
                                items={
                                  question
                                    .aiEvaluation
                                    .strengths ||
                                  []
                                }
                                type="success"
                              />

                              <InsightList
                                title="Improvements"
                                items={
                                  question
                                    .aiEvaluation
                                    .improvements ||
                                  []
                                }
                                type="warning"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              }
            )}
          </div>
        </section>

        <section className="mb-7">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-5">
              Test Information
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <InfoItem
                label="Started"
                value={formatDate(
                  result.startedAt
                )}
              />

              <InfoItem
                label="Submitted"
                value={formatDate(
                  result.submittedAt
                )}
              />

              <InfoItem
                label="Time Taken"
                value={formatDuration(
                  result.timeTakenSeconds
                )}
              />

              <InfoItem
                label="Passing Marks"
                value={`${passingMarks} / ${totalMarks}`}
              />
            </div>
          </div>
        </section>

        {Object.keys(
          security
        ).length > 0 && (
          <section className="mb-7">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-5">
                Security Summary
              </h2>

              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                <SecurityItem
                  label="Violations"
                  value={
                    security.totalViolations ??
                    security.violations ??
                    0
                  }
                />

                <SecurityItem
                  label="Tab Switches"
                  value={
                    security.tabSwitches ??
                    0
                  }
                />

                <SecurityItem
                  label="Fullscreen Exits"
                  value={
                    security.fullscreenExits ??
                    0
                  }
                />

                <SecurityItem
                  label="Copy/Paste"
                  value={
                    (security.copyAttempts ??
                      0) +
                    (security.pasteAttempts ??
                      0)
                  }
                />
              </div>
            </div>
          </section>
        )}

        <section className="print:hidden flex flex-col sm:flex-row justify-center gap-4 pb-10">
          <button
            onClick={() =>
              navigate(
                "/mock-tests"
              )
            }
            className="px-7 py-3 rounded-xl border border-slate-700 hover:border-slate-500 font-semibold"
          >
            ← Back to Mock Tests
          </button>


          <button
            onClick={() =>
              navigate(
                "/mock-tests/history"
              )
            }
            className="px-7 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-semibold"
          >
            View History
          </button>
        </section>
      </main>
    </div>
  );
};

const Badge = ({
  children,
}) => (
  <span className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-400">
    {children}
  </span>
);

const StatCard = ({
  label,
  value,
  icon,
  valueClass = "text-white",
}) => (
  <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
    <div className="flex items-center justify-between mb-3">
      <span className="text-xs text-slate-500">
        {label}
      </span>

      <span className="text-slate-600">
        {icon}
      </span>
    </div>

    <p
      className={`text-2xl font-black ${valueClass}`}
    >
      {value}
    </p>
  </div>
);

const ScoreBreakdown = ({
  title,
  score,
  maxScore,
  pending = false,
}) => {
  const percentage =
    maxScore > 0
      ? Math.min(
          100,
          Math.max(
            0,
            (score / maxScore) *
              100
          )
        )
      : 0;

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold">
          {title}
        </h3>

        {pending ? (
          <span className="text-xs text-yellow-400">
            Pending
          </span>
        ) : (
          <span className="font-bold">
            {score}/{maxScore}
          </span>
        )}
      </div>

      <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-cyan-400 rounded-full"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>

      <p className="text-sm text-slate-500">
        {pending
          ? "AI evaluation may still be processing."
          : `${percentage.toFixed(
              1
            )}% performance`}
      </p>
    </div>
  );
};

const InsightCard = ({
  title,
  items,
  type,
}) => {
  const styles = {
    success:
      "border-emerald-500/20 bg-emerald-500/5 text-emerald-400",
    warning:
      "border-yellow-500/20 bg-yellow-500/5 text-yellow-400",
    info:
      "border-cyan-500/20 bg-cyan-500/5 text-cyan-400",
  };

  return (
    <div
      className={`rounded-xl border p-5 ${styles[type]}`}
    >
      <h3 className="font-bold mb-3">
        {title}
      </h3>

      {items.length > 0 ? (
        <ul className="space-y-2">
          {items.map(
            (item, index) => (
              <li
                key={index}
                className="text-sm text-slate-400 flex gap-2"
              >
                <span>•</span>

                <span>
                  {item}
                </span>
              </li>
            )
          )}
        </ul>
      ) : (
        <p className="text-sm text-slate-600">
          No data available.
        </p>
      )}
    </div>
  );
};

const InsightList = ({
  title,
  items,
  type,
}) => {
  const styles = {
    success:
      "text-emerald-400",
    warning:
      "text-yellow-400",
    info:
      "text-cyan-400",
  };

  return (
    <div>
      <h5
        className={`text-sm font-bold mb-2 ${styles[type]}`}
      >
        {title}
      </h5>

      {items.length > 0 ? (
        <ul className="space-y-1.5">
          {items.map(
            (item, index) => (
              <li
                key={index}
                className="text-sm text-slate-500 flex gap-2"
              >
                <span>•</span>

                <span>
                  {item}
                </span>
              </li>
            )
          )}
        </ul>
      ) : (
        <span className="text-xs text-slate-600">
          No data available.
        </span>
      )}
    </div>
  );
};

const AnswerBox = ({
  title,
  value,
  type,
}) => {
  const styles = {
    success:
      "border-emerald-500/20 bg-emerald-500/5",
    error:
      "border-red-500/20 bg-red-500/5",
    neutral:
      "border-slate-800 bg-slate-950/50",
  };

  return (
    <div
      className={`rounded-xl border p-4 ${styles[type]}`}
    >
      <p className="text-xs text-slate-500 mb-2">
        {title}
      </p>

      <p className="text-sm text-slate-300 break-words">
        {value}
      </p>
    </div>
  );
};

const InfoItem = ({
  label,
  value,
}) => (
  <div>
    <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">
      {label}
    </p>

    <p className="text-sm font-semibold text-slate-200">
      {value}
    </p>
  </div>
);

const SecurityItem = ({
  label,
  value,
}) => (
  <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800">
    <p className="text-xs text-slate-500 mb-2">
      {label}
    </p>

    <p className="text-xl font-bold">
      {value}
    </p>
  </div>
);

export default MockTestResult;