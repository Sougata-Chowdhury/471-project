import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";

export default function Messages() {
  const { user } = useContext(AuthContext);
  const [contacts, setContacts] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const fetchContacts = async () => {
    const res = await API.get("/messages/contacts");
    setContacts(res.data);
  };

  const fetchMessages = async (userId) => {
    const res = await API.get(`/messages/${userId}`);
    setMessages(res.data);
  };

  const sendMessage = async () => {
    if (!text || !selectedUser) return;
    await API.post(`/messages/${selectedUser._id}`, { body: text });
    setText("");
    fetchMessages(selectedUser._id);
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    if (selectedUser) fetchMessages(selectedUser._id);
  }, [selectedUser]);

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-blue-500 to-purple-600 flex gap-6">
      <div className="w-1/4 bg-white/20 rounded-lg p-4">
        <h3 className="text-white font-bold mb-2">Contacts</h3>
        {contacts.map((c) => (
          <div
            key={c._id}
            className="text-white p-2 rounded hover:bg-white/10 cursor-pointer"
            onClick={() => setSelectedUser(c)}
          >
            {c.name}
          </div>
        ))}
      </div>

      <div className="w-3/4 bg-white/20 rounded-lg p-4 flex flex-col">
        <h3 className="text-white font-bold mb-2">
          {selectedUser ? selectedUser.name : "Select a contact"}
        </h3>
        <div className="flex-1 overflow-y-auto mb-2 space-y-2">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`p-2 rounded ${
                m.sender === user._id
                  ? "bg-blue-600 text-white self-end"
                  : "bg-white text-black self-start"
              }`}
            >
              {m.body}
            </div>
          ))}
        </div>
        {selectedUser && (
          <div className="flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="flex-1 p-2 rounded text-black"
            />
            <button
              onClick={sendMessage}
              className="bg-blue-600 px-4 py-2 text-white rounded"
            >
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
