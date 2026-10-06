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
const progressRoutes =
  require("./routes/progressRoutes");

const mockTestRoutes = require(
  "./routes/mockTestRoutes"
);
const mockInterviewRoutes = require(
  "./routes/mockInterviewRoutes"
);
console.log(
  "GEMINI KEY:",
  process.env.GEMINI_API_KEY
    ? "Loaded"
    : "Missing"
);
const healthRoutes = require("./routes/healthRoutes");
const resourceRoutes = require("./routes/resourceRoutes");
const leaderboardRoutes =
  require("./routes/leaderboardRoutes");
const habitRoutes =
  require("./routes/habitRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
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
app.use(
  "/api/mock-test",
  mockTestRoutes
);
app.use(
  "/api/mock-interview",
  mockInterviewRoutes
);
app.use(
  "/api/progress",
  progressRoutes
);
app.use("/api/notes", notesRoutes);
app.use("/api/youtube", youtubeRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/resources", resourceRoutes);
app.use(
  "/api/notifications",
  notificationRoutes
);

app.use(
  "/api/settings",
  settingsRoutes
);
app.use(
  "/api/leaderboard",
  leaderboardRoutes
);
app.use(
  "/api/habits",
  habitRoutes
);
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