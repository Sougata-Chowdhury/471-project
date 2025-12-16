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
      className="group overflow-hidden rounded-2xl bg-white/95 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition duration-200 border border-gray-100 cursor-pointer"
    >
      <div className="relative h-40 w-full">
        {group.image ? (
          <img
            src={group.image}
            alt={group.name}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white text-3xl font-extrabold">
            {group.name ? group.name.charAt(0).toUpperCase() : 'G'}
          </div>
        )}
        <div className="absolute left-4 bottom-3 bg-white/95 px-3 py-1 rounded-full text-sm font-semibold text-indigo-600 shadow-sm">{group.topic}</div>
        <div className="absolute right-4 top-3 bg-white/95 px-3 py-1 rounded-full text-xs font-medium text-gray-800 shadow-sm flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87M12 12a4 4 0 100-8 4 4 0 000 8z" />
          </svg>
          <span>{group.members?.length || 0}</span>
        </div>
        {/* Join overlay button (top-right) */}
        <div className="absolute left-3 top-3">
          {joinStatus !== 'approved' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                // optimistic UI
                setJoinStatus('pending');
                requestJoinGroup(group._id).then(() => {
                  setJoinStatus('pending');
                }).catch(err => {
                  console.error('Join failed', err);
                  alert('Failed to request join: ' + (err?.data?.message || err?.message || 'Unknown'));
                  setJoinStatus(group.joinStatus || 'none');
                });
              }}
              className="bg-white text-indigo-600 px-3 py-1 rounded border text-xs"
            >
              {joinStatus === 'pending' ? 'Requested' : 'Join'}
            </button>
          )}
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 truncate">{group.name}</h3>
        <p className="text-sm text-gray-600 mt-2 line-clamp-3">{group.description || 'No description yet'}</p>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-xs text-gray-500">Members</div>
            <div className="text-sm font-semibold text-gray-800">{group.members?.length || 0}</div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 text-xs rounded-full ${group.joinStatus === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{group.joinStatus || 'none'}</span>
          </div>
        </div>

        <div className="mt-4 flex gap-2 items-center">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/groups/${group._id}`); }}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded text-sm"
            title="Open chat"
          >
            Message
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); window.location.assign(`/groups/${group._id}`); }}
            className="bg-white border px-3 py-2 rounded text-sm"
            title="Open group"
          >
            Open
          </button>
        </div>
      </div>
    </article>
  );
}
