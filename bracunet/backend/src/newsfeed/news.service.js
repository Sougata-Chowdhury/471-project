


import News from "./news.model.js";
import { trackActivity } from '../gamification/gamification.service.js';

export const createNews = async (data) => {
  const news = await News.create(data);
  
  // Track activity: creating a news post
  try {
    await trackActivity(data.createdBy, 'newsPosts', 1, 10);
  } catch (error) {
    console.error('Error tracking news post activity:', error);
  }
  
  return news;
};

/**
 * getAllNews
 * - default (status undefined): sudhu approved (public use)
 * - jodi status param pathano hoy (pending/approved/rejected/all) then shetai use
 */
export const getAllNews = async ({ page, limit, category, status }) => {
  const filter = {};

  if (!status) {
    // kono status param nai -> public default
    filter.status = "approved";
  } else if (status === "all") {
    // admin chay sob status -> kono status filter dibo na
  } else if (["pending", "approved", "rejected"].includes(status)) {
    filter.status = status;
  }

  if (category && category !== "all") {
    filter.category = category;
  }

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    News.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "name role"),
    News.countDocuments(filter),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

// Admin helper (keeps older API intact)
export const getAllNewsForAdmin = async ({ page, limit, category, status }) => {
  const filter = {};

  if (status && status !== "all") {
    filter.status = status;
  }

  if (category && category !== "all") {
    filter.category = category;
  }

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    News.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "name role profilePicture"),
    News.countDocuments(filter),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const getMyNews = async (userId) => {
  return await News.find({ createdBy: userId })
    .sort({ createdAt: -1 })
    .populate("createdBy", "name role profilePicture");
};

export const getNewsById = async (id) => {
  return await News.findById(id).populate("createdBy", "name role profilePicture");
};

export const updateNewsStatus = async (id, status) => {
  const news = await News.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );
  
  // Award bonus points when news is approved
  if (status === 'approved' && news) {
    try {
      await trackActivity(news.createdBy, 'newsPosts', 0, 15); // Bonus 15 points for approval
    } catch (error) {
      console.error('Error tracking news approval:', error);
    }
  }
  
  return news;
};

export const deleteNews = async (id) => {
  return await News.findByIdAndDelete(id);
};
