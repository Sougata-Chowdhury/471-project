import Group from "./groups.model.js"; 
import { User } from "../users/user.model.js";
import { config } from "../config/index.js";

// Get all groups
export const getAllGroups = async (req, res) => {
  try {
    const groups = await Group.find().populate('createdBy', 'name email');
    
    // Add joinStatus for current user
    const groupsWithStatus = groups.map(group => {
      const groupObj = group.toObject();
      const userId = req.user._id.toString();
      
      if (group.members.some(m => m.toString() === userId)) {
        groupObj.joinStatus = 'approved';
      } else if (group.requests.some(r => r.toString() === userId)) {
        groupObj.joinStatus = 'pending';
      } else {
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
    const { name, topic, description } = req.body;
    if (!name || !topic) {
      return res.status(400).json({ success: false, message: "Name and Topic required" });
    }

    const newGroup = await Group.create({
      name,
      topic,
      description,
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
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ success: false, message: "Group not found" });

    // Add user to requests if not already joined/requested
    if (!group.requests.includes(req.user._id) && !group.members.includes(req.user._id)) {
      group.requests.push(req.user._id);
      await group.save();
    }

    res.status(200).json({ success: true, message: "Join request sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to join group" });
  }
};

// Approve join request (Admin only)
export const approveJoinRequest = async (req, res) => {
  try {
    const { groupId, userId } = req.params;
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ success: false, message: "Group not found" });

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

// Create a Daily meeting room for a group (members only)
export const createMeeting = async (req, res) => {
  try {
    const { id } = req.params; // group id
    const group = await Group.findById(id);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    // Only allow members to create meeting
    const userId = req.user._id.toString();
    const isMember = group.members.some(m => m.toString() === userId);
    if (!isMember) return res.status(403).json({ success: false, message: 'Only members can create meetings' });

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

    if (!resp.ok) {
      const text = await resp.text();
      console.error('Daily API error:', text);
      return res.status(502).json({ success: false, message: 'Failed to create meeting' });
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
