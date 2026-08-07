import {
  FaBars,
  FaBell,
  FaUserCircle,
} from "react-icons/fa";

function Navbar({ toggleSidebar }) {
  const role = localStorage.getItem("role");
  const email = localStorage.getItem("email");
  

  return (
    <header className="erp-navbar">
      <div className="navbar-left">
        <button
          type="button"
          className="sidebar-toggle-button"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <FaBars />
        </button>

        <div>
          <h4>JAM Enterprises</h4>
          <span>Enterprise Resource Planning</span>
        </div>
      </div>

      <div className="navbar-right">
        <button
          type="button"
          className="notification-button"
          aria-label="Notifications"
        >
          <FaBell />

          <span className="notification-indicator"></span>
        </button>

        <div className="navbar-user">
          <FaUserCircle className="navbar-user-icon" />

          <div>
            <strong>{email || "ERP User"}</strong>
            <span>{role || "UNKNOWN"}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;