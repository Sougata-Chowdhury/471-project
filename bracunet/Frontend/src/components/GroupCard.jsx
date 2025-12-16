import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function GroupCard({ group }) {
  const navigate = useNavigate();
  return (
    <div
      className="bg-white/90 rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition border-t-4 border-indigo-400"
      onClick={() => navigate(`/groups/${group._id}`)}
    >
      <h3 className="text-lg font-semibold text-gray-800">{group.name}</h3>
      <p className="text-sm text-gray-600 mt-2">{group.topic}</p>
      <div className="flex items-center justify-between mt-4">
        <span className="text-xs text-gray-500">Members: {group.members?.length || 0}</span>
        <span className="text-xs text-gray-500">Status: {group.joinStatus || 'none'}</span>
      </div>
    </div>
  );
}
