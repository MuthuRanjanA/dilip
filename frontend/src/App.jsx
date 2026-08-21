import { useState, useEffect } from "react";
import Employee from "./pages/employee";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Register from "./pages/register";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import Department from "./pages/department";
import DashboardLayout from "./components/layout/Dashboardlayout";
import Attendance from "./pages/attendance";
import Asset from "./pages/asset";
import ProtectedRoute from "./components/ProtectedRoute";
import Project from "./pages/project";
import ChangePassword from "./pages/ChangePassword";
import Payroll from "./pages/payroll";
import UsersPage from "./pages/users";
import LeaveManagement from "./pages/leave";
import CalendarPage from "./pages/Calendar";
import ShiftManagement from "./pages/shift";
import { ToastProvider } from "./components/common/ToastContext";

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
          <Route path="/employee" element={<ProtectedRoute><Employee /></ProtectedRoute>} />
          <Route path="/departments" element={<ProtectedRoute><Department /></ProtectedRoute>} />
          <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
          <Route path="/leave" element={<ProtectedRoute><LeaveManagement /></ProtectedRoute>} />
          <Route path="/shifts" element={<ProtectedRoute><ShiftManagement /></ProtectedRoute>} />
          <Route path="/assets" element={<ProtectedRoute><Asset /></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute><Project /></ProtectedRoute>} />
          <Route path="/payroll" element={<ProtectedRoute><Payroll /></ProtectedRoute>} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
