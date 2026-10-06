import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing/Landing";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";
import GoogleSuccess from "./pages/Auth/GoogleSuccess";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard/Dashboard";
import Chatbot from "./pages/Chatbot/Chatbot";
import ResumeAnalyzer from "./pages/Resume/ResumeAnalyzer";
import Profile from "./pages/Profile/Profile";
import NotesGenerator from "./pages/Notes/NotesGenerator";
import SavedNotes from "./pages/Notes/SavedNotes";
import MindMapGenerator from "./pages/MindMap/MindMapGenerator";
import MockInterview from "./pages/MockInterview/MockInterview";
import Results from "./pages/MockInterview/Results";
import ReportPage from "./pages/MockInterview/ReportPage";
import InterviewSetup from "./pages/MockInterview/InterviewSetup";
import InterviewCompleted from "./pages/MockInterview/InterviewCompleted";
import MockInterviewResult from "./pages/MockInterview/MockInterviewResult";
import MockTests from "./pages/mock-test/MockTests";
import TestDetails from "./pages/mock-test/TestDetails";
import TestSettings from "./pages/mock-test/TestSettings";
import TestGenerating from "./pages/mock-test/TestGenerating";
import MockTestSession from "./pages/mock-test/MockTestSession";
import MockTestResult from "./pages/mock-test/MockTestResult";
import MockTestHistory from "./pages/mock-test/MockTestHistory";
import Notifications from "./pages/Notifications/Notifications";
import Settings from "./pages/Settings/Settings";
import ProgressTracker from "./pages/Progress/ProgressTracker";
import ResourceHub from "./pages/Resources/ResourceHub";
import Leaderboard from "./pages/Leaderboard/Leaderboard";
import Habits from "./pages/Habits/HabitTracker";
function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen w-full bg-[#020617] text-white">

        <Routes>
          <Route
            path="/"
            element={<Landing />}
          />
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
            path="/google-success"
            element={<GoogleSuccess />}
          />

          {/* =================================================
              DASHBOARD
          ================================================= */}

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* =================================================
              CHATBOT
          ================================================= */}

          <Route
            path="/chatbot"
            element={
              <ProtectedRoute>
                <Chatbot />
              </ProtectedRoute>
            }
          />

          {/* =================================================
              RESUME
          ================================================= */}

          <Route
            path="/resume"
            element={
              <ProtectedRoute>
                <ResumeAnalyzer />
              </ProtectedRoute>
            }
          />

          {/* =================================================
              PROFILE
          ================================================= */}

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* =================================================
              NOTES
          ================================================= */}

          <Route
            path="/notes"
            element={
              <ProtectedRoute>
                <NotesGenerator />
              </ProtectedRoute>
            }
          />

          <Route
            path="/saved-notes"
            element={
              <ProtectedRoute>
                <SavedNotes />
              </ProtectedRoute>
            }
          />

          {/* =================================================
              MIND MAP
          ================================================= */}

          <Route
            path="/mindmap"
            element={
              <ProtectedRoute>
                <MindMapGenerator />
              </ProtectedRoute>
            }
          />

          {/* =================================================
              MOCK TESTS
          ================================================= */}

          <Route
            path="/mock-tests"
            element={
              <ProtectedRoute>
                <MockTests />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mock-tests/create"
            element={
              <ProtectedRoute>
                <TestSettings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mock-tests/generating"
            element={
              <ProtectedRoute>
                <TestGenerating />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mock-tests/history"
            element={
              <ProtectedRoute>
                <MockTestHistory />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mock-tests/attempt/:attemptId"
            element={
              <ProtectedRoute>
                <MockTestSession />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mock-tests/result/:resultId"
            element={
              <ProtectedRoute>
                <MockTestResult />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mock-tests/:id"
            element={
              <ProtectedRoute>
                <TestDetails />
              </ProtectedRoute>
            }
          />

          {/* =================================================
              MOCK INTERVIEW
          ================================================= */}

          <Route
            path="/mock-interview"
            element={
              <ProtectedRoute>
                <InterviewSetup />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mock-interview/session/:id"
            element={
              <ProtectedRoute>
                <MockInterview />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mock-interview/results/:id"
            element={
              <ProtectedRoute>
                <Results />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mock-interview/report/:id"
            element={
              <ProtectedRoute>
                <ReportPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/interview-completed"
            element={
              <ProtectedRoute>
                <InterviewCompleted />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mock-interview/:id/result"
            element={
              <ProtectedRoute>
                <MockInterviewResult />
              </ProtectedRoute>
            }
          />

          {/* =================================================
              PROGRESS
          ================================================= */}

          <Route
            path="/progress"
            element={
              <ProtectedRoute>
                <ProgressTracker />
              </ProtectedRoute>
            }
          />

          {/* =================================================
              RESOURCES
          ================================================= */}

          <Route
            path="/resources"
            element={
              <ProtectedRoute>
                <ResourceHub />
              </ProtectedRoute>
            }
          />

          {/* =================================================
              LEADERBOARD
          ================================================= */}

          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={<Notifications />}
          />

          <Route
            path="/settings"
            element={<Settings />}
          />
          <Route
            path="/habits"
            element={
              <ProtectedRoute>
                <Habits />
              </ProtectedRoute>
            }
          />

          {/* =================================================
              404
          ================================================= */}

          <Route
            path="*"
            element={
              <div
                style={{
                  minHeight: "100vh",
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  background: "#020617",
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

      </div>
    </BrowserRouter>
  );
}

export default App;