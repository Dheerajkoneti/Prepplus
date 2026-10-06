import API from "./api";

export const getProgressAnalytics =
  async () => {
    const response =
      await API.get(
        "/progress/analytics"
      );

    return response.data;
  };

export const recordLoginStreak =
  async (token) => {
    const response =
      await API.post(
        "/progress/login-streak",
        {},
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

    return response.data;
  };