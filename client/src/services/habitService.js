import API from "./api";

const getLocalDate = () => {
  const date = new Date();

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
};

// Get all habits
export const getHabits = async () => {
  const response = await API.get("/habits", {
    params: {
      today: getLocalDate(),
    },
  });

  return response.data;
};

// Get habit summary
export const getHabitSummary = async () => {
  const response = await API.get("/habits/summary", {
    params: {
      today: getLocalDate(),
    },
  });

  return response.data;
};

// Create habit
export const createHabit = async (payload) => {
  const response = await API.post("/habits", payload);

  return response.data;
};

// Update habit
export const updateHabit = async (id, payload) => {
  const response = await API.put(`/habits/${id}`, payload);

  return response.data;
};

// Toggle habit
export const toggleHabit = async (id, date) => {
  const response = await API.patch(`/habits/${id}/toggle`, {
    date,
  });

  return response.data;
};

// Delete habit
export const deleteHabit = async (id) => {
  const response = await API.delete(`/habits/${id}`);

  return response.data;
};