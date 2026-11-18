import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../services/api";

const TopicLearning = () => {
  const { courseId, topicId } = useParams();
  const navigate = useNavigate();

  const [topic, setTopic] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [currentLessonIdx, setCurrentLessonIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadTopicData();
  }, [topicId]);

  const loadTopicData = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await API.get(`/topics/${topicId}`);
      const topicData = response.data?.topic || response.data;
      setTopic(topicData);
      setLessons(topicData?.lessons || []);
    } catch (err) {
      console.error("Failed to load topic lessons:", err);
      setError(err.response?.data?.message || "Unable to load topic content.");
    } finally {
      setLoading(false);
    }
  };

  const currentLesson = lessons[currentLessonIdx];

  const handleMarkComplete = async () => {
    if (!currentLesson) return;
    try {
      setCompleting(true);
      await API.post(`/lessons/${currentLesson._id || currentLesson.id}/complete`);
      
      const updated = [...lessons];
      updated[currentLessonIdx] = { ...currentLesson, completed: true };
      setLessons(updated);

      if (currentLessonIdx < lessons.length - 1) {
        setCurrentLessonIdx(currentLessonIdx + 1);
      } else {
        navigate(`/courses/${courseId}/topic/${topicId}/exam`);
      }
    } catch (err) {
      console.error("Failed to complete lesson:", err);
      alert(err.response?.data?.message || "Failed to mark lesson complete.");
    } finally {
      setCompleting(false);
    }
  };

  // Intelligent fallback code generator based on lesson title
  const getCodeForLesson = (lesson) => {
    if (!lesson) return "";
    if (lesson.codeSnippet) return lesson.codeSnippet;
    
    const title = (lesson.title || "").toLowerCase();
    if (title.includes("variable")) {
      return `public class VariablesDemo {
    public static void main(String[] args) {
        // Declaring and initializing variables in Java
        int age = 21;
        double salary = 45000.50;
        String name = "Dheeraj";
        boolean isEmployed = true;

        System.out.println("Developer: " + name);
        System.out.println("Age: " + age);
        System.out.println("Active Status: " + isEmployed);
    }
}`;
    } else if (title.includes("primitive") || title.includes("data type")) {
      return `public class PrimitiveTypesDemo {
    public static void main(String[] args) {
        // Integer types
        byte b = 100;
        short s = 10000;
        int id = 58429;
        long population = 8000000000L;

        // Floating-point & character types
        float temperature = 98.6f;
        double pi = 3.1415926535;
        char grade = 'A';
        boolean flag = true;

        System.out.println("ID: " + id + ", Grade: " + grade);
    }
}`;
    } else if (title.includes("cast") || title.includes("conversion")) {
      return `public class TypeCastingDemo {
    public static void main(String[] args) {
        // Widening Casting (Implicit: int to double)
        int num = 9;
        double convertedDouble = num; 

        // Narrowing Casting (Explicit: double to int)
        double price = 99.99;
        int truncatedPrice = (int) price; 

        System.out.println("Original int: " + num + " -> Double: " + convertedDouble);
        System.out.println("Original double: " + price + " -> Int: " + truncatedPrice);
    }
}`;
    } else {
      return `public class LessonExample {
    public static void main(String[] args) {
        // Practical implementation for: ${lesson.title}
        System.out.println("Executing lesson: ${lesson.title}");
        
        int status = 200;
        if(status == 200) {
            System.out.println("Execution successful!");
        }
    }
}`;
    }
  };

  const copyToClipboard = (codeText) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (loading) {
    return (
      <div className="topic-learning-page">
        <style>{styles}</style>
        <div className="center-loading">
          <div className="spinner" />
          <p>Loading lesson content & examples...</p>
        </div>
      </div>
    );
  }

  if (error || !topic || lessons.length === 0) {
    return (
      <div className="topic-learning-page">
        <style>{styles}</style>
        <div className="center-loading">
          <h2>Content unavailable</h2>
          <p>{error || "No lessons found for this topic."}</p>
          <button onClick={() => navigate(`/courses/${courseId}`)}>← Back to Course Curriculum</button>
        </div>
      </div>
    );
  }

  const completedCount = lessons.filter((l) => l.completed).length;
  const progressPercent = Math.round((completedCount / lessons.length) * 100);
  const activeCode = getCodeForLesson(currentLesson);

  return (
    <div className="topic-learning-page">
      <style>{styles}</style>

      {/* BACKGROUND GLOW */}
      <div className="glow-bg glow-1" />
      <div className="glow-bg glow-2" />

      {/* TOPBAR PROGRESS */}
      <header className="learning-topbar">
        <button onClick={() => navigate(`/courses/${courseId}`)} className="back-link">
          ← Back to Curriculum
        </button>
        <div className="topic-title-badge">
          <span>TOPIC</span>
          <strong>{topic.title}</strong>
        </div>
        <button onClick={() => navigate(`/courses/${courseId}/topic/${topicId}/exam`)} className="exam-shortcut-btn">
          Take Topic Exam ↗
        </button>
      </header>

      <div className="learning-container">
        {/* PROGRESS BAR CARD */}
        <div className="progress-overview-card">
          <div className="progress-info-row">
            <span>Topic Progress</span>
            <strong>{progressPercent}%</strong>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
          <p>{completedCount} of {lessons.length} lessons completed</p>
        </div>

        <div className="learning-layout">
          {/* LEFT LESSONS LIST */}
          <aside className="lessons-sidebar">
            <h3>Lessons</h3>
            <div className="lesson-nav-list">
              {lessons.map((lesson, idx) => (
                <button
                  key={lesson._id || idx}
                  className={`lesson-nav-item ${idx === currentLessonIdx ? "active" : ""} ${lesson.completed ? "completed" : ""}`}
                  onClick={() => setCurrentLessonIdx(idx)}
                >
                  <div className="lesson-item-left">
                    <span className="lesson-num">{idx + 1}.</span>
                    <div>
                      <span className="lesson-nav-title">{lesson.title}</span>
                      <small>{lesson.duration || 15} min</small>
                    </div>
                  </div>
                  {lesson.completed && <span className="check-icon">✓</span>}
                </button>
              ))}
            </div>
          </aside>

          {/* RIGHT LESSON CONTENT AREA */}
          <main className="lesson-content-pane">
            <div className="lesson-header-meta">
              <span>LESSON {currentLessonIdx + 1} / {lessons.length}</span>
              <span className="duration-pill">⏱ {currentLesson.duration || 15} min read</span>
            </div>

            <h2>{currentLesson.title}</h2>

            {/* LESSON DESCRIPTION */}
            <div className="lesson-text-body">
              <p>{currentLesson.content || currentLesson.description || "A variable is a named memory location used to store data during program execution. Every variable must be declared with a specific data type."}</p>
            </div>

            {/* CODE EXAMPLE CONTAINER */}
            <div className="code-example-container">
              <div className="code-box-header">
                <div className="code-dots">
                  <span className="dot red" />
                  <span className="dot yellow" />
                  <span className="dot green" />
                </div>
                <span className="code-filename">{currentLesson.codeFilename || "Main.java"}</span>
                <button
                  className="copy-code-btn"
                  onClick={() => copyToClipboard(activeCode)}
                >
                  {copiedCode ? "Copied! ✓" : "Copy Code"}
                </button>
              </div>
              <pre className="code-block">
                <code>{activeCode}</code>
              </pre>
            </div>

            {/* CALLOUT NOTE / KEY TAKEAWAYS */}
            <div className="callout-box">
              <div className="callout-icon">💡</div>
              <div>
                <strong>Key Takeaway & Best Practice</strong>
                <p>Always initialize your variables before use and choose meaningful descriptive names conforming to standard conventions.</p>
              </div>
            </div>

            {/* COMPLETE & NEXT BUTTON */}
            <div className="lesson-footer-action">
              <button
                className="complete-btn"
                onClick={handleMarkComplete}
                disabled={completing}
              >
                {completing ? "Saving Progress..." : currentLesson.completed ? "Completed ✓ (Next Lesson →)" : "✓ Mark Lesson Complete & Continue"}
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

const styles = `
.topic-learning-page {
  min-height: 100vh;
  background: radial-gradient(circle at 10% 10%, rgba(99,102,241,.12), transparent 35%), #020617;
  color: #f8fafc;
  padding-bottom: 80px;
  position: relative;
  overflow-x: hidden;
}
.glow-bg {
  position: fixed;
  width: 450px;
  height: 450px;
  border-radius: 50%;
  filter: blur(130px);
  opacity: .1;
  pointer-events: none;
}
.glow-1 { background: #6366f1; left: -200px; top: 50px; }
.glow-2 { background: #7c3aed; right: -200px; bottom: 50px; }

.learning-topbar {
  width: min(1300px, 94%);
  height: 78px;
  margin: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255,255,255,.07);
}
.back-link, .exam-shortcut-btn {
  padding: 9px 14px;
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 9px;
  background: rgba(255,255,255,.03);
  color: #94a3b8;
  cursor: pointer;
  font-size: 10px;
  font-weight: 600;
}
.exam-shortcut-btn {
  border-color: rgba(129,140,248,.3);
  background: rgba(99,102,241,.1);
  color: #a5b4fc;
}
.topic-title-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.topic-title-badge span { font-size: 7px; color: #6366f1; letter-spacing: 2px; font-weight: 800; }
.topic-title-badge strong { font-size: 13px; color: #f8fafc; margin-top: 2px; }

.learning-container {
  width: min(1300px, 94%);
  margin: 30px auto 0;
}

.progress-overview-card {
  padding: 22px 28px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(15,23,42,.9), rgba(8,15,36,.85));
  border: 1px solid rgba(129,140,248,.18);
  margin-bottom: 25px;
  box-shadow: 0 15px 40px rgba(0,0,0,.3);
}
.progress-info-row {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  font-weight: 700;
  margin-bottom: 10px;
}
.progress-track {
  width: 100%;
  height: 8px;
  border-radius: 6px;
  background: rgba(255,255,255,.06);
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #34d399);
  border-radius: 6px;
  transition: width .4s ease;
}
.progress-overview-card p {
  margin: 10px 0 0;
  color: #64748b;
  font-size: 9px;
}

.learning-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 25px;
}

.lessons-sidebar {
  padding: 22px;
  border-radius: 18px;
  background: rgba(8,15,36,.8);
  border: 1px solid rgba(255,255,255,.07);
  height: fit-content;
}
.lessons-sidebar h3 {
  margin: 0 0 16px;
  font-size: 13px;
  color: #cbd5e1;
  letter-spacing: .5px;
}
.lesson-nav-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.lesson-nav-item {
  width: 100%;
  padding: 14px;
  border: 1px solid rgba(255,255,255,.05);
  border-radius: 12px;
  background: rgba(255,255,255,.02);
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  text-align: left;
  transition: .2s;
}
.lesson-nav-item:hover {
  background: rgba(255,255,255,.05);
  color: #fff;
}
.lesson-nav-item.active {
  background: rgba(99,102,241,.15);
  border-color: rgba(129,140,248,.35);
  color: #f8fafc;
}
.lesson-nav-item.completed {
  border-color: rgba(16,185,129,.2);
}
.lesson-item-left {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
.lesson-num {
  font-weight: 800;
  color: #6366f1;
  font-size: 11px;
}
.lesson-nav-title {
  display: block;
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 2px;
}
.lesson-nav-item small {
  color: #64748b;
  font-size: 8px;
}
.check-icon {
  color: #34d399;
  font-weight: 900;
  font-size: 12px;
}

.lesson-content-pane {
  padding: 35px;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(15,23,42,.95), rgba(8,15,36,.9));
  border: 1px solid rgba(129,140,248,.2);
  box-shadow: 0 25px 60px rgba(0,0,0,.3);
}
.lesson-header-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  font-size: 9px;
  color: #818cf8;
  font-weight: 800;
  letter-spacing: 1px;
}
.duration-pill {
  padding: 4px 10px;
  border-radius: 6px;
  background: rgba(244,114,182,.12);
  color: #f472b6;
  font-weight: 700;
}
.lesson-content-pane h2 {
  font-size: 28px;
  margin: 0 0 20px;
  letter-spacing: -.5px;
}
.lesson-text-body p {
  color: #cbd5e1;
  font-size: 12px;
  line-height: 1.8;
  margin: 0 0 25px;
}

/* CODE EXAMPLE STYLING */
.code-example-container {
  margin: 30px 0;
  border-radius: 14px;
  border: 1px solid rgba(129,140,248,.25);
  background: #050b18;
  overflow: hidden;
  box-shadow: 0 15px 35px rgba(0,0,0,.4);
}
.code-box-header {
  padding: 12px 18px;
  background: rgba(255,255,255,.03);
  border-bottom: 1px solid rgba(255,255,255,.06);
  display: flex;
  align-items: center;
  gap: 12px;
}
.code-dots {
  display: flex;
  gap: 6px;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.dot.red { background: #ef4444; }
.dot.yellow { background: #f59e0b; }
.dot.green { background: #10b981; }
.code-filename {
  color: #94a3b8;
  font-size: 9.5px;
  font-family: monospace;
}
.copy-code-btn {
  margin-left: auto;
  padding: 5px 12px;
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 6px;
  background: rgba(255,255,255,.05);
  color: #cbd5e1;
  font-size: 8.5px;
  font-weight: 600;
  cursor: pointer;
  transition: .2s;
}
.copy-code-btn:hover {
  background: rgba(99,102,241,.2);
  color: #fff;
  border-color: rgba(129,140,248,.4);
}
.code-block {
  margin: 0;
  padding: 22px;
  overflow-x: auto;
  font-family: 'Fira Code', Consolas, Monaco, monospace;
  font-size: 11.5px;
  line-height: 1.7;
  color: #38bdf8;
}

/* CALLOUT BOX */
.callout-box {
  display: flex;
  gap: 16px;
  padding: 20px;
  border-radius: 12px;
  background: rgba(16,185,129,.08);
  border: 1px solid rgba(16,185,129,.25);
  margin: 25px 0;
}
.callout-icon {
  font-size: 20px;
}
.callout-box strong {
  display: block;
  color: #34d399;
  font-size: 11px;
  margin-bottom: 4px;
}
.callout-box p {
  margin: 0;
  color: #94a3b8;
  font-size: 10px;
  line-height: 1.6;
}

.lesson-footer-action {
  margin-top: 35px;
  padding-top: 25px;
  border-top: 1px solid rgba(255,255,255,.06);
  display: flex;
  justify-content: flex-end;
}
.complete-btn {
  padding: 14px 28px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(110deg, #6366f1, #7c3aed);
  color: white;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 10px 30px rgba(99,102,241,.35);
  transition: transform .2s;
}
.complete-btn:hover {
  transform: translateY(-2px);
}
.center-loading {
  min-height: 80vh;
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

@media (max-width: 900px) {
  .learning-layout { grid-template-columns: 1fr; }
}
`;

export default TopicLearning;