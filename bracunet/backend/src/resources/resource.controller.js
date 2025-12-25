

// import Resource from "../resources/resource.model.js";

// // CREATE / UPLOAD RESOURCE
// export const createResource = async (req, res) => {
//   try {
//     const { title, description, type } = req.body;
//     const file = req.file;
//     if (!file) return res.status(400).json({ message: "No file uploaded" });

//     const resource = new Resource({
//       title,
//       description,
//       type,
//       fileUrl: file.path,
//       uploadedBy: req.user._id,
//       status: "pending",
//     });

//     await resource.save();
//     res.status(201).json(resource);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // GET ALL RESOURCES
// export const getResources = async (req, res) => {
//   try {
//     const resources = await Resource.find()
//       .populate("uploadedBy", "name email role")
//       .sort({ createdAt: -1 });

//     res.json(resources);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // DELETE RESOURCE
// export const deleteResource = async (req, res) => {
//   try {
//     const resource = await Resource.findById(req.params.id);
//     if (!resource) return res.status(404).json({ message: "Resource not found" });

//     if (req.user.role !== "admin" && resource.uploadedBy.toString() !== req.user._id.toString()) {
//       return res.status(403).json({ message: "Not authorized" });
//     }

//     await resource.remove();
//     res.json({ message: "Resource deleted" });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // APPROVE / REJECT RESOURCE (ADMIN ONLY)
// export const approveResource = async (req, res) => {
//   try {
//     const { approve } = req.body; // true or false
//     const resource = await Resource.findById(req.params.id);
//     if (!resource) return res.status(404).json({ message: "Resource not found" });

//     resource.status = approve ? "approved" : "rejected";
//     await resource.save();
//     res.json({ message: `Resource ${resource.status}`, resource });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

import Resource from "../resources/resource.model.js";
import { supabase, isSupabaseEnabled } from "../config/supabase.js";
import { config } from "../config/index.js";

// CREATE / UPLOAD RESOURCE
export const createResource = async (req, res) => {
  try {
    const { title, description, type } = req.body;
    const file = req.file;
    if (!file) return res.status(400).json({ message: "No file uploaded" });

    // Check if Supabase is enabled
    if (!isSupabaseEnabled) {
      return res.status(503).json({ 
        message: "Storage service not configured. Please contact administrator.",
        details: "Supabase credentials are missing."
      });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.round(Math.random() * 1e9);
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `resource-${timestamp}-${randomStr}.${fileExtension}`;
    const filePath = `resources/${fileName}`;

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(config.supabase.bucketName)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return res.status(500).json({ 
        message: "Failed to upload file to storage",
        error: uploadError.message 
      });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(config.supabase.bucketName)
      .getPublicUrl(filePath);

    const fileUrl = urlData.publicUrl;

    // Create resource record in database
    const resource = new Resource({
      title,
      description,
      type,
      fileUrl,
      uploadedBy: req.user._id,
      status: "pending",
    });

    await resource.save();
    res.status(201).json(resource);
  } catch (err) {
    console.error('Error creating resource:', err);
    res.status(500).json({ message: err.message });
  }
};

// GET ALL RESOURCES
export const getResources = async (req, res) => {
  try {
    const resources = await Resource.find()
      .populate("uploadedBy", "name email role")
      .sort({ createdAt: -1 });

    res.json(resources);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE RESOURCE
export const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: "Resource not found" });

    if (req.user.role !== "admin" && resource.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Resource.findByIdAndDelete(req.params.id);
    res.json({ message: "Resource deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// APPROVE / REJECT RESOURCE (ADMIN ONLY)
export const approveResource = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { approve } = req.body; // true or false
    // Use findById to check existence first
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: "Resource not found" });

    // If older records are missing `type`, set a sensible default to avoid required-field validation errors
    const update = { status: approve ? "approved" : "rejected" };
    if (!resource.type) update.type = resource.type || "Other";

    // Update without triggering strict validation issues on legacy docs
    const updated = await Resource.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true, runValidators: false }
    ).populate("uploadedBy", "name email role");

    // Send notification to uploader if approved
    if (approve) {
      try {
        const { createNotification } = await import('../notifications/notification.service.js');
        await createNotification({
          userId: updated.uploadedBy._id,
          type: 'resource_approved',
          title: 'Resource Approved',
          message: `Your resource "${updated.title}" has been approved!`,
          link: `/resources`,
          relatedId: updated._id,
          relatedModel: 'Resource',
          priority: 'normal',
        });
        console.log('✅ Resource approval notification sent');
      } catch (notifError) {
        console.error('❌ Failed to send resource approval notification:', notifError);
      }
    }

    res.json({ message: `Resource ${updated.status}`, resource: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
