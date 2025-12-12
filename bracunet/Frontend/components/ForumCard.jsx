import React from "react";

export default function ForumCard({ forum, onJoin, user }) {
  return (
    <div className="bg-white/20 backdrop-blur-sm rounded-lg shadow-lg p-4 hover:shadow-2xl transition">
      <h3 className="font-bold text-white text-lg">{forum.name}</h3>
      <p className="text-white/80 text-sm mb-2">{forum.description}</p>
      <p className="text-xs text-white/70 mb-2">
        Members: {forum.members.length}
      </p>

      {user && !forum.members.includes(user._id) && (
        <button
          onClick={() => onJoin(forum._id)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
        >
          Request to Join
        </button>
      )}
      {user && forum.members.includes(user._id) && (
        <span className="text-green-400 font-semibold">Member</span>
      )}
    </div>
  );
}
