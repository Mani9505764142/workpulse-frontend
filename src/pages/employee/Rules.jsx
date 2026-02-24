import { useEffect, useState } from "react";
import { getRules, getAnnouncements } from "../../services/attendanceService";

const BUCKET_URL =
  "https://workpulse-announcements-assets.s3.us-east-1.amazonaws.com/";

export default function Rules() {
  const [rules, setRules] = useState([]);
  const [title, setTitle] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [announcements, setAnnouncements] = useState([]);
  const [announcementError, setAnnouncementError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        // Load Rules
        const rulesData = await getRules();

        setTitle(rulesData?.title || "Rules & Regulations");
        setRules(Array.isArray(rulesData?.content) ? rulesData.content : []);
        setUpdatedAt(rulesData?.updatedAt || "");

        // Load Announcements
        const announcementData = await getAnnouncements();

        // Defensive handling (important)
        const announcementArray = Array.isArray(announcementData)
          ? announcementData
          : announcementData?.announcements || [];

        setAnnouncements(announcementArray);
      } catch (e) {
        console.error("LOAD ERROR:", e);
        setError(e.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading)
    return (
      <div className="p-6">
        <p className="text-gray-500">Loading content...</p>
      </div>
    );

  return (
    <div className="p-6 space-y-10">

      {/* RULES SECTION */}
      <div>
        <h2 className="text-2xl font-semibold">{title}</h2>

        {updatedAt && (
          <p className="text-sm text-gray-500 mt-1">
            Last updated: {new Date(updatedAt).toLocaleString()}
          </p>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mt-4">
            {error}
          </div>
        )}

        {!error && rules.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-lg mt-4">
            No rules available at the moment.
          </div>
        )}

        {rules.length > 0 && (
          <div className="bg-white p-8 rounded-2xl shadow-lg mt-6">
            <ol className="list-decimal pl-6 space-y-4 text-gray-700">
              {rules.map((rule, index) => (
                <li key={index}>{rule}</li>
              ))}
            </ol>
          </div>
        )}
      </div>

      {/* ANNOUNCEMENTS SECTION */}
      <div>
        <h2 className="text-2xl font-semibold">Announcements</h2>

        {announcementError && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mt-4">
            {announcementError}
          </div>
        )}

        {announcements.length === 0 && (
          <div className="bg-gray-50 border border-gray-200 text-gray-600 p-4 rounded-lg mt-4">
            No announcements available.
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {announcements.map((item) => {
            const fileUrl = item.fileKey
              ? `${BUCKET_URL}${item.fileKey}`
              : null;

            return (
              <div
                key={item.announcementId}
                className="bg-white rounded-2xl shadow-lg p-6 space-y-4"
              >
                <h3 className="text-lg font-semibold">{item.title}</h3>

                {item.description && (
                  <p className="text-gray-600">{item.description}</p>
                )}

                {/* IMAGE */}
                {fileUrl && item.fileType?.startsWith("image/") && (
                  <img
                    src={fileUrl}
                    alt={item.title}
                    className="rounded-lg w-full object-cover"
                  />
                )}

                {/* PDF / OTHER FILE */}
                {fileUrl && !item.fileType?.startsWith("image/") && (
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 font-medium underline"
                  >
                    View Attachment
                  </a>
                )}

                <p className="text-xs text-gray-400">
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
