import React, { useState, useEffect } from "react";
import axios from "axios";
import Pusher from "pusher-js";
import { API_BASE } from "../config";

const PUSHER_KEY = import.meta.env.VITE_PUSHER_KEY || 'c581a5dcd7d22c9200e0';
const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_CLUSTER || 'ap2';

export default function CallPanel({ mentorshipId, otherPersonName, otherPersonId, currentUserId }) {
  const [callActive, setCallActive] = useState(false);
  const [callType, setCallType] = useState(null);
  const [roomUrl, setRoomUrl] = useState("");
  const [previewEmbed, setPreviewEmbed] = useState(false);
  const [callKey, setCallKey] = useState(null);
  const [callStartTime, setCallStartTime] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState(""); // "calling", "answered", "rejected", "active"

  // Use ref to track latest callKey without causing re-renders
  const callKeyRef = React.useRef(null);
  React.useEffect(() => {
    callKeyRef.current = callKey;
  }, [callKey]);

  // Listen for call answer/reject events from receiver
  useEffect(() => {
    if (!currentUserId) return;

    console.log('🔌 Setting up Pusher listener for call events on user:', currentUserId);
    const pusher = new Pusher(PUSHER_KEY, {
      cluster: PUSHER_CLUSTER,
      encrypted: true,
    });

    const channel = pusher.subscribe(`user-${currentUserId}`);

    // For caller: when receiver answers
    channel.bind('call-answered', (data) => {
      console.log('✅ Call answered by:', data.answeredBy, 'callKey:', data.callKey, 'myCallKey:', callKeyRef.current);
      if (callKeyRef.current && data.callKey === callKeyRef.current) {
        setCallStatus("answered");
      }
    });

    // For caller: when receiver rejects
    channel.bind('call-rejected', (data) => {
      console.log('❌ Call rejected by:', data.rejectedBy, 'callKey:', data.callKey, 'myCallKey:', callKeyRef.current);
      if (callKeyRef.current && data.callKey === callKeyRef.current) {
        setCallStatus("rejected");
        // Auto end call after 3 seconds
        setTimeout(() => {
          setCallActive(false);
          setCallType(null);
          setRoomUrl("");
          setCallKey(null);
          setCallStartTime(null);
          setCallDuration(0);
          setCallStatus("");
        }, 3000);
      }
    });

    // For receiver: when they answer, activate their call panel
    channel.bind('call-active', (data) => {
      console.log('📞 Call active event received for mentorship:', data.mentorshipId);
      const roomName = `mentorship-${data.mentorshipId}`;
      const jitsiUrl = `https://meet.jit.si/${roomName}`;
      
      setCallActive(true);
      setCallType(data.callType);
      setRoomUrl(jitsiUrl);
      setCallStartTime(Date.now());
      setCallStatus("answered");
      setCallKey(data.callKey);
    });

    return () => {
      console.log('🔌 Cleaning up Pusher connection for user:', currentUserId);
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [currentUserId]); // Only depend on currentUserId

  const startCall = async (type) => {
    const roomName = `mentorship-${mentorshipId}`;
    const jitsiUrl = `https://meet.jit.si/${roomName}`;

    console.log('📞 Starting call:', { mentorshipId, otherPersonId, otherPersonName, type });
    console.log('📞 Setting state: callActive=true, callType=', type, 'roomUrl=', jitsiUrl);

    setRoomUrl(jitsiUrl);
    setCallType(type);
    setCallActive(true);
    setCallStartTime(Date.now());
    setCallDuration(0);
    setCallStatus("calling");

    console.log('📞 State set, opening Jitsi in new tab');
    try {
      window.open(jitsiUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error('❌ Failed to open Jitsi:', err);
    }

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
        setCallStatus("error");
      }
    } else {
      console.warn('⚠️ No otherPersonId provided');
    }
  };

  const endCall = async () => {
    console.log('📞 Ending call:', { callKey, otherPersonId, callStartTime });
    
    // Calculate call duration
    let duration = 0;
    if (callStartTime) {
      duration = Math.floor((Date.now() - callStartTime) / 1000);
      setCallDuration(duration);
      console.log('⏱️ Call duration:', duration, 'seconds');
    }

    // Notify the receiver that the call ended (cancel the missed call timeout)
    if (callKey && otherPersonId) {
      try {
        console.log('📢 Sending call end notification to:', otherPersonId);
        await axios.post(
          `${API_BASE}/api/mentorship/call/end`,
          { receiverId: otherPersonId, mentorshipId, callKey, callType, callDurationSeconds: duration },
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
    setCallStatus("");
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

  console.log('🔍 CallPanel render - callActive:', callActive, 'roomUrl:', roomUrl, 'callType:', callType, 'callStatus:', callStatus);

  if (callActive && roomUrl) {
    console.log('✅ Rendering active call UI');
    return (
      <div className="bg-gradient-to-br from-green-50 to-blue-50 p-4 rounded-lg border-2 border-green-400">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{callType === "video" ? "📹" : "🎧"}</span>
            <div>
              <p className="font-bold text-gray-800">{callType.toUpperCase()} Call</p>
              <p className="text-sm text-gray-600">with {otherPersonName}</p>
              <p className="text-xs text-gray-500 font-mono">{formatDuration(callDuration)}</p>
              {callStatus === "calling" && (
                <p className="text-xs text-blue-600 animate-pulse font-semibold">🔔 Calling {otherPersonName}...</p>
              )}
              {callStatus === "answered" && (
                <p className="text-xs text-green-600 font-semibold">✅ {otherPersonName} joined the call</p>
              )}
              {callStatus === "rejected" && (
                <p className="text-xs text-red-600 font-semibold">❌ {otherPersonName} declined</p>
              )}
            </div>
          </div>
          <button
            onClick={endCall}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-bold transition-all"
          >
            End Call
          </button>
        </div>

        <div className="bg-white rounded-lg border border-dashed border-gray-300 p-4 mb-3 text-sm">
          <p className="font-semibold text-gray-700">💡 Meeting Room Ready</p>
          <p className="text-gray-600 mt-1">Meeting opened in new tab. Click below to rejoin if needed.</p>
        </div>

        <div className="text-xs text-gray-600 flex flex-wrap items-center gap-3">
          <span className="font-semibold">Meeting Link:</span>
          <button
            onClick={() => window.open(roomUrl, "_blank", "noopener,noreferrer")}
            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-medium transition-all"
          >
            🔗 Join Meeting
          </button>
          <a
            href={roomUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800"
          >
            {roomUrl.substring(0, 40)}...
          </a>
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
