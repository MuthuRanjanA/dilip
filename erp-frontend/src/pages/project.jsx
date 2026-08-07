import { useEffect, useState } from "react";

import {
  getAllProjects,
  getMyProjects,
  addProject,
  updateProject,
  deleteProject,
  assignEmployeeToProject,
} from "../services/ProjectService";

import { getEmployees } from "../services/EmployeeService";
import DashboardLayout from "../components/layout/Dashboardlayout";
import "../style/Project.css";
import Dashboard from "./Dashboard";

const initialProjectForm = {
  projectName: "",
  description: "",
  startDate: "",
  endDate: "",
  status: "IN_PROGRESS",
};

function Project() {
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [projectForm, setProjectForm] =
    useState(initialProjectForm);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [showAssignForm, setShowAssignForm] =
    useState(false);

  const [assignProjectId, setAssignProjectId] =
    useState(null);

  const [selectedEmployeeIds, setSelectedEmployeeIds] =
    useState([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const role = localStorage.getItem("role");

  const canModify =
    role === "ADMIN" || role === "HR";

  useEffect(() => {
    loadProjects();

    if (canModify) {
      loadEmployees();
    }
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError("");

      let response;

      if (role === "EMPLOYEE") {
        response = await getMyProjects();
      } else {
        response = await getAllProjects();
      }

      setProjects(response.data.data || []);
    } catch (err) {
      console.error("Project loading error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load projects"
      );
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const response = await getEmployees();

      setEmployees(response.data.data || response.data || []);
    } catch (err) {
      console.error("Employee loading error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load employees"
      );
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setProjectForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  const handleEmployeeSelection = (event) => {
    const employeeId = Number(event.target.value);
    const checked = event.target.checked;

    setProjectForm((previousForm) => {
      let updatedEmployeeIds;

      if (checked) {
        updatedEmployeeIds = [
          ...previousForm.employeeIds,
          employeeId,
        ];
      } else {
        updatedEmployeeIds =
          previousForm.employeeIds.filter(
            (id) => id !== employeeId
          );
      }

      return {
        ...previousForm,
        employeeIds: updatedEmployeeIds,
      };
    });
  };

  const validateProjectForm = () => {
    if (!projectForm.projectName.trim()) {
      setError("Project name is required");
      return false;
    }

    if (!projectForm.startDate) {
      setError("Start date is required");
      return false;
    }

    if (!projectForm.endDate) {
      setError("End date is required");
      return false;
    }

    if (
      new Date(projectForm.endDate) <
      new Date(projectForm.startDate)
    ) {
      setError(
        "End date cannot be before start date"
      );
      return false;
    }

    return true;
  };
const handleSubmit = async (event) => {
  event.preventDefault();

  setMessage("");
  setError("");

  if (!validateProjectForm()) {
    return;
  }

  try {
    setLoading(true);

    const projectPayload = {
      projectName: projectForm.projectName,
      description: projectForm.description,
      startDate: projectForm.startDate,
      endDate: projectForm.endDate,
      status: projectForm.status,
    };

    if (editingId) {
      await updateProject(editingId, projectPayload);

      setMessage("Project updated successfully");
    } else {
      await addProject(projectPayload);

      setMessage("Project created successfully");
    }

    resetForm();
    await loadProjects();
  } catch (error) {
    console.error("Project save error:", error);

    setError(
      error.response?.data?.message ||
        "Unable to save project"
    );
  } finally {
    setLoading(false);
  }
};

  const handleEdit = (project) => {
    setEditingId(project.projectId);

    setProjectForm({
      projectName: project.projectName || "",
      description: project.description || "",
      startDate: project.startDate || "",
      endDate: project.endDate || "",
      status: project.status || "PLANNED",
      employeeIds: project.employeeIds || [],
    });

    setShowForm(true);
    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (projectId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setError("");

      await deleteProject(projectId);

      setMessage("Project deleted successfully");

      await loadProjects();
    } catch (err) {
      console.error("Project delete error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to delete project"
      );
    } finally {
      setLoading(false);
    }
  };

  const openAssignForm = (project) => {
    setAssignProjectId(project.projectId);

    setSelectedEmployeeIds(
      project.employeeIds || []
    );

    setShowAssignForm(true);
    setMessage("");
    setError("");
  };

  const handleAssignEmployeeSelection = (event) => {
    const employeeId = Number(event.target.value);
    const checked = event.target.checked;

    if (checked) {
      setSelectedEmployeeIds((previousIds) => [
        ...previousIds,
        employeeId,
      ]);
    } else {
      setSelectedEmployeeIds((previousIds) =>
        previousIds.filter(
          (id) => id !== employeeId
        )
      );
    }
  };
const handleAssignEmployees = async (event) => {
  event.preventDefault();

  try {
    setLoading(true);
    setMessage("");
    setError("");

    for (const employeeId of selectedEmployeeIds) {
      await assignEmployeeToProject(assignProjectId, {
        employeeId: employeeId,
      });
    }

    setMessage("Employees assigned successfully");

    closeAssignForm();
    await loadProjects();
  } catch (error) {
    console.error("Employee assignment error:", error);

    setError(
      error.response?.data?.message ||
        "Unable to assign employee"
    );
  } finally {
    setLoading(false);
  }
};
  const resetForm = () => {
    setProjectForm(initialProjectForm);
    setEditingId(null);
    setShowForm(false);
  };

  const closeAssignForm = () => {
    setShowAssignForm(false);
    setAssignProjectId(null);
    setSelectedEmployeeIds([]);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "PLANNED":
        return "project-status planned";

      case "IN_PROGRESS":
        return "project-status in-progress";

      case "ON_HOLD":
        return "project-status on-hold";

      case "COMPLETED":
        return "project-status completed";

      default:
        return "project-status";
    }
  };

  const formatStatus = (status) => {
    if (!status) {
      return "";
    }

    return status.replaceAll("_", " ");
  };

  return (
    <DashboardLayout>
      <div className="project-page">
        <div className="project-header">
          <h1>Project Management</h1>
          

          <p>
            {role === "EMPLOYEE"
              ? "View projects assigned to you"
              : "Create, update and assign company projects"}
          </p>
        </div>

        {canModify && (
          <button
            className="primary-button"
            onClick={() => {
              if (showForm) {
                resetForm();
              } else {
                setShowForm(true);
              }
            }}
          >
            {showForm ? "Close Form" : "+ Add Project"}
          </button>
        )}
     

      {message && (
        <div className="success-message">
          {message}
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {canModify && showForm && (
        <form
          className="project-form"
          onSubmit={handleSubmit}
        >
          <h2>
            {editingId
              ? "Update Project"
              : "Create Project"}
          </h2>

          <div className="project-form-grid">
            <div className="form-group">
              <label>Project Name</label>

              <input
                type="text"
                name="projectName"
                value={projectForm.projectName}
                onChange={handleInputChange}
                placeholder="Enter project name"
              />
            </div>

            <div className="form-group">
              <label>Status</label>

              <select
                name="status"
                value={projectForm.status}
                onChange={handleInputChange}
              >
                <option value="PLANNED">
                  Planned
                </option>

                <option value="IN_PROGRESS">
                  In Progress
                </option>

                <option value="ON_HOLD">
                  On Hold
                </option>

                <option value="COMPLETED">
                  Completed
                </option>

              </select>
            </div>

            <div className="form-group">
              <label>Start Date</label>

              <input
                type="date"
                name="startDate"
                value={projectForm.startDate}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>End Date</label>

              <input
                type="date"
                name="endDate"
                value={projectForm.endDate}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group full-width">
              <label>Description</label>

              <textarea
                name="description"
                value={projectForm.description}
                onChange={handleInputChange}
                placeholder="Enter project description"
                rows="4"
              />
            </div>

        </div>

          <div className="form-actions">
            <button
              type="submit"
              className="primary-button"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : editingId
                  ? "Update Project"
                  : "Create Project"}
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={resetForm}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {role === "EMPLOYEE" && (
        <div className="project-notification-title">
          <span className="notification-icon">
            🔔
          </span>

          <div>
            <h2>Project Notifications</h2>

            <p>
              Your assigned projects appear here.
            </p>
          </div>
        </div>
      )}

      {loading && projects.length === 0 ? (
        <div className="loading-text">
          Loading projects...
        </div>
      ) : projects.length === 0 ? (
        <div className="empty-projects">
          <h3>No projects found</h3>

          <p>
            {role === "EMPLOYEE"
              ? "You have not been assigned to any project."
              : "Create your first project to get started."}
          </p>
        </div>
      ) : (
        <div className="project-card-grid">
          {projects.map((project) => (
            <div
              className="project-card"
              key={project.projectId}
            >
              {role === "EMPLOYEE" && (
                <div className="assignment-notice">
                  🔔 You have been assigned to this
                  project
                </div>
              )}

              <div className="project-card-header">
                <div>
                  <h3>{project.projectName}</h3>

                  <span
                    className={getStatusClass(
                      project.status
                    )}
                  >
                    {formatStatus(project.status)}
                  </span>
                </div>

                <span className="project-id">
                  #{project.projectId}
                </span>
              </div>

              <p className="project-description">
                {project.description ||
                  "No description provided"}
              </p>

              <div className="project-date-row">
                <div>
                  <span>Start Date</span>
                  <strong>
                    {project.startDate || "Not set"}
                  </strong>
                </div>

                <div>
                  <span>End Date</span>
                  <strong>
                    {project.endDate || "Not set"}
                  </strong>
                </div>
              </div>

              <div className="assigned-employees">
                <h4>Assigned Employees</h4>

                {project.employeeNames &&
                project.employeeNames.length > 0 ? (
                  <div className="employee-tag-container">
                    {project.employeeNames.map(
                      (employeeName, index) => (
                        <span
                          className="employee-tag"
                          key={`${project.projectId}-${index}`}
                        >
                          {employeeName}
                        </span>
                      )
                    )}
                  </div>
                ) : (
                  <p className="empty-text">
                    No employees assigned
                  </p>
                )}
              </div>

              {canModify && (
                <div className="project-card-actions">
                  <button
                    className="edit-button"
                    onClick={() =>
                      handleEdit(project)
                    }
                  >
                    Edit
                  </button>

                  <button
                    className="assign-button"
                    onClick={() =>
                      openAssignForm(project)
                    }
                  >
                    Assign
                  </button>

                  <button
                    className="delete-button"
                    onClick={() =>
                      handleDelete(project.projectId)
                    }
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showAssignForm && canModify && (
        <div className="modal-overlay">
          <div className="assign-modal">
            <div className="modal-header">
              <h2>Assign Employees</h2>

              <button
                type="button"
                className="close-button"
                onClick={closeAssignForm}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleAssignEmployees}
            >
              <div className="assign-employee-list">
                {employees.map((employee) => (
                  <label
                    className="employee-checkbox-item"
                    key={employee.employeeId}
                  >
                    <input
                      type="checkbox"
                      value={employee.employeeId}
                      checked={selectedEmployeeIds.includes(
                        employee.employeeId
                      )}
                      onChange={
                        handleAssignEmployeeSelection
                      }
                    />

                    <span>
                      {employee.employeeName}
                    </span>

                    <small>
                      {employee.email}
                    </small>
                  </label>
                ))}
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="primary-button"
                  disabled={loading}
                >
                  {loading
                    ? "Assigning..."
                    : "Save Assignment"}
                </button>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeAssignForm}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
       </div>
    
   </DashboardLayout>
  );
}

export default Project;