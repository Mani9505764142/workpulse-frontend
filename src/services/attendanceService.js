const BASE_URL =
  "https://mrm1jocp20.execute-api.us-east-1.amazonaws.com/dev";

/* =======================
   AUTH HEADER HELPER
======================= */
function getAuthHeaders() {
  const idToken = localStorage.getItem("idToken");

  if (!idToken) {
    throw new Error("Missing idToken");
  }

  // ✅ REQUIRED by Cognito JWT authorizer
  return {
    Authorization: `Bearer ${idToken}`
  };
}

/* =======================
   INTERNAL FETCH HELPER
======================= */
async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...(options.headers || {})
    }
  });

  let data = {};
  try {
    data = await res.json();
  } catch {}

  if (!res.ok) {
    console.error("API ERROR:", res.status, data);
    const error = new Error(data.message || "API request failed");
    error.status = res.status;
    throw error;
  }

  return data;
}

/* =======================
   TODAY ATTENDANCE
======================= */
export const getTodayAttendance = () =>
  apiFetch(`${BASE_URL}/attendance/today`);

/* =======================
   CHECK IN
======================= */
export const checkIn = () =>
  apiFetch(`${BASE_URL}/attendance/checkin`, {
    method: "POST"
  });

/* =======================
   BREAK START
======================= */
export const startBreak = async () => {
  try {
    return await apiFetch(`${BASE_URL}/attendance/break/start`, {
      method: "POST"
    });
  } catch (e) {
    if (e.status === 409) return { alreadyOnBreak: true };
    throw e;
  }
};

/* =======================
   BREAK END
======================= */
export const endBreak = async () => {
  try {
    return await apiFetch(`${BASE_URL}/attendance/break/end`, {
      method: "POST"
    });
  } catch (e) {
    if (e.status === 409) return { noActiveBreak: true };
    throw e;
  }
};

/* =======================
   CHECK OUT
======================= */
export const checkOut = (workSummary) =>
  apiFetch(`${BASE_URL}/attendance/checkout`, {
    method: "POST",
    body: JSON.stringify({ workSummary })
  });

/* =======================
   ATTENDANCE HISTORY
======================= */
export const getAttendanceHistory = () =>
  apiFetch(`${BASE_URL}/attendance/history?limit=30`);
/* =======================
   RULES & ANNOUNCEMENTS
======================= */

export const getRules = () =>
  apiFetch(`${BASE_URL}/rules`);

export const getAnnouncements = () =>
  apiFetch(`${BASE_URL}/announcements`);

export const updateRules = (payload) =>
  apiFetch(`${BASE_URL}/rules`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
