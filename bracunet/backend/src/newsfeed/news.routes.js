// import express from "express";
// import {
//   createNews,
//   getAllNews,
//   getNewsById,
//   updateNewsStatus,
//   deleteNews,
// } from "./news.service.js";
// import { protect, authorize } from "../middleware/auth.js";

// const router = express.Router();

// /**
//  * POST /api/news
//  * Logged-in user news submit করবে (status = pending)
//  */
// router.post("/", protect, async (req, res) => {
//   try {
//     const news = await createNews({
//       title: req.body.title,
//       body: req.body.body,
//       image: req.body.image,
//       category: req.body.category || "announcement",
//       createdBy: req.user._id,
//     });

//     res.status(201).json({ success: true, news });
//   } catch (err) {
//     console.error("Create news error:", err);
//     res
//       .status(500)
//       .json({ success: false, message: "Failed to create news" });
//   }
// });

// /**
//  * GET /api/news
//  * Public newsfeed – only approved items, category filter সহ
//  */
// router.get("/", async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 20;
//     const category = req.query.category || "all";

//     const result = await getAllNews({ page, limit, category });

//     res.status(200).json(result);
//   } catch (err) {
//     console.error("Get news error:", err);
//     res
//       .status(500)
//       .json({ success: false, message: "Cannot fetch news" });
//   }
// });

// /**
//  * GET /api/news/:id
//  * Single news details
//  */
// router.get("/:id", async (req, res) => {
//   try {
//     const news = await getNewsById(req.params.id);
//     if (!news) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Not found" });
//     }
//     res.status(200).json({ success: true, news });
//   } catch (err) {
//     res
//       .status(500)
//       .json({ success: false, message: "Cannot fetch news item" });
//   }
// });

// /**
//  * PATCH /api/news/:id/status
//  * Admin approve / reject
//  */
// router.patch(
//   "/:id/status",
//   protect,
//   authorize("admin"),
//   async (req, res) => {
//     try {
//       const { status } = req.body;
//       if (!["approved", "rejected"].includes(status)) {
//         return res
//           .status(400)
//           .json({ success: false, message: "Invalid status" });
//       }

//       const news = await updateNewsStatus(req.params.id, status);
//       if (!news) {
//         return res
//           .status(404)
//           .json({ success: false, message: "Not found" });
//       }

//       res.json({ success: true, news });
//     } catch (err) {
//       res
//         .status(500)
//         .json({ success: false, message: "Failed to update status" });
//     }
//   }
// );

// /**
//  * DELETE /api/news/:id
//  * Optional – admin delete
//  */
// router.delete(
//   "/:id",
//   protect,
//   authorize("admin"),
//   async (req, res) => {
//     try {
//       await deleteNews(req.params.id);
//       res.json({ success: true, message: "News deleted" });
//     } catch (err) {
//       res
//         .status(500)
//         .json({ success: false, message: "Delete failed" });
//     }
//   }
// );

// export default router;




// backend/src/newsfeed/news.routes.js
import { Router } from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  createNews,
  getAllNews,
  getMyNews,
  getNewsById,
  updateNewsStatus,
  deleteNews,
} from "./news.service.js";

const router = Router();

/**
 * GET /api/news
 * Public feed -> only APPROVED posts
 */
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const category = req.query.category || "all";

    const result = await getAllNews({ page, limit, category });
    res.status(200).json(result);
  } catch (err) {
    console.error("Get news error:", err);
    res
      .status(500)
      .json({ success: false, message: "Cannot fetch news" });
  }
});

/**
 * GET /api/news/me/mine
 * Current user's ALL posts (pending + approved + rejected)
 */
router.get("/me/mine", protect, async (req, res) => {
  try {
    const items = await getMyNews(req.user._id);
    res.status(200).json({ success: true, items });
  } catch (err) {
    console.error("Get my news error:", err);
    res
      .status(500)
      .json({ success: false, message: "Cannot fetch my posts" });
  }
});

/**
 * POST /api/news
 * Create new post (status default "pending" from model)
 */
router.post("/", protect, async (req, res) => {
  try {
    const data = {
      title: req.body.title,
      body: req.body.body,
      category: req.body.category || "announcement",
      image: req.body.image || null,
      createdBy: req.user._id,
    };

    const news = await createNews(data);
    res.status(201).json({ success: true, news });
  } catch (err) {
    console.error("Create news error:", err);
    res
      .status(500)
      .json({ success: false, message: "Cannot create news" });
  }
});

/**
 * GET /api/news/:id
 * Single news details
 */
router.get("/:id", async (req, res) => {
  try {
    const news = await getNewsById(req.params.id);
    if (!news) {
      return res
        .status(404)
        .json({ success: false, message: "Not found" });
    }
    res.status(200).json({ success: true, news });
  } catch (err) {
    console.error("Get news by id error:", err);
    res
      .status(500)
      .json({ success: false, message: "Cannot fetch news item" });
  }
});

/**
 * PATCH /api/news/:id/status
 * Admin approves / rejects / sets pending
 * body: { status: "approved" | "rejected" | "pending" }
 */
router.patch("/:id/status", protect, authorize("admin"), async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending", "approved", "rejected"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    const updated = await updateNewsStatus(req.params.id, status);
    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Not found" });
    }

    res.status(200).json({ success: true, news: updated });
  } catch (err) {
    console.error("Update status error:", err);
    res
      .status(500)
      .json({ success: false, message: "Cannot update status" });
  }
});

/**
 * DELETE /api/news/:id
 * Owner OR admin can delete
 */
router.delete("/:id", protect, async (req, res) => {
  try {
    const news = await getNewsById(req.params.id);
    if (!news) {
      return res
        .status(404)
        .json({ success: false, message: "Not found" });
    }

    const isOwner =
      String(news.createdBy._id || news.createdBy) ===
      String(req.user._id);
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ success: false, message: "Not allowed" });
    }

    await deleteNews(req.params.id);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Delete news error:", err);
    res
      .status(500)
      .json({ success: false, message: "Cannot delete news" });
  }
});

export default router;
