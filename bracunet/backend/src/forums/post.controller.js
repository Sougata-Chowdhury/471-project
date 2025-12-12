import Post from "./Post.model.js";
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

    // Only approved members can post
    if (!group.members.includes(req.user._id)) {
      return res.status(403).json({ message: "You are not a member of this group" });
    }

    const post = await Post.create({
      content,
      group: id,
      author: req.user._id,
    });

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
    const { comment } = req.body;

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.push({
      author: req.user._id,
      text: comment,
    });

    await post.save();

    res.status(201).json({ message: "Comment added", post });
  } catch (err) {
    res.status(500).json({ message: "Failed to add comment" });
  }
};

// ================== React to Post ==================
export const reactPost = async (req, res) => {
  try {
    const { id } = req.params; // post ID

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const index = post.reactions.indexOf(req.user._id);

    if (index === -1) {
      // Add reaction
      post.reactions.push(req.user._id);
    } else {
      // Remove reaction
      post.reactions.splice(index, 1);
    }

    await post.save();

    res.status(200).json({ message: "Reaction updated", reactions: post.reactions.length });
  } catch (err) {
    res.status(500).json({ message: "Failed to react to post" });
  }
};
export const getPostComments = async (req, res) => {
  try {
    const { id } = req.params; // post ID
    const post = await Post.findById(id).populate("comments.author", "name email");
    if (!post) return res.status(404).json({ message: "Post not found" });

    res.status(200).json(post.comments);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch comments" });
  }
};