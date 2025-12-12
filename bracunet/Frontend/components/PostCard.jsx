import React from "react";

export default function PostCard({ post, onReact, onComment }) {
  return (
    <div className="bg-white/20 backdrop-blur-sm rounded-lg shadow-lg p-4 mb-4">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-white font-bold">{post.title}</h4>
        <span className="text-xs text-white/70">
          {post.createdBy?.name || "Unknown"}
        </span>
      </div>
      <p className="text-white/80 mb-2 whitespace-pre-line">{post.body}</p>
      <div className="flex gap-2">
        <button
          className="px-2 py-1 text-xs bg-yellow-500 hover:bg-yellow-600 text-white rounded"
          onClick={() => onReact(post._id, "like")}
        >
          👍 {post.likes.length}
        </button>
        <button
          className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-800 text-white rounded"
          onClick={() => onComment(post._id)}
        >
          💬 {post.comments.length}
        </button>
      </div>
    </div>
  );
}
