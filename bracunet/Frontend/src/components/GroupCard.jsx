import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestJoinGroup } from '../api';

export default function GroupCard({ group }) {
  const navigate = useNavigate();
  const [joinStatus, setJoinStatus] = useState(group.joinStatus || 'none');

  return (
    <article
      role="button"
      onClick={() => navigate(`/groups/${group._id}`)}
      className="group overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border border-gray-100 cursor-pointer"
    >
      {/* Image/Banner Section */}
      <div className="relative h-48 w-full overflow-hidden">
        {group.image ? (
          <>
            <img
              src={group.image}
              alt={group.name}
              className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </>
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-5xl font-extrabold">
            {group.name ? group.name.charAt(0).toUpperCase() : 'G'}
          </div>
        )}
        
        {/* Topic Badge */}
        <div className="absolute left-4 bottom-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
          🏷️ {group.topic}
        </div>
        
        {/* Members Count */}
        <div className="absolute right-4 top-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-gray-800 shadow-lg flex items-center gap-1.5">
          <span>👥</span>
          <span>{group.members?.length || 0}</span>
        </div>
        
        {/* Status Badge */}
        {joinStatus === 'approved' && (
          <div className="absolute left-4 top-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
            ✅ Joined
          </div>
        )}
        {joinStatus === 'pending' && (
          <div className="absolute left-4 top-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
            ⏳ Pending
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200 line-clamp-1">
          {group.name}
        </h3>
        
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 mb-4">
          {group.description || 'No description available. Join to learn more!'}
        </p>

        {/* Stats Row */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-sm">👥</span>
            </div>
            <div>
              <p className="text-xs text-gray-500">Members</p>
              <p className="text-sm font-bold text-gray-800">{group.members?.length || 0}</p>
            </div>
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.location.assign(`/groups/${group._id}`);
            }}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-1"
          >
            Open →
          </button>
        </div>
      </div>
    </article>
  );
}
