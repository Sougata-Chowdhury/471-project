import Announcement from "./announcement.model.js";

export const createAnnouncement = async (req, res) => {
  const { mentorshipId, title, description, type, scheduledDate, link } = req.body;

  if (!mentorshipId || !title || !description) {
    return res
      .status(400)
      .json({ message: "mentorshipId, title, and description are required" });
  }

  try {
    const announcement = await Announcement.create({
      mentorship: mentorshipId,
      mentor: req.user.id,
      title,
      description,
      type: type || "general",
      scheduledDate: scheduledDate || null,
      link: link || null,
    });

    const populated = await announcement.populate([
      { path: "mentor", select: "name" },
      { path: "mentorship" },
    ]);

    res.status(201).json(populated);
  } catch (error) {
    console.error("Error creating announcement:", error);
    res
      .status(500)
      .json({ message: "Error creating announcement", error: error.message });
  }
};

export const getAnnouncements = async (req, res) => {
  const { mentorshipId } = req.params;

  try {
    const announcements = await Announcement.find({ mentorship: mentorshipId })
      .sort({ createdAt: -1 })
      .populate({ path: "mentor", select: "name" });

    res.json(announcements);
  } catch (error) {
    console.error("Error fetching announcements:", error);
    res
      .status(500)
      .json({ message: "Error fetching announcements", error: error.message });
  }
};

export const deleteAnnouncement = async (req, res) => {
  const { announcementId } = req.params;

  try {
    const announcement = await Announcement.findById(announcementId);

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    if (String(announcement.mentor) !== String(req.user.id)) {
      return res
        .status(403)
        .json({ message: "Only the mentor can delete this announcement" });
    }

    await Announcement.findByIdAndDelete(announcementId);
    res.json({ message: "Announcement deleted" });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    res
      .status(500)
      .json({ message: "Error deleting announcement", error: error.message });
  }
};
