import { useState, useEffect } from "react";
import DashboardLayout from "../components/layout/Dashboardlayout";
import { getAttendanceByDate, getAttendanceByMonth } from "../services/attendanceservice";
import { getDepartments } from "../services/departmentservice";
import { FaFileCsv, FaFilter, FaCalendarAlt, FaDownload, FaTable } from "react-icons/fa";

function ReportsPage() {
  const [reportType, setReportType] = useState("daily"); // 'daily' or 'monthly'
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [departments, setDepartments] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getDepartments()
      .then((res) => setDepartments(res.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchReportData();
  }, [reportType, selectedDate, selectedYear, selectedMonth, selectedDepartment]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      let res;
      if (reportType === "daily") {
        res = await getAttendanceByDate(selectedDate);
      } else {
        res = await getAttendanceByMonth(selectedYear, selectedMonth);
      }
      let list = res.data?.data || res.data || [];
      if (selectedDepartment) {
        list = list.filter((r) => r.departmentName === selectedDepartment);
      }
      setRecords(list);
    } catch (err) {
      console.error("Error fetching report data", err);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (records.length === 0) return;

    let csvContent = "data:text/csv;charset=utf-8,";

    if (reportType === "daily") {
      csvContent += "ID,Employee Name,Designation,Department,Date,Shift,Check In,Check Out,Working Hours,Late (mins),Early (mins),Overtime (mins),Night Allowance,Status,Work Location\n";
      records.forEach((r) => {
        const row = [
          r.attendanceId || "",
          `"${r.employeeName || ""}"`,
          `"${r.designation || ""}"`,
          `"${r.departmentName || ""}"`,
          r.date || "",
          `"${r.shiftName || "Regular"}"`,
          r.checkInTime || "--",
          r.checkOutTime || "--",
          r.workingHours || "--",
          r.lateDurationMinutes || "0",
          r.earlyDepartureMinutes || "0",
          r.overtimeMinutes || "0",
          r.nightShiftAllowanceEarned || "0",
          r.status || "",
          r.workLocation || "OFFICE",
        ].join(",");
        csvContent += row + "\n";
      });
    } else {
      csvContent += "ID,Employee Name,Designation,Department,Date,Status,Hours\n";
      records.forEach((r) => {
        const row = [
          r.attendanceId || "",
          `"${r.employeeName || ""}"`,
          `"${r.designation || ""}"`,
          `"${r.departmentName || ""}"`,
          r.date || "",
          r.status || "",
          r.workingHours || "--",
        ].join(",");
        csvContent += row + "\n";
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `JAM_ERP_Attendance_Report_${reportType}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout>
      <div className="reports-page-container">
        <div className="reports-header">
          <div>
            <h1><FaTable /> Attendance & Operational Reports</h1>
            <p>Generate, filter, and export daily and monthly attendance analytics</p>
          </div>

          <button className="export-csv-btn" onClick={exportToCSV} disabled={records.length === 0}>
            <FaFileCsv /> Export CSV Report
          </button>
        </div>

        {/* Filter Configuration Box */}
        <div className="reports-filter-card">
          <div className="filter-type-switch">
            <button
              className={`switch-btn ${reportType === "daily" ? "active" : ""}`}
              onClick={() => setReportType("daily")}
            >
              Daily Attendance Report
            </button>
            <button
              className={`switch-btn ${reportType === "monthly" ? "active" : ""}`}
              onClick={() => setReportType("monthly")}
            >
              Monthly Attendance Summary
            </button>
          </div>

          <div className="filter-inputs-grid">
            {reportType === "daily" ? (
              <div className="filter-group">
                <label>Select Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
            ) : (
              <>
                <div className="filter-group">
                  <label>Year</label>
                  <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
                    {[2024, 2025, 2026, 2027].map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <div className="filter-group">
                  <label>Month</label>
                  <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}>
                    {[
                      "January", "February", "March", "April", "May", "June",
                      "July", "August", "September", "October", "November", "December"
                    ].map((m, idx) => (
                      <option key={idx + 1} value={idx + 1}>{m}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div className="filter-group">
              <label>Filter by Department</label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.departmentName}>{d.departmentName}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="reports-table-card">
          <div className="table-card-header">
            <h3>Report Records ({records.length})</h3>
          </div>

          <div className="table-responsive">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>#ID</th>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Date</th>
                  <th>Shift</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Working Hours</th>
                  <th>Overtime/Late</th>
                  <th>Allowance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="table-msg">Loading report data...</td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="table-msg">No records found for the selected filter criteria.</td>
                  </tr>
                ) : (
                  records.map((r) => (
                    <tr key={r.attendanceId}>
                      <td>#{r.attendanceId}</td>
                      <td>
                        <strong>{r.employeeName}</strong>
                        <small className="d-block text-muted">{r.designation}</small>
                      </td>
                      <td>{r.departmentName || "General"}</td>
                      <td>{r.date}</td>
                      <td>{r.shiftName || "Regular"}</td>
                      <td>{r.checkInTime || "--"}</td>
                      <td>{r.checkOutTime || "--"}</td>
                      <td>{r.workingHours || "--"}</td>
                      <td>
                        <small className="d-block text-danger">Late: {r.lateDurationMinutes || 0}m</small>
                        <small className="d-block text-success">OT: {r.overtimeMinutes || 0}m</small>
                      </td>
                      <td>₹{r.nightShiftAllowanceEarned || 0}</td>
                      <td>
                        <span className={`status-tag tag-${(r.status || "").toLowerCase()}`}>
                          {r.status}
                        </span>
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

export default ReportsPage;
