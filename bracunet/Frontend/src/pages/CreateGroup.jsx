import { useState } from "react";
import { createInterestGroup } from "../api";

export const CreateGroup = ({ onCreated }) => {
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !topic) return alert("Name and Topic are required");

    try {
      setLoading(true);
      let res;
      if (imageFile) {
        const fd = new FormData();
        fd.append('name', name);
        fd.append('topic', topic);
        fd.append('description', description);
        fd.append('image', imageFile);
        res = await createInterestGroup(fd);
      } else {
        res = await createInterestGroup({ name, topic, description });
      }
      console.log('Create group response:', res);
      // Backend returns { success: true, group: {...} }
      const newGroup = res.data?.group || res.data;
      if (onCreated) onCreated(newGroup);
      setName("");
      setTopic("");
      setDescription("");
      setImageFile(null);
      alert("Group created successfully!");
    } catch (err) {
      console.error(err);
      alert(err.data?.message || "Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white/20 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-white/20">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-3xl">➕</span>
        <h3 className="text-2xl font-bold text-white">Create New Discussion Group</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="text-gray-700 font-semibold text-sm block mb-2">Group Name *</label>
          <input
            type="text"
            placeholder="e.g., Career Development, Alumni Networking"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            required
          />
        </div>

        <div>
          <label className="text-gray-700 font-semibold text-sm block mb-2">Group Image (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0] || null)}
            className="w-full"
          />

          {imageFile && (
            <div className="mt-3">
              <img
                src={URL.createObjectURL(imageFile)}
                alt="preview"
                className="max-h-40 rounded shadow-sm"
              />
            </div>
          )}
        </div>

        <div>
          <label className="text-gray-700 font-semibold text-sm block mb-2">Topic *</label>
          <input
            type="text"
            placeholder="e.g., Job Opportunities, Academic Research"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            required
          />
        </div>

        <div>
          <label className="text-gray-700 font-semibold text-sm block mb-2">Description (Optional)</label>
          <textarea
            placeholder="Provide more details about this group..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 resize-none"
            rows={3}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading} 
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-bold text-lg transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creating Group..." : "✨ Create Group"}
        </button>
      </div>
    </form>
  );
};
