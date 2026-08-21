import { useEffect, useState } from "react";
import {
  getAttendanceStatus,
  getShiftsSummary
} from "../services/attendanceservice";
import "../style/Attendance.css";
import DashboardLayout from "../components/layout/Dashboardlayout";
import { useToast } from "../components/common/ToastContext";

function Attendance() {
  const toast = useToast();
  
  const [activeTab, setActiveTab] = useState("shift"); // 'shift' or 'status'
  
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  
  const [shiftSummary, setShiftSummary] = useState([]);
  const [statusData, setStatusData] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [shiftFilter, setShiftFilter] = useState("");
  
  const role = localStorage.getItem("role");
  const canModify = role === "ADMIN" || role === "HR" || role === "SUPER_ADMIN"; // Even though SUPER_ADMIN is gone, keeping it doesn't break
  const isEmployee = role === "EMPLOYEE";
  
  const loadData = () => {
    setLoading(true);
    
    // We fetch based on the role and what is needed
    // If it's just an employee, they might just need their status
    if (isEmployee) {
        getAttendanceStatus(selectedDate)
          .then(res => {
              setStatusData(res.data.data);
          })
          .catch(err => {
              console.error(err);
              toast.error("Failed to load attendance status");
          })
          .finally(() => setLoading(false));
    } else {
        Promise.all([
          getShiftsSummary(selectedDate),
          getAttendanceStatus(selectedDate)
        ]).then(([shiftsRes, statusRes]) => {
            setShiftSummary(shiftsRes.data.data);
            setStatusData(statusRes.data.data);
        }).catch(err => {
            console.error(err);
            toast.error("Failed to load attendance data");
        }).finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };
  
  // Computed summaries for cards
  const totalEmployees = statusData.length;
  const presentCount = statusData.filter(d => d.currentStatus === 'PRESENT').length;
  const lateCount = statusData.filter(d => d.currentStatus === 'LATE').length;
  const absentCount = statusData.filter(d => d.currentStatus === 'ABSENT').length;
  const leaveCount = statusData.filter(d => d.currentStatus === 'ON_LEAVE').length;
  const missingCount = statusData.filter(d => d.currentStatus === 'MISSING_CHECK_IN' || d.currentStatus === 'MISSING_CHECK_OUT').length;
  
  const filteredStatusData = statusData.filter(emp => {
      const matchesSearch = emp.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            emp.employeeId.toString().includes(searchQuery);
      const matchesStatus = statusFilter ? emp.currentStatus === statusFilter : true;
      const matchesShift = shiftFilter ? emp.shiftName === shiftFilter : true;
      return matchesSearch && matchesStatus && matchesShift;
  });

  const getStatusClass = (status) => {
    return `attendance-status ${status ? status.toLowerCase() : ""}`;
  };

  return (
    <DashboardLayout>
      <div className="attendance-page">
        <div className="attendance-header">
          <div>
            <h1>Attendance Management</h1>
            <p>View daily attendance and shift status</p>
          </div>
          <div className="attendance-actions">
            <input 
               type="date" 
               value={selectedDate} 
               onChange={handleDateChange} 
               className="attendance-date-picker"
               style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc' }}
            />
          </div>
        </div>

        {/* SUMMARY CARDS */}
        {!isEmployee && (
            <div className="attendance-stat-grid">
              <div className="attendance-stat-card">
                <div><p>Total Employees</p><h2>{totalEmployees}</h2></div>
                <span>👥</span>
              </div>
              <div className="attendance-stat-card">
                <div><p>Present</p><h2>{presentCount}</h2></div>
                <span>✅</span>
              </div>
              <div className="attendance-stat-card">
                <div><p>Late</p><h2>{lateCount}</h2></div>
                <span>⚠️</span>
              </div>
              <div className="attendance-stat-card">
                <div><p>Absent</p><h2>{absentCount}</h2></div>
                <span>❌</span>
              </div>
              <div className="attendance-stat-card">
                <div><p>On Leave</p><h2>{leaveCount}</h2></div>
                <span>🗓️</span>
              </div>
              <div className="attendance-stat-card">
                <div><p>Missing Action</p><h2>{missingCount}</h2></div>
                <span>❓</span>
              </div>
            </div>
        )}

        {!isEmployee && (
            <div className="attendance-tabs" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button 
                 style={{
                     padding: '10px 20px', 
                     border: 'none',
                     borderRadius: '6px',
                     background: activeTab === 'shift' ? '#4f46e5' : '#e5e7eb',
                     color: activeTab === 'shift' ? 'white' : '#374151',
                     cursor: 'pointer',
                     fontWeight: '600'
                 }}
                 onClick={() => setActiveTab('shift')}
              >
                Employees by Shift
              </button>
              <button 
                 style={{
                    padding: '10px 20px', 
                    border: 'none',
                    borderRadius: '6px',
                    background: activeTab === 'status' ? '#4f46e5' : '#e5e7eb',
                    color: activeTab === 'status' ? 'white' : '#374151',
                    cursor: 'pointer',
                    fontWeight: '600'
                }}
                 onClick={() => setActiveTab('status')}
              >
                Current Status
              </button>
            </div>
        )}
        
        {/* SHIFT VIEW */}
        {!isEmployee && activeTab === 'shift' && (
            <div className="shift-view-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
               {loading ? <p>Loading shifts...</p> : shiftSummary.map(shift => (
                   <div className="shift-card" key={shift.shiftId} style={{ background: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                      <div className="shift-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                         <h3 style={{ margin: 0, fontSize: '18px', color: '#111827' }}>{shift.shiftName} <span style={{ fontSize: '14px', color: '#6b7280', marginLeft: '10px' }}>{shift.shiftTiming}</span></h3>
                         <div className="shift-stats" style={{ display: 'flex', gap: '15px', fontSize: '14px', fontWeight: '500' }}>
                             <span style={{ color: '#374151' }}>Total: {shift.totalEmployees}</span>
                             <span style={{ color: '#10b981' }}>Present: {shift.present}</span>
                             <span style={{ color: '#f59e0b' }}>Late: {shift.late}</span>
                             <span style={{ color: '#ef4444' }}>Absent: {shift.absent}</span>
                             <span style={{ color: '#6366f1' }}>Leave: {shift.onLeave}</span>
                         </div>
                      </div>
                      <div className="shift-card-body">
                         <table className="attendance-table compact">
                             <thead>
                                 <tr>
                                     <th>Employee</th>
                                     <th>Department</th>
                                     <th>Check-in</th>
                                     <th>Status</th>
                                 </tr>
                             </thead>
                             <tbody>
                                 {shift.employees.map(emp => (
                                     <tr key={emp.employeeId}>
                                         <td>{emp.employeeName}</td>
                                         <td>{emp.departmentName || '--'}</td>
                                         <td>{emp.actualCheckIn || '--'}</td>
                                         <td><span className={getStatusClass(emp.currentStatus)}>{emp.currentStatus}</span></td>
                                     </tr>
                                 ))}
                                 {shift.employees.length === 0 && (
                                     <tr><td colSpan="4">No employees in this shift</td></tr>
                                 )}
                             </tbody>
                         </table>
                      </div>
                   </div>
               ))}
               {!loading && shiftSummary.length === 0 && <p>No shift data available for this date.</p>}
            </div>
        )}

        {/* STATUS VIEW */}
        {(isEmployee || activeTab === 'status') && (
            <div className="attendance-table-card">
              <div className="attendance-table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                  <h2>{isEmployee ? "My Status" : "Current Attendance Status"}</h2>
                </div>
                {!isEmployee && (
                    <div className="filters-container" style={{ display: 'flex', gap: '10px' }}>
                        <input 
                            type="text" 
                            placeholder="Search employee..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="attendance-filter"
                        />
                        <select 
                            value={statusFilter} 
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="attendance-filter"
                        >
                            <option value="">All Statuses</option>
                            <option value="PRESENT">Present</option>
                            <option value="LATE">Late</option>
                            <option value="ABSENT">Absent</option>
                            <option value="ON_LEAVE">On Leave</option>
                            <option value="MISSING_CHECK_IN">Missing Check-in</option>
                            <option value="MISSING_CHECK_OUT">Missing Check-out</option>
                            <option value="NOT_STARTED">Not Started</option>
                        </select>
                        <select 
                            value={shiftFilter} 
                            onChange={(e) => setShiftFilter(e.target.value)}
                            className="attendance-filter"
                        >
                            <option value="">All Shifts</option>
                            {shiftSummary.map(s => <option key={s.shiftId} value={s.shiftName}>{s.shiftName}</option>)}
                        </select>
                    </div>
                )}
              </div>
              
              <div className="attendance-table-wrapper">
                <table className="attendance-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Shift</th>
                      <th>Expected Timing</th>
                      <th>Actual In</th>
                      <th>Actual Out</th>
                      <th>Hours</th>
                      <th>Late (min)</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>Loading status...</td></tr>
                    ) : filteredStatusData.length === 0 ? (
                      <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>No records found</td></tr>
                    ) : (
                      filteredStatusData.map(emp => (
                        <tr key={emp.employeeId}>
                          <td>
                            <div className="attendance-employee">
                              <div className="attendance-avatar">
                                {emp.employeeName.charAt(0)}
                              </div>
                              <div>
                                <strong>{emp.employeeName}</strong>
                                <span>{emp.designation || 'Employee'} • {emp.departmentName || 'Unknown Dept'}</span>
                              </div>
                            </div>
                          </td>
                          <td>{emp.shiftName}</td>
                          <td>{emp.shiftTiming}</td>
                          <td>{emp.actualCheckIn || '--'}</td>
                          <td>{emp.actualCheckOut || '--'}</td>
                          <td>{emp.workingHours || '--'}</td>
                          <td>{emp.lateDurationMinutes > 0 ? <span style={{color: '#ef4444', fontWeight: 'bold'}}>{emp.lateDurationMinutes}</span> : 0}</td>
                          <td>
                            <span className={getStatusClass(emp.currentStatus)}>
                                {emp.currentStatus}
                            </span>
                          </td>
                        </tr>
                      ))
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

export default Attendance;