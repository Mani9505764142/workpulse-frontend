const API_BASE = "https://mrm1jocp20.execute-api.us-east-1.amazonaws.com/dev";

const adminFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem("idToken"); // Cognito ID token

  if (!token) {
    throw new Error("No ID token found");
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      Authorization: token, // REST API authorizer expects RAW token
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }

  return res.json();
};

// ✅ ADMIN – Attendance history for a specific user
export const getAdminAttendanceHistory = (userId) => {
  return adminFetch(`/admin/attendance/history/${userId}`, {
    method: "GET"
  });
};
