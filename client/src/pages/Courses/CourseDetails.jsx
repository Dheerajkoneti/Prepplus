import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../services/api";

const CourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCourseDetails();
  }, [courseId]);

  const loadCourseDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get(`/courses/${courseId}`);
      setCourse(response.data?.course || response.data);
      setProgress(response.data?.progress || null);
      setEnrolled(Boolean(response.data?.progress || response.data?.enrolled));
    } catch (err) {
      console.error("Load course details error:", err);
      setError(
        err.response?.data?.message || "Unable to load course details."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      const response = await API.post(`/courses/${courseId}/enroll`);
      if (response.data?.success) {
        setEnrolled(true);
        loadCourseDetails();
      }
    } catch (err) {
      console.error("Enrollment error:", err);
      alert(err.response?.data?.message || "Failed to enroll in course.");
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="course-details-page">
        <style>{styles}</style>
        <div className="center-loading">
          <div className="spinner" />
          <p>Loading course curriculum...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="course-details-page">
        <style>{styles}</style>
        <div className="center-loading">
          <h2>Course unavailable</h2>
          <p>{error || "Course not found."}</p>
          <button onClick={() => navigate("/courses")}>Back to Courses</button>
        </div>
      </div>
    );
  }

  const completedTopicsList = progress?.completedTopics || [];

  return (
    <div className="course-details-page">
      <style>{styles}</style>

      <div className="glow-bg glow-1" />
      <div className="glow-bg glow-2" />

      {/* NAVBAR */}
      <header className="details-nav">
        <button onClick={() => navigate("/courses")} className="back-btn">
          ← Back to Hub
        </button>
        <div className="nav-brand">
          <span>PREPPULSE</span>
          <small>CURRICULUM</small>
        </div>
        <button onClick={() => navigate("/dashboard")} className="dashboard-btn">
          Dashboard ↗
        </button>
      </header>

      {/* HERO SECTION */}
      <main className="details-container">
        <section className="course-hero-card">
          <div className="hero-badge-row">
            <span className="pill language">{course.language}</span>
            <span className="pill level">{course.level || "Beginner"}</span>
            <span className="pill duration">⏱ {course.duration || 0} hrs</span>
          </div>

          <h1>{course.title}</h1>
          <p>{course.description || "Comprehensive structured learning path designed for mastery."}</p>

          <div className="hero-action-row">
            {enrolled ? (
              <div className="enrolled-status-box">
                <div className="status-indicator">
                  <span className="dot" /> Enrolled & Active
                </div>
                {progress?.progressPercentage > 0 && (
                  <span className="progress-text">
                    Progress: {progress.progressPercentage}%
                  </span>
                )}
              </div>
            ) : (
              <button
                className="enroll-btn"
                onClick={handleEnroll}
                disabled={enrolling}
              >
                {enrolling ? "Enrolling..." : "Enroll in Course Free →"}
              </button>
            )}

            <div className="passing-badge">
              <span>Passing Score</span>
              <strong>{course.passingPercentage || 70}%</strong>
            </div>
          </div>
        </section>

        {/* CURRICULUM TOPICS */}
        <section className="curriculum-section">
          <div className="curriculum-heading">
            <div>
              <span className="section-eyebrow">CURRICULUM</span>
              <h2>Course Topics & Lessons</h2>
            </div>
            <span className="topic-count">{course.topics?.length || 0} Topics</span>
          </div>

          <div className="topics-list">
            {course.topics && course.topics.length > 0 ? (
              course.topics.map((topic, tIdx) => {
                const prevTopicId = tIdx > 0 ? course.topics[tIdx - 1]._id : null;
                const isPreviousCompleted = tIdx === 0 || completedTopicsList.includes(prevTopicId) || progress?.progressPercentage >= Math.round((tIdx / course.topics.length) * 100);
                const isTopicCompleted = completedTopicsList.includes(topic._id);

                return (
                  <div key={topic._id || tIdx} className={`topic-card ${!isPreviousCompleted ? "locked" : ""}`}>
                    <div className="topic-header">
                      <span className="topic-num">{String(tIdx + 1).padStart(2, "0")}</span>
                      <div>
                        <h3>{topic.title}</h3>
                        <p>{topic.description || "Structured topic lessons and assessment."}</p>
                      </div>
                      
                      {enrolled ? (
                        isPreviousCompleted ? (
                          <button
                            className={`start-topic-btn ${isTopicCompleted ? "completed" : ""}`}
                            onClick={() =>
                              navigate(`/courses/${courseId}/topic/${topic._id}`)
                            }
                          >
                            {isTopicCompleted ? "Review Topic ✓" : "Start Topic →"}
                          </button>
                        ) : (
                          <button className="locked-topic-btn" disabled>
                            🔒 Locked
                          </button>
                        )
                      ) : (
                        <button
                          className="start-topic-btn"
                          onClick={() => alert("Please enroll in the course to unlock lessons.")}
                        >
                          Enroll to Unlock 🔒
                        </button>
                      )}
                    </div>

                    {topic.lessons && topic.lessons.length > 0 && (
                      <div className="lessons-sublist">
                        {topic.lessons.map((lesson, lIdx) => (
                          <div key={lesson._id || lIdx} className="lesson-item">
                            <span className="lesson-dot">▪</span>
                            <span className="lesson-title">{lesson.title}</span>
                            <span className="lesson-duration">{lesson.duration || 15} min</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="empty-topics">
                <p>No topics published for this course yet.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

const styles = `
.course-details-page {
  min-height: 100vh;
  background: radial-gradient(circle at 20% 10%, rgba(99,102,241,.15), transparent 30%), #020617;
  color: #f8fafc;
  padding-bottom: 80px;
  position: relative;
  overflow: hidden;
}
.glow-bg {
  position: fixed;
  width: 450px;
  height: 450px;
  border-radius: 50%;
  filter: blur(130px);
  opacity: .12;
  pointer-events: none;
}
.glow-1 { background: #6366f1; left: -200px; top: 100px; }
.glow-2 { background: #7c3aed; right: -200px; bottom: 100px; }
.details-nav {
  width: min(1200px, 92%);
  height: 78px;
  margin: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255,255,255,.06);
}
.back-btn, .dashboard-btn {
  padding: 9px 14px;
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 9px;
  background: rgba(255,255,255,.035);
  color: #94a3b8;
  cursor: pointer;
  font-size: 10px;
}
.nav-brand {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.nav-brand span { font-size: 12px; font-weight: 800; letter-spacing: 3px; color: #a5b4fc; }
.nav-brand small { font-size: 7px; color: #475569; letter-spacing: 2px; }
.details-container {
  width: min(1100px, 92%);
  margin: 50px auto 0;
}
.course-hero-card {
  padding: 45px;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(15,23,42,.95), rgba(8,15,36,.9));
  border: 1px solid rgba(129,140,248,.2);
  box-shadow: 0 30px 80px rgba(0,0,0,.3);
}
.hero-badge-row {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
.pill {
  padding: 6px 12px;
  border-radius: 7px;
  font-size: 8px;
  font-weight: 700;
}
.pill.language { background: rgba(99,102,241,.15); color: #a5b4fc; }
.pill.level { background: rgba(16,185,129,.12); color: #34d399; }
.pill.duration { background: rgba(244,114,182,.12); color: #f472b6; }
.course-hero-card h1 {
  font-size: 42px;
  margin: 0 0 15px;
  letter-spacing: -1px;
}
.course-hero-card p {
  color: #94a3b8;
  font-size: 12px;
  line-height: 1.8;
  max-width: 800px;
  margin: 0 0 35px;
}
.hero-action-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 20px;
  border-top: 1px solid rgba(255,255,255,.07);
  padding-top: 30px;
}
.enroll-btn {
  padding: 14px 28px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(110deg, #6366f1, #7c3aed);
  color: white;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 12px 35px rgba(99,102,241,.3);
}
.enrolled-status-box {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #34d399;
  font-size: 11px;
  font-weight: 700;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #34d399;
  box-shadow: 0 0 10px #34d399;
}
.progress-text { color: #64748b; font-size: 9px; }
.passing-badge {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
.passing-badge span { color: #475569; font-size: 7px; letter-spacing: 1px; }
.passing-badge strong { color: #cbd5e1; font-size: 16px; margin-top: 3px; }
.curriculum-section {
  margin-top: 60px;
}
.curriculum-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 25px;
}
.section-eyebrow { color: #818cf8; font-size: 8px; letter-spacing: 2px; font-weight: 800; }
.curriculum-heading h2 { margin: 8px 0 0; font-size: 26px; }
.topic-count { color: #475569; font-size: 9px; }
.topics-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.topic-card {
  padding: 25px;
  border-radius: 16px;
  background: rgba(8,15,36,.75);
  border: 1px solid rgba(255,255,255,.07);
  transition: .3s;
}
.topic-card.locked {
  opacity: 0.65;
  background: rgba(8,15,36,.4);
  border-color: rgba(255,255,255,.03);
}
.topic-header {
  display: flex;
  align-items: center;
  gap: 20px;
}
.topic-num {
  font-size: 16px;
  font-weight: 900;
  color: #334155;
}
.topic-header div { flex: 1; }
.topic-header h3 { margin: 0 0 5px; font-size: 18px; }
.topic-header p { margin: 0; color: #64748b; font-size: 9px; }
.start-topic-btn {
  padding: 10px 18px;
  border: 1px solid rgba(129,140,248,.3);
  border-radius: 9px;
  background: rgba(99,102,241,.1);
  color: #a5b4fc;
  font-size: 9px;
  font-weight: 700;
  cursor: pointer;
  transition: .2s;
}
.start-topic-btn:hover {
  background: rgba(99,102,241,.25);
}
.start-topic-btn.completed {
  border-color: rgba(16,185,129,.3);
  background: rgba(16,185,129,.1);
  color: #34d399;
}
.locked-topic-btn {
  padding: 10px 18px;
  border: 1px solid rgba(255,255,255,.06);
  border-radius: 9px;
  background: rgba(255,255,255,.02);
  color: #64748b;
  font-size: 9px;
  font-weight: 600;
  cursor: not-allowed;
}
.lessons-sublist {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid rgba(255,255,255,.05);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.lesson-item {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #94a3b8;
  font-size: 10px;
}
.lesson-dot { color: #6366f1; font-size: 8px; }
.lesson-duration { margin-left: auto; color: #475569; font-size: 8px; }
.center-loading {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}
.spinner {
  width: 40px;
  height: 40px;
  border: 2px solid rgba(255,255,255,.08);
  border-top-color: #818cf8;
  border-radius: 50%;
  animation: spin .8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
`;

export default CourseDetails;