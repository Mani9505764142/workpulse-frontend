import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminFetch } from "../../utils/api";

/* ===================== CONFIG ===================== */

const DEPARTMENTS = [
  "Frontend Developer",
  "Backend Developer",
  "Fullstack Developer",
  "AI Engineer",
  "Cloud / DevOps",
  "Sales",
  "Marketing",
  "HR"
];

const PAGE_SIZE = 10;

/* ===================== COMPONENT ===================== */

export default function Users() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [shifts, setShifts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editingUser, setEditingUser] = useState(null);
  const [saving, setSaving] = useState(false);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  /* ===================== LOAD DATA ===================== */

  const loadUsers = async () => {
    try {
      const data = await adminFetch("/admin/all-users");
      setUsers(data);
    } catch (err) {
      setError(err.message || "Failed to load users");
    }
  };

  const loadShifts = async () => {
    try {
      const data = await adminFetch("/shifts");
      setShifts(data);
    } catch (err) {
      console.error("Failed to load shifts", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadUsers(), loadShifts()]);
      setLoading(false);
    };
    init();
  }, []);

  /* ===================== SHIFT MAP (O(1)) ===================== */

  const shiftMap = useMemo(() => {
    const map = {};
    shifts.forEach((s) => (map[s.shiftId] = s));
    return map;
  }, [shifts]);

  /* ===================== SEARCH ===================== */

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;

    return users.filter((u) =>
      [u.userId, u.name, u.email, u.department]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(q))
    );
  }, [users, search]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  /* ===================== PAGINATION ===================== */

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / PAGE_SIZE)
  );

  const paginatedUsers = filteredUsers.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  /* ===================== EDIT ===================== */

  const openEditModal = (user) => {
    setEditingUser({
      ...user,
      shiftId: user.shiftId || "",
      departmentMode: DEPARTMENTS.includes(user.department)
        ? "PRESET"
        : user.department
        ? "CUSTOM"
        : "PRESET",
      customDepartment:
        !DEPARTMENTS.includes(user.department) ? user.department || "" : ""
    });
  };

  const closeEditModal = () => {
    setEditingUser(null);
  };

  const handleSave = async () => {
    if (!editingUser) return;

    if (!editingUser.shiftId) {
      alert("Shift is required");
      return;
    }

    setSaving(true);

    const department =
      editingUser.departmentMode === "CUSTOM"
        ? editingUser.customDepartment
        : editingUser.department;

    try {
      await adminFetch(`/admin/users/${editingUser.userId}`, {
        method: "PUT",
        body: JSON.stringify({
          name: editingUser.name,
          role: editingUser.role,
          status: editingUser.status,
          department: department || null,
          shiftId: editingUser.shiftId
        })
      });

      await loadUsers();
      closeEditModal();
    } catch (err) {
      alert(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  /* ===================== RENDER ===================== */

  if (loading) return <div className="p-6">Loading users…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Users</h2>

      {/* SEARCH */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by User ID, Name, Email, Department"
          className="w-full md:w-96 border rounded px-3 py-2"
        />
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">User ID</th>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Department</th>
              <th className="p-3">Shift</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
              <th className="p-3">Created</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginatedUsers.length === 0 && (
              <tr>
                <td colSpan="9" className="p-4 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            )}

            {paginatedUsers.map((u) => (
              <tr key={u.userId} className="border-t">
                <td className="p-3 font-mono text-xs">
                  <button
                    onClick={() => navigate(`/admin/users/${u.userId}`)}
                    className="text-blue-600 underline"
                  >
                    {u.userId}
                  </button>
                </td>
                <td className="p-3">{u.name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">{u.department || "-"}</td>
                <td className="p-3">
                  {shiftMap[u.shiftId]?.name
                    ? `${shiftMap[u.shiftId].name} (${shiftMap[u.shiftId].startTime}-${shiftMap[u.shiftId].endTime})`
                    : "-"}
                </td>
                <td className="p-3">{u.role}</td>
                <td className="p-3">{u.status}</td>
                <td className="p-3">
                  {u.createdAt
                    ? new Date(u.createdAt).toLocaleDateString()
                    : "-"}
                </td>
                <td className="p-3">
                  <button
                    onClick={() => openEditModal(u)}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-end items-center gap-4 mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>

        <span className="text-sm">
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* EDIT MODAL */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Edit User</h3>

            <Input label="User ID" value={editingUser.userId} disabled />

            <Input
              label="Name"
              value={editingUser.name}
              onChange={(e) =>
                setEditingUser({ ...editingUser, name: e.target.value })
              }
            />

            {/* Department */}
            <Select
              label="Department"
              value={
                editingUser.departmentMode === "CUSTOM"
                  ? "OTHER"
                  : editingUser.department || ""
              }
              onChange={(e) => {
                if (e.target.value === "OTHER") {
                  setEditingUser({
                    ...editingUser,
                    departmentMode: "CUSTOM",
                    customDepartment: ""
                  });
                } else {
                  setEditingUser({
                    ...editingUser,
                    departmentMode: "PRESET",
                    department: e.target.value
                  });
                }
              }}
              options={[...DEPARTMENTS, "OTHER"]}
            />

            {editingUser.departmentMode === "CUSTOM" && (
              <Input
                placeholder="Enter custom department"
                value={editingUser.customDepartment}
                onChange={(e) =>
                  setEditingUser({
                    ...editingUser,
                    customDepartment: e.target.value
                  })
                }
              />
            )}

            {/* Shift */}
            <div className="mb-3">
              <label className="block text-sm mb-1">Shift</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={editingUser.shiftId}
                onChange={(e) =>
                  setEditingUser({
                    ...editingUser,
                    shiftId: e.target.value
                  })
                }
              >
                <option value="">Select Shift</option>
                {shifts.map((shift) => (
                  <option key={shift.shiftId} value={shift.shiftId}>
                    {shift.name} ({shift.startTime}-{shift.endTime})
                  </option>
                ))}
              </select>
            </div>

            <Select
              label="Role"
              value={editingUser.role}
              onChange={(e) =>
                setEditingUser({ ...editingUser, role: e.target.value })
              }
              options={["ADMIN", "MANAGER", "EMPLOYEE"]}
            />

            <Select
              label="Status"
              value={editingUser.status}
              onChange={(e) =>
                setEditingUser({ ...editingUser, status: e.target.value })
              }
              options={["ACTIVE", "INACTIVE"]}
            />

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={closeEditModal}
                className="px-4 py-2 border rounded"
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===================== HELPERS ===================== */

function Input({ label, ...props }) {
  return (
    <div className="mb-3">
      {label && <label className="block text-sm mb-1">{label}</label>}
      <input className="w-full border rounded px-3 py-2" {...props} />
    </div>
  );
}

function Select({ label, options, ...props }) {
  return (
    <div className="mb-3">
      <label className="block text-sm mb-1">{label}</label>
      <select className="w-full border rounded px-3 py-2" {...props}>
        {options.map((o) => (
          <option key={o} value={o === "OTHER" ? "OTHER" : o}>
            {o === "OTHER" ? "Other (Custom)" : o}
          </option>
        ))}
      </select>
    </div>
  );
}
