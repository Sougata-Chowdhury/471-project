import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { fetchGroupMessages, postGroupMessage, fetchGroups, createGroupMeeting, createMeetingToken as apiCreateMeetingToken, requestJoinGroup, getGroupPosts, createGroupPost, reactToPost, addPostComment, getGroupDetails } from '../api';
import { io } from 'socket.io-client';
import config from '../config.js';

export default function GroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const socketRef = useRef(null);
  const [posts, setPosts] = useState([]);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostBody, setNewPostBody] = useState('');
  const [meetingModal, setMeetingModal] = useState({ open: false, url: '', roomName: '', token: '' });
  const [newPostImage, setNewPostImage] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  useEffect(() => {
    // fetch group list to find this group (lightweight)
    fetchGroups().then(res => {
      const list = res.data.groups || res.data;
      const g = list.find(x => x._id === id);
      setGroup(g || null);
    }).catch(console.error);

    fetchGroupMessages(id).then(res => setMessages(res.data.messages || res.data)).catch(console.error);
    // load posts
    getGroupPosts(id).then(res => setPosts(res.data.posts || res.data)).catch(console.error);

    // Socket.IO real-time setup
    console.log('🔌 Connecting to Socket.IO for group:', id);
    const socket = io(config.socketUrl, { 
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 500,
    });
    socketRef.current = socket;
    
    socket.on('connect', () => {
      console.log('✅ Socket connected, ID:', socket.id);
      socket.emit('joinGroupRoom', { groupId: id });
      console.log('📍 Joined group room:', id);
    });

    socket.on('connect_error', (err) => {
      console.error('❌ Socket.IO connection error:', err.message);
    });

    socket.on('disconnect', (reason) => {
      console.warn('🔌 Socket disconnected:', reason);
    });

    socket.on('groupMessage', (m) => {
      console.log('📨 Received group message:', m._id);
      setMessages(prev => {
        // avoid duplicate messages
        if (prev.some(pm => pm._id === m._id)) {
          console.log('⚠️ Duplicate message detected, skipping');
          return prev;
        }
        console.log('✅ Adding message to state');
        return [...prev, m];
      });
    });

    return () => {
      try { 
        socket.emit('leaveGroupRoom', { groupId: id }); 
        console.log('👋 Left group room:', id);
      } catch(e){
        console.error('Error leaving room:', e);
      }
      socket.disconnect();
    };
  }, [id]);

  useEffect(() => {
    // load pending requests if admin
    const loadRequests = async () => {
      if (!user || user.role !== 'admin') return setPendingRequests([]);
      setLoadingRequests(true);
      try {
        const res = await getGroupRequests(id);
        const requests = res.data.requests || res.data || [];
        setPendingRequests(requests);
      } catch (err) {
        console.error('Failed to load join requests', err);
      } finally {
        setLoadingRequests(false);
      }
    };
    loadRequests();
  }, [id, user]);

  const sendMessage = async () => {
    if (!text.trim()) return;
    try {
      const res = await postGroupMessage(id, { content: text });
      const msg = res.data.message || res.data;
      setMessages(prev => [...prev, msg]);
      // emit via socket so others receive in real-time
      try { socketRef.current?.emit('groupMessage', msg); } catch(e) {}
      setText('');
    } catch (err) {
      alert('Failed to send');
    }
  };

  const handleCreatePost = async () => {
    if (!newPostTitle.trim() || !newPostBody.trim()) return alert('Title and body required');
    try {
      let body;
      if (newPostImage) {
        body = new FormData();
        body.append('title', newPostTitle);
        body.append('content', newPostBody);
        body.append('image', newPostImage);
      } else {
        body = { title: newPostTitle, content: newPostBody };
      }

      const res = await createGroupPost(id, body);
      const created = res.data.post || res.data;
      setPosts(prev => [created, ...prev]);
      setNewPostTitle(''); setNewPostBody(''); setNewPostImage(null);
    } catch (err) {
      console.error(err);
      alert('Failed to create post');
    }
  };

  const handleLike = async (postId) => {
    try {
      await reactToPost(postId, { type: 'like' });
      // optimistic update: increment like count if present
      setPosts(prev => prev.map(p => p._id === postId ? { ...p, likes: (p.likes||0)+1 } : p));
    } catch (err) { console.error(err); }
  };

  const handleAddComment = async (postId) => {
    const text = prompt('Comment');
    if (!text) return;
    try {
      const res = await addPostComment(postId, { content: text });
      const comment = res.data.comment || res.data;
      setPosts(prev => prev.map(p => p._id === postId ? { ...p, comments: [...(p.comments||[]), comment] } : p));
    } catch (err) { console.error(err); }
  };

  // const handleJoin = async () => {
  //   try {
  //     await requestJoinGroup(id);
  //     setGroup(prev => ({ ...prev, joinStatus: 'pending' }));
  //   } catch (err) {
  //     alert('Failed to request join');
  //   }
  // };

  const handleCreateMeeting = async () => {
    try {
      const res = await createGroupMeeting(id);
      const meeting = res.data.meeting || res.data;
      const roomName = meeting.name || meeting.dailyRoomName || meeting.roomName;
      // try to get a token for embedding
      let token = '';
      try {
        const tokRes = await apiCreateMeetingToken(id, roomName);
        token = tokRes.data?.token || tokRes.data || '';
      } catch (e) {
        console.warn('Token creation failed, will use public URL', e);
      }

      setMeetingModal({ open: true, url: meeting.url, roomName, token });
    } catch (err) {
      console.error(err);
      alert('Failed to create meeting');
    }
  };


  const handleJoin = async () => {
    try {
      await requestJoinGroup(id);
      setGroup(prev => ({ ...prev, joinStatus: 'pending' }));
    } catch (err) {
      console.error('join request error', err);
      const message = err?.data?.message || err?.data || err?.message || 'Failed to request join';
      alert(message);
    }
  };

  const handleApprove = async (userId) => {
    try {
      await approveJoinRequest(id, userId);
      setPendingRequests(prev => prev.filter(r => (r._id || r.id || r) !== userId));
      setGroup(prev => prev ? { ...prev, members: [...(prev.members||[]), userId] } : prev);
      alert('User approved');
    } catch (err) {
      console.error('Approve failed', err);
      alert('Failed to approve');
    }
  };

  const handleReject = async (userId) => {
    try {
      await rejectJoinRequest(id, userId);
      setPendingRequests(prev => prev.filter(r => (r._id || r.id || r) !== userId));
      alert('Request rejected');
    } catch (err) {
      console.error('Reject failed', err);
      alert('Failed to reject');
    }
  };

  if (!group) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
        <p className="text-gray-600">Loading group...</p>
      </div>
    </div>
  );

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
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {group.name}
                </h1>
                <p className="text-xs text-gray-500">{group.members?.length || 0} members</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {user && user.role === 'admin' && (
                <button 
                  onClick={() => navigate(`/groups/${id}/requests`)} 
                  className="px-4 py-2 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-all duration-200 font-semibold text-sm"
                >
                  ⚙️ Manage
                </button>
              )}
              {(group.joinStatus === 'approved' || (user && user.role === 'admin')) ? (
                <button 
                  onClick={handleCreateMeeting} 
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-semibold text-sm"
                >
                  🎥 Start Meeting
                </button>
              ) : (
                <button 
                  onClick={handleJoin} 
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-semibold text-sm"
                >
                  🚀 Request to Join
                </button>
              )}
              <button 
                onClick={() => navigate('/dashboard')} 
                className="px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all duration-200 font-semibold text-sm"
              >
                ← Back
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-4xl text-white shadow-lg">
              {group.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                {group.name}
              </h2>
              <p className="text-gray-600 mb-4">{group.description}</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold border border-blue-200">
                  {group.category || 'General'}
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold border border-green-200">
                  ✓ {group.joinStatus || 'Active'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Pending requests (admin) */}
        {user && user.role === 'admin' && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center text-white text-xl">
                ⏳
              </div>
              <h4 className="text-xl font-bold text-gray-800">Pending Join Requests</h4>
            </div>
            {loadingRequests ? (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
              </div>
            ) : pendingRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">✓</div>
                <p>No pending requests</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map(r => (
                  <div key={r._id || r.id || r} className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50 border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200">
                    <div>
                      <div className="font-semibold text-gray-800">{r.name || r.username || r.email || 'User'}</div>
                      <div className="text-sm text-gray-500">{r.email || ''}</div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleApprove(r._id || r.id || r)} 
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-105"
                      >
                        ✅ Approve
                      </button>
                      <button 
                        onClick={() => handleReject(r._id || r.id || r)} 
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-105"
                      >
                        ❌ Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Posts */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl">
                  📝
                </div>
                <h3 className="text-xl font-bold text-gray-800">Create Post</h3>
              </div>
              <input 
                value={newPostTitle} 
                onChange={e=>setNewPostTitle(e.target.value)} 
                placeholder="Post title" 
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 mb-3" 
              />
              <textarea 
                value={newPostBody} 
                onChange={e=>setNewPostBody(e.target.value)} 
                placeholder="What's happening in the group?" 
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 mb-3 resize-none" 
                rows={4} 
              />
              <input 
                type="file" 
                accept="image/*" 
                onChange={e=>setNewPostImage(e.target.files?.[0]||null)} 
                className="mb-3 w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white" 
              />
              {newPostImage && <div className="text-sm text-gray-600 mb-3 px-2">📎 Selected: {newPostImage.name}</div>}
              <div className="flex gap-2">
                <button 
                  onClick={handleCreatePost} 
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-semibold"
                >
                  🚀 Publish Post
                </button>
                <button 
                  onClick={() => { navigator.clipboard && navigator.clipboard.writeText(window.location.href); alert('Link copied'); }} 
                  className="px-4 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all duration-200 font-semibold"
                >
                  🔗
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {posts.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
                  <div className="text-6xl mb-4">📭</div>
                  <p className="text-gray-500">No posts yet. Be the first to share!</p>
                </div>
              ) : (
                posts.map(p => (
                  <div key={p._id} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-gray-800 mb-1">{p.title}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>👤 {p.author?.name || 'Unknown'}</span>
                          <span>•</span>
                          <span>📅 {new Date(p.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-gray-700 mb-4">{p.content}</div>
                    <div className="flex gap-3 pt-3 border-t border-gray-200">
                      <button 
                        onClick={() => handleLike(p._id)} 
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all duration-200 font-semibold text-sm"
                      >
                        👍 Like ({p.likes||0})
                      </button>
                      <button 
                        onClick={() => handleAddComment(p._id)} 
                        className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-all duration-200 font-semibold text-sm"
                      >
                        💬 Comment ({(p.comments||[]).length})
                      </button>
                    </div>
                    {(p.comments||[]).length>0 && (
                      <div className="mt-4 space-y-3 border-t border-gray-200 pt-4">
                        {p.comments.map(c=> (
                          <div key={c._id} className="bg-gray-50 rounded-xl p-3">
                            <div className="font-semibold text-sm text-gray-800">{c.sender?.name || 'User'}</div>
                            <div className="text-sm text-gray-600 mt-1">{c.content}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sidebar - Chat */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 sticky top-24">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white text-xl">
                    💬
                  </div>
                  <h4 className="text-xl font-bold text-gray-800">Group Chat</h4>
                </div>
              </div>
              <div className="h-96 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-12">
                    <div className="text-4xl mb-2">💬</div>
                    <p className="text-sm">No messages yet</p>
                  </div>
                ) : (
                  messages.map(m => (
                    <div key={m._id} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-3 border border-gray-100">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-gray-800">{m.sender?.name || m.author?.name || 'User'}</span>
                        <span className="text-xs text-gray-500">· {new Date(m.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <div className="text-sm text-gray-700">{m.content}</div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <input 
                    value={text} 
                    onChange={e=>setText(e.target.value)} 
                    onKeyPress={e => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..." 
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200" 
                  />
                  <button 
                    onClick={sendMessage} 
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-semibold"
                  >
                    📤
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Meeting modal */}
      {meetingModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-6xl h-[85vh] bg-white rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white text-xl">
                  🎥
                </div>
                <div>
                  <div className="font-bold text-gray-800">Meeting: {meetingModal.roomName}</div>
                  <div className="text-xs text-gray-500">Live session</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a 
                  href={meetingModal.url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-200 font-semibold text-sm"
                >
                  🔗 New Tab
                </a>
                <button 
                  onClick={() => setMeetingModal({ open: false, url: '', roomName: '', token: '' })} 
                  className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 font-semibold text-sm"
                >
                  ✕ Close
                </button>
              </div>
            </div>
            <div className="h-[calc(100%-5rem)]">
              <iframe
                title="Daily Meeting"
                src={meetingModal.token ? `${meetingModal.url}?t=${meetingModal.token}` : meetingModal.url}
                className="w-full h-full"
                allow="camera; microphone; fullscreen; display-capture"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
