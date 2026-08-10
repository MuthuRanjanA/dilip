import { useEffect, useState } from "react";
import {
  getEmployees,
   getMyProfile,
  addEmployee,
    updateEmployee,
  deleteEmployee,
} from "../services/EmployeeService";
import DashboardLayout from "../components/layout/Dashboardlayout";
import AlertPopup from "../components/common/alert"; 
import {useToast} from "../components/common/ToastContext";

function Employee() {
  const [employees, setEmployees] = useState([]); 
  const toast = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
const [popup, setPopup] = useState({
  show: false,
  type: "success",
  title: "",
  message: "",
  password: null,
  employeeId: null,
});
const showPopup = (
  type,
  title,
  message,
  password = null,
  employeeId = null
) => {
  setPopup({
    show: true,
    type,
    title,
    message,
    password,
    employeeId,
  });
};

  const [employeeForm, setEmployeeForm] =
  useState({
    employeeName: "",
    email: "",
    phoneNumber: "",
    designation: "",
    departmentId: "",
  });


  const role = localStorage.getItem("role");

  const canModify = role === "ADMIN" || role === "HR";
const loadEmployees = async () => {
  try {
    if (canModify) {
      const response = await getEmployees();

      setEmployees(response.data);
    } else {
      const response = await getMyProfile();

      const profile =
        response.data.data ||
        response.data;

      setEmployees([profile]);
    }

  } catch (error) {
    console.log(error);
  }
};

  useEffect(() => {
    loadEmployees();
  }, []);

 const handleChange = (e) => {
  const { name, value } = e.target;

  setEmployeeForm({
    ...employeeForm,
    [name]: name === "departmentId" ? Number(value) : value,
  });
};

  const resetForm = () => {
    setEmployeeForm({
    employeeName: "",
    email: "",
    phoneNumber: "",
    designation: "",
    departmentId: "",
    });

    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {

    // =========================
    // UPDATE
    // =========================
    if (editingId !== null) {

      const updateData = {
        employeeName: employeeForm.employeeName,
        phoneNumber: employeeForm.phoneNumber,
        designation: employeeForm.designation,
        departmentId: Number(employeeForm.departmentId),
      };

      await updateEmployee(editingId, updateData);

      showPopup(
        "success",
        "Employee Updated",
        "Employee details have been updated successfully."
      );

      resetForm();
      await loadEmployees();

      return;
    }

    // =========================
    // CREATE
    // =========================

    const createData = {
      employeeName: employeeForm.employeeName,
      email: employeeForm.email,
      phoneNumber: employeeForm.phoneNumber,
      designation: employeeForm.designation,
      departmentId: Number(employeeForm.departmentId),
    };

    const response = await addEmployee(createData);

    const temporaryPassword =
      response.data?.data?.temporaryPassword ??
      response.data?.temporaryPassword;

    showPopup(
      "password",
      "Employee Created",
      "Employee account created successfully. Share this temporary password with the employee.",
      temporaryPassword
    );

    resetForm();
    await loadEmployees();

  } catch (error) {

    console.log(
      "Backend error:",
      error.response?.data
    );

    toast.error(
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
    departmentId:
      employee.department?.id ??
      employee.department?.departmentId ??
      "",
  });

  setEditingId(employee.employeeId);

  console.log("EDIT CLICKED ID:", employee.employeeId);

  setShowForm(true);
};
const handleDelete = (id) => {
  console.log("OPEN DELETE POPUP FOR ID:", id);

  setPopup({
    show: true,
    type: "confirm",
    title: "Delete Employee?",
    message:
      "Are you sure you want to delete this employee? This action cannot be undone.",
    password: null,
    employeeId: id,
  });
};

const confirmDelete = async () => {
  const id = popup.employeeId;

  console.log("CONFIRM DELETE ID:", id);

  if (!id) {
    toast.error("Employee ID not found");
    return;
  }

  try {
    await deleteEmployee(id);

    await loadEmployees();

    setPopup({
      show: true,
      type: "success",
      title: "Employee Deleted",
      message:
        "The employee was deleted successfully.",
      password: null,
      employeeId: null,
    });

  } catch (error) {
    console.log(
      "DELETE ERROR:",
      error.response?.data
    );

    setPopup({
      show: false,
      type: "success",
      title: "",
      message: "",
      password: null,
      employeeId: null,
    });

    toast.error(
      error.response?.data?.message ||
      "Unable to delete employee"
    );
  }
};
console.log("Employee request:", employeeForm);
  return (
    <DashboardLayout>

<AlertPopup
  show={popup.show}
  type={popup.type}
  title={popup.title}
  message={popup.message}
  password={popup.password}
  onConfirm={confirmDelete}
  confirmText="Delete"
  onClose={() =>
    setPopup({
      show: false,
      type: "success",
      title: "",
      message: "",
      password: null,
      employeeId: null,
    })
  }
/>

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
                disabled={editingId !== null}
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
                  name="departmentId"
                value={employeeForm.departmentId}
                onChange={handleChange}
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
  }> Delete</button>
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