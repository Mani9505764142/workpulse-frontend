import { NavLink } from "react-router-dom";

export default function AdminSidebar() {

  const linkClass = ({ isActive }) =>
    `block px-3 py-2 rounded-lg transition-all duration-200 ${
      isActive
        ? "bg-blue-600 text-white font-semibold shadow"
        : "text-gray-300 hover:bg-gray-800 hover:text-white"
    }`;

  // ✅ Scalable navigation config
  const adminLinks = [
    { name: "Dashboard", path: "/admin/dashboard" },
    { name: "Users", path: "/admin/users" },
    { name: "Approvals", path: "/admin/approvals" }, // 🔥 NEW
    { name: "Attendance", path: "/admin/attendance" },
    { name: "Profile", path: "/admin/profile" },
     { name: "Edit Rules", path: "/admin/rules" }, // ✅ NEW
    { name: "Edit Announcements", path: "/admin/announcements" },
  ];

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen p-5 border-r border-gray-800">
      
      {/* Header */}
      <h1 className="text-2xl font-bold mb-8 tracking-wide">
        Admin Panel
      </h1>

      {/* Navigation */}
      <nav className="space-y-2">
        {adminLinks.map((link) => (
          <NavLink key={link.path} to={link.path} className={linkClass}>
            {link.name}
          </NavLink>
        ))}
      </nav>

    </div>
  );
}
