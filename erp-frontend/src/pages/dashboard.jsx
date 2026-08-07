import DashboardLayout from "../components/layout/DashboardLayout";
import StatCard from "../components/dashboard/StatCard";
import { useEffect, useState } from "react";
import { getEmployees } from "../services/EmployeeService";


function Dashboard() {
  const [employees, setEmployees] = useState([]);

useEffect(() => {
    getEmployees().then((response) => {
        setEmployees(response.data);
    });
}, []);
  return (
    <DashboardLayout>
      <h1>Dashboard Working</h1>

      <div className="stat-cards-grid">
        <StatCard
          title="Total Employees"
        value={employees.length}
          description="Number of active employees"
        />
        <StatCard
          title="Total Departments"
          value="10"
          description="Number of departments"
        />
        <StatCard
          title="Total Assets"
          value="200"
          description="Number of assets in inventory"
        />
        <StatCard
          title="Pending Leaves"
          value="10"
          description="Waiting Approval"
        />
      </div>

      <p>
        The sidebar and navbar components are working.
      </p>
    </DashboardLayout>
  );
}

export default Dashboard;