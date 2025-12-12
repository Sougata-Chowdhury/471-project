import React, { useState } from "react";
import API from "../api/api";

export default function PostForm({ forumId, onPost }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !body) return;
    try {
      setLoading(true);
      await API.post(`/forums/${forumId}/posts`, { title, body });
      setTitle("");
      setBody("");
      if (onPost) onPost();
    } catch (err) {
      console.error(err);
      alert("Failed to post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <input
        type="text"
        placeholder="Post title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-2 rounded mb-2 text-gray-700"
      />
      <textarea
        placeholder="Write something..."
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="w-full p-2 rounded mb-2 text-gray-700"
        rows={3}
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Posting..." : "Post"}
      </button>
    </form>
  );
}
