import express from "express";
import { protect } from "../middleware/auth.js";
import { careerService } from "./career.service.js";

const router = express.Router();

// Get all opportunities (any verified user)
router.get("/", protect, async (req, res) => {
  try {
    if (!req.user.isVerified) {
      return res.status(403).json({ message: "Only verified users can view opportunities" });
    }
    const opportunities = await careerService.getAllOpportunities();
    res.json(opportunities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create opportunity (faculty only)
router.post("/", protect, async (req, res) => {
  try {
    if (!req.user.isVerified) {
      return res.status(403).json({ message: "Only verified users can post opportunities" });
    }
    
    if (req.user.role !== "faculty") {
      return res.status(403).json({ message: "Only faculty members can post opportunities" });
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
    res.status(500).json({ message: error.message });
  }
});

// Delete opportunity (only by poster)
router.delete("/:id", protect, async (req, res) => {
  try {
    const result = await careerService.deleteOpportunity(req.params.id, req.user._id);
    res.json(result);
  } catch (error) {
    if (error.message === "Not authorized to delete this opportunity") {
      return res.status(403).json({ message: error.message });
    }
    if (error.message === "Opportunity not found") {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
});

export default router;
