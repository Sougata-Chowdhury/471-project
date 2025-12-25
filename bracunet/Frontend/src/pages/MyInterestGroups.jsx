import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../config';

const MyInterestGroups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserGroups();
  }, []);

  const fetchUserGroups = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/interest-groups/me/my-groups`, {
        withCredentials: true,
      });
      setGroups(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching user groups:', err);
      setLoading(false);
    }
  };

  const handleEdit = (groupId) => {
    navigate(`/interest-groups/${groupId}`);
  };

  const handleDelete = async (groupId) => {
    if (!window.confirm('Are you sure you want to delete this group?')) return;
    
    try {
      await axios.delete(`${API_BASE}/api/interest-groups/${groupId}`, {
        withCredentials: true,
      });
      setGroups(groups.filter(g => g._id !== groupId));
      alert('Group deleted!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete group');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-blue-600 hover:text-blue-700 mb-3 flex items-center gap-1"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold">My Groups</h1>
            <p className="text-gray-600">Groups you created or joined</p>
          </div>
          <button
            onClick={() => navigate('/interest-groups/create')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            + Create Group
          </button>
        </div>

        {/* Groups List */}
        {loading ? (
          <p className="text-center text-gray-600">Loading...</p>
        ) : groups.length === 0 ? (
          <div className="text-center bg-white rounded-lg shadow-md p-12">
            <p className="text-gray-600 mb-4">You haven't created or joined any groups yet</p>
            <button
              onClick={() => navigate('/interest-groups')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
            >
              Browse Groups
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => {
              const isCreator = group.creator?._id === group.creator?._id;

              return (
                <div key={group._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="h-32 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    <span className="text-4xl text-white font-bold">{group.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1">{group.name}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{group.description}</p>

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                        {group.category.charAt(0).toUpperCase() + group.category.slice(1)}
                      </span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-semibold">
                        ✓ Active
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 mb-4">{group.members.length} members</p>

                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/interest-groups/${group._id}/chat`)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-semibold"
                      >
                        💬 Chat
                      </button>
                      {isCreator && (
                        <>
                          <button
                            onClick={() => handleEdit(group._id)}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded text-sm"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(group._id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm"
                          >
                            🗑️
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyInterestGroups;
