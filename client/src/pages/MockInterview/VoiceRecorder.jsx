import { useState } from "react";
import { motion } from "framer-motion";

function VoiceRecorder({ setAnswer }) {
  const [listening, setListening] = useState(false);

  const startRecording = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      // Append transcript smoothly to existing answer text
      setAnswer((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
  };

  return (
    <div style={styles.wrapper}>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={startRecording}
        style={{
          ...styles.button,
          background: listening
            ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
            : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          boxShadow: listening
            ? "0 0 20px rgba(239, 68, 68, 0.4)"
            : "0 4px 15px rgba(16, 185, 129, 0.3)",
        }}
      >
        {listening ? (
          <>
            <motion.span
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              style={styles.pulsingDot}
            />
            Listening...
          </>
        ) : (
          <>🎤 Voice Record</>
        )}
      </motion.button>

      {listening && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={styles.statusHint}
        >
          Speak clearly into your microphone...
        </motion.span>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },
  button: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "white",
    border: "none",
    padding: "10px 18px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.85rem",
    fontFamily: "system-ui, sans-serif",
    transition: "all 0.2s ease",
  },
  pulsingDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "white",
    display: "inline-block",
  },
  statusHint: {
    fontSize: "0.8rem",
    color: "#38bdf8",
    fontStyle: "italic",
    fontFamily: "system-ui, sans-serif",
  },
};

export default VoiceRecorder;