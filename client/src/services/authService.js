import API from "./api";

// ======================================================
// SEND CHANGE PASSWORD OTP
// ======================================================

export const sendChangePasswordOTP = async () => {
  const response = await API.post(
    "/auth/change-password/send-otp"
  );

  return response.data;
};


// ======================================================
// VERIFY CHANGE PASSWORD OTP
// ======================================================

export const verifyChangePasswordOTP = async (otp) => {
  const response = await API.post(
    "/auth/change-password/verify-otp",
    {
      otp,
    }
  );

  return response.data;
};


// ======================================================
// CHANGE PASSWORD
// ======================================================

export const changePassword = async (
  newPassword,
  confirmPassword
) => {
  const response = await API.post(
    "/auth/change-password",
    {
      newPassword,
      confirmPassword,
    }
  );

  return response.data;
};