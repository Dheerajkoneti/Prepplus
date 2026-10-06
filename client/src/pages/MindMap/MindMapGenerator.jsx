import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Download,
  Loader2,
  Trash2,
  Clock3,
  Video,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ExternalLink,
  Search,
  Copy,
  RefreshCw,
  FileText,
  Zap,
  Play,
  X,
  History,
  Link2,
  ShieldCheck,
  ChevronRight,
  Wand2,
  BookOpen,
  Layers3,
  FileDown,
  CircleAlert,
  Bot,
} from "lucide-react";
import html2pdf from "html2pdf.js";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const YOUTUBE_API = `${API_URL}/youtube`;

const DEFAULT_STAGE_MESSAGE =
  "Ready to transform your video into knowledge.";

const MindMapGenerator = () => {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [mindMap, setMindMap] = useState("");
  const [currentVideoUrl, setCurrentVideoUrl] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [loading, setLoading] = useState(false);

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMap, setSelectedMap] = useState(null);

  const [exportingId, setExportingId] = useState(null);
  const [copying, setCopying] = useState(false);

  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("IDLE");
  const [stageMessage, setStageMessage] =
    useState(DEFAULT_STAGE_MESSAGE);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const abortControllerRef = useRef(null);
  const toastTimerRef = useRef(null);

  const showToast = useCallback((message, type = "success") => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setToast({
      show: true,
      message,
      type,
    });

    toastTimerRef.current = setTimeout(() => {
      setToast({
        show: false,
        message: "",
        type: "success",
      });
    }, 3800);
  }, []);

  const getToken = () =>
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken") ||
    "";

  const fetchHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);

      const token = getToken();

      if (!token) {
        setHistory([]);
        return;
      }

      const response = await axios.get(`${YOUTUBE_API}/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const maps = response?.data?.data || response?.data || [];
      setHistory(Array.isArray(maps) ? maps : []);
    } catch (error) {
      console.error("Fetch Mind Map History Error:", error);

      if (error?.response?.status === 401) {
        showToast(
          "Your session has expired. Please login again.",
          "error"
        );
      }
    } finally {
      setHistoryLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchHistory();

    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchHistory]);

  const resetGenerationState = () => {
    setProgress(0);
    setStage("IDLE");
    setStageMessage(DEFAULT_STAGE_MESSAGE);
    setSelectedModel("");
  };

  /*
   * The Gemini model is selected by the backend.
   * Never reference GEMINI_MODEL in this React component.
   * The backend can retry/fallback between models and sends
   * the successful model through the SSE "model" event.
   */
  const processSSEEvent = useCallback((eventType, eventData) => {
    let data = eventData;

    try {
      if (typeof eventData === "string") {
        data = JSON.parse(eventData);
      }
    } catch {
      data = { text: eventData };
    }

    if (eventType === "stage") {
      const nextProgress = Number(data?.progress);

      if (!Number.isNaN(nextProgress)) {
        setProgress(Math.max(0, Math.min(100, nextProgress)));
      }

      setStage(data?.stage || "PROCESSING");
      setStageMessage(
        data?.message || "AI is processing your video..."
      );
      return;
    }

    if (eventType === "model") {
      const model = data?.model || "";

      setSelectedModel(model);
      setStage("GENERATING");

      setStageMessage(
        data?.message ||
          (model
            ? `Using ${model} for AI generation...`
            : "AI model selected.")
      );
      return;
    }

    if (eventType === "chunk") {
      const chunkText =
        typeof data === "string"
          ? data
          : data?.text || data?.content || "";

      if (chunkText) {
        setMindMap((previous) => previous + chunkText);
      }

      setStage("GENERATING");
      setStageMessage(
        selectedModel
          ? `AI is generating your study map with ${selectedModel}...`
          : "AI is writing your study mind map..."
      );
      return;
    }

    if (eventType === "complete") {
      setProgress(100);
      setStage("COMPLETED");
      setStageMessage(
        data?.message || "Mind map generated successfully."
      );
      return;
    }

    if (eventType === "error") {
      const message =
        data?.message ||
        data?.error?.message ||
        "AI generation failed. Please try again.";

      setProgress(0);
      setStage("ERROR");
      setStageMessage(message);

      throw new Error(message);
    }
  }, [selectedModel]);

  const parseAndProcessSSEBlock = useCallback(
    (eventBlock) => {
      if (!eventBlock.trim()) return;

      const lines = eventBlock.split(/\r?\n/);

      let eventType = "message";
      let eventData = "";

      for (const rawLine of lines) {
        const line = rawLine.trim();

        if (line.startsWith("event:")) {
          eventType = line.substring(6).trim();
        }

        if (line.startsWith("data:")) {
          const value = line.substring(5).trim();
          eventData += value;
        }
      }

      if (eventData) {
        processSSEEvent(eventType, eventData);
      }
    },
    [processSSEEvent]
  );

  const generateMindMap = async () => {
    if (!youtubeUrl.trim()) {
      showToast("Please enter a YouTube URL.", "error");
      return;
    }

    const token = getToken();

    if (!token) {
      showToast(
        "Please login before generating a mind map.",
        "error"
      );
      return;
    }

    if (loading) return;

    try {
      setLoading(true);
      setMindMap("");
      setSelectedMap(null);
      setSelectedModel("");
      setCurrentVideoUrl(youtubeUrl.trim());

      setProgress(5);
      setStage("VALIDATING");
      setStageMessage("Validating your YouTube video...");

      abortControllerRef.current = new AbortController();

      const response = await fetch(
        `${YOUTUBE_API}/generate-stream`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "text/event-stream",
            "Cache-Control": "no-cache",
          },
          body: JSON.stringify({
            videoUrl: youtubeUrl.trim(),
            userPrompt: customPrompt.trim(),
          }),
          signal: abortControllerRef.current.signal,
        }
      );

      if (!response.ok) {
        let message = "Failed to generate mind map.";

        try {
          const errorData = await response.json();

          message =
            errorData?.message ||
            errorData?.error?.message ||
            message;
        } catch {
          // Server did not return JSON.
        }

        throw new Error(message);
      }

      if (!response.body) {
        throw new Error(
          "Streaming is not supported by this browser."
        );
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, {
          stream: true,
        });

        const events = buffer.split(/\r?\n\r?\n/);
        buffer = events.pop() || "";

        for (const eventBlock of events) {
          parseAndProcessSSEBlock(eventBlock);
        }
      }

      buffer += decoder.decode();

      if (buffer.trim()) {
        parseAndProcessSSEBlock(buffer);
      }

      setProgress(100);
      setStage("COMPLETED");
      setStageMessage("Your AI mind map is ready.");

      showToast(
        "Mind map generated successfully! 🚀",
        "success"
      );

      await fetchHistory();
    } catch (error) {
      if (error?.name === "AbortError") {
        setStage("CANCELLED");
        setStageMessage("Generation cancelled.");
        showToast(
          "Mind map generation cancelled.",
          "error"
        );
        return;
      }

      console.error("Mind Map Generation Error:", error);

      setStage("ERROR");
      setProgress(0);

      const cleanMessage =
        error?.message ||
        "Something went wrong while generating the mind map.";

      setStageMessage(cleanMessage);

      showToast(cleanMessage, "error");
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const cancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const deleteMindMap = async (id) => {
    if (!id) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this mind map?"
    );

    if (!confirmed) return;

    try {
      const token = getToken();

      await axios.delete(`${YOUTUBE_API}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setHistory((previous) =>
        previous.filter((item) => item._id !== id)
      );

      if (selectedMap?._id === id) {
        setSelectedMap(null);
      }

      showToast(
        "Mind map deleted successfully.",
        "success"
      );
    } catch (error) {
      console.error("Delete Mind Map Error:", error);

      showToast(
        error?.response?.data?.message ||
          "Failed to delete mind map.",
        "error"
      );
    }
  };

  const openMindMap = async (item) => {
    if (!item?._id) return;

    try {
      const token = getToken();

      const response = await axios.get(
        `${YOUTUBE_API}/${item._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const map =
        response?.data?.data ||
        response?.data ||
        item;

      setSelectedMap(map);
      setMindMap(map?.mindMap || "");
      setCurrentVideoUrl(map?.videoUrl || "");
      setSelectedModel(map?.model || "");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error("Open Mind Map Error:", error);

      setSelectedMap(item);
      setMindMap(item?.mindMap || "");
      setCurrentVideoUrl(item?.videoUrl || "");
      setSelectedModel(item?.model || "");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const copyMindMap = async () => {
    if (!mindMap) return;

    try {
      setCopying(true);

      await navigator.clipboard.writeText(mindMap);

      showToast(
        "Mind map copied to clipboard.",
        "success"
      );
    } catch (error) {
      console.error(error);

      showToast(
        "Unable to copy mind map.",
        "error"
      );
    } finally {
      setTimeout(() => {
        setCopying(false);
      }, 800);
    }
  };

  const escapeHtml = (value) =>
    String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const inlineMarkdown = (value) => {
    let text = String(value || "");

    text = text.replace(
      /`([^`]+)`/g,
      '<code class="inline-code">$1</code>'
    );

    text = text.replace(
      /\*\*(.+?)\*\*/g,
      "<strong>$1</strong>"
    );

    text = text.replace(
      /__([^_]+)__/g,
      "<strong>$1</strong>"
    );

    text = text.replace(
      /\*([^*]+)\*/g,
      "<em>$1</em>"
    );

    text = text.replace(
      /_([^_]+)_/g,
      "<em>$1</em>"
    );

    return text;
  };

  const cleanMarkdownLine = (line) =>
    String(line || "")
      .replace(/^#{1,6}\s*/, "")
      .replace(/^[-*+]\s+/, "")
      .replace(/^\d+\.\s+/, "")
      .trim();

  /*
   * Converts the AI Markdown into clean PDF HTML.
   * This avoids the old PDF problem where #, ## and ** appeared
   * literally and large empty areas were created by <pre>.
   */
  const markdownToPdfHtml = (rawText) => {
    const lines = String(rawText || "").split(/\r?\n/);
    const output = [];

    let inCodeBlock = false;
    let codeBuffer = [];
    let listItems = [];
    let orderedItems = [];

    const flushLists = () => {
      if (listItems.length) {
        output.push(
          `<ul class="pdf-list">${listItems.join("")}</ul>`
        );
        listItems = [];
      }

      if (orderedItems.length) {
        output.push(
          `<ol class="pdf-list ordered">${orderedItems.join("")}</ol>`
        );
        orderedItems = [];
      }
    };

    const flushCode = () => {
      if (!codeBuffer.length) return;

      output.push(
        `<pre class="pdf-code"><code>${escapeHtml(
          codeBuffer.join("\n")
        )}</code></pre>`
      );

      codeBuffer = [];
    };

    lines.forEach((originalLine) => {
      const line = originalLine.trim();

      if (line.startsWith("```")) {
        flushLists();

        if (inCodeBlock) {
          flushCode();
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }

        return;
      }

      if (inCodeBlock) {
        codeBuffer.push(originalLine);
        return;
      }

      if (!line) {
        flushLists();
        return;
      }

      if (/^#{1}\s+/.test(line)) {
        flushLists();

        output.push(
          `<h1 class="pdf-h1">${inlineMarkdown(
            escapeHtml(line.replace(/^#\s+/, ""))
          )}</h1>`
        );
        return;
      }

      if (/^#{2}\s+/.test(line)) {
        flushLists();

        output.push(
          `<h2 class="pdf-h2">${inlineMarkdown(
            escapeHtml(line.replace(/^##\s+/, ""))
          )}</h2>`
        );
        return;
      }

      if (/^#{3}\s+/.test(line)) {
        flushLists();

        output.push(
          `<h3 class="pdf-h3">${inlineMarkdown(
            escapeHtml(line.replace(/^###\s+/, ""))
          )}</h3>`
        );
        return;
      }

      if (/^#{4,6}\s+/.test(line)) {
        flushLists();

        output.push(
          `<h4 class="pdf-h4">${inlineMarkdown(
            escapeHtml(line.replace(/^#{4,6}\s+/, ""))
          )}</h4>`
        );
        return;
      }

      if (/^[-*+]\s+/.test(line)) {
        orderedItems.length = 0;

        listItems.push(
          `<li>${inlineMarkdown(
            escapeHtml(cleanMarkdownLine(line))
          )}</li>`
        );
        return;
      }

      const orderedMatch = line.match(
        /^(\d+)\.\s+(.+)$/
      );

      if (orderedMatch) {
        listItems.length = 0;

        orderedItems.push(
          `<li><span class="pdf-number">${escapeHtml(
            orderedMatch[1]
          )}</span><span>${inlineMarkdown(
            escapeHtml(orderedMatch[2])
          )}</span></li>`
        );
        return;
      }

      if (/^(-{3,}|\*{3,}|_{3,})$/.test(line)) {
        flushLists();

        output.push(`<div class="pdf-divider"></div>`);
        return;
      }

      flushLists();

      const clean = escapeHtml(
        line
          .replace(/\s+$/g, "")
          .replace(/^>\s?/, "")
      );

      output.push(
        `<p class="pdf-paragraph">${inlineMarkdown(
          clean
        )}</p>`
      );
    });

    flushLists();

    if (inCodeBlock) {
      flushCode();
    }

    return output.join("\n");
  };

  const getPdfTitle = (content) => {
    const heading = String(content || "")
      .split(/\r?\n/)
      .find((line) => /^#\s+/.test(line.trim()));

    return (
      heading?.replace(/^#\s+/, "").trim() ||
      selectedMap?.title ||
      "YouTube AI Study Mind Map"
    );
  };

  const downloadPDF = async (
    content,
    title = "PrepPulse_MindMap",
    id = "current",
    sourceUrl = currentVideoUrl,
    prompt = customPrompt,
    model = selectedModel
  ) => {
    if (!content?.trim()) {
      showToast(
        "There is no mind map to export.",
        "error"
      );
      return;
    }

    let container = null;
    let style = null;

    try {
      setExportingId(id);

      showToast(
        "Preparing your professional PDF report...",
        "success"
      );

      const pdfTitle = getPdfTitle(content);
      const generatedDate = new Date().toLocaleString();
      const pdfContent = markdownToPdfHtml(content);

      /*
       * IMPORTANT:
       * Do NOT place the PDF container at left:-100000px or z-index:-1.
       * html2canvas can capture a blank canvas when the source element is
       * completely outside the viewport or behind the page.
       *
       * We render it at the top-left of the document, keep it visually
       * hidden from the user with opacity:0.01, and let html2canvas capture
       * the actual DOM.
       */
      container = document.createElement("div");

      Object.assign(container.style, {
        position: "absolute",
        left: "0",
        top: "0",
        width: "794px",
        minHeight: "1123px",
        background: "#ffffff",
        zIndex: "2147483647",
        opacity: "0.01",
        pointerEvents: "none",
        overflow: "visible",
      });

      container.innerHTML = `
        <div class="pdf-document">
          <div class="pdf-cover">
            <div class="pdf-brand-row">
              <div class="pdf-logo">
                <span>✦</span>
              </div>

              <div>
                <div class="pdf-brand">PREPPULSE AI</div>
                <div class="pdf-brand-subtitle">
                  Intelligent Learning Platform
                </div>
              </div>
            </div>

            <div class="pdf-cover-line"></div>

            <div class="pdf-eyebrow">
              YOUTUBE • AI STUDY REPORT
            </div>

            <h1 class="pdf-title">
              ${escapeHtml(pdfTitle)}
            </h1>

            <p class="pdf-intro">
              A structured AI-generated study map created
              from your YouTube learning source.
            </p>

            <div class="pdf-meta-grid">
              <div class="pdf-meta-card">
                <span class="pdf-meta-label">GENERATED</span>
                <strong>${escapeHtml(generatedDate)}</strong>
              </div>

              <div class="pdf-meta-card">
                <span class="pdf-meta-label">AI MODEL</span>
                <strong>${escapeHtml(
                  model || "Backend-selected AI model"
                )}</strong>
              </div>

              <div class="pdf-meta-card">
                <span class="pdf-meta-label">CONTENT</span>
                <strong>AI Study Mind Map</strong>
              </div>
            </div>

            ${
              sourceUrl
                ? `
                  <div class="pdf-source-card">
                    <div class="pdf-source-icon">▶</div>
                    <div>
                      <div class="pdf-meta-label">
                        SOURCE VIDEO
                      </div>
                      <div class="pdf-source-url">
                        ${escapeHtml(sourceUrl)}
                      </div>
                    </div>
                  </div>
                `
                : ""
            }

            ${
              prompt
                ? `
                  <div class="pdf-prompt-card">
                    <div class="pdf-meta-label">
                      CUSTOM STUDY INSTRUCTIONS
                    </div>
                    <div class="pdf-prompt-text">
                      ${escapeHtml(prompt)}
                    </div>
                  </div>
                `
                : ""
            }
          </div>

          <div class="pdf-section-header">
            <div class="pdf-section-number">01</div>
            <div>
              <div class="pdf-section-kicker">
                KNOWLEDGE MAP
              </div>
              <h2>Study Notes & Key Concepts</h2>
            </div>
          </div>

          <div class="pdf-content">
            ${pdfContent}
          </div>

          <div class="pdf-footer">
            <span>PrepPulse AI • YouTube Study Mind Map</span>
            <span>
              Generated ${escapeHtml(new Date().toLocaleDateString())}
            </span>
          </div>
        </div>
      `;

      style = document.createElement("style");

      style.textContent = `
        * {
          box-sizing: border-box;
        }

        .pdf-document {
          width: 794px;
          min-height: 1123px;
          padding: 0 52px 45px;
          color: #172033;
          background: #ffffff;
          font-family:
            "Inter",
            "Segoe UI",
            Arial,
            Helvetica,
            sans-serif;
        }

        .pdf-cover {
          padding-top: 42px;
          padding-bottom: 34px;
        }

        .pdf-brand-row {
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .pdf-logo {
          width: 44px;
          height: 44px;
          border-radius: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(
            135deg,
            #0891b2,
            #2563eb 55%,
            #7c3aed
          );
          color: #ffffff;
          font-size: 23px;
          font-weight: 900;
        }

        .pdf-brand {
          font-size: 15px;
          font-weight: 900;
          letter-spacing: 2px;
          color: #0f172a;
        }

        .pdf-brand-subtitle {
          margin-top: 3px;
          font-size: 9px;
          color: #64748b;
          letter-spacing: .6px;
        }

        .pdf-cover-line {
          width: 100%;
          height: 3px;
          margin-top: 24px;
          border-radius: 10px;
          background: linear-gradient(
            90deg,
            #06b6d4,
            #2563eb,
            #7c3aed
          );
        }

        .pdf-eyebrow {
          margin-top: 46px;
          color: #2563eb;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 2px;
        }

        .pdf-title {
          margin: 12px 0 0;
          color: #0f172a;
          font-size: 31px;
          line-height: 1.14;
          font-weight: 950;
          letter-spacing: -.7px;
          page-break-after: avoid;
        }

        .pdf-intro {
          max-width: 650px;
          margin: 13px 0 0;
          color: #64748b;
          font-size: 12px;
          line-height: 1.7;
        }

        .pdf-meta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 10px;
          margin-top: 25px;
        }

        .pdf-meta-card {
          padding: 13px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          background: #f8fafc;
          page-break-inside: avoid;
        }

        .pdf-meta-label {
          display: block;
          margin-bottom: 6px;
          color: #64748b;
          font-size: 7.5px;
          font-weight: 900;
          letter-spacing: 1.2px;
        }

        .pdf-meta-card strong {
          color: #1e293b;
          font-size: 9.5px;
          line-height: 1.45;
          word-break: break-word;
        }

        .pdf-source-card,
        .pdf-prompt-card {
          display: flex;
          gap: 11px;
          margin-top: 11px;
          padding: 13px;
          border: 1px solid #dbeafe;
          border-radius: 12px;
          background: #eff6ff;
          page-break-inside: avoid;
        }

        .pdf-prompt-card {
          display: block;
          background: #f5f3ff;
          border-color: #ddd6fe;
        }

        .pdf-source-icon {
          width: 25px;
          height: 25px;
          min-width: 25px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: #2563eb;
          color: #ffffff;
          font-size: 9px;
          font-weight: 900;
        }

        .pdf-source-url,
        .pdf-prompt-text {
          color: #334155;
          font-size: 9px;
          line-height: 1.55;
          word-break: break-all;
        }

        .pdf-section-header {
          display: flex;
          align-items: center;
          gap: 13px;
          margin: 5px 0 24px;
          padding: 16px 0;
          border-top: 1px solid #e2e8f0;
          border-bottom: 1px solid #e2e8f0;
          page-break-after: avoid;
        }

        .pdf-section-number {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 11px;
          background: #eff6ff;
          color: #2563eb;
          font-size: 10px;
          font-weight: 950;
        }

        .pdf-section-kicker {
          color: #64748b;
          font-size: 7.5px;
          font-weight: 900;
          letter-spacing: 1.4px;
        }

        .pdf-section-header h2 {
          margin: 3px 0 0;
          color: #0f172a;
          font-size: 17px;
          font-weight: 900;
        }

        .pdf-content {
          font-size: 10.5px;
          line-height: 1.65;
        }

        .pdf-h1 {
          margin: 24px 0 12px;
          padding-bottom: 7px;
          color: #0f172a;
          font-size: 20px;
          line-height: 1.25;
          font-weight: 950;
          border-bottom: 2px solid #2563eb;
          page-break-after: avoid;
        }

        .pdf-h2 {
          margin: 21px 0 9px;
          padding-left: 10px;
          color: #1d4ed8;
          font-size: 14px;
          line-height: 1.35;
          font-weight: 900;
          border-left: 3px solid #06b6d4;
          page-break-after: avoid;
        }

        .pdf-h3 {
          margin: 15px 0 7px;
          color: #334155;
          font-size: 11.5px;
          font-weight: 900;
          page-break-after: avoid;
        }

        .pdf-h4 {
          margin: 12px 0 6px;
          color: #475569;
          font-size: 10.5px;
          font-weight: 900;
          page-break-after: avoid;
        }

        .pdf-paragraph {
          margin: 6px 0;
          color: #475569;
          font-size: 10px;
          line-height: 1.72;
        }

        .pdf-paragraph strong,
        .pdf-list strong {
          color: #172033;
          font-weight: 900;
        }

        .pdf-list {
          margin: 7px 0 10px;
          padding: 0 0 0 18px;
          color: #475569;
          page-break-inside: auto;
        }

        .pdf-list li {
          margin: 4px 0;
          padding-left: 3px;
          font-size: 10px;
          line-height: 1.65;
          page-break-inside: avoid;
        }

        .pdf-list.ordered {
          padding-left: 0;
          list-style: none;
        }

        .pdf-list.ordered li {
          display: flex;
          gap: 8px;
          align-items: flex-start;
        }

        .pdf-number {
          width: 18px;
          height: 18px;
          min-width: 18px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          background: #eff6ff;
          color: #2563eb;
          font-size: 7px;
          font-weight: 900;
        }

        .inline-code {
          padding: 2px 4px;
          border-radius: 4px;
          background: #eef2ff;
          color: #4338ca;
          font-family: Consolas, monospace;
          font-size: 8.5px;
        }

        .pdf-code {
          margin: 10px 0;
          padding: 13px;
          border-radius: 10px;
          background: #0f172a;
          color: #cbd5e1;
          font-family: Consolas, "Courier New", monospace;
          font-size: 8px;
          line-height: 1.55;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
          page-break-inside: avoid;
        }

        .pdf-divider {
          height: 1px;
          margin: 16px 0;
          background: #e2e8f0;
        }

        .pdf-footer {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          margin-top: 35px;
          padding-top: 12px;
          border-top: 1px solid #e2e8f0;
          color: #94a3b8;
          font-size: 7.5px;
          page-break-inside: avoid;
        }

        .pdf-content > * {
          break-inside: avoid;
        }

        @media print {
          .pdf-document {
            break-after: page;
          }
        }
      `;

      document.head.appendChild(style);
      document.body.appendChild(container);

      // Give the browser a moment to calculate layout before html2canvas.
      await new Promise((resolve) =>
        requestAnimationFrame(() =>
          requestAnimationFrame(resolve)
        )
      );

      const pdfRoot =
        container.querySelector(".pdf-document");

      if (!pdfRoot) {
        throw new Error(
          "PDF document could not be created."
        );
      }

      // Force layout so the renderer gets the real dimensions.
      void pdfRoot.offsetHeight;

      const safeFileName =
        `${title || "PrepPulse_MindMap"}`
          .replace(/[^a-zA-Z0-9-_]+/g, "_")
          .replace(/_+/g, "_")
          .replace(/^_|_$/g, "");

      const options = {
        margin: [8, 8, 10, 8],
        filename: `${
          safeFileName || "PrepPulse_MindMap"
        }_MindMap.pdf`,
        image: {
          type: "jpeg",
          quality: 0.98,
        },
        html2canvas: {
          scale: 2,
          useCORS: true,
          allowTaint: false,
          backgroundColor: "#ffffff",
          logging: false,
          width: 794,
          windowWidth: 794,
          scrollX: 0,
          scrollY: 0,
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
          compress: true,
        },
        pagebreak: {
          mode: ["css", "legacy"],
          avoid: [
            ".pdf-h1",
            ".pdf-h2",
            ".pdf-h3",
            ".pdf-code",
            ".pdf-meta-card",
            ".pdf-source-card",
            ".pdf-prompt-card",
          ],
        },
      };

      await html2pdf()
        .from(pdfRoot)
        .set(options)
        .save();

      showToast(
        "Professional PDF downloaded successfully.",
        "success"
      );
    } catch (error) {
      console.error("PDF Export Error:", error);

      showToast(
        error?.message ||
          "Failed to export PDF. Please try again.",
        "error"
      );
    } finally {
      if (container?.parentNode) {
        container.parentNode.removeChild(container);
      }

      if (style?.parentNode) {
        style.parentNode.removeChild(style);
      }

      setExportingId(null);
    }
  };

  const renderInlineText = (text) => {
    const parts = String(text || "").split(
      /(\*\*.*?\*\*|`.*?`|\*.*?\*)/g
    );

    return parts.map((part, index) => {
      if (
        part.startsWith("**") &&
        part.endsWith("**")
      ) {
        return (
          <strong key={index}>
            {part.slice(2, -2)}
          </strong>
        );
      }

      if (
        part.startsWith("`") &&
        part.endsWith("`")
      ) {
        return (
          <code
            key={index}
            className="ui-inline-code"
          >
            {part.slice(1, -1)}
          </code>
        );
      }

      if (
        part.startsWith("*") &&
        part.endsWith("*") &&
        !part.startsWith("**")
      ) {
        return (
          <em key={index}>
            {part.slice(1, -1)}
          </em>
        );
      }

      return <span key={index}>{part}</span>;
    });
  };

  const renderFormattedMindMap = (rawText) => {
    if (!rawText) {
      return (
        <div className="empty-result">
          <BookOpen size={26} />
          <span>No content generated yet.</span>
        </div>
      );
    }

    const lines = rawText.split(/\r?\n/);
    const elements = [];

    let inCodeBlock = false;
    let codeLines = [];

    const flushCode = () => {
      if (!codeLines.length) return;

      elements.push(
        <pre
          className="ui-code-block"
          key={`code-${elements.length}`}
        >
          {codeLines.join("\n")}
        </pre>
      );

      codeLines = [];
    };

    lines.forEach((originalLine, index) => {
      const trimmed = originalLine.trim();

      if (trimmed.startsWith("```")) {
        if (inCodeBlock) {
          flushCode();
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeLines.push(originalLine);
        return;
      }

      if (!trimmed) {
        elements.push(
          <div
            key={`space-${index}`}
            className="content-space"
          />
        );
        return;
      }

      if (trimmed.startsWith("# ")) {
        elements.push(
          <motion.h1
            key={index}
            className="ui-h1"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {renderInlineText(
              trimmed.replace(/^#\s+/, "")
            )}
          </motion.h1>
        );
        return;
      }

      if (trimmed.startsWith("## ")) {
        elements.push(
          <motion.h2
            key={index}
            className="ui-h2"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="heading-dot" />
            {renderInlineText(
              trimmed.replace(/^##\s+/, "")
            )}
          </motion.h2>
        );
        return;
      }

      if (trimmed.startsWith("### ")) {
        elements.push(
          <h3 key={index} className="ui-h3">
            {renderInlineText(
              trimmed.replace(/^###\s+/, "")
            )}
          </h3>
        );
        return;
      }

      if (
        trimmed === "---" ||
        trimmed === "***" ||
        trimmed === "___"
      ) {
        elements.push(
          <div
            key={index}
            className="content-divider"
          />
        );
        return;
      }

      const ordered = trimmed.match(
        /^(\d+)\.\s+(.+)$/
      );

      if (ordered) {
        elements.push(
          <div
            key={index}
            className="ui-list-item"
          >
            <span className="list-number">
              {ordered[1]}
            </span>
            <span>
              {renderInlineText(ordered[2])}
            </span>
          </div>
        );
        return;
      }

      if (
        trimmed.startsWith("- ") ||
        trimmed.startsWith("* ") ||
        trimmed.startsWith("+ ")
      ) {
        elements.push(
          <div
            key={index}
            className="ui-list-item"
          >
            <span className="list-bullet">•</span>
            <span>
              {renderInlineText(
                trimmed.replace(/^[-*+]\s+/, "")
              )}
            </span>
          </div>
        );
        return;
      }

      elements.push(
        <p key={index} className="ui-paragraph">
          {renderInlineText(trimmed)}
        </p>
      );
    });

    if (inCodeBlock) {
      flushCode();
    }

    return elements;
  };

  const filteredHistory = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return history;

    return history.filter((item) => {
      const title = item?.title || "";
      const url = item?.videoUrl || "";
      const prompt = item?.userPrompt || "";
      const mindMapText = item?.mindMap || "";

      return (
        title.toLowerCase().includes(query) ||
        url.toLowerCase().includes(query) ||
        prompt.toLowerCase().includes(query) ||
        mindMapText.toLowerCase().includes(query)
      );
    });
  }, [history, searchTerm]);

  const totalMaps = history.length;

  const completedMaps = history.filter(
    (item) =>
      item?.status === "COMPLETED" ||
      !item?.status
  ).length;

  const averageProcessingTime =
    history.length > 0
      ? Math.round(
          history.reduce(
            (sum, item) =>
              sum +
              Number(item?.processingTimeMs || 0),
            0
          ) / history.length
        )
      : 0;

  const pipelineSteps = [
    {
      id: "VALIDATING",
      title: "Validate",
      description: "Checking video",
      icon: Link2,
    },
    {
      id: "TRANSCRIPT",
      title: "Transcript",
      description: "Extracting captions",
      icon: FileText,
    },
    {
      id: "ANALYZING",
      title: "Analyze",
      description: "Understanding content",
      icon: Brain,
    },
    {
      id: "GENERATING",
      title: "Generate",
      description: "Building study map",
      icon: Sparkles,
    },
    {
      id: "COMPLETED",
      title: "Complete",
      description: "Ready to study",
      icon: CheckCircle,
    },
  ];

  const activePipelineIndex =
    pipelineSteps.findIndex(
      (item) => item.id === stage
    );

  const isErrorStage = stage === "ERROR";

  return (
    <div className="mindmap-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        html,
        body,
        #root {
          margin: 0;
          padding: 0;
          width: 100%;
          min-height: 100%;
        }

        body {
          background: #020617;
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
        input,
        textarea {
          font: inherit;
        }

        .mindmap-page {
          min-height: 100vh;
          overflow-x: hidden;
          position: relative;
          color: #f8fafc;
          background:
            radial-gradient(
              circle at 8% 8%,
              rgba(14,165,233,.16),
              transparent 27%
            ),
            radial-gradient(
              circle at 92% 14%,
              rgba(124,58,237,.16),
              transparent 28%
            ),
            radial-gradient(
              circle at 50% 92%,
              rgba(6,182,212,.09),
              transparent 32%
            ),
            linear-gradient(
              135deg,
              #020617 0%,
              #071229 48%,
              #020617 100%
            );
        }

        .mindmap-page::before {
          content: "";
          position: fixed;
          inset: 0;
          pointer-events: none;
          opacity: .22;
          background-image:
            linear-gradient(
              rgba(148,163,184,.045) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(148,163,184,.045) 1px,
              transparent 1px
            );
          background-size: 44px 44px;
          mask-image: linear-gradient(
            to bottom,
            black 0%,
            transparent 82%
          );
        }

        .ambient-orb {
          position: fixed;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(55px);
          opacity: .18;
        }

        .ambient-orb.one {
          width: 260px;
          height: 260px;
          left: -110px;
          top: 34%;
          background: #06b6d4;
        }

        .ambient-orb.two {
          width: 280px;
          height: 280px;
          right: -120px;
          top: 62%;
          background: #7c3aed;
        }

        .mindmap-container {
          width: min(1180px, calc(100% - 32px));
          margin: 0 auto;
          padding: 42px 0 80px;
          position: relative;
          z-index: 1;
        }

        .hero {
          text-align: center;
          margin-bottom: 34px;
        }

        .hero-icon {
          width: 86px;
          height: 86px;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 27px;
          background:
            linear-gradient(
              135deg,
              rgba(14,165,233,.16),
              rgba(99,102,241,.2)
            );
          border: 1px solid rgba(56,189,248,.3);
          box-shadow:
            0 0 60px rgba(14,165,233,.15),
            inset 0 1px 0 rgba(255,255,255,.06);
        }

        .hero h1 {
          margin: 0;
          font-size: clamp(2.35rem, 5.2vw, 4.25rem);
          line-height: 1.02;
          font-weight: 950;
          letter-spacing: -2.7px;
          background:
            linear-gradient(
              90deg,
              #f8fafc,
              #7dd3fc,
              #a78bfa,
              #f8fafc
            );
          background-size: 220% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: titleGlow 6s linear infinite;
        }

        @keyframes titleGlow {
          to {
            background-position: 220% center;
          }
        }

        .hero p {
          max-width: 790px;
          margin: 18px auto 0;
          color: #94a3b8;
          font-size: 1rem;
          line-height: 1.8;
        }

        .hero-highlight {
          color: #67e8f9;
          font-weight: 850;
        }

        .glass-card {
          background:
            linear-gradient(
              145deg,
              rgba(15,23,42,.82),
              rgba(15,23,42,.55)
            );
          border: 1px solid rgba(148,163,184,.12);
          box-shadow:
            0 30px 90px rgba(0,0,0,.4),
            inset 0 1px 0 rgba(255,255,255,.035);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-radius: 28px;
        }

        .generator-card {
          padding: 30px;
          position: relative;
          overflow: hidden;
        }

        .generator-card::before {
          content: "";
          position: absolute;
          width: 350px;
          height: 350px;
          right: -210px;
          top: -220px;
          border-radius: 50%;
          background: rgba(59,130,246,.14);
          filter: blur(55px);
          pointer-events: none;
        }

        .section-label {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          position: relative;
          z-index: 1;
        }

        .section-label-icon {
          width: 42px;
          height: 42px;
          border-radius: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(
            135deg,
            rgba(6,182,212,.13),
            rgba(99,102,241,.13)
          );
          border: 1px solid rgba(56,189,248,.22);
          color: #38bdf8;
        }

        .section-label h2 {
          margin: 0;
          font-size: 1.08rem;
          font-weight: 900;
        }

        .section-label span {
          display: block;
          margin-top: 3px;
          color: #64748b;
          font-size: .74rem;
        }

        .input-wrapper {
          position: relative;
          margin-bottom: 14px;
          z-index: 1;
        }

        .input-icon {
          position: absolute;
          left: 17px;
          top: 50%;
          transform: translateY(-50%);
          color: #38bdf8;
          z-index: 2;
        }

        .custom-input {
          width: 100%;
          border-radius: 17px;
          border: 1px solid rgba(148,163,184,.14);
          background: rgba(2,6,23,.7);
          color: #f8fafc;
          outline: none;
          transition: .25s ease;
        }

        .custom-input::placeholder {
          color: #64748b;
        }

        .custom-input:focus {
          border-color: rgba(56,189,248,.65);
          box-shadow:
            0 0 0 4px rgba(56,189,248,.07),
            0 0 34px rgba(56,189,248,.07);
          background: rgba(2,6,23,.92);
        }

        .custom-input:disabled {
          opacity: .65;
        }

        .url-input {
          padding: 18px 20px 18px 50px;
          font-size: .94rem;
        }

        .prompt-input {
          min-height: 120px;
          padding: 17px 20px;
          resize: vertical;
          line-height: 1.65;
          position: relative;
          z-index: 1;
        }

        .generator-actions {
          display: flex;
          gap: 11px;
          margin-top: 17px;
          position: relative;
          z-index: 1;
        }

        .primary-btn {
          flex: 1;
          min-height: 56px;
          border: none;
          border-radius: 16px;
          color: #fff;
          cursor: pointer;
          font-size: .93rem;
          font-weight: 900;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          background:
            linear-gradient(
              135deg,
              #0284c7,
              #2563eb 48%,
              #4f46e5
            );
          box-shadow:
            0 14px 34px rgba(37,99,235,.25);
          transition: .25s ease;
        }

        .primary-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow:
            0 19px 45px rgba(37,99,235,.36);
        }

        .primary-btn:disabled {
          opacity: .65;
          cursor: not-allowed;
        }

        .cancel-btn {
          min-width: 120px;
          border-radius: 16px;
          border: 1px solid rgba(239,68,68,.28);
          color: #fca5a5;
          background: rgba(239,68,68,.07);
          cursor: pointer;
          font-weight: 850;
        }

        .cancel-btn:hover {
          background: rgba(239,68,68,.14);
        }

        .pipeline-card {
          margin-top: 18px;
          padding: 22px;
          border-radius: 21px;
          background: rgba(2,6,23,.5);
          border: 1px solid rgba(148,163,184,.08);
          position: relative;
          z-index: 1;
        }

        .pipeline-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
          margin-bottom: 13px;
        }

        .pipeline-title {
          color: #e2e8f0;
          font-size: .86rem;
          font-weight: 850;
        }

        .pipeline-status {
          color: #67e8f9;
          font-size: .74rem;
          font-weight: 900;
          letter-spacing: .6px;
        }

        .pipeline-status.error {
          color: #fca5a5;
        }

        .progress-track {
          height: 8px;
          background: rgba(148,163,184,.1);
          border-radius: 99px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          border-radius: inherit;
          background:
            linear-gradient(
              90deg,
              #06b6d4,
              #3b82f6,
              #8b5cf6
            );
          box-shadow: 0 0 20px rgba(59,130,246,.45);
          transition: width .35s ease;
        }

        .progress-fill.error {
          background: linear-gradient(
            90deg,
            #ef4444,
            #f97316
          );
        }

        .stage-message {
          margin-top: 11px;
          display: flex;
          align-items: flex-start;
          gap: 8px;
          color: #94a3b8;
          font-size: .73rem;
          line-height: 1.55;
        }

        .model-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 10px;
          padding: 6px 9px;
          border-radius: 999px;
          color: #a5f3fc;
          background: rgba(6,182,212,.08);
          border: 1px solid rgba(6,182,212,.17);
          font-size: .65rem;
          font-weight: 800;
        }

        .pipeline-steps {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 10px;
          margin-top: 19px;
        }

        .pipeline-step {
          min-width: 0;
          text-align: center;
          color: #475569;
          transition: .25s ease;
        }

        .pipeline-step.active {
          color: #67e8f9;
        }

        .pipeline-step.done {
          color: #86efac;
        }

        .pipeline-step-icon {
          width: 35px;
          height: 35px;
          margin: 0 auto 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 11px;
          border: 1px solid rgba(148,163,184,.1);
          background: rgba(148,163,184,.04);
        }

        .pipeline-step.active .pipeline-step-icon {
          border-color: rgba(56,189,248,.35);
          background: rgba(56,189,248,.1);
          box-shadow: 0 0 20px rgba(56,189,248,.1);
        }

        .pipeline-step.done .pipeline-step-icon {
          border-color: rgba(34,197,94,.3);
          background: rgba(34,197,94,.08);
        }

        .pipeline-step-title {
          font-size: .68rem;
          font-weight: 850;
        }

        .pipeline-step-desc {
          margin-top: 3px;
          color: #475569;
          font-size: .59rem;
        }

        .security-note {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          color: #475569;
          font-size: .66rem;
          margin-top: 18px;
          position: relative;
          z-index: 1;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          margin: 19px 0 34px;
        }

        .stat-card {
          padding: 18px;
          border-radius: 20px;
          background:
            linear-gradient(
              145deg,
              rgba(15,23,42,.7),
              rgba(15,23,42,.42)
            );
          border: 1px solid rgba(148,163,184,.09);
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .stat-icon {
          width: 43px;
          height: 43px;
          min-width: 43px;
          border-radius: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(59,130,246,.1);
          color: #60a5fa;
          border: 1px solid rgba(59,130,246,.11);
        }

        .stat-value {
          font-size: 1.3rem;
          font-weight: 950;
        }

        .stat-label {
          margin-top: 2px;
          color: #64748b;
          font-size: .7rem;
        }

        .result-card {
          margin-top: 28px;
          overflow: hidden;
        }

        .result-header {
          padding: 21px 25px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          border-bottom: 1px solid rgba(148,163,184,.09);
        }

        .result-title {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .result-title-icon {
          width: 43px;
          height: 43px;
          border-radius: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #67e8f9;
          background: rgba(56,189,248,.09);
          border: 1px solid rgba(56,189,248,.15);
        }

        .result-title h2 {
          margin: 0;
          font-size: 1.05rem;
          font-weight: 900;
        }

        .result-title p {
          margin: 4px 0 0;
          color: #64748b;
          font-size: .7rem;
        }

        .result-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .action-btn {
          border: 1px solid rgba(148,163,184,.14);
          background: rgba(148,163,184,.05);
          color: #cbd5e1;
          border-radius: 11px;
          padding: 9px 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: .72rem;
          font-weight: 850;
          transition: .2s ease;
        }

        .action-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          background: rgba(148,163,184,.09);
        }

        .action-btn:disabled {
          opacity: .55;
          cursor: not-allowed;
        }

        .action-btn.primary {
          color: #67e8f9;
          border-color: rgba(56,189,248,.2);
          background: rgba(56,189,248,.08);
        }

        .result-body {
          padding: 27px;
        }

        .source-bar {
          margin-bottom: 18px;
          padding: 12px 14px;
          border-radius: 14px;
          background: rgba(2,6,23,.55);
          border: 1px solid rgba(148,163,184,.08);
          display: flex;
          align-items: center;
          gap: 9px;
          color: #64748b;
          font-size: .72rem;
          word-break: break-all;
        }

        .source-bar a {
          color: #67e8f9;
          text-decoration: none;
        }

        .source-bar a:hover {
          text-decoration: underline;
        }

        .model-result-chip {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin: 0 0 18px;
          padding: 7px 10px;
          border-radius: 999px;
          color: #c4b5fd;
          background: rgba(124,58,237,.08);
          border: 1px solid rgba(124,58,237,.17);
          font-size: .65rem;
          font-weight: 800;
        }

        .mindmap-content {
          padding: 28px;
          border-radius: 22px;
          background:
            radial-gradient(
              circle at top right,
              rgba(37,99,235,.08),
              transparent 31%
            ),
            radial-gradient(
              circle at bottom left,
              rgba(6,182,212,.045),
              transparent 35%
            ),
            rgba(2,6,23,.58);
          border: 1px solid rgba(148,163,184,.08);
          min-height: 200px;
        }

        .ui-h1 {
          margin: 25px 0 14px;
          padding-bottom: 12px;
          color: #f8fafc;
          font-size: clamp(1.55rem, 3vw, 2.05rem);
          line-height: 1.2;
          font-weight: 950;
          letter-spacing: -.7px;
          border-bottom: 1px solid rgba(56,189,248,.2);
        }

        .ui-h2 {
          display: flex;
          align-items: center;
          gap: 11px;
          margin: 24px 0 12px;
          color: #e2e8f0;
          font-size: 1.2rem;
          line-height: 1.35;
          font-weight: 900;
        }

        .heading-dot {
          width: 9px;
          height: 9px;
          min-width: 9px;
          border-radius: 50%;
          background: linear-gradient(
            135deg,
            #38bdf8,
            #6366f1
          );
          box-shadow: 0 0 14px rgba(56,189,248,.7);
        }

        .ui-h3 {
          margin: 16px 0 8px;
          color: #93c5fd;
          font-size: 1rem;
          font-weight: 850;
        }

        .ui-paragraph {
          margin: 7px 0;
          color: #a5b4c7;
          font-size: .94rem;
          line-height: 1.85;
        }

        .ui-paragraph strong {
          color: #f1f5f9;
          font-weight: 850;
        }

        .ui-paragraph em {
          color: #c4b5fd;
        }

        .ui-inline-code {
          padding: 3px 6px;
          border-radius: 6px;
          background: rgba(99,102,241,.1);
          border: 1px solid rgba(99,102,241,.15);
          color: #c4b5fd;
          font-family: Consolas, monospace;
          font-size: .82em;
        }

        .ui-list-item {
          display: flex;
          align-items: flex-start;
          gap: 11px;
          margin: 8px 0;
          color: #cbd5e1;
          line-height: 1.75;
          font-size: .92rem;
        }

        .list-bullet {
          color: #38bdf8;
          font-size: 1.1rem;
          line-height: 1.45;
        }

        .list-number {
          width: 28px;
          height: 28px;
          min-width: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: rgba(59,130,246,.1);
          border: 1px solid rgba(59,130,246,.22);
          color: #60a5fa;
          font-size: .68rem;
          font-weight: 900;
        }

        .ui-code-block {
          margin: 13px 0;
          padding: 15px 17px;
          border-radius: 13px;
          background: rgba(2,6,23,.9);
          border: 1px solid rgba(148,163,184,.1);
          color: #67e8f9;
          font-family:
            "Cascadia Code",
            "SFMono-Regular",
            Consolas,
            monospace;
          font-size: .8rem;
          line-height: 1.65;
          overflow-x: auto;
          white-space: pre-wrap;
        }

        .content-divider {
          height: 1px;
          margin: 21px 0;
          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(56,189,248,.28),
              transparent
            );
        }

        .content-space {
          height: 7px;
        }

        .empty-result {
          min-height: 180px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: #64748b;
        }

        .history-section {
          margin-top: 45px;
        }

        .history-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 18px;
        }

        .history-title {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .history-title h2 {
          margin: 0;
          font-size: 1.35rem;
          font-weight: 950;
        }

        .history-subtitle {
          margin-top: 3px;
          color: #64748b;
          font-size: .7rem;
        }

        .history-search {
          width: 285px;
          max-width: 100%;
          position: relative;
        }

        .history-search svg {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
        }

        .history-search input {
          width: 100%;
          border: 1px solid rgba(148,163,184,.12);
          border-radius: 13px;
          padding: 11px 12px 11px 38px;
          background: rgba(15,23,42,.55);
          color: white;
          outline: none;
        }

        .history-search input:focus {
          border-color: rgba(56,189,248,.4);
        }

        .history-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 17px;
        }

        .history-card {
          padding: 20px;
          position: relative;
          overflow: hidden;
          transition: .25s ease;
        }

        .history-card:hover {
          border-color: rgba(56,189,248,.18);
          box-shadow:
            0 24px 70px rgba(0,0,0,.35),
            0 0 30px rgba(56,189,248,.035);
        }

        .history-card::after {
          content: "";
          position: absolute;
          width: 110px;
          height: 110px;
          right: -65px;
          bottom: -65px;
          border-radius: 50%;
          background: rgba(99,102,241,.08);
          filter: blur(20px);
          pointer-events: none;
        }

        .history-card-top {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
        }

        .history-card-title {
          min-width: 0;
        }

        .history-card-title h3 {
          margin: 0;
          font-size: .92rem;
          font-weight: 900;
          color: #e2e8f0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .history-date {
          margin-top: 5px;
          color: #64748b;
          font-size: .67rem;
        }

        .status-badge {
          flex-shrink: 0;
          padding: 5px 8px;
          border-radius: 8px;
          background: rgba(34,197,94,.08);
          border: 1px solid rgba(34,197,94,.16);
          color: #86efac;
          font-size: .61rem;
          font-weight: 900;
        }

        .status-badge.failed {
          color: #fca5a5;
          background: rgba(239,68,68,.08);
          border-color: rgba(239,68,68,.16);
        }

        .history-url {
          display: flex;
          align-items: center;
          gap: 7px;
          margin: 14px 0;
          color: #67e8f9;
          font-size: .72rem;
          text-decoration: none;
          overflow: hidden;
        }

        .history-url span {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .history-preview {
          height: 132px;
          overflow: hidden;
          padding: 15px;
          border-radius: 14px;
          background: rgba(2,6,23,.52);
          border: 1px solid rgba(148,163,184,.07);
          color: #94a3b8;
          font-size: .72rem;
          line-height: 1.65;
          position: relative;
          white-space: pre-wrap;
        }

        .history-preview::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 58px;
          background:
            linear-gradient(
              transparent,
              rgba(2,6,23,.98)
            );
        }

        .history-actions {
          display: flex;
          gap: 8px;
          margin-top: 13px;
          position: relative;
          z-index: 1;
        }

        .small-action {
          flex: 1;
          padding: 9px 10px;
          border-radius: 10px;
          border: 1px solid rgba(148,163,184,.1);
          background: rgba(148,163,184,.04);
          color: #94a3b8;
          cursor: pointer;
          font-size: .68rem;
          font-weight: 850;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: .2s ease;
        }

        .small-action:hover:not(:disabled) {
          color: #e2e8f0;
          background: rgba(148,163,184,.08);
          transform: translateY(-1px);
        }

        .small-action:disabled {
          opacity: .5;
          cursor: not-allowed;
        }

        .small-action.delete {
          color: #fca5a5;
        }

        .empty-history {
          padding: 58px 20px;
          text-align: center;
        }

        .empty-history-icon {
          width: 62px;
          height: 62px;
          margin: 0 auto 15px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            linear-gradient(
              135deg,
              rgba(59,130,246,.1),
              rgba(124,58,237,.1)
            );
          color: #60a5fa;
          border: 1px solid rgba(59,130,246,.12);
        }

        .empty-history h3 {
          margin: 0;
          font-size: 1rem;
        }

        .empty-history p {
          margin: 7px auto 0;
          max-width: 470px;
          color: #64748b;
          font-size: .78rem;
          line-height: 1.65;
        }

        .loading-card {
          padding: 35px;
          text-align: center;
          color: #64748b;
        }

        .toast {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 99999;
          min-width: 290px;
          max-width: 430px;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 14px 16px;
          border-radius: 15px;
          color: white;
          font-size: .78rem;
          line-height: 1.45;
          font-weight: 800;
          border: 1px solid rgba(255,255,255,.1);
          backdrop-filter: blur(20px);
          box-shadow: 0 25px 60px rgba(0,0,0,.45);
        }

        .toast.success {
          background: rgba(16,185,129,.92);
        }

        .toast.error {
          background: rgba(220,38,38,.94);
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 850px) {
          .history-grid {
            grid-template-columns: 1fr;
          }

          .pipeline-steps {
            grid-template-columns: repeat(5, minmax(80px,1fr));
            overflow-x: auto;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .history-heading {
            flex-direction: column;
            align-items: stretch;
          }

          .history-search {
            width: 100%;
          }
        }

        @media (max-width: 620px) {
          .mindmap-container {
            width: min(100% - 20px, 1180px);
            padding-top: 25px;
          }

          .hero h1 {
            font-size: 2.45rem;
            letter-spacing: -1.6px;
          }

          .hero p {
            font-size: .86rem;
          }

          .generator-card,
          .result-body {
            padding: 18px;
          }

          .result-header {
            padding: 17px;
            flex-direction: column;
            align-items: stretch;
          }

          .result-actions {
            justify-content: stretch;
          }

          .action-btn {
            flex: 1;
            justify-content: center;
          }

          .mindmap-content {
            padding: 19px;
          }

          .generator-actions {
            flex-direction: column;
          }

          .cancel-btn {
            min-height: 48px;
          }

          .toast {
            left: 10px;
            right: 10px;
            top: 10px;
            min-width: 0;
          }
        }
      `}</style>

      <div className="ambient-orb one" />
      <div className="ambient-orb two" />

      <AnimatePresence>
        {toast.show && (
          <motion.div
            className={`toast ${toast.type}`}
            initial={{
              opacity: 0,
              y: -15,
              x: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
              x: 0,
            }}
            exit={{
              opacity: 0,
              y: -15,
            }}
          >
            {toast.type === "success" ? (
              <CheckCircle size={17} />
            ) : (
              <AlertCircle size={17} />
            )}

            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="mindmap-container">
        <motion.section
          className="hero"
          initial={{
            opacity: 0,
            y: 18,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.65,
          }}
        >
          <motion.div
            className="hero-icon"
            animate={{
              y: [0, -7, 0],
              rotate: [-2, 2, -2],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Brain size={43} color="#38bdf8" />
          </motion.div>

          <h1>
            YouTube Mind Map
            <br />
            Generator
          </h1>

          <p>
            Turn long lectures, tutorials and technical
            videos into structured, revision-ready study
            notes with{" "}
            <span className="hero-highlight">
              PrepPulse AI
            </span>
            .
          </p>
        </motion.section>

        <motion.section
          className="glass-card generator-card"
          initial={{
            opacity: 0,
            y: 25,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.1,
            duration: 0.6,
          }}
        >
          <div className="section-label">
            <div className="section-label-icon">
              <Wand2 size={19} />
            </div>

            <div>
              <h2>Generate Your Study Map</h2>
              <span>
                Real-time transcript + AI generation
              </span>
            </div>
          </div>

          <div className="input-wrapper">
            <Video className="input-icon" size={19} />

            <input
              type="url"
              value={youtubeUrl}
              onChange={(event) =>
                setYoutubeUrl(event.target.value)
              }
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !loading
                ) {
                  generateMindMap();
                }
              }}
              placeholder="Paste YouTube video URL..."
              className="custom-input url-input"
              disabled={loading}
            />
          </div>

          <textarea
            value={customPrompt}
            onChange={(event) =>
              setCustomPrompt(event.target.value)
            }
            placeholder="Custom instructions (optional): e.g. Create detailed Java interview notes, explain in simple English, generate important questions, summarize in Telugu..."
            className="custom-input prompt-input"
            disabled={loading}
          />

          <div className="generator-actions">
            <button
              className="primary-btn"
              onClick={generateMindMap}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2
                    size={19}
                    className="animate-spin"
                  />
                  PrepPulse AI is processing...
                </>
              ) : (
                <>
                  <Sparkles size={19} />
                  Generate AI Mind Map
                </>
              )}
            </button>

            {loading && (
              <button
                className="cancel-btn"
                onClick={cancelGeneration}
              >
                <X size={16} />
                Cancel
              </button>
            )}
          </div>

          {(loading || stage !== "IDLE") && (
            <motion.div
              className="pipeline-card"
              initial={{
                opacity: 0,
                height: 0,
              }}
              animate={{
                opacity: 1,
                height: "auto",
              }}
            >
              <div className="pipeline-header">
                <span className="pipeline-title">
                  AI Processing Pipeline
                </span>

                <span
                  className={`pipeline-status ${
                    isErrorStage ? "error" : ""
                  }`}
                >
                  {isErrorStage ? "ERROR" : `${progress}%`}
                </span>
              </div>

              <div className="progress-track">
                <motion.div
                  className={`progress-fill ${
                    isErrorStage ? "error" : ""
                  }`}
                  animate={{
                    width: `${isErrorStage ? 100 : progress}%`,
                  }}
                />
              </div>

              <div className="stage-message">
                {isErrorStage ? (
                  <CircleAlert
                    size={14}
                    color="#fca5a5"
                  />
                ) : loading ? (
                  <Loader2
                    size={14}
                    className="animate-spin"
                    color="#67e8f9"
                  />
                ) : (
                  <CheckCircle
                    size={14}
                    color="#86efac"
                  />
                )}

                <span>{stageMessage}</span>
              </div>

              {selectedModel && (
                <div className="model-chip">
                  <Bot size={12} />
                  Backend selected: {selectedModel}
                </div>
              )}

              <div className="pipeline-steps">
                {pipelineSteps.map((item, index) => {
                  const Icon = item.icon;

                  const isDone =
                    stage === "COMPLETED" ||
                    index < activePipelineIndex;

                  const isActive =
                    stage === item.id;

                  return (
                    <div
                      key={item.id}
                      className={`pipeline-step ${
                        isActive ? "active" : ""
                      } ${isDone ? "done" : ""}`}
                    >
                      <div className="pipeline-step-icon">
                        <Icon size={15} />
                      </div>

                      <div className="pipeline-step-title">
                        {item.title}
                      </div>

                      <div className="pipeline-step-desc">
                        {item.description}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          <div className="security-note">
            <ShieldCheck size={13} />
            Saved mind maps are linked to your account.
          </div>
        </motion.section>

        <div className="stats-grid">
          <motion.div
            className="stat-card"
            whileHover={{ y: -3 }}
          >
            <div className="stat-icon">
              <History size={19} />
            </div>

            <div>
              <div className="stat-value">
                {totalMaps}
              </div>
              <div className="stat-label">
                Saved Mind Maps
              </div>
            </div>
          </motion.div>

          <motion.div
            className="stat-card"
            whileHover={{ y: -3 }}
          >
            <div className="stat-icon">
              <CheckCircle size={19} />
            </div>

            <div>
              <div className="stat-value">
                {completedMaps}
              </div>
              <div className="stat-label">
                Completed Generations
              </div>
            </div>
          </motion.div>

          <motion.div
            className="stat-card"
            whileHover={{ y: -3 }}
          >
            <div className="stat-icon">
              <Clock3 size={19} />
            </div>

            <div>
              <div className="stat-value">
                {averageProcessingTime
                  ? `${(
                      averageProcessingTime / 1000
                    ).toFixed(1)}s`
                  : "—"}
              </div>

              <div className="stat-label">
                Avg. Processing Time
              </div>
            </div>
          </motion.div>
        </div>

        <AnimatePresence>
          {mindMap && (
            <motion.section
              className="glass-card result-card"
              initial={{
                opacity: 0,
                y: 30,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: 20,
              }}
            >
              <div className="result-header">
                <div className="result-title">
                  <div className="result-title-icon">
                    <Layers3 size={20} />
                  </div>

                  <div>
                    <h2>Generated Study Map</h2>
                    <p>
                      Structured AI-generated learning
                      content
                    </p>
                  </div>
                </div>

                <div className="result-actions">
                  <button
                    className="action-btn"
                    onClick={copyMindMap}
                  >
                    {copying ? (
                      <CheckCircle size={14} />
                    ) : (
                      <Copy size={14} />
                    )}
                    {copying ? "Copied" : "Copy"}
                  </button>

                  <button
                    className="action-btn primary"
                    onClick={() =>
                      downloadPDF(
                        mindMap,
                        "Generated_MindMap",
                        "current",
                        currentVideoUrl,
                        customPrompt,
                        selectedModel
                      )
                    }
                    disabled={exportingId === "current"}
                  >
                    {exportingId === "current" ? (
                      <Loader2
                        size={14}
                        className="animate-spin"
                      />
                    ) : (
                      <FileDown size={14} />
                    )}
                    PDF
                  </button>
                </div>
              </div>

              <div className="result-body">
                {currentVideoUrl && (
                  <div className="source-bar">
                    <Video size={15} />

                    <span>Source:</span>

                    <a
                      href={currentVideoUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {currentVideoUrl}
                    </a>

                    <ExternalLink size={13} />
                  </div>
                )}

                {selectedModel && (
                  <div className="model-result-chip">
                    <Bot size={13} />
                    Generated using {selectedModel}
                  </div>
                )}

                <div className="mindmap-content">
                  {renderFormattedMindMap(mindMap)}
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <section className="history-section">
          <div className="history-heading">
            <div className="history-title">
              <Clock3
                size={22}
                color="#38bdf8"
              />

              <div>
                <h2>Saved Mind Maps</h2>
                <div className="history-subtitle">
                  Your real generated study content
                </div>
              </div>
            </div>

            <div className="history-search">
              <Search size={15} />

              <input
                type="text"
                placeholder="Search your maps..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
              />
            </div>
          </div>

          {historyLoading ? (
            <div className="glass-card loading-card">
              <Loader2
                size={24}
                className="animate-spin"
              />
              <div>
                Loading your saved mind maps...
              </div>
            </div>
          ) : filteredHistory.length === 0 ? (
            <motion.div
              className="glass-card empty-history"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="empty-history-icon">
                <Brain size={26} />
              </div>

              <h3>
                {searchTerm
                  ? "No matching mind maps"
                  : "No Saved Mind Maps Yet"}
              </h3>

              <p>
                {searchTerm
                  ? "Try a different search keyword."
                  : "Generate your first YouTube mind map and it will automatically appear here."}
              </p>
            </motion.div>
          ) : (
            <div className="history-grid">
              {filteredHistory.map((item, index) => (
                <motion.article
                  key={item._id}
                  className="glass-card history-card"
                  initial={{
                    opacity: 0,
                    y: 18,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: index * 0.04,
                  }}
                  whileHover={{ y: -3 }}
                >
                  <div className="history-card-top">
                    <div className="history-card-title">
                      <h3>
                        {item.title ||
                          "YouTube Study Mind Map"}
                      </h3>

                      <div className="history-date">
                        {item.createdAt
                          ? new Date(
                              item.createdAt
                            ).toLocaleString()
                          : "Saved recently"}
                      </div>
                    </div>

                    <div
                      className={`status-badge ${
                        item.status === "FAILED"
                          ? "failed"
                          : ""
                      }`}
                    >
                      {item.status === "FAILED"
                        ? "FAILED"
                        : "COMPLETED"}
                    </div>
                  </div>

                  {item.videoUrl && (
                    <a
                      className="history-url"
                      href={item.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Video size={14} />
                      <span>{item.videoUrl}</span>
                      <ExternalLink size={12} />
                    </a>
                  )}

                  <div className="history-preview">
                    {item.mindMap ||
                      "No mind map content available."}
                  </div>

                  <div className="history-actions">
                    <button
                      className="small-action"
                      onClick={() =>
                        openMindMap(item)
                      }
                    >
                      <Play size={13} />
                      Open
                      <ChevronRight size={12} />
                    </button>

                    <button
                      className="small-action"
                      onClick={() =>
                        downloadPDF(
                          item.mindMap,
                          `YouTube_MindMap_${item._id}`,
                          item._id,
                          item.videoUrl,
                          item.userPrompt,
                          item.model
                        )
                      }
                      disabled={
                        exportingId === item._id
                      }
                    >
                      {exportingId === item._id ? (
                        <Loader2
                          size={13}
                          className="animate-spin"
                        />
                      ) : (
                        <Download size={13} />
                      )}
                      PDF
                    </button>

                    <button
                      className="small-action delete"
                      onClick={() =>
                        deleteMindMap(item._id)
                      }
                    >
                      <Trash2 size={13} />
                      Delete
                    </button>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </section>

        <footer
          style={{
            marginTop: 60,
            textAlign: "center",
            color: "#475569",
            fontSize: ".68rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
            }}
          >
            <Sparkles size={13} />
            PrepPulse AI Learning Platform
            <span>•</span>
            Real-time AI Study Tools
          </div>
        </footer>
      </main>
    </div>
  );
};

export default MindMapGenerator;
