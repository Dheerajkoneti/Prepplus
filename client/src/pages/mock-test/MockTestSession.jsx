import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getAttempt,
  saveAnswer,
  markForReview,
  updateNavigation,
  sendHeartbeat,
  abandonTest,
  submitMockTest,
} from "../../services/mockTestService";

const MockTestSession = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [reviewed, setReviewed] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [lastSavedAt, setLastSavedAt] = useState(null);

  const [securityWarning, setSecurityWarning] = useState("");
  const [securityLevel, setSecurityLevel] = useState("warning");
  const [violationCount, setViolationCount] = useState(0);
  const [securityLocked, setSecurityLocked] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(
    Boolean(document.fullscreenElement)
  );
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  const submittingRef = useRef(false);
  const heartbeatRef = useRef(null);
  const securityWarningTimerRef = useRef(null);
  const violationCountRef = useRef(0);
  const lastSecurityEventRef = useRef({ type: "", time: 0 });
  const hasEnteredFullscreenRef = useRef(Boolean(document.fullscreenElement));
  const autoSubmitTimerRef = useRef(null);

  const getQuestionId = useCallback((question) => {
    return String(
      question?._id ||
        question?.id ||
        question?.questionId ||
        ""
    );
  }, []);

  const normalizeAnswer = useCallback((value) => {
    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      return [];
    }

    if (Array.isArray(value)) {
      return value
        .map((item) => String(item).trim())
        .filter(Boolean);
    }

    const normalized = String(value).trim();
    return normalized ? [normalized] : [];
  }, []);

  const isAnsweredValue = useCallback(
    (value) => normalizeAnswer(value).length > 0,
    [normalizeAnswer]
  );

  const testSecurity = useMemo(() => {
    const security = attempt?.test?.security || {};

    return {
      enabled: true,
      fullscreenRequired:
        security.fullscreenRequired !== false,
      tabSwitchMonitoring:
        security.tabSwitchMonitoring !== false,
      copyPasteMonitoring:
        security.copyPasteMonitoring !== false,
      contextMenuDisabled:
        security.contextMenuDisabled !== false,
      maxViolations:
        Number(security.maxViolations) || 5,
      autoTerminate:
        security.autoTerminateOnViolation !== false,
    };
  }, [attempt]);

  const showSecurityWarning = useCallback((message, level = "warning") => {
    setSecurityWarning(message);
    setSecurityLevel(level);

    if (securityWarningTimerRef.current) {
      clearTimeout(securityWarningTimerRef.current);
    }

    securityWarningTimerRef.current = setTimeout(() => {
      setSecurityWarning("");
    }, level === "critical" ? 7000 : 5000);
  }, []);

  const enterFullscreen = useCallback(async () => {
    if (!testSecurity.fullscreenRequired) {
      return true;
    }

    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }

      setIsFullscreen(Boolean(document.fullscreenElement));
      hasEnteredFullscreenRef.current = true;
      return true;
    } catch (err) {
      console.error("Fullscreen request failed:", err);
      showSecurityWarning(
        "Fullscreen permission is required. Please click Enter Fullscreen again.",
        "critical"
      );
      return false;
    }
  }, [testSecurity.fullscreenRequired, showSecurityWarning]);

  const loadAttempt = useCallback(async () => {
    if (!attemptId) {
      setError("Attempt ID is required.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await getAttempt(attemptId);
      const data =
        response?.attempt ||
        response?.data?.attempt ||
        response?.data ||
        response;

      if (!data) {
        throw new Error("Attempt data not found.");
      }

      setAttempt(data);

      const loadedQuestions = Array.isArray(data.questions)
        ? data.questions
        : Array.isArray(data.test?.questions)
        ? data.test.questions
        : [];

      setQuestions(loadedQuestions);

      const answerMap = {};
      const reviewMap = {};

      if (Array.isArray(data.answers)) {
        data.answers.forEach((item) => {
          const questionId = String(
            item?.questionId?._id ||
              item?.questionId ||
              item?.question?._id ||
              item?.question ||
              ""
          );

          if (!questionId) {
            return;
          }

          answerMap[questionId] = item?.answer ?? [];
          reviewMap[questionId] = Boolean(item?.markedForReview);
        });
      }

      setAnswers(answerMap);
      setReviewed(reviewMap);

      const restoredIndex = Number(
        data.currentQuestionIndex ?? 0
      );

      setCurrentIndex(
        Math.max(
          0,
          Math.min(
            Number.isFinite(restoredIndex)
              ? restoredIndex
              : 0,
            Math.max(loadedQuestions.length - 1, 0)
          )
        )
      );

      let remaining = 0;

      if (typeof data.remainingSeconds === "number") {
        remaining = data.remainingSeconds;
      } else if (data.expiresAt) {
        remaining = Math.max(
          0,
          Math.floor(
            (new Date(data.expiresAt).getTime() - Date.now()) /
              1000
          )
        );
      }

      setRemainingSeconds(Math.max(0, remaining));

      const existingViolations =
        Number(data.security?.totalViolations) ||
        Number(data.security?.violationCount) ||
        0;

      violationCountRef.current = Math.min(
        existingViolations,
        Number(data.test?.security?.maxViolations) || 5
      );
      setViolationCount(violationCountRef.current);

      if (
        data.status === "TERMINATED" ||
        data.security?.status === "TERMINATED"
      ) {
        setSecurityLocked(true);
      }
    } catch (err) {
      console.error("Failed to load attempt:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load mock test."
      );
    } finally {
      setLoading(false);
    }
  }, [attemptId]);

  useEffect(() => {
    loadAttempt();
  }, [loadAttempt]);

  const currentQuestion = questions[currentIndex] || null;

  const currentQuestionId = currentQuestion
    ? getQuestionId(currentQuestion)
    : "";

  const currentAnswer = currentQuestionId
    ? answers[currentQuestionId] ?? null
    : null;

  const isCurrentReviewed = currentQuestionId
    ? Boolean(reviewed[currentQuestionId])
    : false;

  const answeredCount = useMemo(
    () =>
      questions.filter((question) =>
        isAnsweredValue(answers[getQuestionId(question)])
      ).length,
    [questions, answers, getQuestionId, isAnsweredValue]
  );

  const reviewedCount = useMemo(
    () =>
      questions.filter((question) =>
        Boolean(reviewed[getQuestionId(question)])
      ).length,
    [questions, reviewed, getQuestionId]
  );

  const unansweredCount = Math.max(
    0,
    questions.length - answeredCount
  );

  const progressPercent = questions.length
    ? Math.round(
        ((currentIndex + 1) / questions.length) * 100
      )
    : 0;

  const answeredPercent = questions.length
    ? Math.round((answeredCount / questions.length) * 100)
    : 0;

  const formattedTime = useMemo(() => {
    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.floor(
      (remainingSeconds % 3600) / 60
    );
    const seconds = remainingSeconds % 60;

    if (hours > 0) {
      return `${String(hours).padStart(2, "0")}:${String(
        minutes
      ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    return `${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;
  }, [remainingSeconds]);

  const persistNavigation = useCallback(
    async (index) => {
      try {
        await updateNavigation(attemptId, {
          currentQuestionIndex: index,
        });
      } catch (err) {
        console.error("Navigation update failed:", err);
      }
    },
    [attemptId]
  );

  const changeQuestion = useCallback(
    async (index) => {
      if (
        securityLocked ||
        submittingRef.current ||
        index < 0 ||
        index >= questions.length ||
        index === currentIndex
      ) {
        return;
      }

      setCurrentIndex(index);
      await persistNavigation(index);
    },
    [
      securityLocked,
      questions.length,
      currentIndex,
      persistNavigation,
    ]
  );

  const submitTest = useCallback(
    async (automatic = false) => {
      if (
        !attemptId ||
        submittingRef.current
      ) {
        return;
      }

      submittingRef.current = true;
      setSubmitting(true);

      if (automatic) {
        setSecurityLocked(true);
      }

      setShowSubmitConfirm(false);
      setError("");

      try {
        const response = await submitMockTest(attemptId);

        const resultId =
          response?.resultId ||
          response?.result?._id ||
          response?.data?.resultId ||
          response?.data?.result?._id;

        if (!resultId) {
          throw new Error(
            response?.message ||
              "Result ID was not returned."
          );
        }

        if (document.fullscreenElement) {
          try {
            await document.exitFullscreen();
          } catch {}
        }

        navigate(`/mock-tests/result/${resultId}`, {
          replace: true,
        });
      } catch (err) {
        console.error("Submit test error:", err);
        submittingRef.current = false;
        setSubmitting(false);

        if (automatic) {
          setSecurityLocked(true);
        }

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to submit test."
        );
      }
    },
    [attemptId, navigate]
  );

  const registerSecurityViolation = useCallback(
    async (type, message, details = {}) => {
      if (
        submittingRef.current ||
        securityLocked
      ) {
        return;
      }

      const now = Date.now();
      const previous = lastSecurityEventRef.current;

      if (
        previous.type === type &&
        now - previous.time < 1200
      ) {
        return;
      }

      lastSecurityEventRef.current = {
        type,
        time: now,
      };

      const currentCount = violationCountRef.current;
      const localNextCount = Math.min(
        currentCount + 1,
        testSecurity.maxViolations
      );

      violationCountRef.current = localNextCount;
      setViolationCount(localNextCount);

      const critical =
        localNextCount >=
        testSecurity.maxViolations;

      showSecurityWarning(
        critical
          ? `Security limit reached (${testSecurity.maxViolations}/${testSecurity.maxViolations}). Your test is being submitted.`
          : `${message} Violation ${localNextCount}/${testSecurity.maxViolations}.`,
        critical ? "critical" : "warning"
      );

      try {
        const response = await sendHeartbeat(
          attemptId,
          {
            currentQuestionIndex: currentIndex,
            securityEvent: {
              type,
              details,
              timestamp: new Date().toISOString(),
            },
          }
        );

        const security =
          response?.security ||
          response?.data?.security ||
          response?.attempt?.security ||
          response?.data?.attempt?.security;

        const serverCount = Number(
          security?.violationCount ??
            security?.totalViolations
        );

        if (Number.isFinite(serverCount)) {
          const safeServerCount = Math.min(
            serverCount,
            testSecurity.maxViolations
          );

          violationCountRef.current =
            safeServerCount;
          setViolationCount(safeServerCount);
        }

        const terminated =
          response?.terminated === true ||
          response?.data?.terminated === true ||
          security?.status === "TERMINATED" ||
          security?.attemptStatus === "TERMINATED";

        const reachedLimit =
          terminated ||
          localNextCount >=
            testSecurity.maxViolations;

        if (
          reachedLimit &&
          testSecurity.autoTerminate
        ) {
          setSecurityLocked(true);

          if (autoSubmitTimerRef.current) {
            clearTimeout(autoSubmitTimerRef.current);
          }

          showSecurityWarning(
            "Maximum security violations reached. Your test is being submitted automatically.",
            "critical"
          );

          autoSubmitTimerRef.current =
            setTimeout(() => {
              submitTest(true);
            }, 900);
        }
      } catch (err) {
        console.error(
          "Security event sync failed:",
          err
        );

        if (
          localNextCount >=
            testSecurity.maxViolations &&
          testSecurity.autoTerminate
        ) {
          setSecurityLocked(true);

          if (autoSubmitTimerRef.current) {
            clearTimeout(autoSubmitTimerRef.current);
          }

          autoSubmitTimerRef.current =
            setTimeout(() => {
              submitTest(true);
            }, 900);
        }
      }
    },
    [
      attemptId,
      currentIndex,
      securityLocked,
      showSecurityWarning,
      submitTest,
      testSecurity,
    ]
  );

  const handleAnswer = useCallback(
    async (value) => {
      if (
        !currentQuestion ||
        !attemptId ||
        submittingRef.current ||
        securityLocked
      ) {
        return;
      }

      const questionId =
        getQuestionId(currentQuestion);

      if (!questionId) {
        return;
      }

      setAnswers((previous) => ({
        ...previous,
        [questionId]: value,
      }));

      setSaving(true);
      setError("");

      try {
        await saveAnswer(attemptId, {
          questionId,
          answer: value,
          currentQuestionIndex: currentIndex,
          markedForReview: Boolean(
            reviewed[questionId]
          ),
        });

        setLastSavedAt(new Date());
      } catch (err) {
        console.error(
          "Answer save failed:",
          err
        );

        setError(
          err?.response?.data?.message ||
            "Answer could not be saved."
        );
      } finally {
        setSaving(false);
      }
    },
    [
      currentQuestion,
      attemptId,
      getQuestionId,
      currentIndex,
      reviewed,
      securityLocked,
    ]
  );

  const handleReview = useCallback(
    async () => {
      if (
        !currentQuestion ||
        !attemptId ||
        submittingRef.current ||
        securityLocked
      ) {
        return;
      }

      const questionId =
        getQuestionId(currentQuestion);

      if (!questionId) {
        return;
      }

      const newValue =
        !Boolean(reviewed[questionId]);

      setReviewed((previous) => ({
        ...previous,
        [questionId]: newValue,
      }));

      try {
        await markForReview(attemptId, {
          questionId,
          markedForReview: newValue,
        });
      } catch (err) {
        setReviewed((previous) => ({
          ...previous,
          [questionId]: !newValue,
        }));

        setError(
          err?.response?.data?.message ||
            "Unable to update review status."
        );
      }
    },
    [
      currentQuestion,
      attemptId,
      getQuestionId,
      reviewed,
      securityLocked,
    ]
  );

  useEffect(() => {
    if (
      loading ||
      !attempt ||
      remainingSeconds <= 0 ||
      submittingRef.current
    ) {
      return;
    }

    const timer = setInterval(() => {
      setRemainingSeconds((previous) => {
        if (previous <= 1) {
          clearInterval(timer);
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, attempt, remainingSeconds]);

  useEffect(() => {
    if (
      loading ||
      !attempt ||
      remainingSeconds !== 0 ||
      submittingRef.current
    ) {
      return;
    }

    submitTest(true);
  }, [
    loading,
    attempt,
    remainingSeconds,
    submitTest,
  ]);

  const heartbeat = useCallback(async () => {
    if (
      !attemptId ||
      !attempt ||
      submittingRef.current ||
      securityLocked
    ) {
      return;
    }

    try {
      const response = await sendHeartbeat(
        attemptId,
        {
          currentQuestionIndex: currentIndex,
          clientTime: new Date().toISOString(),
        }
      );

      const security =
        response?.security ||
        response?.data?.security;

      const serverCount = Number(
        security?.violationCount ??
          security?.totalViolations
      );

      if (Number.isFinite(serverCount)) {
        const safeCount = Math.min(
          serverCount,
          testSecurity.maxViolations
        );

        violationCountRef.current = safeCount;
        setViolationCount(safeCount);
      }

      if (
        security?.status === "TERMINATED" ||
        security?.attemptStatus === "TERMINATED" ||
        response?.terminated === true
      ) {
        setSecurityLocked(true);
        submitTest(true);
      }
    } catch (err) {
      console.error("Heartbeat error:", err);
    }
  }, [
    attemptId,
    attempt,
    currentIndex,
    securityLocked,
    submitTest,
    testSecurity.maxViolations,
  ]);

  useEffect(() => {
    if (
      !attemptId ||
      !attempt ||
      loading
    ) {
      return;
    }

    heartbeat();

    heartbeatRef.current = setInterval(
      heartbeat,
      30000
    );

    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
    };
  }, [
    attemptId,
    attempt,
    loading,
    heartbeat,
  ]);

  useEffect(() => {
    if (
      loading ||
      !attempt ||
      !testSecurity.enabled
    ) {
      return;
    }

    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "hidden" &&
        testSecurity.tabSwitchMonitoring
      ) {
        registerSecurityViolation(
          "TAB_SWITCH",
          "Tab switching is not allowed during the test.",
          { visibilityState: document.visibilityState }
        );
      }
    };

    const handleWindowBlur = () => {
      if (testSecurity.tabSwitchMonitoring) {
        registerSecurityViolation(
          "WINDOW_BLUR",
          "Please stay on the test window."
        );
      }
    };

    const handleFullscreenChange = () => {
      const active = Boolean(
        document.fullscreenElement
      );

      setIsFullscreen(active);

      if (active) {
        hasEnteredFullscreenRef.current = true;
        return;
      }

      if (
        hasEnteredFullscreenRef.current &&
        testSecurity.fullscreenRequired
      ) {
        registerSecurityViolation(
          "FULLSCREEN_EXIT",
          "Fullscreen mode is required for this test."
        );
      }
    };

    const handleCopy = (event) => {
      if (testSecurity.copyPasteMonitoring) {
        event.preventDefault();

        registerSecurityViolation(
          "COPY_ATTEMPT",
          "Copying content is disabled during the test."
        );
      }
    };

    const handleCut = (event) => {
      if (testSecurity.copyPasteMonitoring) {
        event.preventDefault();

        registerSecurityViolation(
          "COPY_ATTEMPT",
          "Cutting content is disabled during the test."
        );
      }
    };

    const handlePaste = (event) => {
      if (testSecurity.copyPasteMonitoring) {
        event.preventDefault();

        registerSecurityViolation(
          "PASTE_ATTEMPT",
          "Pasting content is disabled during the test."
        );
      }
    };

    const handleContextMenu = (event) => {
      if (testSecurity.contextMenuDisabled) {
        event.preventDefault();

        registerSecurityViolation(
          "CONTEXT_MENU",
          "Right-click is disabled during the test."
        );
      }
    };

    const handleKeyDown = (event) => {
      const key = String(
        event.key
      ).toLowerCase();

      if (testSecurity.copyPasteMonitoring) {
        const blockedShortcut =
          (event.ctrlKey || event.metaKey) &&
          ["c", "v", "x"].includes(key);

        const blockedContext =
          event.shiftKey && key === "f10";

        if (
          blockedShortcut ||
          blockedContext
        ) {
          event.preventDefault();

          registerSecurityViolation(
            key === "v"
              ? "PASTE_ATTEMPT"
              : "COPY_ATTEMPT",
            "Copy and paste shortcuts are disabled during the test."
          );
        }
      }

      if (
        key === "f12" ||
        (event.ctrlKey &&
          event.shiftKey &&
          ["i", "j", "c"].includes(key))
      ) {
        event.preventDefault();
      }
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );
    window.addEventListener(
      "blur",
      handleWindowBlur
    );
    document.addEventListener(
      "fullscreenchange",
      handleFullscreenChange
    );
    document.addEventListener(
      "copy",
      handleCopy
    );
    document.addEventListener(
      "cut",
      handleCut
    );
    document.addEventListener(
      "paste",
      handlePaste
    );
    document.addEventListener(
      "contextmenu",
      handleContextMenu
    );
    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
      window.removeEventListener(
        "blur",
        handleWindowBlur
      );
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "copy",
        handleCopy
      );
      document.removeEventListener(
        "cut",
        handleCut
      );
      document.removeEventListener(
        "paste",
        handlePaste
      );
      document.removeEventListener(
        "contextmenu",
        handleContextMenu
      );
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    loading,
    attempt,
    testSecurity,
    registerSecurityViolation,
  ]);

  useEffect(() => {
    return () => {
      if (securityWarningTimerRef.current) {
        clearTimeout(
          securityWarningTimerRef.current
        );
      }

      if (autoSubmitTimerRef.current) {
        clearTimeout(autoSubmitTimerRef.current);
      }
    };
  }, []);

  const goNext = async () => {
    if (
      currentIndex >= questions.length - 1
    ) {
      setShowSubmitConfirm(true);
      return;
    }

    await changeQuestion(currentIndex + 1);
  };

  const goPrevious = async () => {
    if (currentIndex <= 0) {
      return;
    }

    await changeQuestion(currentIndex - 1);
  };

  const handleAbandon = async () => {
    if (
      submittingRef.current ||
      submitting ||
      securityLocked
    ) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to leave this test? Your attempt may be marked as abandoned."
    );

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);

      await abandonTest(attemptId);

      if (document.fullscreenElement) {
        try {
          await document.exitFullscreen();
        } catch {}
      }

      navigate("/mock-tests");
    } catch (err) {
      console.error(
        "Abandon failed:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Unable to abandon the test."
      );
    } finally {
      setSaving(false);
    }
  };

  const renderQuestion = () => {
    if (!currentQuestion) {
      return null;
    }

    if (
      currentQuestion.type === "THEORY"
    ) {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 rounded-2xl border border-violet-400/10 bg-violet-400/5 px-4 py-3 text-xs text-violet-300">
            <span className="text-base">✎</span>
            Write a clear, structured answer. AI evaluation may be used after submission.
          </div>

          <textarea
            value={currentAnswer ?? ""}
            onChange={(event) =>
              handleAnswer(event.target.value)
            }
            placeholder="Start writing your answer here..."
            className="min-h-[300px] w-full resize-y rounded-2xl border border-white/10 bg-slate-950/80 p-5 text-sm leading-7 text-white outline-none transition focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-400/5"
            disabled={
              submitting ||
              securityLocked
            }
          />

          <div className="flex justify-between text-xs text-slate-500">
            <span>Use complete sentences where appropriate.</span>
            <span>
              {String(currentAnswer || "").length} characters
            </span>
          </div>
        </div>
      );
    }

    if (
      currentQuestion.type === "TRUE_FALSE"
    ) {
      const options =
        currentQuestion.options?.length
          ? currentQuestion.options
          : ["true", "false"];

      return (
        <div className="grid gap-3 sm:grid-cols-2">
          {options.map((option, index) => {
            const selected =
              String(currentAnswer ?? "")
                .toLowerCase() ===
              String(option).toLowerCase();

            return (
              <OptionButton
                key={option}
                selected={selected}
                index={index}
                onClick={() =>
                  handleAnswer(option)
                }
              >
                {String(option)
                  .charAt(0)
                  .toUpperCase() +
                  String(option).slice(1)}
              </OptionButton>
            );
          })}
        </div>
      );
    }

    if (
      currentQuestion.type ===
      "MCQ_MULTIPLE"
    ) {
      const selected = Array.isArray(
        currentAnswer
      )
        ? currentAnswer
        : normalizeAnswer(currentAnswer);

      return (
        <div className="space-y-3">
          {(currentQuestion.options || []).map(
            (option, index) => {
              const isSelected =
                selected.includes(option);

              return (
                <OptionButton
                  key={option}
                  selected={isSelected}
                  index={index}
                  multiple
                  onClick={() => {
                    const next = isSelected
                      ? selected.filter(
                          (item) =>
                            item !== option
                        )
                      : [...selected, option];

                    handleAnswer(next);
                  }}
                >
                  {option}
                </OptionButton>
              );
            }
          )}
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {(currentQuestion.options || []).map(
          (option, index) => {
            const selected =
              String(currentAnswer ?? "") ===
              String(option);

            return (
              <OptionButton
                key={option}
                selected={selected}
                index={index}
                onClick={() =>
                  handleAnswer(option)
                }
              >
                {option}
              </OptionButton>
            );
          }
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center overflow-hidden bg-[#020617] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(6,182,212,0.12),transparent_35%)]" />

        <div className="relative text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 animate-pulse items-center justify-center rounded-3xl border border-cyan-400/20 bg-cyan-400/10 text-3xl">
            ⚡
          </div>

          <div className="mx-auto mb-5 h-1.5 w-48 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full w-1/2 animate-[pulse_1.2s_ease-in-out_infinite] rounded-full bg-cyan-400" />
          </div>

          <p className="font-semibold text-white">
            Preparing your secure test
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Loading questions and security controls...
          </p>
        </div>
      </div>
    );
  }

  if (error && !attempt) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020617] px-6 text-white">
        <div className="w-full max-w-lg rounded-3xl border border-red-500/20 bg-slate-900/80 p-8 shadow-2xl">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-2xl">
            ⚠
          </div>

          <h2 className="text-2xl font-bold text-white">
            Unable to Load Test
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            {error}
          </p>

          <button
            onClick={() =>
              navigate("/mock-tests")
            }
            className="mt-7 rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-300"
          >
            Back to Mock Tests
          </button>
        </div>
      </div>
    );
  }

  if (
    !currentQuestion ||
    questions.length === 0
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020617] px-6 text-white">
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-2xl">
            ?
          </div>

          <h2 className="text-2xl font-bold">
            No Questions Found
          </h2>

          <p className="mt-3 text-slate-500">
            This test does not contain any questions.
          </p>

          <button
            onClick={() =>
              navigate("/mock-tests")
            }
            className="mt-6 rounded-2xl bg-cyan-400 px-6 py-3 font-bold text-slate-950"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  const timerCritical = remainingSeconds <= 60;
  const timerWarning = remainingSeconds <= 300;
  const securityDanger =
    violationCount >=
    Math.max(
      1,
      testSecurity.maxViolations - 1
    );

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#020617] text-white selection:bg-cyan-400/30">
      <div className="pointer-events-none fixed inset-0 -z-0 bg-[radial-gradient(circle_at_15%_10%,rgba(6,182,212,0.08),transparent_28%),radial-gradient(circle_at_85%_20%,rgba(139,92,246,0.07),transparent_30%)]" />

      {testSecurity.fullscreenRequired &&
        !isFullscreen &&
        !securityLocked &&
        !submitting && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center bg-[#020617]/95 p-6 backdrop-blur-2xl">
            <div className="relative w-full max-w-xl overflow-hidden rounded-[2rem] border border-cyan-400/20 bg-slate-900/95 shadow-2xl shadow-cyan-500/10">
              <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
              <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />

              <div className="relative p-8 md:p-10">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-400/20 bg-cyan-400/10 text-4xl shadow-lg shadow-cyan-500/10">
                  🔒
                </div>

                <div className="text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400">
                    Secure Assessment
                  </p>

                  <h2 className="mt-3 text-3xl font-black tracking-tight text-white">
                    Enter Secure Test Mode
                  </h2>

                  <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-slate-400">
                    Fullscreen mode is required. Your session will monitor tab switching, copy/paste, right-click and fullscreen exits.
                  </p>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-3">
                  <SecurityFeature
                    icon="⛶"
                    title="Fullscreen"
                    value="Required"
                  />
                  <SecurityFeature
                    icon="◉"
                    title="Tab Monitor"
                    value="Active"
                  />
                  <SecurityFeature
                    icon="⌘"
                    title="Copy Protection"
                    value="Active"
                  />
                  <SecurityFeature
                    icon="!"
                    title="Violation Limit"
                    value={`${testSecurity.maxViolations} attempts`}
                  />
                </div>

                <button
                  onClick={enterFullscreen}
                  className="group mt-7 flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-4 font-black text-slate-950 shadow-xl shadow-cyan-500/10 transition duration-300 hover:-translate-y-0.5 hover:shadow-cyan-500/25"
                >
                  <span>Enter Fullscreen</span>
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </button>

                <p className="mt-4 text-center text-[11px] text-slate-600">
                  Your timer will continue running during the assessment.
                </p>
              </div>
            </div>
          </div>
        )}

      {securityWarning && (
        <div
          className={`fixed left-1/2 top-4 z-[260] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 animate-[slideDown_.35s_ease-out] rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xl ${
            securityLevel === "critical"
              ? "border-red-400/30 bg-red-950/90 shadow-red-950/40"
              : "border-amber-400/30 bg-amber-950/90 shadow-amber-950/30"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 animate-pulse items-center justify-center rounded-xl font-black ${
                securityLevel === "critical"
                  ? "bg-red-500/20 text-red-300"
                  : "bg-amber-500/20 text-amber-300"
              }`}
            >
              !
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-black uppercase tracking-wider text-white">
                  Security Warning
                </p>

                <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-bold text-white">
                  {violationCount}/{testSecurity.maxViolations}
                </span>
              </div>

              <p className="mt-1 text-xs leading-5 text-white/70">
                {securityWarning}
              </p>
            </div>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/85 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-5 px-5 py-4 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-xl shadow-lg shadow-cyan-500/5">
              ⚡
            </div>

            <div className="min-w-0">
              <div className="mb-1 flex items-center gap-2">
                <span className="text-[9px] font-black uppercase tracking-[0.22em] text-cyan-400">
                  Secure Assessment
                </span>
                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[8px] font-black text-emerald-400">
                  LIVE
                </span>
              </div>

              <h1 className="truncate text-base font-black text-white md:text-lg">
                {attempt?.test?.title ||
                  attempt?.testTitle ||
                  attempt?.title ||
                  "AI Mock Test"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {testSecurity.fullscreenRequired && (
              <button
                onClick={enterFullscreen}
                disabled={isFullscreen || submitting}
                className={`hidden items-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-bold transition sm:flex ${
                  isFullscreen
                    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-400"
                    : "border-amber-400/30 bg-amber-400/10 text-amber-300 hover:bg-amber-400/15"
                }`}
              >
                <span>{isFullscreen ? "✓" : "⛶"}</span>
                {isFullscreen
                  ? "Fullscreen Active"
                  : "Enter Fullscreen"}
              </button>
            )}

            <div className="hidden rounded-2xl border border-white/5 bg-slate-900/70 px-4 py-2 text-right md:block">
              <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">
                Progress
              </p>
              <p className="text-sm font-black text-white">
                {answeredCount}
                <span className="mx-1 text-slate-600">
                  /
                </span>
                {questions.length}
              </p>
            </div>

            <div
              className={`rounded-2xl border px-4 py-2.5 transition ${
                timerCritical
                  ? "animate-pulse border-red-400/40 bg-red-500/10 text-red-300"
                  : timerWarning
                  ? "border-amber-400/30 bg-amber-500/10 text-amber-300"
                  : "border-cyan-400/20 bg-cyan-400/10 text-cyan-300"
              }`}
            >
              <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">
                Time Left
              </p>
              <p className="font-mono text-lg font-black">
                {formattedTime}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="border-b border-white/5 bg-slate-950/70">
        <div className="mx-auto max-w-[1600px] px-5 py-3 lg:px-8">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-bold uppercase tracking-wider">
              <SecurityIndicator
                active={testSecurity.tabSwitchMonitoring}
                label="Tab Monitoring"
              />
              <SecurityIndicator
                active={testSecurity.copyPasteMonitoring}
                label="Copy/Paste Blocked"
              />
              <SecurityIndicator
                active={testSecurity.contextMenuDisabled}
                label="Right Click Blocked"
              />
              <SecurityIndicator
                active={testSecurity.fullscreenRequired}
                label="Fullscreen Required"
              />
            </div>

            <div
              className={`hidden text-xs font-bold sm:block ${
                securityDanger
                  ? "text-red-400"
                  : "text-slate-500"
              }`}
            >
              Violations{" "}
              <span className="text-white">
                {violationCount}
              </span>
              /{testSecurity.maxViolations}
            </div>
          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 transition-all duration-700 ease-out"
              style={{
                width: `${progressPercent}%`,
              }}
            />
          </div>
        </div>
      </div>

      {securityLocked && !submitting && (
        <div className="fixed inset-0 z-[240] flex items-center justify-center bg-slate-950/95 p-6 backdrop-blur-xl">
          <div className="w-full max-w-md rounded-[2rem] border border-red-400/20 bg-slate-900/95 p-8 text-center shadow-2xl shadow-red-950/30">
            <div className="mx-auto mb-6 flex h-20 w-20 animate-pulse items-center justify-center rounded-3xl border border-red-400/20 bg-red-400/10 text-4xl">
              ⚠
            </div>

            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-red-400">
              Security Lock
            </p>

            <h2 className="mt-3 text-3xl font-black text-white">
              Test Terminating
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              The maximum security violation limit has been reached. Your attempt is being submitted automatically.
            </p>

            <div className="mt-6 rounded-2xl border border-red-400/10 bg-red-400/5 p-4 text-xs text-red-300">
              Violations:{" "}
              <strong>
                {violationCount}/{testSecurity.maxViolations}
              </strong>
            </div>
          </div>
        </div>
      )}

      {submitting && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-950/95 p-6 backdrop-blur-xl">
          <div className="w-full max-w-md rounded-[2rem] border border-cyan-400/20 bg-slate-900/95 p-8 text-center shadow-2xl shadow-cyan-950/20">
            <div className="relative mx-auto mb-7 h-20 w-20">
              <div className="absolute inset-0 animate-ping rounded-full bg-cyan-400/10" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-400/20 bg-cyan-400/10 text-3xl">
                ✓
              </div>
            </div>

            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-400">
              Secure Submission
            </p>

            <h2 className="mt-3 text-2xl font-black text-white">
              Submitting Your Test
            </h2>

            <p className="mt-3 text-sm text-slate-500">
              Saving your answers and generating your result...
            </p>

            <div className="mx-auto mt-6 h-1.5 max-w-xs overflow-hidden rounded-full bg-slate-800">
              <div className="h-full w-1/2 animate-[slideProgress_1.4s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" />
            </div>
          </div>
        </div>
      )}

      <main className="relative z-10 mx-auto w-full max-w-[1600px] px-5 py-6 lg:px-8 lg:py-8">
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-500/5 p-4 text-sm text-red-300">
            <span className="font-black">!</span>
            <span>{error}</span>
          </div>
        )}

        <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_330px]">
          <section className="min-w-0 overflow-hidden rounded-[1.75rem] border border-white/5 bg-slate-900/70 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <div className="relative border-b border-white/5 p-6 md:p-8">
              <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-cyan-400/5 blur-3xl" />

              <div className="relative mb-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-cyan-300">
                    Question {currentIndex + 1}
                  </span>

                  <span className="text-xs font-bold text-slate-600">
                    / {questions.length}
                  </span>
                </div>

                <span className="rounded-xl border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-amber-300">
                  {currentQuestion.marks || 1} Marks
                </span>
              </div>

              <h2 className="relative text-xl font-bold leading-8 text-white md:text-2xl md:leading-9">
                {currentQuestion.question}
              </h2>
            </div>

            <div className="p-6 md:p-8">
              {renderQuestion()}
            </div>

            <div className="border-t border-white/5 bg-slate-950/20 px-6 py-5 md:px-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={goPrevious}
                  disabled={
                    currentIndex === 0 ||
                    submitting ||
                    securityLocked
                  }
                  className="rounded-2xl border border-slate-700 bg-slate-950/50 px-5 py-3 text-sm font-bold text-slate-300 transition hover:border-slate-500 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  ← Previous
                </button>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleReview}
                    disabled={
                      submitting ||
                      securityLocked
                    }
                    className={`rounded-2xl border px-5 py-3 text-sm font-bold transition ${
                      isCurrentReviewed
                        ? "border-yellow-400/30 bg-yellow-400/10 text-yellow-300"
                        : "border-slate-700 bg-slate-950/50 text-slate-300 hover:border-yellow-400/20"
                    } disabled:opacity-50`}
                  >
                    {isCurrentReviewed
                      ? "★ Reviewed"
                      : "☆ Mark Review"}
                  </button>

                  <span className="hidden text-xs text-slate-500 sm:inline">
                    {saving
                      ? "Saving..."
                      : lastSavedAt
                      ? `✓ Saved ${lastSavedAt.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}`
                      : "Autosave ready"}
                  </span>

                  {currentIndex <
                  questions.length - 1 ? (
                    <button
                      onClick={goNext}
                      disabled={
                        submitting ||
                        securityLocked
                      }
                      className="group rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3 text-sm font-black text-slate-950 shadow-lg shadow-cyan-500/10 transition duration-300 hover:-translate-y-0.5 hover:shadow-cyan-500/20 disabled:opacity-50"
                    >
                      Next
                      <span className="ml-2 transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        setShowSubmitConfirm(true)
                      }
                      disabled={
                        submitting ||
                        securityLocked
                      }
                      className="rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-6 py-3 text-sm font-black text-slate-950 shadow-lg shadow-emerald-500/10 transition duration-300 hover:-translate-y-0.5 disabled:opacity-50"
                    >
                      Submit Test ✓
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          <aside className="h-fit rounded-[1.75rem] border border-white/5 bg-slate-900/70 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl lg:sticky lg:top-24">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-400">
                  Navigator
                </p>
                <h2 className="mt-1 text-lg font-black text-white">
                  Questions
                </h2>
              </div>

              <span className="rounded-full border border-slate-700 bg-slate-950/60 px-3 py-1 text-[10px] font-bold text-slate-400">
                {answeredCount}/{questions.length}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2.5">
              {questions.map(
                (question, index) => {
                  const questionId =
                    getQuestionId(question);

                  const answered =
                    isAnsweredValue(
                      answers[questionId]
                    );

                  const isCurrent =
                    index === currentIndex;

                  const isMarked =
                    Boolean(
                      reviewed[questionId]
                    );

                  return (
                    <button
                      key={
                        questionId || index
                      }
                      onClick={() =>
                        changeQuestion(index)
                      }
                      disabled={
                        submitting ||
                        securityLocked
                      }
                      className={`relative h-11 rounded-xl border text-xs font-black transition duration-200 hover:-translate-y-0.5 ${
                        isCurrent
                          ? "border-cyan-300 bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20"
                          : isMarked
                          ? "border-yellow-400/30 bg-yellow-400/10 text-yellow-300"
                          : answered
                          ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                          : "border-slate-700 bg-slate-950/60 text-slate-500 hover:border-slate-500"
                      } disabled:opacity-50`}
                    >
                      {index + 1}

                      {isMarked && (
                        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-yellow-400 text-[8px] text-slate-950">
                          ★
                        </span>
                      )}
                    </button>
                  );
                }
              )}
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2">
              <StatCard
                value={answeredCount}
                label="Answered"
                tone="emerald"
              />
              <StatCard
                value={unansweredCount}
                label="Unanswered"
                tone="slate"
              />
              <StatCard
                value={reviewedCount}
                label="Review"
                tone="amber"
              />
            </div>

            <div className="mt-4 rounded-2xl border border-white/5 bg-slate-950/50 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Completion
                </span>
                <span className="text-xs font-black text-cyan-300">
                  {answeredPercent}%
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-500"
                  style={{
                    width: `${answeredPercent}%`,
                  }}
                />
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-emerald-400/10 bg-emerald-400/5 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300">
                    Secure Session
                  </span>
                </div>

                <span className="text-[9px] font-bold text-slate-600">
                  LIVE
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">
                    Violations
                  </span>
                  <span
                    className={`font-black ${
                      securityDanger
                        ? "text-red-400"
                        : "text-yellow-300"
                    }`}
                  >
                    {violationCount}/
                    {testSecurity.maxViolations}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">
                    Fullscreen
                  </span>
                  <span
                    className={`font-black ${
                      isFullscreen
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    {isFullscreen
                      ? "ACTIVE"
                      : "REQUIRED"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">
                    Monitoring
                  </span>
                  <span className="font-black text-emerald-400">
                    ACTIVE
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleAbandon}
              disabled={
                submitting ||
                securityLocked
              }
              className="mt-6 w-full rounded-2xl border border-red-400/20 bg-red-500/5 py-3 text-sm font-bold text-red-300 transition hover:bg-red-500/10 disabled:opacity-50"
            >
              Exit Test
            </button>
          </aside>
        </div>
      </main>

      {showSubmitConfirm && !securityLocked && (
        <div className="fixed inset-0 z-[230] flex items-center justify-center bg-slate-950/80 p-6 backdrop-blur-xl">
          <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-slate-900 p-7 shadow-2xl">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10 text-2xl">
              ✓
            </div>

            <h2 className="text-2xl font-black text-white">
              Submit Test?
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              You have answered{" "}
              <strong className="text-white">
                {answeredCount}
              </strong>{" "}
              of{" "}
              <strong className="text-white">
                {questions.length}
              </strong>{" "}
              questions.
              {unansweredCount > 0
                ? ` ${unansweredCount} question${
                    unansweredCount === 1
                      ? ""
                      : "s"
                  } remain unanswered.`
                : " All questions have been answered."}
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() =>
                  setShowSubmitConfirm(false)
                }
                className="flex-1 rounded-2xl border border-slate-700 px-5 py-3 text-sm font-bold text-slate-300 transition hover:bg-slate-800"
              >
                Continue
              </button>

              <button
                onClick={() =>
                  submitTest(false)
                }
                className="flex-1 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-5 py-3 text-sm font-black text-slate-950"
              >
                Submit Now
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translate(-50%, -18px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }

        @keyframes slideProgress {
          0% {
            transform: translateX(-120%);
          }
          100% {
            transform: translateX(220%);
          }
        }
      `}</style>
    </div>
  );
};

const OptionButton = ({
  children,
  selected,
  onClick,
  index = 0,
  multiple = false,
}) => {
  const letters = ["A", "B", "C", "D", "E", "F"];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative w-full overflow-hidden rounded-2xl border p-4 text-left transition-all duration-200 ${
        selected
          ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-100 shadow-lg shadow-cyan-500/10"
          : "border-white/5 bg-slate-950/50 text-slate-300 hover:-translate-y-0.5 hover:border-cyan-400/20 hover:bg-slate-800/70"
      }`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-xs font-black transition ${
            selected
              ? "border-cyan-300/40 bg-cyan-400/20 text-cyan-200"
              : "border-slate-700 bg-slate-900 text-slate-500 group-hover:border-cyan-400/20 group-hover:text-cyan-300"
          }`}
        >
          {selected
            ? multiple
              ? "✓"
              : "●"
            : letters[index] || index + 1}
        </div>

        <span className="flex-1 text-sm font-semibold leading-6 md:text-base">
          {children}
        </span>

        <span
          className={`h-2 w-2 rounded-full transition ${
            selected
              ? "bg-cyan-300 shadow-lg shadow-cyan-300/50"
              : "bg-slate-700 group-hover:bg-slate-500"
          }`}
        />
      </div>
    </button>
  );
};

const SecurityIndicator = ({
  active,
  label,
}) => {
  return (
    <span
      className={`flex items-center gap-2 transition ${
        active
          ? "text-emerald-400"
          : "text-slate-600"
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          active
            ? "animate-pulse bg-emerald-400 shadow-lg shadow-emerald-400/50"
            : "bg-slate-700"
        }`}
      />
      {label}
    </span>
  );
};

const SecurityFeature = ({
  icon,
  title,
  value,
}) => {
  return (
    <div className="rounded-2xl border border-white/5 bg-slate-950/60 p-4 transition hover:border-cyan-400/10">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/10 text-sm text-cyan-300">
          {icon}
        </span>

        <div>
          <p className="text-xs font-black text-white">
            {title}
          </p>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({
  value,
  label,
  tone,
}) => {
  const tones = {
    emerald: "text-emerald-400 bg-emerald-400/5 border-emerald-400/10",
    amber: "text-amber-400 bg-amber-400/5 border-amber-400/10",
    slate: "text-slate-300 bg-slate-950/50 border-white/5",
  };

  return (
    <div
      className={`rounded-2xl border p-3 text-center ${tones[tone]}`}
    >
      <p className="text-lg font-black">
        {value}
      </p>
      <p className="mt-1 text-[9px] font-black uppercase tracking-wider text-slate-500">
        {label}
      </p>
    </div>
  );
};

export default MockTestSession;
