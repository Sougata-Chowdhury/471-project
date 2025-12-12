


import News from "./news.model.js";

export const createNews = async (data) => {
  return await News.create(data);
};


export const getAllNews = async ({ page, limit, category, status }) => {
  const filter = {};

  if (!status) {
    filter.status = "approved";
  } else if (status === "all") {
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
