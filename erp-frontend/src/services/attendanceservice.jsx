import api from "../api/axiosInstance";

export const addAttendance = (attendanceData) => {
  return api.post("/attendance", attendanceData);
};

export const getAllAttendance = () => {
  return api.get("/attendance");
};

export const getAttendanceByEmployee = (employeeId) => {
  return api.get(`/attendance/employee/${employeeId}`);
};