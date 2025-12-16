import Group from "./groups.model.js"; 
import { User } from "../users/user.model.js";
import { config } from "../config/index.js";

// Get all groups
export const getAllGroups = async (req, res) => {
  try {
    const groups = await Group.find().populate('createdBy', 'name email');
    
    // Add joinStatus for current user
    const userId = req.user ? req.user._id.toString() : null;

    const groupsWithStatus = groups.map(group => {
      const groupObj = group.toObject();

      if (userId) {
        if (group.members.some(m => m.toString() === userId)) {
          groupObj.joinStatus = 'approved';
        } else if (group.requests.some(r => r.toString() === userId)) {
          groupObj.joinStatus = 'pending';
        } else {
          groupObj.joinStatus = 'none';
        }
      } else {
        // Not authenticated: don't expose membership info
        groupObj.joinStatus = 'none';
      }

      return groupObj;
    });
    
    res.status(200).json({ success: true, groups: groupsWithStatus });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to get groups" });
  }
};

// Create a new group (Admin only)
export const createGroup = async (req, res) => {
  try {
    const { name, topic, description, image } = req.body;
    if (!name || !topic) {
      return res.status(400).json({ success: false, message: "Name and Topic required" });
    }

    const newGroup = await Group.create({
      name,
      topic,
      description,
      image: image || null,
      createdBy: req.user._id, // assume req.user comes from auth middleware
    });

    res.status(201).json({ success: true, group: newGroup });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to create group" });
  }
};

// Join a group (request)
export const joinGroup = async (req, res) => {
  try {
    const groupId = req.params.id;
    console.log(`[joinGroup] incoming request - groupId=${groupId}, user=${req.user?._id}`);

    if (!req.user) {
      console.warn('[joinGroup] no authenticated user on request');
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ success: false, message: "Group not found" });

    // Add user to requests if not already joined/requested
    const userIdStr = req.user._id.toString();
    const alreadyMember = group.members.some(m => m.toString() === userIdStr);
    const alreadyRequested = group.requests.some(r => r.toString() === userIdStr);

    if (alreadyMember) {
      return res.status(200).json({ success: true, message: 'Already a member' });
    }

    if (!alreadyRequested) {
      group.requests.push(req.user._id);
      await group.save();
      console.log(`[joinGroup] request saved for user=${userIdStr} group=${groupId}`);
      // return the updated requests (lightweight)
      const requests = await Group.findById(groupId).populate('requests', 'name email');
      return res.status(200).json({ success: true, message: 'Join request sent', requests: requests.requests });
    }

    res.status(200).json({ success: true, message: 'Request already pending' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to join group" });
  }
};

// Approve join request (Admin only)
export const approveJoinRequest = async (req, res) => {
  try {
    const { groupId, userId } = req.params;
    console.log(`[approveJoinRequest] admin=${req.user?._id} groupId=${groupId} userId=${userId}`);
    const group = await Group.findById(groupId);
    if (!group) {
      console.warn(`[approveJoinRequest] group not found: ${groupId}`);
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    // Remove from requests
    group.requests = group.requests.filter((id) => id.toString() !== userId);

    // Add to members if not already
    if (!group.members.includes(userId)) {
      group.members.push(userId);
    }

    await group.save();
    res.status(200).json({ success: true, message: "User approved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to approve request" });
  }
};

// Get pending join requests for a group (admin only)
export const getJoinRequests = async (req, res) => {
  try {
    const { id } = req.params; // group id
    console.log(`[getJoinRequests] user=${req.user?._id} groupId=${id}`);
    const group = await Group.findById(id).populate('requests', 'name email');
    if (!group) {
      console.warn(`[getJoinRequests] group not found: ${id}`);
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    console.log(`[getJoinRequests] returning ${group.requests.length} requests for group ${id}`);
    res.status(200).json({ success: true, requests: group.requests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch requests' });
  }
};

// Get full group details (members + requests) - debug helper
export const getGroupDetails = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[getGroupDetails] user=${req.user?._id} groupId=${id}`);
    const group = await Group.findById(id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email')
      .populate('requests', 'name email');
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
    res.status(200).json({ success: true, group });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch group details' });
  }
};

// Reject a join request (admin only)
export const rejectJoinRequest = async (req, res) => {
  try {
    const { groupId, userId } = req.params;
    console.log(`[rejectJoinRequest] admin=${req.user?._id} groupId=${groupId} userId=${userId}`);
    const group = await Group.findById(groupId);
    if (!group) {
      console.warn(`[rejectJoinRequest] group not found: ${groupId}`);
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    // Remove from requests
    group.requests = group.requests.filter((id) => id.toString() !== userId);
    await group.save();

    res.status(200).json({ success: true, message: 'Request rejected' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to reject request' });
  }
};

// Create a Daily meeting room for a group (members only)
export const createMeeting = async (req, res) => {
  try {
    const { id } = req.params; // group id
    const group = await Group.findById(id);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    // Only allow members to create meeting
    const userId = req.user._id.toString();
    const isMember = group.members.some(m => m.toString() === userId);
    // Allow admins to create meetings even if not a member
    const isAdmin = req.user && req.user.role === 'admin';
    if (!isMember && !isAdmin) return res.status(403).json({ success: false, message: 'Only members can create meetings' });

    // Create a unique room name
    const roomName = `group-${id}-${Date.now()}`.toLowerCase().replace(/[^a-z0-9-]/g, '');

    const resp = await fetch(`${config.daily.apiBase}/rooms`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.daily.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: roomName, properties: { start_video_off: false } })
    });

    if (!config.daily || !config.daily.apiKey) {
      console.error('Daily API key missing in config');
      return res.status(501).json({ success: false, message: 'Daily API key not configured on server' });
    }

    if (!resp.ok) {
      const text = await resp.text();
      console.error('Daily API error:', text);
      return res.status(502).json({ success: false, message: 'Failed to create meeting', detail: text });
    }

    const data = await resp.json();

    // Store meeting info in group
    group.meetings.push({ url: data.url, dailyRoomName: data.name, createdBy: req.user._id });
    await group.save();

    res.status(201).json({ success: true, meeting: { url: data.url, name: data.name } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to create meeting' });
  }
};

// Create a meeting token for an existing Daily room (so frontend can embed with a token)
export const createMeetingToken = async (req, res) => {
  try {
    const { id, roomName } = req.params; // group id and room name
    const group = await Group.findById(id);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    // Only allow members or admins to request tokens
    const userId = req.user?._id?.toString();
    const isMember = group.members.some(m => m.toString() === userId);
    const isAdmin = req.user && req.user.role === 'admin';
    if (!isMember && !isAdmin) return res.status(403).json({ success: false, message: 'Not a group member' });

    // Create a meeting token via Daily REST API
    const body = {
      properties: {
        is_owner: false,
        // you can add more properties like start_video_off, start_audio_off
      },
      room_name: roomName,
      // small label for debugging
      lifespan: 60 * 60 // 1 hour
    };

    const resp = await fetch(`${config.daily.apiBase}/meeting-tokens`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.daily.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error('Daily token error:', text);
      return res.status(502).json({ success: false, message: 'Failed to create meeting token' });
    }

    const data = await resp.json();
    // data will include a `token` and `value` depending on Daily response
    res.status(201).json({ success: true, token: data?.value || data?.token || data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to create meeting token' });
  }
};
