import API from "./api";

export const getSettings = async () => {
  const response = await API.get(
    "/settings"
  );

  return response.data;
};

export const updateSettings = async (
  settings
) => {
  const response = await API.put(
    "/settings",
    settings
  );

  return response.data;
};

export const resetSettings = async () => {
  const response = await API.post(
    "/settings/reset"
  );

  return response.data;
};