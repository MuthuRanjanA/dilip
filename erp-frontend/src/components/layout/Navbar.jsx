import {
  FaBars,
  FaBell,
  FaUserCircle,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import { useState,useEffect } from "react";
import { getMyProfile } from "../../services/EmployeeService";
import { getMyAssets } from "../../services/AssetService";

function Navbar({ toggleSidebar }) {

    const role = localStorage.getItem("role");
  const email = localStorage.getItem("email");
    const navigate = useNavigate();


  const [showProfile, setShowProfile] = useState(false);
  const [employee, setEmployee] = useState(null);
  const [assets, setAssets] = useState([]);

  const toggleProfile = () => {
  setShowProfile((currentValue) => !currentValue);
};


useEffect(() => {
  if (showProfile && role === "EMPLOYEE") {
    getMyProfile()
      .then((response) => {
        setEmployee(
          response.data.data || response.data
        );
      })
      .catch((error) => {
        console.log(
          "Profile load error:",
          error.response?.data
        );
      });
         getMyAssets()
      .then((response) => {
        console.log(
          "MY ASSETS:",
          response.data
        );

        setAssets(
          response.data.data || response.data
        );
      })
      .catch((error) => {
        console.log(
          "My assets error:",
          error.response?.data
        );
      });
  }
}, [showProfile, role]);

const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("email");
  localStorage.removeItem("employeeId");
  localStorage.removeItem("employeeName");

  navigate("/");
};


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

      <div
  className="navbar-user"
  onClick={toggleProfile}
>
  

          <FaUserCircle className="navbar-user-icon" />

          <div>
            <strong>
              {email || "ERP User"}
            </strong>

            <span>
              {role || "UNKNOWN"}
            </span>
          </div>

        </div>

      </div>

     {showProfile && (
  <div className="profile-popup">

    {role === "EMPLOYEE" && employee ? (
      <>
        <div className="profile-popup-header">

          <div className="profile-popup-initial">
            {employee.employeeName
              ?.charAt(0)
              .toUpperCase()}
          </div>

          <div>
            <h4>{employee.employeeName}</h4>

            <span>
              {employee.designation || "Employee"}
            </span>
          </div>

        </div>

        <hr />

        <div className="profile-popup-info">

          <p>
            <strong>Employee ID</strong>
            <span>{employee.employeeId}</span>
          </p>

          <p>
            <strong>Email</strong>
            <span>{employee.email}</span>
          </p>

          <p>
            <strong>Phone</strong>
            <span>
              {employee.phoneNumber || "-"}
            </span>
          </p>

          <p>
            <strong>Department</strong>
            <span>
              {employee.department?.departmentName ||
                employee.department?.name ||
                "-"}
            </span>
          </p>

          <div className="profile-assets-section">

  <h5>My Assets</h5>

  {assets.length === 0 ? (
    <p className="no-assets">
      No assets assigned
    </p>
  ) : (
    assets.map((asset) => (
      <div
        className="profile-asset-item"
        key={asset.assetId}
      >

        <div className="asset-name">
          {asset.assetName}
        </div>

        <div className="asset-details">
          <span>
            {asset.assetType || "-"}
          </span>

          <span>
            {asset.status || "-"}
          </span>
        </div>

      </div>
    ))
  )}

</div>
          <button
  type="button"
  className="profile-logout-button"
  onClick={handleLogout}
>
  Logout
</button>

        </div>

      </>
    ) : (
      <p>Loading profile...</p>
    )}

  </div>
)}

    </header>
  );
}

export default Navbar;