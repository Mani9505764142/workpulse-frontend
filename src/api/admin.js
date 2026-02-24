import api from "./axios";

// ✅ NEW — GET ALL USERS
export const getAllUsers = async () => {
  const res = await api.get("/admin/all-users");
  return res.data;
};

// Existing
export const getPendingUsers = async () => {
  const res = await api.get("/admin/users?status=PENDING");
  return res.data;
};

export const approveUser = async (payload) => {
  const res = await api.put("/admin/users", payload);
  return res.data;
};
