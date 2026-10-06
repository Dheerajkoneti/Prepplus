import { motion } from "framer-motion";

function AnalyticsPanel({ score }) {
  const percentage = Math.min(Math.max(score, 0), 100);

  // Helper for dynamic communication rating
  const getCommunicationRating = (val) => {
    if (val >= 80) return { label: "Excellent", color: "#22c55e", bg: "rgba(34, 197, 94, 0.15)" };
    if (val >= 50) return { label: "Good", color: "#38bdf8", bg: "rgba(56, 189, 248, 0.15)" };
    return { label: "Average", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)" };
  };

  // Helper for dynamic confidence rating
  const getConfidenceRating = (val) => {
    if (val >= 80) return { label: "High", color: "#22c55e", bg: "rgba(34, 197, 94, 0.15)" };
    if (val >= 50) return { label: "Medium", color: "#38bdf8", bg: "rgba(56, 189, 248, 0.15)" };
    return { label: "Low", color: "#ef4444", bg: "rgba(239, 68, 68, 0.15)" };
  };

  const comm = getCommunicationRating(percentage);
  const conf = getConfidenceRating(percentage);

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h3 style={styles.title}>📊 Performance Analytics</h3>
        <span style={styles.badge}>Live</span>
      </div>

      {/* Technical Score Section */}
      <div style={styles.metricGroup}>
        <div style={styles.labelRow}>
          <span style={styles.label}>Technical Score</span>
          <span style={styles.scoreValue}>{percentage}%</span>
        </div>
        <div style={styles.progressBarBg}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={styles.progressBarFill}
          />
        </div>
      </div>

      {/* Metrics Badges Grid */}
      <div style={styles.grid}>
        {/* Communication */}
        <div style={styles.metricBox}>
          <span style={styles.subLabel}>Communication</span>
          <div
            style={{
              ...styles.statusPill,
              color: comm.color,
              backgroundColor: comm.bg,
              border: `1px solid ${comm.color}40`,
            }}
          >
            {comm.label}
          </div>
        </div>

        {/* Confidence */}
        <div style={styles.metricBox}>
          <span style={styles.subLabel}>Confidence</span>
          <div
            style={{
              ...styles.statusPill,
              color: conf.color,
              backgroundColor: conf.bg,
              border: `1px solid ${conf.color}40`,
            }}
          >
            {conf.label}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
    padding: "24px",
    borderRadius: "20px",
    border: "1px solid rgba(56, 189, 248, 0.15)",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
    fontFamily: "system-ui, sans-serif",
    maxWidth: "360px",
    width: "100%",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  title: {
    margin: 0,
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#f8fafc",
  },
  badge: {
    fontSize: "0.75rem",
    fontWeight: "600",
    color: "#38bdf8",
    background: "rgba(56, 189, 248, 0.1)",
    padding: "4px 8px",
    borderRadius: "6px",
    border: "1px solid rgba(56, 189, 248, 0.2)",
  },
  metricGroup: {
    marginBottom: "20px",
  },
  labelRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px",
  },
  label: {
    fontSize: "0.9rem",
    color: "#94a3b8",
    fontWeight: "500",
  },
  scoreValue: {
    fontSize: "0.95rem",
    color: "#38bdf8",
    fontWeight: "700",
  },
  progressBarBg: {
    width: "100%",
    height: "8px",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: "4px",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    background: "linear-gradient(90deg, #38bdf8, #818cf8)",
    borderRadius: "4px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  metricBox: {
    background: "rgba(255, 255, 255, 0.02)",
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  subLabel: {
    fontSize: "0.8rem",
    color: "#94a3b8",
  },
  statusPill: {
    alignSelf: "flex-start",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "0.85rem",
    fontWeight: "600",
  },
};

export default AnalyticsPanel;