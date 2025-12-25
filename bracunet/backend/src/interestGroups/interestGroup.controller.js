import InterestGroup from './interestGroup.model.js';
import InterestGroupMessage from './interestGroupMessage.model.js';
import { createNotification } from '../notifications/notification.service.js';

// Create a new interest group (auto-approved)
export const createGroup = async (req, res) => {
  const { name, description, category, isPrivate } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'Group name is required' });
  }

  try {
    const imageUrl = req.file ? (req.file.path || req.file.secure_url || req.file.url || null) : null;
    const group = await InterestGroup.create({
      name: name.trim(),
      description: description?.trim() || '',
      category: category || 'other',
      isPrivate: isPrivate || false,
      creator: req.user.id,
      status: 'approved',
      approvedAt: new Date(),
      approvedBy: req.user.id,
      imageUrl,
      members: [
        {
          userId: req.user.id,
          role: 'creator',
        },
      ],
    });

    const populated = await group.populate([
      { path: 'creator', select: 'name email' },
      { path: 'members.userId', select: 'name email' },
      { path: 'approvedBy', select: 'name email' },
    ]);

    console.log('✅ Interest group created (auto-approved):', group._id);
    res.status(201).json(populated);
  } catch (error) {
    console.error('❌ Error creating group:', error);
    res.status(500).json({ message: 'Error creating group', error: error.message });
  }
};

// Creator approves their own group
export const approveGroup = async (req, res) => {
  const { groupId } = req.params;

  try {
    const group = await InterestGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (String(group.creator) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Only the creator can approve this group' });
    }

    if (group.status !== 'pending') {
      return res.status(400).json({ message: 'Group is already ' + group.status });
    }

    group.status = 'approved';
    group.approvedAt = new Date();
    group.approvedBy = req.user.id;
    await group.save();

    const populated = await group.populate([
      { path: 'creator', select: 'name email' },
      { path: 'members.userId', select: 'name email' },
    ]);

    console.log('✅ Group approved:', groupId);
    res.json(populated);
  } catch (error) {
    console.error('❌ Error approving group:', error);
    res.status(500).json({ message: 'Error approving group', error: error.message });
  }
};

// Get all approved interest groups (paginated)
export const getApprovedGroups = async (req, res) => {
  const { page = 1, limit = 10, category, search } = req.query;
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * limitNum;

  try {
    const userId = req.user?._id || req.user?.id;


    // Show all non-rejected groups to everyone; if authenticated, still include own/joined
    const baseFilter = {
      status: { $ne: 'rejected' },
    };
    if (userId) {
      baseFilter.$or = [
        { status: { $ne: 'rejected' } },
        { creator: userId },
        { 'members.userId': userId },
      ];
    }

    const filters = [baseFilter];
    if (category) filters.push({ category });
    if (search) {
      filters.push({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ],
      });
    }

    const filter = filters.length > 1 ? { $and: filters } : baseFilter;

    const groups = await InterestGroup.find(filter)
      .populate('creator', 'name email')
      .populate('members.userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await InterestGroup.countDocuments(filter);

    res.json({
      groups,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('❌ Error fetching groups:', error);
    res.status(500).json({ message: 'Error fetching groups', error: error.message });
  }
};

// Get a specific group's details
export const getGroupDetails = async (req, res) => {
  const { groupId } = req.params;

  try {
    const group = await InterestGroup.findById(groupId).populate([
      { path: 'creator', select: 'name email' },
      { path: 'members.userId', select: 'name email role' },
      { path: 'approvedBy', select: 'name email' },
    ]);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    res.json(group);
  } catch (error) {
    console.error('❌ Error fetching group details:', error);
    res.status(500).json({ message: 'Error fetching group', error: error.message });
  }
};

// Join a group
export const joinGroup = async (req, res) => {
  const { groupId } = req.params;

  try {
    const group = await InterestGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (group.status !== 'approved') {
      return res.status(400).json({ message: 'Can only join approved groups' });
    }

    const isMember = group.members.some((m) => String(m.userId) === String(req.user.id));
    if (isMember) {
      return res.status(400).json({ message: 'You are already a member' });
    }

    group.members.push({
      userId: req.user.id,
      role: 'member',
    });
    await group.save();

    const populated = await group.populate([
      { path: 'creator', select: 'name email' },
      { path: 'members.userId', select: 'name email' },
    ]);

    console.log('✅ User joined group:', groupId);
    res.json(populated);
  } catch (error) {
    console.error('❌ Error joining group:', error);
    res.status(500).json({ message: 'Error joining group', error: error.message });
  }
};

// Leave a group (members only; creator cannot leave)
export const leaveGroup = async (req, res) => {
  const { groupId } = req.params;
  try {
    const group = await InterestGroup.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const isMember = group.members.some((m) => String(m.userId) === String(req.user.id));
    if (!isMember) return res.status(400).json({ message: 'You are not a member' });

    if (String(group.creator) === String(req.user.id)) {
      return res.status(400).json({ message: 'Creator cannot leave their own group' });
    }

    group.members = group.members.filter((m) => String(m.userId) !== String(req.user.id));
    await group.save();

    const populated = await group.populate([
      { path: 'creator', select: 'name email' },
      { path: 'members.userId', select: 'name email' },
    ]);

    res.json(populated);
  } catch (error) {
    console.error('❌ Error leaving group:', error);
    res.status(500).json({ message: 'Error leaving group', error: error.message });
  }
};

// Remove a member (creator or admin only)
export const removeMember = async (req, res) => {
  const { groupId, userId } = req.params;
  try {
    const group = await InterestGroup.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const isCreator = String(group.creator) === String(req.user.id);
    const isAdmin = req.user.role === 'admin';
    if (!isCreator && !isAdmin) return res.status(403).json({ message: 'Not authorized' });

    if (String(group.creator) === String(userId)) {
      return res.status(400).json({ message: 'Cannot remove the creator' });
    }

    const wasMember = group.members.some((m) => String(m.userId) === String(userId));
    if (!wasMember) return res.status(404).json({ message: 'Member not found' });

    group.members = group.members.filter((m) => String(m.userId) !== String(userId));
    await group.save();

    const populated = await group.populate([
      { path: 'creator', select: 'name email' },
      { path: 'members.userId', select: 'name email' },
    ]);
    res.json(populated);
  } catch (error) {
    console.error('❌ Error removing member:', error);
    res.status(500).json({ message: 'Error removing member', error: error.message });
  }
};

// Request to join (creates pending request)
export const requestJoin = async (req, res) => {
  const { groupId } = req.params;
  try {
    const group = await InterestGroup.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const isMember = group.members.some((m) => String(m.userId) === String(req.user.id));
    if (isMember) return res.status(400).json({ message: 'Already a member' });

    const hasRequested = group.joinRequests?.some((r) => String(r.userId) === String(req.user.id));
    if (hasRequested) return res.status(400).json({ message: 'Already requested' });

    group.joinRequests = group.joinRequests || [];
    group.joinRequests.push({ userId: req.user.id });
    await group.save();

    const populated = await group.populate([
      { path: 'joinRequests.userId', select: 'name email' },
      { path: 'members.userId', select: 'name email' },
      { path: 'creator', select: 'name email' },
    ]);
    res.status(201).json(populated);
  } catch (error) {
    console.error('❌ Error requesting join:', error);
    res.status(500).json({ message: 'Error requesting join', error: error.message });
  }
};

export const getJoinRequests = async (req, res) => {
  const { groupId } = req.params;
  try {
    const group = await InterestGroup.findById(groupId).populate('joinRequests.userId', 'name email');
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const isCreator = String(group.creator) === String(req.user.id);
    const isAdmin = req.user.role === 'admin';
    if (!isCreator && !isAdmin) return res.status(403).json({ message: 'Not authorized' });

    res.json(group.joinRequests || []);
  } catch (error) {
    console.error('❌ Error getting join requests:', error);
    res.status(500).json({ message: 'Error fetching join requests', error: error.message });
  }
};

export const approveJoinRequest = async (req, res) => {
  const { groupId, userId } = req.params;
  try {
    const group = await InterestGroup.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const isCreator = String(group.creator) === String(req.user.id);
    const isAdmin = req.user.role === 'admin';
    if (!isCreator && !isAdmin) return res.status(403).json({ message: 'Not authorized' });

    const reqIdx = (group.joinRequests || []).findIndex((r) => String(r.userId) === String(userId));
    if (reqIdx < 0) return res.status(404).json({ message: 'Request not found' });

    // Add member and remove request
    const alreadyMember = group.members.some((m) => String(m.userId) === String(userId));
    if (!alreadyMember) group.members.push({ userId, role: 'member' });
    group.joinRequests.splice(reqIdx, 1);
    await group.save();

    const populated = await group.populate([
      { path: 'members.userId', select: 'name email' },
      { path: 'joinRequests.userId', select: 'name email' },
    ]);
    res.json(populated);
  } catch (error) {
    console.error('❌ Error approving join:', error);
    res.status(500).json({ message: 'Error approving join', error: error.message });
  }
};

export const rejectJoinRequest = async (req, res) => {
  const { groupId, userId } = req.params;
  try {
    const group = await InterestGroup.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const isCreator = String(group.creator) === String(req.user.id);
    const isAdmin = req.user.role === 'admin';
    if (!isCreator && !isAdmin) return res.status(403).json({ message: 'Not authorized' });

    group.joinRequests = (group.joinRequests || []).filter((r) => String(r.userId) !== String(userId));
    await group.save();
    res.json({ message: 'Join request rejected' });
  } catch (error) {
    console.error('❌ Error rejecting join:', error);
    res.status(500).json({ message: 'Error rejecting join', error: error.message });
  }
};

// Get user's groups (created or joined)
export const getUserGroups = async (req, res) => {
  try {
    const groups = await InterestGroup.find({
      $or: [
        { creator: req.user.id },
        { 'members.userId': req.user.id },
      ],
    })
      .populate('creator', 'name email')
      .populate('members.userId', 'name email')
      .sort({ createdAt: -1 });

    res.json(groups);
  } catch (error) {
    console.error('❌ Error fetching user groups:', error);
    res.status(500).json({ message: 'Error fetching groups', error: error.message });
  }
};

// Send a message in a group
export const sendGroupMessage = async (req, res) => {
  const { groupId, message } = req.body;

  // Allow sending either text or image (or both)
  const hasText = typeof message === 'string' && message.trim().length > 0;
  const hasImage = !!req.file;
  if (!groupId || (!hasText && !hasImage)) {
    return res.status(400).json({ message: 'groupId and at least one of message or image is required' });
  }

  try {
    const group = await InterestGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const isMember = group.members.some((m) => String(m.userId) === String(req.user.id));
    if (!isMember) {
      return res.status(403).json({ message: 'Only group members can send messages' });
    }

    const msg = await InterestGroupMessage.create({
      groupId,
      sender: req.user.id,
      message: hasText ? message.trim() : '',
      imageUrl: hasImage ? (req.file.path || req.file.secure_url || req.file.url || null) : null,
    });

    const populated = await msg.populate([
      { path: 'sender', select: 'name email' },
      { path: 'groupId', select: 'name' },
    ]);

    // Emit real-time event
    if (global.io) {
      global.io.to(`interestGroup_${groupId}`).emit('groupMessage', { ...populated.toObject(), groupId });
      // Notify all group members
      try {
        global.io.to(`group-${groupId}`).emit('interestGroupMessageInbox', {
          groupId,
          messageId: populated._id,
          sender: populated.sender,
          message: populated.message,
          imageUrl: populated.imageUrl,
          createdAt: populated.createdAt,
        });
      } catch (e) {}
    }

    console.log('✅ Group message sent:', msg._id);
    res.status(201).json(populated);
  } catch (error) {
    console.error('❌ Error sending group message:', error);
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
};

// Get group messages
export const getGroupMessages = async (req, res) => {
  const { groupId } = req.params;

  try {
    const messages = await InterestGroupMessage.find({ groupId })
      .populate('sender', 'name email')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error('❌ Error fetching group messages:', error);
    res.status(500).json({ message: 'Error fetching messages', error: error.message });
  }
};

// Edit group (name, description) - creator only
export const editGroup = async (req, res) => {
  const { groupId } = req.params;
  const { name, description, category } = req.body;

  try {
    const group = await InterestGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const isCreator = String(group.creator) === String(req.user.id);
    const isAdmin = req.user.role === 'admin';
    if (!isCreator && !isAdmin) {
      return res.status(403).json({ message: 'Only the creator or admin can edit this group' });
    }

    if (name) group.name = name.trim();
    if (description) group.description = description.trim();
    if (category) group.category = category;
    if (req.file) {
      group.imageUrl = req.file.path || req.file.secure_url || req.file.url || group.imageUrl;
    }
    
    await group.save();

    const populated = await group.populate([
      { path: 'creator', select: 'name email' },
      { path: 'members.userId', select: 'name email' },
    ]);

    console.log('✅ Group edited:', groupId);
    res.json(populated);
  } catch (error) {
    console.error('❌ Error editing group:', error);
    res.status(500).json({ message: 'Error editing group', error: error.message });
  }
};

// Delete group - creator or admin only
export const deleteGroup = async (req, res) => {
  const { groupId } = req.params;

  try {
    const group = await InterestGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const isCreator = String(group.creator) === String(req.user.id);
    const isAdmin = req.user.role === 'admin';

    if (!isCreator && !isAdmin) {
      return res.status(403).json({ message: 'Only the creator or admin can delete this group' });
    }

    // Delete all messages in this group
    await InterestGroupMessage.deleteMany({ groupId });
    // Delete the group
    await InterestGroup.findByIdAndDelete(groupId);

    console.log('✅ Group deleted:', groupId);
    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting group:', error);
    res.status(500).json({ message: 'Error deleting group', error: error.message });
  }
};
