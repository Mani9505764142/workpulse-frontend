import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar"; 
// ⚠️ adjust path if AdminSidebar is elsewhere

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen">
      {/* Left Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 bg-gray-100 p-6">
        <Outlet />
      </div>
    </div>
  );
}
