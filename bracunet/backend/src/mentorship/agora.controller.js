import axios from "axios";

const DAILY_API_KEY = process.env.DAILY_API_KEY;

export const createDailyRoom = async (req, res) => {
  const { mentorshipId, type, otherPersonName } = req.body;

  if (!mentorshipId) {
    return res.status(400).json({ message: "mentorshipId is required" });
  }

  if (!DAILY_API_KEY) {
    console.error("❌ DAILY_API_KEY not found in environment variables");
    return res.status(500).json({
      message:
        "Daily.co API key not configured. Set DAILY_API_KEY in .env",
    });
  }

  try {
    // Create a unique room name
    const roomName = `mentorship-${mentorshipId}-${Date.now()}`;

    console.log(`📞 Creating Daily.co room: ${roomName}`);

    // Create room via Daily.co REST API
    const dailyRes = await axios.post(
      "https://api.daily.co/v1/rooms",
      {
        name: roomName,
        properties: {
          enable_screenshare: true,
          enable_chat: true,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${DAILY_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const roomUrl = dailyRes.data.url;

    console.log(`✅ Daily.co room created: ${roomName} → ${roomUrl}`);

    res.json({
      roomName,
      url: roomUrl,
      type,
      otherPersonName,
    });
  } catch (error) {
    console.error("❌ Error creating Daily.co room:");
    console.error("Status:", error.response?.status);
    console.error("Data:", error.response?.data);
    console.error("Message:", error.message);
    
    res.status(500).json({
      message: "Error creating video room",
      error: error.response?.data?.error || error.message,
      details: error.response?.data,
    });
  }
};

// Legacy Agora token generator (kept for backward compatibility)
export const generateAgoraToken = async (req, res) => {
  const { channelName, uid } = req.body;

  if (!channelName || !uid) {
    return res
      .status(400)
      .json({ message: "channelName and uid are required" });
  }

  res.json({
    message: "Use Daily.co instead via /api/mentorship/daily/create-room",
  });
};
