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
      onCreated(res); // res is the created group object
      setName("");
      setTopic("");
      setDescription("");
    } catch (err) {
      console.error(err);
      alert(err.data?.message || "Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded-lg shadow-md border border-gray-200">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">Create New Group</h3>
      <input
        type="text"
        placeholder="Group Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="mb-2 w-full p-2 border rounded"
      />
      <input
        type="text"
        placeholder="Topic"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        className="mb-2 w-full p-2 border rounded"
      />
      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="mb-2 w-full p-2 border rounded"
      />
      <button type="submit" disabled={loading} className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded">
        {loading ? "Creating..." : "Create Group"}
      </button>
    </form>
  );
};
