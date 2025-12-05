

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
 * - default (status undefined): sudhu approved (public use)
 * - jodi status param pathano hoy (pending/approved/rejected/all) then shetai use
 */
export const getAllNews = async ({ page, limit, category, status }) => {
  const filter = {};

  // status handling
  if (!status) {
    // kono status param nai -> public default
    filter.status = "approved";
  } else if (status === "all") {
    // admin chay sob status -> kono status filter dibo na
  } else if (["pending", "approved", "rejected"].includes(status)) {
    filter.status = status;
  
  }

  // category handling
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
