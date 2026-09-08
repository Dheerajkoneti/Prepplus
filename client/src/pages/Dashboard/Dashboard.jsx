import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  FiHome, FiBarChart2, FiUser, FiCpu, FiEdit3, FiCompass, 
  FiFileText, FiBookOpen, FiAward, FiActivity, FiBell, FiSettings, 
  FiLogOut, FiMenu, FiX, FiArrowUpRight, FiBook
} from "react-icons/fi";

// Import your logo image
import logoImage from "../../assets/images/Gemini_Generated_Image_70rl6i70rl6i70rl.png";

function Dashboard() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Disable browser back button navigation loop
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    // Replace history stack so back button won't return to dashboard after logout
    navigate("/login", { replace: true });
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const styles = {
    dashboard: {
      display: "flex",
      height: "100vh",
      width: "100vw",
      background: "radial-gradient(circle at top, #1e293b 0%, #0f172a 45%, #020617 100%)",
      color: "white",
      fontFamily: "system-ui, -apple-system, sans-serif",
      overflow: "hidden",
      boxSizing: "border-box",
      userSelect: "none",
      WebkitUserSelect: "none",
      MozUserSelect: "none",
      msUserSelect: "none",
    },

    sidebar: {
      width: isSidebarOpen ? "290px" : "80px",
      background: "rgba(15, 23, 42, 0.85)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      borderRight: "1px solid rgba(255, 255, 255, 0.05)",
      padding: "22px 14px",
      display: "flex",
      flexDirection: "column",
      transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      height: "100vh",
      zIndex: 100,
      boxSizing: "border-box",
      overflowY: "auto",
      overflowX: "hidden",
    },

    logoArea: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "25px",
      paddingLeft: "4px",
      gap: "8px",
    },

    brandWrapper: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      overflow: "hidden",
    },

    logoImg: {
      height: "38px",
      width: "38px",
      borderRadius: "10px",
      objectFit: "cover",
      boxShadow: "0 0 15px rgba(56, 189, 248, 0.4)",
      flexShrink: 0,
    },

    logoText: {
      fontSize: "1.5rem",
      fontWeight: "900",
      letterSpacing: "0.5px",
      background: "linear-gradient(to right, #38bdf8, #818cf8)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      display: isSidebarOpen ? "block" : "none",
      whiteSpace: "nowrap",
    },

    menuToggleBtn: {
      background: "rgba(56, 189, 248, 0.1)",
      border: "1px solid rgba(56, 189, 248, 0.3)",
      color: "#38bdf8",
      width: "36px",
      height: "36px",
      borderRadius: "10px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      transition: "0.2s",
      flexShrink: 0,
    },

    sectionTitle: {
      color: "#64748b",
      fontSize: "0.7rem",
      fontWeight: "700",
      marginTop: "16px",
      marginBottom: "8px",
      letterSpacing: "1.2px",
      display: isSidebarOpen ? "block" : "none",
      paddingLeft: "10px",
    },

    menu: {
      listStyle: "none",
      padding: 0,
      margin: 0,
    },

    menuItem: {
      padding: "11px 13px",
      marginBottom: "6px",
      background: "rgba(255, 255, 255, 0.02)",
      border: "1px solid rgba(255, 255, 255, 0.03)",
      borderRadius: "10px",
      cursor: "pointer",
      transition: "all 0.3s ease",
      fontWeight: "500",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      color: "#cbd5e1",
      whiteSpace: "nowrap",
      overflow: "hidden",
      fontSize: "0.95rem",
    },

    content: {
      flex: 1,
      height: "100vh",
      overflowY: "auto",
      padding: "30px 40px",
      boxSizing: "border-box",
    },

    welcomeCard: {
      background: "linear-gradient(135deg, rgba(37, 99, 235, 0.8), rgba(79, 70, 229, 0.8), rgba(124, 58, 237, 0.8))",
      backdropFilter: "blur(20px)",
      padding: "35px",
      borderRadius: "24px",
      marginBottom: "25px",
      boxShadow: "0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
      border: "1px solid rgba(255,255,255,0.1)",
      position: "relative",
      overflow: "hidden",
    },

    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "18px",
      marginBottom: "30px",
    },

    statCard: {
      background: "rgba(30, 41, 59, 0.45)",
      backdropFilter: "blur(12px)",
      border: "1px solid rgba(255, 255, 255, 0.06)",
      padding: "20px",
      borderRadius: "18px",
      textAlign: "center",
      boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
    },

    featureGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
      gap: "20px",
    },

    featureCard: {
      background: "rgba(30, 41, 59, 0.5)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      border: "1px solid rgba(255, 255, 255, 0.08)",
      padding: "25px",
      borderRadius: "20px",
      cursor: "pointer",
      transition: "all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
      minHeight: "140px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      boxSizing: "border-box",
    },
  };

  const navItems = [
    { label: "Dashboard", icon: <FiHome size={19} />, path: "/dashboard" },
    { label: "Courses", icon: <FiBook size={19} />, path: "/courses" },
    { label: "Progress Analytics", icon: <FiBarChart2 size={19} />, path: "/progress" },
    { label: "Profile", icon: <FiUser size={19} />, path: "/profile" },
  ];

  const aiToolsItems = [
    { label: "AI Chatbot", icon: <FiCpu size={19} />, path: "/chatbot" },

    { label: "AI Note Maker", icon: <FiEdit3 size={19} />, path: "/notes" },

    { label: "Saved Notes", icon: <FiBookOpen size={19} />, path: "/saved-notes" },

    { label: "YouTube MindMap", icon: <FiCompass size={19} />, path: "/mindmap" },

    { label: "Resume Analyzer", icon: <FiFileText size={19} />, path: "/resume" },
  ];

  const learningItems = [
    { label: "Resource Hub", icon: <FiBookOpen size={19} />, path: "/resources" },
    { label: "Leaderboard", icon: <FiAward size={19} />, path: "/leaderboard" },
    { label: "Habit Tracker", icon: <FiActivity size={19} />, path: "/habits" },
  ];

  const aiFeaturesList = [
    { title: "🤖 AI Chatbot", desc: "Ask questions and get instant, intelligent answers.", path: "/chatbot", tag: "Most Popular" },
    { title: "📚 RAG Integration", desc: "Chat directly with uploaded PDFs and study material.", path: "/rag", tag: "Advanced" },
    { title: "📝 AI Note Maker", desc: "Generate smart notes and summaries instantly.", path: "/notes", tag: "Productivity" },
    { title: "🧠 YouTube MindMap", desc: "Convert educational videos into visual mind maps.", path: "/mindmap", tag: "Visual" },
    { title: "📄 Resume Analyzer", desc: "Improve ATS score and optimize your resume.", path: "/resume", tag: "Career" },
    { title: "📈 Progress Tracking", desc: "Track goals, streaks and analytics.", path: "/progress", tag: "Analytics" },
    { title: "📚 Resource Hub", desc: "Manage study resources.", path: "/resources", tag: "Community" },
    { title: "🛡 Resource Moderation", desc: "AI-powered content moderation.", path: "/resource-moderation", tag: "Secure" },
    { title: "💬 Chat History", desc: "Access all previous conversations.", path: "/chat-history", tag: "Storage" },
  ];

  return (
    <div style={styles.dashboard}>
      <style>
        {`
          html, body {
            margin: 0;
            padding: 0;
            overflow: hidden;
            background-color: #020617;
            user-select: none;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
          }
          img, * {
            -webkit-user-drag: none;
            user-drag: none;
          }
          .sidebar-item:hover {
            background: rgba(56, 189, 248, 0.12) !important;
            border-color: rgba(56, 189, 248, 0.3) !important;
            color: #38bdf8 !important;
            transform: translateX(4px);
          }
          .futuristic-card:hover {
            transform: translateY(-6px) scale(1.01);
            border-color: #38bdf8 !important;
            box-shadow: 0 15px 35px rgba(56, 189, 248, 0.25) !important;
            background: rgba(30, 41, 59, 0.75) !important;
          }
          .stat-card-hover:hover {
            border-color: rgba(56, 189, 248, 0.4);
            box-shadow: 0 10px 25px rgba(56, 189, 248, 0.15);
          }
          ::-webkit-scrollbar {
            width: 8px;
          }
          ::-webkit-scrollbar-thumb {
            background: rgba(56, 189, 248, 0.2);
            border-radius: 10px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: rgba(56, 189, 248, 0.4);
          }
        `}
      </style>

      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <div style={styles.logoArea}>
          <div style={styles.brandWrapper}>
            <img src={logoImage} alt="PrepPulse Logo" style={styles.logoImg} />
            <div style={styles.logoText}>PrepPulse</div>
          </div>
          <button style={styles.menuToggleBtn} onClick={toggleSidebar} aria-label="Toggle Sidebar">
            {isSidebarOpen ? <FiX size={18} /> : <FiMenu size={18} />}
          </button>
        </div>

        <div style={styles.sectionTitle}>MAIN</div>
        <ul style={styles.menu}>
          {navItems.map((item, i) => (
            <li key={i} className="sidebar-item" style={styles.menuItem} onClick={() => navigate(item.path)}>
              <span style={{ color: "#38bdf8" }}>{item.icon}</span>
              {isSidebarOpen && <span>{item.label}</span>}
            </li>
          ))}
        </ul>

        <div style={styles.sectionTitle}>AI TOOLS</div>
        <ul style={styles.menu}>
          {aiToolsItems.map((item, i) => (
            <li key={i} className="sidebar-item" style={styles.menuItem} onClick={() => navigate(item.path)}>
              <span style={{ color: "#818cf8" }}>{item.icon}</span>
              {isSidebarOpen && <span>{item.label}</span>}
            </li>
          ))}
        </ul>

        <div style={styles.sectionTitle}>LEARNING</div>
        <ul style={styles.menu}>
          {learningItems.map((item, i) => (
            <li key={i} className="sidebar-item" style={styles.menuItem} onClick={() => navigate(item.path)}>
              <span style={{ color: "#34d399" }}>{item.icon}</span>
              {isSidebarOpen && <span>{item.label}</span>}
            </li>
          ))}
        </ul>

        <div style={styles.sectionTitle}>ACCOUNT</div>
        <ul style={styles.menu}>
          <li className="sidebar-item" style={styles.menuItem}>
            <span style={{ color: "#fbbf24" }}><FiBell size={19} /></span>
            {isSidebarOpen && <span>Notifications</span>}
          </li>
          <li className="sidebar-item" style={styles.menuItem}>
            <span style={{ color: "#94a3b8" }}><FiSettings size={19} /></span>
            {isSidebarOpen && <span>Settings</span>}
          </li>
          <li className="sidebar-item" style={{ ...styles.menuItem, color: "#f87171" }} onClick={handleLogout}>
            <span><FiLogOut size={19} /></span>
            {isSidebarOpen && <span>Logout</span>}
          </li>
        </ul>
      </div>

      {/* CONTENT AREA */}
      <div style={styles.content}>
        
        {/* Welcome Banner */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} style={styles.welcomeCard}>
          <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "180px", height: "180px", background: "rgba(255,255,255,0.1)", filter: "blur(50px)", borderRadius: "50%" }} />
          <span style={{ background: "rgba(255,255,255,0.15)", padding: "4px 12px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: "bold", letterSpacing: "1px", textTransform: "uppercase" }}>
            PrepPulse AI Platform
          </span>
          <h1 style={{ fontSize: "2.3rem", fontWeight: "900", margin: "10px 0 10px 0" }}>Welcome Back, Dheeraj 👋</h1>
          <p style={{ fontSize: "1.05rem", opacity: "0.9", maxWidth: "700px", margin: 0, lineHeight: "1.6" }}>
            Continue your learning journey with advanced AI-powered tools, personalized courses, and smart real-time analytics.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div style={styles.statsGrid}>
          {[
            { num: "12", label: "Courses Completed" },
            { num: "15", label: "Day Streak 🔥" },
            { num: "87", label: "Tasks Completed" },
            { num: "245", label: "AI Interactions" }
          ].map((stat, i) => (
            <motion.div key={i} whileHover={{ y: -4 }} className="stat-card-hover" style={styles.statCard}>
              <h1 style={{ fontSize: "2.2rem", fontWeight: "900", margin: "0 0 5px 0", color: "#38bdf8" }}>{stat.num}</h1>
              <p style={{ margin: 0, color: "#94a3b8", fontWeight: "600", fontSize: "0.85rem" }}>{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Progress Analytics Mini Section */}
        <h2 style={{ marginBottom: "15px", fontSize: "1.3rem" }}>📊 Progress Analytics</h2>

        <div style={styles.statsGrid}>
          {[
            { num: "85%", label: "Course Completion" },
            { num: "120h", label: "Study Hours" },
            { num: "25", label: "Resources Saved" },
            { num: "18", label: "Mind Maps Created" }
          ].map((stat, i) => (
            <motion.div key={i} whileHover={{ y: -4 }} className="stat-card-hover" style={styles.statCard}>
              <h1 style={{ fontSize: "2.2rem", fontWeight: "900", margin: "0 0 5px 0", color: "#818cf8" }}>{stat.num}</h1>
              <p style={{ margin: 0, color: "#94a3b8", fontWeight: "600", fontSize: "0.85rem" }}>{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <h2 style={{ marginBottom: "15px", fontSize: "1.3rem" }}>⚡ Quick Actions</h2>

        <div style={styles.featureGrid}>
          {[
            { title: "📚 Courses", path: "/courses", grad: "linear-gradient(135deg, #0284c7, #38bdf8)" },
            { title: "🚀 Start AI Chat", path: "/chatbot", grad: "linear-gradient(135deg, #2563eb, #38bdf8)" },
            { title: "📝 Generate Notes", path: "/notes", grad: "linear-gradient(135deg, #4f46e5, #818cf8)" },
            { title: "🧠 Create Mind Map", path: "/mindmap", grad: "linear-gradient(135deg, #7c3aed, #a855f7)" }
          ].map((action, i) => (
            <motion.div 
              key={i} 
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(action.path)}
              style={{
                background: action.grad,
                padding: "18px",
                borderRadius: "16px",
                textAlign: "center",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "1rem",
                boxShadow: "0 10px 20px rgba(0,0,0,0.3)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "10px",
                minHeight: "60px",
                boxSizing: "border-box"
              }}
            >
              {action.title} <FiArrowUpRight size={18} />
            </motion.div>
          ))}
        </div>

        {/* Futuristic AI Features Hub */}
        <h2 style={{ marginTop: "35px", marginBottom: "15px", fontSize: "1.5rem" }}>✨ AI Features Hub</h2>

        <div style={styles.featureGrid}>
          {aiFeaturesList.map((feat, i) => (
            <div 
              key={i} 
              className="futuristic-card" 
              onClick={() => navigate(feat.path)}
              style={styles.featureCard}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                  <h3 style={{ margin: 0, fontSize: "1.15rem", color: "#f8fafc" }}>{feat.title}</h3>
                  <span style={{ 
                    background: "rgba(56, 189, 248, 0.1)", 
                    color: "#38bdf8", 
                    padding: "3px 8px", 
                    borderRadius: "20px", 
                    fontSize: "0.7rem", 
                    fontWeight: "bold",
                    border: "1px solid rgba(56, 189, 248, 0.3)"
                  }}>
                    {feat.tag}
                  </span>
                </div>
                <p style={{ color: "#94a3b8", lineHeight: "1.5", margin: 0, fontSize: "0.88rem" }}>
                  {feat.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ height: "40px" }} />
      </div>
    </div>
  );
}

export default Dashboard;