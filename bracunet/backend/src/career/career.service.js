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

    return opportunity;
  },

  // Delete an opportunity (only by the poster)
  async deleteOpportunity(opportunityId, userId) {
    const opportunity = await CareerOpportunity.findById(opportunityId);
    
    if (!opportunity) {
      throw new Error("Opportunity not found");
    }

    if (opportunity.postedBy.toString() !== userId.toString()) {
      throw new Error("Not authorized to delete this opportunity");
    }

    await CareerOpportunity.findByIdAndDelete(opportunityId);

    return { message: "Opportunity deleted successfully" };
  }
};
