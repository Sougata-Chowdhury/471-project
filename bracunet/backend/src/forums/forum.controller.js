// import Group from "../forums/Group.js"; // mongoose model

// // Create new group
// export const createGroup = async (req, res) => {
//   try {
//     const { name, topic, description } = req.body;
//     if (!name || !topic) return res.status(400).json({ message: "Name and topic are required" });

//     const newGroup = new Group({ name, topic, description });
//     await newGroup.save();
//     res.status(201).json({ success: true, data: newGroup });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };
