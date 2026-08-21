import { NavLink, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaUsers,
  FaBuilding,
  FaLaptop,
  FaCalendarCheck,
  FaClipboardList,
  FaMoneyBillWave,
  FaSignOutAlt,
  FaUserShield,
  FaCalendarTimes,
  FaCalendarAlt,
  FaClock,
} from "react-icons/fa";

function Sidebar({ isOpen }) {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const isSuperAdminOrAdmin = role === "ADMIN";
  const canManageEmployees = isSuperAdminOrAdmin || role === "HR" || role === "MANAGER";
  const canManagePayroll = isSuperAdminOrAdmin || role === "HR";

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("employeeId");
      navigate("/");
    }
  };

  const getLinkClass = ({ isActive }) => {
    return isActive ? "sidebar-link active-sidebar-link" : "sidebar-link";
  };

  return (
    <aside className={`erp-sidebar ${isOpen ? "sidebar-open" : "sidebar-closed"}`}>
      <div className="sidebar-brand">
        <div className="brand-logo">J</div>
        {isOpen && (
          <div>
            <h5>JAM ERP</h5>
            <span>Enterprise System</span>
          </div>
        )}
      </div>

      <nav className="sidebar-navigation">
        <NavLink to="/dashboard" className={getLinkClass}>
          <FaHome />
          {isOpen && <span>Dashboard</span>}
        </NavLink>

        {isSuperAdminOrAdmin && (
          <NavLink to="/users" className={getLinkClass}>
            <FaUserShield />
            {isOpen && <span>Users</span>}
          </NavLink>
        )}

        {canManageEmployees && (
          <NavLink to="/employee" className={getLinkClass}>
            <FaUsers />
            {isOpen && <span>Employees</span>}
          </NavLink>
        )}

        <NavLink to="/departments" className={getLinkClass}>
          <FaBuilding />
          {isOpen && <span>Departments</span>}
        </NavLink>

        <NavLink to="/assets" className={getLinkClass}>
          <FaLaptop />
          {isOpen && <span>Assets</span>}
        </NavLink>

        <NavLink to="/attendance" className={getLinkClass}>
          <FaCalendarCheck />
          {isOpen && <span>Attendance</span>}
        </NavLink>

        <NavLink to="/calendar" className={getLinkClass}>
          <FaCalendarAlt />
          {isOpen && <span>Calendar</span>}
        </NavLink>

        {isSuperAdminOrAdmin && (
          <NavLink to="/shifts" className={getLinkClass}>
            <FaClock />
            {isOpen && <span>Shifts</span>}
          </NavLink>
        )}

        <NavLink to="/leave" className={getLinkClass}>
          <FaCalendarTimes />
          {isOpen && <span>Leave Management</span>}
        </NavLink>

        <NavLink to="/projects" className={getLinkClass}>
          <FaClipboardList />
          {isOpen && <span>Projects</span>}
        </NavLink>

        {canManagePayroll && (
          <NavLink to="/payroll" className={getLinkClass}>
            <FaMoneyBillWave />
            {isOpen && <span>Payroll</span>}
          </NavLink>
        )}
      </nav>

      <button type="button" className="sidebar-logout" onClick={handleLogout}>
        <FaSignOutAlt />
        {isOpen && <span>Logout</span>}
      </button>
    </aside>
  );
}

export default Sidebar;