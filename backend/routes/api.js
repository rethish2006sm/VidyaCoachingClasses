import express from "express";
import {
  verifyAdminCredentials,
  updateAdminPassword,
} from "../lib/adminStore.js";
import {
  convertGalleryImageForStorage,
  convertImageForStorage,
} from "../lib/imageProcessing.js";

const createApiRouter = (models) => {
  const {
    Course,
    Result,
    LeaderboardEntry,
    GalleryImage,
    OfferImage,
    Subject,
    Student,
    Inquiry,
  } = models;

  const router = express.Router();

  const requireAdmin = async (req, res, next) => {
    const username =
      req.headers["x-admin-username"] || req.body?.username || req.query?.username;
    const password =
      req.headers["x-admin-password"] ||
      req.body?.password ||
      req.query?.password;
    try {
      const valid = await verifyAdminCredentials(username, password);
      if (!valid) {
        return res
          .status(401)
          .json({ message: "Missing or invalid admin credentials." });
      }
      return next();
    } catch (error) {
      return handleError(res, error);
    }
  };

  router.post("/admin/login", async (req, res) => {
    const { username, password } = req.body || {};
    try {
      const valid = await verifyAdminCredentials(username, password);
      if (!valid) {
        return res.status(401).json({ message: "Invalid admin username or password." });
      }
      return res.json({ message: "Authenticated" });
    } catch (error) {
      return handleError(res, error);
    }
  });

  router.post("/admin/password", requireAdmin, async (req, res) => {
    const { currentPassword, newPassword } = req.body || {};
    if (!newPassword) {
      return res.status(400).json({ message: "New password is required." });
    }
    const oldPassword =
      req.headers["x-admin-password"] ||
      req.body?.password ||
      req.body?.currentPassword;
    if (currentPassword && oldPassword && currentPassword !== oldPassword) {
      return res.status(400).json({ message: "Current password mismatch." });
    }
    try {
      await updateAdminPassword(newPassword);
      return res.json({ message: "Password updated." });
    } catch (error) {
      return handleError(res, error);
    }
  });

  const handleError = (res, error) => {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong.", detail: error.message });
  };

  const normalizeCategory = (value) => {
    if (typeof value !== "string") return "General";
    return value.trim() || "General";
  };

  router.get("/courses", async (req, res) => {
    try {
      const filter = {};
      if (req.query.section) filter.section = req.query.section;
      if (req.query.board) filter.board = req.query.board;
      if (req.query.level) filter.level = req.query.level;
      if (req.query.scope) {
        const scope = req.query.scope;
        const visibilityValues = [];
        if (scope === "home" || scope === "both") {
          visibilityValues.push({ visibility: { $in: ["home", "both"] } });
        }
        if (scope === "course" || scope === "both") {
          visibilityValues.push({ visibility: { $in: ["course", "both"] } });
        }
        const fallback = [];
        if (scope === "home") {
          fallback.push({ visibility: { $exists: false }, showOnHome: true });
        }
        if (scope === "course") {
          fallback.push({ visibility: { $exists: false }, showOnHome: { $ne: true } });
        }
        if (!visibilityValues.length && scope === "both") {
          visibilityValues.push({ visibility: { $exists: false } });
        }
        const combined = [...visibilityValues, ...fallback].filter(Boolean);
        if (combined.length) {
          filter.$or = combined;
        }
      }
      const courses = await Course.find(filter).sort({ updatedAt: -1 });
      res.json(courses);
    } catch (error) {
      handleError(res, error);
    }
  });

  router.get("/courses/:id", async (req, res) => {
    try {
      const course = await Course.findById(req.params.id);
      if (!course) {
        return res.status(404).json({ message: "Course not found." });
      }
      res.json(course);
    } catch (error) {
      handleError(res, error);
    }
  });

  router.post("/courses", requireAdmin, async (req, res) => {
    try {
      const course = await Course.create(req.body);
      res.status(201).json(course);
    } catch (error) {
      handleError(res, error);
    }
  });

  router.put("/courses/:id", requireAdmin, async (req, res) => {
    try {
      const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!course) {
        return res.status(404).json({ message: "Course not found." });
      }
      res.json(course);
    } catch (error) {
      handleError(res, error);
    }
  });

  router.delete("/courses/:id", requireAdmin, async (req, res) => {
    try {
      await Course.findByIdAndDelete(req.params.id);
      res.json({ message: "Course deleted." });
    } catch (error) {
      handleError(res, error);
    }
  });

  router.get("/results", async (req, res) => {
    try {
      const filter = {};
      if (req.query.year) filter.year = Number(req.query.year);
      if (req.query.standard) filter.standard = req.query.standard;
      if (req.query.board) filter.board = req.query.board;
      if (req.query.showOnHome !== undefined) {
        filter.showOnHome = req.query.showOnHome === "true";
      }
      const results = await Result.find(filter).sort({ percentage: -1 });
      res.json(results);
    } catch (error) {
      handleError(res, error);
    }
  });

  router.post("/results", requireAdmin, async (req, res) => {
    try {
      const payload = { ...req.body };
      if (payload.profileImage) {
        payload.profileImage = await convertImageForStorage(payload.profileImage);
      }
      const result = await Result.create(payload);
      res.status(201).json(result);
    } catch (error) {
      handleError(res, error);
    }
  });

  router.put("/results/:id", requireAdmin, async (req, res) => {
    try {
      const updates = { ...req.body };
      if (updates.profileImage) {
        updates.profileImage = await convertImageForStorage(updates.profileImage);
      }
      const result = await Result.findByIdAndUpdate(req.params.id, updates, {
        new: true,
        runValidators: true,
      });
      if (!result) {
        return res.status(404).json({ message: "Result not found." });
      }
      res.json(result);
    } catch (error) {
      handleError(res, error);
    }
  });

  router.delete("/results/:id", requireAdmin, async (req, res) => {
    try {
      await Result.findByIdAndDelete(req.params.id);
      res.json({ message: "Result deleted." });
    } catch (error) {
      handleError(res, error);
    }
  });

  router.get("/leaderboard", async (req, res) => {
    try {
      const filter = {};
      if (req.query.category) filter.category = req.query.category;
      if (req.query.branch) filter.branch = req.query.branch;
      if (req.query.year) filter.year = Number(req.query.year);
      const board = await LeaderboardEntry.find(filter).sort({ score: -1, rank: 1 });
      res.json(board);
    } catch (error) {
      handleError(res, error);
    }
  });

  router.post("/leaderboard", requireAdmin, async (req, res) => {
    try {
      const entry = await LeaderboardEntry.create(req.body);
      res.status(201).json(entry);
    } catch (error) {
      handleError(res, error);
    }
  });

  router.delete("/leaderboard", requireAdmin, async (req, res) => {
    try {
      const filter = {};
      if (req.query.standard) {
        filter.standard = req.query.standard;
      }
      if (req.query.branch) {
        filter.branch = req.query.branch;
      }
      const result = await LeaderboardEntry.deleteMany(filter);
      res.json({
        message: "Leaderboard entries deleted.",
        deletedCount: result.deletedCount,
      });
    } catch (error) {
      handleError(res, error);
    }
  });

  router.delete("/leaderboard/:id", requireAdmin, async (req, res) => {
    try {
      await LeaderboardEntry.findByIdAndDelete(req.params.id);
      res.json({ message: "Leaderboard entry deleted." });
    } catch (error) {
      handleError(res, error);
    }
  });

  router.get("/gallery", async (req, res) => {
    try {
      const filter = {};
      if (req.query.category) filter.category = req.query.category;
      if (req.query.featured !== undefined) {
        filter.featured = req.query.featured === "true";
      }
      const images = await GalleryImage.find(filter).sort({ createdAt: -1 });
      res.json(images);
    } catch (error) {
      handleError(res, error);
    }
  });

  router.post("/gallery", requireAdmin, async (req, res) => {
    try {
      const payload = { ...req.body };
      if (payload.imageUrl) {
        payload.imageUrl = await convertGalleryImageForStorage(payload.imageUrl);
      }
      const image = await GalleryImage.create(payload);
      res.status(201).json(image);
    } catch (error) {
      handleError(res, error);
    }
  });

  router.get("/gallery/categories", async (req, res) => {
    try {
      const categories = await GalleryImage.aggregate([
        {
          $group: {
            _id: { $ifNull: ["$category", "General"] },
            coverImage: { $first: "$imageUrl" },
            coverTitle: { $first: "$title" },
            count: { $sum: 1 },
            featuredCount: {
              $sum: {
                $cond: [{ $eq: ["$featured", true] }, 1, 0],
              },
            },
          },
        },
        {
          $project: {
            name: "$_id",
            coverImage: 1,
            coverTitle: 1,
            count: 1,
            featuredCount: 1,
          },
        },
        { $sort: { name: 1 } },
      ]);
      res.json(categories);
    } catch (error) {
      handleError(res, error);
    }
  });

  router.put("/gallery/:id", requireAdmin, async (req, res) => {
    try {
      const allowed = ["title", "category", "description", "featured", "imageUrl"];
      const updates = {};
      allowed.forEach((field) => {
        if (Object.prototype.hasOwnProperty.call(req.body, field)) {
          updates[field] =
            field === "category" ? normalizeCategory(req.body[field]) : req.body[field];
        }
      });
      if (updates.imageUrl) {
        updates.imageUrl = await convertGalleryImageForStorage(updates.imageUrl);
      }
      const image = await GalleryImage.findByIdAndUpdate(req.params.id, updates, {
        new: true,
        runValidators: true,
      });
      if (!image) {
        return res.status(404).json({ message: "Gallery image not found." });
      }
      res.json(image);
    } catch (error) {
      handleError(res, error);
    }
  });

  router.post("/gallery/batch", requireAdmin, async (req, res) => {
    try {
      const images = Array.isArray(req.body.images) ? req.body.images : [];
      if (!images.length) {
        return res.status(400).json({ message: "Provide at least one gallery image." });
      }
      const payload = await Promise.all(
        images.map(async (item) => ({
          title: item.title?.trim() || "Gallery image",
          category: normalizeCategory(item.category),
          description: item.description,
          imageUrl: await convertGalleryImageForStorage(item.imageUrl),
          featured: item.featured === true,
        })),
      );
      const created = await GalleryImage.insertMany(payload);
      res.status(201).json(created);
    } catch (error) {
      handleError(res, error);
    }
  });

  router.delete("/gallery/:id", requireAdmin, async (req, res) => {
    try {
      await GalleryImage.findByIdAndDelete(req.params.id);
      res.json({ message: "Gallery image deleted." });
    } catch (error) {
      handleError(res, error);
    }
  });

  router.delete("/gallery/categories/:category", requireAdmin, async (req, res) => {
    try {
      const categoryName = decodeURIComponent(req.params.category || "");
      if (!categoryName) {
        return res.status(400).json({ message: "Category name required." });
      }
      const result = await GalleryImage.deleteMany({ category: categoryName });
      res.json({
        message: `Deleted ${result.deletedCount} image(s) from ${categoryName}.`,
        deletedCount: result.deletedCount,
      });
    } catch (error) {
      handleError(res, error);
    }
  });

  router.put("/gallery/categories/:category", requireAdmin, async (req, res) => {
    try {
      const categoryName = decodeURIComponent(req.params.category || "");
      if (!categoryName) {
        return res.status(400).json({ message: "Category name required." });
      }
      const newName = normalizeCategory(req.body.newName);
      if (!newName) {
        return res.status(400).json({ message: "New category name required." });
      }
      const result = await GalleryImage.updateMany(
        { category: categoryName },
        { category: newName },
      );
      res.json({
        message: `Renamed ${result.modifiedCount} image(s) to ${newName}.`,
        modifiedCount: result.modifiedCount,
      });
    } catch (error) {
      handleError(res, error);
    }
  });

  router.get("/offers", async (req, res) => {
    try {
      const filter = {};
      if (req.query.active !== undefined) {
        filter.isActive = req.query.active === "true";
      }
      const offers = await OfferImage.find(filter).sort({ createdAt: -1 });
      res.json(offers);
    } catch (error) {
      handleError(res, error);
    }
  });

  router.post("/offers", requireAdmin, async (req, res) => {
    try {
      const payload = { ...req.body };
      if (payload.imageUrl) {
        payload.imageUrl = await convertImageForStorage(payload.imageUrl);
      }
      const offer = await OfferImage.create(payload);
      res.status(201).json(offer);
    } catch (error) {
      handleError(res, error);
    }
  });

  router.post("/inquiries", async (req, res) => {
    try {
      const { name, email, phone, applyingFor, course, learningGoals } = req.body || {};
      if (!name || !email || !phone) {
        return res
          .status(400)
          .json({ message: "Name, email, and phone are required for inquiries." });
      }
      const inquiry = await Inquiry.create({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        applyingFor: applyingFor?.trim() || "",
        course: course?.trim() || "",
        learningGoals: learningGoals?.trim() || "",
      });
      res.status(201).json(inquiry);
    } catch (error) {
      handleError(res, error);
    }
  });

  router.get("/inquiries", requireAdmin, async (req, res) => {
    try {
      const inquiries = await Inquiry.find().sort({ createdAt: -1 });
      res.json(inquiries);
    } catch (error) {
      handleError(res, error);
    }
  });

  router.delete("/inquiries/:id", requireAdmin, async (req, res) => {
    try {
      await Inquiry.findByIdAndDelete(req.params.id);
      res.json({ message: "Inquiry deleted." });
    } catch (error) {
      handleError(res, error);
    }
  });

  router.delete("/offers/:id", requireAdmin, async (req, res) => {
    try {
      await OfferImage.findByIdAndDelete(req.params.id);
      res.json({ message: "Offer removed." });
    } catch (error) {
      handleError(res, error);
    }
  });

  router.get("/subjects", async (req, res) => {
    try {
      const subjects = await Subject.find().sort({ name: 1 });
      res.json(subjects);
    } catch (error) {
      handleError(res, error);
    }
  });

  router.post("/subjects", requireAdmin, async (req, res) => {
    try {
      const subject = await Subject.create(req.body);
      res.status(201).json(subject);
    } catch (error) {
      handleError(res, error);
    }
  });

  router.delete("/subjects/:id", requireAdmin, async (req, res) => {
    try {
      await Subject.findByIdAndDelete(req.params.id);
      res.json({ message: "Subject removed." });
    } catch (error) {
      handleError(res, error);
    }
  });

  router.get("/students", async (req, res) => {
    try {
      const filter = {};
      if (req.query.standard) {
        filter.standard = req.query.standard;
      }
      if (req.query.batchYear) {
        filter.batchYear = Number(req.query.batchYear);
      }
      const students = await Student.find(filter).sort({ batchYear: -1, createdAt: -1 });
      res.json(students);
    } catch (error) {
      handleError(res, error);
    }
  });

  router.post("/students", requireAdmin, async (req, res) => {
    try {
      const studentData = { ...req.body };
      if (studentData.photoUrl) {
        studentData.photoUrl = await convertImageForStorage(studentData.photoUrl);
      }
      const student = await Student.create(studentData);
      res.status(201).json(student);
    } catch (error) {
      handleError(res, error);
    }
  });

  router.delete("/students/bulk", requireAdmin, async (req, res) => {
    try {
      const { standard, batchYear } = req.query;
      const filter = {};
      if (standard) {
        filter.standard = standard;
      }
      if (batchYear) {
        const parsedYear = Number(batchYear);
        if (!Number.isFinite(parsedYear)) {
          return res.status(400).json({ message: "Batch year must be a number." });
        }
        filter.batchYear = parsedYear;
      }
      if (!Object.keys(filter).length) {
        return res.status(400).json({
          message: "Provide at least a standard or batch year to delete students.",
        });
      }
      const result = await Student.deleteMany(filter);
      res.json({
        message:
          result.deletedCount > 0
            ? `${result.deletedCount} students removed.`
            : "No students matched the filter.",
        deletedCount: result.deletedCount,
      });
    } catch (error) {
      handleError(res, error);
    }
  });

  router.put("/students/:id", requireAdmin, async (req, res) => {
    try {
      const updates = { ...req.body };
      if (updates.photoUrl) {
        updates.photoUrl = await convertImageForStorage(updates.photoUrl);
      }
      const student = await Student.findByIdAndUpdate(req.params.id, updates, {
        new: true,
        runValidators: true,
      });
      if (!student) {
        return res.status(404).json({ message: "Student not found." });
      }
      res.json(student);
    } catch (error) {
      handleError(res, error);
    }
  });

  router.delete("/students/:id", requireAdmin, async (req, res) => {
    try {
      await Student.findByIdAndDelete(req.params.id);
      res.json({ message: "Student deleted." });
    } catch (error) {
      handleError(res, error);
    }
  });

  return router;
};

export default createApiRouter;
