import { useState } from "react";
import { motion } from "framer-motion";

function QuestionPanel({
  question,
  answer,
  setAnswer,
  onSpeak,
  onSubmit,
  VoiceRecorderComponent,
}) {
  const [isEnhancing, setIsEnhancing] = useState(false);

  // Compute character & word counts
  const charCount = answer.length;
  const wordCount = answer.trim() === "" ? 0 : answer.trim().split(/\s+/).length;

  // Mock AI enhancement handler
  const handleEnhance = () => {
    if (!answer.trim()) return;
    setIsEnhancing(true);
    setTimeout(() => {
      setAnswer(
        (prev) =>
          `• Professional Structure:\n${prev}\n\n• Key Takeaway: Demonstrated strong technical clarity and structured problem-solving approach.`
      );
      setIsEnhancing(false);
    }, 600);
  };

  const handleClear = () => {
    setAnswer("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={styles.consoleCard}
    >
      {/* Question Header */}
      <div style={styles.questionHeaderBox}>
        <div style={styles.tagRow}>
          <span style={styles.questionTag}>Active Prompt</span>
          {onSpeak && (
            <button onClick={onSpeak} style={styles.speakIconButton} title="Listen to Question">
              🔊 Read Aloud
            </button>
          )}
        </div>
        <h2 style={styles.questionText}>
          {question || "Waiting for question to load..."}
        </h2>
      </div>

      {/* Textarea Workspace */}
      <div style={styles.workspace}>
        <div style={styles.workspaceToolbar}>
          <span style={styles.workspaceLabel}>Your Answer Workspace</span>
          <div style={styles.metricsBadge}>
            <span>{wordCount} words</span>
            <span>•</span>
            <span>{charCount} chars</span>
          </div>
        </div>

        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your structured answer here, use voice recording, or let AI enhance your draft..."
          style={styles.textarea}
        />

        {/* Toolbar Footer Actions */}
        <div style={styles.toolbarFooter}>
          <div style={styles.leftTools}>
            {VoiceRecorderComponent && <VoiceRecorderComponent setAnswer={setAnswer} />}

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleEnhance}
              disabled={isEnhancing || !answer.trim()}
              style={{
                ...styles.toolButton,
                opacity: !answer.trim() ? 0.5 : 1,
              }}
            >
              ✨ {isEnhancing ? "Refining..." : "Enhance with AI"}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleClear}
              disabled={!answer.trim()}
              style={{
                ...styles.clearButton,
                opacity: !answer.trim() ? 0.4 : 1,
              }}
            >
              Clear
            </motion.button>
          </div>

          {onSubmit && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onSubmit}
              style={styles.submitButton}
            >
              Submit Answer →
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

const styles = {
  consoleCard: {
    background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
    padding: "28px",
    borderRadius: "20px",
    border: "1px solid rgba(56, 189, 248, 0.15)",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    fontFamily: "system-ui, sans-serif",
    width: "100%",
  },
  questionHeaderBox: {
    background: "rgba(15, 23, 42, 0.6)",
    padding: "20px",
    borderRadius: "14px",
    border: "1px solid rgba(255, 255, 255, 0.05)",
  },
  tagRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },
  questionTag: {
    fontSize: "0.75rem",
    fontWeight: "600",
    color: "#38bdf8",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  speakIconButton: {
    background: "none",
    border: "none",
    color: "#94a3b8",
    fontSize: "0.8rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    transition: "color 0.2s",
  },
  questionText: {
    margin: 0,
    fontSize: "1.2rem",
    fontWeight: "600",
    lineHeight: "1.5",
    color: "#f8fafc",
  },
  workspace: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  workspaceToolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  workspaceLabel: {
    fontSize: "0.85rem",
    fontWeight: "600",
    color: "#94a3b8",
  },
  metricsBadge: {
    fontSize: "0.75rem",
    color: "#64748b",
    display: "flex",
    gap: "6px",
    alignItems: "center",
  },
  textarea: {
    width: "100%",
    height: "220px",
    padding: "16px",
    borderRadius: "14px",
    background: "rgba(15, 23, 42, 0.8)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    color: "white",
    fontSize: "0.95rem",
    outline: "none",
    resize: "vertical",
    fontFamily: "system-ui, sans-serif",
    lineHeight: "1.5",
  },
  toolbarFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "6px",
    flexWrap: "wrap",
    gap: "10px",
  },
  leftTools: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  toolButton: {
    padding: "10px 14px",
    borderRadius: "10px",
    background: "rgba(56, 189, 248, 0.1)",
    border: "1px solid rgba(56, 189, 248, 0.2)",
    color: "#38bdf8",
    fontSize: "0.85rem",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  clearButton: {
    padding: "10px 14px",
    borderRadius: "10px",
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.2)",
    color: "#ef4444",
    fontSize: "0.85rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  submitButton: {
    padding: "10px 20px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)",
    border: "none",
    color: "white",
    fontWeight: "600",
    fontSize: "0.9rem",
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(56, 189, 248, 0.25)",
    marginLeft: "auto",
  },
};

export default QuestionPanel;