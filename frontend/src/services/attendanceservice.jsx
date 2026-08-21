import api from "../api/axiosInstance";

export const addAttendance = (attendanceData) => {
  return api.post("/attendance", attendanceData);
};

export const checkInAttendance = (employeeId, workLocation, notes) => {
  return api.post(`/attendance/check-in/${employeeId}`, { workLocation, notes });
};

export const checkOutAttendance = (employeeId) => {
  return api.post(`/attendance/check-out/${employeeId}`);
};

export const getAllAttendance = () => {
  return api.get("/attendance");
};

export const getAttendanceByEmployee = (employeeId) => {
  return api.get(`/attendance/employee/${employeeId}`);
};

export const getTeamAttendance = (managerId) => {
  return api.get(`/attendance/team/${managerId}`);
};

export const getAttendanceByDate = (dateStr) => {
  return api.get(`/attendance/date/${dateStr}`);
};

export const getAttendanceByMonth = (year, month) => {
  return api.get(`/attendance/month/${year}/${month}`);
};

export const getEmployeeAttendanceByMonth = (employeeId, year, month) => {
  return api.get(`/attendance/employee/${employeeId}/month/${year}/${month}`);
};

export const getTeamAttendanceByDate = (managerId, dateStr) => {
  return api.get(`/attendance/team/${managerId}/date/${dateStr}`);
};

export const getTeamAttendanceByMonth = (managerId, year, month) => {
  return api.get(`/attendance/team/${managerId}/month/${year}/${month}`);
};

export const getAttendanceDashboard = () => {
  return api.get("/attendance/dashboard");
};

export const getAttendanceStatus = (date) => {
  return api.get(`/attendance/status${date ? `?date=${date}` : ''}`);
};

export const getShiftsSummary = (date) => {
  return api.get(`/attendance/shifts-summary${date ? `?date=${date}` : ''}`);
};