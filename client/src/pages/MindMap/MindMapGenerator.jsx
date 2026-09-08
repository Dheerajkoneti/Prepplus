import { useState, useEffect } from "react";
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
} from "lucide-react";
import html2pdf from "html2pdf.js";

const MindMapGenerator = () => {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [mindMap, setMindMap] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [exportingId, setExportingId] = useState(null);

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3500);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:5000/api/youtube/history",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setHistory(
        Array.isArray(res.data)
          ? res.data
          : res.data.data || []
      );
    } catch (err) {
      console.error(err);
    }
  };

  const generateMindMap = async () => {
    if (!youtubeUrl.trim()) {
      showToast("Please enter a YouTube URL", "error");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:5000/api/youtube/generate",
        {
          videoUrl: youtubeUrl,
          prompt: customPrompt,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMindMap(res.data.data.mindMap);
      showToast("Mind Map generated successfully! 🚀", "success");
      fetchHistory();
    } catch (error) {
      console.error(error);
      showToast(
        error?.response?.data?.message || "Failed to generate mind map",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteMindMap = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `http://localhost:5000/api/youtube/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setHistory(history.filter((item) => item._id !== id));
      showToast("Mind map deleted successfully 🗑️", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to delete", "error");
    }
  };

  // Professional PDF Export using html2pdf.js with styled document layout
  const downloadPDF = (content, title = "PrepPulse_MindMap", id = "current") => {
    setExportingId(id);
    showToast("Generating beautiful PDF report... 📄", "success");

    const container = document.createElement("div");
    container.style.padding = "40px";
    container.style.backgroundColor = "#ffffff";
    container.style.color = "#0f172a";
    container.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
    container.style.width = "800px";

    container.innerHTML = `
      <div style="border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h1 style="color: #1e293b; font-size: 24px; margin: 0; font-weight: 900;">PrepPulse Study Report</h1>
          <p style="color: #2563eb; font-size: 12px; margin: 5px 0 0 0; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">AI-Powered Video Mind Map</p>
        </div>
        <div style="text-align: right; font-size: 12px; color: #64748b;">
          Generated on: ${new Date().toLocaleDateString()}
        </div>
      </div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px;">
        <pre style="white-space: pre-wrap; line-height: 1.8; color: #1e293b; font-size: 13px; font-family: 'Courier New', Courier, monospace; margin: 0;">${content}</pre>
      </div>
      <div style="margin-top: 40px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; paddingTop: 15px;">
        &copy; ${new Date().getFullYear()} PrepPulse AI Learning Platform. All rights reserved.
      </div>
    `;

    const opt = {
      margin:       10,
      filename:     `${title.replace(/[^a-zA-Z0-9]/g, "_")}_MindMap.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(container).set(opt).save().then(() => {
      setExportingId(null);
      showToast("PDF downloaded successfully! 📥", "success");
    }).catch((err) => {
      console.error(err);
      setExportingId(null);
      showToast("Failed to export PDF", "error");
    });
  };

  const renderFormattedMindMap = (rawText) => {
    if (!rawText) return null;

    return rawText.split("\n").map((line, index) => {
      const trimmed = line.trim();

      if (trimmed.startsWith("# ")) {
        return (
          <h1 key={index} style={{ fontSize: "1.7rem", fontWeight: "900", color: "#38bdf8", margin: "24px 0 14px 0", borderBottom: "2px solid rgba(56, 189, 248, 0.25)", paddingBottom: "10px", letterSpacing: "-0.5px" }}>
            {trimmed.replace("# ", "")}
          </h1>
        );
      }
      if (trimmed.startsWith("## ")) {
        return (
          <h2 key={index} style={{ fontSize: "1.3rem", fontWeight: "800", color: "#f8fafc", margin: "20px 0 10px 0", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ width: "8px", height: "8px", backgroundColor: "#38bdf8", borderRadius: "50%", display: "inline-block", boxShadow: "0 0 8px #38bdf8" }}></span>
            {trimmed.replace("## ", "")}
          </h2>
        );
      }
      if (trimmed.startsWith("### ")) {
        return (
          <h3 key={index} style={{ fontSize: "1.05rem", fontWeight: "750", color: "#93c5fd", margin: "14px 0 6px 0" }}>
            {trimmed.replace("### ", "")}
          </h3>
        );
      }
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        return (
          <div key={index} style={{ display: "flex", gap: "10px", margin: "6px 0", paddingLeft: "8px", lineHeight: "1.7", color: "#cbd5e1" }}>
            <span style={{ color: "#38bdf8", fontWeight: "bold", fontSize: "1rem" }}>•</span>
            <span style={{ flex: 1, fontSize: "0.95rem" }}>{trimmed.substring(2)}</span>
          </div>
        );
      }
      if (trimmed.startsWith("---")) {
        return <hr key={index} style={{ border: "none", height: "1px", backgroundColor: "rgba(56, 189, 248, 0.15)", margin: "16px 0" }} />;
      }
      if (trimmed.startsWith("```") || trimmed.includes("┌──") || trimmed.includes("└─") || trimmed.includes("├──")) {
        return (
          <div key={index} style={{ background: "rgba(15, 23, 42, 0.9)", padding: "12px 16px", borderRadius: "10px", fontFamily: "monospace", color: "#38bdf8", fontSize: "0.85rem", margin: "8px 0", overflowX: "auto" }}>
            {trimmed.replace(/```/g, "")}
          </div>
        );
      }
      if (!trimmed) {
        return <div key={index} style={{ height: "6px" }}></div>;
      }

      return (
        <p key={index} style={{ color: "#94a3b8", lineHeight: "1.7", fontSize: "0.95rem", margin: "6px 0" }}>
          {trimmed}
        </p>
      );
    });
  };

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        background: "radial-gradient(circle at top, #1e293b 0%, #0f172a 50%, #060d1f 100%)",
        color: "white",
        padding: "40px 20px",
        boxSizing: "border-box",
        overflowX: "hidden",
        margin: 0,
      }}
    >
      <style>
        {`
          * { box-sizing: border-box; }
          html, body { margin: 0; padding: 0; background-color: #060d1f; width: 100%; overflow-x: hidden; }
          .glass-card { background: rgba(30, 41, 59, 0.55); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 25px 50px rgba(0,0,0,0.6); border-radius: 24px; }
          .btn-primary { background: linear-gradient(135deg, #0062ff, #004fe5); color: white; border: none; padding: 15px 28px; border-radius: 14px; font-weight: bold; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 20px rgba(0, 98, 255, 0.4); }
          .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 25px rgba(0, 98, 255, 0.6); }
          .custom-input:focus { border-color: #38bdf8 !important; outline: none; box-shadow: 0 0 15px rgba(56, 189, 248, 0.3); }
        `}
      </style>

      {/* Toast Notification Popup */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            style={{
              position: "fixed", top: "20px", right: "20px", zIndex: 9999,
              background: toast.type === "success" ? "rgba(16, 185, 129, 0.9)" : "rgba(239, 68, 68, 0.9)",
              backdropFilter: "blur(12px)", color: "white", padding: "12px 22px",
              borderRadius: "14px", boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
              display: "flex", alignItems: "center", gap: "10px", fontWeight: "bold",
              border: "1px solid rgba(255,255,255,0.2)"
            }}
          >
            {toast.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div
            style={{
              width: "75px",
              height: "75px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(0, 98, 255, 0.15))",
              border: "1px solid rgba(56, 189, 248, 0.35)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              margin: "0 auto 20px",
              boxShadow: "0 0 25px rgba(56, 189, 248, 0.2)",
            }}
          >
            <Brain size={36} color="#38bdf8" />
          </div>

          <h1 style={{ fontSize: "2.6rem", fontWeight: "900", marginBottom: "10px", color: "#fff", letterSpacing: "-0.5px" }}>
            YouTube Mind Map Generator
          </h1>

          <p style={{ color: "#94a3b8", fontSize: "1.05rem", margin: 0 }}>
            Convert YouTube videos into stunning AI-powered study mind maps instantly with <span style={{ color: "#38bdf8", fontWeight: "600" }}>PrepPulse AI</span>.
          </p>
        </div>

        {/* Input Section */}
        <div className="glass-card" style={{ padding: "35px", marginBottom: "35px" }}>
          
          <div style={{ position: "relative", marginBottom: "20px" }}>
            <Video size={20} color="#38bdf8" style={{ position: "absolute", left: "18px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Paste YouTube Video URL (e.g., https://youtube.com/...)"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              className="custom-input"
              style={{
                width: "100%",
                padding: "16px 20px 16px 52px",
                borderRadius: "14px",
                border: "1px solid #334155",
                background: "rgba(15, 23, 42, 0.75)",
                color: "white",
                fontSize: "1rem",
                transition: "all 0.3s",
              }}
            />
          </div>

          <div style={{ position: "relative", marginBottom: "25px" }}>
            <textarea
              placeholder="Custom Prompt (Optional) Example: Create detailed notes, interview questions, summarize in Telugu..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={3}
              className="custom-input"
              style={{
                width: "100%",
                padding: "16px 20px",
                borderRadius: "14px",
                border: "1px solid #334155",
                background: "rgba(15, 23, 42, 0.75)",
                color: "white",
                fontSize: "0.95rem",
                resize: "none",
                transition: "all 0.3s",
              }}
            />
          </div>

          <button
            onClick={generateMindMap}
            disabled={loading}
            className="btn-primary"
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              fontSize: "1.05rem",
            }}
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Synthesizing Mind Map with AI...
              </>
            ) : (
              <>
                <Sparkles size={20} /> Generate Mind Map
              </>
            )}
          </button>
        </div>

        {/* Result Section */}
        <AnimatePresence>
          {mindMap && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="glass-card"
              style={{ padding: "35px", marginBottom: "40px", boxShadow: "0 30px 60px rgba(0,0,0,0.7)" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "25px",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                  paddingBottom: "15px",
                }}
              >
                <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "800", color: "#fff", display: "flex", alignItems: "center", gap: "10px" }}>
                  <Brain size={24} color="#38bdf8" /> Generated Mind Map
                </h2>

                <button
                  onClick={() => downloadPDF(mindMap, "Generated_MindMap", "current")}
                  disabled={exportingId === "current"}
                  style={{
                    background: "rgba(56, 189, 248, 0.12)",
                    border: "1px solid rgba(56, 189, 248, 0.35)",
                    padding: "10px 18px",
                    borderRadius: "12px",
                    color: "#38bdf8",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontWeight: "700",
                    fontSize: "0.9rem",
                    transition: "0.2s",
                  }}
                >
                  {exportingId === "current" ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                  Export PDF
                </button>
              </div>

              <div
                style={{
                  background: "rgba(11, 18, 33, 0.85)",
                  padding: "30px",
                  borderRadius: "16px",
                  border: "1px solid rgba(56, 189, 248, 0.12)",
                  boxShadow: "inset 0 4px 15px rgba(0,0,0,0.4)",
                }}
              >
                {renderFormattedMindMap(mindMap)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* History Section */}
        <h2 style={{ marginBottom: "25px", display: "flex", alignItems: "center", gap: "10px", fontSize: "1.6rem", fontWeight: "800" }}>
          <Clock3 size={24} color="#38bdf8" /> Saved Mind Maps
        </h2>

        {history.length === 0 ? (
          <div className="glass-card" style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
            <p style={{ margin: 0, fontSize: "1rem" }}>No Saved Mind Maps Found</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "25px" }}>
            {history.map((item) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card"
                style={{ padding: "30px" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                  <a
                    href={item.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: "#38bdf8",
                      textDecoration: "none",
                      fontWeight: "600",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "0.95rem",
                      wordBreak: "break-all"
                    }}
                  >
                    <Video size={18} /> {item.videoUrl} <ExternalLink size={14} />
                  </a>
                </div>

                <div
                  style={{
                    background: "rgba(15, 23, 42, 0.6)",
                    padding: "25px",
                    borderRadius: "16px",
                    border: "1px solid rgba(255,255,255,0.04)",
                    marginBottom: "20px",
                  }}
                >
                  {renderFormattedMindMap(item.mindMap)}
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                  }}
                >
                  <button
                    onClick={() => downloadPDF(item.mindMap, `YouTube_MindMap_${item._id}`, item._id)}
                    disabled={exportingId === item._id}
                    style={{
                      background: "rgba(56, 189, 248, 0.1)",
                      border: "1px solid rgba(56, 189, 248, 0.3)",
                      padding: "10px 16px",
                      borderRadius: "10px",
                      color: "#38bdf8",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontWeight: "600",
                      fontSize: "0.85rem",
                    }}
                  >
                    {exportingId === item._id ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} 
                    Download PDF
                  </button>

                  <button
                    onClick={() => deleteMindMap(item._id)}
                    style={{
                      background: "rgba(239, 68, 68, 0.1)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      padding: "10px 16px",
                      borderRadius: "10px",
                      color: "#ef4444",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontWeight: "600",
                      fontSize: "0.85rem",
                    }}
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MindMapGenerator;