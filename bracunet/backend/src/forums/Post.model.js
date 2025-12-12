// import mongoose from "mongoose";

// const commentSchema = new mongoose.Schema({
//   user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//   body: { type: String, required: true },
// }, { timestamps: true });

// const postSchema = new mongoose.Schema(
//   {
//     group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
//     user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     body: { type: String, required: true },
//     comments: [commentSchema],
//     reactions: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
//   },
//   { timestamps: true }
// );

// export const Post = mongoose.model("Post", postSchema);

import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

const postSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    group: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    comments: [commentSchema],
    reactions: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export default mongoose.model("Post", postSchema);
