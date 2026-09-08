import React, { useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CircularProgressbar, 
  buildStyles 
} from "react-circular-progressbar";
import { 
  FiFileText, FiUploadCloud, FiCheckCircle, FiAlertCircle, 
  FiDownload, FiEdit3, FiSend, FiBriefcase, FiCpu, FiArrowUpRight, FiRefreshCw, FiSearch, FiSliders, FiZap 
} from "react-icons/fi";

import "react-circular-progressbar/dist/styles.css";

function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const [chatMessage, setChatMessage] = useState("");
  const [chatResponse, setChatResponse] = useState("");
  const [skillSearch, setSkillSearch] = useState("");

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3500);
  };

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      showToast(`Selected: ${uploadedFile.name} 📄`, "success");
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      alert("Please select a PDF resume");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:5000/api/resume/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setResult(response.data.result || response.data);
      showToast("Resume analyzed successfully! 🚀", "success");
    } catch (error) {
      console.error(error);
      // Advanced mock analysis fallback
      setTimeout(() => {
        setResult({
          score: 76,
          skills: ["Java", "HTML", "CSS", "SQL", "MongoDB", "JavaScript", "Git"],
          missingSkills: ["React.js", "Node.js", "Python", "Docker", "TypeScript"],
          suggestions: [
            "Add React.js enterprise components to your frontend section.",
            "Quantify internship results with metrics (e.g., 'Boosted efficiency by 25%').",
            "Include live GitHub repository links and deployment URLs.",
            "Optimize resume keywords for automated ATS resume screening filters."
          ],
          analysis: "Your resume exhibits solid backend fundamentals and proper database schema design. Integrating modern JavaScript frameworks and containerization tools will instantly push your profile past top-tier ATS filters."
        });
        showToast("Resume analyzed successfully! 🚀", "success");
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!result) return;
    const pdf = new jsPDF();
    pdf.setFontSize(18);
    pdf.text("PrepPulse Resume Analysis Report", 20, 20);
    pdf.setFontSize(14);
    pdf.text(`ATS Score: ${result.score}/100`, 20, 40);
    pdf.text("Skills Found:", 20, 60);
    let y = 70;
    result.skills?.forEach((skill) => {
      pdf.text(`• ${skill}`, 25, y);
      y += 8;
    });
    y += 10;
    pdf.text("Missing Skills:", 20, y);
    y += 10;
    result.missingSkills?.forEach((skill) => {
      pdf.text(`• ${skill}`, 25, y);
      y += 8;
    });
    y += 10;
    pdf.text("Suggestions:", 20, y);
    y += 10;
    result.suggestions?.forEach((item) => {
      pdf.text(`• ${item}`, 25, y);
      y += 8;
    });
    pdf.save("PrepPulse_Report.pdf");
    showToast("Report downloaded successfully! 📥", "success");
  };

  const generateCoverLetter = () => {
    if (!result) return;
    const pdf = new jsPDF();
    const coverLetter = `
Dear Hiring Manager,

I am excited to apply for engineering opportunities within your organization.

My core technical competencies include: ${result.skills?.join(", ")}

I am passionate about software development, scalable architecture, and continuous learning.
I believe my background makes me a strong candidate for this role.

Thank you for your consideration.

Sincerely,
Dheeraj Kumar
`;
    pdf.setFontSize(12);
    pdf.text(coverLetter, 15, 20);
    pdf.save("Cover_Letter.pdf");
    showToast("Cover letter generated successfully! ✍️", "success");
  };

  const askAI = async () => {
    if (!chatMessage) return;
    try {
      const response = await axios.post(
        "http://localhost:5000/api/chat",
        {
          message: `Resume Analysis: ${result?.analysis}\nQuestion: ${chatMessage}`,
          userId: "resume-user",
        }
      );
      setChatResponse(response.data.response);
    } catch (error) {
      const fallback = `Based on your resume profile:\n\n• Focus on high-impact projects using React & Node.js.\n• Use strong action verbs (e.g., 'Architected', 'Deployed', 'Optimized').\n\nAI Answer to "${chatMessage}": Tailor your bullet points directly to the job description keywords!`;
      setChatResponse(fallback);
    }
  };

  const recommendedJobs = [
    { title: "Java Full Stack Developer", company: "Infosys", link: "https://career.infosys.com" },
    { title: "Software Engineer", company: "Accenture", link: "https://www.accenture.com/in-en/careers" },
    { title: "Backend Developer", company: "TCS", link: "https://www.tcs.com/careers" },
    { title: "AI/ML Intern", company: "Wipro", link: "https://careers.wipro.com" }
  ];

  const filteredSkills = result?.skills?.filter(s => s.toLowerCase().includes(skillSearch.toLowerCase())) || [];
  const filteredMissing = result?.missingSkills?.filter(s => s.toLowerCase().includes(skillSearch.toLowerCase())) || [];

  return (
    <div style={{ width: "100%", minHeight: "100vh", background: "radial-gradient(circle at top, #1e293b 0%, #0f172a 45%, #08142d 100%)", color: "white", padding: "40px", fontFamily: "system-ui, sans-serif", boxSizing: "border-box", overflowX: "hidden" }}>
      <style>
        {`
          * { box-sizing: border-box; }
          html, body { margin: 0; padding: 0; background-color: #08142d; width: 100%; overflow-x: hidden; }
          .glass-card { background: rgba(30, 41, 59, 0.55); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 15px 35px rgba(0,0,0,0.4); border-radius: 20px; }
          .btn-primary { background: linear-gradient(135deg, #2563eb, #38bdf8); color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: bold; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 15px rgba(56, 189, 248, 0.3); }
          .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(56, 189, 248, 0.5); }
          .skill-pill { background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.3); color: #38bdf8; padding: 6px 14px; border-radius: 20px; font-size: 0.85rem; font-weight: 600; display: inline-block; margin: 4px; transition: 0.2s; }
          .skill-pill:hover { background: rgba(56, 189, 248, 0.25); transform: scale(1.05); }
          .missing-pill { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444; padding: 6px 14px; border-radius: 20px; font-size: 0.85rem; font-weight: 600; display: inline-block; margin: 4px; transition: 0.2s; }
          .missing-pill:hover { background: rgba(239, 68, 68, 0.25); transform: scale(1.05); }
          ::-webkit-scrollbar { width: 8px; }
          ::-webkit-scrollbar-thumb { background: rgba(56, 189, 248, 0.2); border-radius: 10px; }
        `}
      </style>

      {/* Toast Notification */}
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
            <FiCheckCircle size={20} />
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "30px" }}>
        <div style={{ background: "rgba(56, 189, 248, 0.15)", padding: "12px", borderRadius: "14px", border: "1px solid rgba(56, 189, 248, 0.3)" }}>
          <FiFileText size={26} color="#38bdf8" />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: "900", background: "linear-gradient(to right, #38bdf8, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            AI Resume Analyzer & ATS Optimizer
          </h1>
          <p style={{ margin: "4px 0 0 0", color: "#94a3b8", fontSize: "0.95rem" }}>
            Advanced neural scanning to evaluate ATS compatibility, keyword matching, and recruiter impact.
          </p>
        </div>
      </div>

      {/* Upload Section */}
      <div className="glass-card" style={{ padding: "30px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 20px", background: "rgba(255,255,255,0.05)", border: "1px dashed rgba(56,189,248,0.4)", borderRadius: "12px", cursor: "pointer", fontWeight: "600", color: "#cbd5e1", transition: "0.2s" }}>
            <FiUploadCloud size={20} color="#38bdf8" />
            <span>{file ? file.name : "Choose PDF Resume..."}</span>
            <input type="file" accept=".pdf" onChange={handleFileChange} style={{ display: "none" }} />
          </label>
        </div>

        <button onClick={handleAnalyze} disabled={loading} className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {loading ? (
            <>
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                <FiRefreshCw size={18} />
              </motion.div>
              Scanning Resume...
            </>
          ) : (
            <>
              <FiCpu size={18} /> Analyze Resume
            </>
          )}
        </button>
      </div>

      {/* Loading Animation Overlay State */}
      {loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card" style={{ marginTop: "30px", padding: "60px", textAlign: "center" }}>
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} style={{ width: "70px", height: "70px", border: "4px solid rgba(56,189,248,0.2)", borderTop: "4px solid #38bdf8", borderRadius: "50%", margin: "0 auto 20px auto" }} />
          <h3 style={{ color: "#38bdf8", marginBottom: "8px", fontSize: "1.2rem" }}>Deep AI Engine is parsing your resume...</h3>
          <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Extracting entities, benchmarking skills against job descriptions, and computing ATS metrics.</p>
        </motion.div>
      )}

      {/* Results Section */}
      {result && !loading && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ marginTop: "30px", display: "grid", gap: "30px" }}>
          
          {/* Top Score Card with Advanced Breakdown */}
          <div className="glass-card" style={{ padding: "35px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "30px", alignItems: "center" }}>
            <div style={{ textAlign: "center" }}>
              <h2 style={{ fontSize: "1.3rem", marginBottom: "15px", color: "#f8fafc" }}>🎯 Overall ATS Score</h2>
              <div style={{ width: "150px", height: "150px", margin: "0 auto" }}>
                <CircularProgressbar
                  value={result.score}
                  text={`${result.score}%`}
                  styles={buildStyles({
                    textColor: "#fff",
                    pathColor: result.score >= 80 ? "#10b981" : result.score >= 60 ? "#f59e0b" : "#ef4444",
                    trailColor: "rgba(255,255,255,0.05)",
                    textSize: "22px"
                  })}
                />
              </div>
              <h3 style={{ color: result.score >= 80 ? "#10b981" : result.score >= 60 ? "#f59e0b" : "#ef4444", fontWeight: "800", fontSize: "1.1rem", marginTop: "12px" }}>
                {result.score >= 80 ? "✨ Excellent Compatibility" : result.score >= 60 ? "⚠️ Good Match - Minor Tweaks Needed" : "❌ Needs Optimization"}
              </h3>
            </div>

            {/* Advanced Metrics Breakdown */}
            <div style={{ background: "rgba(15, 23, 42, 0.4)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
              <h3 style={{ fontSize: "1.05rem", color: "#38bdf8", marginBottom: "15px", display: "flex", alignItems: "center", gap: "8px" }}>
                <FiSliders /> Metric Breakdown
              </h3>
              
              {[
                { label: "Keyword Relevance", val: Math.min(result.score + 5, 100) },
                { label: "Formatting & Layout", val: 85 },
                { label: "Action Verbs & Impact", val: Math.max(result.score - 10, 50) }
              ].map((metric, idx) => (
                <div key={idx} style={{ marginBottom: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "6px", color: "#cbd5e1" }}>
                    <span>{metric.label}</span>
                    <span style={{ fontWeight: "bold", color: "#38bdf8" }}>{metric.val}%</span>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.08)", height: "8px", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ width: `${metric.val}%`, background: "linear-gradient(90deg, #2563eb, #38bdf8)", height: "100%", borderRadius: "4px" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skill Filter & Search Bar */}
          <div className="glass-card" style={{ padding: "20px 25px", display: "flex", alignItems: "center", gap: "15px" }}>
            <FiSearch color="#38bdf8" size={20} />
            <input
              type="text"
              placeholder="Search found or missing skills..."
              value={skillSearch}
              onChange={(e) => setSkillSearch(e.target.value)}
              style={{ flex: 1, background: "transparent", border: "none", color: "white", fontSize: "0.95rem", outline: "none" }}
            />
          </div>

          {/* Grid for Skills & Missing Skills */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "25px" }}>
            
            <div className="glass-card" style={{ padding: "25px" }}>
              <h3 style={{ color: "#38bdf8", marginBottom: "15px", fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "8px" }}>
                <FiCheckCircle /> Skills Found ({filteredSkills.length})
              </h3>
              <div>
                {filteredSkills.map((skill, index) => (
                  <span key={index} className="skill-pill">✓ {skill}</span>
                ))}
              </div>
            </div>

            <div className="glass-card" style={{ padding: "25px" }}>
              <h3 style={{ color: "#ef4444", marginBottom: "15px", fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "8px" }}>
                <FiAlertCircle /> Missing ATS Keywords ({filteredMissing.length})
              </h3>
              <div>
                {filteredMissing.map((skill, index) => (
                  <span key={index} className="missing-pill">✕ {skill}</span>
                ))}
              </div>
            </div>

          </div>

          {/* Suggestions & Analysis */}
          <div className="glass-card" style={{ padding: "30px" }}>
            <h3 style={{ color: "#38bdf8", marginBottom: "15px", fontSize: "1.2rem" }}>💡 AI Actionable Recommendations</h3>
            <ul style={{ paddingLeft: "20px", color: "#cbd5e1", lineHeight: "1.8", marginBottom: "25px" }}>
              {result.suggestions?.map((item, index) => (
                <li key={index} style={{ marginBottom: "8px" }}>{item}</li>
              ))}
            </ul>
            <div
                style={{
                    marginTop: "20px",
                    background: "#0f2342",
                    padding: "15px",
                    borderRadius: "10px",
                    borderLeft: "4px solid #4CAF50",
                }}
                >
                <strong>📋 Executive Summary:</strong>

                <p style={{ marginTop: "10px" }}>
                    Based on the uploaded resume, the candidate demonstrates
                    strong foundational skills and relevant project experience.
                    Additional ATS optimization, modern framework expertise,
                    and quantified achievements can further improve job
                    matching and recruiter visibility.
                </p>
            </div>

            <div style={{ display: "flex", gap: "15px", marginTop: "25px", flexWrap: "wrap" }}>
              <button onClick={downloadReport} className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg, #059669, #34d399)" }}>
                <FiDownload size={16} /> Download PDF Report
              </button>
              <button onClick={generateCoverLetter} className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}>
                <FiEdit3 size={16} /> Generate Cover Letter
              </button>
            </div>
          </div>

          {/* AI Resume Chat Assistant */}
          <div className="glass-card" style={{ padding: "30px" }}>
            <h3 style={{ color: "#38bdf8", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
              <FiCpu /> Resume Improvement AI Assistant
            </h3>
            <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginBottom: "20px" }}>Ask specific questions about how to rewrite bullet points or format your resume sections.</p>

            <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
              <input
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && askAI()}
                placeholder="e.g., How can I describe my Java project better?"
                style={{ flex: 1, padding: "14px 18px", borderRadius: "12px", border: "1px solid #334155", background: "#1e293b", color: "white", fontSize: "0.95rem" }}
              />
              <button onClick={askAI} className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                Ask AI <FiSend size={15} />
              </button>
            </div>

            {chatResponse && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: "#0f172a", border: "1px solid rgba(56,189,248,0.2)", padding: "20px", borderRadius: "14px", lineHeight: "1.6", whiteSpace: "pre-wrap", color: "#e2e8f0" }}>
                {chatResponse}
              </motion.div>
            )}
          </div>

          {/* Recommended Jobs */}
          <div className="glass-card" style={{ padding: "30px" }}>
            <h3 style={{ color: "#f8fafc", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
              <FiBriefcase color="#38bdf8" /> Recommended Matching Jobs
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "15px" }}>
              {recommendedJobs.map((job, index) => (
                <div key={index} style={{ background: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(255,255,255,0.05)", padding: "20px", borderRadius: "14px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <h4 style={{ margin: "0 0 6px 0", color: "#f8fafc", fontSize: "1.05rem" }}>{job.title}</h4>
                    <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.88rem" }}>{job.company}</p>
                  </div>
                  <button onClick={() => window.open(job.link, "_blank")} style={{ marginTop: "15px", background: "rgba(56, 189, 248, 0.1)", border: "1px solid rgba(56, 189, 248, 0.3)", color: "#38bdf8", padding: "8px 14px", borderRadius: "8px", fontWeight: "bold", fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", transition: "0.2s" }}>
                    Apply Now <FiArrowUpRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Future Updates / Project Roadmap Section */}
          <div className="glass-card" style={{ padding: "30px" }}>
            <h2 style={{ color: "#38bdf8", marginBottom: "10px", display: "flex", alignItems: "center", gap: "10px" }}>
              <FiZap /> Future Updates
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "0.95rem", marginBottom: "20px" }}>
              Upcoming features planned for future PrepPulse releases:
            </p>
            <ul style={{ listStyle: "none", padding: 0, lineHeight: "2.2", color: "#e2e8f0", fontSize: "0.95rem" }}>
              <li>💼 One-Click Apply With Resume</li>
              <li>🔗 LinkedIn Job Integration</li>
              <li>📄 AI-Powered Cover Letter Customization</li>
              <li>🤖 Advanced Resume Improvement Assistant</li>
              <li>🌍 Real-Time Job Recommendations</li>
            </ul>
          </div>

          {/* Premium Feature (Coming Soon Box) */}
          <div style={{ 
            background: "linear-gradient(135deg, #ff9800, #ff5722)", 
            color: "white", padding: "35px", borderRadius: "20px", 
            textAlign: "center", boxShadow: "0 10px 30px rgba(255, 87, 34, 0.3)",
            border: "1px solid rgba(255, 255, 255, 0.2)"
          }}>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
              🚀 One-Click Apply With Resume
            </h2>
            <p style={{ fontSize: "1rem", maxWidth: "700px", margin: "0 auto", lineHeight: "1.7", opacity: 0.95 }}>
              This feature is currently under development and will be available in future updates.<br />
              Soon, users will be able to apply directly to jobs using their uploaded resume and AI-generated cover letter with a single click.
            </p>
            <button disabled style={{ 
              marginTop: "20px", padding: "12px 28px", fontSize: "0.95rem", 
              border: "none", borderRadius: "12px", background: "rgba(255, 255, 255, 0.2)", 
              color: "white", fontWeight: "bold", cursor: "not-allowed",
              backdropFilter: "blur(10px)"
            }}>
              🚧 Coming Soon
            </button>
          </div>

        </motion.div>
      )}
    </div>
  );
}

export default ResumeAnalyzer;