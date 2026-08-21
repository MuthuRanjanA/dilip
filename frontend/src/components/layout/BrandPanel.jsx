import {
  FaBuilding,
  FaUsers,
  FaLaptop,
  FaCalendarCheck,
  FaProjectDiagram,
} from "react-icons/fa";

function BrandPanel() {
  return (
    <section className="brand-panel">
      <div className="brand-content">
        <div className="brand-logo">
          <span>J</span>
          <span>A</span>
          <span>M</span>
        </div>

        <p className="brand-label">JAM ENTERPRISES</p>

        <h1>Enterprise Resource Planning System</h1>

        <p className="brand-description">
          A secure and centralized platform for managing employees,
          attendance, assets, projects and business operations.
        </p>

        <div className="brand-features">
          <div className="brand-feature">
            <FaUsers />
            <span>Employee Management</span>
          </div>

          <div className="brand-feature">
            <FaCalendarCheck />
            <span>Attendance Tracking</span>
          </div>

          <div className="brand-feature">
            <FaLaptop />
            <span>Asset Management</span>
          </div>

          <div className="brand-feature">
            <FaProjectDiagram />
            <span>Project Management</span>
          </div>

          <div className="brand-feature">
            <FaBuilding />
            <span>Department Operations</span>
          </div>
        </div>
      </div>

      <p className="brand-footer">
        Secure. Reliable. Collaborative.
      </p>
    </section>
  );
}

export default BrandPanel;