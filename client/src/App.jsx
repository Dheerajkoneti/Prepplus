import { BrowserRouter, Routes, Route } from "react-router-dom";

// Landing & Auth
import Landing from "./pages/Landing/Landing";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";
import GoogleSuccess from "./pages/Auth/GoogleSuccess";
import ProtectedRoute from "./components/ProtectedRoute";

// Dashboard
import Dashboard from "./pages/Dashboard/Dashboard";

// Features
import Chatbot from "./pages/Chatbot/Chatbot";
import ResumeAnalyzer from "./pages/Resume/ResumeAnalyzer";
import Profile from "./pages/Profile/Profile";
import NotesGenerator from "./pages/Notes/NotesGenerator";
import SavedNotes from "./pages/Notes/SavedNotes";
import MindMapGenerator from "./pages/MindMap/MindMapGenerator";

// Future Pages
const Courses = () => (
  <h1 style={pageStyle}>📚 Courses Page</h1>
);

const Resources = () => (
  <h1 style={pageStyle}>📚 Resource Hub</h1>
);

const Progress = () => (
  <h1 style={pageStyle}>📈 Progress Analytics</h1>
);

const Habits = () => (
  <h1 style={pageStyle}>🔥 Habit Tracker</h1>
);

const Leaderboard = () => (
  <h1 style={pageStyle}>🏆 Leaderboard</h1>
);
const Settings = () => (
  <h1 style={pageStyle}>⚙️ Settings</h1>
);

const Notifications = () => (
  <h1 style={pageStyle}>🔔 Notifications</h1>
);

const ChatHistory = () => (
  <h1 style={pageStyle}>💬 Chat History</h1>
);

const ResourceModeration = () => (
  <h1 style={pageStyle}>
    🛡️ Resource Moderation
  </h1>
);

const RagIntegration = () => (
  <h1 style={pageStyle}>📑 RAG Integration</h1>
);

const pageStyle = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#08142d",
  color: "white",
  fontSize: "32px",
  fontWeight: "bold",
};

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Landing */}
        <Route
          path="/"
          element={<Landing />}
        />

        {/* Auth */}
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/reset-password/:token"
          element={<ResetPassword />}
        />
        <Route
          path="/profile"
          element={<Profile />}
        />

        <Route
          path="/google-success"
          element={<GoogleSuccess />}
        />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Features */}
        <Route
          path="/courses"
          element={<Courses />}
        />

        <Route
          path="/chatbot"
          element={<Chatbot />}
        />
        <Route
          path="/resume"
          element={<ResumeAnalyzer />}
        />
        <Route
          path="/resources"
          element={<Resources />}
        />

        <Route
          path="/progress"
          element={<Progress />}
        />

        <Route
          path="/habits"
          element={<Habits />}
        />

        <Route
          path="/leaderboard"
          element={<Leaderboard />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

        <Route
          path="/settings"
          element={<Settings />}
        />

        <Route
          path="/notifications"
          element={<Notifications />}
        />

        {/* Advanced */}
        <Route
          path="/chat-history"
          element={<ChatHistory />}
        />

        <Route
          path="/resource-moderation"
          element={<ResourceModeration />}
        />

        <Route
          path="/rag"
          element={<RagIntegration />}
        />
        <Route path="/notes" element={<NotesGenerator />} />
        <Route path="/saved-notes" element={<SavedNotes />} />
        <Route
          path="/mindmap"
          element={<MindMapGenerator />}
        />

        {/* 404 */}
        <Route
          path="*"
          element={
            <div
              style={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "#08142d",
                color: "white",
                fontSize: "40px",
                fontWeight: "bold",
              }}
            >
              404 - Page Not Found
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;