import GroupMessage from './groupMessage.model.js';
import Group from './groups.model.js';

export const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
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

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    // Optional: ensure sender is a member
    const isMember = group.members.some(m => m.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ success: false, message: 'Not a group member' });

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
