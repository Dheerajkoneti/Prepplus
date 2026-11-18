import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../services/api";

const CourseLanguage = () => {
  const { language } = useParams();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCourses();
  }, [language]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get(
        `/courses/language/${encodeURIComponent(language)}`
      );

      setCourses(response.data?.courses || []);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to load courses."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="language-page">
      <style>{styles}</style>

      <div className="bg-orb orb-a" />
      <div className="bg-orb orb-b" />

      <header className="language-nav">
        <button
          className="back-button"
          onClick={() => navigate("/courses")}
        >
          ← All Languages
        </button>

        <div className="language-brand">
          <span>PREPPULSE</span>
          <small>LEARNING PATH</small>
        </div>

        <button
          className="nav-dashboard"
          onClick={() => navigate("/dashboard")}
        >
          Dashboard ↗
        </button>
      </header>

      <main>

        {/* HERO */}

        <section className="language-hero">

          <div className="hero-copy">

            <div className="hero-label">
              <span />
              PROGRAMMING PATH
            </div>

            <h1>
              Master
              <strong> {language}</strong>
              <br />
              one concept at a time.
            </h1>

            <p>
              Learn through structured lessons,
              practical assessments and progressive
              challenges designed to take you from
              fundamentals to confidence.
            </p>

            <div className="hero-pills">
              <span>◈ Structured learning</span>
              <span>◉ Assessments</span>
              <span>✦ Certificate</span>
            </div>

          </div>

          <div className="language-orbit">

            <div className="orbit-ring ring-1" />
            <div className="orbit-ring ring-2" />
            <div className="orbit-ring ring-3" />

            <div className="language-core">
              <span className="core-small">
                MASTER
              </span>

              <strong>
                {language}
              </strong>

              <small>
                Step by step
              </small>
            </div>

            <div className="orbit-chip chip-top">
              ✓ Lessons
            </div>

            <div className="orbit-chip chip-left">
              ⚡ Practice
            </div>

            <div className="orbit-chip chip-right">
              🏆 Certificate
            </div>

          </div>

        </section>

        {/* COURSE SECTION */}

        <section className="courses-section">

          <div className="section-header">

            <div>
              <div className="section-label">
                AVAILABLE PATHS
              </div>

              <h2>
                Choose your {language} journey
              </h2>

              <p>
                Follow a structured curriculum designed
                to build real understanding.
              </p>
            </div>

            <div className="course-counter">
              <strong>{courses.length}</strong>
              <span>Available paths</span>
            </div>

          </div>

          {loading && (
            <div className="loading-state">
              <div className="spinner" />
              <p>Preparing your learning paths...</p>
            </div>
          )}

          {!loading && error && (
            <div className="error-state">
              <div className="error-symbol">!</div>
              <h3>Unable to load courses</h3>
              <p>{error}</p>

              <button onClick={loadCourses}>
                Try Again
              </button>
            </div>
          )}

          {!loading &&
            !error &&
            courses.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">◇</div>

                <h3>
                  No courses available yet
                </h3>

                <p>
                  Courses for {language} will appear
                  here once published.
                </p>
              </div>
            )}

          {!loading &&
            !error &&
            courses.length > 0 && (
              <div className="course-grid">

                {courses.map((course, index) => (
                  <article
                    key={course._id}
                    className="course-card"
                    onClick={() =>
                      navigate(
                        `/courses/${course._id}`
                      )
                    }
                  >

                    <div className="course-glow" />

                    <div className="course-number">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <div className="course-icon">
                      {language
                        .substring(0, 2)
                        .toUpperCase()}
                    </div>

                    <div className="course-content">

                      <div className="course-top">

                        <span>
                          {course.level ||
                            "Beginner"}
                        </span>

                        <span>
                          {course.certificateEnabled
                            ? "Certificate"
                            : "Learning Path"}
                        </span>

                      </div>

                      <h3>
                        {course.title}
                      </h3>

                      <p>
                        {course.description ||
                          `Build your ${language} skills through a structured learning path.`}
                      </p>

                      <div className="course-meta">

                        <span>
                          ◫ {course.topics?.length || "Multiple"} topics
                        </span>

                        <span>
                          ◷ {course.duration || 0} hours
                        </span>

                        <span>
                          ✓ {course.passingPercentage || 70}% pass
                        </span>

                      </div>

                    </div>

                    <div className="course-arrow">
                      →
                    </div>

                  </article>
                ))}

              </div>
            )}

        </section>

        {/* JOURNEY */}

        <section className="journey-strip">

          <div className="journey-title">
            <span>YOUR PATH</span>
            <h2>
              Learn → Practice → Prove
            </h2>
          </div>

          <div className="journey-items">

            <JourneyItem
              number="01"
              title="Learn"
              text="Understand the fundamentals."
            />

            <div className="journey-arrow">→</div>

            <JourneyItem
              number="02"
              title="Practice"
              text="Apply what you learned."
            />

            <div className="journey-arrow">→</div>

            <JourneyItem
              number="03"
              title="Prove"
              text="Pass your assessments."
            />

            <div className="journey-arrow">→</div>

            <JourneyItem
              number="04"
              title="Achieve"
              text="Earn your certificate."
            />

          </div>

        </section>

      </main>
    </div>
  );
};

const JourneyItem = ({ number, title, text }) => (
  <div className="journey-item">
    <span>{number}</span>
    <strong>{title}</strong>
    <p>{text}</p>
  </div>
);

const styles = `
* {
  box-sizing: border-box;
}

.language-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at 15% 5%, rgba(99,102,241,.18), transparent 28%),
    radial-gradient(circle at 85% 20%, rgba(124,58,237,.12), transparent 30%),
    #020617;
  color: #f8fafc;
  overflow: hidden;
}

.bg-orb {
  position: fixed;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  filter: blur(120px);
  opacity: .12;
  pointer-events: none;
}

.orb-a {
  background: #6366f1;
  left: -220px;
  top: 350px;
}

.orb-b {
  background: #7c3aed;
  right: -220px;
  bottom: 100px;
}

.language-nav {
  width: min(1300px, 92%);
  height: 78px;
  margin: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255,255,255,.06);
}

.back-button,
.nav-dashboard {
  border: 1px solid rgba(255,255,255,.08);
  background: rgba(255,255,255,.035);
  color: #94a3b8;
  padding: 10px 14px;
  border-radius: 9px;
  cursor: pointer;
  font-size: 10px;
}

.language-brand {
  display: flex;
  flex-direction: column;
  text-align: center;
}

.language-brand span {
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 4px;
}

.language-brand small {
  color: #475569;
  font-size: 7px;
  letter-spacing: 2px;
  margin-top: 4px;
}

.language-hero {
  width: min(1300px, 92%);
  min-height: 540px;
  margin: auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 40px;
}

.hero-label,
.section-label {
  color: #818cf8;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 2px;
}

.hero-label span {
  display: inline-block;
  width: 5px;
  height: 5px;
  background: #818cf8;
  border-radius: 50%;
  margin-right: 8px;
  box-shadow: 0 0 12px #818cf8;
}

.hero-copy h1 {
  margin: 22px 0;
  font-size: clamp(45px, 5vw, 72px);
  line-height: 1;
  letter-spacing: -3px;
}

.hero-copy h1 strong {
  color: #818cf8;
}

.hero-copy p {
  max-width: 570px;
  color: #64748b;
  font-size: 13px;
  line-height: 1.8;
}

.hero-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 28px;
}

.hero-pills span {
  padding: 8px 10px;
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 7px;
  background: rgba(255,255,255,.025);
  color: #94a3b8;
  font-size: 8px;
}

.language-orbit {
  position: relative;
  height: 470px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.orbit-ring {
  position: absolute;
  border: 1px solid rgba(129,140,248,.14);
  border-radius: 50%;
}

.ring-1 {
  width: 230px;
  height: 230px;
}

.ring-2 {
  width: 350px;
  height: 160px;
  transform: rotate(-25deg);
}

.ring-3 {
  width: 450px;
  height: 230px;
  transform: rotate(25deg);
  border-style: dashed;
}

.language-core {
  width: 190px;
  height: 190px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(circle at 40% 25%, rgba(99,102,241,.3), transparent 60%),
    #080f24;
  border: 1px solid rgba(129,140,248,.5);
  box-shadow: 0 0 80px rgba(99,102,241,.16);
}

.core-small {
  color: #64748b;
  font-size: 7px;
  letter-spacing: 3px;
}

.language-core strong {
  margin: 13px 0 5px;
  color: #a5b4fc;
  font-size: 29px;
}

.language-core small {
  color: #475569;
  font-size: 7px;
}

.orbit-chip {
  position: absolute;
  padding: 8px 10px;
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 8px;
  background: rgba(8,15,36,.8);
  backdrop-filter: blur(15px);
  color: #cbd5e1;
  font-size: 8px;
}

.chip-top {
  top: 65px;
  right: 90px;
}

.chip-left {
  bottom: 90px;
  left: 60px;
}

.chip-right {
  bottom: 125px;
  right: 40px;
}

.courses-section {
  width: min(1150px, 90%);
  margin: auto;
  padding: 70px 0 100px;
}

.section-header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  margin-bottom: 30px;
}

.section-header h2 {
  margin: 12px 0 7px;
  font-size: 34px;
  letter-spacing: -1.5px;
}

.section-header p {
  color: #64748b;
  font-size: 10px;
}

.course-counter {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.course-counter strong {
  font-size: 30px;
  color: #a5b4fc;
}

.course-counter span {
  color: #475569;
  font-size: 8px;
}

.course-grid {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.course-card {
  position: relative;
  min-height: 190px;
  display: grid;
  grid-template-columns: 70px 1fr 50px;
  align-items: center;
  gap: 25px;
  padding: 28px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 18px;
  background: linear-gradient(110deg, rgba(15,23,42,.95), rgba(8,15,36,.8));
  cursor: pointer;
  transition: .3s;
}

.course-card:hover {
  transform: translateY(-4px);
  border-color: rgba(129,140,248,.35);
  box-shadow: 0 30px 70px rgba(0,0,0,.3);
}

.course-glow {
  position: absolute;
  width: 300px;
  height: 300px;
  left: -180px;
  top: -80px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(99,102,241,.15), transparent 65%);
}

.course-number {
  color: #334155;
  font-size: 10px;
  font-weight: 800;
  z-index: 1;
}

.course-icon {
  position: absolute;
  left: 55px;
  width: 58px;
  height: 58px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background: linear-gradient(135deg, #6366f1, #7c3aed);
  font-weight: 900;
  font-size: 12px;
  box-shadow: 0 15px 35px rgba(99,102,241,.2);
}

.course-content {
  padding-left: 45px;
  z-index: 1;
}

.course-top {
  display: flex;
  gap: 7px;
}

.course-top span {
  padding: 5px 7px;
  border-radius: 5px;
  background: rgba(99,102,241,.08);
  color: #818cf8;
  font-size: 7px;
}

.course-content h3 {
  margin: 14px 0 7px;
  font-size: 22px;
}

.course-content p {
  max-width: 700px;
  margin: 0;
  color: #64748b;
  font-size: 9px;
  line-height: 1.7;
}

.course-meta {
  display: flex;
  gap: 16px;
  margin-top: 18px;
  color: #475569;
  font-size: 8px;
}

.course-arrow {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 11px;
  background: rgba(99,102,241,.08);
  color: #a5b4fc;
  font-size: 17px;
  z-index: 1;
}

.loading-state,
.empty-state,
.error-state {
  min-height: 250px;
  border: 1px dashed rgba(255,255,255,.08);
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.spinner {
  width: 38px;
  height: 38px;
  border: 2px solid rgba(255,255,255,.08);
  border-top-color: #818cf8;
  border-radius: 50%;
  animation: spin .8s linear infinite;
}

.loading-state p,
.empty-state p,
.error-state p {
  color: #475569;
  font-size: 9px;
}

.empty-icon,
.error-symbol {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: rgba(99,102,241,.08);
  color: #818cf8;
  font-size: 22px;
}

.error-state h3,
.empty-state h3 {
  margin: 14px 0 5px;
  font-size: 13px;
}

.error-state button {
  padding: 9px 15px;
  border: none;
  border-radius: 8px;
  background: #6366f1;
  color: white;
  cursor: pointer;
  font-size: 9px;
}

.journey-strip {
  width: min(1150px, 90%);
  margin: auto;
  padding: 40px;
  border-top: 1px solid rgba(255,255,255,.06);
  border-bottom: 1px solid rgba(255,255,255,.06);
  display: grid;
  grid-template-columns: .8fr 2fr;
  gap: 40px;
}

.journey-title span {
  color: #818cf8;
  font-size: 8px;
  letter-spacing: 2px;
}

.journey-title h2 {
  margin-top: 10px;
  font-size: 22px;
}

.journey-items {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.journey-item {
  max-width: 130px;
}

.journey-item span {
  color: #334155;
  font-size: 8px;
}

.journey-item strong {
  display: block;
  margin: 7px 0;
  font-size: 11px;
}

.journey-item p {
  margin: 0;
  color: #475569;
  font-size: 8px;
  line-height: 1.5;
}

.journey-arrow {
  color: #6366f1;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media(max-width: 850px) {
  .language-hero {
    grid-template-columns: 1fr;
    text-align: center;
    padding-top: 60px;
  }

  .hero-pills {
    justify-content: center;
  }

  .language-orbit {
    height: 400px;
  }

  .journey-strip {
    grid-template-columns: 1fr;
  }
}

@media(max-width: 600px) {
  .language-brand {
    display: none;
  }

  .language-hero h1 {
    font-size: 43px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .course-counter {
    margin-top: 15px;
    align-items: flex-start;
  }

  .course-card {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .course-icon {
    position: static;
    margin: auto;
  }

  .course-content {
    padding: 0;
  }

  .course-top,
  .course-meta {
    justify-content: center;
    flex-wrap: wrap;
  }

  .course-arrow {
    margin: auto;
  }

  .journey-items {
    flex-direction: column;
    align-items: flex-start;
    gap: 25px;
  }

  .journey-arrow {
    display: none;
  }
}
`;

export default CourseLanguage;