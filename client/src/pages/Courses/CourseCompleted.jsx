import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../services/api";

const CourseCompleted = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, [courseId]);

  const loadProgress = async () => {
    try {
      const response = await API.get(
        `/courses/${courseId}/progress`
      );

      setProgress(
        response.data?.progress ||
          response.data
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="completed-page">
        <style>{styles}</style>

        <div className="loading">
          <div className="spinner" />
          <p>Preparing your achievement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="completed-page">
      <style>{styles}</style>

      <div className="celebration glow-one" />
      <div className="celebration glow-two" />

      <header className="completed-header">
        <span>PREPPULSE</span>

        <button
          onClick={() =>
            navigate("/courses")
          }
        >
          Learning Hub
        </button>
      </header>

      <main className="completion-main">

        <div className="achievement-orb">

          <div className="orb-ring ring-one" />
          <div className="orb-ring ring-two" />

          <div className="trophy">
            🏆
          </div>

        </div>

        <div className="completion-label">
          COURSE COMPLETED
        </div>

        <h1>
          You made it.
        </h1>

        <p className="completion-text">
          Congratulations! You successfully
          completed your learning journey and
          passed the final assessment.
        </p>

        <div className="completion-stats">

          <div>
            <strong>
              100%
            </strong>
            <span>
              Course Progress
            </span>
          </div>

          <div>
            <strong>
              {progress?.finalExamScore ||
                0}%
            </strong>
            <span>
              Final Score
            </span>
          </div>

          <div>
            <strong>
              ✓
            </strong>
            <span>
              Completed
            </span>
          </div>

        </div>

        <div className="achievement-card">

          <div className="achievement-icon">
            🎓
          </div>

          <div>
            <span>
              YOUR ACHIEVEMENT
            </span>

            <h2>
              Your certificate is ready.
            </h2>

            <p>
              Your verified PrepPulse certificate
              is now available to view, print and
              verify.
            </p>
          </div>

          <button
            onClick={() =>
              navigate(
                `/courses/${courseId}/certificate`
              )
            }
          >
            View Certificate →
          </button>

        </div>

        <div className="secondary-actions">

          <button
            onClick={() =>
              navigate(
                `/courses/${courseId}`
              )
            }
          >
            ← Course Overview
          </button>

          <button
            onClick={() =>
              navigate("/courses")
            }
          >
            Explore More Courses
          </button>

        </div>

      </main>
    </div>
  );
};

const styles = `
* {
  box-sizing: border-box;
}

.completed-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 15%,rgba(99,102,241,.18),transparent 35%),
    #020617;
  color: #f8fafc;
}

.celebration {
  position: absolute;
  width: 450px;
  height: 450px;
  border-radius: 50%;
  filter: blur(130px);
  opacity: .12;
  pointer-events: none;
}

.glow-one {
  background: #6366f1;
  left: -250px;
  top: 300px;
}

.glow-two {
  background: #7c3aed;
  right: -250px;
  top: 200px;
}

.completed-header {
  position: relative;
  z-index: 2;
  width: min(1100px,90%);
  height: 80px;
  margin: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255,255,255,.06);
}

.completed-header > span {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 4px;
  color: #a5b4fc;
}

.completed-header button {
  padding: 9px 13px;
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 8px;
  background: rgba(255,255,255,.03);
  color: #94a3b8;
  cursor: pointer;
  font-size: 9px;
}

.completion-main {
  position: relative;
  z-index: 2;
  width: min(850px,90%);
  margin: auto;
  padding: 80px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.achievement-orb {
  position: relative;
  width: 160px;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.orb-ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(129,140,248,.2);
}

.ring-one {
  inset: 0;
}

.ring-two {
  inset: -20px;
  border-style: dashed;
}

.trophy {
  width: 95px;
  height: 95px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background:
    radial-gradient(circle,rgba(129,140,248,.2),rgba(99,102,241,.05));
  border: 1px solid rgba(129,140,248,.3);
  font-size: 42px;
  box-shadow: 0 0 80px rgba(99,102,241,.2);
}

.completion-label {
  margin-top: 40px;
  color: #a5b4fc;
  font-size: 8px;
  letter-spacing: 3px;
}

.completion-main h1 {
  margin: 15px 0 10px;
  font-size: 65px;
  letter-spacing: -3px;
}

.completion-text {
  max-width: 550px;
  color: #64748b;
  font-size: 11px;
  line-height: 1.8;
}

.completion-stats {
  display: flex;
  gap: 60px;
  margin: 40px 0;
}

.completion-stats div {
  display: flex;
  flex-direction: column;
}

.completion-stats strong {
  color: #a5b4fc;
  font-size: 22px;
}

.completion-stats span {
  margin-top: 5px;
  color: #475569;
  font-size: 7px;
}

.achievement-card {
  width: 100%;
  display: flex;
  align-items: center;
  text-align: left;
  gap: 18px;
  padding: 24px;
  border: 1px solid rgba(129,140,248,.15);
  border-radius: 17px;
  background: linear-gradient(110deg,rgba(30,27,75,.45),rgba(8,15,36,.7));
}

.achievement-icon {
  width: 55px;
  height: 55px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 14px;
  background: rgba(99,102,241,.1);
  font-size: 23px;
}

.achievement-card > div:nth-child(2) {
  flex: 1;
}

.achievement-card span {
  color: #818cf8;
  font-size: 7px;
  letter-spacing: 2px;
}

.achievement-card h2 {
  margin: 8px 0 5px;
  font-size: 15px;
}

.achievement-card p {
  margin: 0;
  color: #475569;
  font-size: 8px;
  line-height: 1.6;
}

.achievement-card button {
  padding: 11px 14px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(110deg,#6366f1,#7c3aed);
  color: white;
  cursor: pointer;
  font-size: 8px;
}

.secondary-actions {
  display: flex;
  gap: 8px;
  margin-top: 20px;
}

.secondary-actions button {
  padding: 10px 13px;
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 8px;
  background: rgba(255,255,255,.03);
  color: #64748b;
  cursor: pointer;
  font-size: 8px;
}

.loading {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 2px solid rgba(255,255,255,.08);
  border-top-color: #818cf8;
  border-radius: 50%;
  animation: spin .8s linear infinite;
}

.loading p {
  color: #475569;
  font-size: 9px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media(max-width:600px) {
  .completion-main {
    padding-top: 60px;
  }

  .completion-main h1 {
    font-size: 48px;
  }

  .completion-stats {
    gap: 25px;
  }

  .achievement-card {
    flex-direction: column;
    text-align: center;
  }

  .achievement-card button {
    width: 100%;
  }

  .secondary-actions {
    flex-direction: column;
    width: 100%;
  }

  .secondary-actions button {
    width: 100%;
  }
}
`;

export default CourseCompleted;