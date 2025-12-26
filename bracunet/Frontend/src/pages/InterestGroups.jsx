import React, { useEffect, useState } from 'react';
import API from '../api/api';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../config';

const InterestGroups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const categories = ['sports', 'academics', 'hobbies', 'career', 'arts', 'technology', 'social', 'other'];

  useEffect(() => {
    fetchGroups();
  }, [page, category, search]);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 12,
        ...(category && { category }),
        ...(search && { search }),
      });
      const res = await API.get(`interest-groups?${params}`);
      console.log('📦 API Response:', res.data);
      // Handle both response formats: direct array or {groups, pagination}
      setGroups(Array.isArray(res.data) ? res.data : (res.data.groups || []));
      setLoading(false);
    } catch (err) {
      console.error('Error fetching groups:', err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-white hover:text-white/80 mb-3 flex items-center gap-1 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/20"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold mb-2 text-white">Interest Groups</h1>
            <p className="text-white/90">Explore and join communities based on your interests</p>
          </div>
        </div>

        {/* Create Group Button */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => navigate('/interest-groups/create')}
            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-lg font-semibold border border-white/30 transition-all"
          >
            + Create Group
          </button>
          <button
            onClick={() => navigate('/interest-groups/my-groups')}
            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-lg font-semibold border border-white/30 transition-all"
          >
            My Groups
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-4">
          <input
            type="text"
            placeholder="Search groups..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="flex-1 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-white placeholder-white/70"
          />
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-white"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Groups Grid */}
        {loading ? (
          <p className="text-center text-white">Loading groups...</p>
        ) : groups.length === 0 ? (
          <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg shadow-md p-12 border border-white/20">
            <p className="text-white/90 mb-4">No groups yet. Create one to get started.</p>
            <button
              onClick={() => navigate('/interest-groups/create')}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-2 rounded-lg font-semibold border border-white/30"
            >
              + Create Group
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <div
                key={group._id}
                onClick={() => navigate(`/interest-groups/${group._id}`)}
                className="bg-white rounded-lg shadow-md hover:shadow-lg cursor-pointer transition overflow-hidden"
              >
                <div className="h-32 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                  <span className="text-4xl text-white font-bold">{group.name.charAt(0).toUpperCase()}</span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1">{group.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{group.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                      {group.category.charAt(0).toUpperCase() + group.category.slice(1)}
                    </span>
                    <span className="text-xs text-gray-600">{group.members.length} members</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InterestGroups;
