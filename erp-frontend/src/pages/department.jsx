import { useEffect, useState } from "react";
import api from "../api/axiosInstance";
import { getDepartments,
  addDepartment,} from "../services/departmentservice";
  import DashboardLayout from "../components/layout/Dashboardlayout";
  import "../style/department.css";





function Department() {
  const [departments, setDepartments] = useState([]);
  const [departmentName, setDepartmentName] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [departmentEmployees, setDepartmentEmployees] = useState([]);

  const role = localStorage.getItem("role");
  const canModify = role === "ADMIN" || role === "HR";

  const loadDepartments = () => {
    api
      .get("/departments/all")
      .then((response) => {
        setDepartments(response.data);
      })
      .catch((error) => {
        console.error("Error loading departments:", error);
      });
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!departmentName.trim()) {
      alert("Please enter the department name");
      return;
    }

    const departmentData = {
      departmentName: departmentName,
    };

    api
      .post("/departments", departmentData)
      .then(() => {
        alert("Department added successfully");

        setDepartmentName("");
        setShowForm(false);

        loadDepartments();
      })
      .catch((error) => {
        console.error("Error adding department:", error);
        alert("Unable to add department");
      });
  };

  const handleViewEmployees = (department) => {
    api
      .get(`/departments/${department.id}/employees`)
      .then((response) => {
        setSelectedDepartment(department);
        setDepartmentEmployees(response.data);
      })
      .catch((error) => {
        console.error("Error loading employees:", error);
        alert("Unable to load employees");
      });
  };

  return (
    <DashboardLayout>
    <div className="department-page">
      <div className="department-header">
        <div>
          <h1>Department Management</h1>
          <p>Manage company departments and view employees</p>
        </div>

        {canModify && (
          <button
            className="add-department-btn"
            onClick={() => setShowForm(true)}
          >
            + Add Department
          </button>
        )}
      </div>

      {showForm && canModify && (
        <div className="department-form-card">
          <h2>Add Department</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Department Name</label>

              <input
                type="text"
                value={departmentName}
                onChange={(event) => setDepartmentName(event.target.value)}
                placeholder="Enter department name"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="save-btn">
                Save
              </button>

              <button
                type="button"
                className="cancel-btn"
                onClick={() => {
                  setShowForm(false);
                  setDepartmentName("");
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="department-table-card">
        <div className="table-title">
          <h2>Department List</h2>
          <span>{departments.length} Departments</span>
        </div>

        <div className="table-responsive">
          <table className="department-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Department Name</th>
                <th>Employees</th>
              </tr>
            </thead>

            <tbody>
              {departments.length > 0 ? (
                departments.map((department) => (
                  <tr key={department.id}>
                    <td>{department.id}</td>

                    <td>{department.departmentName}</td>

                    <td>
                      <button
                        className="view-btn"
                        onClick={() => handleViewEmployees(department)}
                      >
                        View Employees
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="empty-message">
                    No departments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedDepartment && (
        <div className="department-table-card">
          <div className="table-title">
            <h2>
              Employees in {selectedDepartment.departmentName}
            </h2>

            <button
              className="cancel-btn"
              onClick={() => {
                setSelectedDepartment(null);
                setDepartmentEmployees([]);
              }}
            >
              Close
            </button>
          </div>

          <div className="table-responsive">
            <table className="department-table">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Designation</th>
                </tr>
              </thead>

              <tbody>
                {departmentEmployees.length > 0 ? (
                  departmentEmployees.map((employee) => (
                    <tr key={employee.employeeId}>
                      <td>{employee.employeeId}</td>
                      <td>{employee.employeeName}</td>
                      <td>{employee.email}</td>
                      <td>{employee.designation}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="empty-message">
                      No employees found in this department
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
    </DashboardLayout>
  );
}

export default Department;