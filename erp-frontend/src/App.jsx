import { useState,useEffect, } from "react";
import Employee from "./pages/employee";
import { BrowserRouter,Route, Routes } from "react-router-dom";
import Register from "./pages/register";
import Login from "./pages/login";
import Dashboard from "./pages/Dashboard";
import Department from "./pages/Department";
import DashboardLayout from "./components/layout/Dashboardlayout";
import Attendance from "./pages/attendance";
import Asset from "./pages/asset";
import ProtectedRoute from "./components/ProtectedRoute";
import Project from "./pages/project";
import ChangePassword from "./pages/changePassword";
import { ToastProvider } from "./components/common/ToastContext";


function App(){

  return(
    <ToastProvider>
      <BrowserRouter>
        <Routes>
      
       
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/employee" element={<ProtectedRoute><Employee/></ProtectedRoute>} />
          <Route path="/departments" element={<ProtectedRoute><Department /></ProtectedRoute>} />
          <Route path="/attendance" element={<ProtectedRoute><Attendance/></ProtectedRoute>} />
          <Route path="/assets" element={<ProtectedRoute><Asset /></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute><Project /></ProtectedRoute>} />
          <Route path="/change-password" element={<ChangePassword />}/>

        </Routes>
      </BrowserRouter>
    </ToastProvider>
  )
}
export default App;
