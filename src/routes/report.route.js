import express from "express";
import * as report from "../controllers/report.controller.js";
import Middleware from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";
import allowRoles from "../middlewares/role.guard.js";
import OnlyOwnerReport from "../middlewares/owner.guard.js";

const router = express.Router();

router.get("/", report.handleGetReports);
router.get("/:id", report.handleGetReportById);
router.post("/", Middleware, upload.single("image"), report.handleCreateReport);
router.put("/:id", Middleware, OnlyOwnerReport, report.handleUpdateReport);
router.delete("/:id", Middleware, OnlyOwnerReport, report.handleDeleteReport);
router.patch("/:id/status", Middleware, allowRoles("admin", "superadmin"), report.handleUpdateReportStatus);

export default router;