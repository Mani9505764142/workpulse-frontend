import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adminFetch } from "../../utils/api";

export default function UserDetails() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  /* ===================== LOAD DATA ===================== */

  useEffect(() => {
    loadAll();
  }, [userId]);

  const loadAll = async () => {
    try {
      setLoading(true);
      setError("");

      const userData = await adminFetch(`/admin/users/${userId}`);
      setUser(userData);

      const attendanceData = await adminFetch(
        `/admin/attendance/today/${userId}`
      );
      setAttendance(attendanceData);

    } catch (err) {
      setError(err.message || "Failed to load user");
    } finally {
      setLoading(false);
    }
  };

  /* ===================== SAVE EDIT ===================== */

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminFetch(`/admin/users/${userId}`, {
        method: "PUT",
        body: JSON.stringify({
          department: user.department,
          role: user.role,
          status: user.status
        })
      });

      setEditing(false);
      await loadAll();
    } catch (err) {
      alert(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  /* ===================== STATUS LABEL ===================== */

  const renderPresentStatus = () => {
    if (!attendance || attendance.status === "ABSENT") {
      return <span className="text-red-600">ABSENT</span>;
    }

    if (attendance.status === "ON_BREAK") {
      return <span className="text-yellow-600">ON BREAK</span>;
    }

    if (attendance.status === "CHECKED_OUT") {
      return <span className="text-gray-600">CHECKED OUT</span>;
    }

    return <span className="text-green-600">PRESENT</span>;
  };

  /* ===================== RENDER ===================== */

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!user) return null;

  return (
    <div className="p-6">
      <button
        onClick={() => navigate("/admin/users")}
        className="text-blue-600 mb-4"
      >
        ← Back to Users
      </button>

      <h2 className="text-xl font-semibold mb-4">User Details</h2>

      {/* ===================== USER INFO ===================== */}

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <Info label="User ID" value={user.userId} mono />
          <Info label="Name" value={user.name} />
          <Info label="Email" value={user.email} />
          <Info label="Created At" value={
            user.createdAt
              ? new Date(user.createdAt).toLocaleString()
              : "-"
          } />

          {/* Editable fields */}
          <div>
            <label className="block text-sm text-gray-500 mb-1">Department</label>
            {editing ? (
              <input
                value={user.department || ""}
                onChange={(e) =>
                  setUser({ ...user, department: e.target.value })
                }
                className="w-full border rounded px-3 py-2"
              />
            ) : (
              <div>{user.department || "-"}</div>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-500 mb-1">Role</label>
            {editing ? (
              <select
                value={user.role}
                onChange={(e) =>
                  setUser({ ...user, role: e.target.value })
                }
                className="w-full border rounded px-3 py-2"
              >
                <option value="ADMIN">ADMIN</option>
                <option value="MANAGER">MANAGER</option>
                <option value="EMPLOYEE">EMPLOYEE</option>
              </select>
            ) : (
              <div>{user.role}</div>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-500 mb-1">Account Status</label>
            {editing ? (
              <select
                value={user.status}
                onChange={(e) =>
                  setUser({ ...user, status: e.target.value })
                }
                className="w-full border rounded px-3 py-2"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            ) : (
              <div>{user.status}</div>
            )}
          </div>

        </div>

        <div className="mt-6 flex gap-3">
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Edit User
            </button>
          ) : (
            <>
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 border rounded"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* ===================== PRESENT STATUS ===================== */}

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold mb-2">Today Attendance Status</h3>
        <div className="text-lg font-medium">
          {renderPresentStatus()}
        </div>
      </div>
    </div>
  );
}

/* ===================== SMALL COMPONENT ===================== */

function Info({ label, value, mono }) {
  return (
    <div>
      <label className="block text-sm text-gray-500 mb-1">{label}</label>
      <div className={mono ? "font-mono text-xs" : ""}>{value}</div>
    </div>
  );
}
