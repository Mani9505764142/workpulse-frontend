import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAnnouncements } from "../services/announcementService";

export default function Sidebar() {
  const [newCount, setNewCount] = useState(0);

  const linkClass = ({ isActive }) =>
    `block px-4 py-3 rounded-md ${
      isActive
        ? "bg-blue-600 text-white"
        : "text-gray-300 hover:bg-slate-800"
    }`;

  useEffect(() => {
    async function checkNewAnnouncements() {
      try {
        const data = await getAnnouncements();
        const items = data?.announcements || [];

        const lastSeen = localStorage.getItem("announcementsLastSeen");

        if (!lastSeen) {
          setNewCount(items.length);
          return;
        }

        const unread = items.filter(
          (a) => new Date(a.createdAt) > new Date(lastSeen)
        );

        setNewCount(unread.length);
      } catch (err) {
        console.error("Failed to fetch announcements", err);
      }
    }

    checkNewAnnouncements();
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 py-5 text-xl font-bold border-b border-slate-700">
        WorkPulse
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">

        <NavLink to="/app/dashboard" className={linkClass}>
          Dashboard
        </NavLink>

        <NavLink to="/app/attendance" className={linkClass}>
          Attendance
        </NavLink>

        {/* Rules with badge */}
        <div className="relative">
          <NavLink to="/app/rules" className={linkClass}>
            Rules & Announcements
          </NavLink>

          {newCount > 0 && (
            <span className="absolute top-2 right-3 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
              {newCount}
            </span>
          )}
        </div>

        <NavLink to="/app/profile" className={linkClass}>
          Profile
        </NavLink>

      </nav>
    </div>
  );
}