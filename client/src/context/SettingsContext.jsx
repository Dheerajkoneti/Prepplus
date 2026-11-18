import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";

import {
  getSettings,
  updateSettings,
  resetSettings,
} from "../services/settingsService";

/*
=========================================================
DEFAULT SETTINGS
=========================================================
*/

export const defaultSettings = {
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

/*
=========================================================
CONTEXT
=========================================================
*/

const SettingsContext = createContext(null);

/*
=========================================================
MERGE SETTINGS SAFELY
=========================================================
*/

const mergeSettings = (incoming = {}) => {
  return {
    ...defaultSettings,
    ...incoming,

    appearance: {
      ...defaultSettings.appearance,
      ...(incoming.appearance || {}),
    },

    notifications: {
      ...defaultSettings.notifications,
      ...(incoming.notifications || {}),
    },

    study: {
      ...defaultSettings.study,
      ...(incoming.study || {}),
    },
  };
};

/*
=========================================================
APPLY SETTINGS TO HTML
=========================================================
*/

const applySettingsToDocument = (settings) => {
  if (typeof document === "undefined") {
    return;
  }

  const appearance = settings?.appearance || {};

  const theme = appearance.theme || "dark";

  let actualTheme = theme;

  /*
  -------------------------------------------------------
  SYSTEM THEME
  -------------------------------------------------------
  */

  if (theme === "system") {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    actualTheme = prefersDark ? "dark" : "light";
  }

  /*
  -------------------------------------------------------
  ROOT ATTRIBUTES
  -------------------------------------------------------
  */

  document.documentElement.dataset.theme =
    actualTheme;

  document.documentElement.dataset.accent =
    appearance.accentColor || "cyan";

  document.documentElement.dataset.compact =
    appearance.compactMode
      ? "true"
      : "false";

  /*
  -------------------------------------------------------
  LOCAL CACHE
  -------------------------------------------------------
  */

  try {
    localStorage.setItem(
      "preppulseTheme",
      theme
    );

    localStorage.setItem(
      "preppulseAccent",
      appearance.accentColor || "cyan"
    );

    localStorage.setItem(
      "preppulseCompact",
      String(
        Boolean(appearance.compactMode)
      )
    );
  } catch (error) {
    console.warn(
      "Unable to save settings cache:",
      error
    );
  }
};

/*
=========================================================
PROVIDER
=========================================================
*/

export const SettingsProvider = ({
  children,
}) => {
  const [settings, setSettings] =
    useState(defaultSettings);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
  =======================================================
  LOAD SETTINGS
  =======================================================
  */

  const loadSettings = useCallback(
    async () => {
      const token =
        localStorage.getItem("token");

      /*
      ---------------------------------------------------
      USER NOT LOGGED IN
      ---------------------------------------------------
      */

      if (!token) {
        setSettings(defaultSettings);
        setLoading(false);
        setError("");

        applySettingsToDocument(
          defaultSettings
        );

        return;
      }

      try {
        setLoading(true);
        setError("");

        const response =
          await getSettings();

        if (response?.success) {
          const merged =
            mergeSettings(
              response.settings
            );

          setSettings(merged);

          applySettingsToDocument(
            merged
          );
        }
      } catch (err) {
        console.error(
          "Failed to load settings:",
          err
        );

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load settings"
        );

        /*
        -------------------------------------------------
        KEEP DEFAULTS IF API FAILS
        -------------------------------------------------
        */

        applySettingsToDocument(
          defaultSettings
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /*
  =======================================================
  INITIAL LOAD
  =======================================================
  */

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      if (!mounted) return;

      await loadSettings();
    };

    initialize();

    return () => {
      mounted = false;
    };
  }, [loadSettings]);

  /*
  =======================================================
  AUTH CHANGE LISTENER
  =======================================================
  */

  useEffect(() => {
    const handleAuthChange = () => {
      loadSettings();
    };

    window.addEventListener(
      "preppulse-auth-changed",
      handleAuthChange
    );

    return () => {
      window.removeEventListener(
        "preppulse-auth-changed",
        handleAuthChange
      );
    };
  }, [loadSettings]);

  /*
  =======================================================
  STORAGE CHANGE LISTENER
  =======================================================
  */

  useEffect(() => {
    const handleStorageChange = (event) => {
      /*
      Only react to authentication changes.
      */

      if (
        event.key === "token" ||
        event.key === null
      ) {
        loadSettings();
      }
    };

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange
      );
    };
  }, [loadSettings]);

  /*
  =======================================================
  APPLY SETTINGS WHEN STATE CHANGES
  =======================================================
  */

  useEffect(() => {
    applySettingsToDocument(
      settings
    );
  }, [settings]);

  /*
  =======================================================
  SYSTEM THEME LISTENER
  =======================================================
  */

  useEffect(() => {
    if (
      settings.appearance.theme !==
      "system"
    ) {
      return;
    }

    const mediaQuery =
      window.matchMedia(
        "(prefers-color-scheme: dark)"
      );

    const handleChange = () => {
      const actualTheme =
        mediaQuery.matches
          ? "dark"
          : "light";

      document.documentElement.dataset.theme =
        actualTheme;
    };

    /*
    Modern browsers
    */

    mediaQuery.addEventListener(
      "change",
      handleChange
    );

    /*
    Run once immediately
    */

    handleChange();

    return () => {
      mediaQuery.removeEventListener(
        "change",
        handleChange
      );
    };
  }, [
    settings.appearance.theme,
  ]);

  /*
  =======================================================
  UPDATE ONE SETTING
  =======================================================
  */

  const updateSection = useCallback(
    (
      section,
      key,
      value
    ) => {
      setSettings((current) => {
        const updated =
          mergeSettings({
            ...current,

            [section]: {
              ...current[section],

              [key]: value,
            },
          });

        /*
        Apply immediately so UI changes
        before pressing Save.
        */

        applySettingsToDocument(
          updated
        );

        return updated;
      });

      setError("");
    },
    []
  );

  /*
  =======================================================
  UPDATE COMPLETE SETTINGS OBJECT
  =======================================================
  */

  const updateLocalSettings =
    useCallback(
      (nextSettings) => {
        const merged =
          mergeSettings(
            nextSettings
          );

        setSettings(merged);

        applySettingsToDocument(
          merged
        );

        setError("");
      },
      []
    );

  /*
  =======================================================
  SAVE SETTINGS
  =======================================================
  */

  const saveSettings = useCallback(
    async (
      nextSettings = settings
    ) => {
      try {
        setSaving(true);
        setError("");

        const normalized =
          mergeSettings(
            nextSettings
          );

        /*
        Apply immediately
        */

        applySettingsToDocument(
          normalized
        );

        const response =
          await updateSettings(
            normalized
          );

        if (!response?.success) {
          throw new Error(
            response?.message ||
              "Failed to save settings"
          );
        }

        const finalSettings =
          mergeSettings(
            response.settings ||
              normalized
          );

        setSettings(
          finalSettings
        );

        applySettingsToDocument(
          finalSettings
        );

        return {
          success: true,
          settings:
            finalSettings,
        };
      } catch (err) {
        console.error(
          "Save settings error:",
          err
        );

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to save settings"
        );

        return {
          success: false,
          error: err,
        };
      } finally {
        setSaving(false);
      }
    },
    [settings]
  );

  /*
  =======================================================
  RESET SETTINGS
  =======================================================
  */

  const resetAllSettings =
    useCallback(
      async () => {
        try {
          setSaving(true);
          setError("");

          const response =
            await resetSettings();

          if (!response?.success) {
            throw new Error(
              response?.message ||
                "Failed to reset settings"
            );
          }

          const reset =
            mergeSettings(
              response.settings
            );

          setSettings(reset);

          applySettingsToDocument(
            reset
          );

          return {
            success: true,
            settings: reset,
          };
        } catch (err) {
          console.error(
            "Reset settings error:",
            err
          );

          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Failed to reset settings"
          );

          return {
            success: false,
            error: err,
          };
        } finally {
          setSaving(false);
        }
      },
      []
    );

  /*
  =======================================================
  NOTIFICATION PERMISSION
  =======================================================
  */

  const isNotificationEnabled =
    useCallback(
      (type) => {
        const notifications =
          settings.notifications;

        /*
        -------------------------------------------------
        MASTER SWITCH
        -------------------------------------------------
        */

        if (!notifications.enabled) {
          return false;
        }

        /*
        -------------------------------------------------
        NOTIFICATION TYPE MAPPING
        -------------------------------------------------
        */

        const notificationMap = {
          MOCK_TEST:
            "mockTests",

          MOCK_INTERVIEW:
            "mockInterviews",

          RESUME:
            "resume",

          NOTES:
            "notes",

          RESOURCE:
            "resources",

          HABIT:
            "habits",

          PLACEMENT:
            "placement",
        };

        const settingKey =
          notificationMap[type];

        /*
        -------------------------------------------------
        SYSTEM / GENERAL / ACCOUNT / AI CHAT
        -------------------------------------------------
        */

        if (!settingKey) {
          return true;
        }

        return Boolean(
          notifications[
            settingKey
          ]
        );
      },
      [settings.notifications]
    );

  /*
  =======================================================
  CLEAR SETTINGS
  =======================================================
  */

  const clearSettings =
    useCallback(() => {
      setSettings(
        defaultSettings
      );

      setError("");

      applySettingsToDocument(
        defaultSettings
      );

      /*
      Remove cached settings.
      */

      try {
        localStorage.removeItem(
          "preppulseTheme"
        );

        localStorage.removeItem(
          "preppulseAccent"
        );

        localStorage.removeItem(
          "preppulseCompact"
        );
      } catch (error) {
        console.warn(
          "Unable to clear settings cache:",
          error
        );
      }
    }, []);

  /*
  =======================================================
  CONTEXT VALUE
  =======================================================
  */

  const value = useMemo(
    () => ({
      /*
      Main settings
      */

      settings,

      /*
      Status
      */

      loading,

      saving,

      error,

      /*
      Shortcut sections
      */

      appearance:
        settings.appearance,

      notifications:
        settings.notifications,

      study:
        settings.study,

      /*
      Shortcut values
      */

      theme:
        settings.appearance.theme,

      accentColor:
        settings.appearance
          .accentColor,

      compactMode:
        settings.appearance
          .compactMode,

      /*
      Actions
      */

      updateSection,

      updateLocalSettings,

      saveSettings,

      resetAllSettings,

      isNotificationEnabled,

      reloadSettings:
        loadSettings,

      clearSettings,
    }),
    [
      settings,
      loading,
      saving,
      error,
      updateSection,
      updateLocalSettings,
      saveSettings,
      resetAllSettings,
      isNotificationEnabled,
      loadSettings,
      clearSettings,
    ]
  );

  /*
  =======================================================
  PROVIDER
  =======================================================
  */

  return (
    <SettingsContext.Provider
      value={value}
    >
      {children}
    </SettingsContext.Provider>
  );
};

/*
=========================================================
HOOK
=========================================================
*/

export const useSettings = () => {
  const context =
    useContext(
      SettingsContext
    );

  if (!context) {
    throw new Error(
      "useSettings must be used inside SettingsProvider"
    );
  }

  return context;
};

export default SettingsContext;