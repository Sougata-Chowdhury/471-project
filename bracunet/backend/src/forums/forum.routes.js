// import express from "express";
// import { protect, authorize } from "../middleware/auth.js";
// import * as groupController from "./group.controller.js";

// const router = express.Router();

// // Groups
// router.get("/groups", protect, groupController.getAllGroups);
// router.post("/groups", protect, authorize("admin"), groupController.createGroup);
// router.post("/groups/:id/join", protect, groupController.joinGroup);

// export default router;


import express from "express";
import * as groupController from "./group.controller.js";
import * as postController from "./post.controller.js";
import { protect, authorize } from "../middleware/auth.js";
import { cloudinaryResourceUpload } from "../middleware/upload.js";

const router = express.Router();

// Groups
router.get("/groups", protect, groupController.getAllGroups);
router.post("/groups", protect, authorize("admin", "faculty", "alumni"), groupController.createGroup);
router.post("/groups/:id/join", protect, groupController.joinGroup);
router.post("/groups/:groupId/approve/:userId", protect, authorize("admin"), groupController.approveJoinRequest);

// Posts
router.get("/groups/:id/posts", protect, postController.getPosts);
router.post("/groups/:id/posts", protect, cloudinaryResourceUpload.single('image'), postController.createPost);
router.post("/posts/:id/comments", protect, postController.addComment);
router.post("/posts/:id/react", protect, postController.reactPost);

export default router;
