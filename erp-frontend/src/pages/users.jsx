import { useEffect, useState, useMemo } from "react";
import DashboardLayout from "../components/layout/Dashboardlayout";
import AlertPopup from "../components/common/alert";
import { useToast } from "../components/common/ToastContext";
import {
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  resetUserPassword,
} from "../services/userservice";
import {
  FaUserShield,
  FaSearch,
  FaKey,
  FaUserCheck,
  FaUserTimes,
  FaShieldAlt,
  FaSync,
} from "react-icons/fa";
import "../style/asset.css";

const ROLES = ["ADMIN", "HR", "MANAGER", "EMPLOYEE"];

function UsersPage() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [resetModal, setResetModal] = useState({
    show: false,
    user: null,
    newPassword: "",
  });

  const [popup, setPopup] = useState({
    show: false,
    type: "confirm",
    title: "",
    message: "",
    action: null,
  });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await getAllUsers();
      setUsers(res.data?.data || res.data || []);
    } catch (err) {
      console.error("Error loading users:", err);
      toast.error(err.response?.data?.message || "Failed to load user list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      toast.success(`User role updated to ${newRole}`);
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update role");
    }
  };

  const handleStatusToggle = (user) => {
    const nextStatus = !user.enabled;
    const actionText = nextStatus ? "activate" : "deactivate";

    setPopup({
      show: true,
      type: "confirm",
      title: `${nextStatus ? "Activate" : "Deactivate"} Account?`,
      message: `Are you sure you want to ${actionText} the user account for ${user.email}?`,
      action: async () => {
        try {
          await updateUserStatus(user.id, nextStatus);
          toast.success(`Account ${actionText}d successfully`);
          loadUsers();
        } catch (err) {
          toast.error(err.response?.data?.message || "Status change failed");
        }
      },
    });
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!resetModal.user) return;

    try {
      const pass = resetModal.newPassword || "TempPassword@123";
      await resetUserPassword(resetModal.user.id, pass);
      toast.success(`Password reset! New password set to: ${pass}`);
      setResetModal({ show: false, user: null, newPassword: "" });
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Password reset failed");
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const query = searchQuery.toLowerCase();
      const matchSearch =
        !query ||
        u.email.toLowerCase().includes(query) ||
        (u.employeeName && u.employeeName.toLowerCase().includes(query)) ||
        (u.departmentName && u.departmentName.toLowerCase().includes(query));

      const matchRole = !filterRole || u.role === filterRole;
      const matchStatus =
        !filterStatus ||
        (filterStatus === "ACTIVE" && u.enabled) ||
        (filterStatus === "INACTIVE" && !u.enabled);

      return matchSearch && matchRole && matchStatus;
    });
  }, [users, searchQuery, filterRole, filterStatus]);

  return (
    <DashboardLayout>
      <AlertPopup
        show={popup.show}
        type={popup.type}
        title={popup.title}
        message={popup.message}
        onConfirm={() => {
          setPopup((prev) => ({ ...prev, show: false }));
          if (popup.action) popup.action();
        }}
        onClose={() => setPopup((prev) => ({ ...prev, show: false }))}
      />

      <div className="asset-page">
        <div className="asset-header">
          <div>
            <h1>User Account & Security Management</h1>
            <p>Configure user credentials, system roles, and account access permissions</p>
          </div>
          <button className="asset-add-btn" onClick={loadUsers}>
            <FaSync /> Refresh Users
          </button>
        </div>

        <div className="asset-table-card">
          <div className="asset-table-header">
            <div>
              <h2>Registered Users ({filteredUsers.length})</h2>
              <p>System users with authentication access to JAM ERP</p>
            </div>

            <div className="asset-filters">
              <input
                type="text"
                placeholder="Search email, name or dept..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                <option value="">All Roles</option>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>

              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          <div className="asset-table-wrapper">
            <table className="asset-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Email / Username</th>
                  <th>Linked Employee</th>
                  <th>Assigned Role</th>
                  <th>Account Status</th>
                  <th>Temp Password</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      Loading users...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      No user accounts found matching query.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td>#{u.id}</td>
                      <td>
                        <strong>{u.email}</strong>
                      </td>
                      <td>
                        {u.employeeName ? (
                          <div>
                            <strong>{u.employeeName}</strong>
                            <div style={{ fontSize: "12px", color: "#64748b" }}>
                              {u.designation} ({u.departmentName || "Staff"})
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: "#94a3b8" }}>System User</span>
                        )}
                      </td>
                      <td>
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          style={{
                            padding: "6px 10px",
                            borderRadius: "6px",
                            border: "1px solid #cbd5e1",
                            fontWeight: "600",
                            fontSize: "13px",
                            background: "#f8fafc",
                          }}
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <span
                          className={`asset-status ${
                            u.enabled ? "available" : "damaged"
                          }`}
                        >
                          {u.enabled ? "ACTIVE" : "SUSPENDED"}
                        </span>
                      </td>
                      <td>{u.temporaryPassword ? "YES (Must Change)" : "NO"}</td>
                      <td>
                        <div className="asset-actions">
                          <button
                            className={`btn-icon-action ${
                              u.enabled ? "btn-delete" : "btn-pay"
                            }`}
                            onClick={() => handleStatusToggle(u)}
                            title={u.enabled ? "Suspend Account" : "Activate Account"}
                          >
                            {u.enabled ? <FaUserTimes /> : <FaUserCheck />}{" "}
                            {u.enabled ? "Suspend" : "Activate"}
                          </button>

                          <button
                            className="btn-icon-action btn-view-slip"
                            onClick={() =>
                              setResetModal({ show: true, user: u, newPassword: "" })
                            }
                            title="Reset Password"
                          >
                            <FaKey /> Reset Pass
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Reset Password Modal */}
      {resetModal.show && (
        <div className="modal-overlay" onClick={() => setResetModal({ show: false, user: null, newPassword: "" })}>
          <div className="modal-card" style={{ maxWidth: "450px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Reset Password for {resetModal.user?.email}</h3>
            </div>
            <form onSubmit={handleResetSubmit}>
              <div className="modal-body">
                <div className="payroll-form-group">
                  <label>New Temporary Password (leave blank for default: TempPassword@123)</label>
                  <input
                    type="text"
                    value={resetModal.newPassword}
                    onChange={(e) =>
                      setResetModal((prev) => ({ ...prev, newPassword: e.target.value }))
                    }
                    placeholder="TempPassword@123"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="submit" className="payroll-save-btn">
                  Reset Password
                </button>
                <button
                  type="button"
                  className="payroll-cancel-btn"
                  onClick={() => setResetModal({ show: false, user: null, newPassword: "" })}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default UsersPage;
