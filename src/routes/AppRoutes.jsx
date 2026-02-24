import { Routes, Route, Navigate } from "react-router-dom";

import EmployeeLayout from "../layouts/EmployeeLayout";
import AdminLayout from "../layouts/AdminLayout";

import Home from "../pages/employee/Home";
import AuthCallback from "../pages/employee/AuthCallback";
import ProtectedRoute from "../pages/employee/ProtectedRoute";

import EmpDashboard from "../pages/employee/Dashboard";
import EmpAttendance from "../pages/employee/Attendance";
import Profile from "../pages/employee/Profile";
import EmpRules from "../pages/employee/Rules";   // ✅ NEW

import AdminDashboard from "../pages/admin/Dashboard";
import AdminUsers from "../pages/admin/Users";
import AdminAttendance from "../pages/admin/Attendance";
import AdminProfile from "../pages/admin/Profile";
import UserDetails from "../pages/admin/UserDetails";
import AdminAttendanceHistory from "../pages/admin/AttendanceHistory";
import Approvals from "../pages/admin/Approvals";
import AdminRules from "../pages/admin/Rules";   // ✅ NEW
import Announcements from "../pages/admin/Announcements";   // ✅ NEW

export default function AppRoutes() {
  return (
    <Routes>

      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Employee */}
      <Route element={<ProtectedRoute allowedRole="EMPLOYEE" />}>
        <Route path="/app" element={<EmployeeLayout />}>
          <Route path="dashboard" element={<EmpDashboard />} />
          <Route path="attendance" element={<EmpAttendance />} />
          <Route path="rules" element={<EmpRules />} />   {/* ✅ */}
          <Route path="profile" element={<Profile />} />
        </Route>
      </Route>

      {/* Admin */}
      <Route element={<ProtectedRoute allowedRole="ADMIN" />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="users/:userId" element={<UserDetails />} />
          <Route path="attendance" element={<AdminAttendance />} />
          <Route path="users/:userId/attendance" element={<AdminAttendanceHistory />} />
          <Route path="approvals" element={<Approvals />} />
          <Route path="rules" element={<AdminRules />} />   {/* ✅ */}
          <Route path="profile" element={<AdminProfile />} />
          <Route path="announcements" element={<Announcements />} />   {/* ✅ NEW */}
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}
