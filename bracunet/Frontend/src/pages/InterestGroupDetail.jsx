import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { API_BASE } from '../config';
import config from '../config';
import { io } from 'socket.io-client';

const InterestGroupDetail = () => {
  const { groupId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);
  const [joinRequests, setJoinRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [postText, setPostText] = useState('');
  const [postImage, setPostImage] = useState(null);
  const [showRequests, setShowRequests] = useState(false);
  const [openComments, setOpenComments] = useState({});
  const [posting, setPosting] = useState(false);
  const [posts, setPosts] = useState([]);
  const [showMembers, setShowMembers] = useState(false);

  useEffect(() => {
    fetchGroupDetails();
    fetchPosts();
  }, [groupId]);

  const fetchGroupDetails = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/interest-groups/${groupId}`, {
        withCredentials: true,
      });
      setGroup(res.data);
      
      const userIdStr = String(user?._id || user?.id || '');
      setIsCreator(String(res.data.creator._id) === userIdStr);
      setIsJoined(res.data.members.some((m) => String(m.userId._id) === userIdStr));
      setHasRequested((res.data.joinRequests || []).some((r) => String(r.userId?._id || r.userId) === userIdStr));
      setEditName(res.data.name || '');
      setEditDescription(res.data.description || '');
      setEditCategory(res.data.category || '');
      setLoading(false);
    } catch (err) {
      setError('Failed to load group details');
      setLoading(false);
    }
  };

  const fetchJoinRequests = async () => {
    if (!isCreator) return;
    try {
      setLoadingRequests(true);
      const res = await axios.get(`${API_BASE}/api/interest-groups/${groupId}/join-requests`, { withCredentials: true });
      setJoinRequests(res.data || []);
    } catch (err) {
      console.error('Failed to load join requests', err);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    if (isCreator && showRequests) {
      fetchJoinRequests();
    }
  }, [isCreator, groupId, showRequests]);

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/interest-groups/${groupId}/posts`);
      setPosts(res.data);
    } catch (err) {
      console.error('Failed to load posts', err);
    }
  };

  // Socket.IO setup for real-time posts
  useEffect(() => {
    if (!groupId || !user) return;

    let socket = socketRef.current;
    if (!socket) {
      socket = io(config.socketUrl, {
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 500,
        transports: ['websocket', 'polling'],
      });
      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('✅ Socket connected to interest group detail');
        socket.emit('joinInterestGroupRoom', { groupId });
      });

      socket.on('groupPost', (newPost) => {
        console.log('📝 Received new group post:', newPost._id);
        const newPostGroupId = typeof newPost.groupId === 'object' ? String(newPost.groupId?._id || newPost.groupId) : String(newPost.groupId);
        if (newPostGroupId === String(groupId)) {
          setPosts((prev) => [newPost, ...prev]);
        }
      });

      socket.on('groupPostUpdated', (updatedPost) => {
        console.log('✏️ Post updated:', updatedPost._id);
        const updatedPostGroupId = typeof updatedPost.groupId === 'object' ? String(updatedPost.groupId?._id || updatedPost.groupId) : String(updatedPost.groupId);
        if (updatedPostGroupId === String(groupId)) {
          setPosts((prev) => prev.map(p => p._id === updatedPost._id ? updatedPost : p));
        }
      });

      socket.on('disconnect', () => {
        console.warn('Socket disconnected from group detail');
      });
    } else {
      socket.emit('joinInterestGroupRoom', { groupId });
    }

    return () => {
      try {
        socket.emit('leaveInterestGroupRoom', { groupId });
      } catch (e) {}
    };
  }, [groupId, user]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this group? This cannot be undone.')) return;
    
    try {
      await axios.delete(`${API_BASE}/api/interest-groups/${groupId}`, {
        withCredentials: true,
      });
      alert('Group deleted!');
      navigate('/interest-groups');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete group');
    }
  };

  const handleEdit = async () => {
    try {
      const payload = {
        name: editName,
        description: editDescription,
        category: editCategory,
      };
      const res = await axios.patch(`${API_BASE}/api/interest-groups/${groupId}`, payload, {
        withCredentials: true,
      });
      setGroup(res.data);
      setEditMode(false);
      alert('Group updated');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update group');
    }
  };

  const handleJoin = async () => {
    try {
      const res = await axios.post(`${API_BASE}/api/interest-groups/${groupId}/join`, {}, {
        withCredentials: true,
      });
      setGroup(res.data);
      setIsJoined(true);
      alert('Joined group!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to join group');
    }
  };

  const handleRequestJoin = async () => {
    try {
      const res = await axios.post(`${API_BASE}/api/interest-groups/${groupId}/request-join`, {}, { withCredentials: true });
      setGroup(res.data);
      setHasRequested(true);
      alert('Join request sent');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to request join');
    }
  };

  const handleApproveRequest = async (userId) => {
    try {
      const res = await axios.post(`${API_BASE}/api/interest-groups/${groupId}/join-requests/${userId}/approve`, {}, { withCredentials: true });
      setGroup(res.data);
      setJoinRequests((prev) => prev.filter((r) => String(r.userId?._id || r.userId) !== String(userId)));
      alert('Approved');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve');
    }
  };

  const handleRejectRequest = async (userId) => {
    try {
      await axios.post(`${API_BASE}/api/interest-groups/${groupId}/join-requests/${userId}/reject`, {}, { withCredentials: true });
      setJoinRequests((prev) => prev.filter((r) => String(r.userId?._id || r.userId) !== String(userId)));
      alert('Rejected');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject');
    }
  };

  const handleCreatePost = async () => {
    if (!postText.trim() && !postImage) return;
    try {
      setPosting(true);
      const formData = new FormData();
      formData.append('content', postText);
      if (postImage) formData.append('image', postImage);
      await axios.post(`${API_BASE}/api/interest-groups/${groupId}/posts`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPostText('');
      setPostImage(null);
      // Socket.IO will emit groupPost event and update UI in real-time
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post');
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const res = await axios.post(`${API_BASE}/api/interest-groups/posts/${postId}/like`, {}, { withCredentials: true });
      setPosts((prev) => prev.map(p => p._id === postId ? res.data : p));
    } catch (err) {}
  };

  const handleComment = async (postId, text) => {
    if (!text.trim()) return;
    try {
      const res = await axios.post(`${API_BASE}/api/interest-groups/posts/${postId}/comment`, { text }, { withCredentials: true });
      setPosts((prev) => prev.map(p => p._id === postId ? res.data : p));
    } catch (err) {}
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-center mt-10 text-red-600">{error}</p>;
  if (!group) return <p className="text-center mt-10">Group not found</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/interest-groups')}
          className="text-blue-600 hover:text-blue-700 mb-6 flex items-center gap-1"
        >
          ← Back
        </button>

        {/* Group Header / Edit */}
        <div className="bg-gradient-to-br from-blue-400 to-purple-500 text-white p-8 rounded-lg mb-6">
          {!editMode ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{group.name}</h1>
                  <p className="text-white text-opacity-90 max-w-3xl">{group.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">Category</p>
                  <p className="text-lg font-semibold capitalize">{group.category}</p>
                </div>
              </div>
              <div className="flex gap-4 mt-4 text-sm">
                <span className="bg-white bg-opacity-20 px-3 py-1 rounded">
                  Creator: {group.creator.name}
                </span>
                {group.status === 'pending' ? null : (
                  <span className="bg-white bg-opacity-20 px-3 py-1 rounded">
                    {group.status.charAt(0).toUpperCase() + group.status.slice(1)}
                  </span>
                )}
                <span className="bg-white bg-opacity-20 px-3 py-1 rounded">
                  {group.members.length} members
                </span>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-4">
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1 px-4 py-2 rounded text-gray-900"
                  placeholder="Group name"
                />
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="px-4 py-2 rounded text-gray-900"
                >
                  <option value="sports">Sports</option>
                  <option value="academics">Academics</option>
                  <option value="hobbies">Hobbies</option>
                  <option value="career">Career</option>
                  <option value="arts">Arts</option>
                  <option value="technology">Technology</option>
                  <option value="social">Social</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full px-4 py-3 rounded text-gray-900"
                rows={3}
                placeholder="Description"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleEdit}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditMode(false);
                    setEditName(group.name || '');
                    setEditDescription(group.description || '');
                    setEditCategory(group.category || '');
                  }}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mb-6 flex gap-4">
          {(isCreator || (user?.role === 'admin')) && (
            <>
              <button
                onClick={() => setEditMode(true)}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg font-semibold"
              >
                ✏️ Edit Group
              </button>
              <button
                onClick={() => setShowRequests((s) => !s)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
              >
                {showRequests ? 'Hide Pending' : 'Pending Requests'}
              </button>
              {(isCreator || (user?.role === 'admin')) && (
                <button
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold"
                >
                  🗑️ Delete Group
                </button>
              )}
            </>
          )}
          {(isCreator || isJoined) && (
            <button
              onClick={() => setShowMembers((s) => !s)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold"
            >
              {showMembers ? 'Hide Members' : 'Members'} ({group.members.length})
            </button>
          )}
          {isJoined && !isCreator && (
            <button
              onClick={async () => {
                try {
                  const res = await axios.delete(`${API_BASE}/api/interest-groups/${groupId}/leave`, { withCredentials: true });
                  setGroup(res.data);
                  setIsJoined(false);
                  alert('You left the group');
                } catch (err) {
                  alert(err.response?.data?.message || 'Failed to leave');
                }
              }}
              className="bg-gray-300 hover:bg-gray-400 text-gray-900 px-6 py-2 rounded-lg font-semibold"
            >
              Leave Group
            </button>
          )}
          {!isJoined && (
            hasRequested ? (
              <button className="bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold" disabled>
                Requested
              </button>
            ) : (
              <button
                onClick={handleRequestJoin}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
              >
                Request to Join
              </button>
            )
          )}
          {isJoined && (
            <button
              onClick={() => navigate(`/interest-groups/${groupId}/chat`)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold"
            >
              💬 Go to Chat
            </button>
          )}
        </div>

        {/* Quick Post (uses chat endpoint) */}
        {isJoined && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <h3 className="text-lg font-semibold mb-2">Create Post</h3>
            <textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              className="w-full border rounded-lg p-3 mb-3"
              rows={3}
              placeholder="Share an update..."
            />
            <div className="flex items-center gap-3 mb-3">
              <input type="file" accept="image/*" onChange={(e) => setPostImage(e.target.files?.[0] || null)} />

        {/* Join Requests (creator only, shown when toggled) */}
        {isCreator && showRequests && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-bold mb-4">Join Requests</h3>
            {loadingRequests ? (
              <p>Loading requests...</p>
            ) : (joinRequests.length === 0 ? (
              <p className="text-gray-600">No pending requests</p>
            ) : (
              <div className="space-y-3">
                {joinRequests.map((r) => {
                  const u = r.userId || {};
                  return (
                    <div key={r._id || u._id} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                      <div>
                        <p className="font-semibold">{u.name || 'User'}</p>
                        <p className="text-xs text-gray-600">Requested: {new Date(r.requestedAt).toLocaleString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleApproveRequest(String(u._id || r.userId))} className="bg-green-600 text-white px-3 py-1 rounded">Approve</button>
                        <button onClick={() => handleRejectRequest(String(u._id || r.userId))} className="bg-red-600 text-white px-3 py-1 rounded">Reject</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
              {postImage && <span className="text-sm text-gray-600">{postImage.name}</span>}
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleCreatePost}
                disabled={posting}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-5 py-2 rounded-lg font-semibold"
              >
                {posting ? 'Posting...' : 'Post'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">Posts appear in the group feed.</p>
          </div>
        )}

        {/* Posts Feed */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h3 className="text-lg font-semibold mb-4">Posts</h3>
          {posts.length === 0 ? (
            <p className="text-gray-600">No posts yet.</p>
          ) : (
            <div className="space-y-4">
              {posts.map((p) => (
                <div key={p._id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <p className="font-semibold">{p.author?.name || 'Member'}</p>
                      <p className="text-xs text-gray-500">{new Date(p.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  {p.imageUrl && <img src={p.imageUrl} alt="Post" className="rounded mb-2 max-h-64 object-cover" />}
                  <p className="mb-3">{p.content}</p>
                  <div className="flex gap-3 mb-3">
                    <button onClick={() => handleLike(p._id)} className="text-blue-600">👍 {p.likes?.length || 0}</button>
                    <button onClick={() => setOpenComments((prev) => ({ ...prev, [p._id]: !prev[p._id] }))} className="text-gray-600">💬 {p.comments?.length || 0}</button>
                    {/* Share removed per request */}
                  </div>
                  {openComments[p._id] && (
                    <div className="space-y-2">
                      {p.comments?.map((c) => (
                        <div key={c._id} className="bg-gray-50 rounded p-2">
                          <p className="text-sm"><span className="font-semibold">{c.user?.name || 'Member'}:</span> {c.text}</p>
                        </div>
                      ))}
                      {isJoined && (
                        <div className="flex gap-2">
                          <input id={`c-${p._id}`} className="flex-1 border rounded px-2 py-1" placeholder="Write a comment..." />
                          <button onClick={() => {
                            const el = document.getElementById(`c-${p._id}`);
                            handleComment(p._id, el?.value || '');
                            if (el) el.value='';
                          }} className="bg-gray-200 px-3 rounded">Comment</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Members panel (toggle) */}
        {(isCreator || isJoined) && showMembers && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Members ({group.members.length})</h2>
            <div className="space-y-2">
              {group.members.map((member) => (
                <div key={member.userId._id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                      {member.userId.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold">{member.userId.name}</p>
                      <p className="text-xs text-gray-600 capitalize">{member.role}</p>
                    </div>
                  </div>
                  {isCreator && String(member.userId._id) !== String(user?._id || user?.id) && (
                    <button
                      onClick={async () => {
                        try {
                          const res = await axios.delete(`${API_BASE}/api/interest-groups/${groupId}/members/${member.userId._id}`, { withCredentials: true });
                          setGroup(res.data);
                          alert('Member removed');
                        } catch (err) {
                          alert(err.response?.data?.message || 'Failed to remove');
                        }
                      }}
                      className="bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending notice for requester */}
        {!isJoined && hasRequested && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4 mb-6">
            Your join request is pending approval.
          </div>
        )}

        
      </div>
    </div>
  );
};

export default InterestGroupDetail;
