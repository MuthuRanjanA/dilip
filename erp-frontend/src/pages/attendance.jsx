import { useEffect, useState } from "react";

import {
  addAttendance,
  getAllAttendance,
  getAttendanceByEmployee,
} from "../services/attendanceService";

import { getEmployees } from "../services/EmployeeService";

import "../style/Attendance.css";
import DashboardLayout from "../components/layout/Dashboardlayout";
import { useToast } from "../components/common/ToastContext";

function Attendance() {
  const toast = useToast();
  const initialForm = {
    employeeId: "",
    date: "",
    status: "PRESENT",
    checkInTime: "",
    checkOutTime: "",
  };

  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [attendanceForm, setAttendanceForm] =
    useState(initialForm);

  const [showForm, setShowForm] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] =
    useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const role = localStorage.getItem("role");

  const canModify =
    role === "ADMIN" || role === "HR";

  const loadAttendance = () => {
    setLoading(true);

    getAllAttendance()
      .then((response) => {
        setAttendanceRecords(response.data);
      })
      .catch((error) => {
        console.error(
          "Error loading attendance:",
          error
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const loadEmployees = () => {
    getEmployees()
      .then((response) => {
        setEmployees(response.data);
      })
      .catch((error) => {
        console.error(
          "Error loading employees:",
          error
        );
      });
  };

  useEffect(() => {
    loadAttendance();
    loadEmployees();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setAttendanceForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setAttendanceForm(initialForm);
    setShowForm(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!attendanceForm.employeeId) {
      toast.warning("Please select an employee");
      return;
    }

    if (!attendanceForm.date) {
      toast.warning("Please select an attendance date");
      return;
    }

    if (
      attendanceForm.status === "PRESENT" &&
      !attendanceForm.checkInTime
    ) {
      toast.warning("Please enter check-in time");
      return;
    }

    if (
      attendanceForm.status === "PRESENT" &&
      !attendanceForm.checkOutTime
    ) {
      toast.warning("Please enter check-out time");
      return;
    }

    if (
      attendanceForm.status === "PRESENT" &&
      attendanceForm.checkOutTime <=
        attendanceForm.checkInTime
    ) {
      toast.warning(
        "Check-out time must be after check-in time"
      );
      return;
    }

    const attendanceData = {
      date: attendanceForm.date,
      status: attendanceForm.status,

      checkInTime:
        attendanceForm.status === "PRESENT"
          ? attendanceForm.checkInTime
          : null,

      checkOutTime:
        attendanceForm.status === "PRESENT"
          ? attendanceForm.checkOutTime
          : null,

      employee: {
        employeeId: Number(
          attendanceForm.employeeId
        ),
      },
    };

    setSaving(true);

    addAttendance(attendanceData)
      .then(() => {
        toast.success("Attendance saved successfully");

        resetForm();
        loadAttendance();
      })
      .catch((error) => {
        console.error(
          "Error saving attendance:",
          error
        );

        toast.error(
          error.response?.data?.message ||
            "Unable to save attendance"
        );
      })
      .finally(() => {
        setSaving(false);
      });
  };

  const handleEmployeeFilter = (event) => {
    const employeeId = event.target.value;

    setSelectedEmployeeId(employeeId);
    setLoading(true);

    const request = employeeId
      ? getAttendanceByEmployee(employeeId)
      : getAllAttendance();

    request
      .then((response) => {
        setAttendanceRecords(response.data);
      })
      .catch((error) => {
        console.error(
          "Error filtering attendance:",
          error
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const presentCount = attendanceRecords.filter(
    (record) => record.status === "PRESENT"
  ).length;

  const absentCount = attendanceRecords.filter(
    (record) => record.status === "ABSENT"
  ).length;

  const leaveCount = attendanceRecords.filter(
    (record) => record.status === "LEAVE"
  ).length;

  const getStatusClass = (status) => {
    return `attendance-status ${
      status ? status.toLowerCase() : ""
    }`;
  };

  return (
    <DashboardLayout>
    <div className="attendance-page">
      <div className="attendance-header">
        <div>
          <h1>Attendance Management</h1>

          <p>
            Record and track employee attendance
          </p>
        </div>

        {canModify && (
          <button
            className="attendance-add-btn"
            onClick={() => setShowForm(true)}
          >
            + Add Attendance
          </button>
        )}
      </div>

      <div className="attendance-stat-grid">
        <div className="attendance-stat-card">
          <div>
            <p>Total Records</p>
            <h2>{attendanceRecords.length}</h2>
          </div>

          <span>📋</span>
        </div>

        <div className="attendance-stat-card">
          <div>
            <p>Present</p>
            <h2>{presentCount}</h2>
          </div>

          <span>✅</span>
        </div>

        <div className="attendance-stat-card">
          <div>
            <p>Absent</p>
            <h2>{absentCount}</h2>
          </div>

          <span>❌</span>
        </div>

        <div className="attendance-stat-card">
          <div>
            <p>Leave</p>
            <h2>{leaveCount}</h2>
          </div>

          <span>🗓️</span>
        </div>
      </div>

      {showForm && canModify && (
        <div className="attendance-form-card">
          <div className="attendance-card-header">
            <div>
              <h2>Add Attendance</h2>

              <p>
                Enter the daily attendance details
              </p>
            </div>

            <button
              type="button"
              className="attendance-close-btn"
              onClick={resetForm}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="attendance-form-grid">
              <div className="attendance-form-group">
                <label htmlFor="employeeId">
                  Employee
                </label>

                <select
                  id="employeeId"
                  name="employeeId"
                  value={attendanceForm.employeeId}
                  onChange={handleChange}
                >
                  <option value="">
                    Select employee
                  </option>

                  {employees.map((employee) => (
                    <option
                      key={employee.employeeId}
                      value={employee.employeeId}
                    >
                      {employee.employeeName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="attendance-form-group">
                <label htmlFor="date">
                  Attendance Date
                </label>

                <input
                  id="date"
                  type="date"
                  name="date"
                  value={attendanceForm.date}
                  onChange={handleChange}
                />
              </div>

              <div className="attendance-form-group">
                <label htmlFor="status">
                  Status
                </label>

                <select
                  id="status"
                  name="status"
                  value={attendanceForm.status}
                  onChange={handleChange}
                >
                  <option value="PRESENT">
                    Present
                  </option>

                  <option value="ABSENT">
                    Absent
                  </option>

                  <option value="LEAVE">
                    Leave
                  </option>
                </select>
              </div>

              <div className="attendance-form-group">
                <label htmlFor="checkInTime">
                  Check-in Time
                </label>

                <input
                  id="checkInTime"
                  type="time"
                  name="checkInTime"
                  value={
                    attendanceForm.checkInTime
                  }
                  onChange={handleChange}
                  disabled={
                    attendanceForm.status !==
                    "PRESENT"
                  }
                />
              </div>

              <div className="attendance-form-group">
                <label htmlFor="checkOutTime">
                  Check-out Time
                </label>

                <input
                  id="checkOutTime"
                  type="time"
                  name="checkOutTime"
                  value={
                    attendanceForm.checkOutTime
                  }
                  onChange={handleChange}
                  disabled={
                    attendanceForm.status !==
                    "PRESENT"
                  }
                />
              </div>
            </div>

            <div className="attendance-form-actions">
              <button
                type="submit"
                className="attendance-save-btn"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Save Attendance"}
              </button>

              <button
                type="button"
                className="attendance-cancel-btn"
                onClick={resetForm}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="attendance-table-card">
        <div className="attendance-table-header">
          <div>
            <h2>Attendance Records</h2>

            <p>
              View all employee attendance details
            </p>
          </div>

          <select
            className="attendance-filter"
            value={selectedEmployeeId}
            onChange={handleEmployeeFilter}
          >
            <option value="">
              All Employees
            </option>

            {employees.map((employee) => (
              <option
                key={employee.employeeId}
                value={employee.employeeId}
              >
                {employee.employeeName}
              </option>
            ))}
          </select>
        </div>

        <div className="attendance-table-wrapper">
          <table className="attendance-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Employee</th>
                <th>Date</th>
                <th>Status</th>
                <th>Check In</th>
                <th>Check Out</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="attendance-message"
                  >
                    Loading attendance records...
                  </td>
                </tr>
              ) : attendanceRecords.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="attendance-message"
                  >
                    No attendance records found
                  </td>
                </tr>
              ) : (
                attendanceRecords.map((record) => (
                  <tr key={record.attendanceId}>
                    <td>
                      #{record.attendanceId}
                    </td>

                    <td>
                      <div className="attendance-employee">
                        <div className="attendance-avatar">
                          {record.employee
                            ?.employeeName
                            ?.charAt(0)
                            .toUpperCase() ||
                            record.employeeName
                              ?.charAt(0)
                              .toUpperCase() ||
                            "E"}
                        </div>

                        <div>
                          <strong>
                            {record.employee
                              ?.employeeName ||
                              record.employeeName ||
                              "Unknown employee"}
                          </strong>

                          <span>
                            {record.employee
                              ?.designation ||
                              record.designation ||
                              "Employee"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>{record.date}</td>

                    <td>
                      <span
                        className={getStatusClass(
                          record.status
                        )}
                      >
                        {record.status}
                      </span>
                    </td>

                    <td>
                      {record.checkInTime || "--"}
                    </td>

                    <td>
                      {record.checkOutTime || "--"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </DashboardLayout>
  );
}

export default Attendance;