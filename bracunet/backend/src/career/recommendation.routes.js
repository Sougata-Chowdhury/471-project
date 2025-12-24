import express from "express";
import { recommendationService } from "./recommendation.service.js";
import { authMiddleware } from "../middleware/auth.js";
import { supabaseLetterUpload } from "../middleware/supabaseUpload.js";
import supabase from "../config/supabase.js";
import { config } from "../config/index.js";

const router = express.Router();

// Get all faculty members (for dropdown)
router.get("/faculty", authMiddleware, async (req, res) => {
  try {
    const faculty = await recommendationService.getFacultyMembers();
    res.json(faculty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a recommendation request (students/alumni only)
router.post(
  "/",
  authMiddleware,
  async (req, res) => {
    try {
      const userRole = req.user.role;
      if (userRole !== "student" && userRole !== "alumni") {
        return res
          .status(403)
          .json({ message: "Only students and alumni can request recommendations" });
      }

      if (!req.body.email) {
        return res.status(400).json({ message: "Email address is required" });
      }

      const requestData = {
        requestedTo: req.body.facultyId,
        purpose: req.body.purpose,
        additionalInfo: req.body.additionalInfo || "",
        email: req.body.email,
      };

      const request = await recommendationService.createRequest(
        requestData,
        req.user._id
      );
      res.status(201).json(request);
    } catch (error) {
      console.error("Error creating recommendation request:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

// Get my requests (students/alumni)
router.get("/my-requests", authMiddleware, async (req, res) => {
  try {
    const requests = await recommendationService.getMyRequests(req.user._id);
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get received requests (faculty only)
router.get("/received", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "faculty") {
      return res.status(403).json({ message: "Only faculty can view received requests" });
    }
    const requests = await recommendationService.getReceivedRequests(req.user._id);
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update request status (faculty only)
router.patch("/:id/status", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "faculty") {
      return res.status(403).json({ message: "Only faculty can update request status" });
    }
    const { status } = req.body;
    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const request = await recommendationService.updateRequestStatus(
      req.params.id,
      status,
      req.user._id
    );
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload recommendation letter (faculty only)
router.post("/:id/upload-letter", authMiddleware, (req, res, next) => {
  if (req.user.role !== "faculty") {
    return res.status(403).json({ message: "Only faculty can upload letters" });
  }
  
  supabaseLetterUpload.single("letter")(req, res, (err) => {
    if (err) {
      console.error("Upload error:", err);
      return res.status(400).json({
        success: false,
        message: err.message || "File upload failed",
      });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Letter file is required",
      });
    }

    console.log('Uploading file to Supabase:', {
      fileName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      bucketName: config.supabase.bucketName
    });

    // Upload to Supabase Storage - use the path directly without folder
    const fileName = `${req.params.id}-${Date.now()}-${req.file.originalname}`;
    
    console.log('Attempting upload to bucket:', config.supabase.bucketName);
    console.log('File path:', fileName);
    
    const { data, error } = await supabase.storage
      .from(config.supabase.bucketName)
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Supabase upload error details:', {
        message: error.message,
        statusCode: error.statusCode,
        error: error
      });
      return res.status(500).json({
        success: false,
        message: `Failed to upload file to storage: ${error.message}`,
        details: error
      });
    }

    console.log('File uploaded successfully:', data);

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(config.supabase.bucketName)
      .getPublicUrl(fileName);

    const letterUrl = publicUrlData.publicUrl;
    const letterFileName = req.file.originalname;

    console.log('Public URL generated:', letterUrl);

    const request = await recommendationService.uploadLetter(
      req.params.id,
      letterUrl,
      letterFileName,
      req.user._id
    );

    res.json({
      success: true,
      message: "Letter uploaded successfully",
      data: request,
    });
  } catch (error) {
    console.error("Letter upload error:", error);
    res.status(500).json({ 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Delete recommendation request (students/alumni can delete their requests, faculty can delete requests made to them)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await recommendationService.deleteRequest(
      req.params.id,
      req.user._id,
      req.user.role
    );
    res.json({ success: true, message: "Request deleted successfully" });
  } catch (error) {
    console.error("Delete request error:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
