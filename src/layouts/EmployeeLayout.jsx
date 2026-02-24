import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function EmployeeLayout() {
  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white fixed inset-y-0 left-0">
        <Sidebar />
      </aside>

      {/* Main */}
      <div className="flex flex-col flex-1 ml-64">
        <main className="flex-1 px-6 py-6">
          <Outlet />
        </main>

        <footer className="border-t bg-white px-6 py-3 text-sm text-gray-500">
          © {new Date().getFullYear()} WorkPulse
        </footer>
      </div>
    </div>
  );
}
