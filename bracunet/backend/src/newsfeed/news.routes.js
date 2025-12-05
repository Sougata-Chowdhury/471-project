
// // backend/src/newsfeed/news.routes.js
// import { Router } from "express";
// import { protect, authorize } from "../middleware/auth.js";
// import {
//   createNews,
//   getAllNews,
//   getMyNews,
//   getNewsById,
//   updateNewsStatus,
//   deleteNews,
// } from "./news.service.js";

// const router = Router();
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


// router.get("/me/mine", protect, async (req, res) => {
//   try {
//     const items = await getMyNews(req.user._id);
//     res.status(200).json({ success: true, items });
//   } catch (err) {
//     console.error("Get my news error:", err);
//     res
//       .status(500)
//       .json({ success: false, message: "Cannot fetch my posts" });
//   }
// });


// router.post("/", protect, async (req, res) => {
//   try {
//     const data = {
//       title: req.body.title,
//       body: req.body.body,
//       category: req.body.category || "announcement",
//       image: req.body.image || null,
//       createdBy: req.user._id,
//     };

//     const news = await createNews(data);
//     res.status(201).json({ success: true, news });
//   } catch (err) {
//     console.error("Create news error:", err);
//     res
//       .status(500)
//       .json({ success: false, message: "Cannot create news" });
//   }
// });


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
//     console.error("Get news by id error:", err);
//     res
//       .status(500)
//       .json({ success: false, message: "Cannot fetch news item" });
//   }
// });


// router.patch("/:id/status", protect, authorize("admin"), async (req, res) => {
//   try {
//     const { status } = req.body;
//     if (!["pending", "approved", "rejected"].includes(status)) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid status" });
//     }

//     const updated = await updateNewsStatus(req.params.id, status);
//     if (!updated) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Not found" });
//     }

//     res.status(200).json({ success: true, news: updated });
//   } catch (err) {
//     console.error("Update status error:", err);
//     res
//       .status(500)
//       .json({ success: false, message: "Cannot update status" });
//   }
// });


// router.delete("/:id", protect, async (req, res) => {
//   try {
//     const news = await getNewsById(req.params.id);
//     if (!news) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Not found" });
//     }

//     const isOwner =
//       String(news.createdBy._id || news.createdBy) ===
//       String(req.user._id);
//     const isAdmin = req.user.role === "admin";

//     if (!isOwner && !isAdmin) {
//       return res
//         .status(403)
//         .json({ success: false, message: "Not allowed" });
//     }

//     await deleteNews(req.params.id);
//     res.status(200).json({ success: true });
//   } catch (err) {
//     console.error("Delete news error:", err);
//     res
//       .status(500)
//       .json({ success: false, message: "Cannot delete news" });
//   }
// });

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
 * Public: only approved by default
 * Admin: can pass ?status=pending|approved|rejected|all
 */
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const category = req.query.category || "all";
    const status = req.query.status || undefined; // optional

    const result = await getAllNews({ page, limit, category, status });
    res.status(200).json(result);
  } catch (err) {
    console.error("Get news error:", err);
    res
      .status(500)
      .json({ success: false, message: "Cannot fetch news" });
  }
});

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
