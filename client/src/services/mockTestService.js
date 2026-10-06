import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const mockTestApi = axios.create({
  baseURL: `${API_URL}/mock-test`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 120000,
});

const getToken = () => {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken")
  );
};

mockTestApi.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

mockTestApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Mock Test API Error:", {
      url: error?.config?.url,
      method: error?.config?.method,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });

    return Promise.reject(error);
  }
);

export const getEntityId = (entity) => {
  if (!entity) {
    return null;
  }

  if (typeof entity === "string") {
    return entity;
  }

  if (typeof entity === "number") {
    return String(entity);
  }

  if (entity?._id) {
    return String(entity._id);
  }

  if (entity?.id) {
    return String(entity.id);
  }

  if (entity?.questionId) {
    return getEntityId(entity.questionId);
  }

  return null;
};

export const extractQuestionId = (question) => {
  return getEntityId(question);
};

export const extractAttemptId = (response) => {
  if (!response) {
    return null;
  }

  return (
    getEntityId(response?.attempt) ||
    getEntityId(response?.data?.attempt) ||
    getEntityId(response) ||
    getEntityId(response?.data) ||
    null
  );
};

export const extractTestId = (response) => {
  if (!response) {
    return null;
  }

  return (
    getEntityId(response?.test) ||
    getEntityId(response?.data?.test) ||
    getEntityId(response) ||
    getEntityId(response?.data) ||
    null
  );
};

export const extractAnswerQuestionId = (
  answer
) => {
  if (!answer) {
    return null;
  }

  return getEntityId(
    answer?.questionId ||
      answer?.question
  );
};

export const getMockTests = async (
  params = {}
) => {
  const response =
    await mockTestApi.get("/", {
      params,
    });

  return response.data;
};

export const getMockTest = async (
  testId
) => {
  const normalizedTestId =
    getEntityId(testId);

  if (!normalizedTestId) {
    throw new Error(
      "Mock test ID is required."
    );
  }

  const response =
    await mockTestApi.get(
      `/${normalizedTestId}`
    );

  return response.data;
};

export const generateAIMockTest =
  async (configuration) => {
    if (
      !configuration ||
      typeof configuration !== "object"
    ) {
      throw new Error(
        "Mock test configuration is required."
      );
    }

    const response =
      await mockTestApi.post(
        "/generate",
        configuration
      );

    return response.data;
  };

export const startMockTest = async (
  testId
) => {
  const normalizedTestId =
    getEntityId(testId);

  if (!normalizedTestId) {
    throw new Error(
      "Mock test ID is required."
    );
  }

  const response =
    await mockTestApi.post(
      `/${normalizedTestId}/start`
    );

  return response.data;
};

export const getAttempt = async (
  attemptId
) => {
  const normalizedAttemptId =
    getEntityId(attemptId);

  if (!normalizedAttemptId) {
    throw new Error(
      "Attempt ID is required."
    );
  }

  const response =
    await mockTestApi.get(
      `/attempt/${normalizedAttemptId}`
    );

  return response.data;
};

export const getAttemptProgress =
  async (attemptId) => {
    const normalizedAttemptId =
      getEntityId(attemptId);

    if (!normalizedAttemptId) {
      throw new Error(
        "Attempt ID is required."
      );
    }

    const response =
      await mockTestApi.get(
        `/attempt/${normalizedAttemptId}/progress`
      );

    return response.data;
  };

export const saveAnswer = async (
  attemptId,
  data
) => {
  const normalizedAttemptId =
    getEntityId(attemptId);

  if (!normalizedAttemptId) {
    throw new Error(
      "Attempt ID is required."
    );
  }

  if (
    !data ||
    typeof data !== "object"
  ) {
    throw new Error(
      "Answer data is required."
    );
  }

  const questionId =
    getEntityId(
      data.questionId ||
        data.question
    );

  if (!questionId) {
    throw new Error(
      "Question ID is required."
    );
  }

  const payload = {
    questionId,
    answer:
      data.answer ?? "",
  };

  if (
    data.currentQuestionIndex !==
      undefined &&
    data.currentQuestionIndex !==
      null
  ) {
    payload.currentQuestionIndex =
      Number(
        data.currentQuestionIndex
      );
  }

  if (
    data.markedForReview !==
      undefined
  ) {
    payload.markedForReview =
      Boolean(
        data.markedForReview
      );
  }

  const response =
    await mockTestApi.patch(
      `/attempt/${normalizedAttemptId}/answer`,
      payload
    );

  return response.data;
};

export const markForReview = async (
  attemptId,
  data
) => {
  const normalizedAttemptId =
    getEntityId(attemptId);

  if (!normalizedAttemptId) {
    throw new Error(
      "Attempt ID is required."
    );
  }

  const questionId =
    getEntityId(
      data?.questionId ||
        data?.question
    );

  if (!questionId) {
    throw new Error(
      "Question ID is required."
    );
  }

  const markedForReview =
    Boolean(
      data?.markedForReview ??
        data?.isMarkedForReview ??
        data?.marked ??
        data?.review ??
        false
    );

  const payload = {
    questionId,
    markedForReview,
  };

  const response =
    await mockTestApi.patch(
      `/attempt/${normalizedAttemptId}/review`,
      payload
    );

  return response.data;
};

export const updateNavigation =
  async (
    attemptId,
    data
  ) => {
    const normalizedAttemptId =
      getEntityId(attemptId);

    if (!normalizedAttemptId) {
      throw new Error(
        "Attempt ID is required."
      );
    }

    const currentQuestionIndex =
      data?.currentQuestionIndex ??
      data?.questionIndex ??
      data?.index;

    if (
      currentQuestionIndex ===
        undefined ||
      currentQuestionIndex ===
        null
    ) {
      throw new Error(
        "Current question index is required."
      );
    }

    const index = Number(
      currentQuestionIndex
    );

    if (
      !Number.isInteger(index) ||
      index < 0
    ) {
      throw new Error(
        "Invalid question index."
      );
    }

    const response =
      await mockTestApi.patch(
        `/attempt/${normalizedAttemptId}/navigation`,
        {
          currentQuestionIndex:
            index,
        }
      );

    return response.data;
  };

export const sendHeartbeat =
  async (
    attemptId,
    data = {}
  ) => {
    const normalizedAttemptId =
      getEntityId(attemptId);

    if (!normalizedAttemptId) {
      throw new Error(
        "Attempt ID is required."
      );
    }

    const response =
      await mockTestApi.patch(
        `/attempt/${normalizedAttemptId}/heartbeat`,
        data
      );

    return response.data;
  };

export const abandonTest = async (
  attemptId
) => {
  const normalizedAttemptId =
    getEntityId(attemptId);

  if (!normalizedAttemptId) {
    throw new Error(
      "Attempt ID is required."
    );
  }

  const response =
    await mockTestApi.post(
      `/attempt/${normalizedAttemptId}/abandon`
    );

  return response.data;
};

export const getMockTestHistory =
  async (params = {}) => {
    const response =
      await mockTestApi.get(
        "/history",
        {
          params,
        }
      );

    return response.data;
  };

export const submitMockTest =
  async (attemptId) => {
    const normalizedAttemptId =
      getEntityId(attemptId);

    if (!normalizedAttemptId) {
      throw new Error(
        "Attempt ID is required."
      );
    }

    const response =
      await mockTestApi.post(
        `/attempt/${normalizedAttemptId}/submit`
      );

    return response.data;
  };
export const getMockTestResult = async (
  resultId
) => {
  const normalizedResultId =
    getEntityId(resultId);

  if (!normalizedResultId) {
    throw new Error(
      "Result ID is required."
    );
  }

  const response =
    await mockTestApi.get(
      `/result/${normalizedResultId}`
    );

  return response.data;
};

export default mockTestApi;