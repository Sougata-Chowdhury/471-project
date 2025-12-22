import Post from "./post.model.js";
import Group from "./groups.model.js";

// ================== Get Posts of a Group ==================
export const getPosts = async (req, res) => {
  try {
    const { id } = req.params;
    const posts = await Post.find({ group: id })
      .populate("author", "name email")
      .populate("comments.author", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to fetch posts" });
  }
};

// ================== Create Post ==================
export const createPost = async (req, res) => {
  try {
    const { id } = req.params; // group ID
    const { content } = req.body;

    const group = await Group.findById(id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    // Allow posting if user is a member or an admin
    const isMember = group.members.some(m => m.toString() === req.user._id.toString());
    const isAdmin = req.user && req.user.role === 'admin';
    if (!isMember && !isAdmin) {
      return res.status(403).json({ message: "You are not a member of this group" });
    }

    const postData = {
      content,
      group: id,
      author: req.user._id,
    };

    // If an image was uploaded via multer/cloudinary, attach its URL
    if (req.file) {
      postData.image = req.file.path || req.file.secure_url || req.file.url || req.file?.location || null;
    }

    const post = await Post.create(postData);

    // Emit real-time event
    if (global.io) {
      global.io.to(`forum_${id}`).emit('newPost', { ...post.toObject(), forumId: id });
    }

    res.status(201).json(post);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to create post" });
  }
};

// ================== Add Comment ==================
export const addComment = async (req, res) => {
  try {
    const { id } = req.params; // post ID
    const { content } = req.body;

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.push({
      author: req.user._id,
      content,
    });

    await post.save();

    // Emit real-time event
    if (global.io) {
      global.io.to(`forum_${post.group}`).emit('newComment', { postId: id, comment: post.comments[post.comments.length - 1], forumId: post.group });
    }

    res.status(201).json({ message: "Comment added", post });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to add comment" });
  }
};

// ================== React to Post ==================
export const reactPost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const index = post.reactions.indexOf(req.user._id);

    if (index === -1) post.reactions.push(req.user._id);
    else post.reactions.splice(index, 1);

    await post.save();

    // Emit real-time event
    if (global.io) {
      global.io.to(`forum_${post.group}`).emit('postReaction', { postId: id, reactions: post.reactions.length, forumId: post.group });
    }

    res.status(200).json({ reactions: post.reactions.length });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to react" });
  }
};
