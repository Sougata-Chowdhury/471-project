import express from "express";
import { recommendationService } from "./recommendation.service.js";
import { authMiddleware } from "../middleware/auth.js";

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

export default router;
