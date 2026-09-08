import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import {
  FiUser,
  FiMail,
  FiPhone,
  FiShield,
  FiCheckCircle,
  FiAlertCircle,
  FiEdit2,
  FiLock,
  FiLogOut,
  FiRefreshCw,
  FiX,
  FiSave,
  FiAward,
  FiCpu,
  FiCamera,
  FiLock as FiLockIcon
} from "react-icons/fi";

import { FaFire } from "react-icons/fa";

import API from "../../services/api";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Profile Picture state
  const [profileImage, setProfileImage] = useState(
    localStorage.getItem("profileImage") || ""
  );

  // Modal & Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  
  // Password change states
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const timeoutRef = useRef(null);

  const showToast = (message, type = "success") => {
    clearTimeout(timeoutRef.current);
    setToast({ show: true, message, type });
    timeoutRef.current = setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3500);
  };

  // 1. Authentication Check & History Back Control
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    fetchProfile();
  }, [navigate]);

  useEffect(() => {
    const handleBackButton = () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login", { replace: true });
      }
    };

    window.addEventListener("popstate", handleBackButton);

    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, [navigate]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await API.get("/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(data);
      setEditName(data.name || "");
      setEditPhone(data.phone || "");
    } catch (error) {
      console.log(error);
      showToast("Failed to fetch user profile ❌", "error");
    } finally {
      setLoading(false);
    }
  };

  // 4. Profile Picture Upload Function
  const handleImageUpload = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setProfileImage(reader.result);
      localStorage.setItem("profileImage", reader.result);
      showToast("Profile picture updated! ✨", "success");
    };

    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await API.put("/auth/profile", {
        name: editName,
        phone: editPhone
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(data.user || data);
      setIsEditing(false);
      showToast("Profile updated successfully! ✨", "success");
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.message || "Failed to update profile ❌", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      await API.put("/auth/change-password", {
        oldPassword,
        newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsChangingPassword(false);
      setOldPassword("");
      setNewPassword("");
      showToast("Password updated successfully! 🔒", "success");
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.message || "Failed to update password ❌", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // 2. Fixed Logout Function
  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();

    navigate("/login", {
      replace: true,
    });

    window.history.pushState(null, "", "/login");
  };

  // 8. Dark Professional User Stats Data
  const stats = [
    { title: "Courses", value: 12 },
    { title: "AI Chats", value: 245 },
    { title: "Mind Maps", value: 18 },
    { title: "Notes", value: 25 },
  ];

  if (loading || !user) {
    return (
      <div style={{ width: "100vw", height: "100vh", background: "#020617", display: "flex", justifyContent: "center", alignItems: "center", color: "#38bdf8", fontSize: "1.2rem", fontWeight: "bold" }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} style={{ width: "30px", height: "30px", border: "3px solid rgba(56,189,248,0.2)", borderTop: "3px solid #38bdf8", borderRadius: "50%", marginRight: "12px" }} />
        Loading Profile...
      </div>
    );
  }

  return (
    <div style={{ width: "100vw", minHeight: "100vh", background: "radial-gradient(circle at top, #1e293b 0%, #0f172a 45%, #020617 100%)", color: "white", display: "flex", justifyContent: "center", alignItems: "center", padding: "30px", boxSizing: "border-box", overflowX: "hidden" }}>
      <style>
        {`
          * { box-sizing: border-box; }
          html, body { margin: 0; padding: 0; background-color: #020617; width: 100%; overflow-x: hidden; }
          .glass-card { background: rgba(30, 41, 59, 0.6); backdrop-filter: blur(20px); border: 1px solid rgba(56, 189, 248, 0.3); box-shadow: 0 25px 50px rgba(0,0,0,0.6); border-radius: 24px; }
          .btn-action { background: linear-gradient(135deg, #2563eb, #38bdf8); color: white; border: none; padding: 12px 20px; border-radius: 12px; font-weight: bold; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 15px rgba(56, 189, 248, 0.3); display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; }
          .btn-action:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(56, 189, 248, 0.5); }
          .btn-secondary { background: rgba(255, 255, 255, 0.08); color: #cbd5e1; border: 1px solid rgba(255, 255, 255, 0.15); padding: 12px 20px; border-radius: 12px; font-weight: bold; cursor: pointer; transition: 0.2s; width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; }
          .btn-secondary:hover { background: rgba(255, 255, 255, 0.15); color: white; }
          .input-field:focus { border-color: #38bdf8 !important; outline: none; box-shadow: 0 0 15px rgba(56, 189, 248, 0.3); }
          ::-webkit-scrollbar { width: 6px; }
          ::-webkit-scrollbar-thumb { background: rgba(56, 189, 248, 0.2); border-radius: 10px; }
          .badge-card { background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 16px; padding: 14px; text-align: center; }
        `}
      </style>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            style={{
              position: "fixed", top: "20px", right: "20px", zIndex: 9999,
              background: toast.type === "success" ? "rgba(16, 185, 129, 0.9)" : "rgba(239, 68, 68, 0.9)",
              backdropFilter: "blur(12px)", color: "white", padding: "12px 22px",
              borderRadius: "14px", boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
              display: "flex", alignItems: "center", gap: "10px", fontWeight: "bold",
              border: "1px solid rgba(255,255,255,0.2)"
            }}
          >
            {toast.type === "success" ? <FiCheckCircle size={20} /> : <FiAlertCircle size={20} />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Profile Layout Container */}
      <div style={{ width: "100%", maxWidth: "900px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: "25px", maxHeight: "92vh", overflowY: "auto", padding: "5px" }}>
        
        {/* Left Column: Primary Profile Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="glass-card"
          style={{ padding: "35px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
        >
          <div>
            {/* Profile Header & Avatar with Upload Overlay */}
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <div style={{ position: "relative", width: "90px", height: "90px", margin: "0 auto 15px auto" }}>
                <div style={{ 
                  width: "100%", height: "100%", 
                  borderRadius: "50%", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 0 25px rgba(56, 189, 248, 0.4)", fontSize: "2rem", fontWeight: "bold", color: "white",
                  background: "linear-gradient(135deg, #06b6d4, #3b82f6)"
                }}>
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    user.name?.charAt(0).toUpperCase()
                  )}
                </div>
                <label style={{ position: "absolute", bottom: "0", right: "0", background: "#38bdf8", color: "#020617", borderRadius: "50%", padding: "6px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>
                  <FiCamera size={14} />
                  <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
                </label>
              </div>

              <h2 style={{ fontSize: "1.8rem", fontWeight: "900", margin: "0 0 6px 0", color: "#f8fafc" }}>
                {user.name}
              </h2>
              <span style={{ 
                background: "rgba(56, 189, 248, 0.15)", border: "1px solid rgba(56, 189, 248, 0.3)", 
                color: "#38bdf8", padding: "4px 12px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: "bold", textTransform: "uppercase" 
              }}>
                {user.role || "Student / User"}
              </span>
            </div>

            <div style={{ height: "1px", background: "rgba(255,255,255,0.1)", marginBottom: "20px" }} />

            {/* User Details Grid */}
            <div style={{ display: "grid", gap: "14px", marginBottom: "25px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px", background: "rgba(15, 23, 42, 0.5)", padding: "14px 18px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.05)" }}>
                <FiMail color="#38bdf8" size={20} />
                <div style={{ flex: 1 }}>
                  <span style={{ display: "block", fontSize: "0.75rem", color: "#94a3b8", fontWeight: "600" }}>EMAIL ADDRESS</span>
                  <span style={{ fontSize: "0.95rem", color: "#f8fafc" }}>{user.email}</span>
                </div>
                {user.isEmailVerified ? (
                  <span title="Verified" style={{ color: "#10b981", display: "flex", alignItems: "center" }}><FiCheckCircle size={18} /></span>
                ) : (
                  <span title="Not Verified" style={{ color: "#ef4444", display: "flex", alignItems: "center" }}><FiAlertCircle size={18} /></span>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "14px", background: "rgba(15, 23, 42, 0.5)", padding: "14px 18px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.05)" }}>
                <FiPhone color="#38bdf8" size={20} />
                <div style={{ flex: 1 }}>
                  <span style={{ display: "block", fontSize: "0.75rem", color: "#94a3b8", fontWeight: "600" }}>PHONE NUMBER</span>
                  <span style={{ fontSize: "0.95rem", color: "#f8fafc" }}>{user.phone || "Not provided"}</span>
                </div>
              </div>

              {/* 5. User Join Date */}
              <div style={{ display: "flex", alignItems: "center", gap: "14px", background: "rgba(15, 23, 42, 0.5)", padding: "14px 18px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.05)" }}>
                <FiShield color="#38bdf8" size={20} />
                <div style={{ flex: 1 }}>
                  <span style={{ display: "block", fontSize: "0.75rem", color: "#94a3b8", fontWeight: "600" }}>JOINED DATE</span>
                  <span style={{ fontSize: "0.95rem", color: "#f8fafc", fontWeight: "bold" }}>
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Recently"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "grid", gap: "12px" }}>
            <button onClick={() => setIsEditing(true)} className="btn-action">
              <FiEdit2 size={16} /> Edit Profile Details
            </button>
            
            <button onClick={() => setIsChangingPassword(true)} className="btn-secondary">
              <FiLock size={16} /> Change Password
            </button>

            <button onClick={handleLogout} style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#ef4444", padding: "12px", borderRadius: "12px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", transition: "0.2s", marginTop: "5px" }}>
              <FiLogOut size={16} /> Log Out
            </button>
          </div>
        </motion.div>

        {/* Right Column: Analytics, Streaks & Badges Showcase */}
        <div style={{ display: "grid", gap: "25px" }}>
          
          {/* 8. Dark Professional User Stats */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.05 }} className="glass-card" style={{ padding: "25px" }}>
            <h3 style={{ margin: "0 0 15px 0", fontSize: "1.1rem", color: "#f8fafc", display: "flex", alignItems: "center", gap: "8px" }}>
              <FiCpu color="#38bdf8" /> Platform Overview
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "15px" }}>
              {stats.map((item) => (
                <div className="badge-card" key={item.title}>
                  <h2 style={{ margin: "0 0 4px 0", fontSize: "1.5rem", color: "#38bdf8" }}>{item.value}</h2>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8" }}>{item.title}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Activity & Streak Tracker */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.1 }} className="glass-card" style={{ padding: "25px" }}>
            <h3 style={{ margin: "0 0 15px 0", fontSize: "1.1rem", color: "#f8fafc", display: "flex", alignItems: "center", gap: "8px" }}>
              <FaFire color="#f59e0b" /> Activity & Streaks
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
              <div className="badge-card">
                <span style={{ display: "block", fontSize: "1.5rem", fontWeight: "900", color: "#f59e0b" }}>15</span>
                <span style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: "600" }}>Day Streak 🔥</span>
              </div>
              <div className="badge-card">
                <span style={{ display: "block", fontSize: "1.5rem", fontWeight: "900", color: "#38bdf8" }}>12</span>
                <span style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: "600" }}>Courses Done</span>
              </div>
              <div className="badge-card">
                <span style={{ display: "block", fontSize: "1.5rem", fontWeight: "900", color: "#10b981" }}>120h</span>
                <span style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: "600" }}>Study Hours</span>
              </div>
            </div>
          </motion.div>

          {/* 6. Account Security Card */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.2 }} className="glass-card" style={{ padding: "25px" }}>
            <h3 style={{ margin: "0 0 12px 0", fontSize: "1.1rem", color: "#f8fafc", display: "flex", alignItems: "center", gap: "8px" }}>
              <FiLockIcon color="#10b981" /> Security
            </h3>
            <div style={{ display: "grid", gap: "8px", fontSize: "0.9rem", color: "#cbd5e1" }}>
              <p style={{ margin: 0 }}>Email Verified: {user.isEmailVerified ? "✅" : "❌"}</p>
              <p style={{ margin: 0 }}>Password Protected: ✅</p>
              <p style={{ margin: 0 }}>Last Login: Today</p>
            </div>
          </motion.div>

          {/* Badges & Achievements Showcase */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.3 }} className="glass-card" style={{ padding: "25px" }}>
            <h3 style={{ margin: "0 0 15px 0", fontSize: "1.1rem", color: "#f8fafc", display: "flex", alignItems: "center", gap: "8px" }}>
              <FiAward color="#fbbf24" /> Badges & Achievements
            </h3>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {[
                { title: "🚀 AI Explorer", desc: "First 100 prompts" },
                { title: "🔥 Streak Master", desc: "15 days streak" },
                { title: "📚 Fast Learner", desc: "10 modules done" }
              ].map((badge, idx) => (
                <div key={idx} style={{ flex: 1, minWidth: "100px", background: "rgba(56, 189, 248, 0.08)", border: "1px solid rgba(56, 189, 248, 0.25)", borderRadius: "14px", padding: "10px", textAlign: "center" }}>
                  <span style={{ fontSize: "0.85rem", display: "block", marginBottom: "4px", fontWeight: "bold" }}>{badge.title}</span>
                  <span style={{ fontSize: "0.65rem", color: "#94a3b8", display: "block" }}>{badge.desc}</span>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditing && (
          <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(2, 6, 23, 0.8)", backdropFilter: "blur(8px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999, padding: "20px" }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass-card" style={{ width: "100%", maxWidth: "400px", padding: "30px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ margin: 0, color: "#38bdf8" }}>Edit Profile</h3>
                <FiX size={22} style={{ cursor: "pointer", color: "#94a3b8" }} onClick={() => setIsEditing(false)} />
              </div>

              <form onSubmit={handleUpdateProfile} style={{ display: "grid", gap: "15px" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "#cbd5e1", fontWeight: "600", display: "block", marginBottom: "6px" }}>FULL NAME</label>
                  <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} required className="input-field" style={{ width: "100%", padding: "12px 15px", background: "#1e293b", border: "1px solid #334155", borderRadius: "10px", color: "white", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "#cbd5e1", fontWeight: "600", display: "block", marginBottom: "6px" }}>PHONE NUMBER</label>
                  <input type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="input-field" style={{ width: "100%", padding: "12px 15px", background: "#1e293b", border: "1px solid #334155", borderRadius: "10px", color: "white", boxSizing: "border-box" }} />
                </div>
                <button type="submit" disabled={actionLoading} className="btn-action" style={{ marginTop: "10px" }}>
                  {actionLoading ? <FiRefreshCw className="fa-spin" /> : <FiSave />} Save Changes
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Change Password Modal */}
      <AnimatePresence>
        {isChangingPassword && (
          <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(2, 6, 23, 0.8)", backdropFilter: "blur(8px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999, padding: "20px" }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass-card" style={{ width: "100%", maxWidth: "400px", padding: "30px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ margin: 0, color: "#38bdf8" }}>Change Password</h3>
                <FiX size={22} style={{ cursor: "pointer", color: "#94a3b8" }} onClick={() => setIsChangingPassword(false)} />
              </div>

              <form onSubmit={handleChangePassword} style={{ display: "grid", gap: "15px" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "#cbd5e1", fontWeight: "600", display: "block", marginBottom: "6px" }}>CURRENT PASSWORD</label>
                  <input type="password" placeholder="••••••••" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required className="input-field" style={{ width: "100%", padding: "12px 15px", background: "#1e293b", border: "1px solid #334155", borderRadius: "10px", color: "white", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "#cbd5e1", fontWeight: "600", display: "block", marginBottom: "6px" }}>NEW PASSWORD</label>
                  <input type="password" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="input-field" style={{ width: "100%", padding: "12px 15px", background: "#1e293b", border: "1px solid #334155", borderRadius: "10px", color: "white", boxSizing: "border-box" }} />
                </div>
                <button type="submit" disabled={actionLoading} className="btn-action" style={{ marginTop: "10px" }}>
                  {actionLoading ? <FiRefreshCw className="fa-spin" /> : <FiLock />} Update Password
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Profile;