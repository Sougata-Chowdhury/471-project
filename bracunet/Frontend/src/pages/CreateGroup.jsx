import { useState } from "react";
import { createGroup } from "../api";

export const CreateGroup = ({ onCreated }) => {
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !topic) return alert("Name and Topic are required");

    try {
      setLoading(true);
      const res = await createGroup({ name, topic, description });
      console.log('Create group response:', res);
      // Backend returns { success: true, group: {...} }
      const newGroup = res.data?.group || res.data;
      onCreated(newGroup);
      setName("");
      setTopic("");
      setDescription("");
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
          <label className="text-white font-semibold text-sm block mb-2">Group Name *</label>
          <input
            type="text"
            placeholder="e.g., Career Development, Alumni Networking"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border border-white/30 rounded-lg bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
            required
          />
        </div>
        
        <div>
          <label className="text-white font-semibold text-sm block mb-2">Topic *</label>
          <input
            type="text"
            placeholder="e.g., Job Opportunities, Academic Research"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full p-3 border border-white/30 rounded-lg bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
            required
          />
        </div>
        
        <div>
          <label className="text-white font-semibold text-sm block mb-2">Description (Optional)</label>
          <textarea
            placeholder="Provide more details about this group..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 border border-white/30 rounded-lg bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent resize-none"
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
