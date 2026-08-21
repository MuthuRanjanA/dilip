import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "../components/layout/Dashboardlayout";
import {
  getAttendanceByMonth,
  getEmployeeAttendanceByMonth,
  getTeamAttendanceByMonth,
  getAttendanceByDate,
  getTeamAttendanceByDate,
} from "../services/attendanceservice";
import { getEmployees } from "../services/EmployeeService";
import { getDepartments } from "../services/departmentservice";
import { getAllLeaves } from "../services/leaveservice";
import {
  FaChevronLeft,
  FaChevronRight,
  FaCalendarDay,
  FaCalendarWeek,
  FaCalendarAlt,
  FaSearch,
  FaFilter,
  FaUserCheck,
  FaUserTimes,
  FaClock,
  FaHome,
  FaUmbrellaBeach,
  FaTimesCircle,
  FaInfoCircle,
} from "react-icons/fa";
import "../style/Calendar.css";

function CalendarPage() {
  const role = localStorage.getItem("role") || "EMPLOYEE";
  const employeeId = localStorage.getItem("employeeId");

  const isHrOrAdmin = role === "HR" || role === "ADMIN";
  const isManager = role === "MANAGER";
  const isEmployeeOnly = !isHrOrAdmin && !isManager;

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("month"); // 'month', 'week', 'day'
  const [selectedDateStr, setSelectedDateStr] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [monthlyAttendance, setMonthlyAttendance] = useState([]);
  const [selectedDayAttendance, setSelectedDayAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedDesignation, setSelectedDesignation] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const [loading, setLoading] = useState(false);
  const [dayLoading, setDayLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  // Load monthly calendar data
  useEffect(() => {
    fetchMonthlyData();
  }, [year, month, role, employeeId]);

  // Load filters metadata (employees, departments, leaves)
  useEffect(() => {
    if (isHrOrAdmin || isManager) {
      getDepartments()
        .then((res) => setDepartments(res.data || []))
        .catch(() => {});
      getEmployees()
        .then((res) => setEmployees(res.data || []))
        .catch(() => {});
      getAllLeaves()
        .then((res) => setLeaveRequests(res.data?.data || res.data || []))
        .catch(() => {});
    }
  }, [isHrOrAdmin, isManager]);

  // Load selected date attendance when clicked
  useEffect(() => {
    if (selectedDateStr) {
      fetchDateData(selectedDateStr);
    }
  }, [selectedDateStr, role, employeeId]);

  const fetchMonthlyData = async () => {
    setLoading(true);
    try {
      let res;
      if (isHrOrAdmin) {
        res = await getAttendanceByMonth(year, month);
      } else if (isManager) {
        res = await getTeamAttendanceByMonth(employeeId, year, month);
      } else {
        res = await getEmployeeAttendanceByMonth(employeeId, year, month);
      }
      setMonthlyAttendance(res.data?.data || res.data || []);
    } catch (err) {
      console.error("Error loading monthly calendar data", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDateData = async (dateStr) => {
    setDayLoading(true);
    try {
      let res;
      if (isHrOrAdmin) {
        res = await getAttendanceByDate(dateStr);
      } else if (isManager) {
        res = await getTeamAttendanceByDate(employeeId, dateStr);
      } else {
        const fullList = await getEmployeeAttendanceByMonth(employeeId, year, month);
        const records = (fullList.data?.data || fullList.data || []).filter(
          (r) => r.date === dateStr
        );
        setSelectedDayAttendance(records);
        setDayLoading(false);
        return;
      }
      setSelectedDayAttendance(res.data?.data || res.data || []);
    } catch (err) {
      console.error("Error loading day attendance data", err);
    } finally {
      setDayLoading(false);
    }
  };

  // Month navigation handlers
  const handlePrev = () => {
    if (viewMode === "month") {
      setCurrentDate(new Date(year, month - 2, 1));
    } else if (viewMode === "week") {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 1);
      setCurrentDate(d);
      setSelectedDateStr(d.toISOString().split("T")[0]);
    }
  };

  const handleNext = () => {
    if (viewMode === "month") {
      setCurrentDate(new Date(year, month, 1));
    } else if (viewMode === "week") {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 1);
      setCurrentDate(d);
      setSelectedDateStr(d.toISOString().split("T")[0]);
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(today.toISOString().split("T")[0]);
  };

  // Helper to format date labels
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Calendar Grid Days Builder
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const daysInPrevMonth = new Date(year, month - 1, 0).getDate();

    const days = [];

    // Prev month padding
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const d = new Date(year, month - 2, daysInPrevMonth - i);
      days.push({
        dateObj: d,
        dateStr: d.toISOString().split("T")[0],
        dayNum: daysInPrevMonth - i,
        isCurrentMonth: false,
        isWeekend: d.getDay() === 0 || d.getDay() === 6,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month - 1, i);
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      days.push({
        dateObj: d,
        dateStr: dateStr,
        dayNum: i,
        isCurrentMonth: true,
        isWeekend: d.getDay() === 0 || d.getDay() === 6,
      });
    }

    // Next month padding to complete 35 or 42 grid cells
    const totalCells = days.length > 35 ? 42 : 35;
    const remainingCells = totalCells - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      const d = new Date(year, month, i);
      days.push({
        dateObj: d,
        dateStr: d.toISOString().split("T")[0],
        dayNum: i,
        isCurrentMonth: false,
        isWeekend: d.getDay() === 0 || d.getDay() === 6,
      });
    }

    return days;
  }, [year, month]);

  // Index attendance by dateStr
  const attendanceByDateMap = useMemo(() => {
    const map = {};
    monthlyAttendance.forEach((rec) => {
      if (!map[rec.date]) {
        map[rec.date] = [];
      }
      map[rec.date].push(rec);
    });
    return map;
  }, [monthlyAttendance]);

  // Unique designations for filter dropdown
  const uniqueDesignations = useMemo(() => {
    const set = new Set();
    employees.forEach((e) => {
      if (e.designation) set.add(e.designation);
    });
    return Array.from(set);
  }, [employees]);

  // Filtered day records for HR/Admin/Manager list view
  const filteredDayRecords = useMemo(() => {
    return selectedDayAttendance.filter((rec) => {
      const name = rec.employeeName || "";
      const matchesSearch =
        searchQuery === "" ||
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (rec.designation && rec.designation.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesDept =
        selectedDepartment === "" ||
        (rec.departmentName && rec.departmentName === selectedDepartment);

      const matchesDesig =
        selectedDesignation === "" ||
        (rec.designation && rec.designation === selectedDesignation);

      const matchesStatus =
        selectedStatus === "" ||
        (rec.status && rec.status.toUpperCase() === selectedStatus.toUpperCase());

      return matchesSearch && matchesDept && matchesDesig && matchesStatus;
    });
  }, [
    selectedDayAttendance,
    searchQuery,
    selectedDepartment,
    selectedDesignation,
    selectedStatus,
  ]);

  // Daily Summary Counters for selected date
  const daySummary = useMemo(() => {
    let present = 0, absent = 0, late = 0, wfh = 0, leave = 0, halfDay = 0;
    selectedDayAttendance.forEach((r) => {
      const st = (r.status || "").toUpperCase();
      if (st === "PRESENT") present++;
      else if (st === "ABSENT") absent++;
      else if (st === "LATE") late++;
      else if (st === "WORK_FROM_HOME" || st === "WFH" || r.workLocation === "WFH") wfh++;
      else if (st === "LEAVE" || st === "ON_LEAVE") leave++;
      else if (st === "HALF_DAY") halfDay++;
    });
    return { present, absent, late, wfh, leave, halfDay, total: selectedDayAttendance.length };
  }, [selectedDayAttendance]);

  const todayStr = new Date().toISOString().split("T")[0];

  const getStatusBadge = (status, workLocation) => {
    const st = (status || "").toUpperCase();
    if (st === "PRESENT") return <span className="cal-badge badge-present">Present</span>;
    if (st === "ABSENT") return <span className="cal-badge badge-absent">Absent</span>;
    if (st === "LATE") return <span className="cal-badge badge-late">Late</span>;
    if (st === "HALF_DAY") return <span className="cal-badge badge-halfday">Half Day</span>;
    if (st === "LEAVE" || st === "ON_LEAVE") return <span className="cal-badge badge-leave">On Leave</span>;
    if (workLocation === "WFH" || st === "WORK_FROM_HOME" || st === "WFH") return <span className="cal-badge badge-wfh">WFH</span>;
    return <span className="cal-badge badge-notmarked">Not Marked</span>;
  };

  const handleOpenDetail = (record) => {
    setSelectedRecord(record);
    setShowDetailModal(true);
  };

  return (
    <DashboardLayout>
      <div className="calendar-page-container">
        {/* Header Bar */}
        <header className="calendar-header">
          <div className="calendar-header-title">
            <h1>
              <FaCalendarAlt className="header-icon" /> ERP Calendar & Attendance
            </h1>
            <p>
              {isHrOrAdmin
                ? "Organization-wide visual attendance calendar & operational roster"
                : isManager
                ? "Team attendance roster & daily breakdown"
                : "Personal attendance schedule & leave calendar"}
            </p>
          </div>

          <div className="calendar-controls">
            <div className="view-mode-toggle">
              <button
                className={`toggle-btn ${viewMode === "month" ? "active" : ""}`}
                onClick={() => setViewMode("month")}
              >
                <FaCalendarAlt /> Month
              </button>
              <button
                className={`toggle-btn ${viewMode === "week" ? "active" : ""}`}
                onClick={() => setViewMode("week")}
              >
                <FaCalendarWeek /> Week
              </button>
              <button
                className={`toggle-btn ${viewMode === "day" ? "active" : ""}`}
                onClick={() => setViewMode("day")}
              >
                <FaCalendarDay /> Day
              </button>
            </div>

            <div className="month-nav-group">
              <button className="nav-arrow-btn" onClick={handlePrev} title="Previous">
                <FaChevronLeft />
              </button>
              <span className="current-month-display">
                {monthNames[month - 1]} {year}
              </span>
              <button className="nav-arrow-btn" onClick={handleNext} title="Next">
                <FaChevronRight />
              </button>
              <button className="today-btn" onClick={handleToday}>
                Today
              </button>
            </div>
          </div>
        </header>

        {/* Quick Legend Bar */}
        <div className="calendar-legend-bar">
          <div className="legend-item"><span className="legend-dot dot-present"></span> Present</div>
          <div className="legend-item"><span className="legend-dot dot-late"></span> Late</div>
          <div className="legend-item"><span className="legend-dot dot-wfh"></span> WFH</div>
          <div className="legend-item"><span className="legend-dot dot-leave"></span> Leave</div>
          <div className="legend-item"><span className="legend-dot dot-absent"></span> Absent</div>
          <div className="legend-item"><span className="legend-dot dot-weekend"></span> Weekend</div>
        </div>

        {/* Main Grid & Side Detail View Split */}
        <div className="calendar-main-split">
          {/* Calendar Grid Section */}
          <div className="calendar-grid-wrapper">
            {viewMode === "month" && (
              <div className="month-grid">
                <div className="day-name-header">Sun</div>
                <div className="day-name-header">Mon</div>
                <div className="day-name-header">Tue</div>
                <div className="day-name-header">Wed</div>
                <div className="day-name-header">Thu</div>
                <div className="day-name-header">Fri</div>
                <div className="day-name-header">Sat</div>

                {calendarDays.map((day, idx) => {
                  const dayRecords = attendanceByDateMap[day.dateStr] || [];
                  const isSelected = day.dateStr === selectedDateStr;
                  const isToday = day.dateStr === todayStr;

                  return (
                    <div
                      key={idx}
                      className={`grid-cell ${
                        !day.isCurrentMonth ? "other-month" : ""
                      } ${day.isWeekend ? "weekend-cell" : ""} ${
                        isToday ? "today-cell" : ""
                      } ${isSelected ? "selected-cell" : ""}`}
                      onClick={() => {
                        setSelectedDateStr(day.dateStr);
                        if (day.dateObj.getMonth() + 1 !== month) {
                          setCurrentDate(new Date(day.dateObj.getFullYear(), day.dateObj.getMonth(), 1));
                        }
                      }}
                    >
                      <div className="cell-header">
                        <span className={`day-number ${isToday ? "today-badge" : ""}`}>
                          {day.dayNum}
                        </span>
                        {day.isWeekend && day.isCurrentMonth && (
                          <span className="weekend-tag">Weekend</span>
                        )}
                      </div>

                      <div className="cell-indicators">
                        {loading ? (
                          <div className="cell-skeleton"></div>
                        ) : dayRecords.length > 0 ? (
                          isEmployeeOnly ? (
                            <div className="single-emp-indicator">
                              {getStatusBadge(dayRecords[0].status, dayRecords[0].workLocation)}
                              {dayRecords[0].checkInTime && (
                                <small className="checkin-time">
                                  <FaClock /> {dayRecords[0].checkInTime.slice(0, 5)}
                                </small>
                              )}
                            </div>
                          ) : (
                            <div className="aggregate-indicators">
                              <span className="count-pill pill-present" title="Present">
                                P: {dayRecords.filter((r) => r.status === "PRESENT").length}
                              </span>
                              {dayRecords.filter((r) => r.status === "LATE").length > 0 && (
                                <span className="count-pill pill-late" title="Late">
                                  L: {dayRecords.filter((r) => r.status === "LATE").length}
                                </span>
                              )}
                              {dayRecords.filter((r) => r.status === "ABSENT").length > 0 && (
                                <span className="count-pill pill-absent" title="Absent">
                                  A: {dayRecords.filter((r) => r.status === "ABSENT").length}
                                </span>
                              )}
                            </div>
                          )
                        ) : day.isCurrentMonth && !day.isWeekend ? (
                          <div className="empty-indicator">--</div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {viewMode === "week" && (
              <div className="week-view-container">
                <div className="week-view-notice">
                  <FaInfoCircle /> Weekly schedule view for {monthNames[month - 1]} {year}
                </div>
                <div className="week-grid">
                  {calendarDays.slice(0, 7).map((d, i) => {
                    const records = attendanceByDateMap[d.dateStr] || [];
                    return (
                      <div key={i} className="week-day-card">
                        <div className="week-card-header">
                          <h5>{d.dateObj.toLocaleDateString("en-US", { weekday: "short" })}</h5>
                          <span>{d.dateStr}</span>
                        </div>
                        <div className="week-card-body">
                          {records.length === 0 ? (
                            <p className="text-muted">No attendance logs</p>
                          ) : (
                            records.map((r, idx) => (
                              <div key={idx} className="week-record-item" onClick={() => handleOpenDetail(r)}>
                                <strong>{r.employeeName || "Employee"}</strong>
                                {getStatusBadge(r.status, r.workLocation)}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {viewMode === "day" && (
              <div className="day-view-container">
                <h3>Attendance Details for {selectedDateStr}</h3>
                <p>Showing records recorded for this specific date</p>
              </div>
            )}
          </div>

          {/* Right Side Attendance Inspection Panel for HR/Admin/Manager */}
          <div className="calendar-side-panel">
            <div className="side-panel-card">
              <div className="panel-header">
                <div>
                  <h3>Daily Roster Inspection</h3>
                  <p className="selected-date-title">{selectedDateStr}</p>
                </div>
                <span className="total-records-count">{filteredDayRecords.length} Employees</span>
              </div>

              {/* Day Attendance Summary Pills */}
              <div className="day-summary-pills">
                <div className="sum-pill sum-present">
                  <FaUserCheck /> Present: {daySummary.present}
                </div>
                <div className="sum-pill sum-late">
                  <FaClock /> Late: {daySummary.late}
                </div>
                <div className="sum-pill sum-wfh">
                  <FaHome /> WFH: {daySummary.wfh}
                </div>
                <div className="sum-pill sum-absent">
                  <FaUserTimes /> Absent: {daySummary.absent}
                </div>
                <div className="sum-pill sum-leave">
                  <FaUmbrellaBeach /> Leave: {daySummary.leave}
                </div>
              </div>

              {/* Filters for HR/Admin */}
              {(isHrOrAdmin || isManager) && (
                <div className="panel-filters-box">
                  <div className="search-input-wrapper">
                    <FaSearch className="search-icon" />
                    <input
                      type="text"
                      placeholder="Search employee name or designation..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="filter-dropdowns-row">
                    <select
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                    >
                      <option value="">All Departments</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.departmentName}>
                          {d.departmentName}
                        </option>
                      ))}
                    </select>

                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                      <option value="">All Statuses</option>
                      <option value="PRESENT">Present</option>
                      <option value="LATE">Late</option>
                      <option value="ABSENT">Absent</option>
                      <option value="HALF_DAY">Half Day</option>
                      <option value="LEAVE">On Leave</option>
                      <option value="WFH">WFH</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Attendance List */}
              <div className="day-records-list">
                {dayLoading ? (
                  <div className="panel-message">Loading date attendance...</div>
                ) : filteredDayRecords.length === 0 ? (
                  <div className="panel-message empty">
                    No attendance records found for {selectedDateStr} matching filters.
                  </div>
                ) : (
                  filteredDayRecords.map((rec) => (
                    <div
                      key={rec.attendanceId || rec.employeeId}
                      className="employee-record-card"
                      onClick={() => handleOpenDetail(rec)}
                    >
                      <div className="emp-avatar">
                        {(rec.employeeName || "E").charAt(0).toUpperCase()}
                      </div>
                      <div className="emp-info">
                        <strong>{rec.employeeName || "Unknown Employee"}</strong>
                        <span>{rec.designation || "Employee"} • {rec.departmentName || "General"}</span>
                        <div className="timing-info">
                          <small>In: {rec.checkInTime || "--"}</small>
                          <small>Out: {rec.checkOutTime || "--"}</small>
                          <small>Hours: {rec.workingHours || "--"}</small>
                        </div>
                      </div>
                      <div className="emp-status-box">
                        {getStatusBadge(rec.status, rec.workLocation)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Detail Modal */}
      {showDetailModal && selectedRecord && (
        <div className="modal-backdrop">
          <div className="modal-content-card">
            <div className="modal-header">
              <h2>Employee Attendance Detail</h2>
              <button className="close-btn" onClick={() => setShowDetailModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-emp-profile">
                <div className="profile-avatar">
                  {(selectedRecord.employeeName || "E").charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4>{selectedRecord.employeeName}</h4>
                  <p>{selectedRecord.designation} — {selectedRecord.departmentName}</p>
                </div>
              </div>

              <div className="detail-grid">
                <div className="detail-item">
                  <label>Attendance Date</label>
                  <span>{selectedRecord.date}</span>
                </div>
                <div className="detail-item">
                  <label>Status</label>
                  <span>{getStatusBadge(selectedRecord.status, selectedRecord.workLocation)}</span>
                </div>
                <div className="detail-item">
                  <label>Shift Assigned</label>
                  <span>{selectedRecord.shiftName || "Standard"}</span>
                </div>
                <div className="detail-item">
                  <label>Check-in Time</label>
                  <span>{selectedRecord.checkInTime || "Not Checked In"}</span>
                </div>
                <div className="detail-item">
                  <label>Check-out Time</label>
                  <span>{selectedRecord.checkOutTime || "Not Checked Out"}</span>
                </div>
                <div className="detail-item">
                  <label>Calculated Working Hours</label>
                  <span>{selectedRecord.workingHours || "--"}</span>
                </div>
                <div className="detail-item">
                  <label>Late Duration</label>
                  <span className={selectedRecord.lateDurationMinutes > 0 ? "text-danger" : ""}>
                    {selectedRecord.lateDurationMinutes ? `${selectedRecord.lateDurationMinutes} mins` : "0 mins"}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Early Departure</label>
                  <span className={selectedRecord.earlyDepartureMinutes > 0 ? "text-warning" : ""}>
                    {selectedRecord.earlyDepartureMinutes ? `${selectedRecord.earlyDepartureMinutes} mins` : "0 mins"}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Overtime</label>
                  <span className={selectedRecord.overtimeMinutes > 0 ? "text-success" : ""}>
                    {selectedRecord.overtimeMinutes ? `${selectedRecord.overtimeMinutes} mins` : "0 mins"}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Work Location</label>
                  <span>{selectedRecord.workLocation || "OFFICE"}</span>
                </div>
              </div>

              {selectedRecord.notes && (
                <div className="notes-box">
                  <label>Notes / Remarks:</label>
                  <p>{selectedRecord.notes}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowDetailModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default CalendarPage;
