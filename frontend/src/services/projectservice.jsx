import api from "../api/axiosInstance";

const BASE_URL = "/projects";

// Get all projects
export const getAllProjects = () => api.get(BASE_URL);

// Get project by id
export const getProjectById = (id) =>
  api.get(`${BASE_URL}/${id}`);

// Create project
export const addProject = (project) =>
  api.post(BASE_URL, project);

// Update project
export const updateProject = (id, project) =>
  api.put(`${BASE_URL}/${id}`, project);

// Delete project
export const deleteProject = (id) =>
  api.delete(`${BASE_URL}/${id}`);

// Logged-in employee projects
export const getMyProjects = () =>
  api.get(`${BASE_URL}/my-projects`);

// Assign employees
export const assignEmployeeToProject = (projectId, data) =>
  api.put(`${BASE_URL}/${projectId}/assign`, data);