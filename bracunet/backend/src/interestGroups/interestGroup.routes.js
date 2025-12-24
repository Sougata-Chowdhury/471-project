import express from 'express';
import { protect, optionalAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import {
  createGroup,
  getApprovedGroups,
  getGroupDetails,
  joinGroup,
  requestJoin,
  getJoinRequests,
  approveJoinRequest,
  rejectJoinRequest,
  getUserGroups,
  sendGroupMessage,
  getGroupMessages,
  editGroup,
  deleteGroup,
  leaveGroup,
  removeMember,
} from './interestGroup.controller.js';
import {
  createPost,
  getPosts,
  toggleLike,
  addComment,
  deleteComment,
  sharePost,
} from './interestGroupPost.controller.js';

const router = express.Router();

// Create a new group (auto-approved) with optional image
router.post('/', protect, upload.single('image'), createGroup);

// Get user's groups (created or joined) - MUST be before /:groupId
router.get('/me/my-groups', protect, getUserGroups);

// Get all approved groups (public) but include user's own groups when authenticated
router.get('/', optionalAuth, getApprovedGroups);

// Get a specific group - MUST be after /me/my-groups
router.get('/:groupId', getGroupDetails);

// Edit group (name, description, image)
router.patch('/:groupId', protect, upload.single('image'), editGroup);

// Delete group
router.delete('/:groupId', protect, deleteGroup);

// Join a group
router.post('/:groupId/join', protect, joinGroup);
router.post('/:groupId/request-join', protect, requestJoin);
router.get('/:groupId/join-requests', protect, getJoinRequests);
router.post('/:groupId/join-requests/:userId/approve', protect, approveJoinRequest);
router.post('/:groupId/join-requests/:userId/reject', protect, rejectJoinRequest);

// Leave group & remove member
router.delete('/:groupId/leave', protect, leaveGroup);
router.delete('/:groupId/members/:userId', protect, removeMember);

// Send message in a group (with optional image)
router.post('/:groupId/message', protect, upload.single('image'), sendGroupMessage);

// Get group messages
router.get('/:groupId/messages', getGroupMessages);

// Group posts (FB-like)
router.post('/:groupId/posts', protect, upload.single('image'), createPost);
router.get('/:groupId/posts', getPosts);
router.post('/posts/:postId/like', protect, toggleLike);
router.post('/posts/:postId/comment', protect, addComment);
router.delete('/posts/:postId/comment/:commentId', protect, deleteComment);
router.post('/posts/:postId/share', protect, sharePost);

export default router;
