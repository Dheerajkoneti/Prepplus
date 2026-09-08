import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiCpu, FiBookOpen, FiClock, FiEdit3, FiFolder, FiShield, 
  FiYoutube, FiFileText, FiTrendingUp, FiCheckCircle, FiXCircle,
  FiTarget, FiAward, FiTrendingDown, FiMonitor, FiMic, FiCode, FiSmartphone, FiGlobe, FiX, FiVolume2, FiVolumeX
} from "react-icons/fi";

// Imported Logo and Video
import logoImage from "../../assets/images/Gemini_Generated_Image_70rl6i70rl6i70rl.png";
import demoVideo from "../../assets/videos/Create_a_professional_cinemati.mp4";

const glassStyle = {
  background: "rgba(30, 41, 59, 0.4)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: "1px solid rgba(255, 255, 255, 0.05)",
  borderRadius: "24px",
};

const gradientText = {
  background: "linear-gradient(to right, #38bdf8, #2563eb)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
};

export default function Landing() {
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState(null); 
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  // Animations
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const features = [
    { icon: <FiCpu />, title: "AI Tutor", desc: "Ask coding questions, placement questions, or aptitude doubts 24/7." },
    { icon: <FiBookOpen />, title: "RAG Engine", desc: "Upload PDFs. Search documents. Get context-aware answers instantly." },
    { icon: <FiEdit3 />, title: "AI Notes Generator", desc: "Turn topics into comprehensive notes, interview questions, and summaries." },
    { icon: <FiYoutube />, title: "YouTube Mind Map", desc: "Paste a link to generate video summaries and visual mind maps." },
    { icon: <FiFileText />, title: "Resume Analyzer", desc: "Get an ATS Score, find missing skills, and receive improvement suggestions." },
    { icon: <FiTrendingUp />, title: "Progress Tracker", desc: "Set daily learning goals, view weekly analytics, and build learning streaks." },
    { icon: <FiFolder />, title: "Resource Hub", desc: "Upload, download, like, and comment on community-shared study materials." },
    { icon: <FiTarget />, title: "Habit Tracker", desc: "Track daily coding, daily aptitude practice, and daily revision." },
    { icon: <FiAward />, title: "Leaderboard", desc: "Compete with top learners, unlock achievements, and earn rewards." },
  ];

  return (
    <>
      <style>
        {`
          body, html { margin: 0; padding: 0; background-color: #0f172a; color: #f8fafc; font-family: system-ui, -apple-system, sans-serif; overflow-x: hidden; scroll-behavior: smooth; }
          .btn-primary { background: linear-gradient(135deg, #2563eb, #38bdf8); color: white; padding: 14px 28px; border-radius: 12px; font-weight: 700; text-decoration: none; transition: transform 0.2s; box-shadow: 0 4px 15px rgba(56, 189, 248, 0.3); border: none; cursor: pointer; display: inline-block; }
          .btn-primary:hover { transform: scale(1.05); }
          .btn-secondary { background: transparent; color: white; padding: 14px 28px; border-radius: 12px; font-weight: 700; text-decoration: none; border: 1px solid rgba(56, 189, 248, 0.5); transition: all 0.2s; display: inline-block; cursor: pointer; }
          .btn-secondary:hover { background: rgba(56, 189, 248, 0.1); border-color: #38bdf8; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { padding: 15px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.05); }
          th { color: #38bdf8; }
          .footer-link { color: #64748b; text-decoration: none; display: block; margin: 8px 0; transition: color 0.3s ease; cursor: pointer; }
          .footer-link:hover { color: #38bdf8; }
          
          /* Modal Styles */
          .modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(2, 6, 23, 0.85); backdrop-filter: blur(8px); z-index: 1000; display: flex; justify-content: center; align-items: center; padding: 20px; box-sizing: border-box; }
          .modal-content { background: #0f172a; border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 20px; width: 100%; max-width: 800px; max-height: 85vh; overflow-y: auto; padding: 40px; color: #cbd5e1; box-shadow: 0 20px 50px rgba(0,0,0,0.5); position: relative; }
          .modal-content::-webkit-scrollbar { width: 8px; }
          .modal-content::-webkit-scrollbar-thumb { background: #38bdf8; border-radius: 10px; }
          .modal-close { position: absolute; top: 25px; right: 25px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444; width: 40px; height: 40px; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 1.5rem; cursor: pointer; transition: 0.3s; }
          .modal-close:hover { background: #ef4444; color: white; transform: rotate(90deg); }
          .modal-content h2 { color: #f8fafc; font-size: 2.2rem; margin-top: 0; margin-bottom: 5px; }
          .modal-content h3 { color: #38bdf8; margin-top: 30px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 10px; }
          .modal-content p, .modal-content ul { line-height: 1.8; font-size: 1.05rem; }
          .modal-content ul { padding-left: 20px; }

          /* Video Mute Button */
          .mute-btn { position: absolute; bottom: 20px; right: 20px; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(8px); border: 1px solid rgba(255, 255, 255, 0.2); color: white; width: 45px; height: 45px; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 1.2rem; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(0,0,0,0.3); z-index: 10; }
          .mute-btn:hover { background: rgba(56, 189, 248, 0.2); border-color: #38bdf8; transform: scale(1.1); }
        `}
      </style>

      <div id="home" style={{ minHeight: "100vh", background: "radial-gradient(circle at top, #1e293b 0%, #0f172a 50%, #020617 100%)" }}>
        
        {/* NAVBAR */}
        <nav style={{ ...glassStyle, borderRadius: "0 0 24px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 8%", position: "sticky", top: 0, zIndex: 100, borderTop: "none" }}>
          <a href="#home" style={{ display: "flex", alignItems: "center", textDecoration: "none", gap: "15px" }}>
            <img 
              src={logoImage} 
              alt="PrepPulse AI Logo" 
              style={{ height: "60px", borderRadius: "12px", boxShadow: "0 0 15px rgba(56, 189, 248, 0.2)" }}
            />
            <h2 style={{ margin: 0, fontSize: "1.8rem", fontWeight: "900", letterSpacing: "1px", color: "#f8fafc" }}>
              PrepPulse <span style={{ color: "#38bdf8" }}>AI</span>
            </h2>
          </a>
          <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
            <Link to="/login" className="btn-secondary" style={{ padding: "10px 20px" }}>Login</Link>
            <Link to="/register" className="btn-primary" style={{ padding: "10px 20px" }}>Get Started</Link>
          </div>
        </nav>

        {/* HERO SECTION */}
        <motion.section initial="hidden" animate="visible" variants={staggerContainer} style={{ textAlign: "center", padding: "100px 10% 80px" }}>
          <motion.div variants={fadeUp} style={{ display: "inline-block", background: "rgba(56, 189, 248, 0.1)", color: "#38bdf8", padding: "8px 16px", borderRadius: "30px", fontWeight: "bold", marginBottom: "20px" }}>
            🚀 Welcome to the Future of Learning
          </motion.div>
          <motion.h1 variants={fadeUp} style={{ fontSize: "5rem", margin: "0 0 20px 0", fontWeight: "900", lineHeight: "1.1" }}>
            One Platform. <br /><span style={gradientText}>Unlimited Learning.</span>
          </motion.h1>
          <motion.p variants={fadeUp} style={{ fontSize: "1.2rem", color: "#94a3b8", maxWidth: "700px", margin: "0 auto 40px", lineHeight: "1.8" }}>
            Transform the way you learn, prepare for placements, and achieve your career goals with the ultimate AI-powered study companion.
          </motion.p>
          
          <motion.div variants={fadeUp} style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap", marginBottom: "60px" }}>
            <Link to="/register" className="btn-primary">Get Started Free</Link>
            <a href="#demo-video" className="btn-secondary">Watch Demo</a>
          </motion.div>

          {/* AUTO-PLAYING DEMO VIDEO WITH CUSTOM SOUND BUTTON */}
          <motion.div id="demo-video" variants={fadeUp} style={{ display: "flex", justifyContent: "center", width: "100%", maxWidth: "1000px", margin: "auto", position: "relative" }}>
            <video 
              ref={videoRef}
              src={demoVideo} 
              autoPlay 
              loop 
              muted={isMuted} 
              playsInline
              style={{
                width: "100%",
                borderRadius: "20px",
                boxShadow: "0 10px 40px rgba(56, 189, 248, 0.25)",
                border: "1px solid rgba(56, 189, 248, 0.3)",
                display: "block"
              }}
            />
            {/* Custom Sound Toggle Button */}
            <button className="mute-btn" onClick={toggleMute} aria-label="Toggle Mute">
              {isMuted ? <FiVolumeX /> : <FiVolume2 color="#38bdf8" />}
            </button>
          </motion.div>

          {/* Hero Stats */}
          <motion.div variants={staggerContainer} style={{ display: "flex", justifyContent: "center", gap: "40px", marginTop: "80px", flexWrap: "wrap" }}>
            {[
              { label: "Students", value: "500+" },
              { label: "AI Responses", value: "10K+" },
              { label: "Notes Generated", value: "2K+" },
              { label: "Resume Accuracy", value: "95%" }
            ].map((stat, i) => (
              <motion.div key={i} variants={fadeUp} style={{ textAlign: "center" }}>
                <h3 style={{ fontSize: "2.5rem", margin: "0", color: "#f8fafc" }}>{stat.value}</h3>
                <p style={{ margin: "5px 0 0", color: "#64748b", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", fontSize: "0.85rem" }}>{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* PROBLEM SECTION */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} style={{ padding: "60px 8%" }}>
          <motion.h2 variants={fadeUp} style={{ textAlign: "center", fontSize: "2.5rem", marginBottom: "50px" }}>Students Use <span style={gradientText}>Too Many Tools</span></motion.h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "30px", maxWidth: "900px", margin: "auto" }}>
            <motion.div variants={fadeUp} style={{ ...glassStyle, padding: "40px" }}>
              <h3 style={{ color: "#ef4444", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "15px", marginBottom: "20px" }}>The Old Way</h3>
              {[ "ChatGPT for doubts", "YouTube for learning", "Notion for notes", "Resume websites", "Study trackers", "Resource folders" ].map((item, i) => (
                <p key={i} style={{ color: "#94a3b8", display: "flex", alignItems: "center", gap: "10px", fontSize: "1.1rem" }}><FiXCircle color="#ef4444" /> {item}</p>
              ))}
            </motion.div>
            <motion.div variants={fadeUp} style={{ ...glassStyle, padding: "40px", border: "1px solid rgba(56, 189, 248, 0.3)", boxShadow: "0 0 30px rgba(56, 189, 248, 0.1)" }}>
              <h3 style={{ color: "#38bdf8", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "15px", marginBottom: "20px" }}>The PrepPulse Way</h3>
              <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
                <FiCheckCircle size={60} color="#38bdf8" style={{ marginBottom: "20px" }} />
                <h2 style={{ margin: 0, textAlign: "center", fontSize: "1.8rem" }}>Everything inside <br/>PrepPulse</h2>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* FEATURES SHOWCASE */}
        <motion.section id="features" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} style={{ padding: "80px 8%" }}>
          <motion.h2 variants={fadeUp} style={{ textAlign: "center", fontSize: "2.5rem", marginBottom: "50px" }}>Powerful <span style={gradientText}>AI Modules</span></motion.h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "25px" }}>
            {features.map((feature, i) => (
              <motion.div key={i} variants={fadeUp} whileHover={{ y: -10, scale: 1.02 }} onClick={() => navigate("/login")} style={{ ...glassStyle, padding: "35px", cursor: "pointer", transition: "box-shadow 0.3s" }}>
                <div style={{ fontSize: "2.5rem", color: "#38bdf8", marginBottom: "20px", background: "rgba(56,189,248,0.1)", width: "70px", height: "70px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "16px" }}>
                  {feature.icon}
                </div>
                <h3 style={{ fontSize: "1.5rem", marginBottom: "15px", color: "#f8fafc" }}>{feature.title}</h3>
                <p style={{ color: "#94a3b8", lineHeight: "1.6", margin: 0, fontSize: "1.05rem" }}>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* HOW IT WORKS */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} style={{ padding: "60px 8%", background: "rgba(15, 23, 42, 0.4)", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <motion.h2 variants={fadeUp} style={{ textAlign: "center", fontSize: "2.5rem", marginBottom: "50px" }}>How PrepPulse <span style={gradientText}>Works</span></motion.h2>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "15px", maxWidth: "1000px", margin: "auto" }}>
            {[ "1. Register", "2. Ask AI", "3. Generate Notes", "4. Practice", "5. Track Progress", "6. Get Placement Ready" ].map((step, i) => (
              <motion.div key={i} variants={fadeUp} style={{ ...glassStyle, padding: "15px 25px", borderRadius: "30px", fontWeight: "bold", display: "flex", alignItems: "center", gap: "10px", color: "#cbd5e1" }}>
                <span style={{ color: "#38bdf8" }}><FiCheckCircle /></span> {step}
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* DASHBOARD PREVIEW & COMPARISON */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} style={{ padding: "80px 8%", display: "flex", flexWrap: "wrap", gap: "50px" }}>
          
          <div style={{ flex: "1 1 400px" }}>
            <motion.h2 variants={fadeUp} style={{ fontSize: "2.5rem", marginBottom: "30px" }}>Your <span style={gradientText}>Dashboard</span></motion.h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              {[
                { title: "Current Streak", val: "15 Days", icon: <FiTrendingUp /> },
                { title: "Resume Score", val: "87%", icon: <FiFileText /> },
                { title: "Notes Created", val: "126", icon: <FiEdit3 /> },
                { title: "AI Chats", val: "319", icon: <FiCpu /> }
              ].map((card, i) => (
                <motion.div key={i} variants={fadeUp} style={{ ...glassStyle, padding: "20px" }}>
                  <div style={{ color: "#38bdf8", marginBottom: "10px", fontSize: "1.5rem" }}>{card.icon}</div>
                  <h4 style={{ margin: "0 0 5px", color: "#94a3b8", fontSize: "0.9rem" }}>{card.title}</h4>
                  <p style={{ margin: 0, fontSize: "1.8rem", fontWeight: "bold" }}>{card.val}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div style={{ flex: "1 1 500px" }}>
            <motion.h2 variants={fadeUp} style={{ fontSize: "2.5rem", marginBottom: "30px" }}>Why <span style={gradientText}>Choose Us</span></motion.h2>
            <motion.div variants={fadeUp} style={{ ...glassStyle, padding: "30px", overflowX: "auto" }}>
              <table>
                <thead>
                  <tr>
                    <th>Feature</th>
                    <th>PrepPulse</th>
                    <th>Others</th>
                  </tr>
                </thead>
                <tbody>
                  {["AI Chat", "RAG Integration", "Note Generation", "Resume Analyzer", "Progress Tracking", "Mind Maps"].map((row, i) => (
                    <tr key={i}>
                      <td style={{ color: "#cbd5e1" }}>{row}</td>
                      <td style={{ color: "#10b981", fontWeight: "bold" }}>✅</td>
                      <td style={{ color: "#ef4444" }}>❌</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </div>
        </motion.section>

        {/* FUTURE ROADMAP */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} style={{ padding: "60px 8%", textAlign: "center" }}>
          <motion.h2 variants={fadeUp} style={{ fontSize: "2.5rem", marginBottom: "40px" }}>Future <span style={gradientText}>Roadmap</span></motion.h2>
          <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}>
            {[
              { title: "Voice AI Tutor", icon: <FiMic /> },
              { title: "AI Coding Assistant", icon: <FiCode /> },
              { title: "Mobile Application", icon: <FiSmartphone /> },
              { title: "Multi-language", icon: <FiGlobe /> }
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp} style={{ ...glassStyle, padding: "20px 30px", display: "flex", alignItems: "center", gap: "15px", color: "#cbd5e1" }}>
                <span style={{ color: "#38bdf8", fontSize: "1.5rem" }}>{item.icon}</span> {item.title}
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* TESTIMONIALS & CTA */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} style={{ padding: "100px 8%", textAlign: "center", background: "linear-gradient(to bottom, transparent, rgba(15, 23, 42, 0.8))" }}>
          <motion.h2 variants={fadeUp} style={{ fontSize: "3.5rem", marginBottom: "20px", fontWeight: "900" }}>Ready to <span style={gradientText}>Learn Smarter?</span></motion.h2>
          <motion.p variants={fadeUp} style={{ color: "#94a3b8", fontSize: "1.2rem", marginBottom: "40px" }}>Join hundreds of students preparing for their placements today.</motion.p>
          <motion.div variants={fadeUp} style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
            <Link to="/register" className="btn-primary" style={{ padding: "18px 40px", fontSize: "1.2rem" }}>Create Free Account</Link>
          </motion.div>
        </motion.section>

        {/* FOOTER */}
        <footer style={{ background: "#020617", borderTop: "1px solid rgba(255,255,255,0.05)", padding: "60px 8% 30px", color: "#64748b" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "40px", marginBottom: "40px" }}>
            <div>
              <h2 style={{ color: "#f8fafc", margin: "0 0 15px", display: "flex", alignItems: "center", gap: "10px" }}>
                <img src={logoImage} alt="Logo" style={{ height: "30px", borderRadius: "6px" }} />
                PrepPulse <span style={{ color: "#38bdf8" }}>AI</span>
              </h2>
              <p>The ultimate AI-powered learning platform designed for ambitious students.</p>
              <p style={{ fontStyle: "italic", color: "#94a3b8", marginTop: "15px" }}>"Empowering students through Artificial Intelligence, personalized learning, and collaborative knowledge sharing."</p>
            </div>
            <div>
              <h4 style={{ color: "#f8fafc", marginBottom: "15px" }}>Quick Links</h4>
              <a href="#home" className="footer-link">Home</a>
              <a href="#features" className="footer-link">Features</a>
              <Link to="/dashboard" className="footer-link">Dashboard</Link>
            </div>
            <div>
              <h4 style={{ color: "#f8fafc", marginBottom: "15px" }}>Legal</h4>
              <span onClick={() => setActiveModal("privacy")} className="footer-link">Privacy Policy</span>
              <span onClick={() => setActiveModal("terms")} className="footer-link">Terms of Service</span>
            </div>
          </div>
          <div style={{ textAlign: "center", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            © 2026 PrepPulse AI. Built with ❤️ for students.
          </div>
        </footer>

        {/* MODAL SYSTEM */}
        <AnimatePresence>
          {activeModal && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="modal-overlay" onClick={() => setActiveModal(null)}
            >
              <motion.div 
                initial={{ y: 50, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 50, scale: 0.95 }}
                className="modal-content" onClick={(e) => e.stopPropagation()}
              >
                <button className="modal-close" onClick={() => setActiveModal(null)}>
                  <FiX />
                </button>

                {/* PRIVACY POLICY */}
                {activeModal === "privacy" && (
                  <div>
                    <h2>PrepPulse Privacy Policy</h2>
                    <p style={{ color: "#94a3b8" }}>Last Updated: July 2026</p>

                    <h3>1. Introduction</h3>
                    <p>Welcome to PrepPulse, an AI-Powered Learning and Resource Platform designed to help students learn smarter through AI tutoring, note generation, resume analysis, resource sharing, and progress tracking. This Privacy Policy explains how PrepPulse collects, uses, stores, and protects your information when you use our website and services. By accessing or using PrepPulse, you agree to the practices described in this Privacy Policy.</p>

                    <h3>2. Information We Collect</h3>
                    <p><strong>Personal Information</strong><br/>When you register for an account, we may collect:</p>
                    <ul>
                      <li>Full Name</li>
                      <li>Email Address</li>
                      <li>Profile Picture (optional)</li>
                      <li>Password (stored securely in encrypted form)</li>
                    </ul>
                    <p><strong>Learning Data</strong><br/>To provide personalized learning experiences, we may collect:</p>
                    <ul>
                      <li>Chatbot conversations</li>
                      <li>Generated notes</li>
                      <li>Uploaded study materials</li>
                      <li>Progress tracking information</li>
                      <li>Habit tracking data</li>
                      <li>Learning preferences</li>
                    </ul>
                    <p><strong>Resume Data</strong><br/>When you upload a resume for analysis, we may temporarily process education details, skills, work experience, certifications, and projects.</p>
                    <p><strong>Technical Information</strong><br/>We may automatically collect browser type, device information, IP address, usage statistics, and session information.</p>

                    <h3>3. How We Use Your Information</h3>
                    <p>PrepPulse uses collected information to:</p>
                    <ul>
                      <li>Provide AI-powered learning assistance</li>
                      <li>Generate notes and summaries</li>
                      <li>Analyze resumes and provide recommendations</li>
                      <li>Manage user accounts</li>
                      <li>Track learning progress</li>
                      <li>Improve platform performance</li>
                      <li>Prevent fraud and misuse</li>
                      <li>Respond to support requests</li>
                    </ul>

                    <h3>4. AI Services</h3>
                    <p>Some platform features use Artificial Intelligence technologies. These features include AI Chatbot, AI Note Generator, Resume Analyzer, YouTube Summarization, and Mind Map Generation. User inputs may be processed by third-party AI service providers solely for generating requested outputs. We do not use your personal content for advertising purposes.</p>

                    <h3>5. Resource Sharing</h3>
                    <p>Users may upload educational resources including PDF Files, PPT Presentations, Study Notes, and Learning Materials. Users are responsible for ensuring that uploaded content does not violate copyright laws, does not contain harmful content, and does not infringe on third-party rights. PrepPulse reserves the right to review, approve, reject, or remove uploaded resources.</p>

                    <h3>6. Data Security</h3>
                    <p>We implement industry-standard security measures including encrypted passwords, secure authentication systems, protected APIs, access control mechanisms, and secure database storage. While we strive to protect user data, no online platform can guarantee 100% security.</p>

                    <h3>7. Data Retention</h3>
                    <p>We retain user information only for as long as necessary to provide services. Users may request account deletion, data removal, resource deletion, and chat history deletion.</p>

                    <h3>8. User Rights</h3>
                    <p>Users have the right to access personal information, update account details, delete uploaded content, request account deletion, and request data correction.</p>

                    <h3>9. Third-Party Services</h3>
                    <p>PrepPulse may use third-party services such as OpenAI, Google Services, Cloud Storage Providers, and Email Providers. These services have their own privacy policies and practices.</p>

                    <h3>10. Children's Privacy</h3>
                    <p>PrepPulse is intended for students and educational users. Users under applicable legal age should use the platform under parental or institutional supervision.</p>

                    <h3>11. Policy Updates</h3>
                    <p>PrepPulse may update this Privacy Policy periodically. Any changes will be reflected on this page with an updated revision date.</p>

                    <h3>12. Contact Information</h3>
                    <p>For privacy-related concerns, contact:<br/><strong>PrepPulse Support Team</strong><br/>Email: support@preppulse.com<br/>Website: www.preppulse.com</p>
                  </div>
                )}

                {/* TERMS OF SERVICE */}
                {activeModal === "terms" && (
                  <div>
                    <h2>Terms and Conditions</h2>
                    <p style={{ color: "#94a3b8" }}>Last Updated: July 2026</p>

                    <h3>1. Acceptance of Terms</h3>
                    <p>By accessing and using PrepPulse, you agree to comply with these Terms and Conditions. If you do not agree, please discontinue use of the platform.</p>

                    <h3>2. Platform Purpose</h3>
                    <p>PrepPulse is an educational platform that provides AI Learning Assistance, Study Resource Management, Resume Analysis, Progress Tracking, YouTube Learning Tools, and Collaborative Learning Features. The platform is intended solely for educational and professional development purposes.</p>

                    <h3>3. User Accounts</h3>
                    <p>Users must provide accurate information, maintain account confidentiality, protect login credentials, and notify us of unauthorized account access. Users are responsible for all activity occurring under their accounts.</p>

                    <h3>4. Acceptable Use</h3>
                    <p>Users agree not to upload malicious files, share illegal content, attempt unauthorized access, abuse AI services, harass other users, or distribute copyrighted materials without permission. Violation may result in account suspension or termination.</p>

                    <h3>5. AI-Generated Content</h3>
                    <p>PrepPulse uses AI technologies to generate answers, notes, summaries, resume suggestions, and mind maps. AI-generated content is provided for educational assistance only. Users should independently verify important information before relying on it.</p>

                    <h3>6. Intellectual Property</h3>
                    <p>All PrepPulse branding, software, design elements, and platform features are the property of PrepPulse and its creators. Users retain ownership of content they upload. By uploading content, users grant PrepPulse permission to display and manage such content within the platform.</p>

                    <h3>7. Resource Moderation</h3>
                    <p>Uploaded resources may be reviewed, approved, rejected, or removed. Administrators reserve the right to moderate content to maintain platform quality and safety.</p>

                    <h3>8. Limitation of Liability</h3>
                    <p>PrepPulse is provided on an "as-is" basis. We are not liable for data loss, service interruptions, AI inaccuracies, user-generated content, or third-party service failures.</p>

                    <h3>9. Account Termination</h3>
                    <p>PrepPulse reserves the right to suspend or terminate accounts that violate platform policies, engage in abusive behavior, or misuse platform services.</p>

                    <h3>10. Future Modifications</h3>
                    <p>PrepPulse may modify features, policies, or services at any time. Continued use of the platform indicates acceptance of updated terms.</p>

                    <h3>11. Governing Law</h3>
                    <p>These Terms shall be governed by applicable laws and regulations of the jurisdiction in which the platform operates.</p>

                    <h3>12. Contact</h3>
                    <p>For questions regarding these Terms and Conditions:<br/><strong>PrepPulse Support Team</strong><br/>Email: support@preppulse.com<br/>Website: www.preppulse.com</p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}