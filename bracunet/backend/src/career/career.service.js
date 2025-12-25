import { CareerOpportunity } from "./career.model.js";

export const careerService = {
  // Get all active opportunities
  async getAllOpportunities() {
    const opportunities = await CareerOpportunity.find({ isActive: true })
      .populate("postedBy", "name email role")
      .sort({ createdAt: -1 });
    return opportunities;
  },

  // Create a new opportunity (faculty only)
  async createOpportunity(data, userId) {
    const opportunity = new CareerOpportunity({
      ...data,
      postedBy: userId
    });
    await opportunity.save();
    
    // Populate the postedBy field for the response
    await opportunity.populate("postedBy", "name email role");

    // Emit real-time event for new job posting
    if (global.io) {
      global.io.emit('career_opportunity_posted', {
        opportunityId: opportunity._id,
        title: opportunity.title,
        company: opportunity.company,
        jobType: opportunity.jobType,
        location: opportunity.location,
        postedBy: userId
      });
    }

    return opportunity;
  },

  // Delete an opportunity (by poster or admin)
  async deleteOpportunity(opportunityId, userId, userRole) {
    const opportunity = await CareerOpportunity.findById(opportunityId);
    
    if (!opportunity) {
      throw new Error("Opportunity not found");
    }

    // Allow deletion if user is the poster OR if user is admin
    if (opportunity.postedBy.toString() !== userId.toString() && userRole !== 'admin') {
      throw new Error("Not authorized to delete this opportunity");
    }

    await CareerOpportunity.findByIdAndDelete(opportunityId);

    return { message: "Opportunity deleted successfully" };
  }
};
