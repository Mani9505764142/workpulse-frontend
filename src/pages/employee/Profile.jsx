import { useEffect, useState } from "react";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");

  const idToken = localStorage.getItem("idToken");

  /* ---------------- FETCH PROFILE ---------------- */
  useEffect(() => {
    if (!idToken) {
      forceLogout();
      return;
    }

    fetch("https://mrm1jocp20.execute-api.us-east-1.amazonaws.com/dev/profile", {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        setProfile(data);
        setName(data.name);
      })
      .catch(forceLogout)
      .finally(() => setLoading(false));
  }, []);

  /* ---------------- UPDATE NAME ---------------- */
  const saveName = async () => {
    try {
      const res = await fetch(
        "https://mrm1jocp20.execute-api.us-east-1.amazonaws.com/dev/profile",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name }),
        }
      );

      if (!res.ok) throw new Error();

      setProfile((prev) => ({ ...prev, name }));
      setEditing(false);
    } catch {
      alert("Failed to update name");
    }
  };

  /* ---------------- LOGOUT ---------------- */
  const forceLogout = () => {
    localStorage.clear();
    window.location.href =
      "https://us-east-1xklaetj5h.auth.us-east-1.amazoncognito.com/logout" +
      "?client_id=rcqt06dpk77uds93d8pontkjm" +
      "&logout_uri=http://localhost:5173/";
  };

  if (loading) return <p className="p-6">Loading profile…</p>;
  if (!profile) return null;

  return (
    <div className="flex justify-center pt-12 bg-gray-50 min-h-screen">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-md px-8 py-6">
        <h1 className="text-xl font-semibold text-center mb-6">My Profile</h1>

        <div className="space-y-4 text-sm">

          {/* NAME */}
          <Row label="Name">
            {editing ? (
              <div className="flex gap-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border px-2 py-1 rounded text-sm"
                />
                <button onClick={saveName} className="text-green-600">
                  Save
                </button>
                <button
                  onClick={() => {
                    setName(profile.name);
                    setEditing(false);
                  }}
                  className="text-gray-500"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <span>{profile.name}</span>
                <button
                  onClick={() => setEditing(true)}
                  className="text-blue-600 text-xs"
                >
                  Edit
                </button>
              </div>
            )}
          </Row>

          {/* EMAIL */}
          <Row label="Email" value={profile.email} />

          {/* ROLE */}
          <Row label="Role" value={profile.role} />

          {/* ✅ NEW DEPARTMENT ROW */}
          <Row
            label="Department"
            value={profile.department || "Not Assigned"}
          />

          {/* STATUS */}
          <Row label="Status" value={profile.status} />

          {/* JOINED DATE */}
          <Row
            label="Joined On"
            value={
              profile.createdAt
                ? new Date(profile.createdAt).toLocaleDateString()
                : "-"
            }
          />
        </div>

        <button
          onClick={forceLogout}
          className="w-full bg-red-600 text-white py-2 rounded-lg mt-8"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

function Row({ label, value, children }) {
  return (
    <div className="flex justify-between border-b pb-2">
      <span className="text-gray-500">{label}</span>
      {children || <span className="font-medium">{value}</span>}
    </div>
  );
}