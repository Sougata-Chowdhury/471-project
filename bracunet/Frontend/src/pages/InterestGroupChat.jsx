import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { API_BASE } from '../config';
import config from '../config';
import { io } from 'socket.io-client';
import CallPanel from '../components/CallPanel';

const InterestGroupChat = () => {
  const { groupId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const socketRef = useRef(null);

  const [group, setGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCallUser, setSelectedCallUser] = useState(null);
  const currentUserId = user?._id || user?.id;

  const normalizeId = (objOrId) => {
    if (!objOrId) return '';
    if (typeof objOrId === 'string') return objOrId;
    if (typeof objOrId === 'object') return objOrId._id || objOrId.id || '';
    return String(objOrId);
  };

  useEffect(() => {
    fetchGroupDetails();
    fetchMessages();
  }, [groupId]);

  const fetchGroupDetails = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/interest-groups/${groupId}`, {
        withCredentials: true,
      });
      setGroup(res.data);
    } catch (err) {
      console.error('Error fetching group:', err);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/interest-groups/${groupId}/messages`, {
        withCredentials: true,
      });
      setMessages(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setLoading(false);
    }
  };

  // Socket.IO setup
  useEffect(() => {
    if (!groupId || !currentUserId) return;

    let socket = socketRef.current;
    if (!socket) {
      console.log('🔌 Connecting to Socket.IO for interest group:', groupId);
      socket = io(config.socketUrl, {
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 500,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        transports: ['polling', 'websocket'],
        upgrade: true,
        forceNew: false,
        multiplex: true,
      });
      socketRef.current = socket;

      const joinRoom = () => {
        if (socket.connected) {
          socket.emit('joinInterestGroupRoom', { groupId });
          console.log('📍 Joined interest group room:', groupId);
        }
      };

      socket.on('connect', () => {
        console.log('✅ Socket connected to interest group, ID:', socket.id);
        joinRoom();
      });

      socket.on('reconnect', (attemptNumber) => {
        console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
        joinRoom();
        // Refresh messages after reconnection
        fetchMessages();
      });

      socket.on('reconnect_attempt', (attemptNumber) => {
        console.log('🔄 Reconnection attempt', attemptNumber);
      });

      socket.on('reconnect_error', (err) => {
        console.error('❌ Reconnection error:', err.message);
      });

      socket.on('reconnect_failed', () => {
        console.error('❌ Reconnection failed - max attempts reached');
      });

      socket.on('connect_error', (err) => {
        console.error('❌ Socket.IO connection error:', err.message);
      });

      socket.on('disconnect', (reason) => {
        console.warn('🔌 Socket disconnected:', reason);
        if (reason === 'io server disconnect') {
          // Server disconnected the socket, try to reconnect manually
          socket.connect();
        }
      });

      socket.on('groupMessage', (msg) => {
        console.log('📨 Received group message:', msg._id, 'for group:', msg.groupId);
        const msgGroupId = normalizeId(msg.groupId);
        const currentGroupId = normalizeId(groupId);
        
        if (msgGroupId === currentGroupId) {
          setMessages((prev) => {
            // Prevent duplicate messages
            if (prev.some(m => normalizeId(m._id) === normalizeId(msg._id))) {
              console.log('⚠️ Duplicate message detected, skipping');
              return prev;
            }
            console.log('✅ Adding message to state');
            return [...prev, msg];
          });
        } else {
          console.log('⚠️ Message for different group, ignoring');
        }
      });

      // Initial join attempt
      joinRoom();
    } else {
      // Re-join room when groupId changes
      if (socket.connected) {
        socket.emit('joinInterestGroupRoom', { groupId });
        console.log('📍 Re-joined interest group room:', groupId);
      } else {
        // If not connected, connect and join when ready
        socket.connect();
      }
    }

    // Polling fallback: check for new messages every 3 seconds as backup
    const pollInterval = setInterval(() => {
      fetchMessages();
    }, 3000);

    return () => {
      clearInterval(pollInterval);
      const socket = socketRef.current;
      if (socket) {
        try {
          socket.emit('leaveInterestGroupRoom', { groupId });
          console.log('👋 Left interest group room:', groupId);
        } catch (e) {
          console.error('Error leaving room:', e);
        }
      }
    };
  }, [groupId, currentUserId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !selectedImage) return;

    try {
      const formData = new FormData();
      formData.append('groupId', groupId);
      formData.append('message', newMessage);
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      console.log('📤 Sending message:', { groupId, message: newMessage, hasImage: !!selectedImage });
      await axios.post(
        `${API_BASE}/api/interest-groups/${groupId}/message`,
        formData,
        { 
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );
      setNewMessage('');
      setSelectedImage(null);
      setImagePreview(null);
      // Message will be appended via Socket.IO listener
    } catch (err) {
      console.error('❌ Error sending message:', err);
      console.error('Error response:', err.response?.data);
      alert(err.response?.data?.message || 'Failed to send message: ' + err.message);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStartCall = (member) => {
    setSelectedCallUser(member);
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!group) return <p className="text-center mt-10">Group not found</p>;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {selectedCallUser && (
        <CallPanel
          counterpartName={selectedCallUser.name}
          counterpartId={selectedCallUser._id}
          onClose={() => setSelectedCallUser(null)}
        />
      )}

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b p-4 flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate('/interest-groups')}
              className="text-blue-600 hover:text-blue-700 mb-2 flex items-center gap-1"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold">{group.name}</h1>
            <p className="text-sm text-gray-600">{group.members.length} members</p>
          </div>
          <button
            onClick={() => navigate(`/interest-groups/${groupId}`)}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            View Group
          </button>
        </div>

        <div className="flex-1 flex gap-4 p-4">
          {/* Chat Area */}
          <div className="flex-1 bg-white rounded-lg shadow-md flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <p className="text-center text-gray-500 mt-10">No messages yet. Start the conversation!</p>
              ) : (
                messages.map((msg) => {
                  const isMe = normalizeId(msg.sender) === normalizeId(currentUserId);
                  const isMissed = msg.callStatus === 'missed';
                  const isEnded = msg.callStatus === 'ended';

                  if (msg.isCallEvent) {
                    const duration = msg.callDurationSeconds || 0;
                    const mins = Math.floor(duration / 60);
                    const secs = duration % 60;
                    const durationLabel = duration > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : null;

                    return (
                      <div key={msg._id} className="flex justify-center">
                        <div
                          className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 ${
                            isMissed ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-800'
                          }`}
                        >
                          <span>{msg.callType === 'audio' ? '📞' : '🎥'}</span>
                          <span>
                            {isMissed && `Missed ${msg.callType} call`}
                            {isEnded && `Call ended`}
                            {!isMissed && !isEnded && msg.message}
                            {durationLabel ? ` • ${durationLabel}` : ''}
                          </span>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={msg._id} className={`flex gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                      {!isMe && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {msg.sender.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          isMe ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'
                        }`}
                      >
                        {!isMe && <p className="text-xs font-semibold mb-1">{msg.sender.name}</p>}
                        {msg.imageUrl && <img src={msg.imageUrl} alt="Shared" className="max-w-xs rounded-lg mb-2" />}
                        {msg.message && <p>{msg.message}</p>}
                        <p className="text-xs mt-1 opacity-70">
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t">
              {imagePreview && (
                <div className="mb-3 relative inline-block">
                  <img src={imagePreview} alt="Preview" className="h-20 rounded-lg" />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedImage(null);
                      setImagePreview(null);
                    }}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <label className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold cursor-pointer">
                  🖼️
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
                >
                  Send
                </button>
              </div>
            </form>
          </div>

          {/* Members Sidebar */}
          <div className="w-64 bg-white rounded-lg shadow-md p-4 flex flex-col">
            <h3 className="font-bold text-lg mb-4">Members ({group.members.length})</h3>
            <div className="flex-1 overflow-y-auto space-y-2">
              {group.members.map((member) => {
                const isCurrentUser = normalizeId(member.userId) === normalizeId(currentUserId);
                return (
                  <div key={member.userId._id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{member.userId.name}</p>
                      <p className="text-xs text-gray-600 capitalize">{member.role}</p>
                    </div>
                    {!isCurrentUser && (
                      <button
                        onClick={() => handleStartCall(member.userId)}
                        className="text-blue-600 hover:text-blue-700 ml-2 flex-shrink-0"
                        title="Start call"
                      >
                        📞
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterestGroupChat;
