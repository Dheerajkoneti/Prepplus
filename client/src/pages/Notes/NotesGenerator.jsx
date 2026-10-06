import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import API from "../../services/api";
import html2pdf from "html2pdf.js";

/* =========================================================
   NOTES GENERATOR
   PrepPulse AI
   ========================================================= */

const SUGGESTIONS = [
  "Java Collections Framework",
  "Spring Boot",
  "SQL Joins",
  "Object Oriented Programming",
  "Exception Handling",
  "Data Structures and Algorithms",
  "Operating Systems",
  "Computer Networks",
  "DBMS",
  "Machine Learning",
];

const getToken = () => {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("accessToken") ||
    null
  );
};

const getAuthConfig = () => {
  const token = getToken();

  if (!token) {
    return {};
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

const getFriendlyError = (error, fallback) => {
  const status = error?.response?.status;

  const backendMessage =
    error?.response?.data?.message ||
    error?.response?.data?.error;

  if (status === 401) {
    return "Your session has expired. Please login again.";
  }

  if (status === 403) {
    return "You don't have permission to access this note.";
  }

  if (status === 404) {
    return "The requested note was not found.";
  }

  if (status >= 500) {
    return (
      backendMessage ||
      "The server is currently unavailable. Please try again."
    );
  }

  return (
    backendMessage ||
    error?.message ||
    fallback
  );
};

/* =========================================================
   MARKDOWN HELPERS
   ========================================================= */

const escapeHtml = (value = "") => {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
};

const inlineMarkdown = (text = "") => {
  let value = escapeHtml(text);

  value = value.replace(
    /\*\*(.*?)\*\*/g,
    "<strong>$1</strong>"
  );

  value = value.replace(
    /\*(.*?)\*/g,
    "<em>$1</em>"
  );

  value = value.replace(
    /`([^`]+)`/g,
    '<code>$1</code>'
  );

  return value;
};

const markdownToHtml = (markdown = "") => {
  const lines = String(markdown)
    .replace(/\r/g, "")
    .split("\n");

  let html = "";
  let inUl = false;
  let inOl = false;
  let inCode = false;
  let codeBuffer = [];

  const closeLists = () => {
    if (inUl) {
      html += "</ul>";
      inUl = false;
    }

    if (inOl) {
      html += "</ol>";
      inOl = false;
    }
  };

  const closeCode = () => {
    if (!inCode) return;

    const code = codeBuffer.join("\n").trim();

    if (code) {
      html += `
        <div class="pdf-code-card">
          <div class="pdf-code-label">
            <span class="pdf-code-dot"></span>
            <span>Example</span>
          </div>

          <pre class="pdf-code"><code>${escapeHtml(
            code
          )}</code></pre>
        </div>
      `;
    }

    codeBuffer = [];
    inCode = false;
  };

  const renderTable = (tableLines) => {
    if (tableLines.length < 2) {
      return;
    }

    const parseRow = (row) => {
      return row
        .trim()
        .replace(/^\|/, "")
        .replace(/\|$/, "")
        .split("|")
        .map((cell) =>
          cell
            .replace(/\\\|/g, "|")
            .trim()
        );
    };

    const header = parseRow(
      tableLines[0]
    );

    const bodyLines =
      tableLines.slice(2);

    const body =
      bodyLines.length > 0
        ? bodyLines
        : [];

    html += `
      <div class="pdf-table-wrap">
        <table class="pdf-table">
          <thead>
            <tr>
              ${header
                .map(
                  (cell) =>
                    `<th>${inlineMarkdown(
                      cell
                    )}</th>`
                )
                .join("")}
            </tr>
          </thead>

          <tbody>
            ${body
              .map((row) => {
                const cells =
                  parseRow(row);

                return `
                  <tr>
                    ${header
                      .map(
                        (_, index) =>
                          `<td>${inlineMarkdown(
                            cells[index] ||
                              ""
                          )}</td>`
                      )
                      .join("")}
                  </tr>
                `;
              })
              .join("")}
          </tbody>
        </table>
      </div>
    `;
  };

  const isTableRow = (line) => {
    const value = line.trim();

    return (
      value.includes("|") &&
      value.replace(
        /[^|]/g,
        ""
      ).length >= 1
    );
  };

  const isTableSeparator = (line) => {
    return /^\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+\|?$/.test(
      line.trim()
    );
  };

  const renderQuestion = (line) => {
    const match = line.match(
      /^(Q\d+)\.\s*(.*)$/i
    );

    if (!match) return false;

    html += `
      <div class="pdf-question">
        <div class="pdf-question-number">
          ${escapeHtml(
            match[1].toUpperCase()
          )}
        </div>

        <div class="pdf-question-text">
          ${inlineMarkdown(
            match[2]
          )}
        </div>
      </div>
    `;

    return true;
  };

  let index = 0;

  while (index < lines.length) {
    const rawLine =
      lines[index];

    const line =
      rawLine.trim();

    /*
     * Code blocks
     */
    if (
      line.startsWith("```")
    ) {
      closeLists();

      if (inCode) {
        closeCode();
      } else {
        inCode = true;
        codeBuffer = [];
      }

      index += 1;
      continue;
    }

    if (inCode) {
      codeBuffer.push(
        rawLine
      );

      index += 1;
      continue;
    }

    /*
     * Markdown tables
     */
    if (
      isTableRow(line) &&
      index + 1 <
        lines.length &&
      isTableSeparator(
        lines[index + 1]
      )
    ) {
      closeLists();

      const tableLines = [
        line,
        lines[index + 1].trim(),
      ];

      index += 2;

      while (
        index < lines.length &&
        isTableRow(
          lines[index]
        ) &&
        lines[index].trim() !==
          "---"
      ) {
        tableLines.push(
          lines[index].trim()
        );

        index += 1;
      }

      renderTable(
        tableLines
      );

      continue;
    }

    /*
     * Empty lines / markdown horizontal rules
     */
    if (
      !line ||
      /^-{3,}$/.test(line) ||
      /^\*{3,}$/.test(line)
    ) {
      closeLists();

      if (line) {
        html += `
          <div class="pdf-divider"></div>
        `;
      } else {
        html += `
          <div class="pdf-space"></div>
        `;
      }

      index += 1;
      continue;
    }

    /*
     * Headings
     */
    if (
      /^####\s+/.test(line)
    ) {
      closeLists();

      const title =
        line.replace(
          /^####\s+/,
          ""
        );

      html += `
        <h5 class="pdf-h4">
          ${inlineMarkdown(title)}
        </h5>
      `;

      index += 1;
      continue;
    }

    if (
      /^###\s+/.test(line)
    ) {
      closeLists();

      const title =
        line.replace(
          /^###\s+/,
          ""
        );

      html += `
        <h4 class="pdf-h3">
          ${inlineMarkdown(title)}
        </h4>
      `;

      index += 1;
      continue;
    }

    if (
      /^##\s+/.test(line)
    ) {
      closeLists();

      const title =
        line.replace(
          /^##\s+/,
          ""
        );

      html += `
        <div class="pdf-section-heading">
          <span class="pdf-section-number"></span>

          <h3 class="pdf-h2">
            ${inlineMarkdown(title)}
          </h3>
        </div>
      `;

      index += 1;
      continue;
    }

    if (
      /^#\s+/.test(line)
    ) {
      closeLists();

      const title =
        line.replace(
          /^#\s+/,
          ""
        );

      html += `
        <h2 class="pdf-h1">
          ${inlineMarkdown(title)}
        </h2>
      `;

      index += 1;
      continue;
    }

    /*
     * Interview questions
     */
    if (
      renderQuestion(line)
    ) {
      closeLists();

      index += 1;
      continue;
    }

    /*
     * Bullet list
     */
    if (
      /^[-*+]\s+/.test(line)
    ) {
      if (!inUl) {
        closeLists();

        html += `
          <ul class="pdf-ul">
        `;

        inUl = true;
      }

      const item =
        line.replace(
          /^[-*+]\s+/,
          ""
        );

      html += `
        <li>
          ${inlineMarkdown(item)}
        </li>
      `;

      index += 1;
      continue;
    }

    /*
     * Numbered list
     */
    if (
      /^\d+\.\s+/.test(line)
    ) {
      if (!inOl) {
        closeLists();

        html += `
          <ol class="pdf-ol">
        `;

        inOl = true;
      }

      const item =
        line.replace(
          /^\d+\.\s+/,
          ""
        );

      html += `
        <li>
          ${inlineMarkdown(item)}
        </li>
      `;

      index += 1;
      continue;
    }

    /*
     * Blockquote
     */
    if (
      line.startsWith("> ")
    ) {
      closeLists();

      html += `
        <div class="pdf-callout">
          <div class="pdf-callout-icon">
            💡
          </div>

          <div>
            <div class="pdf-callout-title">
              Key Insight
            </div>

            <div class="pdf-callout-text">
              ${inlineMarkdown(
                line.replace(
                  /^>\s+/,
                  ""
                )
              )}
            </div>
          </div>
        </div>
      `;

      index += 1;
      continue;
    }

    /*
     * Answer lines
     */
    if (
      /^\*\*Answer\*\*:/i.test(
        line
      ) ||
      /^Answer:/i.test(line)
    ) {
      closeLists();

      const answer =
        line
          .replace(
            /^\*\*Answer\*\*:\s*/i,
            ""
          )
          .replace(
            /^Answer:\s*/i,
            ""
          );

      html += `
        <div class="pdf-answer">
          <div class="pdf-answer-label">
            Answer
          </div>

          <div class="pdf-answer-text">
            ${inlineMarkdown(
              answer
            )}
          </div>
        </div>
      `;

      index += 1;
      continue;
    }

    /*
     * Normal paragraph
     */
    closeLists();

    html += `
      <p class="pdf-paragraph">
        ${inlineMarkdown(line)}
      </p>
    `;

    index += 1;
  }

  closeLists();
  closeCode();

  return html;
};

/* =========================================================
   PDF OUTLINE
   ========================================================= */

const getPdfOutline = (markdown = "") => {
  return String(markdown)
    .replace(/\r/g, "")
    .split("\n")
    .map((line) =>
      line.trim()
    )
    .filter((line) =>
      /^#{1,3}\s+/.test(line)
    )
    .map((line) =>
      line.replace(
        /^#{1,3}\s+/,
        ""
      )
    )
    .filter(Boolean)
    .slice(0, 6);
};

/* =========================================================
   COMPONENT
   ========================================================= */

export default function NotesGenerator() {
  const [topic, setTopic] = useState("");

  const [notes, setNotes] = useState("");

  const [history, setHistory] = useState([]);

  const [selectedNote, setSelectedNote] =
    useState(null);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [copied, setCopied] =
    useState(false);

  const [showMobileHistory, setShowMobileHistory] =
    useState(false);

  const [progress, setProgress] =
    useState(0);

  const [generationStage, setGenerationStage] =
    useState("");

  const [generationTime, setGenerationTime] =
    useState(0);

  const [pdfLoading, setPdfLoading] =
    useState(false);

  const [showSuggestions, setShowSuggestions] =
    useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] =
    useState(false);

  const pdfRef = useRef(null);

  const generationTimer =
    useRef(null);

  /* =======================================================
     LOAD HISTORY
     ======================================================= */

  useEffect(() => {
    fetchHistory();

    return () => {
      if (generationTimer.current) {
        clearInterval(
          generationTimer.current
        );
      }
    };
  }, []);

  const fetchHistory = async () => {
    try {
      setError("");

      const response =
        await API.get(
          "/notes",
          getAuthConfig()
        );

      const serverNotes =
        response?.data?.notes || [];

      setHistory(serverNotes);
    } catch (err) {
      console.error(
        "Notes history error:",
        err
      );

      setError(
        getFriendlyError(
          err,
          "Unable to load note history."
        )
      );
    }
  };

  /* =======================================================
     FILTERED HISTORY
     ======================================================= */

  const filteredHistory = useMemo(() => {
    const value =
      search.trim().toLowerCase();

    if (!value) {
      return history;
    }

    return history.filter((note) => {
      return (
        String(note?.title || "")
          .toLowerCase()
          .includes(value) ||
        String(note?.content || "")
          .toLowerCase()
          .includes(value) ||
        String(note?.subject || "")
          .toLowerCase()
          .includes(value)
      );
    });
  }, [history, search]);

  /* =======================================================
     NOTE STATISTICS
     ======================================================= */

  const statistics = useMemo(() => {
    const text = notes || "";

    const words =
      text.trim() === ""
        ? 0
        : text
            .trim()
            .split(/\s+/)
            .filter(Boolean).length;

    const characters =
      text.length;

    const sections =
      (
        text.match(
          /^#{1,3}\s+/gm
        ) || []
      ).length;

    const readingTime =
      words === 0
        ? 0
        : Math.max(
            1,
            Math.ceil(words / 180)
          );

    return {
      words,
      characters,
      sections,
      readingTime,
    };
  }, [notes]);

  /* =======================================================
     NEW SESSION
     ======================================================= */

  const startNewSession = () => {
    setTopic("");
    setNotes("");
    setSelectedNote(null);
    setError("");
    setSuccess("");
    setProgress(0);
    setGenerationStage("");
    setGenerationTime(0);
    setCopied(false);
    setShowDeleteConfirm(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =======================================================
     GENERATE NOTES
     ======================================================= */

  const generateNotes = async () => {
    if (!topic.trim()) {
      setError(
        "Please enter a topic first."
      );

      return;
    }

    if (loading) return;

    try {
      setLoading(true);

      setError("");
      setSuccess("");
      setNotes("");
      setSelectedNote(null);
      setProgress(5);
      setGenerationStage(
        "Preparing your study session..."
      );

      const startedAt =
        Date.now();

      generationTimer.current =
        setInterval(() => {
          setProgress((current) => {
            if (current >= 88) {
              return current;
            }

            return current + 3;
          });
        }, 700);

      setGenerationStage(
        "Connecting to PrepPulse AI..."
      );

      await new Promise((resolve) =>
        setTimeout(resolve, 400)
      );

      setProgress(15);

      setGenerationStage(
        "Understanding your topic..."
      );

      const response =
        await API.post(
          "/notes/generate",
          {
            topic:
              topic.trim(),
          },
          getAuthConfig()
        );

      setProgress(90);

      setGenerationStage(
        "Formatting your study material..."
      );

      const generated =
        response?.data?.notes ||
        response?.data?.content ||
        "";

      if (!generated) {
        throw new Error(
          "AI returned empty notes."
        );
      }

      setNotes(generated);

      const elapsed =
        Math.round(
          (Date.now() - startedAt) /
            100
        ) / 10;

      setGenerationTime(
        elapsed
      );

      setProgress(100);

      setGenerationStage(
        "Study notes ready!"
      );

      setSuccess(
        "AI study notes generated successfully."
      );

      setTimeout(() => {
        setProgress(0);
        setGenerationStage("");
      }, 1600);
    } catch (err) {
      console.error(
        "Generate notes error:",
        err
      );

      setProgress(0);
      setGenerationStage("");

      setError(
        getFriendlyError(
          err,
          "Unable to generate notes."
        )
      );
    } finally {
      setLoading(false);

      if (generationTimer.current) {
        clearInterval(
          generationTimer.current
        );

        generationTimer.current =
          null;
      }
    }
  };

  /* =======================================================
     SAVE NOTE
     ======================================================= */

  const saveNote = async () => {
    if (!notes.trim()) {
      setError(
        "Generate some notes before saving."
      );

      return;
    }

    const token = getToken();

    if (!token) {
      setError(
        "No authentication token found. Please login again."
      );

      return;
    }

    if (saving) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const title =
        topic.trim() ||
        "AI Study Notes";

      const response =
        await API.post(
          "/notes/save",
          {
            title,
            content: notes,
            subject: topic.trim(),
            tags: [
              "AI Notes",
              "PrepPulse",
            ],
          },
          getAuthConfig()
        );

      const savedNote =
        response?.data?.note;

      if (savedNote) {
        setHistory((previous) => [
          savedNote,
          ...previous.filter(
            (item) =>
              item._id !==
              savedNote._id
          ),
        ]);

        setSelectedNote(
          savedNote
        );
      }

      setSuccess(
        "Note saved successfully to your study library."
      );
    } catch (err) {
      console.error(
        "Save note error:",
        err
      );

      setError(
        getFriendlyError(
          err,
          "Unable to save note."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     OPEN NOTE
     ======================================================= */

  const openNote = async (note) => {
    if (!note?._id) return;

    try {
      setError("");
      setSuccess("");

      const response =
        await API.get(
          `/notes/${note._id}`,
          getAuthConfig()
        );

      const fullNote =
        response?.data?.note ||
        note;

      setSelectedNote(
        fullNote
      );

      setTopic(
        fullNote.subject ||
          fullNote.title ||
          ""
      );

      setNotes(
        fullNote.content || ""
      );

      setProgress(0);
      setGenerationStage("");

      setShowMobileHistory(
        false
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      console.error(
        "Open note error:",
        err
      );

      setError(
        getFriendlyError(
          err,
          "Unable to open this note."
        )
      );
    }
  };

  /* =======================================================
     DELETE NOTE
     ======================================================= */

  const deleteNote = async () => {
    if (!selectedNote?._id) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      await API.delete(
        `/notes/${selectedNote._id}`,
        getAuthConfig()
      );

      setHistory((previous) =>
        previous.filter(
          (item) =>
            item._id !==
            selectedNote._id
        )
      );

      setSelectedNote(null);
      setNotes("");
      setTopic("");

      setShowDeleteConfirm(
        false
      );

      setSuccess(
        "Note deleted successfully."
      );
    } catch (err) {
      console.error(
        "Delete note error:",
        err
      );

      setError(
        getFriendlyError(
          err,
          "Unable to delete this note."
        )
      );
    } finally {
      setDeleting(false);
    }
  };

  /* =======================================================
     COPY NOTES
     ======================================================= */

  const copyNotes = async () => {
    if (!notes.trim()) return;

    try {
      await navigator.clipboard.writeText(
        notes
      );

      setCopied(true);
      setSuccess(
        "Notes copied to clipboard."
      );

      setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch (err) {
      console.error(
        "Copy error:",
        err
      );

      setError(
        "Unable to copy notes."
      );
    }
  };

  /* =======================================================
     PDF GENERATOR
     ======================================================= */

  const downloadPDF = async () => {
    if (!notes.trim()) {
      setError(
        "Generate some notes before downloading PDF."
      );
      return;
    }

    if (pdfLoading) return;

    let pdfClone = null;
    let appRoot = null;
    let previousVisibility = "";
    let previousOverflow = "";

    try {
      setPdfLoading(true);
      setError("");
      setSuccess("");

      const source = pdfRef.current;

      if (!source) {
        throw new Error(
          "PDF content could not be prepared."
        );
      }

      /*
       * Clone the complete PDF document.
       * The source stays hidden/off-screen.
       */

      pdfClone =
        source.cloneNode(true);

      pdfClone.removeAttribute(
        "id"
      );

      document.body.appendChild(
        pdfClone
      );

      /*
       * Temporarily hide the application so
       * html2canvas sees only the PDF document.
       */

      appRoot =
        document.querySelector(
          ".notes-page"
        );

      if (appRoot) {
        previousVisibility =
          appRoot.style.visibility;

        appRoot.style.visibility =
          "hidden";
      }

      previousOverflow =
        document.body.style.overflow;

      document.body.style.overflow =
        "hidden";

      /*
       * Place the PDF at a normal viewport position.
       * This avoids blank-canvas problems caused by
       * capturing elements at left:-10000px.
       */

      Object.assign(
        pdfClone.style,
        {
          position: "absolute",

          left: "0px",

          top: "0px",

          width: "794px",

          minWidth: "794px",

          height: "auto",

          minHeight: "0",

          margin: "0",

          padding: "0",

          opacity: "1",

          visibility: "visible",

          display: "block",

          zIndex:
            "2147483647",

          pointerEvents:
            "none",

          overflow:
            "visible",

          background:
            "#ffffff",

          transform:
            "none",
        }
      );

      /*
       * Make the PDF source itself visible.
       */

      const pdfDocument =
        pdfClone.querySelector(
          ".pdf-document"
        );

      if (!pdfDocument) {
        throw new Error(
          "PDF document container was not found."
        );
      }

      Object.assign(
        pdfDocument.style,
        {
          display: "block",

          visibility:
            "visible",

          opacity: "1",

          width: "794px",

          minWidth: "794px",

          height: "auto",

          overflow:
            "visible",

          background:
            "#ffffff",
        }
      );

      /*
       * Make sure the cover is exactly one A4-like page.
       */

      const cover =
        pdfClone.querySelector(
          ".pdf-cover"
        );

      if (cover) {
        Object.assign(
          cover.style,
          {
            width: "794px",

            height: "1123px",

            minHeight:
              "1123px",

            maxHeight:
              "1123px",

            overflow:
              "hidden",

            display: "flex",

            visibility:
              "visible",

            opacity: "1",

            pageBreakAfter:
              "always",

            breakAfter:
              "page",
          }
        );
      }

      /*
       * The content is intentionally FLOWING.
       * Do not give it a fixed height or overflow:hidden.
       */

      const content =
        pdfClone.querySelector(
          ".pdf-content-flow"
        );

      if (content) {
        Object.assign(
          content.style,
          {
            width: "794px",

            minWidth: "794px",

            height: "auto",

            minHeight: "0",

            overflow:
              "visible",

            display: "block",

            visibility:
              "visible",

            opacity: "1",

            background:
              "#ffffff",

            pageBreakBefore:
              "always",

            breakBefore:
              "page",
          }
        );
      }

      /*
       * Wait for browser paint + fonts.
       */

      await new Promise(
        (resolve) => {
          requestAnimationFrame(
            () => {
              requestAnimationFrame(
                () => {
                  requestAnimationFrame(
                    resolve
                  );
                }
              );
            }
          );
        }
      );

      if (
        document.fonts &&
        document.fonts.ready
      ) {
        try {
          await document.fonts.ready;
        } catch {
          // Continue without custom fonts.
        }
      }

      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            400
          )
      );

      /*
       * Wait for images if any exist.
       */

      const images =
        pdfClone.querySelectorAll(
          "img"
        );

      await Promise.all(
        Array.from(images).map(
          (img) => {
            if (img.complete) {
              return Promise.resolve();
            }

            return new Promise(
              (resolve) => {
                img.onload =
                  resolve;

                img.onerror =
                  resolve;
              }
            );
          }
        )
      );

      const safeTitle = (
        topic.trim() ||
        "PrepPulse-AI-Study-Notes"
      )
        .replace(
          /[^a-z0-9]+/gi,
          "-"
        )
        .replace(
          /^-+|-+$/g,
          ""
        )
        .slice(
          0,
          70
        );

      const filename =
        `${
          safeTitle ||
          "PrepPulse-AI-Study-Notes"
        }-Study-Guide.pdf`;

      /*
       * Capture the whole flowing document.
       * html2pdf will paginate it naturally.
       */

      await html2pdf()
        .set({
          margin: 0,

          filename,

          image: {
            type: "jpeg",

            quality: 0.98,
          },

          html2canvas: {
            scale: 2,

            useCORS: true,

            allowTaint: true,

            backgroundColor:
              "#ffffff",

            logging: false,

            imageTimeout:
              15000,

            scrollX: 0,

            scrollY: 0,

            windowWidth:
              794,

            windowHeight:
              Math.max(
                1123,
                pdfDocument
                  .scrollHeight ||
                  1123
              ),

            removeContainer:
              true,
          },

          jsPDF: {
            unit: "px",

            format: [
              794,
              1123,
            ],

            orientation:
              "portrait",

            compress: true,

            hotfixes: [
              "px_scaling",
            ],
          },

          pagebreak: {
            mode: [
              "css",
              "legacy",
            ],

            avoid: [
              ".pdf-question",
              ".pdf-answer",
              ".pdf-callout",
              ".pdf-table-wrap",
              ".pdf-code-card",
              ".pdf-ul",
              ".pdf-ol",
            ],
          },
        })
        .from(pdfClone)
        .save();

      setSuccess(
        "Beautiful study-guide PDF downloaded successfully."
      );
    } catch (err) {
      console.error(
        "PDF generation error:",
        err
      );

      setError(
        err?.message ||
          "Unable to generate PDF. Please try again."
      );
    } finally {
      if (
        pdfClone &&
        pdfClone.parentNode
      ) {
        pdfClone.parentNode.removeChild(
          pdfClone
        );
      }

      if (appRoot) {
        appRoot.style.visibility =
          previousVisibility;
      }

      document.body.style.overflow =
        previousOverflow;

      setPdfLoading(false);
    }
  };

  /* =======================================================
     QUICK SUGGESTION
     ======================================================= */

  const chooseSuggestion = (
    suggestion
  ) => {
    setTopic(suggestion);
    setShowSuggestions(false);
    setError("");
  };

  /* =======================================================
     KEYBOARD
     ======================================================= */

  const handleTopicKeyDown = (
    event
  ) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      generateNotes();
    }
  };

  /* =======================================================
     DATE
     ======================================================= */

  const formatDate = (
    value
  ) => {
    if (!value) return "";

    try {
      return new Date(
        value
      ).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );
    } catch {
      return "";
    }
  };

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }

        .notes-page {
          min-height: 100vh;
          width: 100%;
          color: #e8f2ff;
          background:
            radial-gradient(
              circle at 15% 10%,
              rgba(0, 210, 255, 0.13),
              transparent 32%
            ),
            radial-gradient(
              circle at 90% 20%,
              rgba(106, 73, 255, 0.15),
              transparent 34%
            ),
            radial-gradient(
              circle at 70% 90%,
              rgba(0, 191, 255, 0.08),
              transparent 30%
            ),
            #030916;

          position: relative;
          overflow-x: hidden;

          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .notes-page::before {
          content: "";
          position: fixed;
          inset: 0;

          background-image:
            linear-gradient(
              rgba(255,255,255,0.025) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255,255,255,0.025) 1px,
              transparent 1px
            );

          background-size:
            48px 48px;

          mask-image:
            linear-gradient(
              to bottom,
              black,
              transparent
            );

          pointer-events: none;
          z-index: 0;
        }

        .orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(70px);
          pointer-events: none;
          z-index: 0;
          opacity: 0.3;
          animation:
            orbFloat 10s ease-in-out infinite;
        }

        .orb-one {
          width: 300px;
          height: 300px;
          left: -120px;
          top: 15%;
          background: #00bfff;
        }

        .orb-two {
          width: 340px;
          height: 340px;
          right: -150px;
          top: 45%;
          background: #694cff;
          animation-delay: -4s;
        }

        .orb-three {
          width: 220px;
          height: 220px;
          left: 45%;
          bottom: -100px;
          background: #00e5ff;
          animation-delay: -7s;
        }

        @keyframes orbFloat {
          0%, 100% {
            transform: translate3d(0,0,0) scale(1);
          }

          50% {
            transform:
              translate3d(0,-30px,0)
              scale(1.08);
          }
        }

        .notes-shell {
          position: relative;
          z-index: 1;

          display: flex;
          min-height: 100vh;
        }

        /* SIDEBAR */

        .notes-sidebar {
          width: 285px;
          min-width: 285px;

          background:
            linear-gradient(
              180deg,
              rgba(5, 14, 29, 0.97),
              rgba(2, 8, 20, 0.94)
            );

          border-right:
            1px solid
            rgba(110, 180, 255, 0.12);

          backdrop-filter: blur(24px);

          padding: 22px 18px;

          position: sticky;
          top: 0;
          height: 100vh;

          overflow-y: auto;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 4px 8px 24px;
        }

        .brand-icon {
          width: 42px;
          height: 42px;
          border-radius: 14px;

          display: grid;
          place-items: center;

          font-size: 21px;

          background:
            linear-gradient(
              135deg,
              #08c9ff,
              #5547ff
            );

          box-shadow:
            0 10px 35px
            rgba(22, 174, 255, 0.28);
        }

        .brand-name {
          font-size: 16px;
          font-weight: 900;
          letter-spacing: -0.3px;
        }

        .brand-sub {
          color: #667b99;
          font-size: 10px;
          margin-top: 3px;
        }

        .new-session-btn {
          width: 100%;
          border: 1px solid
            rgba(0, 207, 255, 0.35);

          background:
            linear-gradient(
              135deg,
              rgba(0, 205, 255, 0.11),
              rgba(92, 72, 255, 0.12)
            );

          color: #dff8ff;

          border-radius: 13px;

          padding: 13px 14px;

          font-weight: 800;
          font-size: 13px;

          cursor: pointer;

          transition:
            transform .25s ease,
            border-color .25s ease,
            box-shadow .25s ease;
        }

        .new-session-btn:hover {
          transform: translateY(-2px);

          border-color:
            rgba(0, 221, 255, 0.7);

          box-shadow:
            0 12px 35px
            rgba(0, 190, 255, 0.13);
        }

        .history-header {
          margin-top: 26px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          color: #7185a4;

          font-size: 11px;
          font-weight: 900;

          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .history-count {
          color: #4edcff;
        }

        .search-box {
          margin-top: 12px;

          display: flex;
          align-items: center;
          gap: 8px;

          background:
            rgba(12, 25, 48, 0.8);

          border:
            1px solid
            rgba(120, 160, 220, 0.12);

          border-radius: 11px;

          padding: 10px 11px;
        }

        .search-box span {
          color: #6680a5;
        }

        .search-box input {
          width: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          color: #dcecff;
          font-size: 12px;
        }

        .search-box input::placeholder {
          color: #566985;
        }

        .history-list {
          margin-top: 13px;

          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .history-item {
          width: 100%;

          border: 1px solid transparent;

          background:
            rgba(10, 21, 41, 0.5);

          color: #dbe9ff;

          border-radius: 12px;

          padding: 12px;

          text-align: left;

          cursor: pointer;

          transition:
            transform .2s ease,
            background .2s ease,
            border-color .2s ease;
        }

        .history-item:hover {
          transform: translateX(3px);

          background:
            rgba(16, 39, 70, 0.72);

          border-color:
            rgba(49, 193, 255, 0.18);
        }

        .history-item.active {
          background:
            linear-gradient(
              135deg,
              rgba(0, 194, 255, 0.14),
              rgba(91, 72, 255, 0.13)
            );

          border-color:
            rgba(0, 204, 255, 0.28);
        }

        .history-item-title {
          font-size: 12px;
          font-weight: 800;

          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .history-item-date {
          margin-top: 6px;
          color: #607493;
          font-size: 10px;
        }

        .empty-history {
          text-align: center;
          color: #4e617e;
          font-size: 12px;
          padding: 35px 10px;
        }

        /* MAIN */

        .notes-main {
          flex: 1;
          min-width: 0;

          padding: 54px clamp(20px, 5vw, 75px) 80px;

          position: relative;
        }

        .hero {
          max-width: 1050px;
          margin: 0 auto;

          text-align: center;
        }

        .hero-icon {
          width: 66px;
          height: 66px;

          margin: 0 auto 20px;

          display: grid;
          place-items: center;

          border-radius: 20px;

          border:
            1px solid
            rgba(0, 209, 255, 0.35);

          background:
            linear-gradient(
              145deg,
              rgba(0, 188, 255, 0.12),
              rgba(98, 73, 255, 0.14)
            );

          box-shadow:
            0 0 50px
            rgba(0, 192, 255, 0.12);

          font-size: 30px;

          animation:
            iconPulse 3s ease-in-out infinite;
        }

        @keyframes iconPulse {
          0%, 100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-5px);
          }
        }

        .hero h1 {
          margin: 0;

          font-size:
            clamp(36px, 5vw, 66px);

          line-height: 0.98;

          letter-spacing: -3px;

          font-weight: 950;

          background:
            linear-gradient(
              110deg,
              #eef8ff 0%,
              #9eeaff 42%,
              #a18cff 90%
            );

          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .hero p {
          max-width: 720px;
          margin: 22px auto 0;

          color: #8397b6;

          font-size: 14px;
          line-height: 1.7;
        }

        .hero-highlight {
          color: #42e2ff;
          font-weight: 900;
        }

        .feature-row {
          margin-top: 16px;

          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 9px;
        }

        .feature-pill {
          padding: 7px 11px;

          border-radius: 999px;

          background:
            rgba(17, 34, 59, 0.65);

          border:
            1px solid
            rgba(106, 153, 209, 0.12);

          color: #7890af;

          font-size: 10px;
        }

        /* GENERATOR CARD */

        .generator-card {
          max-width: 1050px;

          margin:
            40px auto 0;

          padding: 24px;

          border-radius: 24px;

          background:
            linear-gradient(
              145deg,
              rgba(15, 30, 56, 0.9),
              rgba(9, 18, 39, 0.78)
            );

          border:
            1px solid
            rgba(115, 175, 255, 0.14);

          box-shadow:
            0 30px 100px
            rgba(0, 0, 0, 0.25);

          backdrop-filter: blur(22px);

          position: relative;
          overflow: hidden;
        }

        .generator-card::before {
          content: "";

          position: absolute;

          width: 300px;
          height: 2px;

          top: 0;
          left: 20%;

          background:
            linear-gradient(
              90deg,
              transparent,
              #24d8ff,
              #695cff,
              transparent
            );

          filter:
            blur(1px);
        }

        .generator-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 20px;
          margin-bottom: 19px;
        }

        .heading-left {
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .heading-icon {
          width: 42px;
          height: 42px;

          display: grid;
          place-items: center;

          border-radius: 13px;

          background:
            rgba(0, 196, 255, 0.09);

          border:
            1px solid
            rgba(0, 207, 255, 0.25);

          font-size: 19px;
        }

        .heading-title {
          font-size: 15px;
          font-weight: 900;
        }

        .heading-subtitle {
          margin-top: 3px;
          font-size: 10px;
          color: #647b9c;
        }

        .ai-status {
          display: flex;
          align-items: center;
          gap: 7px;

          color: #64e8c3;
          font-size: 10px;
          font-weight: 900;

          text-transform: uppercase;
        }

        .status-dot {
          width: 7px;
          height: 7px;

          border-radius: 50%;

          background: #40e7b4;

          box-shadow:
            0 0 12px
            rgba(64, 231, 180, 0.8);

          animation:
            blink 1.7s infinite;
        }

        @keyframes blink {
          0%, 100% {
            opacity: 1;
          }

          50% {
            opacity: .3;
          }
        }

        .topic-wrapper {
          position: relative;
        }

        .topic-input {
          width: 100%;

          min-height: 58px;

          border-radius: 15px;

          border:
            1px solid
            rgba(92, 170, 245, 0.17);

          background:
            rgba(2, 10, 25, 0.72);

          color: #e9f6ff;

          outline: none;

          padding:
            0 48px 0 18px;

          font-size: 13px;

          transition:
            border-color .25s ease,
            box-shadow .25s ease,
            background .25s ease;
        }

        .topic-input:focus {
          border-color:
            rgba(38, 214, 255, 0.7);

          background:
            rgba(2, 12, 30, 0.9);

          box-shadow:
            0 0 0 4px
            rgba(0, 199, 255, 0.07),
            0 10px 40px
            rgba(0, 160, 255, 0.06);
        }

        .topic-input::placeholder {
          color: #536784;
        }

        .clear-topic {
          position: absolute;

          right: 13px;
          top: 50%;

          transform:
            translateY(-50%);

          width: 28px;
          height: 28px;

          border: 0;

          border-radius: 8px;

          background:
            rgba(112, 145, 185, 0.08);

          color: #7188a8;

          cursor: pointer;
        }

        .suggestion-label {
          margin:
            13px 0 8px;

          color: #607895;

          font-size: 10px;
        }

        .suggestion-row {
          display: flex;
          gap: 7px;
          flex-wrap: wrap;
        }

        .suggestion {
          border:
            1px solid
            rgba(103, 150, 209, 0.13);

          background:
            rgba(14, 29, 52, 0.55);

          color: #7f95b2;

          border-radius: 999px;

          padding: 7px 10px;

          font-size: 10px;

          cursor: pointer;

          transition:
            all .2s ease;
        }

        .suggestion:hover {
          color: #bdefff;

          border-color:
            rgba(0, 208, 255, 0.35);

          transform:
            translateY(-1px);
        }

        .generate-btn {
          width: 100%;

          margin-top: 16px;

          min-height: 52px;

          border: 0;

          border-radius: 14px;

          color: white;

          font-size: 13px;
          font-weight: 900;

          cursor: pointer;

          background:
            linear-gradient(
              100deg,
              #08a9d8,
              #266cf0 48%,
              #5948e8
            );

          box-shadow:
            0 12px 35px
            rgba(40, 108, 239, 0.22);

          transition:
            transform .25s ease,
            box-shadow .25s ease,
            filter .25s ease;

          position: relative;
          overflow: hidden;
        }

        .generate-btn::before {
          content: "";

          position: absolute;

          top: 0;
          left: -100%;

          width: 80%;
          height: 100%;

          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(255,255,255,.25),
              transparent
            );

          transform:
            skewX(-20deg);

          transition:
            left .6s ease;
        }

        .generate-btn:hover::before {
          left: 130%;
        }

        .generate-btn:hover {
          transform:
            translateY(-2px);

          box-shadow:
            0 18px 50px
            rgba(40, 108, 239, 0.3);
        }

        .generate-btn:disabled {
          opacity: .65;
          cursor: wait;
          transform: none;
        }

        .spinner {
          display: inline-block;

          width: 15px;
          height: 15px;

          border:
            2px solid
            rgba(255,255,255,.35);

          border-top-color:
            white;

          border-radius: 50%;

          animation:
            spin .7s linear infinite;

          vertical-align: -2px;

          margin-right: 8px;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* ALERTS */

        .alert {
          max-width: 1050px;

          margin:
            18px auto 0;

          padding: 12px 15px;

          border-radius: 12px;

          display: flex;
          align-items: center;
          gap: 10px;

          font-size: 12px;

          animation:
            alertIn .3s ease;
        }

        @keyframes alertIn {
          from {
            opacity: 0;
            transform:
              translateY(-8px);
          }

          to {
            opacity: 1;
            transform:
              translateY(0);
          }
        }

        .alert-error {
          background:
            rgba(255, 68, 93, 0.07);

          border:
            1px solid
            rgba(255, 77, 102, 0.24);

          color: #ff9eae;
        }

        .alert-success {
          background:
            rgba(46, 225, 173, 0.07);

          border:
            1px solid
            rgba(46, 225, 173, 0.22);

          color: #7af0c9;
        }

        .alert-close {
          margin-left: auto;

          border: 0;
          background: transparent;

          color: inherit;

          cursor: pointer;
        }

        /* PROGRESS */

        .progress-card {
          max-width: 1050px;

          margin: 18px auto 0;

          padding: 18px;

          border-radius: 17px;

          background:
            rgba(6, 15, 31, 0.68);

          border:
            1px solid
            rgba(105, 157, 219, 0.11);

          animation:
            fadeUp .4s ease;
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform:
              translateY(12px);
          }

          to {
            opacity: 1;
            transform:
              translateY(0);
          }
        }

        .progress-top {
          display: flex;
          justify-content: space-between;

          font-size: 11px;
          font-weight: 800;

          color: #9bb0cb;
        }

        .progress-value {
          color: #45dcff;
        }

        .progress-track {
          height: 7px;

          margin-top: 12px;

          border-radius: 999px;

          overflow: hidden;

          background:
            rgba(94, 127, 170, 0.11);
        }

        .progress-fill {
          height: 100%;

          border-radius: inherit;

          background:
            linear-gradient(
              90deg,
              #00d8ff,
              #4d8cff,
              #7756ff
            );

          transition:
            width .4s ease;

          box-shadow:
            0 0 18px
            rgba(0, 203, 255, .45);
        }

        /* STATS */

        .stats-grid {
          max-width: 1050px;

          margin: 18px auto 0;

          display: grid;

          grid-template-columns:
            repeat(4, 1fr);

          gap: 10px;
        }

        .stat-card {
          padding: 15px;

          border-radius: 15px;

          background:
            rgba(11, 26, 49, 0.65);

          border:
            1px solid
            rgba(100, 155, 220, 0.1);

          display: flex;
          align-items: center;
          gap: 11px;

          transition:
            transform .2s ease,
            border-color .2s ease;
        }

        .stat-card:hover {
          transform:
            translateY(-2px);

          border-color:
            rgba(0, 210, 255, .2);
        }

        .stat-icon {
          width: 35px;
          height: 35px;

          border-radius: 10px;

          display: grid;
          place-items: center;

          background:
            rgba(0, 197, 255, .08);

          color: #46dfff;
        }

        .stat-value {
          font-size: 16px;
          font-weight: 950;
        }

        .stat-label {
          margin-top: 2px;
          color: #5e7492;
          font-size: 9px;
        }

        /* NOTES RESULT */

        .result-card {
          max-width: 1050px;

          margin: 22px auto 0;

          border-radius: 23px;

          background:
            linear-gradient(
              145deg,
              rgba(13, 28, 52, .92),
              rgba(7, 16, 33, .91)
            );

          border:
            1px solid
            rgba(117, 172, 239, .14);

          overflow: hidden;

          box-shadow:
            0 30px 100px
            rgba(0,0,0,.24);

          animation:
            resultIn .5s ease;
        }

        @keyframes resultIn {
          from {
            opacity: 0;
            transform:
              translateY(18px);
          }

          to {
            opacity: 1;
            transform:
              translateY(0);
          }
        }

        .result-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 12px;

          padding: 17px 19px;

          border-bottom:
            1px solid
            rgba(111, 159, 214, .1);

          background:
            rgba(5, 13, 27, .4);
        }

        .result-title {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .result-title-icon {
          width: 35px;
          height: 35px;

          border-radius: 10px;

          display: grid;
          place-items: center;

          background:
            rgba(80, 102, 255, .1);

          color: #9ca5ff;
        }

        .result-title strong {
          font-size: 13px;
        }

        .result-title small {
          display: block;

          color: #607797;

          font-size: 9px;

          margin-top: 2px;
        }

        .toolbar-actions {
          display: flex;
          gap: 7px;
          flex-wrap: wrap;
        }

        .action-btn {
          border:
            1px solid
            rgba(106, 158, 220, .15);

          background:
            rgba(15, 31, 55, .7);

          color: #a7bbd7;

          padding:
            8px 11px;

          border-radius: 9px;

          font-size: 10px;
          font-weight: 800;

          cursor: pointer;

          transition:
            all .2s ease;
        }

        .action-btn:hover {
          color: #e8f9ff;

          border-color:
            rgba(0, 211, 255, .3);

          background:
            rgba(17, 44, 73, .8);

          transform:
            translateY(-1px);
        }

        .action-btn.primary {
          background:
            linear-gradient(
              100deg,
              rgba(0, 185, 230, .2),
              rgba(91, 73, 245, .2)
            );

          color: #c6f5ff;
        }

        .action-btn.danger:hover {
          color: #ff9eae;

          border-color:
            rgba(255, 76, 104, .3);
        }

        .notes-content {
          padding: 32px 34px 38px;

          color: #c5d4e9;

          line-height: 1.78;

          font-size: 14px;

          white-space: normal;

          overflow-wrap: anywhere;
        }

        .notes-content h1,
        .notes-content h2,
        .notes-content h3,
        .notes-content h4 {
          color: #eff8ff;
          line-height: 1.25;
          margin-top: 30px;
          margin-bottom: 13px;
        }

        .notes-content h1 {
          font-size: 26px;
        }

        .notes-content h2 {
          font-size: 21px;
        }

        .notes-content h3 {
          font-size: 17px;
          color: #82e9ff;
        }

        .notes-content p {
          margin:
            0 0 13px;
        }

        .notes-content ul,
        .notes-content ol {
          margin:
            8px 0 17px;

          padding-left: 25px;
        }

        .notes-content li {
          margin-bottom: 7px;
        }

        .notes-content strong {
          color: #effaff;
        }

        .notes-content code {
          padding:
            3px 6px;

          border-radius: 5px;

          background:
            rgba(0, 204, 255, .08);

          color: #73eaff;

          font-size: .9em;
        }

        .notes-content blockquote {
          margin:
            18px 0;

          padding:
            13px 17px;

          border-left:
            3px solid
            #27d6ff;

          background:
            rgba(0, 197, 255, .05);

          color: #9db1cc;

          border-radius:
            0 10px 10px 0;
        }

        .notes-content pre {
          margin:
            18px 0;

          padding: 17px;

          overflow-x: auto;

          border-radius: 12px;

          background:
            #020812;

          border:
            1px solid
            rgba(105, 160, 220, .14);

          color: #b9ecff;

          font-size: 12px;

          line-height: 1.65;
        }

        /* EMPTY */

        .empty-state {
          max-width: 650px;

          margin: 65px auto 0;

          text-align: center;

          color: #607797;
        }

        .empty-icon {
          width: 72px;
          height: 72px;

          margin: 0 auto 18px;

          border-radius: 22px;

          display: grid;
          place-items: center;

          background:
            rgba(0, 201, 255, .06);

          border:
            1px solid
            rgba(0, 201, 255, .17);

          font-size: 31px;

          animation:
            iconPulse 3s infinite;
        }

        .empty-state h3 {
          color: #b6c7dc;
          margin: 0;
          font-size: 15px;
        }

        .empty-state p {
          margin-top: 8px;
          font-size: 11px;
        }

        /* MOBILE HISTORY */

        .mobile-history-btn {
          display: none;
        }

        /* DELETE MODAL */

        .modal-backdrop {
          position: fixed;
          inset: 0;

          background:
            rgba(0, 4, 13, .72);

          backdrop-filter: blur(8px);

          z-index: 100;

          display: grid;
          place-items: center;

          padding: 20px;
        }

        .delete-modal {
          width: min(420px, 100%);

          padding: 25px;

          border-radius: 20px;

          background:
            linear-gradient(
              145deg,
              #0c1b33,
              #071020
            );

          border:
            1px solid
            rgba(255, 89, 111, .2);

          box-shadow:
            0 30px 100px
            rgba(0,0,0,.5);

          animation:
            modalIn .25s ease;
        }

        @keyframes modalIn {
          from {
            opacity: 0;
            transform:
              scale(.96)
              translateY(8px);
          }

          to {
            opacity: 1;
            transform:
              scale(1)
              translateY(0);
          }
        }

        .delete-modal-icon {
          width: 48px;
          height: 48px;

          border-radius: 14px;

          display: grid;
          place-items: center;

          background:
            rgba(255, 73, 99, .08);

          color: #ff8498;

          font-size: 22px;

          margin-bottom: 15px;
        }

        .delete-modal h3 {
          margin: 0;
          font-size: 18px;
        }

        .delete-modal p {
          color: #7186a3;
          font-size: 12px;
          line-height: 1.6;
          margin: 9px 0 20px;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }

        .modal-btn {
          border: 0;
          border-radius: 9px;
          padding: 9px 14px;
          cursor: pointer;
          font-weight: 800;
          font-size: 11px;
        }

        .modal-cancel {
          background:
            rgba(100,130,170,.1);
          color: #9cb0ca;
        }

        .modal-delete {
          background:
            #ef4c68;
          color: white;
        }

        /* =====================================================
           ADVANCED PDF DESIGN
           ===================================================== */

        .pdf-renderer {
          position: fixed;

          left: -10000px;
          top: 0;

          width: 794px;
          min-width: 794px;

          opacity: 1;

          visibility: hidden;

          pointer-events: none;

          z-index: -9999;

          background: #ffffff;

          overflow: visible;
        }

        .pdf-document {
          width: 794px;

          min-width: 794px;

          background: #ffffff;

          color: #17243a;

          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }

        .pdf-page {
          width: 794px;

          min-width: 794px;

          box-sizing: border-box;

          position: relative;

          display: block;

          color: #17243a;
        }

        .pdf-cover {
          height: 1123px;

          min-height: 1123px;

          padding: 58px;

          display: flex;

          flex-direction: column;

          justify-content: space-between;

          overflow: hidden;

          page-break-after: always;

          break-after: page;

          background:
            linear-gradient(
              145deg,
              #061528 0%,
              #0b1b3b 52%,
              #19164b 100%
            );

          color: #ffffff;
        }

        .pdf-cover::before {
          content: "";

          position: absolute;

          width: 360px;

          height: 360px;

          right: -110px;

          top: -90px;

          border-radius: 50%;

          background:
            radial-gradient(
              circle,
              rgba(40, 218, 255, .30),
              rgba(40, 218, 255, 0) 70%
            );
        }

        .pdf-cover::after {
          content: "";

          position: absolute;

          width: 320px;

          height: 320px;

          left: -150px;

          bottom: -130px;

          border-radius: 50%;

          background:
            radial-gradient(
              circle,
              rgba(116, 82, 255, .28),
              rgba(116, 82, 255, 0) 70%
            );
        }

        .pdf-cover-inner {
          position: relative;

          z-index: 2;
        }

        .pdf-brand {
          display: flex;

          align-items: center;

          gap: 12px;

          font-weight: 900;

          font-size: 18px;
        }

        .pdf-brand-icon {
          width: 44px;

          height: 44px;

          display: grid;

          place-items: center;

          border-radius: 14px;

          background:
            linear-gradient(
              135deg,
              #00d8ff,
              #6451ff
            );

          box-shadow:
            0 10px 28px
            rgba(0, 207, 255, .25);
        }

        .pdf-eyebrow {
          display: inline-block;

          margin-top: 92px;

          padding: 7px 12px;

          border: 1px solid
            rgba(90, 224, 255, .28);

          border-radius: 999px;

          background:
            rgba(70, 213, 255, .08);

          color: #62e2ff;

          text-transform: uppercase;

          letter-spacing: 2px;

          font-size: 10px;

          font-weight: 900;
        }

        .pdf-cover h1 {
          max-width: 660px;

          margin: 20px 0 16px;

          color: #ffffff;

          font-size: 42px;

          line-height: 1.08;

          letter-spacing: -1.1px;
        }

        .pdf-cover-description {
          max-width: 610px;

          color: #aabbd5;

          font-size: 14px;

          line-height: 1.75;
        }

        .pdf-cover-stats {
          display: grid;

          grid-template-columns:
            repeat(3, 1fr);

          gap: 12px;

          margin-top: 32px;

          max-width: 620px;
        }

        .pdf-stat {
          padding: 17px;

          border:
            1px solid
            rgba(146, 198, 255, .17);

          border-radius: 15px;

          background:
            rgba(255,255,255,.055);
        }

        .pdf-stat-value {
          color: #ffffff;

          font-size: 22px;

          font-weight: 900;
        }

        .pdf-stat-label {
          margin-top: 5px;

          color: #8ca0bd;

          font-size: 8px;

          font-weight: 800;

          text-transform: uppercase;

          letter-spacing: 1.1px;
        }

        .pdf-outline {
          margin-top: 30px;

          max-width: 620px;

          padding: 18px 20px;

          border:
            1px solid
            rgba(146, 198, 255, .14);

          border-radius: 16px;

          background:
            rgba(255,255,255,.045);
        }

        .pdf-outline-title {
          margin-bottom: 11px;

          color: #70e4ff;

          font-size: 9px;

          font-weight: 900;

          text-transform: uppercase;

          letter-spacing: 1.5px;
        }

        .pdf-outline-list {
          margin: 0;

          padding-left: 18px;

          color: #c5d3e6;

          font-size: 10px;

          line-height: 1.8;
        }

        .pdf-outline-list li {
          margin-bottom: 2px;
        }

        .pdf-cover-footer {
          position: relative;

          z-index: 2;

          display: flex;

          justify-content: space-between;

          gap: 20px;

          color: #7288a7;

          font-size: 8px;
        }

        /* -----------------------------------------------------
           FLOWING CONTENT
           ----------------------------------------------------- */

        .pdf-content-flow {
          width: 794px;

          box-sizing: border-box;

          padding: 48px 54px 54px;

          background: #ffffff;

          page-break-before: always;

          break-before: page;
        }

        .pdf-header {
          margin-bottom: 24px;

          padding-bottom: 16px;

          border-bottom:
            2px solid
            #e4edf5;
        }

        .pdf-header-row {
          display: flex;

          align-items: flex-start;

          justify-content: space-between;

          gap: 20px;
        }

        .pdf-header-title {
          max-width: 560px;

          color: #122541;

          font-size: 20px;

          line-height: 1.3;

          font-weight: 900;
        }

        .pdf-header-badge {
          flex-shrink: 0;

          padding: 6px 9px;

          border-radius: 999px;

          background: #eaf8fd;

          color: #0789b8;

          font-size: 8px;

          font-weight: 900;

          text-transform: uppercase;

          letter-spacing: .7px;
        }

        .pdf-header-meta {
          margin-top: 6px;

          color: #75879b;

          font-size: 8px;
        }

        .pdf-reading-tip {
          display: flex;

          gap: 12px;

          margin: 0 0 25px;

          padding: 13px 15px;

          border:
            1px solid
            #c9eefa;

          border-radius: 12px;

          background:
            linear-gradient(
              135deg,
              #f0fbff,
              #f7f7ff
            );

          color: #46627c;

          font-size: 9.5px;

          line-height: 1.6;

          page-break-inside: avoid;

          break-inside: avoid;
        }

        .pdf-reading-tip-icon {
          width: 25px;

          height: 25px;

          flex: 0 0 25px;

          display: grid;

          place-items: center;

          border-radius: 8px;

          background:
            linear-gradient(
              135deg,
              #08bfe8,
              #5d55ef
            );

          color: #ffffff;

          font-size: 12px;

          font-weight: 900;
        }

        .pdf-section-heading {
          display: flex;

          align-items: center;

          gap: 10px;

          margin: 28px 0 10px;

          page-break-after: avoid;

          break-after: avoid;
        }

        .pdf-section-number {
          width: 6px;

          height: 28px;

          flex: 0 0 6px;

          border-radius: 5px;

          background:
            linear-gradient(
              180deg,
              #08bfe8,
              #6053f4
            );
        }

        .pdf-h1,
        .pdf-h2,
        .pdf-h3,
        .pdf-h4 {
          page-break-after: avoid;

          break-after: avoid;
        }

        .pdf-h1 {
          margin: 25px 0 12px;

          color: #103b63;

          font-size: 23px;

          line-height: 1.25;

          font-weight: 900;

          letter-spacing: -.3px;
        }

        .pdf-h2 {
          margin: 0;

          color: #143c61;

          font-size: 17px;

          line-height: 1.35;

          font-weight: 900;
        }

        .pdf-h3 {
          margin: 20px 0 9px;

          color: #11749d;

          font-size: 14px;

          line-height: 1.35;

          font-weight: 900;
        }

        .pdf-h4 {
          margin: 16px 0 8px;

          color: #2d698c;

          font-size: 12px;

          line-height: 1.4;

          font-weight: 900;
        }

        .pdf-paragraph {
          margin: 0 0 10px;

          color: #42556b;

          font-size: 10px;

          line-height: 1.72;
        }

        .pdf-paragraph strong,
        .pdf-answer-text strong,
        .pdf-callout-text strong,
        .pdf-table strong,
        .pdf-question-text strong {
          color: #153d62;

          font-weight: 900;
        }

        .pdf-ul,
        .pdf-ol {
          margin: 8px 0 15px;

          padding-left: 22px;

          color: #42556b;

          font-size: 10px;

          line-height: 1.7;
        }

        .pdf-ul li,
        .pdf-ol li {
          margin-bottom: 5px;

          padding-left: 4px;

          page-break-inside: avoid;

          break-inside: avoid;
        }

        .pdf-ul li::marker,
        .pdf-ol li::marker {
          color: #0a9dcc;

          font-weight: 900;
        }

        .pdf-divider {
          height: 1px;

          margin: 17px 0;

          background:
            linear-gradient(
              90deg,
              #d9e8f2,
              transparent
            );
        }

        .pdf-space {
          height: 5px;
        }

        /* -----------------------------------------------------
           QUICK INSIGHT / ANSWER / QUESTION CARDS
           ----------------------------------------------------- */

        .pdf-callout {
          display: flex;

          gap: 12px;

          margin: 14px 0;

          padding: 13px 15px;

          border:
            1px solid
            #bfe8f3;

          border-radius: 12px;

          background:
            linear-gradient(
              135deg,
              #effcff,
              #f7fbff
            );

          page-break-inside: avoid;

          break-inside: avoid;
        }

        .pdf-callout-icon {
          width: 28px;

          height: 28px;

          flex: 0 0 28px;

          display: grid;

          place-items: center;

          border-radius: 9px;

          background: #d8f5fc;

          font-size: 13px;
        }

        .pdf-callout-title {
          margin-bottom: 3px;

          color: #087b9f;

          font-size: 9px;

          font-weight: 900;

          text-transform: uppercase;

          letter-spacing: .8px;
        }

        .pdf-callout-text {
          color: #486078;

          font-size: 9.5px;

          line-height: 1.65;
        }

        .pdf-question {
          display: flex;

          gap: 11px;

          margin: 14px 0 6px;

          padding: 12px 14px;

          border:
            1px solid
            #d5e4f1;

          border-radius: 12px;

          background:
            #f7fbff;

          page-break-inside: avoid;

          break-inside: avoid;
        }

        .pdf-question-number {
          min-width: 28px;

          height: 28px;

          display: grid;

          place-items: center;

          border-radius: 8px;

          background:
            linear-gradient(
              135deg,
              #0db8df,
              #5b54e9
            );

          color: #ffffff;

          font-size: 8px;

          font-weight: 900;
        }

        .pdf-question-text {
          color: #1f3854;

          font-size: 10px;

          line-height: 1.55;

          font-weight: 800;
        }

        .pdf-answer {
          margin: 0 0 14px 39px;

          padding: 10px 13px;

          border-left:
            3px solid
            #1bb9df;

          background: #f5fbfe;

          page-break-inside: avoid;

          break-inside: avoid;
        }

        .pdf-answer-label {
          margin-bottom: 4px;

          color: #0784ae;

          font-size: 8px;

          font-weight: 900;

          text-transform: uppercase;

          letter-spacing: 1px;
        }

        .pdf-answer-text {
          color: #4a5e73;

          font-size: 9.5px;

          line-height: 1.65;
        }

        /* -----------------------------------------------------
           TABLE
           ----------------------------------------------------- */

        .pdf-table-wrap {
          width: 100%;

          margin: 15px 0 19px;

          overflow: hidden;

          border:
            1px solid
            #d7e5ef;

          border-radius: 11px;

          page-break-inside: avoid;

          break-inside: avoid;
        }

        .pdf-table {
          width: 100%;

          border-collapse: collapse;

          table-layout: fixed;

          font-size: 8.5px;

          color: #40556b;
        }

        .pdf-table th {
          padding: 9px 8px;

          background:
            linear-gradient(
              135deg,
              #0d9fc9,
              #5a52df
            );

          color: #ffffff;

          font-size: 8px;

          line-height: 1.35;

          text-align: left;

          vertical-align: top;
        }

        .pdf-table td {
          padding: 8px;

          border-top:
            1px solid
            #e0eaf1;

          line-height: 1.45;

          vertical-align: top;

          word-break: break-word;
        }

        .pdf-table tr:nth-child(even) td {
          background: #f7fbfd;
        }

        /* -----------------------------------------------------
           CODE
           ----------------------------------------------------- */

        .pdf-code-card {
          margin: 15px 0;

          page-break-inside: avoid;

          break-inside: avoid;
        }

        .pdf-code-label {
          display: flex;

          align-items: center;

          gap: 6px;

          padding: 7px 11px;

          border-radius:
            9px 9px 0 0;

          background: #16283d;

          color: #9bb1c9;

          font-size: 8px;

          font-weight: 900;

          text-transform: uppercase;

          letter-spacing: 1px;
        }

        .pdf-code-dot {
          width: 6px;

          height: 6px;

          border-radius: 50%;

          background: #2bd4ff;
        }

        .pdf-code {
          margin: 0;

          padding: 15px;

          border-radius:
            0 0 9px 9px;

          background: #091626;

          color: #cceeff;

          font-family:
            "Courier New",
            monospace;

          font-size: 8px;

          line-height: 1.65;

          white-space: pre-wrap;

          word-break: break-word;
        }

        .pdf-content-flow code:not(.pdf-code) {
          padding: 2px 4px;

          border-radius: 4px;

          background: #e9f7fc;

          color: #087ea7;

          font-family:
            "Courier New",
            monospace;

          font-size: 8.5px;

          font-weight: 700;
        }

        .pdf-footer {
          display: flex;

          justify-content: space-between;

          gap: 20px;

          margin-top: 35px;

          padding-top: 12px;

          border-top:
            1px solid
            #dce7ef;

          color: #8798aa;

          font-size: 8px;
        }

        @media print {
          .pdf-renderer {
            display: none !important;
          }
        }

        @media (max-width: 950px) {
          .notes-sidebar {
            width: 240px;
            min-width: 240px;
          }

          .stats-grid {
            grid-template-columns:
              repeat(2, 1fr);
          }
        }

        @media (max-width: 760px) {
          .notes-sidebar {
            position: fixed;

            left: 0;
            top: 0;
            bottom: 0;

            width: min(310px, 88vw);

            z-index: 50;

            transform:
              translateX(-105%);

            transition:
              transform .3s ease;
          }

          .notes-sidebar.mobile-open {
            transform:
              translateX(0);
          }

          .mobile-history-btn {
            display: flex;

            position: fixed;

            left: 15px;
            top: 15px;

            z-index: 40;

            width: 42px;
            height: 42px;

            border-radius: 12px;

            border:
              1px solid
              rgba(0, 205, 255, .25);

            background:
              rgba(5, 17, 34, .85);

            color: #6be5ff;

            align-items: center;
            justify-content: center;

            cursor: pointer;

            backdrop-filter: blur(12px);
          }

          .notes-main {
            padding:
              80px 14px 50px;
          }

          .hero h1 {
            font-size: 42px;
            letter-spacing: -2px;
          }

          .generator-card {
            padding: 17px;
            border-radius: 19px;
          }

          .generator-heading {
            align-items: flex-start;
          }

          .ai-status {
            display: none;
          }

          .stats-grid {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .result-toolbar {
            align-items: flex-start;
            flex-direction: column;
          }

          .toolbar-actions {
            width: 100%;
          }

          .action-btn {
            flex: 1;
          }

          .notes-content {
            padding:
              23px 19px 28px;
          }
        }

        @media (max-width: 480px) {
          .hero h1 {
            font-size: 35px;
          }

          .hero p {
            font-size: 12px;
          }

          .stats-grid {
            grid-template-columns:
              1fr 1fr;
          }

          .stat-card {
            padding: 11px;
          }

          .stat-value {
            font-size: 14px;
          }

          .feature-row {
            display: none;
          }
        }
      `}</style>

      <div className="notes-page">
        <div className="orb orb-one" />
        <div className="orb orb-two" />
        <div className="orb orb-three" />

        {/* MOBILE HISTORY BUTTON */}

        <button
          className="mobile-history-btn"
          onClick={() =>
            setShowMobileHistory(
              (value) => !value
            )
          }
        >
          ☰
        </button>

        <div className="notes-shell">
          {/* =================================================
              SIDEBAR
          ================================================= */}

          <aside
            className={`notes-sidebar ${
              showMobileHistory
                ? "mobile-open"
                : ""
            }`}
          >
            <div className="brand">
              <div className="brand-icon">
                ✦
              </div>

              <div>
                <div className="brand-name">
                  PrepPulse AI
                </div>

                <div className="brand-sub">
                  Intelligent Study Workspace
                </div>
              </div>
            </div>

            <button
              className="new-session-btn"
              onClick={
                startNewSession
              }
            >
              ＋ New Note Session
            </button>

            <div className="history-header">
              <span>
                ◷ &nbsp; HISTORY
              </span>

              <span className="history-count">
                {history.length}
              </span>
            </div>

            <div className="search-box">
              <span>⌕</span>

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search notes..."
              />
            </div>

            <div className="history-list">
              {filteredHistory.length ===
              0 ? (
                <div className="empty-history">
                  <div
                    style={{
                      fontSize: 25,
                      marginBottom: 10,
                    }}
                  >
                    ▤
                  </div>

                  {history.length === 0
                    ? "No saved notes yet."
                    : "No notes match your search."}
                </div>
              ) : (
                filteredHistory.map(
                  (note) => (
                    <button
                      key={note._id}
                      className={`history-item ${
                        selectedNote?._id ===
                        note._id
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        openNote(note)
                      }
                    >
                      <div className="history-item-title">
                        {note.title ||
                          note.subject ||
                          "Untitled Note"}
                      </div>

                      <div className="history-item-date">
                        {formatDate(
                          note.createdAt
                        )}
                      </div>
                    </button>
                  )
                )
              )}
            </div>
          </aside>

          {/* =================================================
              MAIN
          ================================================= */}

          <main className="notes-main">
            <section className="hero">
              <div className="hero-icon">
                ◫
              </div>

              <h1>
                AI Study Notes
                <br />
                Generator
              </h1>

              <p>
                Transform any topic into
                structured, exam-ready study
                material powered by{" "}
                <span className="hero-highlight">
                  PrepPulse AI
                </span>
                .
              </p>

              <div className="feature-row">
                <span className="feature-pill">
                  ✓ Interview Ready
                </span>

                <span className="feature-pill">
                  ✓ Structured Notes
                </span>

                <span className="feature-pill">
                  ✓ PDF Export
                </span>

                <span className="feature-pill">
                  ✓ Personal History
                </span>
              </div>
            </section>

            {/* ALERT */}

            {error && (
              <div className="alert alert-error">
                <span>⚠</span>

                <span>{error}</span>

                <button
                  className="alert-close"
                  onClick={() =>
                    setError("")
                  }
                >
                  ×
                </button>
              </div>
            )}

            {success && (
              <div className="alert alert-success">
                <span>✓</span>

                <span>{success}</span>

                <button
                  className="alert-close"
                  onClick={() =>
                    setSuccess("")
                  }
                >
                  ×
                </button>
              </div>
            )}

            {/* =================================================
                GENERATOR
            ================================================= */}

            <section className="generator-card">
              <div className="generator-heading">
                <div className="heading-left">
                  <div className="heading-icon">
                    ⚡
                  </div>

                  <div>
                    <div className="heading-title">
                      Generate Your Study Notes
                    </div>

                    <div className="heading-subtitle">
                      AI-powered learning
                      workspace
                    </div>
                  </div>
                </div>

                <div className="ai-status">
                  <span className="status-dot" />
                  AI READY
                </div>
              </div>

              <div className="topic-wrapper">
                <input
                  className="topic-input"
                  value={topic}
                  onChange={(event) =>
                    setTopic(
                      event.target.value
                    )
                  }
                  onKeyDown={
                    handleTopicKeyDown
                  }
                  onFocus={() =>
                    setShowSuggestions(
                      true
                    )
                  }
                  placeholder="Enter a topic — e.g. Java OOP, Spring Boot, SQL Joins..."
                  disabled={loading}
                />

                {topic && !loading && (
                  <button
                    className="clear-topic"
                    onClick={() =>
                      setTopic("")
                    }
                    title="Clear topic"
                  >
                    ×
                  </button>
                )}
              </div>

              <div className="suggestion-label">
                Try a popular topic
              </div>

              <div className="suggestion-row">
                {SUGGESTIONS.slice(
                  0,
                  5
                ).map(
                  (suggestion) => (
                    <button
                      key={suggestion}
                      className="suggestion"
                      onClick={() =>
                        chooseSuggestion(
                          suggestion
                        )
                      }
                    >
                      {suggestion}
                    </button>
                  )
                )}
              </div>

              <button
                className="generate-btn"
                onClick={
                  generateNotes
                }
                disabled={
                  loading ||
                  !topic.trim()
                }
              >
                {loading ? (
                  <>
                    <span className="spinner" />
                    Generating AI Study
                    Material...
                  </>
                ) : (
                  <>
                    ✨ &nbsp; Generate PrepPulse AI
                    Study Notes &nbsp; →
                  </>
                )}
              </button>
            </section>

            {/* =================================================
                PROGRESS
            ================================================= */}

            {loading && (
              <section className="progress-card">
                <div className="progress-top">
                  <span>
                    AI Processing Pipeline
                  </span>

                  <span className="progress-value">
                    {progress}%
                  </span>
                </div>

                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${progress}%`,
                    }}
                  />
                </div>

                <div
                  style={{
                    marginTop: 9,
                    color: "#607a9c",
                    fontSize: 10,
                  }}
                >
                  {generationStage}
                </div>
              </section>
            )}

            {/* =================================================
                STATS
            ================================================= */}

            <section className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  ◈
                </div>

                <div>
                  <div className="stat-value">
                    {statistics.sections}
                  </div>

                  <div className="stat-label">
                    Sections
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  ✎
                </div>

                <div>
                  <div className="stat-value">
                    {statistics.words.toLocaleString()}
                  </div>

                  <div className="stat-label">
                    Words
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  ◷
                </div>

                <div>
                  <div className="stat-value">
                    {statistics.readingTime}m
                  </div>

                  <div className="stat-label">
                    Reading
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  ☆
                </div>

                <div>
                  <div className="stat-value">
                    {history.length}
                  </div>

                  <div className="stat-label">
                    Saved
                  </div>
                </div>
              </div>
            </section>

            {/* =================================================
                RESULT
            ================================================= */}

            {notes.trim() && (
              <section className="result-card">
                <div className="result-toolbar">
                  <div className="result-title">
                    <div className="result-title-icon">
                      ◫
                    </div>

                    <div>
                      <strong>
                        {topic ||
                          "AI Study Notes"}
                      </strong>

                      <small>
                        {generationTime
                          ? `Generated in ${generationTime}s`
                          : selectedNote
                          ? `Saved ${formatDate(
                              selectedNote.createdAt
                            )}`
                          : "AI-generated study material"}
                      </small>
                    </div>
                  </div>

                  <div className="toolbar-actions">
                    <button
                      className="action-btn"
                      onClick={
                        copyNotes
                      }
                    >
                      {copied
                        ? "✓ Copied"
                        : "⧉ Copy"}
                    </button>

                    <button
                      className="action-btn primary"
                      onClick={
                        saveNote
                      }
                      disabled={saving}
                    >
                      {saving
                        ? "Saving..."
                        : "☆ Save"}
                    </button>

                    

                    {selectedNote && (
                      <button
                        className="action-btn danger"
                        onClick={() =>
                          setShowDeleteConfirm(
                            true
                          )
                        }
                      >
                        ♲ Delete
                      </button>
                    )}
                  </div>
                </div>

                <article className="notes-content">
                  <div
                    dangerouslySetInnerHTML={{
                      __html:
                        markdownToHtml(
                          notes
                        ),
                    }}
                  />
                </article>
              </section>
            )}

            {/* =================================================
                EMPTY STATE
            ================================================= */}

            {!notes.trim() &&
              !loading && (
                <div className="empty-state">
                  <div className="empty-icon">
                    🧠
                  </div>

                  <h3>
                    Your AI study workspace
                    is ready
                  </h3>

                  <p>
                    Enter a topic above and
                    let PrepPulse build your
                    study material.
                  </p>
                </div>
              )}
          </main>
        </div>

        {/* ===================================================
            PDF RENDERER
        =================================================== */}

        <div
          ref={pdfRef}
          className="pdf-renderer"
        >
          <div className="pdf-document">
            {/* =================================================
                BEAUTIFUL COVER
            ================================================= */}

            <section className="pdf-page pdf-cover">
              <div className="pdf-cover-inner">
                <div className="pdf-brand">
                  <div className="pdf-brand-icon">
                    ✦
                  </div>

                  <span>
                    PrepPulse AI
                  </span>
                </div>

                <div className="pdf-eyebrow">
                  AI STUDY GUIDE
                </div>

                <h1>
                  {topic ||
                    "AI Generated Study Notes"}
                </h1>

                <div className="pdf-cover-description">
                  A clear, structured and
                  revision-friendly study guide
                  created from your AI-generated
                  notes. Designed for learning,
                  practice and interview
                  preparation.
                </div>

                <div className="pdf-cover-stats">
                  <div className="pdf-stat">
                    <div className="pdf-stat-value">
                      {statistics.words}
                    </div>

                    <div className="pdf-stat-label">
                      Words
                    </div>
                  </div>

                  <div className="pdf-stat">
                    <div className="pdf-stat-value">
                      {statistics.sections}
                    </div>

                    <div className="pdf-stat-label">
                      Sections
                    </div>
                  </div>

                  <div className="pdf-stat">
                    <div className="pdf-stat-value">
                      {statistics.readingTime}m
                    </div>

                    <div className="pdf-stat-label">
                      Reading Time
                    </div>
                  </div>
                </div>

                {getPdfOutline(
                  notes
                ).length > 0 && (
                  <div className="pdf-outline">
                    <div className="pdf-outline-title">
                      Inside this guide
                    </div>

                    <ol className="pdf-outline-list">
                      {getPdfOutline(
                        notes
                      ).map(
                        (
                          section,
                          index
                        ) => (
                          <li
                            key={`${section}-${index}`}
                          >
                            {section}
                          </li>
                        )
                      )}
                    </ol>
                  </div>
                )}
              </div>

              <div className="pdf-cover-footer">
                <span>
                  PrepPulse AI •
                  Intelligent Study
                  Workspace
                </span>

                <span>
                  {new Date().toLocaleDateString(
                    "en-IN"
                  )}
                </span>
              </div>
            </section>

            {/* =================================================
                FLOWING STUDY CONTENT
            ================================================= */}

            <section className="pdf-content-flow">
              <div className="pdf-header">
                <div className="pdf-header-row">
                  <div className="pdf-header-title">
                    {topic ||
                      "AI Study Notes"}
                  </div>

                  <div className="pdf-header-badge">
                    Study Guide
                  </div>
                </div>

                <div className="pdf-header-meta">
                  Generated by PrepPulse AI
                  {" • "}
                  {new Date().toLocaleDateString(
                    "en-IN"
                  )}
                </div>
              </div>

              <div className="pdf-reading-tip">
                <div className="pdf-reading-tip-icon">
                  ✓
                </div>

                <div>
                  <strong>
                    Best way to use these
                    notes:
                  </strong>{" "}
                  Read the concepts first,
                  study the examples, test
                  yourself with the interview
                  questions, then use the quick
                  revision points before your
                  exam or interview.
                </div>
              </div>

              <div
                dangerouslySetInnerHTML={{
                  __html:
                    markdownToHtml(
                      notes
                    ),
                }}
              />

              <div className="pdf-footer">
                <span>
                  PrepPulse AI
                </span>

                <span>
                  Learn • Practice •
                  Revise • Succeed
                </span>
              </div>
            </section>
          </div>
        </div>

        {/* ===================================================
            DELETE MODAL
        =================================================== */}

        {showDeleteConfirm && (
          <div
            className="modal-backdrop"
            onClick={() =>
              setShowDeleteConfirm(
                false
              )
            }
          >
            <div
              className="delete-modal"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <div className="delete-modal-icon">
                ♲
              </div>

              <h3>
                Delete this note?
              </h3>

              <p>
                This will permanently remove
                this saved study note from your
                PrepPulse history. This action
                cannot be undone.
              </p>

              <div className="modal-actions">
                <button
                  className="modal-btn modal-cancel"
                  onClick={() =>
                    setShowDeleteConfirm(
                      false
                    )
                  }
                >
                  Cancel
                </button>

                <button
                  className="modal-btn modal-delete"
                  onClick={
                    deleteNote
                  }
                  disabled={
                    deleting
                  }
                >
                  {deleting
                    ? "Deleting..."
                    : "Delete Note"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}