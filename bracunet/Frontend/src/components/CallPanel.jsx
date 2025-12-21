import React, { useState } from "react";
import axios from "axios";
import { API_BASE } from "../config";

export default function CallPanel({ mentorshipId, otherPersonName, otherPersonId }) {
  const [callActive, setCallActive] = useState(false);
  const [callType, setCallType] = useState(null);
  const [roomUrl, setRoomUrl] = useState("");
  const [previewEmbed, setPreviewEmbed] = useState(false);
  const [callKey, setCallKey] = useState(null);
  const [callStartTime, setCallStartTime] = useState(null);
  const [callDuration, setCallDuration] = useState(0);

  const startCall = async (type) => {
    const roomName = `mentorship-${mentorshipId}`;
    const jitsiUrl = `https://meet.jit.si/${roomName}`;

    console.log('📞 Starting call:', { mentorshipId, otherPersonId, otherPersonName, type });

    setRoomUrl(jitsiUrl);
    setCallType(type);
    setCallActive(true);
    setCallStartTime(Date.now());
    setCallDuration(0);

    try {
      window.open(jitsiUrl, "_blank", "noopener,noreferrer");
    } catch {}

    if (otherPersonId) {
      try {
        console.log('📢 Sending notification to:', otherPersonId);
        const response = await axios.post(
          `${API_BASE}/api/mentorship/call/notify`,
          { receiverId: otherPersonId, mentorshipId, callType: type, callUrl: jitsiUrl },
          { withCredentials: true }
        );
        console.log('✅ Notification sent, callKey:', response.data.callKey);
        setCallKey(response.data.callKey);
      } catch (err) {
        console.error('❌ Call notification failed:', err.response?.data || err.message);
      }
    } else {
      console.warn('⚠️ No otherPersonId provided');
    }
  };

  const endCall = async () => {
    console.log('📞 Ending call:', { callKey, otherPersonId, callStartTime });
    
    // Calculate call duration
    if (callStartTime) {
      const duration = Math.floor((Date.now() - callStartTime) / 1000);
      setCallDuration(duration);
      console.log('⏱️ Call duration:', duration, 'seconds');
    }

    // Notify the receiver that the call ended (cancel the missed call timeout)
    if (callKey && otherPersonId) {
      try {
        console.log('📢 Sending call end notification to:', otherPersonId);
        await axios.post(
          `${API_BASE}/api/mentorship/call/end`,
          { receiverId: otherPersonId, mentorshipId, callKey, callType },
          { withCredentials: true }
        );
        console.log('✅ Call end notification sent');
      } catch (err) {
        console.error('❌ Failed to notify call end:', err.response?.data || err.message);
      }
    } else {
      console.warn('⚠️ Missing callKey or otherPersonId:', { callKey, otherPersonId });
    }
    
    console.log('🔴 Resetting call state');
    setCallActive(false);
    setCallType(null);
    setRoomUrl("");
    setCallKey(null);
    setCallStartTime(null);
    setCallDuration(0);
  };

  // Update duration every second
  React.useEffect(() => {
    if (!callActive || !callStartTime) return;
    const interval = setInterval(() => {
      setCallDuration(Math.floor((Date.now() - callStartTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [callActive, callStartTime]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (callActive && roomUrl) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-blue-50 p-4 rounded-lg border-2 border-green-400">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{callType === "video" ? "📹" : "🎧"}</span>
            <div>
              <p className="font-bold text-gray-800">{callType.toUpperCase()} Call Active</p>
              <p className="text-sm text-gray-600">with {otherPersonName}</p>
              <p className="text-xs text-gray-500 font-mono">{formatDuration(callDuration)}</p>
            </div>
          </div>
          <button
            onClick={endCall}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-bold"
          >
            End Call
          </button>
        </div>

        {previewEmbed ? (
          <div className="bg-white rounded-lg overflow-hidden border border-gray-300 mb-3">
            <iframe
              src={`${roomUrl}?config.startWithVideoMuted=${callType === "audio" ? "true" : "false"}&config.disableDeepLinking=true&config.prejoinConfig.enabled=true`}
              className="w-full h-96 border-0"
              allow="camera; microphone; display-capture; fullscreen; autoplay; clipboard-write"
              style={{ borderRadius: "8px" }}
            />
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-dashed border-gray-300 p-4 mb-3 text-sm text-gray-700">
            <p className="font-semibold">Meeting opened in a new tab ✅</p>
          </div>
        )}

        <div className="text-xs text-gray-600 flex flex-wrap items-center gap-3">
          <span className="font-semibold">Share / join link:</span>
          <a
            href={roomUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            {roomUrl}
          </a>
          <button
            onClick={() => window.open(roomUrl, "_blank", "noopener,noreferrer")}
            className="text-blue-600 underline"
          >
            Open
          </button>
          <button
            onClick={() => setPreviewEmbed((v) => !v)}
            className="text-gray-700 underline"
            title="In-app preview uses the same room"
          >
            {previewEmbed ? "Hide preview" : "Preview inside app"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg">
      <p className="font-bold text-gray-800 mb-3">💬 Start a Meeting</p>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => startCall("video")}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded font-semibold text-sm flex items-center justify-center gap-1"
        >
          📹 Video Call
        </button>
        <button
          onClick={() => startCall("audio")}
          className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded font-semibold text-sm flex items-center justify-center gap-1"
        >
          🎧 Audio Call
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        ✅ Free video/audio meetings powered by Jitsi Meet
      </p>
    </div>
  );
}
