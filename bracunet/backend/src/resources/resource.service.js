import Resource from './resource.model.js';

export const uploadResource = async (resourceData, userId) => {
  const resource = new Resource({
    ...resourceData,
    uploadedBy: userId,
    isApproved: false,
  });
  return await resource.save();
};

export const getAllResources = async (filters = {}, page = 1, limit = 12) => {
  const skip = (page - 1) * limit;
  const query = { isApproved: true, ...filters };
  
  const resources = await Resource.find(query)
    .populate('uploadedBy', 'name email role')
    .populate('approvedBy', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
    
  const total = await Resource.countDocuments(query);
  
  return { resources, totalPages: Math.ceil(total / limit), currentPage: page, total };
};

export const getPendingResources = async (page = 1, limit = 12) => {
  const skip = (page - 1) * limit;
  const resources = await Resource.find({ isApproved: false })
    .populate('uploadedBy', 'name email role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
    
  const total = await Resource.countDocuments({ isApproved: false });
  return { resources, totalPages: Math.ceil(total / limit), currentPage: page, total };
};

export const getResourceById = async (resourceId, userId = null) => {
  const resource = await Resource.findById(resourceId)
    .populate('uploadedBy', 'name email role')
    .populate('approvedBy', 'name email')
    .populate('comments.author', 'name email role');
    
  if (!resource) return null;
  
  if (userId && !resource.viewedBy.includes(userId)) {
    resource.viewedBy.push(userId);
    resource.views = resource.viewedBy.length;
    await resource.save();
  }
  return resource;
};

export const upvoteResource = async (resourceId, userId) => {
  const resource = await Resource.findById(resourceId);
  if (!resource) throw new Error('Resource not found');
  
  if (resource.upvotedBy.includes(userId)) {
    resource.upvotedBy = resource.upvotedBy.filter(id => id.toString() !== userId);
    resource.upvotes = Math.max(0, resource.upvotes - 1);
  } else {
    resource.upvotedBy.push(userId);
    resource.upvotes += 1;
  }
  return await resource.save();
};

export const trackDownload = async (resourceId, userId) => {
  const resource = await Resource.findById(resourceId);
  if (!resource) throw new Error('Resource not found');
  
  if (!resource.downloadedBy.includes(userId)) {
    resource.downloadedBy.push(userId);
    resource.downloads = resource.downloadedBy.length;
    await resource.save();
  }
  return resource;
};

export const addComment = async (resourceId, commentData, userId) => {
  const resource = await Resource.findById(resourceId);
  if (!resource) throw new Error('Resource not found');
  
  resource.comments.push({
    author: userId,
    text: commentData.text,
    createdAt: new Date(),
  });
  return await resource.save();
};

export const approveResource = async (resourceId, userId) => {
  const resource = await Resource.findById(resourceId);
  if (!resource) throw new Error('Resource not found');
  
  resource.isApproved = true;
  resource.approvedBy = userId;
  resource.approvedAt = new Date();
  return await resource.save();
};
