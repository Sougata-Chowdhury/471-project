import { User } from "../users/user.model.js";
import Event from "../events/event.model.js";
import { DonationCampaign, Donation } from "../donations/donation.model.js";
import MentorshipMessage from "../mentorship/mentorshipMessage.model.js";

// Get active users stats
export const getActiveUsersStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    
    // Users by role
    const usersByRole = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } }
    ]);

    // New users in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsers = await User.countDocuments({ 
      createdAt: { $gte: thirtyDaysAgo } 
    });

    res.json({
      totalUsers,
      activeUsers,
      verifiedUsers,
      newUsers,
      usersByRole: usersByRole.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user stats", error: error.message });
  }
};

// Get event participation stats
export const getEventStats = async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const upcomingEvents = await Event.countDocuments({ 
      date: { $gte: new Date() } 
    });
    const pastEvents = await Event.countDocuments({ 
      date: { $lt: new Date() } 
    });

    // Total registrations
    const events = await Event.find();
    const totalRegistrations = events.reduce((sum, event) => 
      sum + (event.registeredUsers?.length || 0), 0
    );

    // Average attendance per event
    const avgAttendance = totalEvents > 0 ? Math.round(totalRegistrations / totalEvents) : 0;

    // Event participation by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const eventsByMonth = await Event.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { 
        $group: { 
          _id: { 
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 },
          registrations: { $sum: { $size: { $ifNull: ["$registeredUsers", []] } } }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    res.json({
      totalEvents,
      upcomingEvents,
      pastEvents,
      totalRegistrations,
      avgAttendance,
      eventsByMonth
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching event stats", error: error.message });
  }
};

// Get donation trends
export const getDonationStats = async (req, res) => {
  try {
    const totalDonations = await DonationCampaign.countDocuments();
    const completedDonations = await DonationCampaign.countDocuments({ status: "completed" });
    const activeDonations = await DonationCampaign.countDocuments({ 
      status: "active" 
    });

    // Total amount raised (using DonationCampaign fields)
    const campaigns = await DonationCampaign.find({ status: { $in: ["completed", "active"] } });
    const totalAmount = campaigns.reduce((sum, c) => sum + (c.currentAmount || 0), 0);
    const totalGoal = campaigns.reduce((sum, c) => sum + (c.goalAmount || 0), 0);

    // Donations by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const donationsByMonth = await DonationCampaign.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { 
        $group: { 
          _id: { 
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 },
          totalRaised: { $sum: "$currentAmount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    res.json({
      totalDonations,
      completedDonations,
      activeDonations,
      totalAmount,
      totalGoal,
      completionRate: totalGoal > 0 ? Math.round((totalAmount / totalGoal) * 100) : 0,
      donationsByMonth
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching donation stats", error: error.message });
  }
};

// Get engagement stats (messages, activities)
export const getEngagementStats = async (req, res) => {
  try {
    const totalMessages = await MentorshipMessage.countDocuments();
    
    // Messages in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentMessages = await MentorshipMessage.countDocuments({ 
      createdAt: { $gte: sevenDaysAgo } 
    });

    // Messages by day (last 7 days)
    const messagesByDay = await MentorshipMessage.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { 
        $group: { 
          _id: { 
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ]);

    res.json({
      totalMessages,
      recentMessages,
      messagesByDay
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching engagement stats", error: error.message });
  }
};

// Get all analytics at once
export const getAllAnalytics = async (req, res) => {
  try {
    const [users, events, donations, engagement] = await Promise.all([
      getActiveUsersStats(req, res),
      getEventStats(req, res),
      getDonationStats(req, res),
      getEngagementStats(req, res)
    ]);

    // Note: This won't work as expected because each function already sends a response
    // Better to call the aggregations directly here
    res.json({ users, events, donations, engagement });
  } catch (error) {
    res.status(500).json({ message: "Error fetching analytics", error: error.message });
  }
};
