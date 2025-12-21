import React, { useState } from "react";

export default function CallPanel({ mentorshipId, otherPersonName }) {
  const [callActive, setCallActive] = useState(false);
  const [callType, setCallType] = useState(null);
  const [roomUrl, setRoomUrl] = useState("");
  const [previewEmbed, setPreviewEmbed] = useState(false);

  const startCall = (type) => {
    const roomName = `mentorship-${mentorshipId}-${Date.now()}`;
    const jitsiUrl = `https://meet.jit.si/${roomName}`;
    
    setRoomUrl(jitsiUrl);
    setCallType(type);
    setCallActive(true);
    // Open in a new tab to avoid the 5-minute embed limit on meet.jit.si
    try {
      window.open(jitsiUrl, "_blank", "noopener,noreferrer");
    } catch {}
  };

  const endCall = () => {
    setCallActive(false);
    setCallType(null);
    setRoomUrl("");
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
          <div className="bg-white rounded-lg border border-dashed border-gray-300 p-6 mb-3 text-sm text-gray-700">
            <p className="font-semibold mb-1">Meeting opened in a new tab ✅</p>
            <p>
              This avoids the 5-minute embed limit on the free meet.jit.si service. You can still preview inside the app if you want.
            </p>
          </div>
        )}
        <div className="text-xs text-gray-500">
          <div>
            💡 Share this link or open in a new tab:
            <a
              href={roomUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline ml-1"
            >
              {roomUrl.substring(0, 40)}...
            </a>
            <button
              onClick={() => window.open(roomUrl, "_blank", "noopener,noreferrer")}
              className="ml-3 text-blue-600 underline"
            >
              Open in new tab
            </button>
            <button
              onClick={() => setPreviewEmbed((v) => !v)}
              className="ml-3 text-gray-700 underline"
              title="In-app preview has a 5-minute limit on meet.jit.si"
            >
              {previewEmbed ? "Hide in-app preview" : "Preview inside app (5‑min demo)"}
            </button>
          </div>
          <p className="mt-1">
            If you see "The conference has not yet started", click
            <span className="font-semibold"> I am the host</span> inside the call window and
            sign in to start the meeting. Others can join without logging in.
          </p>
          <p className="mt-1">
            To force your laptop camera: in the call window click the <span className="font-semibold">gear (Settings)</span> → <span className="font-semibold">Devices</span> → choose <span className="font-semibold">Integrated Camera</span>. You can also click the browser <span className="font-semibold">lock icon</span> and set Camera/Microphone permissions for meet.jit.si.
          </p>
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
