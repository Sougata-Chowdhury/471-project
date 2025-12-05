

// import News from "./news.model.js";

// export const createNews = async (data) => {
//   return await News.create(data);
// };
// export const getAllNews = async ({ page, limit, category }) => {
//   const filter = { status: "approved" };

//   if (category && category !== "all") {
//     filter.category = category;
//   }

//   const skip = (page - 1) * limit;

//   const [items, total] = await Promise.all([
//     News.find(filter)
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit)
//       .populate("createdBy", "name role"),
//     News.countDocuments(filter),
//   ]);

//   return {
//     items,
//     total,
//     page,
//     limit,
//     totalPages: Math.ceil(total / limit),
//   };
// };


// export const getMyNews = async (userId) => {
//   return await News.find({ createdBy: userId })
//     .sort({ createdAt: -1 })
//     .populate("createdBy", "name role");
// };

// export const getNewsById = async (id) => {
//   return await News.findById(id).populate("createdBy", "name role");
// };


// export const updateNewsStatus = async (id, status) => {
//   return await News.findByIdAndUpdate(
//     id,
//     { status },
//     { new: true }
//   );
// };

// export const deleteNews = async (id) => {
//   return await News.findByIdAndDelete(id);
// };


// backend/src/newsfeed/news.service.js
import News from "./news.model.js";

export const createNews = async (data) => {
  return await News.create(data);
};

/**
 * getAllNews
 * - if `status` is omitted -> public default returns only approved posts
 * - if `status` is provided and is 'all' -> returns all statuses
 * - otherwise returns posts matching the provided status
 */
export const getAllNews = async ({ page, limit, category, status }) => {
  const filter = {};

  if (!status) {
    filter.status = "approved"; // public default
  } else if (status !== "all" && ["pending", "approved", "rejected"].includes(status)) {
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

export const getMyNews = async (userId) => {
  return await News.find({ createdBy: userId })
    .sort({ createdAt: -1 })
    .populate("createdBy", "name role");
};

export const getNewsById = async (id) => {
  return await News.findById(id).populate("createdBy", "name role");
};

export const updateNewsStatus = async (id, status) => {
  return await News.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );
};

export const deleteNews = async (id) => {
  return await News.findByIdAndDelete(id);
};
