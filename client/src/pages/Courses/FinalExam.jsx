import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../services/api";

const FinalExam = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [course, setCourse] = useState(null);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    loadExam();
  }, [courseId]);

  const loadExam = async () => {
    try {
      setLoading(true);

      const response = await API.get(
        `/exams/final/${courseId}`
      );

      setQuestions(
        response.data?.questions || []
      );

      setCourse(
        response.data?.course || null
      );
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Unable to load final exam."
      );
    } finally {
      setLoading(false);
    }
  };

  const question = questions[current];

  const submit = async () => {
    try {
      setSubmitting(true);

      const response = await API.post(
        `/exams/final/${courseId}/submit`,
        {
          answers: questions.map((q) => ({
            questionId: q._id,
            answer: answers[q._id] || "",
          })),
        }
      );

      setResult(
        response.data?.result ||
          response.data
      );
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Unable to submit final exam."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="final-page">
        <style>{styles}</style>

        <div className="center">
          <div className="spinner" />
          <h2>Preparing your final assessment...</h2>
          <p>This is your final step.</p>
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
      <div className="final-page">
        <style>{styles}</style>

        <div className="graduation-result">

          <div className="graduation-symbol">
            {passed ? "🏆" : "↻"}
          </div>

          <span>
            {passed
              ? "COURSE COMPLETED"
              : "FINAL EXAM RESULT"}
          </span>

          <h1>
            {score}%
          </h1>

          <h2>
            {passed
              ? "You made it."
              : "Almost there."}
          </h2>

          <p>
            {passed
              ? "You successfully completed the final assessment. Your PrepPulse certificate is now available."
              : "Review your course material and attempt the final assessment again."}
          </p>

          <div className="final-actions">

            {passed ? (
              <button
                onClick={() =>
                  navigate(
                    `/courses/${courseId}/completed`
                  )
                }
              >
                View Completion →
              </button>
            ) : (
              <button
                onClick={() => {
                  setResult(null);
                  setAnswers({});
                  setCurrent(0);
                }}
              >
                Try Final Exam Again
              </button>
            )}

          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="final-page">
      <style>{styles}</style>

      <header className="final-header">

        <button
          onClick={() =>
            navigate(
              `/courses/${courseId}`
            )
          }
        >
          ← Exit
        </button>

        <div className="graduation-title">
          <span>FINAL ASSESSMENT</span>
          <strong>
            {course?.title || "Course Final Exam"}
          </strong>
        </div>

        <div>
          {current + 1} / {questions.length}
        </div>

      </header>

      <div className="final-progress">
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

      <main className="final-content">

        <div className="final-badge">
          FINAL EXAM
        </div>

        <h1>
          Prove what you learned.
        </h1>

        <p className="final-description">
          This assessment covers the concepts
          from your complete learning journey.
        </p>

        <div className="final-question">

          <span>
            QUESTION {current + 1}
          </span>

          <h2>
            {question?.question}
          </h2>

          <div className="final-options">

            {question?.options?.map(
              (option, index) => (
                <button
                  key={option}
                  className={
                    answers[question._id] ===
                    option
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    setAnswers((prev) => ({
                      ...prev,
                      [question._id]:
                        option,
                    }))
                  }
                >
                  <span>
                    {String.fromCharCode(
                      65 + index
                    )}
                  </span>

                  {option}

                </button>
              )
            )}

          </div>

        </div>

        <div className="final-navigation">

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
              className="next"
              onClick={() =>
                setCurrent(current + 1)
              }
            >
              Next →
            </button>
          ) : (
            <button
              className="submit"
              onClick={submit}
              disabled={submitting}
            >
              {submitting
                ? "Submitting..."
                : "Finish Final Exam"}
            </button>
          )}

        </div>

      </main>
    </div>
  );
};

const styles = `
* {
  box-sizing: border-box;
}

.final-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at 50% 0%,rgba(124,58,237,.18),transparent 35%),
    #020617;
  color: #f8fafc;
}

.final-header {
  width: min(1100px,92%);
  height: 80px;
  margin: auto;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: center;
  border-bottom: 1px solid rgba(255,255,255,.06);
}

.final-header button {
  justify-self: start;
  padding: 9px 13px;
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 8px;
  background: rgba(255,255,255,.03);
  color: #94a3b8;
  font-size: 9px;
  cursor: pointer;
}

.final-header > div:last-child {
  justify-self: end;
  color: #64748b;
  font-size: 9px;
}

.graduation-title {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.graduation-title span {
  color: #a78bfa;
  font-size: 7px;
  letter-spacing: 2px;
}

.graduation-title strong {
  margin-top: 5px;
  font-size: 11px;
}

.final-progress {
  width: min(1100px,92%);
  height: 3px;
  margin: auto;
  background: rgba(255,255,255,.05);
}

.final-progress span {
  display: block;
  height: 100%;
  background: linear-gradient(90deg,#6366f1,#a78bfa);
}

.final-content {
  width: min(800px,90%);
  margin: 80px auto;
}

.final-badge {
  display: inline-block;
  padding: 7px 9px;
  border-radius: 6px;
  background: rgba(99,102,241,.1);
  color: #a5b4fc;
  font-size: 7px;
  letter-spacing: 2px;
}

.final-content > h1 {
  margin: 18px 0 8px;
  font-size: 43px;
  letter-spacing: -2px;
}

.final-description {
  color: #64748b;
  font-size: 11px;
}

.final-question {
  margin-top: 45px;
}

.final-question > span {
  color: #818cf8;
  font-size: 8px;
  letter-spacing: 2px;
}

.final-question h2 {
  margin: 15px 0 25px;
  font-size: 23px;
  line-height: 1.5;
}

.final-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.final-options button {
  min-height: 60px;
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px;
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 11px;
  background: rgba(8,15,36,.7);
  color: #cbd5e1;
  text-align: left;
  cursor: pointer;
  font-size: 10px;
}

.final-options button:hover,
.final-options button.selected {
  border-color: rgba(129,140,248,.45);
  background: rgba(99,102,241,.08);
}

.final-options span {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 8px;
  background: rgba(255,255,255,.04);
  color: #64748b;
}

.final-options button.selected span {
  background: #6366f1;
  color: white;
}

.final-navigation {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
}

.final-navigation button,
.final-actions button {
  padding: 11px 16px;
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 8px;
  background: rgba(255,255,255,.03);
  color: #94a3b8;
  cursor: pointer;
  font-size: 9px;
}

.final-navigation button:disabled {
  opacity: .3;
}

.final-navigation .next,
.final-navigation .submit,
.final-actions button {
  border: none;
  background: linear-gradient(110deg,#6366f1,#7c3aed);
  color: white;
}

.center,
.graduation-result {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.spinner {
  width: 42px;
  height: 42px;
  border: 2px solid rgba(255,255,255,.08);
  border-top-color: #a78bfa;
  border-radius: 50%;
  animation: spin .8s linear infinite;
}

.graduation-symbol {
  width: 110px;
  height: 110px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(99,102,241,.08);
  border: 1px solid rgba(129,140,248,.25);
  font-size: 45px;
  box-shadow: 0 0 90px rgba(99,102,241,.13);
}

.graduation-result > span {
  margin-top: 25px;
  color: #a78bfa;
  font-size: 8px;
  letter-spacing: 3px;
}

.graduation-result h1 {
  margin: 10px 0 0;
  font-size: 75px;
}

.graduation-result h2 {
  margin: 0;
  font-size: 25px;
}

.graduation-result p {
  max-width: 500px;
  color: #64748b;
  font-size: 10px;
  line-height: 1.7;
}

.final-actions {
  margin-top: 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media(max-width:600px) {
  .final-header {
    grid-template-columns: 1fr auto;
  }

  .graduation-title {
    display: none;
  }

  .final-content {
    margin-top: 50px;
  }

  .final-content > h1 {
    font-size: 35px;
  }

  .graduation-result h1 {
    font-size: 55px;
  }
}
`;

export default FinalExam;