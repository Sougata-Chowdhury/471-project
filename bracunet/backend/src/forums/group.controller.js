import Group from "./groups.model.js"; 
import { User } from "../users/user.model.js";

// Get all groups
export const getAllGroups = async (req, res) => {
  try {
    const groups = await Group.find();
    res.status(200).json({ success: true, groups });
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
