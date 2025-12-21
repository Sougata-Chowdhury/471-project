import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import { API_BASE } from "../config";

export default function AnnouncementsPanel({ mentorshipId, mentorId }) {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("general");
  const [scheduledDate, setScheduledDate] = useState("");
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, [mentorshipId]);

  const fetchAnnouncements = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/api/mentorship/announcement/${mentorshipId}`,
        { withCredentials: true }
      );
      setAnnouncements(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching announcements:", err);
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!title.trim() || !description.trim()) {
      alert("Title and description are required");
      return;
    }

    try {
      await axios.post(
        `${API_BASE}/api/mentorship/announcement/create`,
        {
          mentorshipId,
          title,
          description,
          type,
          scheduledDate: scheduledDate || null,
          link: link || null,
        },
        { withCredentials: true }
      );

      setTitle("");
      setDescription("");
      setType("general");
      setScheduledDate("");
      setLink("");
      setShowForm(false);
      fetchAnnouncements();
      alert("Announcement created ✅");
    } catch (err) {
      console.error("Error creating announcement:", err);
      alert(err.response?.data?.message || "Failed to create announcement");
    }
  };

  const handleDelete = async (announcementId) => {
    if (!window.confirm("Delete this announcement?")) return;

    try {
      await axios.delete(
        `${API_BASE}/api/mentorship/announcement/${announcementId}`,
        { withCredentials: true }
      );
      fetchAnnouncements();
      alert("Announcement deleted ✅");
    } catch (err) {
      console.error("Error deleting announcement:", err);
      alert("Failed to delete announcement");
    }
  };

  const isMentor = user._id === mentorId || user.id === mentorId;

  if (loading) return <p className="text-sm text-gray-500">Loading...</p>;

  return (
    <div className="bg-gradient-to-br from-purple-50 to-orange-50 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-lg text-gray-800">📢 Announcements</h3>
        {isMentor && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-xs bg-purple-500 hover:bg-purple-600 text-white px-2 py-1 rounded"
          >
            {showForm ? "Cancel" : "Add"}
          </button>
        )}
      </div>

      {showForm && isMentor && (
        <div className="bg-white p-4 rounded mb-3 border border-purple-200">
          <input
            type="text"
            placeholder="Title (e.g., Seminar on AI)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded px-2 py-1 mb-2 text-sm"
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded px-2 py-1 mb-2 text-sm"
            rows="3"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full border rounded px-2 py-1 mb-2 text-sm"
          >
            <option value="general">General</option>
            <option value="seminar">Seminar</option>
            <option value="workshop">Workshop</option>
            <option value="meeting">Meeting</option>
          </select>
          <input
            type="datetime-local"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            className="w-full border rounded px-2 py-1 mb-2 text-sm"
          />
          <input
            type="text"
            placeholder="Link (optional)"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="w-full border rounded px-2 py-1 mb-2 text-sm"
          />
          <button
            onClick={handleCreateAnnouncement}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white py-1 rounded text-sm font-semibold"
          >
            Post
          </button>
        </div>
      )}

      {announcements.length === 0 ? (
        <p className="text-xs text-gray-500">No announcements yet</p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {announcements.map((ann) => (
            <div
              key={ann._id}
              className="bg-white p-3 rounded border-l-4 border-purple-500 text-sm"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-bold text-gray-800">{ann.title}</p>
                  <p className="text-gray-600 text-xs mt-1">{ann.description}</p>
                  {ann.scheduledDate && (
                    <p className="text-xs text-purple-600 mt-1">
                      📅 {new Date(ann.scheduledDate).toLocaleString()}
                    </p>
                  )}
                  {ann.link && (
                    <a
                      href={ann.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline mt-1"
                    >
                      🔗 Join Link
                    </a>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    By {ann.mentor.name} • {new Date(ann.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {isMentor && (
                  <button
                    onClick={() => handleDelete(ann._id)}
                    className="text-red-500 hover:text-red-700 ml-2 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
