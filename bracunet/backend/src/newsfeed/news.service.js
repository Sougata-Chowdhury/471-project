import News from "./news.model.js";

export const createNews = async (data) => {
  return await News.create(data); // status default "pending"
};

export const getAllNews = async ({ page, limit, category }) => {
  const filter = { status: "approved" };

  if (category && category !== "all") {
    filter.category = category;
  }

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    News.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
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

export const getNewsById = async (id) => {
  return await News.findById(id);
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
