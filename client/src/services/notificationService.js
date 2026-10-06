import API from "./api";

export const getNotifications = async ({
  page = 1,
  limit = 20,
  unread = false,
  type = "ALL",
} = {}) => {
  const response = await API.get(
    "/notifications",
    {
      params: {
        page,
        limit,
        unread,
        type,
      },
    }
  );

  return response.data;
};

export const getUnreadCount =
  async () => {
    const response =
      await API.get(
        "/notifications/unread-count"
      );

    return response.data;
  };

export const markNotificationAsRead =
  async (id) => {
    const response =
      await API.patch(
        `/notifications/${id}/read`
      );

    return response.data;
  };

export const markAllNotificationsAsRead =
  async () => {
    const response =
      await API.patch(
        "/notifications/read-all"
      );

    return response.data;
  };

export const deleteNotification =
  async (id) => {
    const response =
      await API.delete(
        `/notifications/${id}`
      );

    return response.data;
  };

export const deleteAllNotifications =
  async () => {
    const response =
      await API.delete(
        "/notifications"
      );

    return response.data;
  };