import API from "./api";

export const getLeaderboard =
  async ({
    range = "all",
    category = "overall",
    search = "",
    page = 1,
    limit = 10,
  } = {}) => {
    const response =
      await API.get(
        "/leaderboard",
        {
          params: {
            range,
            category,
            search,
            page,
            limit,
          },
        }
      );

    return response.data;
  };