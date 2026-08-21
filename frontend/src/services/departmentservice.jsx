import api from "../api/axiosInstance";

export const getDepartments = () => {
  return api.get("/departments/all");
};

export const addDepartment = (department) => {
  return api.post("/departments", department);
};

export const getEmployeesByDepartment = (departmentId) => {
  return api.get(`/departments/${departmentId}/employees`);
};

