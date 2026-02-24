import { useEffect, useState } from "react";
import { getRules, updateRules } from "../../services/attendanceService";

const Rules = () => {
  const [title, setTitle] = useState("");
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [version, setVersion] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const data = await getRules();

      setTitle(data.title || "");
      setRules(Array.isArray(data.content) ? data.content : []);
      setVersion(data.version || 1);
    } catch (err) {
      console.error("Error fetching rules:", err);
      setError(err.message || "Failed to load rules");
    } finally {
      setLoading(false);
    }
  };

  const handleRuleChange = (index, value) => {
    const updated = [...rules];
    updated[index] = value;
    setRules(updated);
  };

  const addRule = () => {
    setRules([...rules, ""]);
  };

  const removeRule = (index) => {
    const updated = rules.filter((_, i) => i !== index);
    setRules(updated);
  };

  const handleSave = async () => {
    setMessage("");
    setError("");

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    const cleanedRules = rules.filter((r) => r.trim() !== "");

    if (cleanedRules.length === 0) {
      setError("At least one rule is required");
      return;
    }

    try {
      setSaving(true);

      await updateRules({
        title,
        content: cleanedRules,
      });

      setMessage("Rules updated successfully!");
      setRules(cleanedRules);

      // Reload fresh version from backend
      await fetchRules();

    } catch (err) {
      console.error("Update failed:", err);
      setError(err.message || "Failed to update rules");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Loading rules...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <h2 className="text-2xl font-semibold">Edit Company Rules</h2>

      {version && (
        <p className="text-sm text-gray-500">
          Current Version: {version}
        </p>
      )}

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

      {/* Title */}
      <div>
        <label className="block font-medium mb-2">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded-lg p-3"
        />
      </div>

      {/* Rules */}
      <div className="space-y-4">
        <label className="block font-medium">Rules</label>

        {rules.map((rule, index) => (
          <div key={index} className="flex gap-3">
            <input
              type="text"
              value={rule}
              onChange={(e) => handleRuleChange(index, e.target.value)}
              className="flex-1 border rounded-lg p-3"
            />
            <button
              onClick={() => removeRule(index)}
              className="bg-red-500 hover:bg-red-600 text-white px-4 rounded-lg"
            >
              Delete
            </button>
          </div>
        ))}

        <button
          onClick={addRule}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          + Add Rule
        </button>
      </div>

      {/* Save */}
      <div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-black text-white px-6 py-3 rounded-lg disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default Rules;
