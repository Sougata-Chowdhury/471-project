import express from "express";
import { protect } from "../middleware/auth.js";
import { careerService } from "./career.service.js";
import { sanitizeError } from "../utils/errorHandler.js";

const router = express.Router();

// Get all opportunities (any verified user or admin)
router.get("/", protect, async (req, res) => {
  try {
    if (!req.user.isVerified && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Only verified users can view opportunities" });
    }
    const opportunities = await careerService.getAllOpportunities();
    res.json(opportunities);
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    res.status(500).json(sanitizeError(error, process.env.NODE_ENV === 'development'));
  }
});

// Create opportunity (faculty, alumni, and admin)
router.post("/", protect, async (req, res) => {
  try {
    if (!req.user.isVerified && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Only verified users can post opportunities" });
    }
    
    if (req.user.role === "student") {
      return res.status(403).json({ message: "Students cannot post opportunities" });
    }

    const { title, company, type, description, externalLink } = req.body;

    if (!title || !company) {
      return res.status(400).json({ message: "Title and company are required" });
    }

    const opportunity = await careerService.createOpportunity(
      { title, company, type, description, externalLink },
      req.user._id
    );

    res.status(201).json(opportunity);
  } catch (error) {
    console.error('Error creating opportunity:', error);
    res.status(500).json(sanitizeError(error, process.env.NODE_ENV === 'development'));
  }
});

// Delete opportunity (by poster or admin)
router.delete("/:id", protect, async (req, res) => {
  try {
    const result = await careerService.deleteOpportunity(req.params.id, req.user._id, req.user.role);
    res.json(result);
  } catch (error) {
    if (error.message === "Not authorized to delete this opportunity") {
      return res.status(403).json({ message: error.message });
    }
    if (error.message === "Opportunity not found") {
      return res.status(404).json({ message: error.message });
    }
    console.error('Error deleting opportunity:', error);
    res.status(500).json(sanitizeError(error, process.env.NODE_ENV === 'development'));
  }
});

export default router;
