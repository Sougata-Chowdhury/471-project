import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { getGroups, joinGroup } from "../api";
import { CreateGroup } from "./CreateGroup";
import { useNavigate } from "react-router-dom";

const ForumList = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(true);
    getGroups()
      .then((res) => {
        console.log('Groups response:', res);
        // Backend returns { success: true, groups: [...] }
        const groupsArray = res.data?.groups || res.data || [];
        setGroups(groupsArray);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching groups:', err);
        setError(err.message || 'Failed to load groups');
        setLoading(false);
      });
  }, [user, navigate]);

  const handleJoinRequest = async (groupId) => {
    try {
      await joinGroup(groupId);
      setGroups(groups.map(g => 
        g._id === groupId ? { ...g, joinStatus: "pending" } : g
      ));
      alert("Join request sent!");
    } catch (err) {
      console.error(err);
      alert("Failed to send join request");
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-white text-xl">Loading forums...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
        <nav className="bg-white shadow">
          <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-600">BracuNet</h1>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
            >
              Back to Dashboard
            </button>
          </div>
        </nav>
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="bg-red-100/90 backdrop-blur-sm border border-red-400 text-red-700 px-6 py-4 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      <nav className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">BracuNet</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">{user?.name}</span>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate('/resources')}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
            >
              Resources
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">Discussion Forum</h2>
          <p className="text-white/90">Connect and collaborate with the community</p>
        </div>

        {/* Create Group (Admin/Faculty/Alumni only) */}
        {user && ["admin", "faculty", "alumni"].includes(user.role) && (
          <div className="mb-8">
            <CreateGroup
              onCreated={(group) => setGroups([...groups, group])}
            />
          </div>
        )}

        {/* Groups List */}
        {groups.length === 0 ? (
          <div className="bg-white/20 backdrop-blur-sm rounded-lg shadow-lg p-12 text-center">
            <div className="text-white text-6xl mb-4">💬</div>
            <h3 className="text-2xl font-bold text-white mb-3">No Discussion Groups Yet</h3>
            <p className="text-white/80 mb-6">Be the first to start a conversation!</p>
            {user && ["admin", "faculty", "alumni"].includes(user.role) && (
              <p className="text-white/70 text-sm">Use the form above to create a new group</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => {
            const joined = group.joinStatus === "approved";
            const pending = group.joinStatus === "pending";

            return (
              <div
                key={group._id}
                className="bg-white/20 backdrop-blur-sm rounded-lg shadow-lg p-6 hover:bg-white/30 transition-all border border-white/20 hover:border-white/40"
              >
                <div className="flex items-start justify-between mb-3">
                  <h2 className="font-bold text-xl text-white">{group.name}</h2>
                  {joined && (
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">✓ Member</span>
                  )}
                  {pending && (
                    <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">⏳ Pending</span>
                  )}
                </div>
                
                <p className="text-white/90 font-semibold text-sm mb-2">📚 {group.topic}</p>
                
                {group.description && (
                  <p className="text-white/70 text-sm mb-4 line-clamp-2">{group.description}</p>
                )}

                <p className="text-white/60 text-xs mb-4">
                  👤 Created by: {group.createdBy?.name || "Unknown"}
                </p>

                {joined ? (
                  <button
                    className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition shadow-lg"
                    onClick={() => navigate(`/forum/${group._id}`)}
                  >
                    Enter Discussion
                  </button>
                ) : pending ? (
                  <button
                    disabled
                    className="w-full bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold cursor-not-allowed opacity-75"
                  >
                    Awaiting Approval
                  </button>
                ) : (
                  <button
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition shadow-lg"
                    onClick={() => handleJoinRequest(group._id)}
                  >
                    Request to Join
                  </button>
                )}
              </div>
            );
          })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ForumList;
