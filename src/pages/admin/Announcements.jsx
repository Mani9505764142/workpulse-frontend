import { useEffect, useState } from "react";
import {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncementUploadUrl,
  updateAnnouncement,
} from "../../services/announcementService";



const BUCKET_URL =
  "https://workpulse-announcements-assets.s3.us-east-1.amazonaws.com/";

const Announcements = () => {

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const data = await getAnnouncements();
      setAnnouncements(data?.announcements || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setFile(null);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    console.log("HANDLE SUBMIT RUNNING");
    console.log("editingId:", editingId);
    setMessage("");
    setError("");

    if (!title.trim() || !description.trim()) {
      setError("Title and description are required");
      return;
    }

    try {
      setSaving(true);

      let fileKey = null;
      let fileType = null;

      if (file) {
        const uploadData = await getAnnouncementUploadUrl({
          fileName: file.name,
          fileType: file.type,
        });

        await fetch(uploadData.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });

        fileKey = uploadData.fileKey;
        fileType = file.type;
      }

      if (editingId) {
        await updateAnnouncement(editingId, {
          title,
          description,
          ...(fileKey && { fileKey }),
          ...(fileType && { fileType }),
        });

        setMessage("Announcement updated successfully");
      } else {
        await createAnnouncement({
          title,
          description,
          fileKey,
          fileType,
          createdBy: "admin",
        });

        setMessage("Announcement created successfully");
      }

      resetForm();
      fetchAnnouncements();
    } catch (err) {
      console.error(err);
      setError("Operation failed");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setTitle(item.title);
    setDescription(item.description);
    setEditingId(item.announcementId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?"))
      return;

    try {
      await deleteAnnouncement(id);
      fetchAnnouncements();
    } catch (err) {
      console.error(err);
      setError("Delete failed");
    }
  };

  if (loading) return <div className="p-6">Loading announcements...</div>;

  return (
    <div className="p-6 max-w-4xl space-y-8">
      <h2 className="text-2xl font-semibold">Manage Announcements</h2>

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg">
          {message}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg">
          {error}
        </div>
      )}

      {/* FORM */}
      <div className="bg-white p-6 rounded-2xl shadow space-y-4">
        <h3 className="text-lg font-medium">
          {editingId ? "Edit Announcement" : "Create New Announcement"}
        </h3>

        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border p-3 rounded-lg"
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border p-3 rounded-lg"
        />

        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="w-full"
        />

        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="bg-black text-white px-6 py-3 rounded-lg disabled:opacity-50"
        >
          {saving
            ? editingId
              ? "Updating..."
              : "Creating..."
            : editingId
            ? "Update Announcement"
            : "Create Announcement"}
        </button>
      </div>

      {/* LIST */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Existing Announcements</h3>

        {announcements.length === 0 ? (
          <p className="text-gray-500">No announcements found.</p>
        ) : (
          announcements.map((item) => (
            <div
              key={item.announcementId}
              className="bg-white p-6 rounded-2xl shadow flex justify-between items-start"
            >
              <div className="space-y-2">
                <h4 className="font-semibold">{item.title}</h4>
                <p className="text-gray-600">{item.description}</p>

                {item.fileKey &&
                  (item.fileType?.startsWith("image/") ? (
                    <img
                      src={`${BUCKET_URL}${item.fileKey}`}
                      alt="announcement"
                      className="w-40 rounded-lg border"
                    />
                  ) : (
                    <a
                      href={`${BUCKET_URL}${item.fileKey}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      View Attachment
                    </a>
                  ))}

                <p className="text-xs text-gray-400">
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => handleEdit(item)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(item.announcementId)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Announcements;