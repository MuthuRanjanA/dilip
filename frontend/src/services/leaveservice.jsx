import api from "../api/axiosInstance";

export const applyLeave = (leaveData) => {
  return api.post("/leave", leaveData);
};

export const getAllLeaves = () => {
  return api.get("/leave");
};

export const getEmployeeLeaves = (employeeId) => {
  return api.get(`/leave/employee/${employeeId}`);
};

export const getTeamLeaves = (managerId) => {
  return api.get(`/leave/team/${managerId}`);
};

export const approveLeave = (leaveId, approverId, comment) => {
  return api.put(`/leave/approve/${leaveId}`, { approverId, comment });
};

export const rejectLeave = (leaveId, approverId, comment) => {
  return api.put(`/leave/reject/${leaveId}`, { approverId, comment });
};
