import InterestGroup from './interestGroup.model.js';
import InterestGroupPost from './interestGroupPost.model.js';

export const createPost = async (req, res) => {
  const { groupId } = req.params;
  const { content } = req.body;
  if ((!content || !content.trim()) && !req.file) {
    return res.status(400).json({ message: 'content or image is required' });
  }
  try {
    const group = await InterestGroup.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const isMember = group.members.some((m) => String(m.userId) === String(req.user.id));
    if (!isMember) return res.status(403).json({ message: 'Only members can post' });

    const postData = {
      groupId,
      author: req.user.id,
      content: content?.trim() || '',
    };
    if (req.file) {
      postData.imageUrl = req.file.path || req.file.secure_url || req.file.url || null;
    }

    const post = await InterestGroupPost.create(postData);
    const populated = await post.populate([
      { path: 'author', select: 'name email' },
      { path: 'groupId', select: 'name' },
      { path: 'comments.user', select: 'name' },
    ]);

    if (global.io) {
      global.io.to(`interestGroup_${groupId}`).emit('groupPost', populated);
    }

    res.status(201).json(populated);
  } catch (err) {
    console.error('❌ Error creating post:', err);
    res.status(500).json({ message: 'Error creating post', error: err.message });
  }
};

export const getPosts = async (req, res) => {
  const { groupId } = req.params;
  try {
    const posts = await InterestGroupPost.find({ groupId })
      .populate('author', 'name email')
      .populate('comments.user', 'name')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching posts', error: err.message });
  }
};

export const toggleLike = async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await InterestGroupPost.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const userId = String(req.user.id);
    const idx = post.likes.findIndex((u) => String(u) === userId);
    if (idx >= 0) {
      post.likes.splice(idx, 1);
    } else {
      post.likes.push(req.user.id);
    }
    await post.save();
    const populated = await post.populate([
      { path: 'author', select: 'name email' },
      { path: 'comments.user', select: 'name' },
    ]);
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Error toggling like', error: err.message });
  }
};

export const addComment = async (req, res) => {
  const { postId } = req.params;
  const { text } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ message: 'text is required' });
  try {
    const post = await InterestGroupPost.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    post.comments.push({ user: req.user.id, text: text.trim() });
    await post.save();
    const populated = await post.populate([
      { path: 'author', select: 'name email' },
      { path: 'comments.user', select: 'name' },
    ]);
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Error adding comment', error: err.message });
  }
};

export const deleteComment = async (req, res) => {
  const { postId, commentId } = req.params;
  try {
    const post = await InterestGroupPost.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    const isOwner = String(comment.user) === String(req.user.id);
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Not authorized' });
    comment.remove();
    await post.save();
    const populated = await post.populate([
      { path: 'author', select: 'name email' },
      { path: 'comments.user', select: 'name' },
    ]);
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Error deleting comment', error: err.message });
  }
};

export const sharePost = async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await InterestGroupPost.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    post.shares += 1;
    await post.save();
    res.json({ shares: post.shares });
  } catch (err) {
    res.status(500).json({ message: 'Error sharing post', error: err.message });
  }
};
