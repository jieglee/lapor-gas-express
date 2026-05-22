import express from "express";
import * as report from "../controllers/report.controller.js";
import Middleware from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";
import allowRoles from "../middlewares/role.guard.js";
import OnlyOwnerReport from "../middlewares/owner.guard.js";

const router = express.Router();

router.get("/", report.handleGetReports);
router.get("/:id", report.handleGetReportById);

// upload.array("images", 5) — terima max 5 file dengan field name "images"
router.post("/", Middleware, upload.array("images", 5), report.handleCreateReport);

router.put("/:id", Middleware, OnlyOwnerReport, report.handleUpdateReport);
router.delete("/:id", Middleware, OnlyOwnerReport, report.handleDeleteReport);
router.patch("/:id/status", Middleware, allowRoles("admin", "superadmin"), report.handleUpdateReportStatus);

// Upvote
router.get("/:id/upvote", report.handleGetUpvoteStatus);
router.post("/:id/upvote", Middleware, report.handleToggleUpvote);

export default router;