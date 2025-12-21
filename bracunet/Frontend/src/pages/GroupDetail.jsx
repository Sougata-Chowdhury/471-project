import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { fetchGroupMessages, postGroupMessage, fetchGroups, createGroupMeeting, createMeetingToken as apiCreateMeetingToken, requestJoinGroup, getGroupPosts, createGroupPost, reactToPost, addPostComment, getGroupDetails } from '../api';
import { io } from 'socket.io-client';

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
    const socket = io('http://localhost:3000', { transports: ['websocket'] });
    socketRef.current = socket;
    socket.emit('joinGroupRoom', { groupId: id });
    socket.on('groupMessage', (m) => {
      setMessages(prev => {
        // avoid duplicate messages
        if (prev.some(pm => pm._id === m._id)) return prev;
        return [...prev, m];
      });
    });

    return () => {
      try { socket.emit('leaveGroupRoom', { groupId: id }); } catch(e){}
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

  if (!group) return <div className="p-6">Loading group...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-6">
      <div className="max-w-4xl mx-auto bg-white/90 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800">{group.name}</h2>
        <p className="text-sm text-gray-600 mt-2">{group.description}</p>
        <div className="mt-4 flex gap-2">
          <div className="flex gap-2">
            {user && user.role === 'admin' && (
              <button onClick={() => navigate(`/groups/${id}/requests`)} className="bg-white text-indigo-600 px-3 py-2 rounded border">Manage</button>
            )}
            {(group.joinStatus === 'approved' || (user && user.role === 'admin')) ? (
              <button onClick={handleCreateMeeting} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded">Start Meeting</button>
            ) : (
              <button onClick={handleJoin} className="bg-white text-indigo-600 px-3 py-2 rounded border">Request to Join</button>
            )}
          </div>
          <div className="flex-1 text-right flex items-center justify-end gap-2">
            <button onClick={() => navigate('/dashboard')} className="bg-white text-indigo-600 px-3 py-2 rounded border">Back to Dashboard</button>
            <button onClick={handleCreatePost} className="bg-white text-indigo-600 px-3 py-2 rounded border">Post</button>
          </div>
        </div>

        <hr className="my-6" />

        {/* Pending requests (admin) */}
        {user && user.role === 'admin' && (
          <div className="bg-white p-4 rounded mb-4">
            <h4 className="font-semibold mb-2">Pending Join Requests</h4>
            {loadingRequests ? (
              <div className="text-sm text-gray-500">Loading requests...</div>
            ) : pendingRequests.length === 0 ? (
              <div className="text-sm text-gray-500">No pending requests</div>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map(r => (
                  <div key={r._id || r.id || r} className="flex items-center justify-between border rounded p-2">
                    <div>
                      <div className="font-medium">{r.name || r.username || r.email || 'User'}</div>
                      <div className="text-xs text-gray-500">{r.email || ''}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleApprove(r._id || r.id || r)} className="bg-green-600 text-white px-3 py-1 rounded">Approve</button>
                      <button onClick={() => handleReject(r._id || r.id || r)} className="bg-red-100 text-red-700 px-3 py-1 rounded">Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Newsfeed</h3>

          <div className="bg-white p-4 rounded mb-4">
            <input value={newPostTitle} onChange={e=>setNewPostTitle(e.target.value)} placeholder="Post title" className="w-full p-2 border rounded mb-2" />
            <textarea value={newPostBody} onChange={e=>setNewPostBody(e.target.value)} placeholder="What's happening?" className="w-full p-2 border rounded mb-2" rows={3} />
            <input type="file" accept="image/*" onChange={e=>setNewPostImage(e.target.files?.[0]||null)} className="mb-2" />
            {newPostImage && <div className="text-sm text-gray-600 mb-2">Selected: {newPostImage.name}</div>}
            <div className="flex gap-2">
              <button onClick={handleCreatePost} className="bg-indigo-600 text-white px-4 py-2 rounded">Post</button>
              <button onClick={() => { navigator.clipboard && navigator.clipboard.writeText(window.location.href); alert('Link copied'); }} className="bg-white border px-4 py-2 rounded">Copy Link</button>
              <button onClick={() => navigate('/groups')} className="ml-auto bg-white border px-4 py-2 rounded">Back to Groups</button>
            </div>
          </div>

          {/* Chat section */}
          <div className="bg-white p-4 rounded mb-4">
            <h4 className="font-semibold mb-2">Chat</h4>
            <div className="max-h-48 overflow-y-auto mb-2 border p-2">
              {messages.map(m => (
                <div key={m._id} className="mb-2">
                  <div className="text-xs text-gray-500">{m.sender?.name || m.author?.name || 'User'} · {new Date(m.createdAt).toLocaleTimeString()}</div>
                  <div className="text-sm">{m.content}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={text} onChange={e=>setText(e.target.value)} placeholder="Type a message" className="flex-1 p-2 border rounded" />
              <button onClick={sendMessage} className="bg-indigo-600 text-white px-4 py-2 rounded">Send</button>
            </div>
          </div>
          </div>

          <div className="space-y-4">
            {posts.map(p => (
              <div key={p._id} className="bg-white p-4 rounded shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{p.title}</div>
                    <div className="text-xs text-gray-500">by {p.author?.name || 'Unknown'}</div>
                  </div>
                  <div className="text-sm text-gray-500">{new Date(p.createdAt).toLocaleString()}</div>
                </div>
                <div className="mt-3 text-gray-800">{p.content}</div>
                <div className="mt-3 flex gap-3 text-sm">
                  <button onClick={() => handleLike(p._id)} className="text-indigo-600">Like ({p.likes||0})</button>
                  <button onClick={() => handleAddComment(p._id)} className="text-gray-600">Comment ({(p.comments||[]).length})</button>
                </div>
                {(p.comments||[]).length>0 && (
                  <div className="mt-3 text-sm text-gray-700">
                    {p.comments.map(c=> (
                      <div key={c._id} className="border-t pt-2 mt-2">{c.sender?.name || 'User'}: {c.content}</div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Meeting modal */}
        {meetingModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="w-full max-w-4xl h-[80vh] bg-white rounded overflow-hidden">
              <div className="flex items-center justify-between p-2 border-b">
                <div className="font-semibold">Meeting: {meetingModal.roomName}</div>
                <div className="flex items-center gap-2">
                  <a href={meetingModal.url} target="_blank" rel="noreferrer" className="text-sm text-indigo-600">Open in new tab</a>
                  <button onClick={() => setMeetingModal({ open: false, url: '', roomName: '', token: '' })} className="px-3 py-1 bg-red-500 text-white rounded">Close</button>
                </div>
              </div>
              <div className="h-full">
                <iframe
                  title="Daily Meeting"
                  src={meetingModal.token ? `${meetingModal.url}?t=${meetingModal.token}` : meetingModal.url}
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      )
}
