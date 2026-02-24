import { adminFetch } from "../utils/api";

// GET all announcements
export const getAnnouncements = async () => {
  return adminFetch("/announcements", {
    method: "GET",
  });
};

// CREATE announcement
export const createAnnouncement = async (data) => {
  return adminFetch("/announcements", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

// DELETE announcement
export const deleteAnnouncement = async (id) => {
  return adminFetch(`/announcements/${id}`, {
    method: "DELETE",
  });
};

// GET S3 upload URL
export const getAnnouncementUploadUrl = async (data) => {
  return adminFetch("/announcements/upload-url", {

    method: "POST",
    body: JSON.stringify(data),
  });
};
export const updateAnnouncement = async (id, data) => {
  return adminFetch(`/announcements/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};
