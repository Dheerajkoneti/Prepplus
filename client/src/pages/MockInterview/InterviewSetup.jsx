import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Mic,
  CheckCircle2,
  Sparkles,
  FileText,
  Layers,
  Volume2,
  Building2,
  Camera,
  X,
  Smile,
  ArrowRight,
  UploadCloud,
  Check,
  ShieldCheck,
  Wifi,
  Brain,
  Monitor,
  AlertCircle,
  Loader2,
  Server,
  Video,
  Settings2,
  BarChart3,
} from "lucide-react";
const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";
function InterviewSetup() {
  const navigate = useNavigate();
  // Keep Interview Setup flush with the browser viewport.
  // This prevents a global body/header margin or white background
  // from creating the blank strip above the dark page.
  useEffect(() => {
    const previousBodyMargin = document.body.style.margin;
    const previousBodyPadding = document.body.style.padding;
    const previousBodyBackground = document.body.style.background;
    const previousHtmlMargin = document.documentElement.style.margin;
    const previousHtmlPadding = document.documentElement.style.padding;
    const previousHtmlBackground = document.documentElement.style.background;
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.background = "#020617";
    document.documentElement.style.margin = "0";
    document.documentElement.style.padding = "0";
    document.documentElement.style.background = "#020617";
    return () => {
      document.body.style.margin = previousBodyMargin;
      document.body.style.padding = previousBodyPadding;
      document.body.style.background = previousBodyBackground;
      document.documentElement.style.margin = previousHtmlMargin;
      document.documentElement.style.padding = previousHtmlPadding;
      document.documentElement.style.background = previousHtmlBackground;
    };
  }, []);
// --------------------------------------------------
  // INTERVIEW CONFIG
  // --------------------------------------------------
  const [role, setRole] = useState("Java Developer");
  const [company, setCompany] = useState("Accenture");
  const [level, setLevel] = useState("Fresher");
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [duration, setDuration] = useState("30 Mins");
  const [language, setLanguage] = useState("English");
  const [voiceMode, setVoiceMode] = useState(true);
  const [interviewType, setInterviewType] = useState("Technical");
  const [questionCount, setQuestionCount] = useState(10);
  const [resume, setResume] = useState(null);
  const [cameraMode, setCameraMode] = useState(true);
  // --------------------------------------------------
  // UI STATES
  // --------------------------------------------------
  const [showInstructions, setShowInstructions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preflightOpen, setPreflightOpen] = useState(false);
  const [cameraStatus, setCameraStatus] = useState("checking");
  const [micStatus, setMicStatus] = useState("checking");
  const [backendStatus, setBackendStatus] = useState("checking");
  const [aiStatus, setAiStatus] = useState("checking");
  const [fullscreenStatus, setFullscreenStatus] = useState("checking");
  const [startProgress, setStartProgress] = useState(0);
  const [startMessage, setStartMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const streamRef = useRef(null);
  // --------------------------------------------------
  // BASIC API STATUS
  // --------------------------------------------------
  const checkBackend = async () => {
    try {
      setBackendStatus("checking");
      await axios.get(`${API_URL}/api/health`, {
        timeout: 5000,
      });
      setBackendStatus("ready");
      return true;
    } catch (error) {
      console.warn("Health endpoint unavailable.");
      // If your backend does not have /api/health,
      // don't immediately mark it as failed.
      try {
        const token = localStorage.getItem("token");
        await axios.get(`${API_URL}/api/mock-interview`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 5000,
        });
        setBackendStatus("ready");
        return true;
      } catch {
        setBackendStatus("error");
        return false;
      }
    }
  };
  // --------------------------------------------------
  // CAMERA CHECK
  // --------------------------------------------------
  const checkCamera = async () => {
    if (!cameraMode) {
      setCameraStatus("disabled");
      return true;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraStatus("error");
      setErrorMessage(
        "Camera access is not supported by this browser. Use Chrome or Edge on localhost/HTTPS."
      );
      return false;
    }
    try {
      setCameraStatus("checking");
      // Release an old preview stream before requesting a new one.
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      streamRef.current = stream;
      const videoTrack = stream.getVideoTracks()[0];
      if (!videoTrack || videoTrack.readyState !== "live") {
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        throw new Error("Camera stream was created but the video track is not live.");
      }
      setCameraStatus("ready");
      return true;
    } catch (error) {
      console.error("Camera permission/device error:", error);
      let message = "Unable to access the camera.";
      if (error?.name === "NotAllowedError" || error?.name === "PermissionDeniedError") {
        message = "Camera permission was denied. Allow camera access in browser site settings and try again.";
      } else if (error?.name === "NotFoundError") {
        message = "No camera was found. Connect a webcam and try again.";
      } else if (error?.name === "NotReadableError" || error?.name === "TrackStartError") {
        message = "Camera is already being used by another app or tab. Close Teams, Zoom, Meet, OBS, etc. and try again.";
      } else if (error?.name === "SecurityError") {
        message = "Camera access is blocked by browser security. Use localhost or HTTPS.";
      }
      setCameraStatus("error");
      setErrorMessage(message);
      return false;
    }
  };
  // MICROPHONE CHECK
  // --------------------------------------------------
  const checkMicrophone = async () => {
    if (!voiceMode) {
      setMicStatus("disabled");
      return true;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setMicStatus("error");
      setErrorMessage(
        "Microphone access is not supported by this browser. Use Chrome or Edge on localhost/HTTPS."
      );
      return false;
    }
    try {
      setMicStatus("checking");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      const audioTrack = stream.getAudioTracks()[0];
      stream.getTracks().forEach((track) => track.stop());
      if (!audioTrack) {
        throw new Error("Microphone stream was created without an audio track.");
      }

      setMicStatus("ready");

      return true;

    } catch (error) {

      console.error("Microphone permission/device error:", error);

      let message = "Unable to access the microphone.";

      if (error?.name === "NotAllowedError" || error?.name === "PermissionDeniedError") {

        message = "Microphone permission was denied. Allow microphone access in browser site settings and try again.";

      } else if (error?.name === "NotFoundError") {

        message = "No microphone was found. Connect a microphone and try again.";

      } else if (error?.name === "NotReadableError" || error?.name === "TrackStartError") {

        message = "Microphone is already being used by another app. Close Teams, Zoom, Meet, etc. and try again.";

      }

      setMicStatus("error");

      setErrorMessage(message);

      return false;

    }

  };

  // FULLSCREEN CHECK

  // --------------------------------------------------

  const checkFullscreen = async () => {

    try {

      if (document.fullscreenElement) {

        setFullscreenStatus("ready");

        return true;

      }

      if (!document.documentElement?.requestFullscreen) {

        setFullscreenStatus("warning");

        return true;

      }

      await document.documentElement.requestFullscreen();

      setFullscreenStatus("ready");

      return true;

    } catch (error) {

      console.warn("Fullscreen unavailable:", error);

      // Fullscreen is a browser permission/gesture feature. It must never

      // block the interview if the browser refuses it.

      setFullscreenStatus("warning");

      return true;

    }

  };

  // AI CHECK

  // --------------------------------------------------

  const checkAI = async (backendReady = null) => {

    try {

      setAiStatus("checking");

      const ready =

        backendReady !== null

          ? backendReady

          : await checkBackend();

      setAiStatus(ready ? "ready" : "error");

      return ready;

    } catch (error) {

      console.error("AI readiness check failed:", error);

      setAiStatus("error");

      return false;

    }

  };

  // RELEASE MEDIA

  // --------------------------------------------------

  const releaseMedia = () => {

    if (streamRef.current) {

      streamRef.current.getTracks().forEach((track) => {

        track.stop();

      });

      streamRef.current = null;

    }

  };

  useEffect(() => {

    return () => {

      releaseMedia();

    };

  }, []);

  // --------------------------------------------------

  // OPEN START FLOW

  // --------------------------------------------------

  const handleStartClick = async () => {

    if (loading) return;

    setErrorMessage("");

    setPreflightOpen(true);

    setCameraStatus(cameraMode ? "checking" : "disabled");

    setMicStatus(voiceMode ? "checking" : "disabled");

    setBackendStatus("checking");

    setAiStatus("checking");

    // Fullscreen cannot be requested here because this check is asynchronous

    // and browsers only allow fullscreen from a direct user gesture. The

    // actual Start button below requests fullscreen.

    setFullscreenStatus("warning");

    try {

      const backendReady = await checkBackend();

      setAiStatus(backendReady ? "ready" : "error");

      const cameraReady = cameraMode ? await checkCamera() : true;

      const micReady = voiceMode ? await checkMicrophone() : true;

      if (backendReady && cameraReady && micReady) {

        setErrorMessage("");

      }

    } catch (error) {

      console.error("Preflight check failed:", error);

      setAiStatus("error");

      setErrorMessage(

        error?.message || "Unable to complete the interview readiness check."

      );

    }

  };

  // START INTERVIEW

  // --------------------------------------------------

  const executeStartInterview = async () => {

    try {

      setErrorMessage("");

      setLoading(true);

      setStartProgress(5);

      const token = localStorage.getItem("token");

      if (!token) {

        throw new Error("Authentication token not found.");

      }

      // ----------------------------------------------

      // 1. CHECK CAMERA

      // ----------------------------------------------

      if (cameraMode && cameraStatus !== "ready") {

        const cameraReady = await checkCamera();

        if (!cameraReady) {

          throw new Error(

            "Camera permission is required for this interview."

          );

        }

      }

      setStartProgress(20);

      setStartMessage("Checking interview environment...");

      // ----------------------------------------------

      // 2. CHECK MICROPHONE

      // ----------------------------------------------

      if (voiceMode && micStatus !== "ready") {

        const micReady = await checkMicrophone();

        if (!micReady) {

          throw new Error(

            "Microphone permission is required for voice interviews."

          );

        }

      }

      setStartProgress(35);

      setStartMessage("Connecting to AI interview engine...");

      // ----------------------------------------------

      // 3. BACKEND

      // ----------------------------------------------

      const backendReady = await checkBackend();

      if (!backendReady) {

        throw new Error(

          "Unable to connect to the interview server."

        );

      }

      setAiStatus("ready");

      setStartProgress(50);

      setStartMessage("Generating personalized interview...");

      // ----------------------------------------------

      // 4. FORM DATA

      // ----------------------------------------------

      const formData = new FormData();

      formData.append("role", role);

      formData.append("company", company);

      formData.append("level", level);

      formData.append("difficulty", difficulty);

      formData.append("duration", duration);

      formData.append("language", language);

      formData.append("voiceMode", String(voiceMode));

      formData.append("cameraMode", String(cameraMode));

      formData.append("interviewType", interviewType);

      formData.append("questionCount", String(questionCount));

      if (resume) {

        formData.append("resume", resume);

      }

      // ----------------------------------------------

      // 5. START BACKEND INTERVIEW

      // ----------------------------------------------

      const response = await axios.post(

        `${API_URL}/api/mock-interview/start`,

        formData,

        {

          headers: {

            Authorization: `Bearer ${token}`,

          },

          timeout: 120000,

        }

      );

      setStartProgress(75);

      setStartMessage("Interview environment created...");

      const interview = response.data?.interview;

      const questions = response.data?.questions || [];

      if (!interview?._id) {

        throw new Error(

          "Interview was created but no interview ID was returned."

        );

      }

      if (!questions.length) {

        throw new Error(

          "No interview questions were generated."

        );

      }

      // ----------------------------------------------

      // 6. SAVE SESSION

      // ----------------------------------------------

      localStorage.setItem(

        "mockInterviewId",

        interview._id

      );

      localStorage.setItem(

        "questions",

        JSON.stringify(questions)

      );

      localStorage.setItem(

        "mockInterviewConfig",

        JSON.stringify({

          role,

          company,

          level,

          difficulty,

          duration,

          language,

          voiceMode,

          cameraMode,

          interviewType,

          questionCount,

        })

      );

      setStartProgress(100);

      setStartMessage("Interview ready.");

      await new Promise((resolve) =>

        setTimeout(resolve, 500)

      );

      releaseMedia();

      navigate(

        `/mock-interview/session/${interview._id}`,

        {

          state: {

            interviewId: interview._id,

            questions,

          },

        }

      );

    } catch (error) {

      console.error("START INTERVIEW ERROR:", error);

      const message =

        error.response?.data?.message ||

        error.message ||

        "Failed to start interview.";

      setErrorMessage(message);

      setStartMessage("Unable to start interview.");

      setStartProgress(0);

    } finally {

      setLoading(false);

    }

  };

  // --------------------------------------------------

  // STATUS COMPONENT

  // --------------------------------------------------

  const StatusItem = ({

    icon: Icon,

    title,

    status,

  }) => {

    const isReady = status === "ready";

    const isError = status === "error";

    const isDisabled = status === "disabled";

    const isWarning = status === "warning";

    return (

      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">

        <div className="flex items-center gap-3">

          <div

            className={`w-9 h-9 rounded-xl flex items-center justify-center ${

              isReady

                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"

                : isError

                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"

                : "bg-sky-500/10 text-sky-400 border border-sky-500/20"

            }`}

          >

            <Icon size={18} />

          </div>

          <span className="text-sm font-semibold text-slate-200">

            {title}

          </span>

        </div>

        {isReady ? (

          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">

            <CheckCircle2 size={15} />

            Ready

          </div>

        ) : isError ? (

          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400">

            <AlertCircle size={15} />

            Failed

          </div>

        ) : isDisabled ? (

          <span className="text-xs text-slate-500 font-semibold">

            Disabled

          </span>

        ) : isWarning ? (

          <span className="text-xs text-amber-400 font-semibold">

            Optional

          </span>

        ) : (

          <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-400">

            <Loader2 size={14} className="animate-spin" />

            Checking

          </div>

        )}

      </div>

    );

  };

  // --------------------------------------------------

  // RENDER

  // --------------------------------------------------

  return (

    <main

      className="fixed inset-0 z-[60] w-full min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden overflow-y-auto relative font-sans"

      style={{

        margin: 0,

        padding: 0,

        backgroundColor: "#020617",

      }}

    >

      {/* Background */}

      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-sky-900/20 via-slate-950 to-slate-950 pointer-events-none" />

      <div className="absolute top-1/4 left-10 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse" />

      <div className="absolute bottom-1/4 right-10 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse" />

      {/* ===================================================== */}

      {/* PRE-FLIGHT MODAL */}

      {/* ===================================================== */}

      <AnimatePresence>

        {preflightOpen && (

          <motion.div

            initial={{ opacity: 0 }}

            animate={{ opacity: 1 }}

            exit={{ opacity: 0 }}

            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/85 backdrop-blur-xl p-4"

          >

            <motion.div

              initial={{ scale: 0.94, y: 20 }}

              animate={{ scale: 1, y: 0 }}

              className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-[2rem] shadow-2xl p-7"

            >

              {!loading ? (

                <>

                  {/* Header */}

                  <div className="flex items-center justify-between mb-6">

                    <div>

                      <div className="flex items-center gap-3">

                        <div className="w-11 h-11 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center">

                          <ShieldCheck

                            className="text-sky-400"

                            size={22}

                          />

                        </div>

                        <div>

                          <h2 className="text-xl font-extrabold text-white">

                            Interview Readiness Check

                          </h2>

                          <p className="text-xs text-slate-400">

                            Checking your interview environment

                          </p>

                        </div>

                      </div>

                    </div>

                    <button

                      onClick={() => {

                        releaseMedia();

                        setPreflightOpen(false);

                      }}

                      className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white"

                    >

                      <X size={20} />

                    </button>

                  </div>

                  {/* Status */}

                  <div className="space-y-3">

                    <StatusItem

                      icon={Server}

                      title="Interview Server"

                      status={backendStatus}

                    />

                    <StatusItem

                      icon={Brain}

                      title="AI Interview Engine"

                      status={aiStatus}

                    />

                    <StatusItem

                      icon={Camera}

                      title="Camera"

                      status={cameraStatus}

                    />

                    <StatusItem

                      icon={Mic}

                      title="Microphone"

                      status={micStatus}

                    />

                    <StatusItem

                      icon={Monitor}

                      title="Fullscreen"

                      status={fullscreenStatus}

                    />

                  </div>

                  {/* Error */}

                  {errorMessage && (

                    <div className="mt-5 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">

                      <div className="flex gap-3">

                        <AlertCircle size={18} className="shrink-0 mt-0.5" />

                        <span>{errorMessage}</span>

                      </div>

                      <div className="flex flex-wrap gap-2 mt-3">

                        {(cameraStatus === "error" || micStatus === "error") && (

                          <button

                            type="button"

                            onClick={async () => {

                              setErrorMessage("");

                              if (cameraMode) await checkCamera();

                              if (voiceMode) await checkMicrophone();

                            }}

                            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-bold hover:border-sky-500 transition"

                          >

                            Retry Camera & Mic

                          </button>

                        )}

                        {backendStatus === "error" && (

                          <button

                            type="button"

                            onClick={async () => {

                              setErrorMessage("");

                              const ok = await checkBackend();

                              setAiStatus(ok ? "ready" : "error");

                            }}

                            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-bold hover:border-sky-500 transition"

                          >

                            Retry Server

                          </button>

                        )}

                      </div>

                    </div>

                  )}

                  {/* Configuration summary */}

                  <div className="grid grid-cols-2 gap-3 mt-5">

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">

                      <p className="text-[10px] uppercase text-slate-500">

                        Role

                      </p>

                      <p className="text-sm font-bold text-white mt-1">

                        {role}

                      </p>

                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">

                      <p className="text-[10px] uppercase text-slate-500">

                        Company

                      </p>

                      <p className="text-sm font-bold text-white mt-1">

                        {company}

                      </p>

                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">

                      <p className="text-[10px] uppercase text-slate-500">

                        Questions

                      </p>

                      <p className="text-sm font-bold text-white mt-1">

                        {questionCount}

                      </p>

                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">

                      <p className="text-[10px] uppercase text-slate-500">

                        Difficulty

                      </p>

                      <p className="text-sm font-bold text-white mt-1">

                        {difficulty}

                      </p>

                    </div>

                  </div>

                  <button

                    type="button"

                    disabled={loading}

                    onClick={async () => {

                      if (loading) return;

                      setErrorMessage("");

                      await checkFullscreen();

                      const backendReady =

                        backendStatus === "ready"

                          ? true

                          : await checkBackend();

                      const cameraReady =

                        !cameraMode ||

                        cameraStatus === "ready" ||

                        (await checkCamera());

                      const micReady =

                        !voiceMode ||

                        micStatus === "ready" ||

                        (await checkMicrophone());

                      if (!backendReady) {

                        setAiStatus("error");

                        setErrorMessage(

                          "Interview server is not reachable. Make sure your backend is running on " +

                            API_URL

                        );

                        return;

                      }

                      setAiStatus("ready");

                      if (!cameraReady || !micReady) {

                        setErrorMessage(

                          "Please allow the required camera/microphone permissions and try again."

                        );

                        return;

                      }

                      await executeStartInterview();

                    }}

                    className="mt-6 w-full py-4 rounded-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 text-white font-extrabold flex items-center justify-center gap-2 hover:scale-[1.01] transition"

                  >

                    <Sparkles size={19} />

                    Start Real-Time AI Interview

                    <ArrowRight size={18} />

                  </button>

                </>

              ) : (

                <>

                  {/* Loading */}

                  <div className="py-8 text-center">

                    <div className="relative mx-auto w-24 h-24 mb-7">

                      <div className="absolute inset-0 rounded-full bg-sky-500/10 animate-ping" />

                      <div className="relative w-24 h-24 rounded-full bg-slate-950 border border-sky-500/30 flex items-center justify-center">

                        <Brain

                          size={38}

                          className="text-sky-400 animate-pulse"

                        />

                      </div>

                    </div>

                    <h2 className="text-2xl font-extrabold text-white">

                      Preparing Your Interview

                    </h2>

                    <p className="text-slate-400 text-sm mt-2">

                      {startMessage ||

                        "Connecting to AI..."}

                    </p>

                    {/* Progress */}

                    <div className="mt-8">

                      <div className="flex justify-between text-xs mb-2">

                        <span className="text-slate-400">

                          Preparation

                        </span>

                        <span className="text-sky-400 font-bold">

                          {startProgress}%

                        </span>

                      </div>

                      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">

                        <motion.div

                          animate={{

                            width: `${startProgress}%`,

                          }}

                          className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-full"

                        />

                      </div>

                    </div>

                    <div className="mt-7 space-y-3 text-left">

                      <div className="flex items-center gap-3 text-sm">

                        <CheckCircle2 className="text-emerald-400" size={17} />

                        <span className="text-slate-300">

                          Validating interview configuration

                        </span>

                      </div>

                      <div className="flex items-center gap-3 text-sm">

                        {startProgress >= 35 ? (

                          <CheckCircle2

                            className="text-emerald-400"

                            size={17}

                          />

                        ) : (

                          <Loader2

                            className="text-sky-400 animate-spin"

                            size={17}

                          />

                        )}

                        <span className="text-slate-300">

                          Connecting to AI engine

                        </span>

                      </div>

                      <div className="flex items-center gap-3 text-sm">

                        {startProgress >= 75 ? (

                          <CheckCircle2

                            className="text-emerald-400"

                            size={17}

                          />

                        ) : (

                          <Loader2

                            className="text-sky-400 animate-spin"

                            size={17}

                          />

                        )}

                        <span className="text-slate-300">

                          Generating personalized questions

                        </span>

                      </div>

                    </div>

                  </div>

                </>

              )}

            </motion.div>

          </motion.div>

        )}

      </AnimatePresence>

      {/* ===================================================== */}

      {/* MAIN PAGE */}

      {/* ===================================================== */}

      <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start px-4 sm:px-6 lg:px-8 py-8 lg:py-10">

        {/* LEFT */}

        <motion.div

          initial={{ opacity: 0, x: -40 }}

          animate={{ opacity: 1, x: 0 }}

          transition={{ duration: 0.6 }}

          className="lg:col-span-6 flex flex-col justify-center space-y-8"

        >

          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs sm:text-sm font-semibold w-fit">

            <Sparkles

              size={16}

              className="text-sky-400"

            />

            Next-Gen AI Assessment Platform

          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">

            AI Mock Interview

            <br />

            <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">

              Simulator & Evaluator

            </span>

          </h1>

          <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-xl">

            Practice realistic technical and HR interviews with

            AI-generated questions, voice interaction,

            real-time answer evaluation and detailed performance

            reports.

          </p>

          {/* AI CARD */}

          <div className="p-7 rounded-[2rem] bg-slate-900/60 border border-slate-800/80 backdrop-blur-2xl shadow-2xl relative overflow-hidden">

            <div className="flex items-center gap-4 mb-6">

              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-purple-600 flex items-center justify-center">

                <Bot

                  size={30}

                  className="text-white"

                />

              </div>

              <div>

                <h3 className="font-extrabold text-xl text-white">

                  Nova AI Interviewer

                </h3>

                <p className="text-xs sm:text-sm text-emerald-400 flex items-center gap-2 font-medium mt-0.5">

                  <span className="w-2 h-2 rounded-full bg-emerald-400" />

                  Online & Prepared for {company}

                </p>

              </div>

            </div>

            <div className="grid grid-cols-2 gap-4 pt-5 border-t border-slate-800">

              <Feature

                icon={CheckCircle2}

                text="Real-time Feedback"

              />

              <Feature

                icon={Volume2}

                text="Voice Analysis"

              />

              <Feature

                icon={CheckCircle2}

                text="AI Questions"

              />

              <Feature

                icon={BarChart3}

                text="Performance Report"

              />

            </div>

          </div>

        </motion.div>

        {/* RIGHT */}

        <motion.div

          initial={{ opacity: 0, x: 40 }}

          animate={{ opacity: 1, x: 0 }}

          transition={{ duration: 0.6 }}

          className="lg:col-span-6"

        >

          <div className="w-full bg-slate-900/60 backdrop-blur-2xl border border-slate-800/80 shadow-2xl p-8 sm:p-10 rounded-[2.5rem]">

            {/* HEADER */}

            <div className="flex items-center justify-between mb-8 pb-5 border-b border-slate-800">

              <div className="flex items-center gap-3.5">

                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">

                  <Settings2 size={24} />

                </div>

                <div>

                  <h2 className="text-2xl font-extrabold text-white">

                    Configure Interview

                  </h2>

                  <p className="text-xs sm:text-sm text-slate-400">

                    Customize your AI assessment

                  </p>

                </div>

              </div>

              <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-sky-500/20 to-purple-500/20 text-sky-300 border border-sky-500/30">

                {difficulty}

              </span>

            </div>

            <div className="space-y-6">

              {/* ROLE + COMPANY */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                <SelectField

                  label="Interview Track"

                  icon={Layers}

                  value={role}

                  setValue={setRole}

                  options={[

                    "Java Developer",

                    "Spring Boot",

                    "SQL Developer",

                    "Full Stack Developer",

                    "React Developer",

                  ]}

                />

                <SelectField

                  label="Target Company"

                  icon={Building2}

                  value={company}

                  setValue={setCompany}

                  options={[

                    "Accenture",

                    "Cognizant",

                    "TCS",

                    "Infosys",

                    "Wipro",

                    "Capgemini",

                    "Google",

                  ]}

                />

              </div>

              {/* TYPE */}

              <SelectField

                label="Interview Type"

                icon={Brain}

                value={interviewType}

                setValue={setInterviewType}

                options={[

                  "Technical",

                  "HR",

                  "Behavioral",

                  "Technical + HR",

                ]}

              />

              {/* DIFFICULTY */}

              <SelectField

                label="Difficulty Level"

                icon={Sparkles}

                value={difficulty}

                setValue={setDifficulty}

                options={[

                  "Beginner",

                  "Intermediate",

                  "Advanced",

                  "Expert",

                ]}

              />

              {/* QUESTIONS + DURATION */}

              <div className="grid grid-cols-2 gap-4">

                <SelectField

                  label="Questions"

                  icon={Layers}

                  value={questionCount}

                  setValue={(value) =>

                    setQuestionCount(Number(value))

                  }

                  options={[5, 10, 15, 20]}

                />

                <SelectField

                  label="Duration"

                  icon={Monitor}

                  value={duration}

                  setValue={setDuration}

                  options={[

                    "15 Mins",

                    "30 Mins",

                    "45 Mins",

                    "60 Mins",

                  ]}

                />

              </div>

              {/* RESUME */}

              <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800">

                <div className="flex items-center justify-between gap-4">

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-white">
                        Upload Resume
                        <span className="text-xs text-slate-400 font-normal">
                          {" "}
                          (Optional)
                        </span>
                      </p>
                      <p className="text-xs text-slate-400">
                        AI can personalize questions
                      </p>
                    </div>
                  </div>
                  <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-sky-500 text-sky-400 text-xs font-semibold cursor-pointer">
                    <UploadCloud size={16} />
                    <span>
                      {resume
                        ? resume.name.slice(0, 14) + "..."
                        : "Choose File"}
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) =>
                        setResume(e.target.files?.[0] || null)
                      }
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              {/* OPTIONS */}
              <div className="grid grid-cols-2 gap-4">
                <Toggle
                  icon={Camera}
                  title="Camera Proctoring"
                  enabled={cameraMode}
                  setEnabled={setCameraMode}
                />
                <Toggle
                  icon={Mic}
                  title="Voice Interview"
                  enabled={voiceMode}
                  setEnabled={setVoiceMode}
                />
              </div>
              {/* META */}
              <div className="flex items-center justify-between text-xs text-slate-400 px-2">
                <span>
                  Total Questions:{" "}
                  <strong className="text-white">
                    {questionCount}
                  </strong>
                </span>
                <span>
                  Estimated Time:{" "}
                  <strong className="text-white">
                    {duration}
                  </strong>
                </span>
              </div>
              {/* START */}
              <button
                onClick={handleStartClick}
                disabled={loading}
                className="relative w-full py-4 rounded-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 text-white font-extrabold flex items-center justify-center gap-3 shadow-2xl hover:scale-[1.01] transition disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2
                      size={20}
                      className="animate-spin"
                    />
                    Preparing Interview...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Start AI Interview
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
// ======================================================
// SMALL COMPONENTS
// ======================================================
function Feature({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-300 font-medium">
      <Icon size={18} className="text-sky-400" />
      <span>{text}</span>
    </div>
  );
}
function SelectField({
  label,
  icon: Icon,
  value,
  setValue,
  options,
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center gap-2 uppercase tracking-wider">
        <Icon size={15} className="text-sky-400" />
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full px-4 py-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-white text-sm font-medium focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all cursor-pointer"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
function Toggle({
  icon: Icon,
  title,
  enabled,
  setEnabled,
}) {
  return (
    <button
      type="button"
      onClick={() => setEnabled(!enabled)}
      className={`p-4 rounded-2xl border text-left transition ${
        enabled
          ? "bg-sky-500/10 border-sky-500/30"
          : "bg-slate-950 border-slate-800"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon
            size={19}
            className={
              enabled
                ? "text-sky-400"
                : "text-slate-500"
            }
          />
          <span className="text-sm font-semibold text-slate-200">
            {title}
          </span>
        </div>
        <div
          className={`w-9 h-5 rounded-full p-0.5 transition ${
            enabled
              ? "bg-sky-500"
              : "bg-slate-700"
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full bg-white transition ${
              enabled ? "translate-x-4" : ""
            }`}
          />
        </div>
      </div>
    </button>
  );
}
export default InterviewSetup;
