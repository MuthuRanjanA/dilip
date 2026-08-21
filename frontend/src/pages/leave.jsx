import { useEffect, useState, useMemo } from "react";
import DashboardLayout from "../components/layout/Dashboardlayout";
import AlertPopup from "../components/common/alert";
import { useToast } from "../components/common/ToastContext";
import {
  applyLeave,
  getAllLeaves,
  getEmployeeLeaves,
  getTeamLeaves,
  approveLeave,
  rejectLeave,
} from "../services/leaveservice";
import {
  FaCalendarCheck,
  FaCalendarPlus,
  FaCheck,
  FaTimes,
  FaClock,
  FaUserCheck,
  FaCommentDots,
} from "react-icons/fa";
import "../style/asset.css";

const LEAVE_TYPES = ["CASUAL", "SICK", "ANNUAL", "UNPAID"];

function LeaveManagement() {
  const toast = useToast();
  const role = localStorage.getItem("role");
  const employeeId = localStorage.getItem("employeeId");

  const canApprove = role === "ADMIN" || role === "HR" || role === "MANAGER";
  const canViewAll = role === "ADMIN" || role === "HR";

  const [activeTab, setActiveTab] = useState("my"); // "my", "team", "all"
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApplyForm, setShowApplyForm] = useState(false);

  // Apply Form
  const [form, setForm] = useState({
    leaveType: "CASUAL",
    fromDate: "",
    toDate: "",
    reason: "",
  });

  // Approval Modal State
  const [approvalModal, setApprovalModal] = useState({
    show: false,
    leave: null,
    action: "APPROVE", // "APPROVE" or "REJECT"
    comment: "",
  });

  const loadLeaves = async () => {
    setLoading(true);
    try {
      if (activeTab === "my" && employeeId) {
        const res = await getEmployeeLeaves(employeeId);
        setLeaves(res.data?.data || res.data || []);
      } else if (activeTab === "team" && employeeId) {
        const res = await getTeamLeaves(employeeId);
        setLeaves(res.data?.data || res.data || []);
      } else if (activeTab === "all" && canViewAll) {
        const res = await getAllLeaves();
        setLeaves(res.data?.data || res.data || []);
      }
    } catch (err) {
      console.error("Error loading leave requests:", err);
      toast.error("Failed to load leave records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, [activeTab]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!form.fromDate || !form.toDate || !form.reason) {
      toast.error("Please fill all required leave fields");
      return;
    }

    try {
      const payload = {
        employee: { employeeId: Number(employeeId) },
        leaveType: form.leaveType,
        fromDate: form.fromDate,
        toDate: form.toDate,
        reason: form.reason,
      };

      await applyLeave(payload);
      toast.success("Leave request submitted successfully!");
      setShowApplyForm(false);
      setForm({ leaveType: "CASUAL", fromDate: "", toDate: "", reason: "" });
      loadLeaves();
    } catch (err) {
      console.error("Apply Leave Error:", err);
      toast.error(err.response?.data?.message || "Failed to submit leave request");
    }
  };

  const handleConfirmApproval = async () => {
    const { leave, action, comment } = approvalModal;
    setApprovalModal({ show: false, leave: null, action: "APPROVE", comment: "" });

    try {
      if (action === "APPROVE") {
        await approveLeave(leave.id, employeeId, comment);
        toast.success("Leave request approved!");
      } else {
        await rejectLeave(leave.id, employeeId, comment);
        toast.success("Leave request rejected");
      }
      loadLeaves();
    } catch (err) {
      toast.error(err.response?.data?.message || "Approval action failed");
    }
  };

  return (
    <DashboardLayout>
      <div className="asset-page">
        {/* Header */}
        <div className="asset-header">
          <div>
            <h1>Leave & Time-Off Management</h1>
            <p>Request leave, view balances, and process team leave approvals</p>
          </div>
          <button className="asset-add-btn" onClick={() => setShowApplyForm(true)}>
            <FaCalendarPlus /> Request Leave
          </button>
        </div>

        {/* Workspace Tabs */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <button
            className={`btn-icon-action ${activeTab === "my" ? "btn-process" : ""}`}
            style={{ padding: "10px 18px", fontSize: "14px" }}
            onClick={() => setActiveTab("my")}
          >
            My Leave Requests
          </button>

          {canApprove && (
            <button
              className={`btn-icon-action ${activeTab === "team" ? "btn-process" : ""}`}
              style={{ padding: "10px 18px", fontSize: "14px" }}
              onClick={() => setActiveTab("team")}
            >
              Team Approvals
            </button>
          )}

          {canViewAll && (
            <button
              className={`btn-icon-action ${activeTab === "all" ? "btn-process" : ""}`}
              style={{ padding: "10px 18px", fontSize: "14px" }}
              onClick={() => setActiveTab("all")}
            >
              All Company Leaves
            </button>
          )}
        </div>

        {/* Apply Form Card */}
        {showApplyForm && (
          <div className="asset-form-card" style={{ marginBottom: "24px" }}>
            <div className="asset-card-header">
              <h2>New Leave Application</h2>
              <button className="asset-close-btn" onClick={() => setShowApplyForm(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div className="asset-form-grid">
                <div className="asset-form-group">
                  <label>Leave Type *</label>
                  <select
                    value={form.leaveType}
                    onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
                  >
                    {LEAVE_TYPES.map((lt) => (
                      <option key={lt} value={lt}>
                        {lt} LEAVE
                      </option>
                    ))}
                  </select>
                </div>

                <div className="asset-form-group">
                  <label>From Date *</label>
                  <input
                    type="date"
                    value={form.fromDate}
                    onChange={(e) => setForm({ ...form, fromDate: e.target.value })}
                    required
                  />
                </div>

                <div className="asset-form-group">
                  <label>To Date *</label>
                  <input
                    type="date"
                    value={form.toDate}
                    onChange={(e) => setForm({ ...form, toDate: e.target.value })}
                    required
                  />
                </div>

                <div className="asset-form-group" style={{ gridColumn: "span 3" }}>
                  <label>Reason for Leave *</label>
                  <input
                    type="text"
                    placeholder="Provide details..."
                    value={form.reason}
                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="asset-form-actions">
                <button type="submit" className="asset-save-btn">
                  Submit Leave Request
                </button>
                <button
                  type="button"
                  className="asset-cancel-btn"
                  onClick={() => setShowApplyForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Leaves Table */}
        <div className="asset-table-card">
          <div className="asset-table-header">
            <div>
              <h2>
                {activeTab === "my"
                  ? "My Leave Records"
                  : activeTab === "team"
                  ? "Pending Team Leave Requests"
                  : "All Leave Applications"}
              </h2>
              <p>Total: {leaves.length} records</p>
            </div>
          </div>

          <div className="asset-table-wrapper">
            <table className="asset-table">
              <thead>
                <tr>
                  <th>Ref #</th>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Approver / Notes</th>
                  {activeTab !== "my" && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      Loading leave requests...
                    </td>
                  </tr>
                ) : leaves.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      No leave requests found.
                    </td>
                  </tr>
                ) : (
                  leaves.map((item) => (
                    <tr key={item.id}>
                      <td>#LR-{item.id}</td>
                      <td>
                        <strong>{item.employee?.employeeName || "Employee #" + item.employeeId}</strong>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>
                          {item.employee?.designation || "-"}
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            fontWeight: "700",
                            fontSize: "12px",
                            color: "#2563eb",
                            background: "#eff6ff",
                            padding: "4px 8px",
                            borderRadius: "6px",
                          }}
                        >
                          {item.leaveType || "CASUAL"}
                        </span>
                      </td>
                      <td>
                        {item.fromDate} to {item.toDate}
                      </td>
                      <td>{item.reason}</td>
                      <td>
                        <span
                          className={`asset-status ${
                            item.status === "APPROVED"
                              ? "available"
                              : item.status === "REJECTED"
                              ? "damaged"
                              : "under_repair"
                          }`}
                        >
                          {item.status || "PENDING"}
                        </span>
                      </td>
                      <td>
                        {item.managerComment ? (
                          <div>
                            <small>
                              <strong>Comment:</strong> {item.managerComment}
                            </small>
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                      {activeTab !== "my" && (
                        <td>
                          {item.status === "PENDING" ? (
                            <div className="asset-actions">
                              <button
                                className="btn-icon-action btn-pay"
                                onClick={() =>
                                  setApprovalModal({
                                    show: true,
                                    leave: item,
                                    action: "APPROVE",
                                    comment: "",
                                  })
                                }
                              >
                                <FaCheck /> Approve
                              </button>

                              <button
                                className="btn-icon-action btn-delete"
                                onClick={() =>
                                  setApprovalModal({
                                    show: true,
                                    leave: item,
                                    action: "REJECT",
                                    comment: "",
                                  })
                                }
                              >
                                <FaTimes /> Reject
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: "12px", color: "#94a3b8" }}>Processed</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Approval / Rejection Modal */}
      {approvalModal.show && (
        <div
          className="modal-overlay"
          onClick={() => setApprovalModal({ show: false, leave: null, action: "APPROVE", comment: "" })}
        >
          <div className="modal-card" style={{ maxWidth: "450px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {approvalModal.action === "APPROVE" ? "Approve" : "Reject"} Leave Request #LR-
                {approvalModal.leave?.id}
              </h3>
            </div>
            <div className="modal-body">
              <p>
                Employee: <strong>{approvalModal.leave?.employee?.employeeName}</strong>
              </p>
              <p>
                Period: {approvalModal.leave?.fromDate} to {approvalModal.leave?.toDate}
              </p>
              <div className="payroll-form-group">
                <label>Approval / Rejection Comment</label>
                <input
                  type="text"
                  placeholder="Optional comment..."
                  value={approvalModal.comment}
                  onChange={(e) =>
                    setApprovalModal((prev) => ({ ...prev, comment: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className={`payroll-save-btn ${
                  approvalModal.action === "REJECT" ? "btn-delete" : ""
                }`}
                onClick={handleConfirmApproval}
              >
                Confirm {approvalModal.action}
              </button>
              <button
                className="payroll-cancel-btn"
                onClick={() =>
                  setApprovalModal({ show: false, leave: null, action: "APPROVE", comment: "" })
                }
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default LeaveManagement;
