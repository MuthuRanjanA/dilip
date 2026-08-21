import { useState, useEffect } from "react";
import DashboardLayout from "../components/layout/Dashboardlayout";
import api from "../api/axiosInstance";
import { FaClock, FaPlus, FaSave, FaTimes } from "react-icons/fa";

function ShiftManagement() {
  const role = localStorage.getItem("role") || "EMPLOYEE";
  const isHrOrAdmin = role === "HR" || role === "ADMIN";

  const [shifts, setShifts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingShiftId, setEditingShiftId] = useState(null);

  const [newShift, setNewShift] = useState({
    name: "",
    startTime: "09:00:00",
    endTime: "17:00:00",
    duration: 8.0,
    gracePeriodMinutes: 10,
    nightShiftAllowanceAmount: 0.0,
    active: true
  });

  const [assignment, setAssignment] = useState({
    employeeId: "",
    shiftId: "",
    effectiveFrom: new Date().toISOString().split("T")[0],
    effectiveTo: ""
  });

  useEffect(() => {
    if (isHrOrAdmin) {
      loadData();
    }
  }, [isHrOrAdmin]);

  const loadData = async () => {
    setLoading(true);
    try {
      const shiftRes = await api.get("/shifts");
      setShifts(shiftRes.data || []);
      const empRes = await api.get("/employees");
      setEmployees(empRes.data?.data || empRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShift = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/shifts/${editingShiftId}`, newShift);
      } else {
        await api.post("/shifts", newShift);
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      alert(isEditing ? "Failed to update shift" : "Failed to create shift");
    }
  };

  const openEditModal = (shift) => {
    setIsEditing(true);
    setEditingShiftId(shift.id);
    setNewShift({
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
      duration: shift.duration,
      gracePeriodMinutes: shift.gracePeriodMinutes,
      nightShiftAllowanceAmount: shift.nightShiftAllowanceAmount || 0.0,
      active: shift.active
    });
    setShowModal(true);
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setEditingShiftId(null);
    setNewShift({
      name: "",
      startTime: "09:00:00",
      endTime: "17:00:00",
      duration: 8.0,
      gracePeriodMinutes: 10,
      nightShiftAllowanceAmount: 0.0,
      active: true
    });
    setShowModal(true);
  };

  const handleAssignShift = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/shifts/assign?employeeId=${assignment.employeeId}&shiftId=${assignment.shiftId}&effectiveFrom=${assignment.effectiveFrom}&effectiveTo=${assignment.effectiveTo}`);
      setShowAssignModal(false);
      alert("Shift assigned successfully");
    } catch (err) {
      alert("Failed to assign shift");
    }
  };

  if (!isHrOrAdmin) {
    return (
      <DashboardLayout>
        <div className="container mt-5">
          <h2>Access Denied</h2>
          <p>You do not have permission to manage shifts.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container-fluid mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2><FaClock /> Shift Management</h2>
          <div>
            <button className="btn btn-primary me-2" onClick={openCreateModal}>
              <FaPlus /> Create Shift
            </button>
            <button className="btn btn-success" onClick={() => setShowAssignModal(true)}>
              <FaSave /> Assign Shift to Employee
            </button>
          </div>
        </div>

        {loading ? (
          <p>Loading shifts...</p>
        ) : (
          <div className="card">
            <div className="card-body">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Shift Name</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Duration (hrs)</th>
                    <th>Grace Period (mins)</th>
                    <th>Allowance (₹)</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {shifts.map((s) => (
                    <tr key={s.id}>
                      <td>{s.name}</td>
                      <td>{s.startTime}</td>
                      <td>{s.endTime}</td>
                      <td>{s.duration}</td>
                      <td>{s.gracePeriodMinutes}</td>
                      <td>{s.nightShiftAllowanceAmount || 0}</td>
                      <td>{s.active ? "Active" : "Inactive"}</td>
                      <td>
                        <button className="btn btn-sm btn-outline-primary" onClick={() => openEditModal(s)}>
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                  {shifts.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center">No shifts configured</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{isEditing ? "Edit Shift" : "Create New Shift"}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleCreateShift}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Shift Name</label>
                    <input type="text" className="form-control" required
                      value={newShift.name} onChange={e => setNewShift({...newShift, name: e.target.value})} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Start Time</label>
                    <input type="time" step="1" className="form-control" required
                      value={newShift.startTime} onChange={e => setNewShift({...newShift, startTime: e.target.value})} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">End Time</label>
                    <input type="time" step="1" className="form-control" required
                      value={newShift.endTime} onChange={e => setNewShift({...newShift, endTime: e.target.value})} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Grace Period (Minutes)</label>
                    <input type="number" className="form-control" required
                      value={newShift.gracePeriodMinutes} onChange={e => setNewShift({...newShift, gracePeriodMinutes: parseInt(e.target.value)})} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Night Shift Allowance (₹ per shift)</label>
                    <input type="number" step="0.01" className="form-control" required
                      value={newShift.nightShiftAllowanceAmount} onChange={e => setNewShift({...newShift, nightShiftAllowanceAmount: parseFloat(e.target.value)})} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
                  <button type="submit" className="btn btn-primary">{isEditing ? "Update Shift" : "Save Shift"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showAssignModal && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Assign Shift</h5>
                <button type="button" className="btn-close" onClick={() => setShowAssignModal(false)}></button>
              </div>
              <form onSubmit={handleAssignShift}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Employee</label>
                    <select className="form-select" required
                      value={assignment.employeeId} onChange={e => setAssignment({...assignment, employeeId: e.target.value})}>
                      <option value="">Select Employee</option>
                      {employees.map(emp => (
                        <option key={emp.employeeId} value={emp.employeeId}>
                          {emp.employeeName} {emp.employeeCode ? `(${emp.employeeCode})` : `(ID: ${emp.employeeId})`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Shift</label>
                    <select className="form-select" required
                      value={assignment.shiftId} onChange={e => setAssignment({...assignment, shiftId: e.target.value})}>
                      <option value="">Select Shift</option>
                      {shifts.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Effective From</label>
                    <input type="date" className="form-control" required
                      value={assignment.effectiveFrom} onChange={e => setAssignment({...assignment, effectiveFrom: e.target.value})} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Effective To (Optional)</label>
                    <input type="date" className="form-control"
                      value={assignment.effectiveTo} onChange={e => setAssignment({...assignment, effectiveTo: e.target.value})} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAssignModal(false)}>Close</button>
                  <button type="submit" className="btn btn-primary">Assign</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default ShiftManagement;
