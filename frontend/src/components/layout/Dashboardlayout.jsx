import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] =
    useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen((currentValue) => {
      return !currentValue;
    });
  };

  return (
    <div className="erp-layout">
      <Sidebar isOpen={isSidebarOpen} />

      <div
        className={
          isSidebarOpen
            ? "erp-main sidebar-visible"
            : "erp-main sidebar-hidden"
        }
      >
        <Navbar toggleSidebar={toggleSidebar} />

        <main className="erp-page-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;