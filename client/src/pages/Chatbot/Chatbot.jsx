import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiSend, FiPlus, FiTrash2, FiBookmark, FiHeart, FiCheckCircle, 
  FiAlertCircle, FiCpu, FiUser, FiEdit2, FiCheck, FiCopy, FiCode, FiPaperclip, FiFileText
} from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

function Chatbot() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [chats, setChats] = useState([]);
  const [pinnedMessages, setPinnedMessages] = useState([]);

  // File upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  // State for renaming chats locally
  const [editingChatId, setEditingChatId] = useState(null);
  const [newTitle, setNewTitle] = useState("");

  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "👋 Welcome to PrepPulse AI! Ask me anything, or upload images and PDFs for instant AI analysis.",
    },
  ]);

  // Toast notification state with useRef cleanup
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const timeoutRef = useRef(null);

  const showToast = (message, type = "success") => {
    clearTimeout(timeoutRef.current);
    setToast({ show: true, message, type });
    timeoutRef.current = setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3500);
  };

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      fetchChats();
    }
  }, []);

  const fetchChats = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return;
      const res = await axios.get(`http://localhost:5000/api/chat/user/${userId}`);
      setChats(res.data.chats);
    } catch (err) {
      console.log(err);
    }
  };

  const typeOutResponse = (fullText) => {
    let currentText = "";
    setMessages((prev) => [...prev, { sender: "ai", text: "" }]);
    
    let i = 0;
    const interval = setInterval(() => {
      if (i < fullText.length) {
        currentText += fullText.charAt(i);
        setMessages((prev) => {
          const updated = [...prev];
          if (updated.length > 0) {
            updated[updated.length - 1].text = currentText;
          }
          return updated;
        });
        i++;
      } else {
        clearInterval(interval);
        setLoading(false);
        showToast("AI analyzed file & responded successfully! 🤖✨", "success");
      }
    }, 15);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      showToast(`Attached: ${file.name} 📎`, "success");
    }
  };

  const handleSend = async (textToSend = null) => {
    const textQuery = textToSend || message;
    if (!textQuery.trim() && !selectedFile) return;

    let displayMessage = textQuery;
    if (selectedFile) {
      displayMessage = `📁 [Uploaded File: ${selectedFile.name}]\n${textQuery}`;
    }

    setMessages((prev) => [...prev, { sender: "user", text: displayMessage }]);
    setMessage("");
    const currentFile = selectedFile;
    setSelectedFile(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("message", textQuery || "Analyze this file");
      formData.append("userId", localStorage.getItem("userId") || "");
      if (chatId) formData.append("chatId", chatId);
      if (currentFile) formData.append("file", currentFile);

      const res = await axios.post("http://localhost:5000/api/chat", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setChatId(res.data.chatId);
      fetchChats();
      typeOutResponse(res.data.response);
    } catch (error) {
      console.error(error);
      setLoading(false);
      showToast("Failed to connect to AI server ❌", "error");
    }
  };

  const loadChat = async (id) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/chat/${id}`);
      const converted = res.data.chat.messages.map((msg) => ({
        sender: msg.role === "user" ? "user" : "ai",
        text: msg.content,
      }));
      setMessages(converted);
      setChatId(id);
    } catch (err) {
      console.log(err);
    }
  };

  const deleteChat = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/chat/${id}`);
      fetchChats();
      showToast("Chat deleted successfully 🗑️", "success");
    } catch (err) {
      console.log(err);
      showToast("Failed to delete chat ❌", "error");
    }
  };

  const handleRenameChat = async (id) => {
    if (!newTitle.trim()) return;
    
    try {
      await axios.put(`http://localhost:5000/api/chat/${id}`, { title: newTitle });
      setEditingChatId(null);
      setNewTitle("");
      fetchChats();
      showToast("Chat renamed successfully! ✏️", "success");
    } catch (err) {
      console.log(err);
      showToast("Failed to rename chat ❌", "error");
    }
  };

  const handleNewChat = () => {
    setChatId(null);
    setPinnedMessages([]);
    setMessages([
      {
        sender: "ai",
        text: "👋 New Chat Started. How can I help you today?",
      },
    ]);
  };

  const togglePin = async (targetChatId, currentIsPinned) => {
    const nextPinnedState = !currentIsPinned;

    setChats((prev) =>
      prev.map((chat) =>
        chat._id === targetChatId ? { ...chat, isPinned: nextPinnedState } : chat
      )
    );

    showToast(nextPinnedState ? "Chat pinned successfully! 📌" : "Chat unpinned 📌", "success");

    try {
      await axios.put(`http://localhost:5000/api/chat/${targetChatId}/pin`, {
        isPinned: nextPinnedState,
      });
      fetchChats();
    } catch (error) {
      console.log(error);
      fetchChats();
    }
  };

  const togglePinMessage = (text) => {
    if (pinnedMessages.includes(text)) {
      setPinnedMessages(pinnedMessages.filter((m) => m !== text));
      showToast("Message unpinned 📌", "success");
    } else {
      setPinnedMessages([...pinnedMessages, text]);
      showToast("Message pinned successfully! 📌", "success");
    }
  };

  const pinnedChats = chats.filter((chat) => chat.isPinned);
  const recentChats = chats.filter((chat) => !chat.isPinned);
  const currentChat = chats.find((c) => c._id === chatId);

  const isInitialState = messages.length === 1;

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", background: "#020617", color: "white", overflow: "hidden", fontFamily: "system-ui, sans-serif", boxSizing: "border-box" }}>
      <style>
        {`
          html, body { margin: 0; padding: 0; overflow: hidden; background-color: #020617; }
          .chat-input:focus { border-color: #38bdf8 !important; outline: none; }
          .sidebar-chat:hover { background: rgba(56, 189, 248, 0.1) !important; border-color: rgba(56, 189, 248, 0.3) !important; }
          .prompt-chip:hover { border-color: #38bdf8 !important; background: rgba(56, 189, 248, 0.12) !important; transform: translateY(-2px); }
          ::-webkit-scrollbar { width: 6px; }
          ::-webkit-scrollbar-thumb { background: rgba(56, 189, 248, 0.2); border-radius: 10px; }
        `}
      </style>

      {/* Toast Notification Popup */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.9 }}
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

      {/* Sidebar */}
      <div style={{ width: "310px", background: "#0f172a", borderRight: "1px solid #1e293b", padding: "20px", display: "flex", flexDirection: "column", height: "100vh", boxSizing: "border-box", overflowY: "auto" }}>
        <h2 style={{ color: "#38bdf8", marginBottom: "20px", fontSize: "1.5rem", fontWeight: "900", display: "flex", alignItems: "center", gap: "8px" }}>
          🚀 PrepPulse AI
        </h2>

        <button
          onClick={handleNewChat}
          style={{
            width: "100%", padding: "12px", borderRadius: "12px", border: "none",
            background: "linear-gradient(135deg, #2563eb, #38bdf8)", color: "white",
            fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center",
            justifyContent: "center", gap: "8px", boxShadow: "0 4px 15px rgba(56, 189, 248, 0.3)"
          }}
        >
          <FiPlus size={18} /> New Chat
        </button>

        {/* Pinned Chats Section */}
        {pinnedChats.length > 0 && (
          <div style={{ marginTop: "20px" }}>
            <h4 style={{ color: "#38bdf8", fontSize: "0.75rem", letterSpacing: "1.2px", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
              📌 PINNED CHATS
            </h4>

            {pinnedChats.map((chat) => (
              <div
                key={chat._id}
                onClick={() => loadChat(chat._id)}
                style={{
                  background: "rgba(56, 189, 248, 0.08)", padding: "10px 12px", marginTop: "6px", borderRadius: "10px",
                  cursor: "pointer", border: "1px solid rgba(56, 189, 248, 0.25)", display: "flex",
                  justifyContent: "space-between", alignItems: "center"
                }}
              >
                <span
                  style={{ fontSize: "0.85rem", color: "#f8fafc", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "185px" }}
                >
                  📌 {chat.title}
                </span>

                <button
                  onClick={(e) => { e.stopPropagation(); togglePin(chat._id, chat.isPinned); }}
                  style={{ background: "transparent", border: "none", color: "#38bdf8", cursor: "pointer", padding: "4px" }}
                  title="Unpin Chat"
                >
                  📌
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Recent Chats Section */}
        <div style={{ marginTop: "20px", flex: 1 }}>
          <h4 style={{ color: "#94a3b8", fontSize: "0.75rem", letterSpacing: "1.2px", marginBottom: "10px" }}>🕒 RECENT CHATS</h4>

          {recentChats.map((chat) => {
            const isEditing = editingChatId === chat._id;
            return (
              <div
                key={chat._id}
                className="sidebar-chat"
                onClick={() => !isEditing && loadChat(chat._id)}
                style={{
                  background: "#1e293b", padding: "10px 12px", marginTop: "8px", borderRadius: "12px",
                  cursor: "pointer", border: "1px solid rgba(255,255,255,0.05)", display: "flex",
                  justifyContent: "space-between", alignItems: "center", transition: "0.2s"
                }}
              >
                {isEditing ? (
                  <div style={{ display: "flex", gap: "6px", flex: 1, alignItems: "center" }} onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      style={{ flex: 1, background: "#0f172a", border: "1px solid #38bdf8", color: "white", padding: "4px 8px", borderRadius: "6px", fontSize: "0.85rem" }}
                      autoFocus
                    />
                    <button onClick={() => handleRenameChat(chat._id)} style={{ background: "#10b981", border: "none", color: "white", padding: "4px 6px", borderRadius: "6px", cursor: "pointer" }}>
                      <FiCheck size={12} />
                    </button>
                  </div>
                ) : (
                  <>
                    <span
                      style={{ fontSize: "0.9rem", color: "#f8fafc", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "130px" }}
                    >
                      {chat.title}
                    </span>

                    <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingChatId(chat._id); setNewTitle(chat.title); }}
                        style={{ border: "none", background: "transparent", color: "#94a3b8", padding: "4px", borderRadius: "4px", cursor: "pointer", display: "flex", alignItems: "center" }}
                        title="Rename Chat"
                      >
                        <FiEdit2 size={13} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); togglePin(chat._id, chat.isPinned); }}
                        style={{ border: "none", background: "transparent", color: "#94a3b8", padding: "4px", borderRadius: "4px", cursor: "pointer", display: "flex", alignItems: "center" }}
                        title="Pin Chat"
                      >
                        📌
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteChat(chat._id); }}
                        style={{ border: "none", background: "rgba(239, 68, 68, 0.15)", color: "#ef4444", padding: "4px", borderRadius: "4px", cursor: "pointer", display: "flex", alignItems: "center" }}
                        title="Delete Chat"
                      >
                        <FiTrash2 size={13} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", background: "#020617", position: "relative" }}>
        
        {/* Top Header */}
        <div style={{ padding: "18px 30px", background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(12px)", borderBottom: "1px solid #1e293b", fontSize: "1.1rem", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <FiCpu color="#38bdf8" size={22} /> PrepPulse AI Assistant
          </div>

          {chatId && (
            <button
              onClick={() => togglePin(chatId, currentChat?.isPinned || false)}
              style={{
                background: currentChat?.isPinned ? "rgba(56, 189, 248, 0.2)" : "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(56, 189, 248, 0.4)", color: "#38bdf8",
                padding: "6px 14px", borderRadius: "10px", fontSize: "0.85rem", fontWeight: "bold",
                cursor: "pointer", display: "flex", alignItems: "center", gap: "6px"
              }}
            >
              {currentChat?.isPinned ? "📌 Unpin Chat" : "📌 Pin Chat"}
            </button>
          )}
        </div>

        {/* Chat Messages / Empty State */}
        <div style={{ flex: 1, overflowY: "auto", padding: "30px 30px 140px 30px", boxSizing: "border-box" }}>
          
          {isInitialState ? (
            <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", maxWidth: "650px", margin: "0 auto" }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <h1 style={{ fontSize: "2.2rem", fontWeight: "800", background: "linear-gradient(135deg, #ffffff 30%, #38bdf8 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "12px" }}>
                  How can I help you today?
                </h1>
                <p style={{ color: "#94a3b8", fontSize: "1rem", marginBottom: "30px" }}>
                  Choose a prompt below, upload a PDF/Image, or type your custom question.
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", width: "100%" }}>
                  {[
                    "Explain OOPs concepts",
                    "TCS NQT Interview Prep",
                    "Generate Python notes",
                    "Data Structures Roadmap"
                  ].map((promptText, idx) => (
                    <div
                      key={idx}
                      className="prompt-chip"
                      onClick={() => handleSend(promptText)}
                      style={{
                        background: "#1e293b", border: "1px solid rgba(255,255,255,0.08)",
                        padding: "16px 20px", borderRadius: "14px", color: "#f8fafc",
                        fontSize: "0.92rem", fontWeight: "600", cursor: "pointer",
                        transition: "all 0.2s ease", textAlign: "left", boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
                      }}
                    >
                      ✨ {promptText}
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isAi = msg.sender === "ai";
              return (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  key={index}
                  style={{ display: "flex", justifyContent: isAi ? "flex-start" : "flex-end", marginBottom: "20px" }}
                >
                  <div style={{ maxWidth: "80%", display: "flex", gap: "12px", alignItems: "flex-start", flexDirection: isAi ? "row" : "row-reverse" }}>
                    
                    {/* Avatar */}
                    <div style={{ 
                      width: "36px", height: "36px", borderRadius: "50%", 
                      background: isAi ? "linear-gradient(135deg, #06b6d4, #8b5cf6)" : "#2563eb", 
                      padding: isAi ? "1.5px" : "0px", display: "flex", alignItems: "center", justifyContent: "center", 
                      flexShrink: 0, boxShadow: "0 0 15px rgba(56,189,248,0.3)" 
                    }}>
                      <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: isAi ? "#0f172a" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {isAi ? <FiCpu size={16} color="#38bdf8" /> : <FiUser size={18} color="white" />}
                      </div>
                    </div>

                    {/* Message Bubble */}
                    <div style={{ 
                      position: "relative", padding: "16px 20px", borderRadius: "18px", 
                      background: isAi ? "#1e293b" : "#2563eb", 
                      border: isAi ? "1px solid transparent" : "1px solid rgba(255,255,255,0.08)",
                      backgroundImage: isAi ? "linear-gradient(#1e293b, #1e293b), linear-gradient(135deg, #06b6d4, #8b5cf6)" : "none",
                      backgroundOrigin: isAi ? "border-box" : "padding-box",
                      backgroundClip: isAi ? "padding-box, border-box" : "border-box",
                      fontSize: "0.95rem", lineHeight: "1.6", boxShadow: "0 4px 20px rgba(0,0,0,0.2)", width: "100%" 
                    }}>
                      
                      <ReactMarkdown
                        components={{
                          code({ className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || "");
                            const codeString = String(children).replace(/\n$/, "");
                            
                            return match ? (
                              <div style={{ position: "relative", margin: "16px 0", borderRadius: "14px", overflow: "hidden", border: "1px solid rgba(255, 255, 255, 0.12)", background: "#0d1117" }}>
                                <div style={{ background: "#161b22", padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem", color: "#e6edf3", borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "600" }}>
                                    <FiCode size={15} color="#38bdf8" />
                                    <span>{match[1].charAt(0).toUpperCase() + match[1].slice(1)}</span>
                                  </div>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(codeString);
                                      showToast("Code copied to clipboard! 📋", "success");
                                    }}
                                    style={{ background: "transparent", border: "none", color: "#8b949e", padding: "4px 8px", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", fontWeight: "600", transition: "0.2s" }}
                                  >
                                    <FiCopy size={14} /> Copy code
                                  </button>
                                </div>
                                <SyntaxHighlighter
                                  style={vscDarkPlus}
                                  language={match[1]}
                                  PreTag="div"
                                  customStyle={{ margin: 0, padding: "18px", background: "#0d1117", fontSize: "0.9rem" }}
                                  {...props}
                                >
                                  {codeString}
                                </SyntaxHighlighter>
                              </div>
                            ) : (
                              <code className={className} style={{ background: "rgba(255,255,255,0.1)", padding: "2px 6px", borderRadius: "4px", fontSize: "0.88rem" }} {...props}>
                                {children}
                              </code>
                            );
                          }
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                      
                      {isAi && (
                        <div style={{ display: "flex", gap: "15px", marginTop: "14px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "10px" }}>
                          <span onClick={() => togglePinMessage(msg.text)} style={{ cursor: "pointer", color: pinnedMessages.includes(msg.text) ? "#38bdf8" : "#94a3b8", display: "flex", alignItems: "center", gap: "5px", fontSize: "0.85rem", transition: "0.2s" }}>
                            <FiBookmark size={14} /> {pinnedMessages.includes(msg.text) ? "Pinned" : "Pin"}
                          </span>
                          <span onClick={() => showToast("Liked response! ❤️", "success")} style={{ cursor: "pointer", color: "#94a3b8", display: "flex", alignItems: "center", gap: "5px", fontSize: "0.85rem", transition: "0.2s" }}>
                            <FiHeart size={14} /> Helpful
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}

          {/* Typing Indicator */}
          {loading && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, #06b6d4, #8b5cf6)", padding: "1.5px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FiCpu size={16} color="#38bdf8" />
                </div>
              </div>
              <div style={{ 
                background: "#1e293b", padding: "14px 20px", borderRadius: "14px", 
                border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: "6px",
                backgroundImage: "linear-gradient(#1e293b, #1e293b), linear-gradient(135deg, #06b6d4, #8b5cf6)",
                backgroundOrigin: "border-box", backgroundClip: "padding-box, border-box"
              }}>
                {[0, 1, 2].map((dot) => (
                  <motion.div
                    key={dot}
                    style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#38bdf8" }}
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: dot * 0.15, ease: "easeInOut" }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef}></div>
        </div>

        {/* Floating Glass Input Area with File Attachment */}
        <div style={{ 
          position: "absolute", bottom: "16px", left: "30px", right: "30px", 
          display: "flex", flexDirection: "column", alignItems: "center", zIndex: 20 
        }}>
          
          {selectedFile && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: "rgba(56, 189, 248, 0.15)", border: "1px solid rgba(56, 189, 248, 0.4)",
                padding: "6px 14px", borderRadius: "10px", display: "flex", alignItems: "center",
                gap: "8px", fontSize: "0.85rem", color: "#38bdf8", marginBottom: "8px"
              }}
            >
              <FiFileText size={16} />
              <span>{selectedFile.name}</span>
              <span onClick={() => setSelectedFile(null)} style={{ cursor: "pointer", fontWeight: "bold", marginLeft: "6px" }}>✕</span>
            </motion.div>
          )}

          <div style={{
            width: "100%", maxWidth: "900px", padding: "10px 16px",
            background: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "20px", display: "flex", gap: "12px", alignItems: "center",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)"
          }}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*,application/pdf"
              style={{ display: "none" }}
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                background: "rgba(255, 255, 255, 0.08)", border: "none", color: "#38bdf8",
                width: "36px", height: "36px", borderRadius: "10px", display: "flex",
                alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "0.2s"
              }}
              title="Upload image or PDF"
            >
              <FiPaperclip size={18} />
            </button>

            <input
              type="text"
              placeholder="Ask anything or ask about your attached file..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="chat-input"
              style={{
                flex: 1, padding: "10px 14px", borderRadius: "12px", border: "1px solid transparent",
                background: "transparent", color: "white", fontSize: "0.98rem", transition: "all 0.3s"
              }}
            />

            <button
              onClick={() => handleSend()}
              disabled={loading}
              style={{
                padding: "10px 22px", borderRadius: "12px", border: "none",
                background: "linear-gradient(135deg, #2563eb, #38bdf8)", color: "white",
                fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px",
                boxShadow: "0 4px 15px rgba(56, 189, 248, 0.4)", fontSize: "0.92rem", transition: "transform 0.2s"
              }}
            >
              Send <FiSend size={15} />
            </button>
          </div>

          <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "8px", textAlign: "center", letterSpacing: "0.3px" }}>
            PrepPulse AI can make mistakes. Check important info.
          </div>
        </div>

      </div>
    </div>
  );
}

export default Chatbot;