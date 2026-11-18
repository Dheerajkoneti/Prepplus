import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../services/api";

const TopicExam = () => {
  const { courseId, topicId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [topic, setTopic] = useState(null);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadExam();
  }, [topicId]);

  const loadExam = async () => {
    try {
      setLoading(true);

      const response = await API.get(
        `/exams/topic/${topicId}`
      );

      setQuestions(
        response.data?.questions || []
      );

      setTopic(
        response.data?.topic || null
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to load exam."
      );
    } finally {
      setLoading(false);
    }
  };

  const question = questions[current];

  const answeredCount = useMemo(
    () =>
      Object.keys(answers).filter(
        (key) => answers[key] !== undefined
      ).length,
    [answers]
  );

  const selectAnswer = (answer) => {
    if (!question) return;

    setAnswers((prev) => ({
      ...prev,
      [question._id]: answer,
    }));
  };

  const submitExam = async () => {
    if (submitting) return;

    const payload = {
      answers: questions.map((q) => ({
        questionId: q._id,
        answer: answers[q._id] || "",
      })),
    };

    try {
      setSubmitting(true);

      const response = await API.post(
        `/exams/topic/${topicId}/submit`,
        payload
      );

      setResult(
        response.data?.result ||
          response.data
      );
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Unable to submit exam."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="exam-page">
        <style>{styles}</style>

        <div className="exam-loading">
          <div className="spinner" />
          <h2>Preparing assessment...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="exam-page">
        <style>{styles}</style>

        <div className="exam-loading">
          <h2>Assessment unavailable</h2>
          <p>{error}</p>

          <button
            onClick={() =>
              navigate(
                `/courses/${courseId}`
              )
            }
          >
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  if (result) {
    const score =
      result.score ??
      result.percentage ??
      0;

    const passed =
      result.passed ??
      score >=
        (result.passingPercentage || 70);

    return (
      <div className="exam-page">
        <style>{styles}</style>

        <div className="result-screen">

          <div
            className={`result-orb ${
              passed ? "passed" : "failed"
            }`}
          >
            {passed ? "✓" : "×"}
          </div>

          <span className="result-label">
            {passed
              ? "ASSESSMENT PASSED"
              : "KEEP PRACTICING"}
          </span>

          <h1>
            {score}%
          </h1>

          <p>
            {passed
              ? "Excellent work. You have completed this topic and unlocked the next stage."
              : "You didn't reach the passing score yet. Review the lessons and try again."}
          </p>

          <div className="result-stats">

            <div>
              <strong>
                {result.correctAnswers || 0}
              </strong>
              <span>Correct</span>
            </div>

            <div>
              <strong>
                {result.totalQuestions ||
                  questions.length}
              </strong>
              <span>Questions</span>
            </div>

            <div>
              <strong>
                {result.passingPercentage ||
                  70}%
              </strong>
              <span>Required</span>
            </div>

          </div>

          <div className="result-actions">

            {passed ? (
              <button
                className="primary"
                onClick={() =>
                  navigate(
                    `/courses/${courseId}`
                  )
                }
              >
                Continue Learning →
              </button>
            ) : (
              <button
                className="primary"
                onClick={() => {
                  setResult(null);
                  setAnswers({});
                  setCurrent(0);
                }}
              >
                Try Again
              </button>
            )}

            <button
              onClick={() =>
                navigate(
                  `/courses/${courseId}`
                )
              }
            >
              Back to Course
            </button>

          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="exam-page">
      <style>{styles}</style>

      <header className="exam-header">

        <button
          onClick={() =>
            navigate(
              `/courses/${courseId}/topic/${topicId}`
            )
          }
        >
          ← Exit
        </button>

        <div>
          <span>TOPIC ASSESSMENT</span>
          <strong>
            {topic?.title || "Assessment"}
          </strong>
        </div>

        <div className="exam-counter">
          {current + 1} / {questions.length}
        </div>

      </header>

      <div className="exam-progress">
        <span
          style={{
            width: `${
              ((current + 1) /
                questions.length) *
              100
            }%`,
          }}
        />
      </div>

      <main className="exam-layout">

        <aside className="question-nav">

          <span>
            QUESTIONS
          </span>

          <div>
            {questions.map(
              (q, index) => (
                <button
                  key={q._id}
                  className={
                    index === current
                      ? "active"
                      : answers[q._id]
                      ? "answered"
                      : ""
                  }
                  onClick={() =>
                    setCurrent(index)
                  }
                >
                  {index + 1}
                </button>
              )
            )}
          </div>

          <p>
            {answeredCount} of{" "}
            {questions.length} answered
          </p>

        </aside>

        <section className="question-area">

          <div className="question-meta">
            QUESTION {current + 1}
          </div>

          <h1>
            {question?.question}
          </h1>

          <p className="question-hint">
            Select the best answer.
          </p>

          <div className="options">

            {question?.options?.map(
              (option, index) => {

                const selected =
                  answers[question._id] ===
                  option;

                return (
                  <button
                    key={option}
                    className={
                      selected
                        ? "option selected"
                        : "option"
                    }
                    onClick={() =>
                      selectAnswer(option)
                    }
                  >

                    <span>
                      {String.fromCharCode(
                        65 + index
                      )}
                    </span>

                    <strong>
                      {option}
                    </strong>

                    {selected && (
                      <b>✓</b>
                    )}

                  </button>
                );
              }
            )}

          </div>

          <div className="exam-actions">

            <button
              disabled={current === 0}
              onClick={() =>
                setCurrent(current - 1)
              }
            >
              ← Previous
            </button>

            {current <
            questions.length - 1 ? (
              <button
                className="primary"
                onClick={() =>
                  setCurrent(current + 1)
                }
              >
                Next →
              </button>
            ) : (
              <button
                className="primary"
                onClick={submitExam}
                disabled={submitting}
              >
                {submitting
                  ? "Submitting..."
                  : "Submit Assessment"}
              </button>
            )}

          </div>

        </section>

      </main>
    </div>
  );
};

const styles = `
* {
  box-sizing: border-box;
}

.exam-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at 50% 0%,rgba(99,102,241,.14),transparent 35%),
    #020617;
  color: #f8fafc;
}

.exam-header {
  width: min(1100px,92%);
  height: 80px;
  margin: auto;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: center;
  border-bottom: 1px solid rgba(255,255,255,.06);
}

.exam-header button {
  justify-self: start;
  padding: 9px 13px;
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 8px;
  background: rgba(255,255,255,.03);
  color: #94a3b8;
  cursor: pointer;
  font-size: 9px;
}

.exam-header > div:nth-child(2) {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.exam-header span {
  color: #818cf8;
  font-size: 7px;
  letter-spacing: 2px;
}

.exam-header strong {
  margin-top: 5px;
  font-size: 11px;
}

.exam-counter {
  justify-self: end;
  color: #64748b;
  font-size: 9px;
}

.exam-progress {
  width: min(1100px,92%);
  height: 3px;
  margin: auto;
  background: rgba(255,255,255,.05);
}

.exam-progress span {
  display: block;
  height: 100%;
  background: linear-gradient(90deg,#6366f1,#a78bfa);
}

.exam-layout {
  width: min(1100px,92%);
  margin: 45px auto;
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 60px;
}

.question-nav {
  height: fit-content;
  padding: 18px;
  border: 1px solid rgba(255,255,255,.06);
  border-radius: 15px;
  background: rgba(8,15,36,.6);
}

.question-nav > span {
  color: #818cf8;
  font-size: 7px;
  letter-spacing: 2px;
}

.question-nav > div {
  display: grid;
  grid-template-columns: repeat(4,1fr);
  gap: 6px;
  margin-top: 15px;
}

.question-nav button {
  height: 30px;
  border: 1px solid rgba(255,255,255,.06);
  border-radius: 7px;
  background: rgba(255,255,255,.025);
  color: #64748b;
  cursor: pointer;
  font-size: 8px;
}

.question-nav button.active {
  border-color: #6366f1;
  background: rgba(99,102,241,.15);
  color: #a5b4fc;
}

.question-nav button.answered {
  color: #34d399;
}

.question-nav p {
  color: #475569;
  font-size: 7px;
  line-height: 1.5;
}

.question-meta {
  color: #818cf8;
  font-size: 8px;
  letter-spacing: 2px;
}

.question-area h1 {
  max-width: 800px;
  margin: 18px 0 10px;
  font-size: 27px;
  line-height: 1.4;
}

.question-hint {
  color: #475569;
  font-size: 9px;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 30px;
}

.option {
  width: 100%;
  min-height: 65px;
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 14px;
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 12px;
  background: rgba(8,15,36,.55);
  color: white;
  text-align: left;
  cursor: pointer;
  transition: .2s;
}

.option:hover,
.option.selected {
  border-color: rgba(129,140,248,.45);
  background: rgba(99,102,241,.08);
}

.option > span {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 8px;
  background: rgba(255,255,255,.04);
  color: #64748b;
  font-size: 9px;
}

.option.selected > span {
  background: #6366f1;
  color: white;
}

.option strong {
  font-size: 10px;
  font-weight: 500;
}

.option b {
  margin-left: auto;
  color: #34d399;
}

.exam-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 25px;
}

.exam-actions button,
.result-actions button {
  padding: 11px 15px;
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 8px;
  background: rgba(255,255,255,.03);
  color: #94a3b8;
  cursor: pointer;
  font-size: 9px;
}

.exam-actions button:disabled {
  opacity: .3;
}

.primary {
  border: none !important;
  background: linear-gradient(110deg,#6366f1,#7c3aed) !important;
  color: white !important;
}

.exam-loading,
.result-screen {
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

.result-orb {
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 40px;
  margin-bottom: 25px;
}

.result-orb.passed {
  background: rgba(16,185,129,.1);
  border: 1px solid rgba(52,211,153,.3);
  color: #34d399;
  box-shadow: 0 0 70px rgba(16,185,129,.1);
}

.result-orb.failed {
  background: rgba(248,113,113,.1);
  border: 1px solid rgba(248,113,113,.3);
  color: #f87171;
}

.result-label {
  color: #818cf8;
  font-size: 8px;
  letter-spacing: 2px;
}

.result-screen h1 {
  margin: 12px 0;
  font-size: 65px;
}

.result-screen > p {
  max-width: 500px;
  color: #64748b;
  font-size: 10px;
  line-height: 1.7;
}

.result-stats {
  display: flex;
  gap: 35px;
  margin: 30px 0;
}

.result-stats div {
  display: flex;
  flex-direction: column;
}

.result-stats strong {
  font-size: 18px;
}

.result-stats span {
  margin-top: 4px;
  color: #475569;
  font-size: 7px;
}

.result-actions {
  display: flex;
  gap: 8px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media(max-width:750px) {
  .exam-layout {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .question-nav > div {
    display: flex;
    flex-wrap: wrap;
  }

  .question-nav button {
    width: 35px;
  }
}

@media(max-width:550px) {
  .exam-header {
    grid-template-columns: 1fr auto;
  }

  .exam-header > div:nth-child(2) {
    display: none;
  }

  .question-area h1 {
    font-size: 22px;
  }

  .result-screen h1 {
    font-size: 50px;
  }

  .result-stats {
    gap: 20px;
  }
}
`;

export default TopicExam;