import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchGroupMessages, postGroupMessage, fetchGroups, createGroupMeeting } from '../api';

export default function GroupDetail() {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    // fetch group list to find this group (lightweight)
    fetchGroups().then(res => {
      const list = res.data.groups || res.data;
      const g = list.find(x => x._id === id);
      setGroup(g || null);
    }).catch(console.error);

    fetchGroupMessages(id).then(res => setMessages(res.data.messages || res.data)).catch(console.error);
  }, [id]);

  const sendMessage = async () => {
    if (!text.trim()) return;
    try {
      const res = await postGroupMessage(id, { content: text });
      setMessages(prev => [...prev, res.data.message || res.data.message]);
      setText('');
    } catch (err) {
      alert('Failed to send');
    }
  };

  const handleCreateMeeting = async () => {
    try {
      const res = await createGroupMeeting(id);
      const meeting = res.data.meeting || res.data;
      window.open(meeting.url, '_blank');
    } catch (err) {
      alert('Failed to create meeting');
    }
  };

  if (!group) return <div className="p-6">Loading group...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-6">
      <div className="max-w-4xl mx-auto bg-white/90 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800">{group.name}</h2>
        <p className="text-sm text-gray-600 mt-2">{group.description}</p>
        <div className="mt-4 flex gap-2">
          <button onClick={handleCreateMeeting} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded">Start Meeting</button>
        </div>

        <hr className="my-6" />

        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Group Chat</h3>
          <div className="max-h-80 overflow-y-auto p-3 bg-gray-50 rounded">
            {messages.map((m) => (
              <div key={m._id} className="mb-3">
                <div className="text-xs text-gray-500">{m.sender?.name || 'Unknown'}</div>
                <div className="bg-white p-3 rounded shadow-sm">{m.content}</div>
              </div>
            ))}
          </div>

          <div className="mt-3 flex gap-2">
            <input value={text} onChange={e => setText(e.target.value)} className="flex-1 p-2 border rounded" placeholder="Write a message..." />
            <button onClick={sendMessage} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded">Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}
