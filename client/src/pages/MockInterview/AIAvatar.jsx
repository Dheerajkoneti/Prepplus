import { motion } from "framer-motion";

function AIAvatar({ speaking }) {
  return (
    <div style={styles.container}>
      {/* Outer Glowing Wave Ring (Active when speaking) */}
      <motion.div
        animate={
          speaking
            ? {
                scale: [1, 1.25, 1],
                opacity: [0.4, 0.8, 0.4],
              }
            : {
                scale: [1, 1.05, 1],
                opacity: [0.2, 0.4, 0.2],
              }
        }
        transition={{
          repeat: Infinity,
          duration: speaking ? 0.8 : 3,
          ease: "easeInOut",
        }}
        style={styles.waveRing}
      />

      {/* Main Avatar Wrapper */}
      <motion.div
        animate={
          speaking
            ? {
                y: [0, -6, 0],
                scale: [1, 1.03, 1],
              }
            : {
                y: [0, -4, 0],
              }
        }
        transition={{
          repeat: Infinity,
          duration: speaking ? 0.6 : 4,
          ease: "easeInOut",
        }}
        style={styles.avatarWrapper}
      >
        <motion.img
          src="https://cdn-icons-png.flaticon.com/512/4712/4712027.png"
          alt="AI Interviewer"
          animate={
            speaking
              ? {
                  rotate: [0, 1.5, -1.5, 0],
                }
              : {
                  rotate: 0,
                }
          }
          transition={{
            repeat: Infinity,
            duration: 0.4,
          }}
          style={styles.image}
        />
      </motion.div>

      {/* Title & Status Indicator */}
      <div style={styles.metaContainer}>
        <h3 style={styles.title}>AI Interviewer</h3>
        <div style={styles.statusRow}>
          <motion.span
            animate={{
              scale: speaking ? [1, 1.3, 1] : 1,
              backgroundColor: speaking ? "#22c55e" : "#94a3b8",
            }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            style={styles.statusDot}
          />
          <span style={styles.statusText}>
            {speaking ? "Listening / Speaking..." : "Ready"}
          </span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    padding: "24px",
  },
  waveRing: {
    position: "absolute",
    width: "190px",
    height: "190px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)",
    zIndex: 0,
    filter: "blur(12px)",
  },
  avatarWrapper: {
    position: "relative",
    zIndex: 1,
    padding: "4px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #38bdf8, #6366f1)",
    boxShadow: "0 10px 30px rgba(56, 189, 248, 0.3)",
  },
  image: {
    width: "160px",
    height: "160px",
    borderRadius: "50%",
    objectFit: "cover",
    backgroundColor: "#0f172a",
    display: "block",
  },
  metaContainer: {
    marginTop: "16px",
    textAlign: "center",
    zIndex: 1,
  },
  title: {
    margin: "0 0 6px 0",
    fontSize: "1.2rem",
    fontWeight: "600",
    color: "#f8fafc",
    fontFamily: "system-ui, sans-serif",
  },
  statusRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  statusDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    display: "inline-block",
  },
  statusText: {
    fontSize: "0.85rem",
    color: "#94a3b8",
    fontFamily: "system-ui, sans-serif",
  },
};

export default AIAvatar;