import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiBookOpen, FiStar, FiSave, FiCheckCircle, FiAlertCircle, FiRefreshCw, FiCopy, FiCheck, FiFileText, FiTrash2, FiChevronLeft, FiChevronRight, FiPlus, FiClock } from "react-icons/fi";
import API from "../../services/api";

function NotesGenerator() {
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedNotesHistory, setSavedNotesHistory] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const timeoutRef = useRef(null);

  const showToast = (message, type = "success") => {
    clearTimeout(timeoutRef.current);
    setToast({ show: true, message, type });
    timeoutRef.current = setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3500);
  };

  useEffect(() => {
    fetchSavedNotesHistory();
  }, []);

  const fetchSavedNotesHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const { data } = await API.get("/notes", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSavedNotesHistory(data.notes || []);
    } catch (error) {
      console.error("Failed to fetch history notes:", error);
    }
  };

  const handleNewNote = () => {
    setTopic("");
    setNotes("");
  };

  const generateNotes = async () => {
    if (!topic.trim()) {
      showToast("Please enter a study topic first!", "error");
      return;
    }

    try {
      setLoading(true);
      const { data } = await API.post("/notes/generate", { topic });
      setNotes(data.notes);
      showToast("AI Study Notes generated successfully! 🚀", "success");
    } catch (error) {
      console.error(error);
      showToast("Failed to generate notes. Please try again ❌", "error");
    } finally {
      setLoading(false);
    }
  };

  const saveNotes = async () => {
    try {
      const token = localStorage.getItem("token");
      await API.post(
        "/notes/save",
        { title: topic, content: notes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast("Notes saved to your library successfully! 💾", "success");
      fetchSavedNotesHistory();
    } catch (error) {
      console.error(error);
      showToast("Failed to save notes ❌", "error");
    }
  };

  const deleteNote = async (id, e) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem("token");
      await API.delete(`/notes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSavedNotesHistory(savedNotesHistory.filter((note) => note._id !== id));
      showToast("Note deleted successfully 🗑️", "success");
    } catch (error) {
      console.error(error);
      showToast("Failed to delete note ❌", "error");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(notes);
    setCopied(true);
    showToast("Notes copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const renderFormattedNotes = (rawNotes) => {
    if (!rawNotes) return null;
    return rawNotes.split("\n").map((line, index) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("# ")) {
        return (
          <h1 key={index} style={{ fontSize: "1.5rem", fontWeight: "900", color: "#38bdf8", margin: "20px 0 10px 0", borderBottom: "1px solid rgba(56, 189, 248, 0.2)", paddingBottom: "8px", letterSpacing: "-0.5px" }}>
            {trimmed.replace("# ", "")}
          </h1>
        );
      }
      if (trimmed.startsWith("## ")) {
        return (
          <h2 key={index} style={{ fontSize: "1.2rem", fontWeight: "800", color: "#f8fafc", margin: "16px 0 8px 0", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ width: "8px", height: "8px", backgroundColor: "#38bdf8", borderRadius: "50%", display: "inline-block" }}></span>
            {trimmed.replace("## ", "")}
          </h2>
        );
      }
      if (trimmed.startsWith("### ")) {
        return (
          <h3 key={index} style={{ fontSize: "1rem", fontWeight: "750", color: "#93c5fd", margin: "14px 0 6px 0" }}>
            {trimmed.replace("### ", "")}
          </h3>
        );
      }
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        return (
          <div key={index} style={{ display: "flex", gap: "10px", margin: "6px 0", paddingLeft: "6px", lineHeight: "1.6", color: "#cbd5e1" }}>
            <span style={{ color: "#38bdf8", fontWeight: "bold" }}>•</span>
            <span style={{ flex: 1, fontSize: "0.95rem" }}>{trimmed.substring(2)}</span>
          </div>
        );
      }
      if (trimmed.startsWith("---")) {
        return <hr key={index} style={{ border: "none", height: "1px", backgroundColor: "rgba(56, 189, 248, 0.15)", margin: "16px 0" }} />;
      }
      if (!trimmed) {
        return <div key={index} style={{ height: "6px" }}></div>;
      }
      return (
        <p key={index} style={{ color: "#94a3b8", lineHeight: "1.6", fontSize: "0.95rem", margin: "6px 0" }}>
          {trimmed}
        </p>
      );
    });
  };

  return (
    <div style={{ 
      width: "100vw", 
      minHeight: "100vh", 
      background: "radial-gradient(circle at top, #1e293b 0%, #0f172a 50%, #060d1f 100%)", 
      color: "white", 
      boxSizing: "border-box",
      overflowX: "hidden",
      margin: 0,
      display: "flex",
      position: "relative"
    }}>
      <style>
        {`
          * { box-sizing: border-box; }
          html, body { margin: 0; padding: 0; background-color: #060d1f; width: 100%; overflow-x: hidden; }
          .glass-card { background: rgba(30, 41, 59, 0.55); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 25px 50px rgba(0,0,0,0.6); border-radius: 20px; }
          .sidebar-card { background: rgba(8, 12, 22, 0.95); backdrop-filter: blur(24px); border-right: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 10px 0 30px rgba(0,0,0,0.5); }
          .btn-primary { background: linear-gradient(135deg, #0062ff, #004fe5); color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: bold; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 15px rgba(0, 98, 255, 0.4); }
          .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0, 98, 255, 0.6); }
          .btn-success { background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: bold; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4); }
          .btn-success:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(16, 185, 129, 0.6); }
          .new-chat-btn { background: linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(0, 98, 255, 0.15)); border: 1px solid rgba(56, 189, 248, 0.35); color: #38bdf8; padding: 12px; border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: 0.2s; box-shadow: 0 4px 15px rgba(56, 189, 248, 0.15); }
          .new-chat-btn:hover { background: linear-gradient(135deg, rgba(56, 189, 248, 0.25), rgba(0, 98, 255, 0.25)); transform: translateY(-1px); }
          .custom-input:focus { border-color: #38bdf8 !important; outline: none; box-shadow: 0 0 12px rgba(56, 189, 248, 0.3); }
          .history-item { transition: all 0.25s ease; }
          .history-item:hover { background: rgba(56, 189, 248, 0.15); border-color: rgba(56, 189, 248, 0.4); transform: translateX(3px); }
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
              backdropFilter: "blur(12px)", color: "white", padding: "10px 20px",
              borderRadius: "12px", boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
              display: "flex", alignItems: "center", gap: "10px", fontWeight: "bold", fontSize: "0.9rem",
              border: "1px solid rgba(255,255,255,0.2)"
            }}
          >
            {toast.type === "success" ? <FiCheckCircle size={18} /> : <FiAlertCircle size={18} />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sleek, Compact ChatGPT-style Sidebar */}
      <motion.div
        animate={{ width: sidebarOpen ? "280px" : "0px", opacity: sidebarOpen ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        style={{
          height: "100vh",
          position: "sticky",
          top: 0,
          overflow: "hidden",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          flexShrink: 0
        }}
        className="sidebar-card"
      >
        <div style={{ width: "280px", padding: "20px 16px", display: "flex", flexDirection: "column", height: "100%", boxSizing: "border-box" }}>
          
          <button onClick={handleNewNote} className="new-chat-btn" style={{ marginBottom: "20px" }}>
            <FiPlus size={16} /> New Note Session
          </button>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <span style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "1px", color: "#94a3b8", fontWeight: "800", display: "flex", alignItems: "center", gap: "5px" }}>
              <FiClock size={12} color="#38bdf8" /> History ({savedNotesHistory.length})
            </span>
          </div>

          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px", paddingRight: "2px" }}>
            {savedNotesHistory.length === 0 ? (
              <p style={{ color: "#64748b", fontSize: "0.8rem", textAlign: "center", marginTop: "30px" }}>No history yet.</p>
            ) : (
              savedNotesHistory.map((item) => (
                <div
                  key={item._id}
                  onClick={() => {
                    setTopic(item.title);
                    setNotes(item.content);
                  }}
                  className="history-item"
                  style={{
                    padding: "10px 12px",
                    borderRadius: "10px",
                    border: "1px solid rgba(255, 255, 255, 0.04)",
                    background: topic === item.title ? "rgba(56, 189, 248, 0.18)" : "rgba(30, 41, 59, 0.3)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", overflow: "hidden" }}>
                    <FiFileText size={14} color="#38bdf8" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: "0.82rem", color: topic === item.title ? "#fff" : "#cbd5e1", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontWeight: topic === item.title ? "700" : "400" }}>
                      {item.title}
                    </span>
                  </div>
                  <button
                    onClick={(e) => deleteNote(item._id, e)}
                    style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: "4px", opacity: 0.7 }}
                    title="Delete Note"
                  >
                    <FiTrash2 size={13} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </motion.div>

      {/* Floating Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          position: "fixed",
          top: "20px",
          left: sidebarOpen ? "264px" : "16px",
          zIndex: 99,
          background: "linear-gradient(135deg, #1e293b, #0f172a)",
          border: "1px solid rgba(56, 189, 248, 0.3)",
          color: "#38bdf8",
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
          transition: "left 0.3s ease-in-out"
        }}
      >
        {sidebarOpen ? <FiChevronLeft size={16} /> : <FiChevronRight size={16} />}
      </button>

      {/* Main Content Area */}
      <div style={{ flex: 1, padding: "30px 25px", maxWidth: "850px", margin: "0 auto", boxSizing: "border-box" }}>
        
        {/* Header Section */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <div style={{ 
            width: "55px", height: "55px", margin: "0 auto 12px auto", 
            background: "linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(0, 98, 255, 0.15))", 
            border: "1px solid rgba(56, 189, 248, 0.35)", 
            borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 20px rgba(56, 189, 248, 0.2)"
          }}>
            <FiBookOpen size={24} color="#38bdf8" />
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: "900", margin: "0 0 6px 0", color: "#fff", letterSpacing: "-0.5px" }}>
            AI Study Notes Generator
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "0.92rem", margin: 0 }}>
            Instantly turn concepts into sleek, easy-to-learn notes with <span style={{ color: "#38bdf8", fontWeight: "600" }}>PrepPulse AI</span>.
          </p>
        </div>

        {/* Input Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card"
          style={{ padding: "25px", marginBottom: "25px" }}
        >
          <div style={{ position: "relative", marginBottom: "16px" }}>
            <input
              type="text"
              placeholder="Enter Topic (e.g., Object Oriented Programming, Exception Handling)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="custom-input"
              style={{
                width: "100%", padding: "14px 18px", borderRadius: "12px",
                border: "1px solid #334155", background: "rgba(15, 23, 42, 0.75)",
                color: "white", fontSize: "0.98rem", transition: "all 0.3s"
              }}
            />
          </div>

          <button
            onClick={generateNotes}
            disabled={loading}
            className="btn-primary"
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", fontSize: "0.98rem" }}
          >
            {loading ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                  <FiRefreshCw size={18} />
                </motion.div>
                Synthesizing Notes...
              </>
            ) : (
              <>
                <FiStar size={18} /> Generate Notes
              </>
            )}
          </button>
        </motion.div>

        {/* Output Section */}
        <AnimatePresence>
          {notes && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="glass-card"
              style={{ padding: "30px", boxShadow: "0 20px 40px rgba(0,0,0,0.6)" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "15px" }}>
                <h2 style={{ margin: 0, fontSize: "1.3rem", fontWeight: "900", color: "#fff", display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ background: "rgba(56, 189, 248, 0.15)", padding: "6px", borderRadius: "10px", display: "flex" }}>
                    <FiStar color="#38bdf8" size={18} />
                  </div>
                  Generated Study Notes
                </h2>
                <button
                  onClick={copyToClipboard}
                  style={{
                    background: "rgba(56, 189, 248, 0.12)", border: "1px solid rgba(56, 189, 248, 0.35)",
                    color: "#38bdf8", padding: "8px 14px", borderRadius: "10px", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", fontWeight: "700", transition: "0.2s"
                  }}
                >
                  {copied ? <FiCheck size={14} /> : <FiCopy size={14} />} {copied ? "Copied!" : "Copy"}
                </button>
              </div>

              {/* Reader Friendly Compact Content Card */}
              <div style={{ 
                background: "rgba(11, 18, 33, 0.85)", padding: "25px", borderRadius: "16px",
                border: "1px solid rgba(56, 189, 248, 0.12)", marginBottom: "25px",
                boxShadow: "inset 0 4px 15px rgba(0,0,0,0.4)"
              }}>
                {renderFormattedNotes(notes)}
              </div>

              <button
                onClick={saveNotes}
                className="btn-success"
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", fontSize: "0.98rem" }}
              >
                <FiSave size={18} /> Save Notes to Library
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

export default NotesGenerator;