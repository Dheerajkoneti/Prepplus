import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiBookmark, FiDownload, FiTrash2, FiSearch, FiCheckCircle, FiAlertCircle, FiRefreshCw, FiBookOpen, FiFileText, FiEye, FiX } from "react-icons/fi";
import API from "../../services/api";

function SavedNotes() {
  const [notesList, setNotesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNote, setSelectedNote] = useState(null); // Modal view state

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3500);
  };

  useEffect(() => {
    fetchSavedNotes();
  }, []);

  const fetchSavedNotes = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");
      console.log("Token:", token);

      if (!token) {
        showToast("Please login first", "error");
        setLoading(false);
        return;
      }

      const response = await API.get("/notes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(response.data);

      setNotesList(response.data.notes || []);
    } catch (error) {
      console.error("Fetch Notes Error:", error.response?.data);

      showToast(
        error.response?.data?.message || "Failed to load notes",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (id, e) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem("token");
      await API.delete(`/notes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotesList(notesList.filter((note) => note._id !== id));
      if (selectedNote && selectedNote._id === id) {
        setSelectedNote(null);
      }
      showToast("Note deleted successfully 🗑️", "success");
    } catch (error) {
      console.error(error);
      showToast("Failed to delete note ❌", "error");
    }
  };

  const downloadPDF = (note, e) => {
    e.stopPropagation();
    const element = document.createElement("a");
    const file = new Blob([`# ${note.title}\n\n${note.content}`], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${note.title.replace(/\s+/g, "_")}_Notes.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showToast("Note downloaded successfully! 📥", "success");
  };

  const filteredNotes = notesList.filter((note) =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ 
      width: "100vw", 
      minHeight: "100vh", 
      background: "radial-gradient(circle at top, #1e293b 0%, #0f172a 45%, #08142d 100%)", 
      padding: "40px 20px", 
      color: "white", 
      boxSizing: "border-box",
      overflowX: "hidden",
      margin: 0
    }}>
      <style>
        {`
          * { box-sizing: border-box; }
          html, body { margin: 0; padding: 0; background-color: #08142d; width: 100%; overflow-x: hidden; }
          .glass-card { background: rgba(30, 41, 59, 0.65); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 20px 40px rgba(0,0,0,0.5); border-radius: 24px; transition: transform 0.2s, box-shadow 0.2s; }
          .glass-card:hover { transform: translateY(-4px); box-shadow: 0 25px 50px rgba(0,0,0,0.6); border-color: rgba(56, 189, 248, 0.2); }
          .custom-input:focus { border-color: #38bdf8 !important; outline: none; box-shadow: 0 0 12px rgba(56, 189, 248, 0.25); }
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
            {toast.type === "success" ? <FiCheckCircle size={20} /> : <FiAlertCircle size={20} />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal View for Note Content */}
      <AnimatePresence>
        {selectedNote && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
              background: "rgba(8, 20, 45, 0.85)", backdropFilter: "blur(8px)",
              zIndex: 9998, display: "flex", justifyContent: "center", alignItems: "center", padding: "20px"
            }}
            onClick={() => setSelectedNote(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card"
              style={{ width: "100%", maxWidth: "800px", maxHeight: "85vh", display: "flex", flexDirection: "column", padding: "30px", background: "#1e293b" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "15px" }}>
                <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "800", color: "#fff", display: "flex", alignItems: "center", gap: "10px" }}>
                  <FiBookOpen color="#38bdf8" size={24} /> {selectedNote.title}
                </h2>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <button
                    onClick={(e) => downloadPDF(selectedNote, e)}
                    style={{
                      background: "rgba(56, 189, 248, 0.1)", border: "1px solid rgba(56, 189, 248, 0.3)",
                      color: "#38bdf8", padding: "8px 14px", borderRadius: "10px", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", fontWeight: "600"
                    }}
                  >
                    <FiDownload size={16} /> Download
                  </button>
                  <button
                    onClick={() => setSelectedNote(null)}
                    style={{
                      background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "#fff", padding: "8px", borderRadius: "10px", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center"
                    }}
                  >
                    <FiX size={18} />
                  </button>
                </div>
              </div>

              <div style={{ 
                background: "rgba(15, 23, 42, 0.6)", padding: "20px", borderRadius: "16px",
                border: "1px solid rgba(255,255,255,0.04)", overflowY: "auto", flex: 1 
              }}>
                <pre style={{
                  whiteSpace: "pre-wrap", wordBreak: "break-word",
                  color: "#f8fafc", lineHeight: "1.8", fontSize: "0.95rem",
                  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", margin: 0
                }}>
                  {selectedNote.content}
                </pre>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ maxWidth: "1200px", margin: "auto" }}>
        
        {/* Header Section */}
        <div style={{ textAlign: "center", marginBottom: "35px" }}>
          <div style={{ 
            width: "65px", height: "65px", margin: "0 auto 15px auto", 
            background: "rgba(56, 189, 248, 0.1)", border: "1px solid rgba(56, 189, 248, 0.3)", 
            borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" 
          }}>
            <FiBookmark size={28} color="#38bdf8" />
          </div>
          <h1 style={{ fontSize: "2.4rem", fontWeight: "900", margin: "0 0 8px 0", color: "#fff" }}>
            Saved Study Notes
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "1rem", margin: 0 }}>
            Access, manage, and download all your AI-generated study library notes in one place.
          </p>
        </div>

        {/* Search Bar */}
        <div style={{ position: "relative", marginBottom: "40px", maxWidth: "500px", margin: "0 auto 40px auto" }}>
          <FiSearch size={18} color="#94a3b8" style={{ position: "absolute", left: "18px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search your saved notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="custom-input"
            style={{
              width: "100%", padding: "14px 18px 14px 48px", borderRadius: "14px",
              border: "1px solid #334155", background: "rgba(30, 41, 59, 0.65)",
              color: "white", fontSize: "0.95rem", transition: "all 0.3s"
            }}
          />
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "50px", color: "#94a3b8" }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} style={{ display: "inline-block", marginBottom: "10px" }}>
              <FiRefreshCw size={28} color="#38bdf8" />
            </motion.div>
            <p>Loading your saved notes...</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="glass-card" style={{ textAlign: "center", padding: "50px", color: "#94a3b8" }}>
            <FiBookOpen size={40} color="#38bdf8" style={{ marginBottom: "15px", opacity: 0.7 }} />
            <h3 style={{ color: "#fff", margin: "0 0 8px 0" }}>No saved notes found</h3>
            <p style={{ margin: 0, fontSize: "0.95rem" }}>Generate and save notes from the AI Notes Generator to view them here.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "25px" }}>
            {filteredNotes.map((note) => (
              <motion.div 
                key={note._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card"
                onClick={() => setSelectedNote(note)}
                style={{ 
                  padding: "25px", cursor: "pointer", display: "flex", flexDirection: "column", 
                  justifyContent: "space-between", minHeight: "240px", position: "relative", overflow: "hidden" 
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px" }}>
                    <div style={{ width: "40px", height: "40px", background: "rgba(56, 189, 248, 0.1)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <FiFileText size={20} color="#38bdf8" />
                    </div>
                    <span style={{ fontSize: "0.75px", color: "#64748b", background: "rgba(255,255,255,0.05)", padding: "4px 8px", borderRadius: "6px" }}>
                      Study Note
                    </span>
                  </div>

                  <h3 style={{ margin: "0 0 10px 0", fontSize: "1.15rem", fontWeight: "700", color: "#fff", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {note.title}
                  </h3>

                  <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.85rem", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: "1.5" }}>
                    {note.content}
                  </p>
                </div>

                {/* Bottom Card Footer Actions */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", paddingTop: "15px", borderTop: "1px solid rgba(255,255,255,0.08)" }} onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setSelectedNote(note)}
                    style={{
                      background: "none", border: "none", color: "#38bdf8", padding: 0, cursor: "pointer",
                      display: "flex", alignItems: "center", gap: "5px", fontSize: "0.85rem", fontWeight: "600"
                    }}
                  >
                    <FiEye size={15} /> View Notes
                  </button>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={(e) => downloadPDF(note, e)}
                      title="Download Notes"
                      style={{
                        background: "rgba(56, 189, 248, 0.1)", border: "1px solid rgba(56, 189, 248, 0.3)",
                        color: "#38bdf8", padding: "8px", borderRadius: "10px", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center"
                      }}
                    >
                      <FiDownload size={15} />
                    </button>
                    <button
                      onClick={(e) => deleteNote(note._id, e)}
                      title="Delete Note"
                      style={{
                        background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)",
                        color: "#ef4444", padding: "8px", borderRadius: "10px", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center"
                      }}
                    >
                      <FiTrash2 size={15} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default SavedNotes;