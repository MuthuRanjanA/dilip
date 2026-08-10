import axios from "axios";
import api from "../api/axiosInstance";

const BASE_URL = "/employees";

export const getEmployees = () => {
  return api.get(BASE_URL);
};

export const getMyProfile = () => {
  return api.get(`${BASE_URL}/me`);
};

export const addEmployee = (employee) => {
  return api.post(BASE_URL, employee);
};

export const updateEmployee = (id, employee) => {
  return api.put(
    `${BASE_URL}/update/${id}`,
    employee
  );
};

export const deleteEmployee = (id) => {
  return api.delete(
    `${BASE_URL}/delete/${id}`
  );
};