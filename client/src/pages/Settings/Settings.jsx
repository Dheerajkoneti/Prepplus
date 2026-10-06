import React, {
  useEffect,
  useState,
} from "react";

import {
  getSettings,
  resetSettings,
  updateSettings,
} from "../../services/settingsService";

const defaultSettings = {
  appearance: {
    theme: "dark",
    accentColor: "cyan",
    compactMode: false,
  },

  notifications: {
    enabled: true,
    mockTests: true,
    mockInterviews: true,
    resume: true,
    notes: true,
    resources: true,
    habits: true,
    placement: true,
  },

  study: {
    dailyGoal: 120,
    reminderEnabled: true,
    reminderTime: "19:00",
    preferredDifficulty: "mixed",
    preferredTopics: [],
  },
};

export default function Settings() {
  const [settings, setSettings] =
    useState(defaultSettings);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

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
            ...result.settings.appearance,
          },
          notifications: {
            ...defaultSettings.notifications,
            ...result.settings.notifications,
          },
          study: {
            ...defaultSettings.study,
            ...result.settings.study,
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

  const handleSave = async () => {
    try {
      setSaving(true);

      const result =
        await updateSettings(settings);

      if (result?.success) {
        setSaved(true);

        setTimeout(() => {
          setSaved(false);
        }, 2500);

        if (
          settings.appearance.theme ===
          "light"
        ) {
          document.documentElement.dataset.theme =
            "light";
        } else {
          document.documentElement.dataset.theme =
            "dark";
        }

        localStorage.setItem(
          "preppulseTheme",
          settings.appearance.theme
        );
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

  const handleReset = async () => {
    const confirmed =
      window.confirm(
        "Reset all settings to default?"
      );

    if (!confirmed) return;

    try {
      const result =
        await resetSettings();

      if (result?.success) {
        setSettings({
          ...defaultSettings,
        });

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
    }
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.loadingIcon}>
          ⚙️
        </div>

        <h2>Loading Settings...</h2>
      </div>
    );
  }

  const notificationItems = [
    [
      "mockTests",
      "Mock Test Results",
      "Get notified when your test results are ready.",
    ],
    [
      "mockInterviews",
      "AI Mock Interviews",
      "Receive interview completion and report updates.",
    ],
    [
      "resume",
      "Resume Analysis",
      "Get notified when your resume analysis is complete.",
    ],
    [
      "notes",
      "AI Notes",
      "Get updates when your AI notes are generated.",
    ],
    [
      "resources",
      "Learning Resources",
      "Know when useful resources are added.",
    ],
    [
      "habits",
      "Habit Reminders",
      "Receive reminders about your study habits.",
    ],
    [
      "placement",
      "Placement Updates",
      "Receive important placement notifications.",
    ],
  ];

  return (
    <div style={styles.page}>
      <div style={styles.glow} />

      <div style={styles.container}>
        {/* HEADER */}
        <div style={styles.header}>
          <div>
            <div style={styles.eyebrow}>
              PREPPULSE • CONTROL CENTER
            </div>

            <h1 style={styles.title}>
              Settings
            </h1>

            <p style={styles.subtitle}>
              Personalize your PrepPulse
              experience.
            </p>
          </div>

          <div style={styles.actions}>
            <button
              onClick={handleReset}
              style={styles.resetButton}
            >
              Reset
            </button>

            <button
              onClick={handleSave}
              style={styles.saveButton}
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : saved
                ? "✓ Saved"
                : "Save Changes"}
            </button>
          </div>
        </div>

        {/* APPEARANCE */}
        <section style={styles.section}>
          <SectionHeader
            icon="🎨"
            title="Appearance"
            description="Customize how PrepPulse looks."
          />

          <div style={styles.grid}>
            <SettingCard
              title="Theme"
              description="Choose your preferred theme."
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
                      onClick={() =>
                        updateSection(
                          "appearance",
                          "theme",
                          value
                        )
                      }
                      style={{
                        ...styles.choice,
                        ...(settings
                          .appearance
                          .theme === value
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
              title="Accent Color"
              description="Choose your interface accent."
            >
              <div style={styles.optionRow}>
                {[
                  ["cyan", "Cyan"],
                  ["purple", "Purple"],
                  ["blue", "Blue"],
                  ["green", "Green"],
                ].map(
                  ([value, label]) => (
                    <button
                      key={value}
                      onClick={() =>
                        updateSection(
                          "appearance",
                          "accentColor",
                          value
                        )
                      }
                      style={{
                        ...styles.choice,
                        ...(settings
                          .appearance
                          .accentColor === value
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
          </div>

          <Toggle
            label="Compact Mode"
            description="Use a denser interface with smaller spacing."
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
        </section>

        {/* NOTIFICATIONS */}
        <section style={styles.section}>
          <SectionHeader
            icon="🔔"
            title="Notifications"
            description="Control what PrepPulse can notify you about."
          />

          <Toggle
            label="Enable Notifications"
            description="Master switch for PrepPulse notifications."
            value={
              settings.notifications
                .enabled
            }
            onChange={(value) =>
              updateSection(
                "notifications",
                "enabled",
                value
              )
            }
          />

          <div
            style={{
              opacity: settings
                .notifications.enabled
                ? 1
                : 0.45,
              pointerEvents: settings
                .notifications.enabled
                ? "auto"
                : "none",
            }}
          >
            {notificationItems.map(
              ([
                key,
                title,
                description,
              ]) => (
                <Toggle
                  key={key}
                  label={title}
                  description={description}
                  value={
                    settings
                      .notifications[key]
                  }
                  onChange={(value) =>
                    updateSection(
                      "notifications",
                      key,
                      value
                    )
                  }
                />
              )
            )}
          </div>
        </section>

        {/* STUDY */}
        <section style={styles.section}>
          <SectionHeader
            icon="🎯"
            title="Study Preferences"
            description="Configure your personal preparation goals."
          />

          <div style={styles.grid}>
            <SettingCard
              title="Daily Study Goal"
              description="Target study time per day."
            >
              <div style={styles.inputWithUnit}>
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
                      Number(e.target.value)
                    )
                  }
                  style={styles.input}
                />

                <span>minutes</span>
              </div>
            </SettingCard>

            <SettingCard
              title="Preferred Difficulty"
              description="Default level for your practice."
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
              description="Choose when PrepPulse should remind you."
            >
              <div
                style={
                  styles.reminderRow
                }
              >
                <input
                  type="time"
                  value={
                    settings.study
                      .reminderTime
                  }
                  disabled={
                    !settings.study
                      .reminderEnabled
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

                <button
                  onClick={() =>
                    updateSection(
                      "study",
                      "reminderEnabled",
                      !settings.study
                        .reminderEnabled
                    )
                  }
                  style={{
                    ...styles.choice,
                    ...(settings.study
                      .reminderEnabled
                      ? styles.choiceActive
                      : {}),
                  }}
                >
                  {settings.study
                    .reminderEnabled
                    ? "Enabled"
                    : "Disabled"}
                </button>
              </div>
            </SettingCard>
          </div>
        </section>

        {/* ACCOUNT */}
        <section style={styles.section}>
          <SectionHeader
            icon="👤"
            title="Account & Security"
            description="Manage your PrepPulse account."
          />

          <div style={styles.accountCard}>
            <div style={styles.avatar}>
              👤
            </div>

            <div>
              <h3
                style={{
                  margin: 0,
                }}
              >
                Your PrepPulse Account
              </h3>

              <p
                style={{
                  margin: "6px 0 0",
                  color: "#94a3b8",
                }}
              >
                Account details are managed
                through your authenticated
                profile.
              </p>
            </div>
          </div>
        </section>

        <div style={styles.bottomSave}>
          <button
            onClick={handleSave}
            style={styles.saveButton}
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : saved
              ? "✓ Changes Saved"
              : "Save All Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

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

        <p
          style={
            styles.sectionDescription
          }
        >
          {description}
        </p>
      </div>
    </div>
  );
}

function SettingCard({
  title,
  description,
  children,
}) {
  return (
    <div style={styles.settingCard}>
      <h3 style={styles.cardTitle}>
        {title}
      </h3>

      <p style={styles.cardDescription}>
        {description}
      </p>

      {children}
    </div>
  );
}

function Toggle({
  label,
  description,
  value,
  onChange,
}) {
  return (
    <div style={styles.toggleRow}>
      <div>
        <h3 style={styles.toggleTitle}>
          {label}
        </h3>

        <p
          style={
            styles.toggleDescription
          }
        >
          {description}
        </p>
      </div>

      <button
        onClick={() => onChange(!value)}
        style={{
          ...styles.toggle,
          ...(value
            ? styles.toggleOn
            : styles.toggleOff),
        }}
      >
        <span
          style={{
            ...styles.toggleKnob,
            transform: value
              ? "translateX(22px)"
              : "translateX(0)",
          }}
        />
      </button>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "32px",
    background:
      "radial-gradient(circle at 10% 10%,rgba(99,102,241,.15),transparent 30%),radial-gradient(circle at 90% 20%,rgba(6,182,212,.1),transparent 25%),#070912",
    color: "#f8fafc",
    position: "relative",
  },

  glow: {
    position: "fixed",
    width: 500,
    height: 500,
    right: -200,
    top: 100,
    borderRadius: "50%",
    background:
      "rgba(99,102,241,.08)",
    filter: "blur(100px)",
    pointerEvents: "none",
  },

  container: {
    maxWidth: 1150,
    margin: "0 auto",
    position: "relative",
    zIndex: 1,
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 30,
    gap: 20,
  },

  eyebrow: {
    fontSize: 11,
    color: "#67e8f9",
    letterSpacing: 2,
    fontWeight: 800,
  },

  title: {
    fontSize: 38,
    margin: "8px 0",
    fontWeight: 800,
  },

  subtitle: {
    color: "#94a3b8",
    margin: 0,
  },

  actions: {
    display: "flex",
    gap: 10,
  },

  saveButton: {
    border: "none",
    borderRadius: 12,
    padding: "12px 20px",
    background:
      "linear-gradient(135deg,#06b6d4,#6366f1)",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },

  resetButton: {
    border:
      "1px solid rgba(248,113,113,.25)",
    borderRadius: 12,
    padding: "12px 20px",
    background:
      "rgba(127,29,29,.12)",
    color: "#fca5a5",
    cursor: "pointer",
  },

  section: {
    marginBottom: 20,
    padding: 24,
    borderRadius: 20,
    background:
      "rgba(15,23,42,.72)",
    border:
      "1px solid rgba(148,163,184,.12)",
    backdropFilter: "blur(20px)",
  },

  sectionHeader: {
    display: "flex",
    gap: 15,
    alignItems: "center",
    marginBottom: 20,
  },

  sectionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    display: "grid",
    placeItems: "center",
    background:
      "rgba(99,102,241,.15)",
    fontSize: 23,
  },

  sectionTitle: {
    margin: 0,
    fontSize: 20,
  },

  sectionDescription: {
    margin: "5px 0 0",
    color: "#64748b",
    fontSize: 13,
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(280px,1fr))",
    gap: 14,
  },

  settingCard: {
    padding: 18,
    borderRadius: 16,
    background:
      "rgba(2,6,23,.45)",
    border:
      "1px solid rgba(148,163,184,.1)",
  },

  cardTitle: {
    margin: 0,
    fontSize: 15,
  },

  cardDescription: {
    color: "#64748b",
    fontSize: 12,
    lineHeight: 1.5,
  },

  optionRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },

  choice: {
    border:
      "1px solid rgba(148,163,184,.15)",
    borderRadius: 9,
    padding: "9px 12px",
    background:
      "rgba(15,23,42,.8)",
    color: "#94a3b8",
    cursor: "pointer",
  },

  choiceActive: {
    color: "#fff",
    border:
      "1px solid rgba(34,211,238,.45)",
    background:
      "rgba(6,182,212,.13)",
  },

  toggleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 20,
    padding: "17px 0",
    borderBottom:
      "1px solid rgba(148,163,184,.08)",
  },

  toggleTitle: {
    margin: 0,
    fontSize: 14,
  },

  toggleDescription: {
    margin: "5px 0 0",
    color: "#64748b",
    fontSize: 12,
  },

  toggle: {
    width: 48,
    height: 26,
    borderRadius: 30,
    border: "none",
    padding: 2,
    cursor: "pointer",
    transition: "background .2s",
  },

  toggleOn: {
    background:
      "linear-gradient(90deg,#06b6d4,#6366f1)",
  },

  toggleOff: {
    background: "#334155",
  },

  toggleKnob: {
    display: "block",
    width: 22,
    height: 22,
    borderRadius: "50%",
    background: "#fff",
    transition:
      "transform .2s ease",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    border:
      "1px solid rgba(148,163,184,.15)",
    borderRadius: 10,
    background:
      "rgba(2,6,23,.7)",
    color: "#fff",
    padding: "11px 12px",
    outline: "none",
  },

  inputWithUnit: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    color: "#64748b",
  },

  select: {
    width: "100%",
    border:
      "1px solid rgba(148,163,184,.15)",
    borderRadius: 10,
    background: "#0f172a",
    color: "#fff",
    padding: "11px 12px",
  },

  reminderRow: {
    display: "flex",
    gap: 10,
    alignItems: "center",
  },

  accountCard: {
    display: "flex",
    gap: 16,
    alignItems: "center",
    padding: 18,
    borderRadius: 15,
    background:
      "rgba(2,6,23,.45)",
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    background:
      "linear-gradient(135deg,#06b6d4,#6366f1)",
    fontSize: 23,
  },

  bottomSave: {
    display: "flex",
    justifyContent: "flex-end",
    padding: "10px 0 40px",
  },

  loading: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#070912",
    color: "#fff",
    textAlign: "center",
  },

  loadingIcon: {
    fontSize: 45,
  },
};