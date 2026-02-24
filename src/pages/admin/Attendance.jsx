// src/pages/admin/AdminAttendance.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminTodayAttendance } from "../../utils/api";

const STATUS_STYLES = {
  Present: "bg-green-100 text-green-700",
  "On Break": "bg-yellow-100 text-yellow-700",
  "Checked Out": "bg-gray-200 text-gray-700",
  Absent: "bg-red-100 text-red-700"
};

export default function AdminAttendance() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleViewHistory = (userId) => {
    navigate(`/admin/users/${userId}/attendance`);
  };

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const res = await getAdminTodayAttendance();
        if (alive) setData(res);
      } catch (err) {
        if (alive) setError("Failed to load attendance");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  if (loading) return <div className="p-4">Loading…</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Today’s Attendance</h1>

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full">
          <thead className="bg-gray-50 text-sm text-gray-600">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Check-in</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((u) => (
              <tr key={u.userId} className="border-t">
                <td className="p-3">{u.name}</td>
                <td className="p-3 text-sm text-gray-600">{u.email}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      STATUS_STYLES[u.status] || ""
                    }`}
                  >
                    {u.status}
                  </span>
                </td>
                <td className="p-3 text-sm">
                  {u.checkIn
                    ? new Date(u.checkIn).toLocaleTimeString()
                    : "—"}
                </td>
                <td className="p-3">
                  <button
                    onClick={() => handleViewHistory(u.userId)}
                    className="text-blue-600 hover:underline text-sm font-medium"
                  >
                    View History
                  </button>
                </td>
              </tr>
            ))}

            {data.length === 0 && (
              <tr>
                <td colSpan={5} className="p-3 text-sm text-gray-500">
                  No attendance records today.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
