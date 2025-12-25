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
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      {/* Modern Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                👥
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                My Groups
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/interest-groups/create')}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-semibold"
              >
                ✨ Create Group
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all duration-200 font-semibold"
              >
                ← Dashboard
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">👥</div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            My Interest Groups
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Connect with like-minded individuals and collaborate on shared interests
          </p>
        </div>

        {/* Groups Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
            <p className="text-gray-600">Loading your groups...</p>
          </div>
        ) : groups.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Groups Yet</h3>
            <p className="text-gray-600 mb-6">You haven't created or joined any groups yet</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/interest-groups')}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-semibold"
              >
                🔍 Browse Groups
              </button>
              <button
                onClick={() => navigate('/interest-groups/create')}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-semibold"
              >
                ✨ Create Group
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => {
              const isCreator = group.creator?._id === group.creator?._id;

              return (
                <div key={group._id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group hover:scale-105 border border-gray-100">
                  <div className="h-32 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/20"></div>
                    <span className="text-5xl text-white font-bold z-10">{group.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{group.name}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{group.description}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold border border-blue-200">
                        {group.category.charAt(0).toUpperCase() + group.category.slice(1)}
                      </span>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold border border-green-200">
                        ✓ Active
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                      <span>👤</span>
                      <span>{group.members?.length || 0} members</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/interest-groups/${group._id}/chat`)}
                        className="flex-1 py-2 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-semibold text-sm"
                      >
                        💬 Chat
                      </button>
                      {isCreator && (
                        <>
                          <button
                            onClick={() => handleEdit(group._id)}
                            className="py-2 px-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl transition-all duration-200 font-semibold text-sm"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(group._id)}
                            className="py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all duration-200 font-semibold text-sm"
                            title="Delete"
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
