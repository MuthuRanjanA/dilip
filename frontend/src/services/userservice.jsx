import api from "../api/axiosInstance";

export const getAllUsers = () => {
  return api.get("/api/users");
};

export const updateUserRole = (userId, role) => {
  return api.put(`/api/users/${userId}/role?role=${role}`);
};

export const updateUserStatus = (userId, enabled) => {
  return api.put(`/api/users/${userId}/status?enabled=${enabled}`);
};

export const resetUserPassword = (userId, newPassword) => {
  return api.post(`/api/users/${userId}/reset-password`, { newPassword });
};
