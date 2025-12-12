// import express from "express";
// import { createResource, getResources, deleteResource, approveResource } from "./resource.controller.js";
// import { cloudinaryUpload } from "../middleware/upload.js";
// import { protect } from "../middleware/auth.js";
// import { isAdmin } from "../middleware/auth.js";

// const router = express.Router();

// // Get all resources
// router.get("/", getResources);

// // Upload resource
// router.post("/", protect, cloudinaryUpload.single("file"), createResource);

// // Delete resource
// router.delete("/:id", protect, deleteResource);

// // Approve resource (admin only)
// router.put("/approve/:id", protect, isAdmin, approveResource);

// export default router;



import express from "express";
import {
  createResource,
  getResources,
  deleteResource,
  approveResource,
} from "./resource.controller.js";
import { cloudinaryResourceUpload } from "../middleware/upload.js";
import { protect, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// GET ALL RESOURCES
router.get("/", getResources);

// UPLOAD RESOURCE
router.post("/", protect, cloudinaryResourceUpload.single("file"), createResource);

// DELETE RESOURCE
router.delete("/:id", protect, deleteResource);

// APPROVE / REJECT RESOURCE
router.put("/approve/:id", protect, isAdmin, approveResource);

export default router;
