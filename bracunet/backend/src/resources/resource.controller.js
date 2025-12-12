

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

// CREATE / UPLOAD RESOURCE
export const createResource = async (req, res) => {
  try {
    const { title, description, type } = req.body;
    const file = req.file;
    if (!file) return res.status(400).json({ message: "No file uploaded" });

    const resource = new Resource({
      title,
      description,
      type,
      fileUrl: file.path,
      uploadedBy: req.user._id,
      status: "pending",
    });

    await resource.save();
    res.status(201).json(resource);
  } catch (err) {
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

    await resource.remove();
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
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: "Resource not found" });

    resource.status = approve ? "approved" : "rejected";
    await resource.save();
    res.json({ message: `Resource ${resource.status}`, resource });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
