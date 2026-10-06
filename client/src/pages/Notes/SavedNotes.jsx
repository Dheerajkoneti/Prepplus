import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import {
  FiBookmark,
  FiDownload,
  FiTrash2,
  FiSearch,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiBookOpen,
  FiFileText,
  FiEye,
  FiX,
  FiClock,
  FiLayers,
  FiArrowUpRight,
  FiCopy,
  FiCheck,
} from "react-icons/fi";

import html2pdf from "html2pdf.js";

import API from "../../services/api";


function SavedNotes() {

  const [
    notesList,
    setNotesList,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

  const [
    selectedNote,
    setSelectedNote,
  ] = useState(null);

  const [
    toast,
    setToast,
  ] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const [
    copied,
    setCopied,
  ] = useState(false);

  const [
    downloading,
    setDownloading,
  ] = useState(false);


  // ==========================================================
  // TOAST
  // ==========================================================

  const showToast = (
    message,
    type = "success"
  ) => {
    setToast({
      show: true,
      message,
      type,
    });

    setTimeout(() => {
      setToast({
        show: false,
        message: "",
        type: "success",
      });
    }, 3200);
  };


  // ==========================================================
  // FETCH
  // ==========================================================

  const fetchSavedNotes =
    async () => {
      try {
        setLoading(true);

        const token =
          localStorage.getItem(
            "token"
          );

        if (!token) {
          showToast(
            "Please login first.",
            "error"
          );

          return;
        }

        const response =
          await API.get(
            "/notes",
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        setNotesList(
          response.data.notes ||
            []
        );
      } catch (error) {
        console.error(
          "Fetch Notes Error:",
          error
        );

        showToast(
          error.response?.data
            ?.message ||
            "Failed to load notes.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    };


  useEffect(() => {
    fetchSavedNotes();
  }, []);


  // ==========================================================
  // DELETE
  // ==========================================================

  const deleteNote =
    async (
      id,
      event
    ) => {
      event?.stopPropagation();

      const confirmed =
        window.confirm(
          "Delete this study note?"
        );

      if (!confirmed) {
        return;
      }

      try {
        const token =
          localStorage.getItem(
            "token"
          );

        await API.delete(
          `/notes/${id}`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        setNotesList(
          (previous) =>
            previous.filter(
              (note) =>
                note._id !== id
            )
        );

        if (
          selectedNote?._id ===
          id
        ) {
          setSelectedNote(null);
        }

        showToast(
          "Note deleted successfully.",
          "success"
        );
      } catch (error) {
        console.error(
          "Delete Note Error:",
          error
        );

        showToast(
          "Failed to delete note.",
          "error"
        );
      }
    };


  // ==========================================================
  // PDF HTML
  // ==========================================================

  const markdownToPdfHTML =
    (content) => {
      if (!content) {
        return "";
      }

      const escapeHTML =
        (value) =>
          value
            .replace(
              /&/g,
              "&amp;"
            )
            .replace(
              /</g,
              "&lt;"
            )
            .replace(
              />/g,
              "&gt;"
            );

      return content
        .split("\n")
        .map((line) => {
          const trimmed =
            line.trim();

          if (!trimmed) {
            return `<div style="height:8px"></div>`;
          }

          if (
            trimmed.startsWith(
              "# "
            )
          ) {
            return `
              <h1>
                ${escapeHTML(
                  trimmed.replace(
                    "# ",
                    ""
                  )
                )}
              </h1>
            `;
          }

          if (
            trimmed.startsWith(
              "## "
            )
          ) {
            return `
              <h2>
                ${escapeHTML(
                  trimmed.replace(
                    "## ",
                    ""
                  )
                )}
              </h2>
            `;
          }

          if (
            trimmed.startsWith(
              "### "
            )
          ) {
            return `
              <h3>
                ${escapeHTML(
                  trimmed.replace(
                    "### ",
                    ""
                  )
                )}
              </h3>
            `;
          }

          if (
            trimmed.startsWith(
              "- "
            ) ||
            trimmed.startsWith(
              "* "
            )
          ) {
            return `
              <div class="pdf-list">
                <span>•</span>
                <span>
                  ${escapeHTML(
                    trimmed.substring(
                      2
                    )
                  )}
                </span>
              </div>
            `;
          }

          return `
            <p>
              ${escapeHTML(
                trimmed
              )}
            </p>
          `;
        })
        .join("");
    };


  // ==========================================================
  // DOWNLOAD PDF
  // ==========================================================

  const downloadPDF =
    async (
      note,
      event
    ) => {
      event?.stopPropagation();

      try {
        setDownloading(true);

        const wrapper =
          document.createElement(
            "div"
          );

        wrapper.style.width =
          "794px";

        wrapper.style.padding =
          "50px";

        wrapper.style.background =
          "#ffffff";

        wrapper.style.color =
          "#0f172a";

        wrapper.style.fontFamily =
          "Arial, Helvetica, sans-serif";

        wrapper.innerHTML = `
          <div
            style="
              border-bottom:3px solid #0284c7;
              padding-bottom:22px;
              margin-bottom:25px;
            "
          >
            <div
              style="
                color:#0284c7;
                font-size:12px;
                font-weight:800;
                letter-spacing:1.5px;
              "
            >
              PREPPULSE AI
            </div>

            <h1
              style="
                font-size:30px;
                margin:12px 0 7px;
                color:#0f172a;
              "
            >
              ${note.title}
            </h1>

            <div
              style="
                color:#64748b;
                font-size:11px;
              "
            >
              AI Study Notes •
              Generated ${new Date(
                note.createdAt ||
                  Date.now()
              ).toLocaleDateString(
                "en-IN"
              )}
            </div>
          </div>

          <div
            style="
              font-size:12px;
              line-height:1.75;
            "
          >
            ${markdownToPdfHTML(
              note.content
            )}
          </div>

          <div
            style="
              margin-top:35px;
              padding-top:12px;
              border-top:1px solid #cbd5e1;
              text-align:center;
              color:#64748b;
              font-size:9px;
            "
          >
            Generated by PrepPulse AI
          </div>

          <style>
            h1 {
              color:#0369a1;
              font-size:23px;
              margin-top:24px;
              padding-bottom:7px;
              border-bottom:1px solid #bae6fd;
            }

            h2 {
              color:#0f172a;
              font-size:16px;
              margin-top:22px;
              padding-left:9px;
              border-left:4px solid #0ea5e9;
            }

            h3 {
              color:#334155;
              font-size:14px;
              margin-top:16px;
            }

            p {
              color:#334155;
              margin:6px 0;
            }

            .pdf-list {
              display:flex;
              gap:8px;
              margin:5px 0;
              color:#334155;
            }

            .pdf-list span:first-child {
              color:#0284c7;
              font-weight:800;
            }
          </style>
        `;

        document.body.appendChild(
          wrapper
        );

        const filename =
          note.title
            .replace(
              /[^a-z0-9]+/gi,
              "_"
            )
            .replace(
              /^_|_$/g,
              ""
            );

        await html2pdf()
          .set({
            margin: [
              12,
              12,
              15,
              12,
            ],

            filename:
              `${filename}_Notes.pdf`,

            image: {
              type: "jpeg",
              quality: 0.98,
            },

            html2canvas: {
              scale: 2,
              useCORS: true,
              backgroundColor:
                "#ffffff",
            },

            jsPDF: {
              unit: "mm",
              format: "a4",
              orientation:
                "portrait",
            },

            pagebreak: {
              mode: [
                "css",
                "legacy",
              ],
            },
          })
          .from(wrapper)
          .save();

        document.body.removeChild(
          wrapper
        );

        showToast(
          "PDF downloaded successfully 📄",
          "success"
        );
      } catch (error) {
        console.error(
          "PDF Error:",
          error
        );

        showToast(
          "Failed to create PDF.",
          "error"
        );
      } finally {
        setDownloading(false);
      }
    };


  // ==========================================================
  // COPY
  // ==========================================================

  const copyNote =
    async () => {
      if (!selectedNote) {
        return;
      }

      try {
        await navigator.clipboard.writeText(
          selectedNote.content
        );

        setCopied(true);

        showToast(
          "Notes copied successfully.",
          "success"
        );

        setTimeout(
          () =>
            setCopied(false),
          1800
        );
      } catch {
        showToast(
          "Unable to copy notes.",
          "error"
        );
      }
    };


  // ==========================================================
  // FILTER
  // ==========================================================

  const filteredNotes =
    useMemo(() => {
      const query =
        searchTerm
          .trim()
          .toLowerCase();

      if (!query) {
        return notesList;
      }

      return notesList.filter(
        (note) =>
          note.title
            ?.toLowerCase()
            .includes(query) ||
          note.content
            ?.toLowerCase()
            .includes(query)
      );
    }, [
      notesList,
      searchTerm,
    ]);


  // ==========================================================
  // WORD COUNT
  // ==========================================================

  const totalWords =
    useMemo(() => {
      return notesList.reduce(
        (total, note) => {
          return (
            total +
            (
              note.content ||
              ""
            )
              .trim()
              .split(/\s+/)
              .filter(Boolean)
              .length
          );
        },
        0
      );
    }, [notesList]);


  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="saved-page">

      <style>
        {`
          * {
            box-sizing: border-box;
          }

          .saved-page {
            min-height:100vh;
            padding:40px 25px 80px;
            color:#f8fafc;
            background:
              radial-gradient(
                circle at 10% 0%,
                rgba(14,165,233,.14),
                transparent 25%
              ),
              radial-gradient(
                circle at 90% 10%,
                rgba(99,102,241,.15),
                transparent 28%
              ),
              #030712;
          }

          .saved-container {
            width:100%;
            max-width:1250px;
            margin:auto;
          }

          .saved-hero {
            text-align:center;
            margin-bottom:30px;
          }

          .saved-icon {
            width:70px;
            height:70px;
            border-radius:22px;
            margin:0 auto 16px;
            display:flex;
            align-items:center;
            justify-content:center;
            color:#67e8f9;
            background:
              linear-gradient(
                135deg,
                rgba(34,211,238,.12),
                rgba(99,102,241,.15)
              );
            border:
              1px solid
              rgba(34,211,238,.25);
            box-shadow:
              0 0 40px
              rgba(34,211,238,.12);
          }

          .saved-hero h1 {
            margin:0;
            font-size:
              clamp(2rem,4vw,3rem);
            font-weight:950;
            letter-spacing:-1.5px;
            background:
              linear-gradient(
                90deg,
                #fff,
                #bae6fd,
                #a5b4fc
              );
            -webkit-background-clip:text;
            color:transparent;
          }

          .saved-hero p {
            color:#7c8ba1;
            max-width:650px;
            margin:12px auto 0;
            line-height:1.7;
            font-size:.92rem;
          }

          .dashboard {
            display:grid;
            grid-template-columns:
              repeat(3,1fr);
            gap:13px;
            margin-bottom:22px;
          }

          .dashboard-card {
            border:
              1px solid
              rgba(148,163,184,.09);
            background:
              rgba(15,23,42,.62);
            backdrop-filter:blur(20px);
            border-radius:17px;
            padding:17px;
            display:flex;
            align-items:center;
            gap:13px;
          }

          .dashboard-icon {
            width:42px;
            height:42px;
            border-radius:13px;
            display:flex;
            align-items:center;
            justify-content:center;
            color:#67e8f9;
            background:
              rgba(34,211,238,.08);
          }

          .dashboard-value {
            font-size:1.2rem;
            font-weight:900;
          }

          .dashboard-label {
            color:#64748b;
            font-size:.68rem;
            margin-top:2px;
          }

          .search-panel {
            border:
              1px solid
              rgba(148,163,184,.10);
            background:
              rgba(15,23,42,.7);
            backdrop-filter:blur(20px);
            border-radius:18px;
            padding:14px;
            margin-bottom:22px;
            position:relative;
          }

          .search-panel input {
            width:100%;
            border:0;
            outline:none;
            padding:12px 45px;
            color:white;
            background:transparent;
            font-size:.9rem;
          }

          .search-icon {
            position:absolute;
            left:18px;
            top:50%;
            transform:translateY(-50%);
            color:#64748b;
          }

          .notes-grid {
            display:grid;
            grid-template-columns:
              repeat(
                auto-fill,
                minmax(300px,1fr)
              );
            gap:18px;
          }

          .note-card {
            min-height:265px;
            display:flex;
            flex-direction:column;
            justify-content:space-between;
            border:
              1px solid
              rgba(148,163,184,.10);
            background:
              linear-gradient(
                145deg,
                rgba(15,23,42,.82),
                rgba(15,23,42,.52)
              );
            backdrop-filter:blur(22px);
            border-radius:21px;
            padding:21px;
            cursor:pointer;
            position:relative;
            overflow:hidden;
            transition:.25s;
          }

          .note-card::before {
            content:"";
            position:absolute;
            width:180px;
            height:180px;
            right:-100px;
            top:-100px;
            border-radius:50%;
            background:
              rgba(34,211,238,.08);
            filter:blur(30px);
          }

          .note-card:hover {
            transform:
              translateY(-5px);
            border-color:
              rgba(34,211,238,.24);
            box-shadow:
              0 25px 55px
              rgba(0,0,0,.28);
          }

          .note-top {
            display:flex;
            justify-content:space-between;
            align-items:flex-start;
            gap:10px;
          }

          .note-icon {
            width:42px;
            height:42px;
            border-radius:13px;
            display:flex;
            align-items:center;
            justify-content:center;
            color:#67e8f9;
            background:
              rgba(34,211,238,.08);
            border:
              1px solid
              rgba(34,211,238,.13);
          }

          .note-badge {
            color:#94a3b8;
            background:
              rgba(255,255,255,.04);
            border:
              1px solid
              rgba(255,255,255,.06);
            padding:5px 8px;
            border-radius:7px;
            font-size:.62rem;
            font-weight:800;
          }

          .note-title {
            color:white;
            font-size:1.05rem;
            font-weight:850;
            line-height:1.4;
            margin:18px 0 9px;
          }

          .note-preview {
            color:#7f8da3;
            font-size:.78rem;
            line-height:1.65;
            display:-webkit-box;
            -webkit-line-clamp:4;
            -webkit-box-orient:vertical;
            overflow:hidden;
          }

          .note-footer {
            display:flex;
            align-items:center;
            justify-content:space-between;
            padding-top:15px;
            margin-top:18px;
            border-top:
              1px solid
              rgba(148,163,184,.08);
          }

          .view-btn {
            border:0;
            background:transparent;
            color:#67e8f9;
            display:flex;
            align-items:center;
            gap:6px;
            cursor:pointer;
            font-size:.75rem;
            font-weight:800;
          }

          .actions {
            display:flex;
            gap:6px;
          }

          .icon-btn {
            width:33px;
            height:33px;
            border-radius:9px;
            display:flex;
            align-items:center;
            justify-content:center;
            cursor:pointer;
            background:
              rgba(255,255,255,.04);
            border:
              1px solid
              rgba(148,163,184,.10);
            color:#94a3b8;
          }

          .icon-btn:hover {
            color:#67e8f9;
            border-color:
              rgba(34,211,238,.25);
          }

          .icon-btn.delete:hover {
            color:#fb7185;
            border-color:
              rgba(251,113,133,.25);
          }

          .modal-backdrop {
            position:fixed;
            inset:0;
            z-index:9998;
            padding:25px;
            display:flex;
            align-items:center;
            justify-content:center;
            background:
              rgba(2,6,23,.82);
            backdrop-filter:
              blur(16px);
          }

          .modal {
            width:100%;
            max-width:900px;
            max-height:90vh;
            display:flex;
            flex-direction:column;
            overflow:hidden;
            border:
              1px solid
              rgba(148,163,184,.13);
            border-radius:25px;
            background:
              #0b1220;
            box-shadow:
              0 40px 100px
              rgba(0,0,0,.55);
          }

          .modal-header {
            padding:20px 22px;
            display:flex;
            justify-content:space-between;
            align-items:center;
            gap:15px;
            border-bottom:
              1px solid
              rgba(148,163,184,.09);
          }

          .modal-title {
            min-width:0;
          }

          .modal-title h2 {
            margin:0;
            color:white;
            font-size:1.15rem;
            white-space:nowrap;
            overflow:hidden;
            text-overflow:ellipsis;
          }

          .modal-title span {
            color:#64748b;
            font-size:.68rem;
          }

          .modal-actions {
            display:flex;
            gap:7px;
          }

          .modal-action {
            border:
              1px solid
              rgba(148,163,184,.11);
            background:
              rgba(255,255,255,.04);
            color:#cbd5e1;
            border-radius:10px;
            padding:8px 11px;
            display:flex;
            align-items:center;
            gap:6px;
            cursor:pointer;
            font-size:.72rem;
            font-weight:750;
          }

          .modal-action:hover {
            color:#67e8f9;
            border-color:
              rgba(34,211,238,.25);
          }

          .modal-content {
            overflow-y:auto;
            padding:28px;
            color:#cbd5e1;
            line-height:1.8;
          }

          .modal-content::-webkit-scrollbar {
            width:5px;
          }

          .modal-content::-webkit-scrollbar-thumb {
            background:
              rgba(100,116,139,.35);
            border-radius:99px;
          }

          .modal-content h1 {
            color:#67e8f9;
            font-size:1.6rem;
            border-bottom:
              1px solid
              rgba(34,211,238,.15);
            padding-bottom:10px;
          }

          .modal-content h2 {
            color:#e0f2fe;
            font-size:1.08rem;
            margin-top:25px;
          }

          .modal-content h3 {
            color:#a5b4fc;
            font-size:.95rem;
          }

          .modal-content p {
            color:#aebdd0;
            font-size:.9rem;
          }

          .modal-content li {
            color:#aebdd0;
          }

          .empty {
            text-align:center;
            padding:75px 20px;
            border:
              1px dashed
              rgba(148,163,184,.12);
            border-radius:22px;
            color:#64748b;
          }

          .empty-icon {
            width:70px;
            height:70px;
            margin:0 auto 15px;
            border-radius:20px;
            display:flex;
            align-items:center;
            justify-content:center;
            background:
              rgba(34,211,238,.06);
            color:#22d3ee;
          }

          .toast {
            position:fixed;
            right:22px;
            top:22px;
            z-index:10000;
            padding:13px 17px;
            border-radius:13px;
            display:flex;
            align-items:center;
            gap:9px;
            color:white;
            font-size:.8rem;
            font-weight:750;
            box-shadow:
              0 20px 50px
              rgba(0,0,0,.45);
          }

          @media(max-width:750px) {
            .saved-page {
              padding:
                28px 13px 60px;
            }

            .dashboard {
              grid-template-columns:1fr;
            }

            .notes-grid {
              grid-template-columns:1fr;
            }

            .modal-backdrop {
              padding:10px;
            }

            .modal-header {
              align-items:flex-start;
              flex-direction:column;
            }

            .modal-actions {
              width:100%;
            }

            .modal-action {
              flex:1;
              justify-content:center;
            }

            .modal-content {
              padding:20px;
            }
          }
        `}
      </style>


      <div className="saved-container">

        {/* HERO */}

        <motion.div
          className="saved-hero"
          initial={{
            opacity:0,
            y:20,
          }}
          animate={{
            opacity:1,
            y:0,
          }}
        >
          <div className="saved-icon">
            <FiBookmark
              size={29}
            />
          </div>

          <h1>
            Your Study Library
          </h1>

          <p>
            Everything you generate,
            save, revise and download —
            organized in one intelligent
            learning workspace.
          </p>
        </motion.div>


        {/* DASHBOARD */}

        <div className="dashboard">

          <div className="dashboard-card">
            <div className="dashboard-icon">
              <FiBookOpen />
            </div>

            <div>
              <div className="dashboard-value">
                {
                  notesList.length
                }
              </div>

              <div className="dashboard-label">
                Saved Notes
              </div>
            </div>
          </div>


          <div className="dashboard-card">
            <div className="dashboard-icon">
              <FiLayers />
            </div>

            <div>
              <div className="dashboard-value">
                {
                  totalWords.toLocaleString()
                }
              </div>

              <div className="dashboard-label">
                Total Words
              </div>
            </div>
          </div>


          <div className="dashboard-card">
            <div className="dashboard-icon">
              <FiClock />
            </div>

            <div>
              <div className="dashboard-value">
                AI Library
              </div>

              <div className="dashboard-label">
                Personal Workspace
              </div>
            </div>
          </div>

        </div>


        {/* SEARCH */}

        <div className="search-panel">
          <FiSearch
            className="search-icon"
            size={18}
          />

          <input
            placeholder="Search by topic or content..."
            value={
              searchTerm
            }
            onChange={(e) =>
              setSearchTerm(
                e.target.value
              )
            }
          />
        </div>


        {/* CONTENT */}

        {loading ? (
          <div className="empty">
            <motion.div
              animate={{
                rotate:360,
              }}
              transition={{
                duration:1,
                repeat:
                  Infinity,
                ease:"linear",
              }}
              style={{
                display:"inline-flex",
                marginBottom:12,
                color:"#22d3ee",
              }}
            >
              <FiRefreshCw
                size={30}
              />
            </motion.div>

            <div>
              Loading your study
              library...
            </div>
          </div>
        ) : filteredNotes.length ===
          0 ? (
          <motion.div
            className="empty"
            initial={{
              opacity:0,
            }}
            animate={{
              opacity:1,
            }}
          >
            <div className="empty-icon">
              <FiBookOpen
                size={28}
              />
            </div>

            <h3
              style={{
                color:"#e2e8f0",
                margin:"0 0 7px",
              }}
            >
              No study notes found
            </h3>

            <p
              style={{
                margin:0,
                fontSize:".82rem",
              }}
            >
              Generate and save notes
              from the AI Notes Generator
              to build your library.
            </p>
          </motion.div>
        ) : (
          <div className="notes-grid">

            <AnimatePresence>
              {filteredNotes.map(
                (note, index) => (
                  <motion.div
                    key={
                      note._id
                    }
                    className="note-card"
                    initial={{
                      opacity:0,
                      y:20,
                    }}
                    animate={{
                      opacity:1,
                      y:0,
                    }}
                    transition={{
                      delay:
                        index *
                        .04,
                    }}
                    onClick={() =>
                      setSelectedNote(
                        note
                      )
                    }
                  >

                    <div>

                      <div className="note-top">
                        <div className="note-icon">
                          <FiFileText />
                        </div>

                        <div className="note-badge">
                          AI STUDY NOTE
                        </div>
                      </div>


                      <div className="note-title">
                        {note.title}
                      </div>


                      <div className="note-preview">
                        {
                          note.content
                        }
                      </div>

                    </div>


                    <div className="note-footer">

                      <button
                        className="view-btn"
                        onClick={(
                          event
                        ) => {
                          event.stopPropagation();

                          setSelectedNote(
                            note
                          );
                        }}
                      >
                        <FiEye />
                        Open Note
                        <FiArrowUpRight />
                      </button>


                      <div className="actions">

                        <button
                          className="icon-btn"
                          title="Download PDF"
                          onClick={(
                            event
                          ) =>
                            downloadPDF(
                              note,
                              event
                            )
                          }
                        >
                          {downloading ? (
                            <FiRefreshCw />
                          ) : (
                            <FiDownload />
                          )}
                        </button>


                        <button
                          className="icon-btn delete"
                          title="Delete"
                          onClick={(
                            event
                          ) =>
                            deleteNote(
                              note._id,
                              event
                            )
                          }
                        >
                          <FiTrash2 />
                        </button>

                      </div>

                    </div>

                  </motion.div>
                )
              )}
            </AnimatePresence>

          </div>
        )}

      </div>


      {/* =====================================================
          NOTE MODAL
      ===================================================== */}

      <AnimatePresence>
        {selectedNote && (
          <motion.div
            className="modal-backdrop"
            initial={{
              opacity:0,
            }}
            animate={{
              opacity:1,
            }}
            exit={{
              opacity:0,
            }}
            onClick={() =>
              setSelectedNote(
                null
              )
            }
          >

            <motion.div
              className="modal"
              initial={{
                opacity:0,
                scale:.95,
                y:15,
              }}
              animate={{
                opacity:1,
                scale:1,
                y:0,
              }}
              exit={{
                opacity:0,
                scale:.95,
              }}
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <div className="modal-header">

                <div className="modal-title">
                  <h2>
                    {selectedNote.title}
                  </h2>

                  <span>
                    PrepPulse AI Study Note
                  </span>
                </div>


                <div className="modal-actions">

                  <button
                    className="modal-action"
                    onClick={
                      copyNote
                    }
                  >
                    {copied ? (
                      <FiCheck />
                    ) : (
                      <FiCopy />
                    )}

                    {copied
                      ? "Copied"
                      : "Copy"}
                  </button>


                  <button
                    className="modal-action"
                    onClick={(event) =>
                      downloadPDF(
                        selectedNote,
                        event
                      )
                    }
                  >
                    <FiDownload />

                    PDF
                  </button>


                  <button
                    className="modal-action"
                    onClick={() =>
                      setSelectedNote(
                        null
                      )
                    }
                  >
                    <FiX />
                    Close
                  </button>

                </div>

              </div>


              <div className="modal-content">

                {selectedNote.content
                  ?.split("\n")
                  .map(
                    (
                      line,
                      index
                    ) => {
                      const text =
                        line.trim();

                      if (!text) {
                        return (
                          <div
                            key={
                              index
                            }
                            style={{
                              height:7,
                            }}
                          />
                        );
                      }

                      if (
                        text.startsWith(
                          "# "
                        )
                      ) {
                        return (
                          <h1
                            key={
                              index
                            }
                          >
                            {
                              text.replace(
                                "# ",
                                ""
                              )
                            }
                          </h1>
                        );
                      }

                      if (
                        text.startsWith(
                          "## "
                        )
                      ) {
                        return (
                          <h2
                            key={
                              index
                            }
                          >
                            {
                              text.replace(
                                "## ",
                                ""
                              )
                            }
                          </h2>
                        );
                      }

                      if (
                        text.startsWith(
                          "### "
                        )
                      ) {
                        return (
                          <h3
                            key={
                              index
                            }
                          >
                            {
                              text.replace(
                                "### ",
                                ""
                              )
                            }
                          </h3>
                        );
                      }

                      if (
                        text.startsWith(
                          "- "
                        ) ||
                        text.startsWith(
                          "* "
                        )
                      ) {
                        return (
                          <div
                            key={
                              index
                            }
                            style={{
                              display:"flex",
                              gap:8,
                              margin:
                                "6px 0",
                            }}
                          >
                            <span
                              style={{
                                color:"#22d3ee",
                              }}
                            >
                              •
                            </span>

                            <span>
                              {
                                text.substring(
                                  2
                                )
                              }
                            </span>
                          </div>
                        );
                      }

                      return (
                        <p
                          key={
                            index
                          }
                        >
                          {text}
                        </p>
                      );
                    }
                  )}

              </div>

            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>


      {/* =====================================================
          TOAST
      ===================================================== */}

      <AnimatePresence>
        {toast.show && (
          <motion.div
            className="toast"
            initial={{
              opacity:0,
              y:-15,
            }}
            animate={{
              opacity:1,
              y:0,
            }}
            exit={{
              opacity:0,
              y:-15,
            }}
            style={{
              background:
                toast.type ===
                "success"
                  ? "rgba(5,150,105,.94)"
                  : "rgba(190,24,93,.94)",
            }}
          >
            {toast.type ===
            "success" ? (
              <FiCheckCircle />
            ) : (
              <FiAlertCircle />
            )}

            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default SavedNotes;