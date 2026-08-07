import { useEffect, useState } from "react";
import {
  getEmployees,
  addEmployee,
    updateEmployee,
  deleteEmployee,
} from "../services/EmployeeService";
import DashboardLayout from "../components/layout/Dashboardlayout";

function Employee() {
  const [employees, setEmployees] = useState([]); 

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [employeeForm, setEmployeeForm] = useState({
    employeeName: "",
    email: "",
    phoneNumber: "",
    designation: "",
    department: {
      id: "",
    },
  });

  const role = localStorage.getItem("role");

  const canModify = role === "ADMIN" || role === "HR";

  const loadEmployees = () => {
    getEmployees()
      .then((response) => {
        setEmployees(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setEmployeeForm({
      ...employeeForm,
      [name]: value,
    });
  };

  const handleDepartmentChange = (e) => {
    setEmployeeForm({
      ...employeeForm,
      department: {
      id: Number(e.target.value),
      },
    });
  };

  const resetForm = () => {
    setEmployeeForm({
      employeeName: "",
      email: "",
      phoneNumber: "",
      designation: "",
      department: {
        id: "",
      },
    });

    setEditingId(null);
    setShowForm(false);
  };
const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    if (editingId !== null) {
      await updateEmployee(editingId, employeeForm);
      alert("Employee updated successfully");
    } else {
      await addEmployee(employeeForm);
      alert("Employee added successfully");
    }

    resetForm();
    loadEmployees();
  } catch (error) {
    console.log("Status:", error.response?.status);
    console.log("Backend response:", error.response?.data);
    console.log("Editing ID:", editingId);

    alert(
      error.response?.data?.message ||
      "Operation failed"
    );
  }
};

  const handleEdit = (employee) => {
    setEmployeeForm({
      employeeName: employee.employeeName || "",
      email: employee.email || "",
      phoneNumber: employee.phoneNumber || "",
      designation: employee.designation || "",
      department: {
        id:    employee.department?.id ??
        employee.department?.departmentId ??
        "",
      },
    });

    setEditingId(employee.employeeId);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this employee?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteEmployee(id);
      alert("Employee deleted successfully");
      loadEmployees();
    } catch (error) {
      console.log(error);
      alert("Delete failed");
    }
  };

  return (
    <DashboardLayout>
    <div className="container mt-4">
      <h2>Employee List</h2>

      <p>
        Logged in as: <strong>{role}</strong>
      </p>

      {canModify && (
        <button
          className="btn btn-primary mb-3"
          onClick={() => setShowForm(true)}
        >
          Add Employee
        </button>
      )}

      {canModify && showForm && (
        <form
          className="border rounded p-3 mb-4"
          onSubmit={handleSubmit}
        >
          <h4>{editingId ? "Edit Employee" : "Add Employee"}</h4>

          <div className="row">
            <div className="col-md-4 mb-3">
              <label>Employee Name</label>

              <input
                type="text"
                className="form-control"
                name="employeeName"
                value={employeeForm.employeeName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-4 mb-3">
              <label>Email</label>

              <input
                type="email"
                className="form-control"
                name="email"
                value={employeeForm.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-4 mb-3">
              <label>Phone Number</label>

              <input
                type="text"
                className="form-control"
                name="phoneNumber"
                value={employeeForm.phoneNumber}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-4 mb-3">
              <label>Designation</label>

              <input
                type="text"
                className="form-control"
                name="designation"
                value={employeeForm.designation}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-4 mb-3">
              <label>Department ID</label>

              <input
                type="number"
                className="form-control"
                value={employeeForm.department.id}
                onChange={handleDepartmentChange}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-success me-2"
          >
            {editingId ? "Update Employee" : "Save Employee"}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={resetForm}
          >
            Cancel
          </button>
        </form>
      )}

      <table className="table table-bordered table-hover">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone Number</th>
            <th>Designation</th>
            <th>Department</th>

            {canModify && <th>Actions</th>}
          </tr>
        </thead>

        <tbody>
          {employees.length === 0 ? (
            <tr>
              <td
                colSpan={canModify ? 7 : 6}
                className="text-center"
              >
                No employees found
              </td>
            </tr>
          ) : (
            employees.map((employee, index) => (
              <tr key={employee.employeeId}>
                <td>{employee.employeeId}</td>
                <td>{employee.employeeName}</td>
                <td>{employee.email}</td>
                <td>{employee.phoneNumber || "-"}</td>
                <td>{employee.designation}</td>

                <td>
                  {employee.department?.departmentName ||
                    employee.department?.name ||
                    "-"}
                </td>

                {canModify && (
                  <td>
                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={() => handleEdit(employee)}
                    >
                      Edit
                    </button>

                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() =>
                        handleDelete(employee.employeeId)
                      }
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
      
    </div>
    </DashboardLayout>
  );
}

export default Employee;