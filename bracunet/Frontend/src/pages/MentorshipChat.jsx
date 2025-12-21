import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { API_BASE } from "../config";
import CallPanel from "../components/CallPanel";

const MentorshipChat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const currentUserId = user?._id || user?.id;
  const getMentorshipId = (conv) => String(conv?.mentorship?._id || conv?.mentorship || "");
  const [conversations, setConversations] = useState([]);
  const [selectedMentorship, setSelectedMentorship] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // New chat/search UI
  const [showNewChat, setShowNewChat] = useState(false);
  const [mentorSearch, setMentorSearch] = useState("");
  const [mentorResults, setMentorResults] = useState([]);
  const [draftMessage, setDraftMessage] = useState("");

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/mentorship/pending/requests`, {
        withCredentials: true,
      });
      setConversations(res.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load conversations");
      setLoading(false);
    }
  };

  // Fetch matched mentors once when opening the new chat modal
  const openNewChat = async () => {
    setShowNewChat(true);
    setMentorSearch("");
    setDraftMessage("");
    // Fetch all verified users on open; will filter as user types
  };

  const filteredMentors = mentorResults.filter((m) => {
    // Exclude self from search results
    if (currentUserId === m._id || currentUserId === m.id) return false;
    const t = mentorSearch.trim().toLowerCase();
    if (!t) return true;
    return (
      m.name?.toLowerCase().includes(t) ||
      m.skills?.join(" ").toLowerCase().includes(t) ||
      m.interests?.join(" ").toLowerCase().includes(t)
    );
  });

  // Search users dynamically as user types
  const handleMentorSearch = async (query) => {
    setMentorSearch(query);
    if (query.trim().length === 0) {
      setMentorResults([]);
      return;
    }
    try {
      const res = await axios.get(`${API_BASE}/api/users/search/query`, {
        params: { q: query },
        withCredentials: true
      });
      setMentorResults(res.data || []);
    } catch (e) {
      console.error("Search error", e);
      setMentorResults([]);
    }
  };

  const startChatWithMentor = async (mentor) => {
    try {
      // Ensure a mentorship conversation exists
      const convRes = await axios.post(
        `${API_BASE}/api/mentorship/conversation/start`,
        { mentorId: mentor._id || mentor.id },
        { withCredentials: true }
      );
      const mentorshipId = String(convRes.data?._id);
      // Send a first message to make the thread visible
      {
        const receiverId = mentor._id || mentor.id;
        const initial = draftMessage.trim() || "Hi! I'd like to connect.";
        await axios.post(
          `${API_BASE}/api/mentorship/message/send`,
          { mentorshipId, receiverId, message: initial },
          { withCredentials: true }
        );
      }
      // Refresh list and open the new conversation
      await fetchConversations();
      setSelectedMentorship(mentorshipId);
      await fetchMessages(mentorshipId);
      setShowNewChat(false);
      setMentorSearch("");
      setDraftMessage("");
    } catch (err) {
      console.error("Failed to start chat", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to start chat");
    }
  };

  const fetchMessages = async (mentorshipId) => {
    try {
      const res = await axios.get(
        `${API_BASE}/api/mentorship/message/${mentorshipId}`,
        { withCredentials: true }
      );
      setMessages(res.data);

      // Mark as read
      await axios.patch(
        `${API_BASE}/api/mentorship/message/${mentorshipId}/read`,
        {},
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const sendMessageHandler = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedMentorship) return;

    try {
      const mentorship = conversations.find((c) => getMentorshipId(c) === selectedMentorship);
      if (!mentorship) {
        alert("Conversation not found. Please refresh.");
        return;
      }
      
      const receiverId =
        currentUserId === mentorship.sender._id ? mentorship.receiver._id : mentorship.sender._id;

      console.log('Sending message:', { mentorshipId: selectedMentorship, receiverId, message: newMessage });

      const response = await axios.post(
        `${API_BASE}/api/mentorship/message/send`,
        { mentorshipId: selectedMentorship, message: newMessage, receiverId },
        { withCredentials: true }
      );

      console.log('Message sent successfully:', response.data);
      setNewMessage("");
      fetchMessages(selectedMentorship);
      fetchConversations();
    } catch (err) {
      console.error("Error sending message:", err);
      console.error("Error response:", err.response?.data);
      alert(err.response?.data?.message || "Failed to send message. Please try again.");
    }
  };

  if (loading) {
    return <p className="text-center mt-10">Loading conversations...</p>;
  }

  if (error) {
    return <p className="text-center mt-10 text-red-600">{error}</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <div className="max-w-7xl mx-auto w-full flex h-screen">
        {/* Left Sidebar - Conversations */}
        <div className="w-80 bg-white border-r flex flex-col">
          <div className="p-4 border-b">
            <button
              onClick={() => navigate(-1)}
              className="text-blue-600 hover:text-blue-700 mb-3 flex items-center gap-1"
            >
              ← Back
            </button>
            <h2 className="text-2xl font-bold">Messages</h2>
            <button
              onClick={() => navigate("/mentorship/incoming-requests")}
              className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm font-semibold"
            >
              📬 Requests
            </button>
            <button
              onClick={openNewChat}
              className="mt-2 w-full bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm font-semibold"
            >
              ✨ New Chat
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <p className="text-gray-500 text-center p-4">No conversations yet</p>
            ) : (
              conversations.map((conv) => {
                const otherPerson = conv.sender._id === currentUserId ? conv.receiver : conv.sender;
                return (
                  <button
                    key={getMentorshipId(conv)}
                    onClick={() => {
                      const mentorshipId = getMentorshipId(conv);
                      setSelectedMentorship(mentorshipId);
                      fetchMessages(mentorshipId);
                    }}
                    className={`w-full text-left p-4 border-b hover:bg-gray-50 transition ${
                      selectedMentorship === getMentorshipId(conv) ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                        {otherPerson.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{otherPerson.name}</p>
                        <p className="text-sm text-gray-500">{otherPerson.role}</p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side - Chat Area */}
        <div className="flex-1 bg-white flex flex-col">
          {selectedMentorship ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b bg-white">
                {conversations.find((c) => getMentorshipId(c) === selectedMentorship) && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                      {(() => {
                        const conv = conversations.find((c) => getMentorshipId(c) === selectedMentorship);
                        const otherPerson = conv.sender._id === currentUserId ? conv.receiver : conv.sender;
                        return otherPerson.name.charAt(0).toUpperCase();
                      })()}
                    </div>
                    <div>
                      <p className="font-semibold">
                        {(() => {
                          const conv = conversations.find((c) => getMentorshipId(c) === selectedMentorship);
                          const otherPerson = conv.sender._id === currentUserId ? conv.receiver : conv.sender;
                          return otherPerson.name;
                        })()}
                      </p>
                      <p className="text-xs text-gray-500">Active now</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Call Panel */}
              {selectedMentorship && conversations.find((c) => getMentorshipId(c) === selectedMentorship) && (
                <CallPanel
                  mentorshipId={selectedMentorship}
                  otherPersonName={(() => {
                    const conv = conversations.find((c) => getMentorshipId(c) === selectedMentorship);
                    const otherPerson = conv.sender._id === currentUserId ? conv.receiver : conv.sender;
                    return otherPerson.name;
                  })()}
                />
              )}

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                {messages.map((msg, index) => {
                  const isMe = msg.sender._id === currentUserId;
                  const showAvatar = index === 0 || messages[index - 1]?.sender._id !== msg.sender._id;
                  
                  return (
                    <div
                      key={msg._id}
                      className={`flex gap-2 mb-2 ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      {!isMe && showAvatar && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {msg.sender.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      {!isMe && !showAvatar && <div className="w-8" />}
                      
                      <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                        <div
                          className={`max-w-md px-4 py-2 rounded-2xl ${
                            isMe
                              ? "bg-blue-500 text-white rounded-br-sm"
                              : "bg-gray-200 text-gray-900 rounded-bl-sm"
                          }`}
                        >
                          <p className="break-words">{msg.message}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 px-2">
                          {new Date(msg.createdAt).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Message Input */}
              <form onSubmit={sendMessageHandler} className="p-4 border-t bg-white">
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Aa"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition"
                  >
                    ➤
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <div className="text-6xl mb-4">💬</div>
                <p className="text-lg">Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChat && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-xl">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-bold text-lg">Start a New Chat</h3>
              <button onClick={() => setShowNewChat(false)} className="text-gray-600 hover:text-black">✖</button>
            </div>
            <div className="p-4 space-y-4">
              <input
                type="text"
                placeholder="Search by name, skill, or interest..."
                value={mentorSearch}
                onChange={(e) => handleMentorSearch(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
              <textarea
                className="w-full border rounded px-3 py-2"
                rows={3}
                placeholder="Write a short message to send"
                value={draftMessage}
                onChange={(e) => setDraftMessage(e.target.value)}
              />
              <div className="max-h-64 overflow-y-auto border rounded">
                {filteredMentors.length === 0 ? (
                  <p className="p-3 text-gray-500">No results</p>
                ) : (
                  filteredMentors.map((m) => (
                    <div key={m._id} className="flex items-center justify-between p-3 border-b last:border-b-0">
                      <div>
                        <p className="font-semibold">{m.name}</p>
                        <p className="text-xs text-gray-500">{m.role}</p>
                      </div>
                      <button
                        onClick={() => startChatWithMentor(m)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Message
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="p-3 border-t text-right">
              <button onClick={() => setShowNewChat(false)} className="px-4 py-2 rounded border">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorshipChat;
