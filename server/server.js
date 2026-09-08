const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");

const app = require("./app");
const connectDB = require("./config/db");

const resumeRoutes = require("./routes/resumeRoutes");
const chatRoutes = require("./routes/chatRoutes");
const authRoutes = require("./routes/authRoutes");
const notesRoutes = require("./routes/notesRoutes");
const youtubeRoutes = require("./routes/youtubeRoutes");
console.log(
  "GEMINI KEY:",
  process.env.GEMINI_API_KEY
    ? "Loaded"
    : "Missing"
);

// Middleware
app.use(cors());

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

// Routes
app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/resume",
  resumeRoutes
);

app.use(
  "/api/chat",
  chatRoutes
);
app.use("/api/notes", notesRoutes);
app.use("/api/youtube", youtubeRoutes);
const startServer = async () => {
  try {
    await connectDB();

    const PORT =
      process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(
        "\n================================="
      );
      console.log(
        "🚀 PrepPulse Backend Started"
      );
      console.log(
        `🌐 Port      : ${PORT}`
      );
      console.log(
        "💾 Database  : Connected"
      );
      console.log(
        "🤖 Gemini AI : Ready"
      );
      console.log(
        "🔐 Auth APIs : Ready"
      );
      console.log(
        "=================================\n"
      );
    });
  } catch (error) {
    console.error(
      "❌ Server Startup Failed:",
      error
    );
  }
};

startServer();