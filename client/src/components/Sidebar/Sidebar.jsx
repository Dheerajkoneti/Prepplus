import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  User,
  Bot,
  Pencil,
  Brain,
  FileText,
  FolderOpen,
  Trophy,
  Activity,
} from "lucide-react";

function Sidebar() {
  const location = useLocation();

  const menuItems = [
    {
      title: "MAIN",
      items: [
        {
          name: "Dashboard",
          icon: <LayoutDashboard size={20} />,
          path: "/dashboard",
        },
        {
          name: "Courses",
          icon: <BookOpen size={20} />,
          path: "/courses",
        },
        {
          name: "Progress Analytics",
          icon: <BarChart3 size={20} />,
          path: "/progress",
        },
        {
          name: "Profile",
          icon: <User size={20} />,
          path: "/profile",
        },
      ],
    },

    {
      title: "AI TOOLS",
      items: [
        {
          name: "AI Chatbot",
          icon: <Bot size={20} />,
          path: "/chatbot",
        },
        {
          name: "AI Note Maker",
          icon: <Pencil size={20} />,
          path: "/notes",
        },
        {
          name: "Saved Notes",
          icon: <BookOpen size={20} />,
          path: "/saved-notes",
        },
        {
          name: "YouTube MindMap",
          icon: <Brain size={20} />,
          path: "/mindmap",
        },
        {
          name: "Resume Analyzer",
          icon: <FileText size={20} />,
          path: "/resume",
        },
      ],
    },

    {
      title: "LEARNING",
      items: [
        {
          name: "Resource Hub",
          icon: <FolderOpen size={20} />,
          path: "/resources",
        },
        {
          name: "Leaderboard",
          icon: <Trophy size={20} />,
          path: "/leaderboard",
        },
        {
          name: "Habit Tracker",
          icon: <Activity size={20} />,
          path: "/habits",
        },
      ],
    },
  ];

  return (
    <div
      style={{
        width: "280px",
        height: "100vh",
        background: "#071631",
        color: "white",
        padding: "20px",
        overflowY: "auto",
      }}
    >
      <h1
        style={{
          color: "#38bdf8",
          marginBottom: "30px",
        }}
      >
        PrepPulse
      </h1>

      {menuItems.map((section) => (
        <div key={section.title}>
          <h4
            style={{
              color: "#64748b",
              marginBottom: "15px",
              marginTop: "20px",
            }}
          >
            {section.title}
          </h4>

          {section.items.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "14px",
                marginBottom: "10px",
                borderRadius: "12px",
                textDecoration: "none",
                color: "white",
                background:
                  location.pathname === item.path
                    ? "#0ea5e9"
                    : "#0f172a",
              }}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </div>
      ))}
    </div>
  );
}

export default Sidebar;