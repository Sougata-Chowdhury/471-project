import GroupMessage from './groupMessage.model.js';
import Group from './groups.model.js';

export const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    console.log(`[getGroupMessages] user=${req.user?._id} groupId=${groupId}`);
    const messages = await GroupMessage.find({ group: groupId })
      .populate('sender', 'name email')
      .sort({ createdAt: 1 });
    res.status(200).json({ success: true, messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch messages' });
  }
};

export const postGroupMessage = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { content, metadata } = req.body;
    console.log(`[postGroupMessage] user=${req.user?._id} groupId=${groupId} contentLen=${content?.length}`);

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    // Optional: ensure sender is a member or allow admins
    const isMember = group.members.some(m => m.toString() === req.user._id.toString());
    const isAdmin = req.user && req.user.role === 'admin';
    if (!isMember && !isAdmin) return res.status(403).json({ success: false, message: 'Not a group member' });

    const msg = await GroupMessage.create({
      group: groupId,
      sender: req.user._id,
      content,
      metadata,
    });

    // Populate sender before returning
    await msg.populate('sender', 'name email');

    res.status(201).json({ success: true, message: msg });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to post message' });
  }
};
