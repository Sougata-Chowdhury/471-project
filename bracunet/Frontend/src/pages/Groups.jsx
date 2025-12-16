import React, { useEffect, useState } from 'react';
import { fetchGroups, requestJoinGroup } from '../api';
import GroupCard from '../components/GroupCard';

export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGroups()
      .then(res => {
        setGroups(res.data.groups || res.data);
      })
      .catch(err => setError(err.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const handleJoin = async (id) => {
    try {
      await requestJoinGroup(id);
      // optimistic UI: mark pending
      setGroups(prev => prev.map(g => g._id === id ? { ...g, joinStatus: 'pending' } : g));
    } catch (err) {
      alert('Failed to request join');
    }
  };

  if (loading) return <div className="p-6">Loading groups...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Interest Groups</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map(group => (
            <div key={group._id}>
              <GroupCard group={group} />
              <div className="mt-2 flex gap-2">
                {group.joinStatus !== 'approved' && (
                  <button
                    onClick={() => handleJoin(group._id)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded"
                  >
                    Join
                  </button>
                )}
                {group.joinStatus === 'approved' && (
                  <button
                    onClick={() => window.location.assign(`/groups/${group._id}`)}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                  >
                    Open
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
