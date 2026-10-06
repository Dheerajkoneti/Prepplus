const MockAttempt = require("../models/MockAttempt");

const SECURITY_EVENT_TYPES = [
  "TAB_SWITCH",
  "FULLSCREEN_EXIT",
  "COPY_ATTEMPT",
  "PASTE_ATTEMPT",
  "CONTEXT_MENU",
  "WINDOW_BLUR",
  "CAMERA_DISCONNECTED",
  "MICROPHONE_DISCONNECTED",
  "FACE_NOT_DETECTED",
  "MULTIPLE_FACE_DETECTED",
];

const getSecuritySettings = (attempt) => {
  const test =
    attempt?.testId &&
    typeof attempt.testId === "object"
      ? attempt.testId
      : null;

  const security =
    test?.security || {};

  return {
    maxViolations:
      Number(
        attempt?.security
          ?.maxViolations
      ) ||
      Number(
        security.maxViolations
      ) ||
      3,

    autoTerminateOnViolation:
      security.autoTerminateOnViolation ===
      true,

    fullscreenRequired:
      security.fullscreenRequired ===
      true,

    tabSwitchMonitoring:
      security.tabSwitchMonitoring !==
      false,

    copyPasteMonitoring:
      security.copyPasteMonitoring !==
      false,

    contextMenuDisabled:
      security.contextMenuDisabled !==
      false,
  };
};

const getViolationCount = (
  attempt
) => {
  return (
    Number(
      attempt?.security
        ?.violationCount
    ) || 0
  );
};

const getEventCounterField = (
  eventType
) => {
  const fields = {
    TAB_SWITCH:
      "tabSwitches",

    FULLSCREEN_EXIT:
      "fullscreenExits",

    COPY_ATTEMPT:
      "copyAttempts",

    PASTE_ATTEMPT:
      "pasteAttempts",

    CONTEXT_MENU:
      "contextMenuAttempts",

    WINDOW_BLUR:
      "windowBlurs",

    CAMERA_DISCONNECTED:
      "cameraDisconnects",

    MICROPHONE_DISCONNECTED:
      "microphoneDisconnects",

    FACE_NOT_DETECTED:
      "faceWarnings",

    MULTIPLE_FACE_DETECTED:
      "multipleFaceWarnings",
  };

  return fields[eventType];
};

const isValidSecurityEvent = (
  eventType
) => {
  return SECURITY_EVENT_TYPES.includes(
    eventType
  );
};

const shouldCountViolation = (
  eventType
) => {
  return SECURITY_EVENT_TYPES.includes(
    eventType
  );
};

const getSecurityStatus = (
  violationCount,
  maxViolations
) => {
  if (violationCount <= 0) {
    return "SECURE";
  }

  if (
    violationCount >=
    maxViolations
  ) {
    return "TERMINATED";
  }

  if (
    violationCount >=
    Math.max(
      maxViolations - 1,
      1
    )
  ) {
    return "FINAL_WARNING";
  }

  return "WARNING";
};

const recordSecurityEvent = async (
  userId,
  attemptId,
  eventType,
  details = {}
) => {
  if (!userId) {
    throw new Error(
      "User ID is required."
    );
  }

  if (!attemptId) {
    throw new Error(
      "Attempt ID is required."
    );
  }

  if (
    !isValidSecurityEvent(
      eventType
    )
  ) {
    throw new Error(
      `Invalid security event type: ${eventType}`
    );
  }

  const attempt =
    await MockAttempt.findOne({
      _id: attemptId,
      userId,
    }).populate(
      "testId",
      "security"
    );

  if (!attempt) {
    const error = new Error(
      "Mock test attempt not found."
    );

    error.statusCode = 404;

    throw error;
  }

  if (
    [
      "COMPLETED",
      "TERMINATED",
      "EXPIRED",
      "ABANDONED",
    ].includes(attempt.status)
  ) {
    return {
      recorded: false,
      terminated:
        attempt.status ===
        "TERMINATED",
      violationCount:
        getViolationCount(
          attempt
        ),
      maxViolations:
        attempt.security
          ?.maxViolations || 3,
      status:
        attempt.security
          ?.status || "SECURE",
      message:
        "Attempt is no longer active.",
    };
  }

  if (!attempt.security) {
    attempt.security = {};
  }

  if (
    !Array.isArray(
      attempt.security.events
    )
  ) {
    attempt.security.events =
      [];
  }

  const now = new Date();

  const isViolation =
    shouldCountViolation(
      eventType
    );

  const counterField =
    getEventCounterField(
      eventType
    );

  if (counterField) {
    attempt.security[
      counterField
    ] =
      Number(
        attempt.security[
          counterField
        ]
      ) + 1;
  }

  let violationCount =
    getViolationCount(
      attempt
    );

  if (isViolation) {
    violationCount += 1;

    attempt.security.violationCount =
      violationCount;
  }

  const maxViolations =
    Number(
      attempt.security
        .maxViolations
    ) || 3;

  attempt.security.lastEventAt =
    now;

  attempt.security.lastEventType =
    eventType;

  attempt.security.status =
    getSecurityStatus(
      violationCount,
      maxViolations
    );

  attempt.security.events.push({
    type: eventType,
    message:
      details?.message ||
      getDefaultEventMessage(
        eventType
      ),
    timestamp: now,
    countedAsViolation:
      isViolation,
    metadata: details || {},
  });

  if (
    attempt.security.events
      .length > 100
  ) {
    attempt.security.events =
      attempt.security.events.slice(
        -100
      );
  }

  const securitySettings =
    getSecuritySettings(
      attempt
    );

  let terminated = false;

  if (
    isViolation &&
    securitySettings
      .autoTerminateOnViolation &&
    violationCount >=
      maxViolations
  ) {
    attempt.status =
      "TERMINATED";

    attempt.terminatedAt =
      now;

    attempt.security.status =
      "TERMINATED";

    terminated = true;
  }

  await attempt.save();

  return {
    recorded: true,
    terminated,
    violationCount,
    maxViolations,
    eventType,
    status:
      attempt.security.status,
    attemptStatus:
      attempt.status,
  };
};

const getDefaultEventMessage = (
  eventType
) => {
  const messages = {
    TAB_SWITCH:
      "Tab switching detected.",
    FULLSCREEN_EXIT:
      "Fullscreen mode exited.",
    COPY_ATTEMPT:
      "Copy attempt detected.",
    PASTE_ATTEMPT:
      "Paste attempt detected.",
    CONTEXT_MENU:
      "Context menu attempt detected.",
    WINDOW_BLUR:
      "Test window lost focus.",
    CAMERA_DISCONNECTED:
      "Camera disconnected.",
    MICROPHONE_DISCONNECTED:
      "Microphone disconnected.",
    FACE_NOT_DETECTED:
      "Face was not detected.",
    MULTIPLE_FACE_DETECTED:
      "Multiple faces detected.",
  };

  return (
    messages[eventType] ||
    "Security event detected."
  );
};

const getSecuritySummary = async (
  userId,
  attemptId
) => {
  if (!userId) {
    throw new Error(
      "User ID is required."
    );
  }

  if (!attemptId) {
    throw new Error(
      "Attempt ID is required."
    );
  }

  const attempt =
    await MockAttempt.findOne({
      _id: attemptId,
      userId,
    }).lean();

  if (!attempt) {
    const error = new Error(
      "Mock test attempt not found."
    );

    error.statusCode = 404;

    throw error;
  }

  const security =
    attempt.security || {};

  return {
    violationCount:
      Number(
        security.violationCount
      ) || 0,

    totalViolations:
      Number(
        security.violationCount
      ) || 0,

    maxViolations:
      Number(
        security.maxViolations
      ) || 3,

    status:
      security.status ||
      "SECURE",

    tabSwitches:
      Number(
        security.tabSwitches
      ) || 0,

    fullscreenExits:
      Number(
        security.fullscreenExits
      ) || 0,

    copyAttempts:
      Number(
        security.copyAttempts
      ) || 0,

    pasteAttempts:
      Number(
        security.pasteAttempts
      ) || 0,

    contextMenuAttempts:
      Number(
        security.contextMenuAttempts
      ) || 0,

    cameraDisconnects:
      Number(
        security.cameraDisconnects
      ) || 0,

    microphoneDisconnects:
      Number(
        security.microphoneDisconnects
      ) || 0,

    faceWarnings:
      Number(
        security.faceWarnings
      ) || 0,

    multipleFaceWarnings:
      Number(
        security.multipleFaceWarnings
      ) || 0,

    lastEventAt:
      security.lastEventAt ||
      null,

    lastEventType:
      security.lastEventType ||
      "",

    events:
      Array.isArray(
        security.events
      )
        ? security.events
        : [],
  };
};

module.exports = {
  SECURITY_EVENT_TYPES,
  getSecuritySettings,
  getViolationCount,
  getEventCounterField,
  isValidSecurityEvent,
  recordSecurityEvent,
  getSecuritySummary,
};