import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import axios from "axios";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  Mic,
  MicOff,
  Camera,
  Volume2,
  VolumeX,
  Send,
  Clock,
  ChevronRight,
  Sparkles,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Video,
  Maximize2,
  Minimize2,
  Lightbulb,
  X,
  Lock,
  Brain,
  ShieldCheck,
  Eye,
  Users,
  Wifi,
  WifiOff,
  Loader2,
  Trophy,
  RefreshCw,
  MessageSquare,
  Bot,
  Radio,
  StopCircle,
  LogOut,
  Check,
} from "lucide-react";

import * as faceapi from "face-api.js";

/* =========================================================
   CONFIGURATION
========================================================= */

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const MAX_SECURITY_WARNINGS = 3;

const FACE_MISS_LIMIT = 3;

const FACE_CHECK_INTERVAL = 1500;

const CLIENT_SECURITY_COOLDOWN = 3000;

const QUESTION_TIME = 60;


/* =========================================================
   API HELPER
========================================================= */

const getAuthToken = () => {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken") ||
    ""
  );
};

const apiRequest = async (config) => {
  const token = getAuthToken();

  const headers = {
    ...(config.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return axios({
    ...config,
    headers,
  });
};


/* =========================================================
   MAIN COMPONENT
========================================================= */

function MockInterview() {
  const navigate = useNavigate();

  const { id } = useParams();


  /* =======================================================
     REFS
  ======================================================= */

  const videoRef = useRef(null);

  const streamRef = useRef(null);

  const faceTimerRef = useRef(null);

  const speechRecognitionRef = useRef(null);

  const speechSynthesisRef = useRef(null);

  const securityLastSentRef = useRef({});

  const finishingRef = useRef(false);

  const mountedRef = useRef(true);

  const fullscreenRequestRef = useRef(false);

  const faceMissCountRef = useRef(0);

  const cameraEnabledRef = useRef(false);

  const microphoneEnabledRef = useRef(false);

  const currentQuestionRef = useRef(0);

  const interviewRef = useRef(null);


  /* =======================================================
     INTERVIEW STATE
  ======================================================= */

  const [loading, setLoading] = useState(true);

  const [loadingError, setLoadingError] = useState("");

  const [interview, setInterview] = useState(null);

  const [questions, setQuestions] = useState([]);

  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [answer, setAnswer] = useState("");

  const [answersMap, setAnswersMap] = useState({});

  const [submitting, setSubmitting] = useState(false);

  const [finishing, setFinishing] = useState(false);

  const [timer, setTimer] = useState(QUESTION_TIME);

  const [showTip, setShowTip] = useState(false);

  const [tip, setTip] = useState(
    "Explain the concept clearly, give a practical example, and mention important trade-offs where appropriate."
  );


  /* =======================================================
     MEDIA STATE
  ======================================================= */

  const [cameraReady, setCameraReady] = useState(false);

  const [microphoneReady, setMicrophoneReady] =
    useState(false);

  const [mediaLoading, setMediaLoading] =
    useState(false);

  const [mediaError, setMediaError] =
    useState("");

  const [faceStatus, setFaceStatus] =
    useState("Searching");

  const [faceCount, setFaceCount] = useState(0);

  const [faceModelLoading, setFaceModelLoading] =
    useState(false);

  const [faceModelReady, setFaceModelReady] =
    useState(false);


  /* =======================================================
     SPEECH STATE
  ======================================================= */

  const [isListening, setIsListening] =
    useState(false);

  const [speechSupported, setSpeechSupported] =
    useState(false);

  const [isSpeaking, setIsSpeaking] =
    useState(false);


  /* =======================================================
     AI STATE
  ======================================================= */

  const [aiInterviewerState, setAiInterviewerState] =
    useState("ready");

  const [liveEvaluation, setLiveEvaluation] =
    useState(null);

  const [showLiveEvaluation, setShowLiveEvaluation] =
    useState(false);

  const [evaluationAvailable, setEvaluationAvailable] =
    useState(false);


  /* =======================================================
     SECURITY STATE
  ======================================================= */

  const [security, setSecurity] = useState({
    violationCount: 0,
    status: "Secure",
    tabSwitches: 0,
    fullscreenExits: 0,
    faceWarnings: 0,
    multipleFaceWarnings: 0,
    cameraDisconnects: 0,
    microphoneDisconnects: 0,
    copyPasteAttempts: 0,
  });


  /* =======================================================
     FULLSCREEN STATE
  ======================================================= */

  const [isFullscreen, setIsFullscreen] =
    useState(false);


  /* =======================================================
     EXIT MODAL
  ======================================================= */

  const [showExitModal, setShowExitModal] =
    useState(false);


  /* =======================================================
     QUESTION REFS
  ======================================================= */

  const currentQuestionData =
    questions[currentQuestion];

  currentQuestionRef.current =
    currentQuestion;

  interviewRef.current =
    interview;


  /* =======================================================
     SAFE MESSAGE
  ======================================================= */

  const safeMessage = (error) => {
    return (
      error?.response?.data?.message ||
      error?.message ||
      "Something went wrong."
    );
  };


  /* =======================================================
     LOAD INTERVIEW
  ======================================================= */

  const loadInterview = useCallback(async () => {
    if (!id) {
      setLoading(false);
      setLoadingError("Interview ID is missing.");
      return;
    }

    try {
      setLoading(true);
      setLoadingError("");

      console.log("Loading interview:", id);

      const response = await apiRequest({
        method: "GET",
        url: `${API_URL}/api/mock-interview/${id}`,
      });

      console.log(
        "Interview response:",
        response.data
      );

      const data =
        response.data?.interview ||
        response.data?.data ||
        response.data;

      if (!data) {
        throw new Error(
          "Interview data was not returned."
        );
      }

      setInterview(data);

      const generatedQuestions =
        Array.isArray(data.questions)
          ? data.questions
          : [];

      if (!generatedQuestions.length) {
        throw new Error(
          "No interview questions were found."
        );
      }

      setQuestions(generatedQuestions);

      const savedAnswers = {};

      if (Array.isArray(data.answers)) {
        data.answers.forEach((item) => {
          if (
            typeof item.questionIndex ===
            "number"
          ) {
            savedAnswers[
              item.questionIndex
            ] = item.answer || "";
          }
        });
      }

      setAnswersMap(savedAnswers);

      const initialIndex =
        Number.isInteger(data.currentQuestion)
          ? Math.min(
              Math.max(data.currentQuestion, 0),
              generatedQuestions.length - 1
            )
          : 0;

      setCurrentQuestion(initialIndex);

      setAnswer(
        savedAnswers[initialIndex] || ""
      );

      setTimer(QUESTION_TIME);

      if (data.security) {
        setSecurity((prev) => ({
          ...prev,
          ...data.security,
        }));
      }

      console.log(
        "Interview loaded successfully."
      );
    } catch (error) {
      console.error(
        "Failed to load interview:",
        error
      );

      setLoadingError(
        safeMessage(error)
      );
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [id]);


  /* =======================================================
     LOAD FACE MODELS
  ======================================================= */

  const loadFaceModels = useCallback(
    async () => {
      if (faceModelReady) {
        return true;
      }

      try {
        setFaceModelLoading(true);

        console.log(
          "Loading face detection model..."
        );

        const MODEL_URL = "/models";

        await faceapi.nets.tinyFaceDetector.loadFromUri(
          MODEL_URL
        );

        console.log(
          "Face model loaded successfully."
        );

        if (mountedRef.current) {
          setFaceModelReady(true);
          setFaceModelLoading(false);
        }

        return true;
      } catch (error) {
        console.error(
          "Face model loading failed:",
          error
        );

        if (mountedRef.current) {
          setFaceModelLoading(false);
          setFaceStatus(
            "Face model unavailable"
          );
        }

        return false;
      }
    },
    [faceModelReady]
  );


  /* =======================================================
     START FACE DETECTION
  ======================================================= */

  const startFaceDetection = useCallback(() => {
    if (faceTimerRef.current) {
      clearInterval(faceTimerRef.current);
      faceTimerRef.current = null;
    }

    if (!videoRef.current) {
      return;
    }

    if (!faceModelReady) {
      return;
    }

    faceTimerRef.current = setInterval(
      async () => {
        const video =
          videoRef.current;

        if (
          !video ||
          video.readyState < 2 ||
          video.videoWidth === 0
        ) {
          return;
        }

        try {
          const detections =
            await faceapi.detectAllFaces(
              video,
              new faceapi.TinyFaceDetectorOptions({
                inputSize: 320,
                scoreThreshold: 0.35,
              })
            );

          if (!mountedRef.current) {
            return;
          }

          const count =
            detections.length;

          setFaceCount(count);

          if (count === 0) {
            faceMissCountRef.current += 1;

            if (
              faceMissCountRef.current >=
              FACE_MISS_LIMIT
            ) {
              setFaceStatus(
                "Face not detected"
              );

              sendSecurityEvent(
                "FACE_NOT_DETECTED",
                "Candidate face was not detected."
              );

              faceMissCountRef.current = 0;
            } else {
              setFaceStatus(
                "Checking..."
              );
            }
          } else if (count === 1) {
            faceMissCountRef.current = 0;

            setFaceStatus(
              "Face detected"
            );
          } else {
            faceMissCountRef.current = 0;

            setFaceStatus(
              "Multiple faces detected"
            );

            sendSecurityEvent(
              "MULTIPLE_FACE_DETECTED",
              "Multiple faces were detected."
            );
          }
        } catch (error) {
          console.error(
            "Face detection error:",
            error
          );
        }
      },
      FACE_CHECK_INTERVAL
    );
  }, [faceModelReady]);


  /* =======================================================
     STOP FACE DETECTION
  ======================================================= */

  const stopFaceDetection = useCallback(() => {
    if (faceTimerRef.current) {
      clearInterval(faceTimerRef.current);
      faceTimerRef.current = null;
    }

    faceMissCountRef.current = 0;
  }, []);


  /* =======================================================
     CONNECT CAMERA + MICROPHONE
  ======================================================= */

  const startMedia = useCallback(
    async () => {
      try {
        setMediaLoading(true);
        setMediaError("");

        console.log(
          "REQUESTING CAMERA + MICROPHONE..."
        );

        if (
          !navigator.mediaDevices ||
          !navigator.mediaDevices
            .getUserMedia
        ) {
          throw new Error(
            "Your browser does not support camera and microphone access."
          );
        }

        if (streamRef.current) {
          streamRef.current
            .getTracks()
            .forEach((track) => {
              track.stop();
            });

          streamRef.current = null;
        }

        const stream =
          await navigator.mediaDevices.getUserMedia(
            {
              video: {
                width: {
                  ideal: 1280,
                },
                height: {
                  ideal: 720,
                },
                facingMode: "user",
              },
              audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
              },
            }
          );

        console.log(
          "MEDIA STREAM RECEIVED:",
          stream
        );

        streamRef.current = stream;

        const videoTracks =
          stream.getVideoTracks();

        const audioTracks =
          stream.getAudioTracks();

        const hasVideo =
          videoTracks.length > 0 &&
          videoTracks[0].readyState ===
            "live";

        const hasAudio =
          audioTracks.length > 0 &&
          audioTracks[0].readyState ===
            "live";

        cameraEnabledRef.current =
          hasVideo;

        microphoneEnabledRef.current =
          hasAudio;

        setCameraReady(hasVideo);

        setMicrophoneReady(hasAudio);

        if (!hasVideo) {
          setMediaError(
            "Camera could not be started."
          );
        }

        if (!hasAudio) {
          setMediaError(
            "Microphone could not be started."
          );
        }

        if (videoRef.current) {
          const video =
            videoRef.current;

          video.srcObject = stream;

          video.muted = true;

          video.autoplay = true;

          video.playsInline = true;

          try {
            await video.play();

            console.log(
              "VIDEO STREAM PLAYING",
              video.videoWidth,
              video.videoHeight
            );
          } catch (playError) {
            console.warn(
              "Video autoplay failed:",
              playError
            );
          }
        }

        videoTracks.forEach(
          (track) => {
            track.onended = () => {
              console.warn(
                "Camera track ended."
              );

              cameraEnabledRef.current =
                false;

              setCameraReady(false);

              sendSecurityEvent(
                "CAMERA_DISCONNECTED",
                "Camera was disconnected."
              );
            };

            track.onmute = () => {
              console.warn(
                "Camera track muted."
              );
            };

            track.onunmute = () => {
              console.log(
                "Camera track unmuted."
              );
            };
          }
        );

        audioTracks.forEach(
          (track) => {
            track.onended = () => {
              console.warn(
                "Microphone track ended."
              );

              microphoneEnabledRef.current =
                false;

              setMicrophoneReady(false);

              sendSecurityEvent(
                "MICROPHONE_DISCONNECTED",
                "Microphone was disconnected."
              );
            };
          }
        );

        console.log(
          "CAMERA + MICROPHONE CONNECTED"
        );

        const modelReady =
          await loadFaceModels();

        if (modelReady) {
          setFaceStatus(
            "Checking face..."
          );

          startFaceDetection();
        }
      } catch (error) {
        console.error(
          "Camera/microphone error:",
          error
        );

        setCameraReady(false);

        setMicrophoneReady(false);

        cameraEnabledRef.current =
          false;

        microphoneEnabledRef.current =
          false;

        if (
          error?.name ===
          "NotAllowedError"
        ) {
          setMediaError(
            "Camera and microphone permission was denied. Allow access from your browser and click Reconnect Media."
          );
        } else if (
          error?.name ===
          "NotFoundError"
        ) {
          setMediaError(
            "No camera or microphone was found."
          );
        } else if (
          error?.name ===
          "NotReadableError"
        ) {
          setMediaError(
            "Camera or microphone is already being used by another application."
          );
        } else {
          setMediaError(
            error?.message ||
              "Unable to access camera and microphone."
          );
        }
      } finally {
        if (mountedRef.current) {
          setMediaLoading(false);
        }
      }
    },
    [
      loadFaceModels,
      startFaceDetection,
    ]
  );


  /* =======================================================
     STOP MEDIA
  ======================================================= */

  const stopMedia = useCallback(() => {
    stopFaceDetection();

    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => {
          track.onended = null;
          track.onmute = null;
          track.onunmute = null;
          track.stop();
        });

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.pause();

      videoRef.current.srcObject = null;
    }

    cameraEnabledRef.current =
      false;

    microphoneEnabledRef.current =
      false;

    setCameraReady(false);

    setMicrophoneReady(false);

    setFaceCount(0);

    setFaceStatus("Searching");
  }, [stopFaceDetection]);


  /* =======================================================
     SECURITY EVENT
  ======================================================= */

  const sendSecurityEvent = useCallback(
    async (
      type,
      message
    ) => {
      if (!id) {
        return;
      }

      const now = Date.now();

      const last =
        securityLastSentRef.current[type] ||
        0;

      if (
        now - last <
        CLIENT_SECURITY_COOLDOWN
      ) {
        return;
      }

      securityLastSentRef.current[type] =
        now;

      try {
        const response =
          await apiRequest({
            method: "POST",
            url: `${API_URL}/api/mock-interview/${id}/security-event`,
            data: {
              type,
              message,
            },
          });

        const serverSecurity =
          response.data?.security;

        if (serverSecurity) {
          setSecurity((prev) => ({
            ...prev,
            ...serverSecurity,
          }));
        }
      } catch (error) {
        console.error(
          "Security event error:",
          error
        );
      }
    },
    [id]
  );


  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    mountedRef.current = true;

    loadInterview();

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    setSpeechSupported(
      Boolean(SpeechRecognition)
    );

    return () => {
      mountedRef.current = false;
    };
  }, [loadInterview]);


  /* =======================================================
     START MEDIA AFTER INTERVIEW LOAD
  ======================================================= */

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!interview) {
      return;
    }

    let cancelled = false;

    const prepareMedia = async () => {
      if (cancelled) {
        return;
      }

      /*
       * Do not automatically request camera permission.
       * Browser permissions should be triggered by the
       * user's button click.
       */
    };

    prepareMedia();

    return () => {
      cancelled = true;
    };
  }, [loading, interview]);


  /* =======================================================
     CLEANUP
  ======================================================= */

  useEffect(() => {
    return () => {
      stopMedia();

      if (
        speechRecognitionRef.current
      ) {
        try {
          speechRecognitionRef.current.stop();
        } catch {
          // ignored
        }
      }

      window.speechSynthesis?.cancel();
    };
  }, [stopMedia]);


  /* =======================================================
     TIMER
  ======================================================= */

  useEffect(() => {
    if (loading) {
      return;
    }

    if (
      finishing ||
      submitting ||
      showLiveEvaluation
    ) {
      return;
    }

    if (timer <= 0) {
      handleTimeExpired();
      return;
    }

    const timerId =
      window.setInterval(() => {
        setTimer((previous) => {
          if (previous <= 1) {
            window.clearInterval(
              timerId
            );

            return 0;
          }

          return previous - 1;
        });
      }, 1000);

    return () => {
      window.clearInterval(
        timerId
      );
    };
  }, [
    timer,
    loading,
    finishing,
    submitting,
    showLiveEvaluation,
  ]);


  /* =======================================================
     TIME EXPIRED
  ======================================================= */

  const handleTimeExpired = async () => {
    if (
      submitting ||
      finishing ||
      showLiveEvaluation
    ) {
      return;
    }

    if (answer.trim()) {
      await submitCurrentAnswer();
    } else {
      goToNextQuestion();
    }
  };


  /* =======================================================
     FORMAT TIMER
  ======================================================= */

  const formatTime = (seconds) => {
    const mins = Math.floor(
      seconds / 60
    );

    const secs = seconds % 60;

    return `${String(mins).padStart(
      2,
      "0"
    )}:${String(secs).padStart(
      2,
      "0"
    )}`;
  };


  /* =======================================================
     QUESTION TEXT
  ======================================================= */

  const getQuestionText = () => {
    if (!currentQuestionData) {
      return "Loading interview question...";
    }

    if (
      typeof currentQuestionData ===
      "string"
    ) {
      return currentQuestionData;
    }

    return (
      currentQuestionData.question ||
      currentQuestionData.text ||
      currentQuestionData.title ||
      "Interview question"
    );
  };


  /* =======================================================
     QUESTION TIP
  ======================================================= */

  const getQuestionTip = () => {
    if (!currentQuestionData) {
      return tip;
    }

    if (
      typeof currentQuestionData ===
      "object"
    ) {
      return (
        currentQuestionData.tip ||
        currentQuestionData.hint ||
        tip
      );
    }

    return tip;
  };


  /* =======================================================
     SPEAK QUESTION
  ======================================================= */

  const speakQuestion = useCallback(() => {
    const text =
      getQuestionText();

    if (!text) {
      return;
    }

    if (
      !window.speechSynthesis
    ) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(
        text
      );

    utterance.rate = 0.9;

    utterance.pitch = 1;

    utterance.volume = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);

      setAiInterviewerState(
        "speaking"
      );
    };

    utterance.onend = () => {
      setIsSpeaking(false);

      setAiInterviewerState(
        "ready"
      );
    };

    utterance.onerror = () => {
      setIsSpeaking(false);

      setAiInterviewerState(
        "ready"
      );
    };

    speechSynthesisRef.current =
      utterance;

    window.speechSynthesis.speak(
      utterance
    );
  }, [currentQuestionData]);


  /* =======================================================
     START SPEECH RECOGNITION
  ======================================================= */

  const startSpeaking = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Speech recognition is not supported in this browser. Please use Chrome or Edge."
      );

      return;
    }

    if (isListening) {
      stopSpeaking();

      return;
    }

    try {
      const recognition =
        new SpeechRecognition();

      speechRecognitionRef.current =
        recognition;

      recognition.continuous = true;

      recognition.interimResults = true;

      recognition.lang =
        "en-US";

      let finalTranscript = "";

      recognition.onstart = () => {
        setIsListening(true);

        setAiInterviewerState(
          "listening"
        );
      };

      recognition.onresult = (
        event
      ) => {
        let interim = "";

        for (
          let i =
            event.resultIndex;
          i < event.results.length;
          i += 1
        ) {
          const result =
            event.results[i];

          const transcript =
            result[0].transcript;

          if (result.isFinal) {
            finalTranscript +=
              `${transcript} `;
          } else {
            interim += transcript;
          }
        }

        const combined =
          `${answer} ${finalTranscript} ${interim}`
            .replace(/\s+/g, " ")
            .trim();

        setAnswer(combined);
      };

      recognition.onerror = (
        event
      ) => {
        console.error(
          "Speech recognition error:",
          event.error
        );

        setIsListening(false);

        setAiInterviewerState(
          "ready"
        );
      };

      recognition.onend = () => {
        setIsListening(false);

        setAiInterviewerState(
          "ready"
        );
      };

      recognition.start();
    } catch (error) {
      console.error(
        "Speech recognition start failed:",
        error
      );

      setIsListening(false);
    }
  };


  /* =======================================================
     STOP SPEAKING
  ======================================================= */

  const stopSpeaking = () => {
    if (
      speechRecognitionRef.current
    ) {
      try {
        speechRecognitionRef.current.stop();
      } catch {
        // ignored
      }

      speechRecognitionRef.current =
        null;
    }

    setIsListening(false);

    setAiInterviewerState(
      "ready"
    );
  };


  /* =======================================================
     SUBMIT CURRENT ANSWER
  ======================================================= */

  const submitCurrentAnswer =
    async () => {
      if (
        submitting ||
        finishing ||
        showLiveEvaluation
      ) {
        return;
      }

      if (!answer.trim()) {
        alert(
          "Please provide an answer before submitting."
        );

        return;
      }

      if (!id) {
        alert(
          "Interview session ID is missing."
        );

        return;
      }

      try {
        setSubmitting(true);

        stopSpeaking();

        window.speechSynthesis?.cancel();

        setAiInterviewerState(
          "evaluating"
        );

        const response =
          await apiRequest({
            method: "POST",
            url: `${API_URL}/api/mock-interview/${id}/answer`,
            data: {
              questionIndex:
                currentQuestion,
              question:
                getQuestionText(),
              answer:
                answer.trim(),
            },
          });

        console.log(
          "Answer submission response:",
          response.data
        );

        const returnedEvaluation =
          response.data?.evaluation ||
          response.data?.answer?.evaluation ||
          null;

        setAnswersMap((previous) => ({
          ...previous,
          [currentQuestion]:
            answer.trim(),
        }));

        setLiveEvaluation(
          returnedEvaluation
        );

        setEvaluationAvailable(
          response.data
            ?.evaluationAvailable !==
            false
        );

        setShowLiveEvaluation(
          true
        );

        setAiInterviewerState(
          response.data
            ?.evaluationAvailable ===
            false
            ? "evaluation-unavailable"
            : "evaluated"
        );
      } catch (error) {
        console.error(
          "Submit answer error:",
          error
        );

        setAiInterviewerState(
          "ready"
        );

        alert(
          safeMessage(error)
        );
      } finally {
        setSubmitting(false);
      }
    };


  /* =======================================================
     NEXT QUESTION
  ======================================================= */

  const goToNextQuestion = () => {
    if (
      finishing ||
      submitting
    ) {
      return;
    }

    setShowLiveEvaluation(
      false
    );

    setLiveEvaluation(null);

    setEvaluationAvailable(
      false
    );

    setAiInterviewerState(
      "ready"
    );

    if (
      currentQuestion <
      questions.length - 1
    ) {
      const nextIndex =
        currentQuestion + 1;

      setCurrentQuestion(
        nextIndex
      );

      setAnswer(
        answersMap[nextIndex] ||
          ""
      );

      setTimer(
        QUESTION_TIME
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    finishInterview(
      "COMPLETED"
    );
  };


  /* =======================================================
     FINISH INTERVIEW
  ======================================================= */

  const finishInterview =
    async (
      status = "COMPLETED"
    ) => {
      if (
        finishingRef.current
      ) {
        return;
      }

      finishingRef.current =
        true;

      setFinishing(true);

      try {
        stopSpeaking();

        window.speechSynthesis?.cancel();

        // Generate/save the final report before opening the result page.
        // The final answer has already been submitted at this point.
        try {
          const reportResponse =
            await apiRequest({
              method: "GET",
              url: `${API_URL}/api/mock-interview/${id}/report`,
              timeout: 120000,
              params: { reason: status },
            });

          console.log(
            "Final interview report generated:",
            reportResponse.data
          );
        } catch (reportError) {
          // Saved question-level evaluations can still be displayed.
          console.error(
            "Final report generation failed:",
            reportError
          );
        }

        stopMedia();

        if (document.fullscreenElement) {
          try {
            await document.exitFullscreen();
          } catch {
            // ignored
          }
        }

        navigate(
          `/mock-interview/${id}/result`,
          {
            replace: true,
            state: { status },
          }
        );
      } catch (error) {
        console.error(
          "Finish interview error:",
          error
        );

        stopMedia();

        try {
          if (document.fullscreenElement) {
            await document.exitFullscreen();
          }
        } catch {
          // ignored
        }

        navigate(
          `/mock-interview/${id}/result`,
          {
            replace: true,
            state: { status },
          }
        );
      } finally {
        finishingRef.current =
          false;

        setFinishing(false);
      }
    };


  /* =======================================================
     EXIT INTERVIEW
  ======================================================= */

  const handleExitInterview =
    () => {
      if (
        submitting ||
        finishing
      ) {
        return;
      }

      setShowExitModal(true);
    };


  /* =======================================================
     CONFIRM EXIT
  ======================================================= */

  const confirmExit = async () => {
    setShowExitModal(false);

    await finishInterview(
      "EXITED"
    );
  };


  /* =======================================================
     FULLSCREEN
  ======================================================= */

  const enterFullscreen =
    async () => {
      try {
        if (
          document.fullscreenElement
        ) {
          setIsFullscreen(true);
          return;
        }

        await document.documentElement.requestFullscreen();

        setIsFullscreen(true);

        fullscreenRequestRef.current =
          true;
      } catch (error) {
        console.warn(
          "Fullscreen request failed:",
          error
        );

        setIsFullscreen(false);
      }
    };


  /* =======================================================
     FULLSCREEN CHANGE
  ======================================================= */

  useEffect(() => {
    const handleFullscreenChange =
      () => {
        const active =
          Boolean(
            document.fullscreenElement
          );

        setIsFullscreen(active);

        if (
          !active &&
          !finishingRef.current &&
          fullscreenRequestRef.current
        ) {
          sendSecurityEvent(
            "FULLSCREEN_EXIT",
            "Candidate exited fullscreen mode."
          );
        }
      };

    document.addEventListener(
      "fullscreenchange",
      handleFullscreenChange
    );

    return () => {
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange
      );
    };
  }, [sendSecurityEvent]);


  /* =======================================================
     TAB SWITCH DETECTION
  ======================================================= */

  useEffect(() => {
    const handleVisibility =
      () => {
        if (
          document.visibilityState ===
          "hidden"
        ) {
          sendSecurityEvent(
            "TAB_SWITCH",
            "Candidate switched away from the interview tab."
          );
        }
      };

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };
  }, [sendSecurityEvent]);


  /* =======================================================
     COPY / PASTE / CONTEXT MENU
  ======================================================= */

  useEffect(() => {
    const handleCopy = (event) => {
      event.preventDefault();

      sendSecurityEvent(
        "COPY_ATTEMPT",
        "Copy attempt detected."
      );
    };

    const handlePaste = (event) => {
      event.preventDefault();

      sendSecurityEvent(
        "PASTE_ATTEMPT",
        "Paste attempt detected."
      );
    };

    const handleContextMenu = (
      event
    ) => {
      event.preventDefault();

      sendSecurityEvent(
        "CONTEXT_MENU",
        "Context menu attempt detected."
      );
    };

    document.addEventListener(
      "copy",
      handleCopy
    );

    document.addEventListener(
      "paste",
      handlePaste
    );

    document.addEventListener(
      "contextmenu",
      handleContextMenu
    );

    return () => {
      document.removeEventListener(
        "copy",
        handleCopy
      );

      document.removeEventListener(
        "paste",
        handlePaste
      );

      document.removeEventListener(
        "contextmenu",
        handleContextMenu
      );
    };
  }, [sendSecurityEvent]);


  /* =======================================================
     SECURITY TERMINATION
  ======================================================= */

  useEffect(() => {
    if (
      security.status ===
        "Terminated" ||
      security.violationCount >=
        MAX_SECURITY_WARNINGS
    ) {
      stopMedia();

      window.speechSynthesis?.cancel();

      if (
        document.fullscreenElement
      ) {
        document.exitFullscreen().catch(
          () => {}
        );
      }
    }
  }, [
    security.status,
    security.violationCount,
    stopMedia,
  ]);


  /* =======================================================
     RECONNECT MEDIA
  ======================================================= */

  const reconnectMedia =
    async () => {
      await startMedia();
    };


  /* =======================================================
     SECURITY STATUS
  ======================================================= */

  const securityStatus =
    security.status ||
    (security.violationCount > 0
      ? "Warning"
      : "Secure");


  /* =======================================================
     RENDER LOADING
  ======================================================= */

  if (loading) {
    return (
      <>
        <GlobalStyles />

        <div className="pp-loading-page">
          <div className="pp-loading-card">
            <div className="pp-loading-orb">
              <Brain size={42} />
            </div>

            <div>
              <h2>
                Preparing AI Interview
              </h2>

              <p>
                Loading your interview session...
              </p>
            </div>

            <Loader2
              className="pp-spin"
              size={28}
            />
          </div>
        </div>
      </>
    );
  }


  /* =======================================================
     RENDER ERROR
  ======================================================= */

  if (loadingError) {
    return (
      <>
        <GlobalStyles />

        <div className="pp-error-page">
          <div className="pp-error-card">
            <div className="pp-error-icon">
              <AlertTriangle
                size={38}
              />
            </div>

            <h2>
              Unable to Load Interview
            </h2>

            <p>
              {loadingError}
            </p>

            <button
              type="button"
              className="pp-primary-btn"
              onClick={loadInterview}
            >
              <RefreshCw size={18} />
              Try Again
            </button>

            <button
              type="button"
              className="pp-secondary-btn"
              onClick={() =>
                navigate(-1)
              }
            >
              Go Back
            </button>
          </div>
        </div>
      </>
    );
  }


  /* =======================================================
     SECURITY TERMINATED SCREEN
  ======================================================= */

  if (
    security.status ===
      "Terminated" ||
    security.violationCount >=
      MAX_SECURITY_WARNINGS
  ) {
    return (
      <>
        <GlobalStyles />

        <div className="pp-terminated-page">
          <div className="pp-terminated-card">
            <div className="pp-danger-orb">
              <ShieldAlert
                size={50}
              />
            </div>

            <h1>
              Interview Terminated
            </h1>

            <p>
              The interview was terminated
              because the maximum security
              violation limit was reached.
            </p>

            <div className="pp-strike-large">
              <ShieldAlert size={20} />
              <span>
                Security Strikes:{" "}
                {
                  security.violationCount
                }
                /{MAX_SECURITY_WARNINGS}
              </span>
            </div>

            <button
              type="button"
              className="pp-primary-btn"
              onClick={() =>
                navigate(
                  `/mock-interview/${id}/result`
                )
              }
            >
              View Result
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </>
    );
  }


  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <>
      <GlobalStyles />

      <div className="pp-page">

        {/* ===============================================
            HEADER
        =============================================== */}

        <header className="pp-header">

          <div className="pp-brand">
            <div className="pp-brand-icon">
              <Brain size={28} />
            </div>

            <div>
              <h1>
                PrepPulse AI Interview
              </h1>

              <p>
                {interview?.role ||
                  "Java Developer"}{" "}
                •{" "}
                {interview?.company ||
                  "Accenture"}
              </p>
            </div>
          </div>


          <div className="pp-header-center">
            <div className="pp-live-badge">
              <Sparkles size={15} />
              AI Interviewer Live
            </div>
          </div>


          <div className="pp-header-right">

            <div className="pp-question-progress">
              <span>
                Question
              </span>

              <strong>
                {currentQuestion + 1}/
                {questions.length}
              </strong>

              <div className="pp-progress-bar">
                <div
                  style={{
                    width: `${
                      ((currentQuestion +
                        1) /
                        Math.max(
                          questions.length,
                          1
                        )) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>


            <div
              className={`pp-timer ${
                timer <= 10
                  ? "pp-timer-danger"
                  : ""
              }`}
            >
              <Clock size={17} />
              {formatTime(timer)}
            </div>


            <button
              type="button"
              className="pp-reconnect-header"
              onClick={
                reconnectMedia
              }
              disabled={mediaLoading}
            >
              {mediaLoading ? (
                <Loader2
                  size={16}
                  className="pp-spin"
                />
              ) : (
                <RefreshCw
                  size={16}
                />
              )}

              Reconnect Media
            </button>


            <button
              type="button"
              className="pp-exit-btn"
              onClick={
                handleExitInterview
              }
              disabled={
                finishing ||
                submitting
              }
            >
              <X size={17} />
              Exit Interview
            </button>

          </div>

        </header>


        {/* ===============================================
            CONTENT
        =============================================== */}

        <main className="pp-main">

          {/* =============================================
              PROCTORING STATUS
          ============================================= */}

          <section className="pp-security-bar">

            <div className="pp-security-title">

              <div
                className={`pp-security-icon ${
                  securityStatus ===
                  "Secure"
                    ? "secure"
                    : "warning"
                }`}
              >
                <ShieldCheck
                  size={22}
                />
              </div>

              <div>
                <span>
                  AI Proctoring
                </span>

                <strong>
                  {securityStatus}
                </strong>
              </div>

            </div>


            <div className="pp-security-items">

              <StatusPill
                active={
                  cameraReady
                }
                icon={
                  cameraReady
                    ? Camera
                    : WifiOff
                }
                label={
                  cameraReady
                    ? "Camera Ready"
                    : "Camera Offline"
                }
                success={
                  cameraReady
                }
              />


              <StatusPill
                active={
                  microphoneReady
                }
                icon={
                  microphoneReady
                    ? Mic
                    : MicOff
                }
                label={
                  microphoneReady
                    ? "Mic Ready"
                    : "Mic Offline"
                }
                success={
                  microphoneReady
                }
              />


              <StatusPill
                active={
                  faceStatus ===
                  "Face detected"
                }
                icon={Eye}
                label={
                  faceStatus
                }
                success={
                  faceStatus ===
                  "Face detected"
                }
              />


              <StatusPill
                active={
                  isFullscreen
                }
                icon={
                  isFullscreen
                    ? Lock
                    : Maximize2
                }
                label={
                  isFullscreen
                    ? "Fullscreen"
                    : "Fullscreen"
                }
                success={
                  isFullscreen
                }
              />


              <div className="pp-strikes-pill">
                Strikes{" "}
                <strong>
                  {
                    security.violationCount
                  }
                  /{MAX_SECURITY_WARNINGS}
                </strong>
              </div>

            </div>

          </section>


          {/* =============================================
              GRID
          ============================================= */}

          <div className="pp-interview-grid">

            {/* ===========================================
                LEFT CAMERA
            =========================================== */}

            <aside className="pp-camera-panel">

              <div className="pp-camera-screen">

                <div className="pp-live-indicator">
                  <span />
                  LIVE PROCTORING
                </div>


                <video
                  ref={videoRef}
                  className={`pp-video ${
                    cameraReady
                      ? "visible"
                      : "hidden"
                  }`}
                  autoPlay
                  muted
                  playsInline
                />


                {!cameraReady && (
                  <div className="pp-camera-offline">

                    <div className="pp-camera-offline-icon">
                      <Camera
                        size={48}
                      />
                    </div>

                    <h3>
                      Camera Offline
                    </h3>

                    <p>
                      Enable your camera
                      to start AI
                      proctoring.
                    </p>

                    <button
                      type="button"
                      className="pp-enable-media-btn"
                      onClick={
                        startMedia
                      }
                      disabled={
                        mediaLoading
                      }
                    >
                      {mediaLoading ? (
                        <>
                          <Loader2
                            size={18}
                            className="pp-spin"
                          />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <Camera
                            size={18}
                          />
                          Enable Camera
                          & Mic
                        </>
                      )}
                    </button>

                  </div>
                )}


                {cameraReady && (
                  <div className="pp-camera-overlay">

                    <div className="pp-camera-name">
                      Candidate Camera
                      <strong>
                        {faceStatus}
                      </strong>
                    </div>

                    <div className="pp-camera-icons">
                      {cameraReady ? (
                        <Camera
                          size={20}
                        />
                      ) : (
                        <WifiOff
                          size={20}
                        />
                      )}

                      {microphoneReady ? (
                        <Mic size={20} />
                      ) : (
                        <MicOff
                          size={20}
                        />
                      )}
                    </div>

                  </div>
                )}

              </div>


              {/* MEDIA ERROR */}

              {mediaError && (
                <div className="pp-media-error">
                  <AlertTriangle
                    size={18}
                  />

                  <span>
                    {mediaError}
                  </span>
                </div>
              )}


              {/* FACE STATUS */}

              <div className="pp-face-status">

                <div
                  className={`pp-face-status-icon ${
                    faceStatus ===
                    "Face detected"
                      ? "success"
                      : "warning"
                  }`}
                >
                  <Eye size={20} />
                </div>

                <div>
                  <span>
                    Face Detection
                  </span>

                  <strong>
                    {faceModelLoading
                      ? "Loading model..."
                      : faceStatus}
                  </strong>
                </div>

                {faceCount >
                  0 && (
                  <div className="pp-face-count">
                    <Users
                      size={15}
                    />
                    {faceCount}
                  </div>
                )}

              </div>


              {/* MEDIA CARDS */}

              <div className="pp-media-grid">

                <MediaCard
                  icon={
                    cameraReady
                      ? Camera
                      : WifiOff
                  }
                  title="Camera"
                  value={
                    cameraReady
                      ? "Connected"
                      : "Disconnected"
                  }
                  success={
                    cameraReady
                  }
                />


                <MediaCard
                  icon={
                    microphoneReady
                      ? Mic
                      : MicOff
                  }
                  title="Microphone"
                  value={
                    microphoneReady
                      ? "Connected"
                      : "Disconnected"
                  }
                  success={
                    microphoneReady
                  }
                />


                <MediaCard
                  icon={Eye}
                  title="Face"
                  value={
                    faceStatus
                  }
                  success={
                    faceStatus ===
                    "Face detected"
                  }
                />


                <MediaCard
                  icon={
                    ShieldCheck
                  }
                  title="Security"
                  value={`${security.violationCount}/${MAX_SECURITY_WARNINGS}`}
                  success={
                    security.violationCount ===
                    0
                  }
                />

              </div>


              {/* RECONNECT */}

              {!cameraReady && (
                <button
                  type="button"
                  className="pp-reconnect-btn"
                  onClick={
                    reconnectMedia
                  }
                  disabled={
                    mediaLoading
                  }
                >
                  {mediaLoading ? (
                    <Loader2
                      size={17}
                      className="pp-spin"
                    />
                  ) : (
                    <RefreshCw
                      size={17}
                    />
                  )}

                  Reconnect Camera &
                  Microphone
                </button>
              )}

            </aside>


            {/* ===========================================
                RIGHT INTERVIEW
            =========================================== */}

            <section className="pp-interview-panel">

              {/* =========================================
                  AI INTERVIEWER
              ========================================= */}

              <div className="pp-ai-interviewer">

                <div className="pp-ai-grid-bg" />

                <div
                  className={`pp-ai-orb ${
                    isSpeaking ||
                    aiInterviewerState ===
                      "evaluating"
                      ? "active"
                      : ""
                  }`}
                >

                  <div className="pp-ai-ring ring-one" />

                  <div className="pp-ai-ring ring-two" />

                  <div className="pp-ai-sparkle sparkle-one">
                    <Sparkles size={13} />
                  </div>

                  <div className="pp-ai-sparkle sparkle-two">
                    <Sparkles size={10} />
                  </div>

                  <div className="pp-ai-brain">
                    <Brain size={48} />
                  </div>

                  <span className="pp-ai-live-dot" />

                </div>


                <div className="pp-ai-info">

                  <div className="pp-ai-label">
                    <span>
                      AI INTERVIEWER
                    </span>

                    <b>
                      LIVE
                    </b>
                  </div>

                  <h2>
                    PrepPulse AI
                  </h2>

                  <p>
                    {aiInterviewerState ===
                    "speaking"
                      ? "I'm asking the question..."
                      : aiInterviewerState ===
                        "listening"
                      ? "I'm listening to your answer..."
                      : aiInterviewerState ===
                        "evaluating"
                      ? "I'm evaluating your answer..."
                      : aiInterviewerState ===
                        "evaluated"
                      ? "Your answer has been evaluated."
                      : "I'm ready for your answer."}
                  </p>

                  <div className="pp-ai-status-row">

                    <span className="pp-ai-status-dot" />

                    <span>
                      {isSpeaking
                        ? "Speaking"
                        : isListening
                        ? "Listening"
                        : "AI interviewer is ready"}
                    </span>

                    {(isSpeaking ||
                      isListening) && (
                      <div className="pp-waveform">
                        <i />
                        <i />
                        <i />
                        <i />
                        <i />
                      </div>
                    )}

                  </div>

                </div>


                <button
                  type="button"
                  className={`pp-ask-btn ${
                    isSpeaking
                      ? "speaking"
                      : ""
                  }`}
                  onClick={
                    speakQuestion
                  }
                  disabled={
                    submitting ||
                    finishing
                  }
                >
                  {isSpeaking ? (
                    <>
                      <VolumeX
                        size={18}
                      />
                      Speaking...
                    </>
                  ) : (
                    <>
                      <Volume2
                        size={18}
                      />
                      Ask Question
                    </>
                  )}
                </button>

              </div>


              {/* =========================================
                  QUESTION
              ========================================= */}

              <div className="pp-question-section">

                <div className="pp-question-top">

                  <div>
                    <span className="pp-question-number">
                      QUESTION{" "}
                      {currentQuestion +
                        1}{" "}
                      /{" "}
                      {questions.length}
                    </span>

                    <h2>
                      Technical Interview
                    </h2>
                  </div>

                  <div className="pp-ai-generated">
                    <Sparkles
                      size={15}
                    />
                    AI Generated
                  </div>

                </div>


                <div className="pp-question-card">

                  <div className="pp-question-icon">
                    <Brain
                      size={22}
                    />
                  </div>

                  <div>
                    <h3>
                      {getQuestionText()}
                    </h3>

                    <div className="pp-question-status">
                      <span />

                      {aiInterviewerState ===
                      "evaluating"
                        ? "AI is evaluating your answer..."
                        : "AI interviewer is ready"}

                    </div>
                  </div>

                </div>

              </div>


              {/* =========================================
                  ANSWER
              =========================================== */}

              <div className="pp-answer-section">

                <div className="pp-answer-header">

                  <label>
                    Your Answer
                  </label>

                  <span>
                    {answer.length}{" "}
                    characters
                  </span>

                </div>


                <textarea
                  value={answer}
                  onChange={(event) =>
                    setAnswer(
                      event.target.value
                    )
                  }
                  disabled={
                    submitting ||
                    showLiveEvaluation ||
                    finishing
                  }
                  placeholder="Explain your answer clearly. You can type or use voice input..."
                  className="pp-answer-textarea"
                />


                {/* =======================================
                    ACTIONS
                ======================================= */}

                <div className="pp-answer-actions">

                  <button
                    type="button"
                    className={`pp-speak-btn ${
                      isListening
                        ? "listening"
                        : ""
                    }`}
                    onClick={
                      startSpeaking
                    }
                    disabled={
                      submitting ||
                      showLiveEvaluation ||
                      finishing ||
                      !speechSupported
                    }
                  >
                    {isListening ? (
                      <>
                        <StopCircle
                          size={18}
                        />
                        Stop Speaking
                      </>
                    ) : (
                      <>
                        <Mic size={18} />
                        Start Speaking
                      </>
                    )}
                  </button>


                  <button
                    type="button"
                    className="pp-submit-btn"
                    onClick={
                      submitCurrentAnswer
                    }
                    disabled={
                      submitting ||
                      finishing ||
                      showLiveEvaluation ||
                      !answer.trim()
                    }
                  >
                    {submitting ? (
                      <>
                        <Loader2
                          size={18}
                          className="pp-spin"
                        />
                        Evaluating...
                      </>
                    ) : (
                      <>
                        Submit Answer
                        <Send
                          size={18}
                        />
                      </>
                    )}
                  </button>

                </div>


                {/* =======================================
                    TIP
                ======================================= */}

                <button
                  type="button"
                  className="pp-tip-toggle"
                  onClick={() =>
                    setShowTip(
                      (previous) =>
                        !previous
                    )
                  }
                >
                  <Lightbulb
                    size={17}
                  />

                  {showTip
                    ? "Hide Interview Tip"
                    : "Show Interview Tip"}
                </button>


                {showTip && (
                  <div className="pp-tip">
                    <Lightbulb
                      size={18}
                    />

                    <span>
                      {getQuestionTip()}
                    </span>
                  </div>
                )}

              </div>


              {/* =========================================
                  LIVE EVALUATION
              =========================================== */}

              {showLiveEvaluation && (
                <LiveEvaluation
                  evaluation={
                    liveEvaluation
                  }
                  available={
                    evaluationAvailable
                  }
                  isLastQuestion={
                    currentQuestion >=
                    questions.length -
                      1
                  }
                  onNext={
                    goToNextQuestion
                  }
                  onFinish={() =>
                    finishInterview(
                      "COMPLETED"
                    )
                  }
                />
              )}

            </section>

          </div>

        </main>


        {/* ===============================================
            EXIT MODAL
        =============================================== */}

        {showExitModal && (
          <div className="pp-modal-overlay">

            <div className="pp-modal">

              <button
                type="button"
                className="pp-modal-close"
                onClick={() =>
                  setShowExitModal(
                    false
                  )
                }
              >
                <X size={20} />
              </button>

              <div className="pp-modal-icon">
                <LogOut size={28} />
              </div>

              <h2>
                Exit Interview?
              </h2>

              <p>
                Are you sure you want to
                exit this interview? Your
                current progress will be
                saved.
              </p>

              <div className="pp-modal-actions">

                <button
                  type="button"
                  className="pp-secondary-btn"
                  onClick={() =>
                    setShowExitModal(
                      false
                    )
                  }
                >
                  Continue Interview
                </button>

                <button
                  type="button"
                  className="pp-danger-btn"
                  onClick={
                    confirmExit
                  }
                >
                  <LogOut
                    size={17}
                  />
                  Exit Interview
                </button>

              </div>

            </div>

          </div>
        )}

      </div>
    </>
  );
}


/* =========================================================
   STATUS PILL
========================================================= */

function StatusPill({
  active,
  icon: Icon,
  label,
  success,
}) {
  return (
    <div
      className={`pp-status-pill ${
        success
          ? "success"
          : "danger"
      }`}
    >
      <Icon size={15} />
      <span>{label}</span>
    </div>
  );
}


/* =========================================================
   MEDIA CARD
========================================================= */

function MediaCard({
  icon: Icon,
  title,
  value,
  success,
}) {
  return (
    <div className="pp-media-card">

      <div
        className={`pp-media-card-icon ${
          success
            ? "success"
            : "danger"
        }`}
      >
        <Icon size={17} />
      </div>

      <div>
        <span>
          {title}
        </span>

        <strong
          className={
            success
              ? "success-text"
              : "danger-text"
          }
        >
          {value}
        </strong>
      </div>

    </div>
  );
}


/* =========================================================
   LIVE EVALUATION
========================================================= */

function LiveEvaluation({
  evaluation,
  available,
  isLastQuestion,
  onNext,
  onFinish,
}) {
  if (!available) {
    return (
      <div className="pp-evaluation-card">

        <div className="pp-evaluation-header">

          <div className="pp-evaluation-title">
            <div className="pp-evaluation-icon">
              <Brain size={23} />
            </div>

            <div>
              <span>
                AI EVALUATION
              </span>

              <h3>
                Evaluation unavailable
              </h3>
            </div>
          </div>

        </div>

        <div className="pp-evaluation-warning">
          <AlertTriangle size={20} />

          <p>
            Your answer was submitted,
            but the AI evaluation service
            did not return an evaluation.
            You can continue to the next
            question.
          </p>
        </div>

        <div className="pp-evaluation-footer">

          <button
            type="button"
            className="pp-next-btn"
            onClick={
              isLastQuestion
                ? onFinish
                : onNext
            }
          >
            {isLastQuestion
              ? "Finish Interview"
              : "Next Question"}

            <ChevronRight
              size={18}
            />
          </button>

        </div>

      </div>
    );
  }


  const score =
    Number(
      evaluation?.score
    ) || 0;

  const scorePercentage =
    Math.min(
      Math.max(
        score * 10,
        0
      ),
      100
    );


  return (
    <div className="pp-evaluation-card">

      <div className="pp-evaluation-header">

        <div className="pp-evaluation-title">

          <div className="pp-evaluation-icon">
            <Sparkles size={23} />
          </div>

          <div>
            <span>
              AI EVALUATION
            </span>

            <h3>
              Your answer has been evaluated
            </h3>
          </div>

        </div>


        <div className="pp-score-circle">

          <svg
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="43"
              className="score-bg"
            />

            <circle
              cx="50"
              cy="50"
              r="43"
              className="score-progress"
              style={{
                strokeDasharray: `${scorePercentage * 2.7} 270`,
              }}
            />
          </svg>

          <div>
            <strong>
              {score}
            </strong>

            <span>
              /10
            </span>
          </div>

        </div>

      </div>


      <div className="pp-evaluation-grid">

        <EvaluationItem
          icon={
            CheckCircle2
          }
          title="What You Did Well"
          text={
            evaluation?.whatWasGood ||
            evaluation?.strengths ||
            "Your answer was submitted successfully."
          }
          type="success"
        />


        <EvaluationItem
          icon={
            AlertTriangle
          }
          title="What Can Improve"
          text={
            evaluation?.whatWasWrong ||
            evaluation?.missing ||
            "Try to provide more specific technical details."
          }
          type="warning"
        />


        <EvaluationItem
          icon={
            Lightbulb
          }
          title="Improvement"
          text={
            evaluation?.improvement ||
            "Use a structured explanation with an example."
          }
          type="info"
        />


        <EvaluationItem
          icon={
            MessageSquare
          }
          title="AI Feedback"
          text={
            evaluation?.feedback ||
            "Keep your answer concise, structured, and practical."
          }
          type="default"
        />

      </div>


      {evaluation?.expectedAnswer && (
        <div className="pp-ideal-answer">

          <div className="pp-ideal-answer-title">
            <Trophy size={18} />

            <strong>
              Ideal Answer
            </strong>
          </div>

          <p>
            {evaluation.expectedAnswer}
          </p>

        </div>
      )}


      <div className="pp-evaluation-footer">

        <span>
          {isLastQuestion
            ? "You have completed all questions."
            : "Ready for the next question?"}
        </span>


        <button
          type="button"
          className="pp-next-btn"
          onClick={
            isLastQuestion
              ? onFinish
              : onNext
          }
        >
          {isLastQuestion
            ? "Finish Interview"
            : "Next Question"}

          <ChevronRight
            size={18}
          />
        </button>

      </div>

    </div>
  );
}


/* =========================================================
   EVALUATION ITEM
========================================================= */

function EvaluationItem({
  icon: Icon,
  title,
  text,
  type,
}) {
  return (
    <div
      className={`pp-evaluation-item ${type}`}
    >

      <div className="pp-evaluation-item-icon">
        <Icon size={18} />
      </div>

      <div>
        <strong>
          {title}
        </strong>

        <p>
          {text}
        </p>
      </div>

    </div>
  );
}


/* =========================================================
   GLOBAL STYLES
========================================================= */

function GlobalStyles() {
  return (
    <style>{`

      * {
        box-sizing: border-box;
      }

      html {
        background: #020617;
      }

      body {
        margin: 0;
        padding: 0;
        background:
          radial-gradient(
            circle at 15% 15%,
            rgba(14, 165, 233, 0.08),
            transparent 28%
          ),
          radial-gradient(
            circle at 85% 20%,
            rgba(139, 92, 246, 0.09),
            transparent 28%
          ),
          #020617;
        color: #f8fafc;
        font-family:
          Inter,
          ui-sans-serif,
          system-ui,
          -apple-system,
          BlinkMacSystemFont,
          "Segoe UI",
          sans-serif;
      }

      button,
      textarea {
        font-family: inherit;
      }

      button {
        cursor: pointer;
      }

      button:disabled {
        cursor: not-allowed;
        opacity: 0.55;
      }

      ::selection {
        background: rgba(34, 211, 238, 0.25);
      }


      /* ===================================================
         PAGE
      =================================================== */

      .pp-page {
        min-height: 100vh;
        background:
          radial-gradient(
            circle at 20% 30%,
            rgba(6, 182, 212, 0.05),
            transparent 25%
          ),
          radial-gradient(
            circle at 80% 70%,
            rgba(124, 58, 237, 0.05),
            transparent 25%
          ),
          #020617;
      }


      /* ===================================================
         HEADER
      =================================================== */

      .pp-header {
        min-height: 74px;
        padding: 12px 28px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        border-bottom: 1px solid
          rgba(51, 65, 85, 0.65);
        background: rgba(
          2,
          6,
          23,
          0.88
        );
        backdrop-filter: blur(20px);
        position: sticky;
        top: 0;
        z-index: 100;
      }

      .pp-brand {
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 220px;
      }

      .pp-brand-icon {
        width: 44px;
        height: 44px;
        border-radius: 14px;
        display: grid;
        place-items: center;
        color: white;
        background:
          linear-gradient(
            135deg,
            #06b6d4,
            #6366f1 50%,
            #9333ea
          );
        box-shadow:
          0 0 30px
          rgba(99, 102, 241, 0.35);
      }

      .pp-brand h1 {
        margin: 0;
        font-size: 16px;
        font-weight: 800;
        letter-spacing: -0.02em;
      }

      .pp-brand p {
        margin: 3px 0 0;
        color: #64748b;
        font-size: 12px;
      }

      .pp-header-center {
        flex: 1;
        display: flex;
        justify-content: center;
      }

      .pp-live-badge {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 9px 13px;
        border-radius: 999px;
        border: 1px solid
          rgba(6, 182, 212, 0.22);
        background: rgba(
          6,
          182,
          212,
          0.07
        );
        color: #67e8f9;
        font-size: 12px;
        font-weight: 700;
      }

      .pp-header-right {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .pp-question-progress {
        min-width: 170px;
      }

      .pp-question-progress span {
        display: block;
        color: #64748b;
        font-size: 10px;
        margin-bottom: 2px;
      }

      .pp-question-progress strong {
        display: block;
        font-size: 15px;
      }

      .pp-progress-bar {
        height: 6px;
        margin-top: 5px;
        overflow: hidden;
        border-radius: 999px;
        background: #1e293b;
      }

      .pp-progress-bar div {
        height: 100%;
        border-radius: inherit;
        background:
          linear-gradient(
            90deg,
            #06b6d4,
            #8b5cf6
          );
        transition: width 0.35s ease;
      }

      .pp-timer {
        min-width: 96px;
        height: 44px;
        padding: 0 13px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        border: 1px solid
          #334155;
        border-radius: 12px;
        background: rgba(
          15,
          23,
          42,
          0.8
        );
        font-size: 14px;
        font-weight: 800;
      }

      .pp-timer-danger {
        color: #fb7185;
        border-color:
          rgba(244, 63, 94, 0.45);
        animation: timerPulse 1s infinite;
      }

      .pp-reconnect-header,
      .pp-exit-btn {
        height: 44px;
        padding: 0 14px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 700;
        transition: 0.2s ease;
      }

      .pp-reconnect-header {
        border: 1px solid
          rgba(245, 158, 11, 0.35);
        background: rgba(
          245,
          158,
          11,
          0.06
        );
        color: #fbbf24;
      }

      .pp-reconnect-header:hover {
        background: rgba(
          245,
          158,
          11,
          0.12
        );
      }

      .pp-exit-btn {
        border: 1px solid
          rgba(244, 63, 94, 0.45);
        background: rgba(
          244,
          63,
          94,
          0.05
        );
        color: #fb7185;
      }

      .pp-exit-btn:hover {
        background: rgba(
          244,
          63,
          94,
          0.12
        );
      }


      /* ===================================================
         MAIN
      =================================================== */

      .pp-main {
        width: min(
          1500px,
          calc(100% - 40px)
        );
        margin: 0 auto;
        padding: 28px 0 50px;
      }


      /* ===================================================
         SECURITY BAR
      =================================================== */

      .pp-security-bar {
        min-height: 72px;
        padding: 12px 16px;
        margin-bottom: 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 18px;
        border: 1px solid
          rgba(51, 65, 85, 0.8);
        border-radius: 18px;
        background: rgba(
          15,
          23,
          42,
          0.76
        );
        box-shadow:
          0 15px 50px
          rgba(0, 0, 0, 0.15);
      }

      .pp-security-title {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .pp-security-icon {
        width: 42px;
        height: 42px;
        border-radius: 13px;
        display: grid;
        place-items: center;
        background: rgba(
          16,
          185,
          129,
          0.1
        );
        color: #10b981;
      }

      .pp-security-icon.warning {
        color: #f59e0b;
        background: rgba(
          245,
          158,
          11,
          0.1
        );
      }

      .pp-security-title span {
        display: block;
        color: #64748b;
        font-size: 11px;
      }

      .pp-security-title strong {
        display: block;
        margin-top: 2px;
        font-size: 14px;
      }

      .pp-security-items {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        justify-content: flex-end;
        gap: 8px;
      }

      .pp-status-pill,
      .pp-strikes-pill {
        min-height: 36px;
        padding: 0 11px;
        display: inline-flex;
        align-items: center;
        gap: 7px;
        border-radius: 10px;
        font-size: 11px;
        font-weight: 700;
      }

      .pp-status-pill.success {
        color: #34d399;
        border: 1px solid
          rgba(16, 185, 129, 0.28);
        background: rgba(
          16,
          185,
          129,
          0.05
        );
      }

      .pp-status-pill.danger {
        color: #fb7185;
        border: 1px solid
          rgba(244, 63, 94, 0.28);
        background: rgba(
          244,
          63,
          94,
          0.05
        );
      }

      .pp-strikes-pill {
        color: #e2e8f0;
        border: 1px solid
          #334155;
        background: #020617;
      }

      .pp-strikes-pill strong {
        color: #34d399;
      }


      /* ===================================================
         GRID
      =================================================== */

      .pp-interview-grid {
        display: grid;
        grid-template-columns:
          minmax(320px, 440px)
          minmax(0, 1fr);
        gap: 24px;
        align-items: start;
      }


      /* ===================================================
         CAMERA
      =================================================== */

      .pp-camera-panel {
        position: sticky;
        top: 100px;
        overflow: hidden;
        border: 1px solid
          rgba(51, 65, 85, 0.85);
        border-radius: 22px;
        background: rgba(
          15,
          23,
          42,
          0.76
        );
        box-shadow:
          0 25px 80px
          rgba(0, 0, 0, 0.2);
      }

      .pp-camera-screen {
        position: relative;
        height: 300px;
        overflow: hidden;
        background: #000;
      }

      .pp-video {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        transform: scaleX(-1);
        background: #000;
      }

      .pp-video.hidden {
        display: none;
      }

      .pp-video.visible {
        display: block;
      }

      .pp-live-indicator {
        position: absolute;
        z-index: 5;
        top: 16px;
        left: 16px;
        display: flex;
        align-items: center;
        gap: 7px;
        padding: 8px 11px;
        border-radius: 999px;
        background: rgba(
          0,
          0,
          0,
          0.55
        );
        color: white;
        font-size: 10px;
        font-weight: 800;
      }

      .pp-live-indicator span {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #f43f5e;
        box-shadow:
          0 0 12px
          rgba(244, 63, 94, 0.8);
        animation: livePulse 1.2s infinite;
      }

      .pp-camera-offline {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 30px;
        background:
          radial-gradient(
            circle at center,
            rgba(30, 41, 59, 0.35),
            transparent 55%
          ),
          #000;
      }

      .pp-camera-offline-icon {
        width: 72px;
        height: 72px;
        display: grid;
        place-items: center;
        border-radius: 22px;
        color: #fb7185;
        background: rgba(
          244,
          63,
          94,
          0.08
        );
        border: 1px solid
          rgba(244, 63, 94, 0.2);
        margin-bottom: 15px;
      }

      .pp-camera-offline h3 {
        margin: 0;
        font-size: 17px;
      }

      .pp-camera-offline p {
        max-width: 280px;
        margin: 7px 0 16px;
        color: #64748b;
        font-size: 12px;
        line-height: 1.5;
      }

      .pp-enable-media-btn {
        padding: 11px 16px;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        border: 0;
        border-radius: 11px;
        color: white;
        font-size: 12px;
        font-weight: 800;
        background:
          linear-gradient(
            135deg,
            #06b6d4,
            #8b5cf6
          );
        box-shadow:
          0 10px 25px
          rgba(99, 102, 241, 0.25);
      }

      .pp-camera-overlay {
        position: absolute;
        z-index: 5;
        right: 0;
        bottom: 0;
        left: 0;
        padding: 28px 16px 15px;
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        background:
          linear-gradient(
            transparent,
            rgba(0, 0, 0, 0.78)
          );
      }

      .pp-camera-name {
        color: #94a3b8;
        font-size: 11px;
      }

      .pp-camera-name strong {
        display: block;
        margin-top: 4px;
        color: white;
        font-size: 14px;
      }

      .pp-camera-icons {
        display: flex;
        gap: 12px;
        color: #22d3ee;
      }

      .pp-media-error {
        margin: 12px;
        padding: 11px 12px;
        display: flex;
        align-items: flex-start;
        gap: 8px;
        color: #fbbf24;
        border: 1px solid
          rgba(245, 158, 11, 0.25);
        border-radius: 12px;
        background: rgba(
          245,
          158,
          11,
          0.06
        );
        font-size: 11px;
        line-height: 1.45;
      }

      .pp-face-status {
        margin: 12px;
        padding: 12px;
        display: flex;
        align-items: center;
        gap: 10px;
        border-radius: 13px;
        border: 1px solid
          rgba(51, 65, 85, 0.8);
        background: rgba(
          2,
          6,
          23,
          0.55
        );
      }

      .pp-face-status-icon {
        width: 38px;
        height: 38px;
        display: grid;
        place-items: center;
        border-radius: 11px;
      }

      .pp-face-status-icon.success {
        color: #34d399;
        background: rgba(
          16,
          185,
          129,
          0.08
        );
      }

      .pp-face-status-icon.warning {
        color: #fbbf24;
        background: rgba(
          245,
          158,
          11,
          0.08
        );
      }

      .pp-face-status span {
        display: block;
        color: #64748b;
        font-size: 10px;
      }

      .pp-face-status strong {
        display: block;
        margin-top: 2px;
        color: #f8fafc;
        font-size: 12px;
      }

      .pp-face-count {
        margin-left: auto;
        display: flex;
        align-items: center;
        gap: 5px;
        color: #22d3ee;
        font-size: 11px;
        font-weight: 700;
      }

      .pp-media-grid {
        display: grid;
        grid-template-columns: repeat(
          2,
          minmax(0, 1fr)
        );
        gap: 10px;
        padding: 0 12px 12px;
      }

      .pp-media-card {
        min-height: 66px;
        padding: 10px;
        display: flex;
        align-items: center;
        gap: 9px;
        border-radius: 13px;
        border: 1px solid
          rgba(51, 65, 85, 0.8);
        background: rgba(
          2,
          6,
          23,
          0.55
        );
      }

      .pp-media-card-icon {
        width: 32px;
        height: 32px;
        display: grid;
        place-items: center;
        border-radius: 9px;
      }

      .pp-media-card-icon.success {
        color: #34d399;
        background: rgba(
          16,
          185,
          129,
          0.08
        );
      }

      .pp-media-card-icon.danger {
        color: #fb7185;
        background: rgba(
          244,
          63,
          94,
          0.08
        );
      }

      .pp-media-card span {
        display: block;
        color: #64748b;
        font-size: 10px;
      }

      .pp-media-card strong {
        display: block;
        margin-top: 3px;
        font-size: 12px;
      }

      .success-text {
        color: #34d399;
      }

      .danger-text {
        color: #fb7185;
      }

      .pp-reconnect-btn {
        width: calc(100% - 24px);
        margin: 0 12px 12px;
        min-height: 42px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        border: 1px solid
          rgba(6, 182, 212, 0.3);
        border-radius: 11px;
        color: #67e8f9;
        background: rgba(
          6,
          182,
          212,
          0.06
        );
        font-size: 12px;
        font-weight: 800;
      }


      /* ===================================================
         INTERVIEW PANEL
      =================================================== */

      .pp-interview-panel {
        min-width: 0;
        padding: 22px;
        border: 1px solid
          rgba(51, 65, 85, 0.85);
        border-radius: 22px;
        background: rgba(
          15,
          23,
          42,
          0.76
        );
        box-shadow:
          0 25px 80px
          rgba(0, 0, 0, 0.15);
      }


      /* ===================================================
         AI INTERVIEWER
      =================================================== */

      .pp-ai-interviewer {
        position: relative;
        min-height: 150px;
        padding: 18px 20px;
        overflow: hidden;
        display: flex;
        align-items: center;
        gap: 20px;
        border: 1px solid
          rgba(6, 182, 212, 0.22);
        border-radius: 22px;
        background:
          radial-gradient(
            circle at 25% 50%,
            rgba(6, 182, 212, 0.1),
            transparent 35%
          ),
          radial-gradient(
            circle at 80% 50%,
            rgba(139, 92, 246, 0.12),
            transparent 40%
          ),
          #081225;
      }

      .pp-ai-grid-bg {
        position: absolute;
        inset: 0;
        opacity: 0.25;
        background-image:
          linear-gradient(
            rgba(34, 211, 238, 0.08)
            1px,
            transparent 1px
          ),
          linear-gradient(
            90deg,
            rgba(34, 211, 238, 0.08)
            1px,
            transparent 1px
          );
        background-size:
          25px 25px;
        pointer-events: none;
      }

      .pp-ai-orb {
        position: relative;
        width: 94px;
        height: 94px;
        flex: 0 0 94px;
        display: grid;
        place-items: center;
        animation: aiFloat 4s ease-in-out infinite;
      }

      .pp-ai-brain {
        position: relative;
        z-index: 4;
        width: 76px;
        height: 76px;
        display: grid;
        place-items: center;
        border-radius: 26px;
        color: white;
        background:
          linear-gradient(
            135deg,
            #06b6d4,
            #6366f1 50%,
            #9333ea
          );
        border: 2px solid
          rgba(255, 255, 255, 0.16);
        box-shadow:
          0 0 35px
          rgba(34, 211, 238, 0.3),
          0 0 70px
          rgba(139, 92, 246, 0.2);
      }

      .pp-ai-orb.active
        .pp-ai-brain {
        animation:
          aiGlow 1s ease-in-out
          infinite alternate;
      }

      .pp-ai-ring {
        position: absolute;
        border: 1px solid
          rgba(34, 211, 238, 0.35);
        border-radius: 50%;
      }

      .pp-ai-ring.ring-one {
        width: 90px;
        height: 90px;
        animation:
          aiRing 3s linear infinite;
      }

      .pp-ai-ring.ring-two {
        width: 108px;
        height: 108px;
        border-color:
          rgba(139, 92, 246, 0.24);
        animation:
          aiRingReverse 5s linear infinite;
      }

      .pp-ai-sparkle {
        position: absolute;
        z-index: 7;
        display: grid;
        place-items: center;
        color: #67e8f9;
        animation:
          sparkle 2s ease-in-out infinite;
      }

      .sparkle-one {
        top: 3px;
        right: 2px;
      }

      .sparkle-two {
        bottom: 7px;
        left: 3px;
        color: #c4b5fd;
        animation-delay: 0.7s;
      }

      .pp-ai-live-dot {
        position: absolute;
        z-index: 8;
        top: 4px;
        right: 5px;
        width: 10px;
        height: 10px;
        border: 2px solid #081225;
        border-radius: 50%;
        background: #34d399;
        box-shadow:
          0 0 12px
          rgba(52, 211, 153, 0.8);
      }

      .pp-ai-info {
        position: relative;
        z-index: 2;
        flex: 1;
        min-width: 0;
      }

      .pp-ai-label {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .pp-ai-label span {
        color: #22d3ee;
        font-size: 11px;
        font-weight: 900;
        letter-spacing: 0.08em;
      }

      .pp-ai-label b {
        padding: 3px 6px;
        border-radius: 999px;
        color: #34d399;
        background: rgba(
          52,
          211,
          153,
          0.08
        );
        font-size: 8px;
      }

      .pp-ai-info h2 {
        margin: 4px 0 2px;
        font-size: 22px;
        letter-spacing: -0.04em;
      }

      .pp-ai-info p {
        margin: 0;
        color: #64748b;
        font-size: 12px;
      }

      .pp-ai-status-row {
        margin-top: 10px;
        display: flex;
        align-items: center;
        gap: 7px;
        color: #64748b;
        font-size: 10px;
      }

      .pp-ai-status-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #22d3ee;
        box-shadow:
          0 0 10px
          rgba(34, 211, 238, 0.8);
      }

      .pp-waveform {
        height: 18px;
        display: flex;
        align-items: center;
        gap: 3px;
      }

      .pp-waveform i {
        width: 3px;
        border-radius: 999px;
        background: #22d3ee;
        animation: waveform 0.8s ease-in-out infinite;
      }

      .pp-waveform i:nth-child(1) {
        animation-delay: 0s;
      }

      .pp-waveform i:nth-child(2) {
        animation-delay: 0.12s;
      }

      .pp-waveform i:nth-child(3) {
        animation-delay: 0.24s;
      }

      .pp-waveform i:nth-child(4) {
        animation-delay: 0.36s;
      }

      .pp-waveform i:nth-child(5) {
        animation-delay: 0.48s;
      }

      .pp-ask-btn {
        position: relative;
        z-index: 3;
        min-height: 44px;
        padding: 0 15px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        border: 1px solid
          rgba(139, 92, 246, 0.45);
        border-radius: 12px;
        color: #ddd6fe;
        background: rgba(
          139,
          92,
          246,
          0.08
        );
        font-size: 12px;
        font-weight: 800;
        transition: 0.2s ease;
      }

      .pp-ask-btn:hover {
        transform: translateY(-1px);
        background: rgba(
          139,
          92,
          246,
          0.16
        );
      }

      .pp-ask-btn.speaking {
        color: #67e8f9;
        border-color:
          rgba(34, 211, 238, 0.4);
      }


      /* ===================================================
         QUESTION
      =================================================== */

      .pp-question-section {
        margin-top: 28px;
      }

      .pp-question-top {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 15px;
      }

      .pp-question-number {
        color: #22d3ee;
        font-size: 11px;
        font-weight: 900;
        letter-spacing: 0.12em;
      }

      .pp-question-top h2 {
        margin: 7px 0 0;
        font-size: 25px;
        letter-spacing: -0.04em;
      }

      .pp-ai-generated {
        display: flex;
        align-items: center;
        gap: 6px;
        color: #a78bfa;
        font-size: 11px;
        font-weight: 700;
      }

      .pp-question-card {
        margin-top: 18px;
        padding: 25px;
        display: flex;
        align-items: flex-start;
        gap: 15px;
        border: 1px solid
          rgba(34, 211, 238, 0.15);
        border-radius: 20px;
        background:
          radial-gradient(
            circle at 90% 10%,
            rgba(14, 165, 233, 0.09),
            transparent 35%
          ),
          #071223;
      }

      .pp-question-icon {
        width: 42px;
        height: 42px;
        flex: 0 0 42px;
        display: grid;
        place-items: center;
        border-radius: 13px;
        color: #22d3ee;
        background: rgba(
          6,
          182,
          212,
          0.08
        );
        border: 1px solid
          rgba(6, 182, 212, 0.2);
      }

      .pp-question-card h3 {
        margin: 1px 0 12px;
        font-size: 21px;
        line-height: 1.5;
        letter-spacing: -0.025em;
      }

      .pp-question-status {
        display: flex;
        align-items: center;
        gap: 7px;
        color: #64748b;
        font-size: 11px;
      }

      .pp-question-status span {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #22d3ee;
      }


      /* ===================================================
         ANSWER
      =================================================== */

      .pp-answer-section {
        margin-top: 25px;
      }

      .pp-answer-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 9px;
      }

      .pp-answer-header label {
        color: #cbd5e1;
        font-size: 12px;
        font-weight: 800;
      }

      .pp-answer-header span {
        color: #475569;
        font-size: 10px;
      }

      .pp-answer-textarea {
        width: 100%;
        min-height: 235px;
        resize: vertical;
        padding: 18px;
        border: 1px solid
          rgba(51, 65, 85, 0.95);
        outline: none;
        border-radius: 18px;
        color: #f8fafc;
        background: #020617;
        font-size: 14px;
        line-height: 1.7;
        transition:
          border-color 0.2s ease,
          box-shadow 0.2s ease;
      }

      .pp-answer-textarea::placeholder {
        color: #334155;
      }

      .pp-answer-textarea:focus {
        border-color:
          rgba(34, 211, 238, 0.55);
        box-shadow:
          0 0 0 3px
          rgba(34, 211, 238, 0.08);
      }

      .pp-answer-actions {
        margin-top: 15px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .pp-speak-btn {
        min-height: 47px;
        padding: 0 17px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        border: 1px solid
          rgba(6, 182, 212, 0.4);
        border-radius: 12px;
        color: #22d3ee;
        background: rgba(
          6,
          182,
          212,
          0.06
        );
        font-size: 13px;
        font-weight: 800;
      }

      .pp-speak-btn.listening {
        color: #fb7185;
        border-color:
          rgba(244, 63, 94, 0.4);
        background: rgba(
          244,
          63,
          94,
          0.06
        );
        animation: listeningPulse 1.3s infinite;
      }

      .pp-submit-btn {
        min-height: 49px;
        padding: 0 21px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 9px;
        border: 0;
        border-radius: 13px;
        color: white;
        background:
          linear-gradient(
            135deg,
            #06b6d4,
            #8b5cf6
          );
        box-shadow:
          0 12px 30px
          rgba(99, 102, 241, 0.2);
        font-size: 13px;
        font-weight: 900;
        transition: 0.2s ease;
      }

      .pp-submit-btn:not(:disabled):hover {
        transform: translateY(-1px);
        box-shadow:
          0 16px 35px
          rgba(99, 102, 241, 0.3);
      }

      .pp-tip-toggle {
        margin-top: 18px;
        padding: 0;
        display: flex;
        align-items: center;
        gap: 7px;
        border: 0;
        background: transparent;
        color: #fbbf24;
        font-size: 12px;
        font-weight: 700;
      }

      .pp-tip {
        margin-top: 10px;
        padding: 13px 14px;
        display: flex;
        gap: 10px;
        color: #94a3b8;
        border: 1px solid
          rgba(245, 158, 11, 0.18);
        border-radius: 13px;
        background: rgba(
          245,
          158,
          11,
          0.05
        );
        font-size: 11px;
        line-height: 1.6;
      }

      .pp-tip svg {
        flex: 0 0 auto;
        color: #fbbf24;
      }


      /* ===================================================
         EVALUATION
      =================================================== */

      .pp-evaluation-card {
        margin-top: 25px;
        padding: 20px;
        border: 1px solid
          rgba(139, 92, 246, 0.3);
        border-radius: 20px;
        background:
          radial-gradient(
            circle at 90% 10%,
            rgba(139, 92, 246, 0.1),
            transparent 35%
          ),
          #071123;
        animation: evaluationIn 0.4s ease;
      }

      .pp-evaluation-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
      }

      .pp-evaluation-title {
        display: flex;
        align-items: center;
        gap: 11px;
      }

      .pp-evaluation-icon {
        width: 43px;
        height: 43px;
        display: grid;
        place-items: center;
        border-radius: 13px;
        color: #c4b5fd;
        background: rgba(
          139,
          92,
          246,
          0.1
        );
      }

      .pp-evaluation-title span {
        color: #a78bfa;
        font-size: 10px;
        font-weight: 900;
        letter-spacing: 0.1em;
      }

      .pp-evaluation-title h3 {
        margin: 4px 0 0;
        font-size: 17px;
      }

      .pp-score-circle {
        position: relative;
        width: 76px;
        height: 76px;
        flex: 0 0 76px;
      }

      .pp-score-circle svg {
        width: 100%;
        height: 100%;
        transform: rotate(-90deg);
      }

      .pp-score-circle circle {
        fill: none;
        stroke-width: 8;
      }

      .pp-score-circle .score-bg {
        stroke: #1e293b;
      }

      .pp-score-circle .score-progress {
        stroke: #8b5cf6;
        stroke-linecap: round;
      }

      .pp-score-circle > div {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: baseline;
        justify-content: center;
        align-content: center;
        flex-wrap: wrap;
      }

      .pp-score-circle strong {
        font-size: 20px;
      }

      .pp-score-circle span {
        color: #64748b;
        font-size: 10px;
      }

      .pp-evaluation-grid {
        margin-top: 17px;
        display: grid;
        grid-template-columns: repeat(
          2,
          minmax(0, 1fr)
        );
        gap: 10px;
      }

      .pp-evaluation-item {
        padding: 13px;
        display: flex;
        gap: 10px;
        border-radius: 14px;
        border: 1px solid
          rgba(51, 65, 85, 0.75);
        background: rgba(
          2,
          6,
          23,
          0.4
        );
      }

      .pp-evaluation-item-icon {
        width: 31px;
        height: 31px;
        flex: 0 0 31px;
        display: grid;
        place-items: center;
        border-radius: 9px;
      }

      .pp-evaluation-item.success
        .pp-evaluation-item-icon {
        color: #34d399;
        background: rgba(
          16,
          185,
          129,
          0.08
        );
      }

      .pp-evaluation-item.warning
        .pp-evaluation-item-icon {
        color: #fbbf24;
        background: rgba(
          245,
          158,
          11,
          0.08
        );
      }

      .pp-evaluation-item.info
        .pp-evaluation-item-icon {
        color: #22d3ee;
        background: rgba(
          6,
          182,
          212,
          0.08
        );
      }

      .pp-evaluation-item.default
        .pp-evaluation-item-icon {
        color: #a78bfa;
        background: rgba(
          139,
          92,
          246,
          0.08
        );
      }

      .pp-evaluation-item strong {
        display: block;
        color: #e2e8f0;
        font-size: 11px;
      }

      .pp-evaluation-item p {
        margin: 5px 0 0;
        color: #64748b;
        font-size: 10px;
        line-height: 1.55;
      }

      .pp-ideal-answer {
        margin-top: 12px;
        padding: 14px;
        border-radius: 14px;
        border: 1px solid
          rgba(34, 211, 238, 0.15);
        background: rgba(
          6,
          182,
          212,
          0.04
        );
      }

      .pp-ideal-answer-title {
        display: flex;
        align-items: center;
        gap: 7px;
        color: #67e8f9;
        font-size: 11px;
      }

      .pp-ideal-answer p {
        margin: 8px 0 0;
        color: #94a3b8;
        font-size: 11px;
        line-height: 1.65;
      }

      .pp-evaluation-footer {
        margin-top: 17px;
        padding-top: 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        border-top: 1px solid
          rgba(51, 65, 85, 0.6);
      }

      .pp-evaluation-footer > span {
        color: #64748b;
        font-size: 11px;
      }

      .pp-next-btn {
        min-height: 43px;
        padding: 0 15px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        border: 0;
        border-radius: 11px;
        color: white;
        background:
          linear-gradient(
            135deg,
            #06b6d4,
            #8b5cf6
          );
        font-size: 12px;
        font-weight: 900;
      }

      .pp-evaluation-warning {
        margin-top: 15px;
        padding: 14px;
        display: flex;
        gap: 10px;
        color: #fbbf24;
        border-radius: 13px;
        background: rgba(
          245,
          158,
          11,
          0.05
        );
        border: 1px solid
          rgba(245, 158, 11, 0.15);
      }

      .pp-evaluation-warning p {
        margin: 0;
        color: #94a3b8;
        font-size: 11px;
        line-height: 1.55;
      }


      /* ===================================================
         MODAL
      =================================================== */

      .pp-modal-overlay {
        position: fixed;
        z-index: 999;
        inset: 0;
        padding: 20px;
        display: grid;
        place-items: center;
        background: rgba(
          2,
          6,
          23,
          0.8
        );
        backdrop-filter: blur(12px);
      }

      .pp-modal {
        position: relative;
        width: min(
          430px,
          100%
        );
        padding: 28px;
        border: 1px solid
          #334155;
        border-radius: 22px;
        background: #0f172a;
        box-shadow:
          0 30px 100px
          rgba(0, 0, 0, 0.5);
        text-align: center;
      }

      .pp-modal-close {
        position: absolute;
        top: 13px;
        right: 13px;
        width: 34px;
        height: 34px;
        display: grid;
        place-items: center;
        border: 0;
        border-radius: 9px;
        color: #64748b;
        background: transparent;
      }

      .pp-modal-icon {
        width: 60px;
        height: 60px;
        margin: 0 auto 15px;
        display: grid;
        place-items: center;
        border-radius: 18px;
        color: #fb7185;
        background: rgba(
          244,
          63,
          94,
          0.08
        );
      }

      .pp-modal h2 {
        margin: 0;
        font-size: 21px;
      }

      .pp-modal p {
        margin: 9px auto 0;
        max-width: 330px;
        color: #64748b;
        font-size: 12px;
        line-height: 1.6;
      }

      .pp-modal-actions {
        margin-top: 22px;
        display: flex;
        gap: 9px;
      }

      .pp-secondary-btn,
      .pp-danger-btn,
      .pp-primary-btn {
        min-height: 44px;
        padding: 0 15px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        border-radius: 11px;
        font-size: 12px;
        font-weight: 800;
      }

      .pp-secondary-btn {
        flex: 1;
        border: 1px solid
          #334155;
        color: #cbd5e1;
        background: #020617;
      }

      .pp-danger-btn {
        flex: 1;
        border: 1px solid
          rgba(244, 63, 94, 0.35);
        color: #fb7185;
        background: rgba(
          244,
          63,
          94,
          0.08
        );
      }

      .pp-primary-btn {
        border: 0;
        color: white;
        background:
          linear-gradient(
            135deg,
            #06b6d4,
            #8b5cf6
          );
      }


      /* ===================================================
         LOADING
      =================================================== */

      .pp-loading-page,
      .pp-error-page,
      .pp-terminated-page {
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 20px;
        background:
          radial-gradient(
            circle at center,
            rgba(99, 102, 241, 0.1),
            transparent 40%
          ),
          #020617;
      }

      .pp-loading-card,
      .pp-error-card,
      .pp-terminated-card {
        width: min(
          500px,
          100%
        );
        padding: 35px;
        text-align: center;
        border: 1px solid
          #334155;
        border-radius: 24px;
        background: #0f172a;
        box-shadow:
          0 30px 100px
          rgba(0, 0, 0, 0.35);
      }

      .pp-loading-card {
        display: flex;
        align-items: center;
        gap: 16px;
        text-align: left;
      }

      .pp-loading-orb {
        width: 62px;
        height: 62px;
        flex: 0 0 62px;
        display: grid;
        place-items: center;
        border-radius: 18px;
        color: white;
        background:
          linear-gradient(
            135deg,
            #06b6d4,
            #8b5cf6
          );
        animation: aiFloat 2s infinite;
      }

      .pp-loading-card h2 {
        margin: 0;
        font-size: 18px;
      }

      .pp-loading-card p {
        margin: 5px 0 0;
        color: #64748b;
        font-size: 12px;
      }

      .pp-loading-card > svg {
        margin-left: auto;
        color: #22d3ee;
      }

      .pp-error-icon,
      .pp-danger-orb {
        width: 78px;
        height: 78px;
        margin: 0 auto 17px;
        display: grid;
        place-items: center;
        border-radius: 23px;
        color: #fb7185;
        background: rgba(
          244,
          63,
          94,
          0.08
        );
      }

      .pp-error-card h2,
      .pp-terminated-card h1 {
        margin: 0;
      }

      .pp-error-card p,
      .pp-terminated-card p {
        color: #64748b;
        font-size: 12px;
        line-height: 1.6;
      }

      .pp-error-card .pp-primary-btn,
      .pp-error-card .pp-secondary-btn {
        margin-top: 10px;
        width: 100%;
      }

      .pp-strike-large {
        margin: 18px 0;
        padding: 13px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        border-radius: 12px;
        color: #fb7185;
        background: rgba(
          244,
          63,
          94,
          0.08
        );
      }

      .pp-terminated-card .pp-primary-btn {
        width: 100%;
      }


      /* ===================================================
         ANIMATIONS
      =================================================== */

      @keyframes aiFloat {
        0%,
        100% {
          transform: translateY(0);
        }

        50% {
          transform: translateY(-5px);
        }
      }

      @keyframes aiGlow {
        from {
          box-shadow:
            0 0 30px
            rgba(34, 211, 238, 0.35),
            0 0 60px
            rgba(139, 92, 246, 0.15);
        }

        to {
          box-shadow:
            0 0 45px
            rgba(34, 211, 238, 0.7),
            0 0 90px
            rgba(139, 92, 246, 0.35);
        }
      }

      @keyframes aiRing {
        from {
          transform: rotate(0deg)
            scale(1);
        }

        50% {
          transform: rotate(180deg)
            scale(1.05);
        }

        to {
          transform: rotate(360deg)
            scale(1);
        }
      }

      @keyframes aiRingReverse {
        from {
          transform: rotate(360deg)
            scale(1);
        }

        to {
          transform: rotate(0deg)
            scale(1.1);
        }
      }

      @keyframes sparkle {
        0%,
        100% {
          opacity: 0.35;
          transform: scale(0.8)
            rotate(0deg);
        }

        50% {
          opacity: 1;
          transform: scale(1.15)
            rotate(15deg);
        }
      }

      @keyframes waveform {
        0%,
        100% {
          height: 4px;
        }

        50% {
          height: 17px;
        }
      }

      @keyframes livePulse {
        0% {
          transform: scale(1);
          opacity: 1;
        }

        50% {
          transform: scale(1.5);
          opacity: 0.5;
        }

        100% {
          transform: scale(1);
          opacity: 1;
        }
      }

      @keyframes timerPulse {
        0%,
        100% {
          box-shadow:
            0 0 0
            rgba(244, 63, 94, 0);
        }

        50% {
          box-shadow:
            0 0 20px
            rgba(244, 63, 94, 0.18);
        }
      }

      @keyframes listeningPulse {
        0%,
        100% {
          box-shadow:
            0 0 0
            rgba(244, 63, 94, 0);
        }

        50% {
          box-shadow:
            0 0 22px
            rgba(244, 63, 94, 0.15);
        }
      }

      @keyframes evaluationIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }

        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .pp-spin {
        animation:
          spin 1s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }


      /* ===================================================
         RESPONSIVE
      =================================================== */

      @media (
        max-width: 1150px
      ) {
        .pp-header {
          padding: 10px 16px;
        }

        .pp-header-center {
          display: none;
        }

        .pp-header-right {
          margin-left: auto;
        }

        .pp-question-progress {
          min-width: 120px;
        }

        .pp-interview-grid {
          grid-template-columns:
            minmax(280px, 360px)
            minmax(0, 1fr);
        }

        .pp-ai-interviewer {
          flex-wrap: wrap;
        }
      }

      @media (
        max-width: 900px
      ) {
        .pp-interview-grid {
          grid-template-columns: 1fr;
        }

        .pp-camera-panel {
          position: relative;
          top: auto;
        }

        .pp-camera-screen {
          height: min(
            55vw,
            360px
          );
        }

        .pp-interview-panel {
          padding: 16px;
        }
      }

      @media (
        max-width: 700px
      ) {
        .pp-main {
          width: min(
            100% - 20px,
            600px
          );
          padding-top: 12px;
        }

        .pp-header {
          min-height: 64px;
        }

        .pp-brand {
          min-width: auto;
        }

        .pp-brand h1 {
          font-size: 13px;
        }

        .pp-brand p {
          display: none;
        }

        .pp-brand-icon {
          width: 38px;
          height: 38px;
        }

        .pp-question-progress {
          display: none;
        }

        .pp-reconnect-header {
          display: none;
        }

        .pp-exit-btn {
          padding: 0 10px;
          font-size: 11px;
        }

        .pp-security-bar {
          align-items: flex-start;
          flex-direction: column;
        }

        .pp-security-items {
          width: 100%;
          justify-content: flex-start;
        }

        .pp-ai-interviewer {
          padding: 16px;
          gap: 13px;
        }

        .pp-ai-orb {
          width: 72px;
          height: 72px;
          flex-basis: 72px;
        }

        .pp-ai-brain {
          width: 60px;
          height: 60px;
        }

        .pp-ai-ring.ring-one {
          width: 72px;
          height: 72px;
        }

        .pp-ai-ring.ring-two {
          width: 85px;
          height: 85px;
        }

        .pp-ai-info {
          min-width: calc(
            100% - 95px
          );
        }

        .pp-ai-info h2 {
          font-size: 18px;
        }

        .pp-ask-btn {
          width: 100%;
        }

        .pp-question-card {
          padding: 18px;
        }

        .pp-question-card h3 {
          font-size: 17px;
        }

        .pp-evaluation-grid {
          grid-template-columns: 1fr;
        }

        .pp-evaluation-footer {
          align-items: stretch;
          flex-direction: column;
        }

        .pp-next-btn {
          width: 100%;
        }

        .pp-answer-actions {
          flex-direction: column;
          align-items: stretch;
        }

        .pp-speak-btn,
        .pp-submit-btn {
          width: 100%;
        }
      }

      @media (
        max-width: 450px
      ) {
        .pp-header-right {
          gap: 5px;
        }

        .pp-timer {
          min-width: 76px;
          padding: 0 8px;
        }

        .pp-exit-btn {
          width: 40px;
          font-size: 0;
        }

        .pp-exit-btn svg {
          width: 17px;
          height: 17px;
        }

        .pp-security-items {
          display: grid;
          grid-template-columns:
            repeat(
              2,
              minmax(0, 1fr)
            );
        }

        .pp-status-pill,
        .pp-strikes-pill {
          justify-content: center;
        }

        .pp-media-grid {
          grid-template-columns: 1fr;
        }
      }

    `}</style>
  );
}


export default MockInterview;