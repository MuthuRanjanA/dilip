import api from "../api/axiosInstance";

export const getAllPayrolls = () => {
  return api.get("/payroll/getAll");
};

export const getPayrollById = (id) => {
  return api.get(`/payroll/${id}`);
};

export const getPayrollsByEmployee = (employeeId) => {
  return api.get(`/payroll/employee/${employeeId}`);
};

export const getPayrollsByMonthAndYear = (month, year) => {
  return api.get(`/payroll/month/${month}/year/${year}`);
};

export const addPayroll = (payrollData) => {
  return api.post("/payroll/add", payrollData);
};

export const updatePayrollStatus = (id, status) => {
  return api.put(`/payroll/${id}/status?status=${status}`);
};

export const deletePayroll = (id) => {
  return api.delete(`/payroll/delete/${id}`);
};

export const getPayrollSummary = () => {
  return api.get("/payroll/summary");
};
