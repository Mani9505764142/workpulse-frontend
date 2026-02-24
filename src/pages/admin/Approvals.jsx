import { useEffect, useState } from "react";
import { getPendingUsers, approveUser } from "../../api/admin";

export default function Approvals() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);

  // 🔥 Fetch pending users
  const fetchPendingUsers = async () => {
    try {
      const data = await getPendingUsers();

      // Expecting array from backend
      setUsers(data || []);
    } catch (err) {
      console.error("Failed to fetch pending users:", err);
      alert("Error loading approvals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  // 🔥 Approve handler
  const handleApprove = async (user) => {
    try {
      setApprovingId(user.userId);

      await approveUser({
        userId: user.userId,
        department: user.department || "Engineering",
        role: "EMP",
        shift: "Morning",
      });

      // ✅ Remove instantly from UI (NO refetch)
      setUsers((prev) =>
        prev.filter((u) => u.userId !== user.userId)
      );

    } catch (err) {
      console.error("Approval failed:", err);
      alert("Failed to approve user");
    } finally {
      setApprovingId(null);
    }
  };

  // 🔥 Loading State
  if (loading) {
    return (
      <div className="p-6 text-lg font-semibold">
        Loading pending approvals...
      </div>
    );
  }

  return (
    <div className="p-6">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Pending Approvals ({users.length})
        </h1>

        <p className="text-gray-500">
          Approve employees before they gain system access.
        </p>
      </div>

      {/* EMPTY STATE */}
      {users.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-10 text-center">
          <h2 className="text-xl font-semibold">
            No Pending Approvals 🎉
          </h2>
          <p className="text-gray-500 mt-2">
            All employees are approved.
          </p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">

          <table className="w-full">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-4">Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Requested</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr
                  key={user.userId}
                  className="border-t hover:bg-gray-50"
                >
                  <td className="p-4 font-medium">
                    {user.name || "Employee"}
                  </td>

                  <td>{user.email}</td>

                  <td>
                    {user.department || (
                      <span className="text-gray-400">
                        Not assigned
                      </span>
                    )}
                  </td>

                  <td>
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "-"}
                  </td>

                  <td className="text-center">
                    <button
                      onClick={() => handleApprove(user)}
                      disabled={approvingId === user.userId}
                      className={`px-4 py-2 rounded text-white font-medium
                        ${
                          approvingId === user.userId
                            ? "bg-gray-400"
                            : "bg-green-600 hover:bg-green-700"
                        }`}
                    >
                      {approvingId === user.userId
                        ? "Approving..."
                        : "Approve"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      )}
    </div>
  );
}
