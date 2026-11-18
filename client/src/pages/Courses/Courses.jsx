import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";

const Courses = () => {
  const navigate = useNavigate();

  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/courses/languages");
      setLanguages(response.data?.languages || []);
    } catch (err) {
      console.error("Failed to load course languages:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load learning paths."
      );
    } finally {
      setLoading(false);
    }
  };

  const totalCourses = useMemo(() => {
    return languages.reduce(
      (sum, item) => sum + Number(item.courseCount || 0),
      0
    );
  }, [languages]);

  const handleLanguage = (language) => {
    navigate(
      `/courses/language/${encodeURIComponent(language)}`
    );
  };

  return (
    <div className="courses-page">
      <style>{styles}</style>

      {/* =====================================================
          ENHANCED ATMOSPHERIC BACKGROUND
      ===================================================== */}
      <div className="page-background">
        <div className="ambient ambient-one"></div>
        <div className="ambient ambient-two"></div>
        <div className="ambient ambient-three"></div>
        <div className="ambient ambient-glow"></div>
        <div className="grid-overlay"></div>
      </div>

      {/* =====================================================
          NAVIGATION
      ===================================================== */}
      <header className="courses-nav">
        <div
          className="brand"
          onClick={() => navigate("/courses")}
        >
          <div className="brand-mark">
            <span>PP</span>
          </div>
          <div className="brand-text">
            <strong>PrepPulse</strong>
            <span>Learning Hub</span>
          </div>
        </div>

        <div className="nav-center">
          <button
            className="nav-link active"
            onClick={() => navigate("/courses")}
          >
            Courses
          </button>
          <button
            className="nav-link"
            onClick={() => navigate("/progress")}
          >
            My Progress
          </button>
          <button
            className="nav-link"
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </button>
        </div>

        <button
          className="profile-button"
          onClick={() => navigate("/profile")}
        >
          <span className="profile-dot"></span>
          My Learning
          <span className="arrow">↗</span>
        </button>
      </header>

      {/* =====================================================
          HERO SECTION
      ===================================================== */}
      <main>
        <section className="hero">
          <div className="hero-content">
            <div className="eyebrow">
              <span className="eyebrow-dot"></span>
              PREPPULSE LEARNING HUB
              <span className="eyebrow-line"></span>
              Structured • Practical • Verified
            </div>

            <h1>
              Learn.
              <span> Build.</span>
              <br />
              <strong>Get Certified.</strong>
            </h1>

            <p className="hero-description">
              Build job-ready programming skills through
              structured courses, practical lessons,
              assessments, and verified certificates.
            </p>

            <div className="hero-actions">
              <button
                className="primary-action"
                onClick={() =>
                  document
                    .getElementById("learning-paths")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    })
                }
              >
                <span>Explore Learning Paths</span>
                <span className="button-arrow">→</span>
              </button>

              <button
                className="secondary-action"
                onClick={() => navigate("/progress")}
              >
                <span className="play-icon">▶</span>
                Continue Learning
              </button>
            </div>

            {/* HERO TRUST STATS */}
            <div className="hero-stats">
              <div className="hero-stat">
                <div className="stat-icon purple">
                  <Icon name="book" />
                </div>
                <div>
                  <strong>{languages.length || "01"}+</strong>
                  <span>Learning paths</span>
                </div>
              </div>

              <div className="stat-divider"></div>

              <div className="hero-stat">
                <div className="stat-icon blue">
                  <Icon name="layers" />
                </div>
                <div>
                  <strong>{totalCourses || "01"}+</strong>
                  <span>Structured courses</span>
                </div>
              </div>

              <div className="stat-divider"></div>

              <div className="hero-stat">
                <div className="stat-icon green">
                  <Icon name="badge" />
                </div>
                <div>
                  <strong>100%</strong>
                  <span>Verified completion</span>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              HERO VISUAL (ORBITAL CORE)
          ================================================= */}
          <div className="hero-visual">
            <div className="visual-glow"></div>
            <div className="orbit orbit-one"></div>
            <div className="orbit orbit-two"></div>
            <div className="orbit orbit-three"></div>

            <div className="orbit-dot dot-one"></div>
            <div className="orbit-dot dot-two"></div>
            <div className="orbit-dot dot-three"></div>

            <div className="learning-core">
              <div className="core-inner">
                <div className="core-logo">PP</div>
                <div className="core-title">PrepPulse</div>
                <div className="core-subtitle">Learn • Practice • Prove</div>
              </div>
            </div>

            {/* FLOATING GLASS CARDS */}
            <div className="floating-card floating-one">
              <div className="floating-icon java">☕</div>
              <div>
                <strong>Java</strong>
                <span>Learning path</span>
              </div>
              <div className="mini-check">✓</div>
            </div>

            <div className="floating-card floating-two">
              <div className="floating-icon code">
                <Icon name="code" />
              </div>
              <div>
                <strong>Practice</strong>
                <span>Real challenges</span>
              </div>
            </div>

            <div className="floating-card floating-three">
              <div className="floating-icon certificate">
                <Icon name="badge" />
              </div>
              <div>
                <strong>Certificate</strong>
                <span>Verified achievement</span>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            QUICK BENEFITS
        ===================================================== */}
        <section className="benefits-section">
          <Benefit
            number="01"
            icon="target"
            title="Learn with direction"
            text="Follow a structured path instead of jumping between random tutorials."
          />
          <Benefit
            number="02"
            icon="book"
            title="Understand concepts"
            text="Learn fundamentals through focused lessons designed for clarity."
          />
          <Benefit
            number="03"
            icon="code"
            title="Practice what you learn"
            text="Reinforce concepts with assessments and practical challenges."
          />
          <Benefit
            number="04"
            icon="badge"
            title="Prove your skills"
            text="Complete the journey and earn a verifiable PrepPulse certificate."
          />
        </section>

        {/* =====================================================
            LEARNING PATHS SECTION
        ===================================================== */}
        <section className="paths-section" id="learning-paths">
          <div className="section-heading">
            <div>
              <div className="section-label">
                <span></span>
                START LEARNING
              </div>
              <h2>
                Choose your
                <span> programming path.</span>
              </h2>
              <p>
                Pick a language and follow a structured
                journey from fundamentals to certification.
              </p>
            </div>
            <div className="path-count">
              <strong>{languages.length}</strong>
              <span>Available paths</span>
            </div>
          </div>

          {loading && (
            <div className="loading-area">
              <div className="loading-orb"></div>
              <div className="loading-lines">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <p>Preparing your learning paths...</p>
            </div>
          )}

          {!loading && error && (
            <div className="error-card">
              <div className="error-icon">!</div>
              <div>
                <strong>Learning paths unavailable</strong>
                <p>{error}</p>
              </div>
              <button onClick={fetchLanguages}>Try Again</button>
            </div>
          )}

          {!loading && !error && languages.length === 0 && (
            <div className="empty-card">
              <div className="empty-icon">
                <Icon name="book" />
              </div>
              <h3>Learning paths are coming soon</h3>
              <p>
                New programming courses will appear
                here once they are published.
              </p>
            </div>
          )}

          {!loading && !error && languages.length > 0 && (
            <div className="language-list">
              {languages.map((language, index) => (
                <LanguageCard
                  key={language.name}
                  language={language}
                  index={index}
                  onClick={() => handleLanguage(language.name)}
                />
              ))}
            </div>
          )}
        </section>

        {/* =====================================================
            JOURNEY SECTION
        ===================================================== */}
        <section className="journey-section">
          <div className="journey-heading">
            <div className="section-label">
              <span></span>
              HOW IT WORKS
            </div>
            <h2>
              Your learning
              <span> journey.</span>
            </h2>
            <p>
              A simple path from learning fundamentals
              to earning your PrepPulse certificate.
            </p>
          </div>

          <div className="journey">
            <JourneyStep
              number="01"
              icon="target"
              title="Choose a course"
              text="Select the programming language and course you want to master."
            />
            <div className="journey-line">
              <span></span>
            </div>
            <JourneyStep
              number="02"
              icon="book"
              title="Learn topics"
              text="Complete lessons and build your understanding step by step."
            />
            <div className="journey-line">
              <span></span>
            </div>
            <JourneyStep
              number="03"
              icon="check"
              title="Pass assessments"
              text="Complete topic exams to unlock the next stage of your course."
            />
            <div className="journey-line">
              <span></span>
            </div>
            <JourneyStep
              number="04"
              icon="badge"
              title="Earn certificate"
              text="Finish the final assessment and receive your verified certificate."
            />
          </div>
        </section>

        {/* =====================================================
            FINAL CTA
        ===================================================== */}
        <section className="final-cta">
          <div className="cta-glow"></div>
          <div className="cta-icon">
            <Icon name="badge" />
          </div>
          <div className="cta-content">
            <div className="section-label">
              <span></span>
              YOUR NEXT MILESTONE
            </div>
            <h2>
              Learn today.
              <span> Prove it tomorrow.</span>
            </h2>
            <p>
              Build the skills you need for your next
              opportunity and turn your progress into
              something you can show.
            </p>
          </div>
          <button
            className="cta-button"
            onClick={() =>
              document
                .getElementById("learning-paths")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Start Your Journey
            <span>→</span>
          </button>
        </section>
      </main>

      {/* =====================================================
          FOOTER
      ===================================================== */}
      <footer className="courses-footer">
        <div className="footer-brand">
          <div className="brand-mark small">PP</div>
          <div>
            <strong>PrepPulse</strong>
            <span>Learning that moves you forward.</span>
          </div>
        </div>

        <div className="footer-links">
          <button onClick={() => navigate("/dashboard")}>Dashboard</button>
          <button onClick={() => navigate("/progress")}>Progress</button>
          <button onClick={() => navigate("/profile")}>Profile</button>
        </div>

        <div className="footer-copy">
          © {new Date().getFullYear()} PrepPulse
        </div>
      </footer>
    </div>
  );
};

/* ============================================================
   LANGUAGE CARD COMPONENT
============================================================ */
const LanguageCard = ({ language, index, onClick }) => {
  const themes = [
    { icon: "☕", className: "java-theme", label: "Popular" },
    { icon: "</>", className: "code-theme", label: "Developer" },
    { icon: "⌘", className: "logic-theme", label: "Engineering" },
    { icon: "◆", className: "data-theme", label: "Technology" },
  ];

  const theme = themes[index % themes.length];

  return (
    <button className="language-card" onClick={onClick}>
      <div className="language-card-bg"></div>
      <div className={`language-symbol ${theme.className}`}>
        <span>{theme.icon}</span>
        <div className="symbol-ring ring-a"></div>
        <div className="symbol-ring ring-b"></div>
      </div>

      <div className="language-main">
        <div className="language-top">
          <span className="language-index">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="language-label">{theme.label}</span>
        </div>

        <h3>{language.name}</h3>
        <p>
          Build your skills with a structured{` ${language.name}`} learning journey.
        </p>

        <div className="language-meta">
          <span>
            <Icon name="book" />
            {language.courseCount || 0}{" "}
            {language.courseCount === 1 ? "Course" : "Courses"}
          </span>
          <span>
            <Icon name="layers" />
            Structured path
          </span>
          <span>
            <Icon name="badge" />
            Certificate
          </span>
        </div>
      </div>

      <div className="language-action">
        <span>Explore</span>
        <strong>→</strong>
      </div>
    </button>
  );
};

const Benefit = ({ number, icon, title, text }) => (
  <div className="benefit">
    <div className="benefit-top">
      <div className="benefit-icon">
        <Icon name={icon} />
      </div>
      <span>{number}</span>
    </div>
    <h3>{title}</h3>
    <p>{text}</p>
  </div>
);

const JourneyStep = ({ number, icon, title, text }) => (
  <div className="journey-step">
    <div className="journey-number">{number}</div>
    <div className="journey-icon">
      <Icon name={icon} />
    </div>
    <h3>{title}</h3>
    <p>{text}</p>
  </div>
);

const Icon = ({ name }) => {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  switch (name) {
    case "book":
      return (
        <svg {...common}>
          <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 0 4 22V5.5Z" />
          <path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H20" />
        </svg>
      );
    case "layers":
      return (
        <svg {...common}>
          <path d="m12 3 9 5-9 5-9-5 9-5Z" />
          <path d="m3 12 9 5 9-5" />
          <path d="m3 16 9 5 9-5" />
        </svg>
      );
    case "badge":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4.5" />
          <path d="m9 12-1 8 4-2 4 2-1-8" />
          <path d="m10.5 8 1 1 2-2" />
        </svg>
      );
    case "code":
      return (
        <svg {...common}>
          <path d="m8 9-4 3 4 3" />
          <path d="m16 9 4 3-4 3" />
          <path d="m14 5-4 14" />
        </svg>
      );
    case "target":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="12" cy="12" r="1" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
        </svg>
      );
  }
};

/* ============================================================
   ENHANCED STYLES (High-End Neon Glassmorphism)
============================================================ */
const styles = `
* { box-sizing: border-box; }
html { scroll-behavior: smooth; width: 100%; min-height: 100%; }
body, #root { width: 100%; min-height: 100vh; margin: 0; }

.courses-page {
  position: relative;
  width: 100%;
  min-height: 100vh;
  margin: 0;
  overflow-x: hidden;
  background:
    radial-gradient(circle at 10% 5%, rgba(99, 102, 241, 0.22), transparent 35%),
    radial-gradient(circle at 90% 18%, rgba(139, 92, 246, 0.18), transparent 40%),
    radial-gradient(circle at 50% 80%, rgba(59, 130, 246, 0.1), transparent 50%),
    #020617;
  color: #f8fafc;
}

/* ATMOSPHERIC GLOWS */
.page-background {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.ambient {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  opacity: .25;
}

.ambient-one { width: 600px; height: 600px; left: -300px; top: 150px; background: #6366f1; }
.ambient-two { width: 550px; height: 550px; right: -250px; top: 500px; background: #8b5cf6; }
.ambient-three { width: 400px; height: 400px; left: 40%; top: 50px; background: #3b82f6; opacity: .12; }
.ambient-glow { width: 350px; height: 350px; right: 20%; top: 30%; background: #ec4899; opacity: .08; filter: blur(140px); }

.grid-overlay {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(148, 163, 184, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148, 163, 184, 0.035) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: linear-gradient(to bottom, black, transparent 90%);
}

/* NAVIGATION */
.courses-nav {
  position: relative;
  z-index: 10;
  width: min(1760px, 96%);
  margin: auto;
  height: 82px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
}

.brand { display: flex; align-items: center; gap: 12px; cursor: pointer; }
.brand-mark {
  width: 42px; height: 42px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 14px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  box-shadow: 0 10px 30px rgba(99, 102, 241, 0.4);
  font-size: 12px; font-weight: 900;
}
.brand-text { display: flex; flex-direction: column; }
.brand-text strong { font-size: 15px; letter-spacing: -.3px; }
.brand-text span { margin-top: 2px; color: #94a3b8; font-size: 9px; letter-spacing: 1px; }

.nav-center { display: flex; gap: 8px; background: rgba(255, 255, 255, 0.025); padding: 4px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.05); }
.nav-link {
  border: 0; background: transparent; color: #94a3b8; padding: 8px 16px; border-radius: 9px; font-size: 11px; font-weight: 600; cursor: pointer; transition: .25s;
}
.nav-link:hover, .nav-link.active { color: #ffffff; background: rgba(99, 102, 241, 0.2); box-shadow: inset 0 0 15px rgba(99, 102, 241, 0.1); }

.profile-button {
  display: flex; align-items: center; gap: 8px;
  border: 1px solid rgba(129, 140, 248, 0.3);
  background: rgba(99, 102, 241, 0.1);
  color: #e2e8f0; border-radius: 11px; padding: 10px 16px;
  font-size: 10px; font-weight: 600; cursor: pointer; transition: .25s;
}
.profile-button:hover { border-color: rgba(129, 140, 248, 0.6); background: rgba(99, 102, 241, 0.2); box-shadow: 0 0 20px rgba(99, 102, 241, 0.25); }
.profile-dot { width: 6px; height: 6px; border-radius: 50%; background: #34d399; box-shadow: 0 0 12px #34d399; }
.arrow { color: #818cf8; }

/* HERO SECTION */
.hero {
  position: relative; z-index: 2;
  width: min(1760px, 96%); min-height: 700px;
  margin: auto; display: grid; grid-template-columns: 1.1fr 0.9fr;
  align-items: center; gap: 50px; padding: 60px 0;
}

.hero-content { position: relative; z-index: 3; }
.eyebrow {
  display: flex; align-items: center; gap: 10px;
  color: #a5b4fc; font-size: 9px; font-weight: 800; letter-spacing: 2.5px;
}
.eyebrow-dot { width: 6px; height: 6px; border-radius: 50%; background: #818cf8; box-shadow: 0 0 15px #818cf8; }
.eyebrow-line { width: 35px; height: 1px; background: rgba(129, 140, 248, 0.4); }

.hero h1 {
  margin: 22px 0 20px; max-width: 780px;
  font-size: clamp(52px, 6.2vw, 92px);
  line-height: .96; letter-spacing: -4px; font-weight: 800;
}
.hero h1 span { color: #a5b4fc; }
.hero h1 strong {
  background: linear-gradient(110deg, #ffffff 15%, #c4b5fd 48%, #818cf8 85%);
  -webkit-background-clip: text; background-clip: text; color: transparent;
  filter: drop-shadow(0 15px 35px rgba(99, 102, 241, 0.3));
}

.hero-description { max-width: 580px; color: #94a3b8; font-size: 14px; line-height: 1.8; margin: 0; }
.hero-actions { display: flex; gap: 14px; margin-top: 35px; }

.primary-action, .secondary-action {
  display: flex; align-items: center; gap: 15px; border-radius: 12px;
  padding: 14px 22px; font-size: 11px; font-weight: 700; cursor: pointer;
  transition: transform .25s, box-shadow .25s, border .25s;
}
.primary-action {
  border: none;
  background: linear-gradient(110deg, #6366f1, #8b5cf6, #ec4899);
  background-size: 200% auto;
  color: white;
  box-shadow: 0 12px 35px rgba(99, 102, 241, 0.4);
  animation: gradientShift 6s ease infinite;
}
@keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
.primary-action:hover { transform: translateY(-3px); box-shadow: 0 20px 50px rgba(99, 102, 241, 0.6); }

.button-arrow {
  width: 26px; height: 26px; display: flex; align-items: center; justify-content: center;
  border-radius: 8px; background: rgba(255, 255, 255, 0.2); font-size: 15px;
}
.secondary-action {
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04); color: #cbd5e1;
}
.secondary-action:hover { border-color: rgba(129, 140, 248, 0.4); background: rgba(99, 102, 241, 0.1); }
.play-icon {
  width: 26px; height: 26px; display: flex; align-items: center; justify-content: center;
  border-radius: 50%; background: rgba(129, 140, 248, 0.18); color: #a5b4fc; font-size: 8px;
}

.hero-stats { display: flex; align-items: center; gap: 24px; margin-top: 50px; }
.hero-stat { display: flex; align-items: center; gap: 12px; }
.stat-icon { width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; border-radius: 11px; }
.stat-icon.purple { background: rgba(139, 92, 246, 0.15); color: #c084fc; border: 1px solid rgba(139, 92, 246, 0.3); }
.stat-icon.blue { background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); }
.stat-icon.green { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
.hero-stat strong { font-size: 16px; font-weight: 700; }
.hero-stat span { color: #64748b; font-size: 8px; margin-top: 3px; display: block; }
.stat-divider { width: 1px; height: 35px; background: rgba(255, 255, 255, 0.08); }

/* HERO VISUAL ORBIT */
.hero-visual { position: relative; height: 580px; display: flex; align-items: center; justify-content: center; }
.visual-glow { position: absolute; width: 350px; height: 350px; border-radius: 50%; background: #6366f1; filter: blur(140px); opacity: .2; }

.orbit { position: absolute; border: 1px solid rgba(129, 140, 248, 0.2); border-radius: 50%; transform: rotate(-18deg); }
.orbit-one { width: 320px; height: 320px; }
.orbit-two { width: 450px; height: 200px; }
.orbit-three { width: 540px; height: 260px; border-style: dashed; opacity: .4; }

.learning-core {
  position: relative; width: 230px; height: 230px; border-radius: 50%; padding: 2px;
  background: linear-gradient(135deg, rgba(129, 140, 248, 0.8), rgba(99, 102, 241, 0.05), rgba(167, 139, 250, 0.8));
  box-shadow: 0 0 100px rgba(99, 102, 241, 0.25);
}
.core-inner {
  width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;
  border-radius: 50%; background: radial-gradient(circle at 40% 30%, rgba(99, 102, 241, 0.3), transparent 60%), #070d22;
  box-shadow: inset 0 0 60px rgba(99, 102, 241, 0.15);
}
.core-logo {
  width: 60px; height: 60px; display: flex; align-items: center; justify-content: center;
  border-radius: 18px; background: linear-gradient(135deg, #6366f1, #8b5cf6); font-weight: 900; font-size: 16px;
  box-shadow: 0 15px 40px rgba(99, 102, 241, 0.4);
}
.core-title { margin-top: 14px; font-size: 18px; font-weight: 800; letter-spacing: -.3px; }
.core-subtitle { margin-top: 4px; color: #64748b; font-size: 8px; letter-spacing: 1.5px; text-transform: uppercase; }

.orbit-dot { position: absolute; width: 10px; height: 10px; border-radius: 50%; box-shadow: 0 0 20px currentColor; }
.dot-one { top: 110px; right: 130px; color: #818cf8; background: #818cf8; }
.dot-two { bottom: 110px; left: 120px; color: #34d399; background: #34d399; }
.dot-three { top: 190px; left: 60px; color: #60a5fa; background: #60a5fa; }

/* FLOATING GLASS CARDS */
.floating-card {
  position: absolute; display: flex; align-items: center; gap: 12px; min-width: 165px;
  padding: 13px; border: 1px solid rgba(129, 140, 248, 0.25); border-radius: 14px;
  background: rgba(8, 15, 36, 0.85); backdrop-filter: blur(20px);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1);
}
.floating-card strong { display: block; font-size: 11px; font-weight: 700; }
.floating-card span { display: block; margin-top: 3px; color: #64748b; font-size: 7.5px; }

.floating-one { top: 90px; right: 0px; animation: floatOne 5s ease-in-out infinite; }
.floating-two { bottom: 90px; left: -10px; animation: floatTwo 6s ease-in-out infinite; }
.floating-three { bottom: 135px; right: 10px; animation: floatThree 7s ease-in-out infinite; }

.floating-icon { width: 36px; height: 36px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; border-radius: 10px; font-size: 16px; }
.floating-icon.java { background: rgba(244, 114, 182, 0.15); border: 1px solid rgba(244, 114, 182, 0.3); }
.floating-icon.code { background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); }
.floating-icon.certificate { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
.mini-check { margin-left: auto; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: rgba(16, 185, 129, 0.15); color: #34d399; font-size: 9px; }

@keyframes floatOne { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
@keyframes floatTwo { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(12px); } }
@keyframes floatThree { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }

/* BENEFITS SECTION */
.benefits-section {
  position: relative; z-index: 2; width: min(1760px, 96%); margin: 30px auto 120px;
  display: grid; grid-template-columns: repeat(4, 1fr);
  border-top: 1px solid rgba(255, 255, 255, 0.08); border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(10px); border-radius: 20px; overflow: hidden;
}
.benefit { min-height: 190px; padding: 35px 28px; border-right: 1px solid rgba(255, 255, 255, 0.07); transition: background .3s; }
.benefit:hover { background: rgba(99, 102, 241, 0.04); }
.benefit:last-child { border-right: 0; }
.benefit-top { display: flex; justify-content: space-between; align-items: center; }
.benefit-icon { width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; border-radius: 12px; background: rgba(99, 102, 241, 0.12); border: 1px solid rgba(99, 102, 241, 0.25); color: #a5b4fc; }
.benefit-top > span { color: #475569; font-size: 10px; font-weight: 800; }
.benefit h3 { margin: 24px 0 10px; font-size: 14px; font-weight: 700; }
.benefit p { margin: 0; color: #64748b; font-size: 9.5px; line-height: 1.7; }

/* PATHS SECTION */
.paths-section { position: relative; z-index: 2; width: min(1600px, 94%); margin: auto; padding: 40px 0 130px; }
.section-heading { display: flex; align-items: end; justify-content: space-between; margin-bottom: 40px; }
.section-heading h2, .journey-heading h2 { margin: 12px 0 8px; font-size: 38px; letter-spacing: -1.5px; font-weight: 800; }
.section-heading h2 span, .journey-heading h2 span { color: #a5b4fc; }
.section-heading p, .journey-heading p { margin: 0; max-width: 550px; color: #64748b; font-size: 11.5px; line-height: 1.7; }
.path-count { display: flex; flex-direction: column; align-items: flex-end; }
.path-count strong { color: #a5b4fc; font-size: 34px; font-weight: 800; }
.path-count span { color: #475569; font-size: 8.5px; }

/* LANGUAGE CARD */
.language-list { display: flex; flex-direction: column; gap: 16px; }
.language-card {
  position: relative; width: 100%; min-height: 210px; display: grid; grid-template-columns: 220px 1fr 110px;
  align-items: center; overflow: hidden; padding: 24px; border: 1px solid rgba(129, 140, 248, 0.2);
  border-radius: 20px; background: linear-gradient(110deg, rgba(15, 23, 42, 0.95), rgba(8, 15, 36, 0.9));
  color: white; text-align: left; cursor: pointer; transition: transform .35s cubic-bezier(0.16, 1, 0.3, 1), border .35s, box-shadow .35s;
}
.language-card:hover {
  transform: translateY(-6px);
  border-color: rgba(129, 140, 248, 0.6);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.4), 0 0 40px rgba(99, 102, 241, 0.15);
}
.language-card-bg { position: absolute; width: 400px; height: 400px; left: -200px; top: -100px; border-radius: 50%; background: radial-gradient(circle, rgba(99, 102, 241, 0.15), transparent 65%); pointer-events: none; }

.language-symbol {
  position: relative; width: 160px; height: 160px; display: flex; align-items: center; justify-content: center;
  margin-left: 10px; border-radius: 50%; font-size: 38px; z-index: 1; border: 1px solid rgba(255, 255, 255, 0.08);
}
.java-theme { background: radial-gradient(circle, rgba(244, 114, 182, 0.2), rgba(99, 102, 241, 0.05) 60%), #0b1228; color: #f9a8d4; }
.code-theme { background: radial-gradient(circle, rgba(59, 130, 246, 0.2), rgba(99, 102, 241, 0.05) 60%), #0b1228; color: #60a5fa; }
.logic-theme { background: radial-gradient(circle, rgba(168, 85, 247, 0.2), rgba(99, 102, 241, 0.05) 60%), #0b1228; color: #c084fc; }
.data-theme { background: radial-gradient(circle, rgba(16, 185, 129, 0.18), rgba(99, 102, 241, 0.05) 60%), #0b1228; color: #34d399; }

.symbol-ring { position: absolute; border-radius: 50%; border: 1px solid rgba(129, 140, 248, 0.2); }
.ring-a { inset: -14px; }
.ring-b { inset: -28px; border-style: dashed; opacity: .5; }

.language-main { position: relative; z-index: 2; padding-left: 30px; }
.language-top { display: flex; align-items: center; gap: 12px; }
.language-index { color: #475569; font-size: 9.5px; font-weight: 800; }
.language-label { padding: 5px 10px; border-radius: 6px; background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); color: #a5b4fc; font-size: 7.5px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; }

.language-main h3 { margin: 14px 0 8px; font-size: 26px; font-weight: 800; letter-spacing: -.5px; }
.language-main p { max-width: 620px; margin: 0; color: #64748b; font-size: 10.5px; line-height: 1.7; }
.language-meta { display: flex; gap: 22px; margin-top: 22px; }
.language-meta span { display: flex; align-items: center; gap: 6px; color: #94a3b8; font-size: 9px; }
.language-meta svg { width: 13px; height: 13px; color: #818cf8; }

.language-action { position: relative; z-index: 2; display: flex; flex-direction: column; align-items: flex-end; gap: 10px; }
.language-action span { color: #64748b; font-size: 8.5px; }
.language-action strong {
  width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;
  border-radius: 12px; background: linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(139, 92, 246, 0.18));
  border: 1px solid rgba(129, 140, 248, 0.3); color: #a5b4fc; font-size: 18px; transition: .3s;
}
.language-card:hover .language-action strong {
  transform: translateX(6px);
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-color: transparent; color: white; box-shadow: 0 0 25px rgba(99, 102, 241, 0.5);
}

/* STATES (Loading, Error, Empty) */
.loading-area { min-height: 280px; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 1px dashed rgba(255, 255, 255, 0.12); border-radius: 20px; }
.loading-orb { width: 50px; height: 50px; border: 3px solid rgba(129, 140, 248, 0.2); border-top-color: #818cf8; border-radius: 50%; animation: spin .8s linear infinite; }
.loading-lines { display: flex; gap: 6px; margin-top: 20px; }
.loading-lines span { width: 24px; height: 3px; border-radius: 5px; background: #334155; animation: loadingPulse 1s ease-in-out infinite; }
.loading-lines span:nth-child(2) { animation-delay: .15s; }
.loading-lines span:nth-child(3) { animation-delay: .3s; }
.loading-area p { margin-top: 15px; color: #64748b; font-size: 9.5px; }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes loadingPulse { 50% { background: #818cf8; transform: scaleY(1.8); } }

.error-card { display: flex; align-items: center; gap: 18px; padding: 24px; border: 1px solid rgba(248, 113, 113, 0.25); border-radius: 18px; background: rgba(127, 29, 29, 0.12); }
.error-icon { width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; border-radius: 12px; background: rgba(248, 113, 113, 0.15); color: #f87171; font-weight: 800; }
.error-card strong { font-size: 12px; }
.error-card p { margin: 5px 0 0; color: #94a3b8; font-size: 9.5px; }
.error-card button { margin-left: auto; padding: 10px 16px; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 9px; background: rgba(255, 255, 255, 0.05); color: #cbd5e1; cursor: pointer; font-weight: 600; }

.empty-card { min-height: 300px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; border: 1px dashed rgba(255, 255, 255, 0.12); border-radius: 20px; }
.empty-icon { width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; border-radius: 16px; background: rgba(99, 102, 241, 0.12); border: 1px solid rgba(99, 102, 241, 0.25); color: #818cf8; }
.empty-card h3 { margin: 20px 0 8px; font-size: 15px; }
.empty-card p { margin: 0; color: #64748b; font-size: 9.5px; }

/* JOURNEY SECTION */
.journey-section { position: relative; z-index: 2; width: min(1600px, 94%); margin: auto; padding: 50px 0 130px; }
.journey-heading { text-align: center; }
.journey-heading .section-label { justify-content: center; }
.journey-heading p { margin: auto; }
.journey { display: grid; grid-template-columns: 1fr 90px 1fr 90px 1fr 90px 1fr; align-items: center; margin-top: 75px; }
.journey-step { text-align: center; }
.journey-number { color: #475569; font-size: 9px; font-weight: 800; letter-spacing: 2px; }
.journey-icon {
  width: 60px; height: 60px; display: flex; align-items: center; justify-content: center;
  margin: 12px auto 18px; border: 1px solid rgba(129, 140, 248, 0.3); border-radius: 18px;
  background: rgba(99, 102, 241, 0.1); color: #a5b4fc; box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
}
.journey-step h3 { margin: 0; font-size: 12px; font-weight: 700; }
.journey-step p { max-width: 180px; margin: 8px auto 0; color: #64748b; font-size: 8.5px; line-height: 1.7; }
.journey-line { height: 1px; background: linear-gradient(90deg, transparent, rgba(129, 140, 248, 0.4), transparent); position: relative; }
.journey-line span { position: absolute; width: 6px; height: 6px; top: -3px; left: 50%; border-radius: 50%; background: #818cf8; box-shadow: 0 0 15px #818cf8; }

/* CTA SECTION */
.final-cta {
  position: relative; z-index: 2; width: min(1600px, 94%); min-height: 210px;
  margin: 0 auto 120px; padding: 40px 50px; display: flex; align-items: center; gap: 30px;
  overflow: hidden; border: 1px solid rgba(129, 140, 248, 0.3); border-radius: 24px;
  background: linear-gradient(110deg, rgba(30, 27, 75, 0.7), rgba(15, 23, 42, 0.9));
  box-shadow: 0 30px 90px rgba(0, 0, 0, 0.5);
}
.cta-glow { position: absolute; width: 350px; height: 350px; right: 0; top: -180px; border-radius: 50%; background: #6366f1; filter: blur(120px); opacity: .2; }
.cta-icon {
  position: relative; flex-shrink: 0; width: 70px; height: 70px; display: flex; align-items: center; justify-content: center;
  border-radius: 20px; background: linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(139, 92, 246, 0.15));
  border: 1px solid rgba(129, 140, 248, 0.3); color: #a5b4fc; font-size: 24px;
}
.cta-content { position: relative; }
.cta-content h2 { margin: 12px 0 8px; font-size: 28px; letter-spacing: -.8px; font-weight: 800; }
.cta-content h2 span { color: #a5b4fc; }
.cta-content p { max-width: 620px; margin: 0; color: #94a3b8; font-size: 10.5px; line-height: 1.7; }
.cta-button {
  position: relative; margin-left: auto; flex-shrink: 0; display: flex; align-items: center; gap: 20px;
  padding: 15px 24px; border: none; border-radius: 12px; background: linear-gradient(110deg, #6366f1, #8b5cf6);
  color: white; font-size: 11px; font-weight: 700; cursor: pointer; box-shadow: 0 15px 40px rgba(99, 102, 241, 0.4);
  transition: transform .25s, box-shadow .25s;
}
.cta-button:hover { transform: translateY(-2px); box-shadow: 0 20px 50px rgba(99, 102, 241, 0.6); }
.cta-button span { font-size: 16px; }

/* FOOTER */
.courses-footer {
  position: relative; z-index: 2; width: min(1760px, 96%); margin: auto; padding: 35px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.08); display: flex; align-items: center; justify-content: space-between;
}
.footer-brand { display: flex; align-items: center; gap: 12px; }
.brand-mark.small { width: 34px; height: 34px; border-radius: 10px; font-size: 9px; }
.footer-brand > div:last-child { display: flex; flex-direction: column; }
.footer-brand strong { font-size: 11px; font-weight: 700; }
.footer-brand span { margin-top: 3px; color: #64748b; font-size: 8px; }

.footer-links { display: flex; gap: 24px; }
.footer-links button { border: 0; background: transparent; color: #64748b; font-size: 9px; font-weight: 600; cursor: pointer; transition: color .2s; }
.footer-links button:hover { color: #a5b4fc; }
.footer-copy { color: #475569; font-size: 9px; }

/* RESPONSIVE MEDIA QUERIES */
@media (max-width: 1050px) {
  .hero { grid-template-columns: 1fr; text-align: center; padding-top: 50px; }
  .hero-content { display: flex; flex-direction: column; align-items: center; }
  .hero-description { margin: auto; }
  .hero-visual { height: 480px; }
  .benefits-section { grid-template-columns: repeat(2, 1fr); border-radius: 16px; }
  .benefit:nth-child(2) { border-right: 0; }
  .benefit:nth-child(-n+2) { border-bottom: 1px solid rgba(255, 255, 255, 0.07); }
  .journey { grid-template-columns: repeat(2, 1fr); gap: 45px; }
  .journey-line { display: none; }
}

@media (max-width: 800px) {
  .nav-center { display: none; }
  .hero h1 { font-size: 48px; letter-spacing: -2px; }
  .hero-stats { flex-wrap: wrap; justify-content: center; }
  .language-card { grid-template-columns: 130px 1fr 80px; min-height: 180px; }
  .language-symbol { width: 110px; height: 110px; font-size: 28px; }
  .language-main { padding-left: 12px; }
  .language-main h3 { font-size: 20px; }
  .language-meta { flex-wrap: wrap; gap: 10px; }
  .final-cta { flex-wrap: wrap; }
  .cta-button { margin-left: 0; width: 100%; justify-content: center; }
}

@media (max-width: 600px) {
  .courses-nav { width: 92%; height: 72px; }
  .profile-button { padding: 8px 12px; }
  .hero { width: 90%; padding-top: 35px; }
  .hero h1 { font-size: 38px; letter-spacing: -1.5px; }
  .hero-actions { width: 100%; flex-direction: column; }
  .primary-action, .secondary-action { justify-content: center; width: 100%; }
  .language-card { grid-template-columns: 1fr; padding: 20px; text-align: center; }
  .language-symbol { margin: 0 auto 20px; }
  .language-main { padding: 0; }
  .language-top { justify-content: center; }
  .language-main p { margin: auto; }
  .language-meta { justify-content: center; }
  .language-action { margin-top: 20px; flex-direction: row; justify-content: center; }
  .journey { grid-template-columns: 1fr; }
  .courses-footer { flex-direction: column; gap: 20px; text-align: center; }
  .footer-links { justify-content: center; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; scroll-behavior: auto !important; }
}
`;

export default Courses;