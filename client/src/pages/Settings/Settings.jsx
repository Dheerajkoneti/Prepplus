import React, {
  useEffect,
  useState,
} from "react";

import {
  getSettings,
  resetSettings,
  updateSettings,
} from "../../services/settingsService";

import {
  sendChangePasswordOTP,
  verifyChangePasswordOTP,
  changePassword,
} from "../../services/authService";


// ======================================================
// DEFAULT SETTINGS
// ======================================================

const defaultSettings = {
  appearance: {
    theme: "dark",
    compactMode: false,
  },

  study: {
    dailyGoal: 120,
    reminderEnabled: true,
    reminderTime: "19:00",
    preferredDifficulty: "mixed",
    preferredTopics: [],
  },
};


// ======================================================
// COMPONENT
// ======================================================

export default function Settings() {

  const [settings, setSettings] =
    useState(defaultSettings);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

  const [activeSection, setActiveSection] =
    useState("general");

  // Password states
  const [passwordStep, setPasswordStep] =
    useState(0);

  const [otp, setOtp] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [otpSent, setOtpSent] =
    useState(false);

  const [otpVerified, setOtpVerified] =
    useState(false);

  const [passwordLoading, setPasswordLoading] =
    useState(false);

  const [passwordMessage, setPasswordMessage] =
    useState("");

  const [passwordError, setPasswordError] =
    useState("");

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);


  // ====================================================
  // LOAD SETTINGS
  // ====================================================

  const loadSettings = async () => {

    try {

      setLoading(true);

      const result =
        await getSettings();

      if (result?.success) {

        setSettings({
          ...defaultSettings,

          ...result.settings,

          appearance: {
            ...defaultSettings.appearance,
            ...(result.settings?.appearance || {}),
          },

          study: {
            ...defaultSettings.study,
            ...(result.settings?.study || {}),
          },
        });

      }

    } catch (error) {

      console.error(
        "Settings Error:",
        error
      );

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    loadSettings();

  }, []);


  // ====================================================
  // UPDATE SETTINGS
  // ====================================================

  const updateSection = (
    section,
    key,
    value
  ) => {

    setSettings((current) => ({

      ...current,

      [section]: {

        ...current[section],

        [key]: value,

      },

    }));

    setSaved(false);

  };


  // ====================================================
  // SAVE SETTINGS
  // ====================================================

  const handleSave = async () => {

    try {

      setSaving(true);

      const result =
        await updateSettings(settings);

      if (result?.success) {

        setSaved(true);

        applyTheme(
          settings.appearance.theme
        );

        setTimeout(() => {
          setSaved(false);
        }, 2500);

      }

    } catch (error) {

      console.error(
        "Save Settings Error:",
        error
      );

      alert(
        error?.response?.data?.message ||
        "Failed to save settings"
      );

    } finally {

      setSaving(false);

    }

  };


  // ====================================================
  // RESET SETTINGS
  // ====================================================

  const handleReset = async () => {

    const confirmed =
      window.confirm(
        "Reset all settings to default?"
      );

    if (!confirmed) return;

    try {

      setSaving(true);

      const result =
        await resetSettings();

      if (result?.success) {

        setSettings({
          ...defaultSettings,
        });

        applyTheme("dark");

        setSaved(true);

        setTimeout(() => {
          setSaved(false);
        }, 2500);

      }

    } catch (error) {

      console.error(
        "Reset Settings Error:",
        error
      );

      alert(
        error?.response?.data?.message ||
        "Failed to reset settings"
      );

    } finally {

      setSaving(false);

    }

  };


  // ====================================================
  // APPLY THEME
  // ====================================================

  const applyTheme = (theme) => {

    let actualTheme = theme;

    if (theme === "system") {

      actualTheme =
        window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches
          ? "dark"
          : "light";

    }

    document.documentElement.dataset.theme =
      actualTheme;

    document.documentElement.dataset.compact =
      settings.appearance.compactMode
        ? "true"
        : "false";

    localStorage.setItem(
      "preppulseTheme",
      theme
    );

  };


  // ====================================================
  // CHANGE PASSWORD - SEND OTP
  // ====================================================

  const handleSendPasswordOTP = async () => {

    try {

      setPasswordLoading(true);

      setPasswordError("");

      setPasswordMessage("");

      const result =
        await sendChangePasswordOTP();

      if (!result?.success) {

        throw new Error(
          result?.message ||
          "Failed to send OTP"
        );

      }

      setOtpSent(true);

      setPasswordStep(1);

      setPasswordMessage(
        "Verification OTP sent to your registered email."
      );

    } catch (error) {

      setPasswordError(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to send OTP"
      );

    } finally {

      setPasswordLoading(false);

    }

  };


  // ====================================================
  // VERIFY PASSWORD OTP
  // ====================================================

  const handleVerifyPasswordOTP = async () => {

    if (!otp.trim()) {

      setPasswordError(
        "Please enter the OTP."
      );

      return;

    }

    try {

      setPasswordLoading(true);

      setPasswordError("");

      setPasswordMessage("");

      const result =
        await verifyChangePasswordOTP(
          otp.trim()
        );

      if (!result?.success) {

        throw new Error(
          result?.message ||
          "Invalid OTP"
        );

      }

      setOtpVerified(true);

      setPasswordStep(2);

      setPasswordMessage(
        "Email verified successfully. You can now set a new password."
      );

    } catch (error) {

      setPasswordError(
        error?.response?.data?.message ||
        error?.message ||
        "Invalid OTP"
      );

    } finally {

      setPasswordLoading(false);

    }

  };


  // ====================================================
  // CHANGE PASSWORD
  // ====================================================

  const handleChangePassword = async () => {

    setPasswordError("");

    setPasswordMessage("");

    if (!newPassword) {

      setPasswordError(
        "Enter your new password."
      );

      return;

    }

    if (newPassword.length < 8) {

      setPasswordError(
        "Password must contain at least 8 characters."
      );

      return;

    }

    if (!confirmPassword) {

      setPasswordError(
        "Confirm your new password."
      );

      return;

    }

    if (
      newPassword !==
      confirmPassword
    ) {

      setPasswordError(
        "Passwords do not match."
      );

      return;

    }

    try {

      setPasswordLoading(true);

      const result =
        await changePassword(
          newPassword,
          confirmPassword
        );

      if (!result?.success) {

        throw new Error(
          result?.message ||
          "Failed to change password"
        );

      }

      setPasswordMessage(
        "Password changed successfully."
      );

      setPasswordStep(0);

      setOtp("");

      setNewPassword("");

      setConfirmPassword("");

      setOtpSent(false);

      setOtpVerified(false);

    } catch (error) {

      setPasswordError(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to change password"
      );

    } finally {

      setPasswordLoading(false);

    }

  };


  // ====================================================
  // RESET PASSWORD UI
  // ====================================================

  const resetPasswordUI = () => {

    setPasswordStep(0);

    setOtp("");

    setNewPassword("");

    setConfirmPassword("");

    setOtpSent(false);

    setOtpVerified(false);

    setPasswordMessage("");

    setPasswordError("");

  };


  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {

    return (
      <div style={styles.loadingPage}>

        <div style={styles.loader}>
          ⚙️
        </div>

        <h2>
          Loading Settings...
        </h2>

      </div>
    );

  }


  // ====================================================
  // RENDER
  // ====================================================

  return (

    <div style={styles.page}>

      <div style={styles.container}>

        {/* ============================================
            HEADER
        ============================================ */}

        <div style={styles.header}>

          <div>

            <div style={styles.eyebrow}>
              PREPPULSE • CONTROL CENTER
            </div>

            <h1 style={styles.title}>
              Settings
            </h1>

            <p style={styles.subtitle}>
              Manage your learning preferences,
              account security and PrepPulse experience.
            </p>

          </div>


          <div style={styles.headerActions}>

            <button
              onClick={handleReset}
              style={styles.resetButton}
            >
              Reset
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              style={styles.saveButton}
            >
              {saving
                ? "Saving..."
                : saved
                ? "✓ Saved"
                : "Save Changes"}
            </button>

          </div>

        </div>


        {/* ============================================
            NAVIGATION
        ============================================ */}

        <div style={styles.layout}>

          <aside style={styles.sidebar}>

            <button
              style={{
                ...styles.navButton,
                ...(activeSection === "general"
                  ? styles.navActive
                  : {}),
              }}
              onClick={() =>
                setActiveSection("general")
              }
            >
              🎯
              <span>
                Study Preferences
              </span>
            </button>


            <button
              style={{
                ...styles.navButton,
                ...(activeSection === "appearance"
                  ? styles.navActive
                  : {}),
              }}
              onClick={() =>
                setActiveSection("appearance")
              }
            >
              🎨
              <span>
                Appearance
              </span>
            </button>


            <button
              style={{
                ...styles.navButton,
                ...(activeSection === "security"
                  ? styles.navActive
                  : {}),
              }}
              onClick={() =>
                setActiveSection("security")
              }
            >
              🔐
              <span>
                Security
              </span>
            </button>

          </aside>


          <main style={styles.content}>


            {/* ========================================
                STUDY PREFERENCES
            ======================================== */}

            {activeSection === "general" && (

              <section>

                <SectionHeader
                  icon="🎯"
                  title="Study Preferences"
                  description="Customize how you prepare and practice."
                />


                <div style={styles.grid}>

                  <SettingCard
                    title="Daily Study Goal"
                    description="How much time do you want to study each day?"
                  >

                    <div style={styles.inputRow}>

                      <input
                        type="number"
                        min="15"
                        max="720"
                        value={
                          settings.study.dailyGoal
                        }
                        onChange={(e) =>
                          updateSection(
                            "study",
                            "dailyGoal",
                            Number(
                              e.target.value
                            )
                          )
                        }
                        style={styles.input}
                      />

                      <span>
                        minutes
                      </span>

                    </div>

                  </SettingCard>


                  <SettingCard
                    title="Preferred Difficulty"
                    description="Default difficulty for your practice."
                  >

                    <select
                      value={
                        settings.study
                          .preferredDifficulty
                      }
                      onChange={(e) =>
                        updateSection(
                          "study",
                          "preferredDifficulty",
                          e.target.value
                        )
                      }
                      style={styles.select}
                    >

                      <option value="easy">
                        Easy
                      </option>

                      <option value="medium">
                        Medium
                      </option>

                      <option value="hard">
                        Hard
                      </option>

                      <option value="mixed">
                        Mixed
                      </option>

                    </select>

                  </SettingCard>


                  <SettingCard
                    title="Study Reminder"
                    description="Set your preferred study reminder."
                  >

                    <Toggle
                      label="Enable Reminder"
                      description="Use your preferred reminder time."
                      value={
                        settings.study
                          .reminderEnabled
                      }
                      onChange={(value) =>
                        updateSection(
                          "study",
                          "reminderEnabled",
                          value
                        )
                      }
                    />

                    {settings.study
                      .reminderEnabled && (

                      <input
                        type="time"
                        value={
                          settings.study
                            .reminderTime
                        }
                        onChange={(e) =>
                          updateSection(
                            "study",
                            "reminderTime",
                            e.target.value
                          )
                        }
                        style={styles.input}
                      />

                    )}

                  </SettingCard>


                  <SettingCard
                    title="Preferred Topics"
                    description="Topics you want PrepPulse to prioritize."
                  >

                    <div style={styles.topicGrid}>

                      {[
                        "Java",
                        "Python",
                        "SQL",
                        "DSA",
                        "React",
                        "Spring Boot",
                        "AI/ML",
                        "Aptitude",
                        "Reasoning",
                      ].map((topic) => {

                        const selected =
                          settings.study
                            .preferredTopics
                            .includes(topic);

                        return (

                          <button
                            key={topic}
                            onClick={() => {

                              const current =
                                settings.study
                                  .preferredTopics;

                              const updated =
                                selected
                                  ? current.filter(
                                      (item) =>
                                        item !== topic
                                    )
                                  : [
                                      ...current,
                                      topic,
                                    ];

                              updateSection(
                                "study",
                                "preferredTopics",
                                updated
                              );

                            }}
                            style={{
                              ...styles.topicButton,
                              ...(selected
                                ? styles.topicActive
                                : {}),
                            }}
                          >
                            {selected
                              ? "✓ "
                              : ""}
                            {topic}
                          </button>

                        );

                      })}

                    </div>

                  </SettingCard>

                </div>

              </section>

            )}


            {/* ========================================
                APPEARANCE
            ======================================== */}

            {activeSection === "appearance" && (

              <section>

                <SectionHeader
                  icon="🎨"
                  title="Appearance"
                  description="Customize the way PrepPulse looks."
                />


                <div style={styles.grid}>

                  <SettingCard
                    title="Theme"
                    description="Choose your preferred interface theme."
                  >

                    <div style={styles.optionRow}>

                      {[
                        ["dark", "🌙 Dark"],
                        ["light", "☀️ Light"],
                        ["system", "💻 System"],
                      ].map(
                        ([value, label]) => (

                          <button
                            key={value}
                            onClick={() => {

                              updateSection(
                                "appearance",
                                "theme",
                                value
                              );

                              applyTheme(
                                value
                              );

                            }}
                            style={{
                              ...styles.choice,
                              ...(settings
                                .appearance
                                .theme ===
                              value
                                ? styles.choiceActive
                                : {}),
                            }}
                          >
                            {label}
                          </button>

                        )
                      )}

                    </div>

                  </SettingCard>


                  <SettingCard
                    title="Layout Density"
                    description="Control spacing throughout the interface."
                  >

                    <Toggle
                      label="Compact Mode"
                      description="Use smaller spacing and denser cards."
                      value={
                        settings.appearance
                          .compactMode
                      }
                      onChange={(value) =>
                        updateSection(
                          "appearance",
                          "compactMode",
                          value
                        )
                      }
                    />

                  </SettingCard>

                </div>

              </section>

            )}


            {/* ========================================
                SECURITY
            ======================================== */}

            {activeSection === "security" && (

              <section>

                <SectionHeader
                  icon="🔐"
                  title="Security & Account"
                  description="Protect your PrepPulse account."
                />


                {/* PASSWORD CARD */}

                <div style={styles.securityCard}>

                  <div style={styles.securityHeader}>

                    <div style={styles.securityIcon}>
                      🔑
                    </div>

                    <div>

                      <h3 style={styles.cardTitle}>
                        Change Password
                      </h3>

                      <p style={styles.cardDescription}>
                        Verify your registered email
                        before changing your password.
                      </p>

                    </div>

                  </div>


                  {/* STEP 0 */}

                  {passwordStep === 0 && (

                    <div>

                      <div style={styles.securityInfo}>

                        <span>
                          🛡️
                        </span>

                        <div>

                          <strong>
                            Email verification required
                          </strong>

                          <p>
                            We will send a one-time
                            verification code to your
                            registered email address.
                          </p>

                        </div>

                      </div>


                      <button
                        onClick={
                          handleSendPasswordOTP
                        }
                        disabled={
                          passwordLoading
                        }
                        style={styles.primaryButton}
                      >
                        {passwordLoading
                          ? "Sending OTP..."
                          : "Send Verification OTP"}
                      </button>

                    </div>

                  )}


                  {/* STEP 1 */}

                  {passwordStep === 1 && (

                    <div>

                      <div style={styles.stepBadge}>
                        STEP 2 OF 3
                      </div>

                      <h4 style={styles.stepTitle}>
                        Verify your email
                      </h4>

                      <p style={styles.stepText}>
                        Enter the 6-digit OTP sent
                        to your registered email.
                      </p>


                      <input
                        type="text"
                        maxLength="6"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) =>
                          setOtp(
                            e.target.value
                              .replace(/\D/g, "")
                          )
                        }
                        style={{
                          ...styles.input,
                          ...styles.otpInput,
                        }}
                      />


                      <div style={styles.buttonRow}>

                        <button
                          onClick={
                            handleVerifyPasswordOTP
                          }
                          disabled={
                            passwordLoading
                          }
                          style={styles.primaryButton}
                        >
                          {passwordLoading
                            ? "Verifying..."
                            : "Verify OTP"}
                        </button>

                        <button
                          onClick={
                            handleSendPasswordOTP
                          }
                          disabled={
                            passwordLoading
                          }
                          style={styles.secondaryButton}
                        >
                          Resend OTP
                        </button>

                      </div>

                    </div>

                  )}


                  {/* STEP 2 */}

                  {passwordStep === 2 && (

                    <div>

                      <div style={styles.stepBadge}>
                        STEP 3 OF 3
                      </div>

                      <h4 style={styles.stepTitle}>
                        Create a new password
                      </h4>

                      <p style={styles.stepText}>
                        Your email has been verified.
                        Choose a new secure password.
                      </p>


                      <div style={styles.passwordInputWrapper}>

                        <input
                          type={
                            showNewPassword
                              ? "text"
                              : "password"
                          }
                          placeholder="New password"
                          value={newPassword}
                          onChange={(e) =>
                            setNewPassword(
                              e.target.value
                            )
                          }
                          style={styles.passwordInput}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowNewPassword(
                              !showNewPassword
                            )
                          }
                          style={styles.eyeButton}
                        >
                          {showNewPassword
                            ? "🙈"
                            : "👁️"}
                        </button>

                      </div>


                      <div style={styles.passwordInputWrapper}>

                        <input
                          type={
                            showConfirmPassword
                              ? "text"
                              : "password"
                          }
                          placeholder="Confirm new password"
                          value={confirmPassword}
                          onChange={(e) =>
                            setConfirmPassword(
                              e.target.value
                            )
                          }
                          style={styles.passwordInput}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(
                              !showConfirmPassword
                            )
                          }
                          style={styles.eyeButton}
                        >
                          {showConfirmPassword
                            ? "🙈"
                            : "👁️"}
                        </button>

                      </div>


                      <div style={styles.passwordHint}>

                        <span>🔒</span>

                        <span>
                          Use at least 8 characters.
                          Avoid using passwords you use
                          on other websites.
                        </span>

                      </div>


                      <button
                        onClick={
                          handleChangePassword
                        }
                        disabled={
                          passwordLoading
                        }
                        style={styles.primaryButton}
                      >
                        {passwordLoading
                          ? "Updating Password..."
                          : "Update Password"}
                      </button>


                      <button
                        onClick={
                          resetPasswordUI
                        }
                        style={styles.cancelButton}
                      >
                        Cancel
                      </button>

                    </div>

                  )}


                  {/* SUCCESS */}

                  {passwordMessage && (

                    <div style={styles.successMessage}>
                      ✓ {passwordMessage}
                    </div>

                  )}


                  {/* ERROR */}

                  {passwordError && (

                    <div style={styles.errorMessage}>
                      ⚠ {passwordError}
                    </div>

                  )}

                </div>


                {/* OTHER SECURITY FEATURES */}

                <div style={styles.grid}>

                  <SettingCard
                    title="Account Verification"
                    description="Keep your account protected."
                  >

                    <div style={styles.statusRow}>

                      <span>
                        Email Verification
                      </span>

                      <span style={styles.verifiedBadge}>
                        ✓ Protected
                      </span>

                    </div>

                  </SettingCard>


                  <SettingCard
                    title="Session Security"
                    description="Basic account session controls."
                  >

                    <button
                      style={styles.secondaryButton}
                      onClick={() => {

                        const confirmed =
                          window.confirm(
                            "Log out from this device?"
                          );

                        if (confirmed) {

                          localStorage.removeItem(
                            "token"
                          );

                          localStorage.removeItem(
                            "user"
                          );

                          window.location.href =
                            "/login";

                        }

                      }}
                    >
                      Log Out
                    </button>

                  </SettingCard>

                </div>

              </section>

            )}

          </main>

        </div>

      </div>

    </div>

  );
}


// ======================================================
// SECTION HEADER
// ======================================================

function SectionHeader({
  icon,
  title,
  description,
}) {

  return (

    <div style={styles.sectionHeader}>

      <div style={styles.sectionIcon}>
        {icon}
      </div>

      <div>

        <h2 style={styles.sectionTitle}>
          {title}
        </h2>

        <p style={styles.sectionDescription}>
          {description}
        </p>

      </div>

    </div>

  );

}


// ======================================================
// SETTING CARD
// ======================================================

function SettingCard({
  title,
  description,
  children,
}) {

  return (

    <div style={styles.card}>

      <h3 style={styles.cardTitle}>
        {title}
      </h3>

      <p style={styles.cardDescription}>
        {description}
      </p>

      <div style={styles.cardContent}>
        {children}
      </div>

    </div>

  );

}


// ======================================================
// TOGGLE
// ======================================================

function Toggle({
  label,
  description,
  value,
  onChange,
}) {

  return (

    <div style={styles.toggleRow}>

      <div>

        <strong style={styles.toggleLabel}>
          {label}
        </strong>

        <p style={styles.toggleDescription}>
          {description}
        </p>

      </div>


      <button
        onClick={() =>
          onChange(!value)
        }
        style={{
          ...styles.toggle,
          ...(value
            ? styles.toggleOn
            : styles.toggleOff),
        }}
      >

        <span
          style={{
            ...styles.toggleCircle,
            transform: value
              ? "translateX(22px)"
              : "translateX(2px)",
          }}
        />

      </button>

    </div>

  );

}


// ======================================================
// STYLES
// ======================================================

const styles = {

  page: {
    minHeight: "100vh",
    background:
      "var(--app-bg, #020617)",
    color:
      "var(--text-primary, #f8fafc)",
    padding: "32px",
  },

  container: {
    maxWidth: "1250px",
    margin: "0 auto",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "30px",
  },

  eyebrow: {
    color:
      "var(--accent, #06b6d4)",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "2px",
    marginBottom: "10px",
  },

  title: {
    margin: 0,
    fontSize: "38px",
    fontWeight: 800,
  },

  subtitle: {
    marginTop: "10px",
    color:
      "var(--text-secondary, #94a3b8)",
    fontSize: "15px",
  },

  headerActions: {
    display: "flex",
    gap: "12px",
  },

  resetButton: {
    padding: "12px 18px",
    borderRadius: "12px",
    border:
      "1px solid var(--border-color, rgba(148,163,184,.15))",
    background:
      "var(--card-bg, #0f172a)",
    color:
      "var(--text-primary, #fff)",
    cursor: "pointer",
  },

  saveButton: {
    padding: "12px 20px",
    border: "none",
    borderRadius: "12px",
    background:
      "var(--accent, #06b6d4)",
    color: "#001018",
    fontWeight: 800,
    cursor: "pointer",
  },

  layout: {
    display: "grid",
    gridTemplateColumns: "230px 1fr",
    gap: "25px",
  },

  sidebar: {
    background:
      "var(--sidebar-bg, #071631)",
    border:
      "1px solid var(--border-color, rgba(148,163,184,.12))",
    borderRadius: "18px",
    padding: "12px",
    height: "fit-content",
    position: "sticky",
    top: "20px",
  },

  navButton: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "13px",
    marginBottom: "6px",
    border: "none",
    borderRadius: "11px",
    background: "transparent",
    color:
      "var(--text-secondary, #cbd5e1)",
    cursor: "pointer",
    textAlign: "left",
  },

  navActive: {
    background:
      "var(--accent-soft, rgba(6,182,212,.12))",
    color:
      "var(--accent, #06b6d4)",
    fontWeight: 700,
  },

  content: {
    minWidth: 0,
  },

  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginBottom: "20px",
  },

  sectionIcon: {
    width: "48px",
    height: "48px",
    display: "grid",
    placeItems: "center",
    borderRadius: "14px",
    background:
      "var(--accent-soft, rgba(6,182,212,.12))",
    fontSize: "22px",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "24px",
  },

  sectionDescription: {
    margin: "5px 0 0",
    color:
      "var(--text-muted, #64748b)",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "18px",
    marginBottom: "20px",
  },

  card: {
    background:
      "var(--card-bg, #0f172a)",
    border:
      "1px solid var(--border-color, rgba(148,163,184,.12))",
    borderRadius: "18px",
    padding: "22px",
  },

  cardTitle: {
    margin: 0,
    fontSize: "17px",
  },

  cardDescription: {
    color:
      "var(--text-muted, #64748b)",
    fontSize: "13px",
    lineHeight: 1.5,
    margin: "7px 0 18px",
  },

  cardContent: {
    marginTop: "10px",
  },

  optionRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },

  choice: {
    padding: "10px 14px",
    borderRadius: "10px",
    border:
      "1px solid var(--border-color, rgba(148,163,184,.15))",
    background:
      "var(--input-bg, #020617)",
    color:
      "var(--text-secondary, #cbd5e1)",
    cursor: "pointer",
  },

  choiceActive: {
    borderColor:
      "var(--accent, #06b6d4)",
    background:
      "var(--accent-soft, rgba(6,182,212,.12))",
    color:
      "var(--accent, #06b6d4)",
  },

  inputRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "10px",
    border:
      "1px solid var(--border-color, rgba(148,163,184,.15))",
    background:
      "var(--input-bg, #020617)",
    color:
      "var(--text-primary, #fff)",
    outline: "none",
    fontSize: "14px",
  },

  select: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border:
      "1px solid var(--border-color, rgba(148,163,184,.15))",
    background:
      "var(--input-bg, #020617)",
    color:
      "var(--text-primary, #fff)",
    outline: "none",
  },

  topicGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },

  topicButton: {
    padding: "9px 12px",
    borderRadius: "10px",
    border:
      "1px solid var(--border-color, rgba(148,163,184,.15))",
    background:
      "var(--input-bg, #020617)",
    color:
      "var(--text-secondary, #cbd5e1)",
    cursor: "pointer",
  },

  topicActive: {
    borderColor:
      "var(--accent, #06b6d4)",
    background:
      "var(--accent-soft, rgba(6,182,212,.12))",
    color:
      "var(--accent, #06b6d4)",
  },

  toggleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
  },

  toggleLabel: {
    display: "block",
    marginBottom: "4px",
  },

  toggleDescription: {
    margin: 0,
    fontSize: "12px",
    color:
      "var(--text-muted, #64748b)",
  },

  toggle: {
    width: "48px",
    height: "26px",
    borderRadius: "20px",
    border: "none",
    padding: 0,
    cursor: "pointer",
    position: "relative",
    flexShrink: 0,
  },

  toggleOn: {
    background:
      "var(--accent, #06b6d4)",
  },

  toggleOff: {
    background: "#475569",
  },

  toggleCircle: {
    width: "22px",
    height: "22px",
    borderRadius: "50%",
    background: "#fff",
    position: "absolute",
    top: "2px",
    left: "0",
    transition: "transform .2s ease",
  },

  securityCard: {
    background:
      "var(--card-bg, #0f172a)",
    border:
      "1px solid var(--border-color, rgba(148,163,184,.12))",
    borderRadius: "20px",
    padding: "25px",
    marginBottom: "20px",
  },

  securityHeader: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginBottom: "25px",
  },

  securityIcon: {
    width: "52px",
    height: "52px",
    display: "grid",
    placeItems: "center",
    borderRadius: "15px",
    background:
      "var(--accent-soft, rgba(6,182,212,.12))",
    fontSize: "24px",
  },

  securityInfo: {
    display: "flex",
    gap: "12px",
    padding: "16px",
    borderRadius: "12px",
    background:
      "var(--card-bg-soft, #111827)",
    marginBottom: "18px",
    color:
      "var(--text-secondary, #cbd5e1)",
  },

  stepBadge: {
    display: "inline-block",
    padding: "5px 9px",
    borderRadius: "7px",
    background:
      "var(--accent-soft, rgba(6,182,212,.12))",
    color:
      "var(--accent, #06b6d4)",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "1px",
    marginBottom: "10px",
  },

  stepTitle: {
    margin: "0 0 5px",
    fontSize: "18px",
  },

  stepText: {
    color:
      "var(--text-muted, #64748b)",
    fontSize: "13px",
    marginBottom: "16px",
  },

  otpInput: {
    maxWidth: "280px",
    fontSize: "20px",
    letterSpacing: "5px",
    textAlign: "center",
  },

  passwordInputWrapper: {
    display: "flex",
    alignItems: "center",
    border:
      "1px solid var(--border-color, rgba(148,163,184,.15))",
    background:
      "var(--input-bg, #020617)",
    borderRadius: "10px",
    marginBottom: "12px",
    overflow: "hidden",
  },

  passwordInput: {
    flex: 1,
    padding: "13px",
    border: "none",
    outline: "none",
    background: "transparent",
    color:
      "var(--text-primary, #fff)",
  },

  eyeButton: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    padding: "10px",
  },

  buttonRow: {
    display: "flex",
    gap: "10px",
    marginTop: "12px",
  },

  primaryButton: {
    padding: "12px 18px",
    border: "none",
    borderRadius: "10px",
    background:
      "var(--accent, #06b6d4)",
    color: "#001018",
    fontWeight: 800,
    cursor: "pointer",
  },

  secondaryButton: {
    padding: "12px 18px",
    borderRadius: "10px",
    border:
      "1px solid var(--border-color, rgba(148,163,184,.15))",
    background:
      "var(--card-bg-soft, #111827)",
    color:
      "var(--text-primary, #fff)",
    cursor: "pointer",
  },

  cancelButton: {
    display: "block",
    marginTop: "10px",
    border: "none",
    background: "transparent",
    color:
      "var(--text-muted, #64748b)",
    cursor: "pointer",
  },

  passwordHint: {
    display: "flex",
    gap: "8px",
    padding: "12px",
    borderRadius: "10px",
    background:
      "var(--card-bg-soft, #111827)",
    color:
      "var(--text-muted, #94a3b8)",
    fontSize: "12px",
    marginBottom: "15px",
  },

  successMessage: {
    marginTop: "15px",
    padding: "12px",
    borderRadius: "10px",
    background:
      "rgba(34,197,94,.10)",
    color: "#22c55e",
  },

  errorMessage: {
    marginTop: "15px",
    padding: "12px",
    borderRadius: "10px",
    background:
      "rgba(239,68,68,.10)",
    color: "#ef4444",
  },

  statusRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
  },

  verifiedBadge: {
    color: "#22c55e",
    fontWeight: 700,
    fontSize: "13px",
  },

  loadingPage: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background:
      "var(--app-bg, #020617)",
    color:
      "var(--text-primary, #fff)",
  },

  loader: {
    fontSize: "40px",
  },

};