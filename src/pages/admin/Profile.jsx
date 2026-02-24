import { forceLogout } from "../../utils/logout";

export default function AdminProfile() {
  const role = localStorage.getItem("role");

  return (
    <div className="max-w-xl">
      <h2 className="text-2xl font-bold mb-6">Admin Profile</h2>

      <div className="bg-white p-6 rounded shadow space-y-4">
        <div>
          <p className="text-gray-500 text-sm">Role</p>
          <p className="font-semibold">{role}</p>
        </div>

        <div>
          <p className="text-gray-500 text-sm">Email</p>
          <p className="font-semibold">Logged-in Admin</p>
        </div>

        <hr />

        <button
          onClick={forceLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
