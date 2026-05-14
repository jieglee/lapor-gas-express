import express from "express";
import * as report from "../controllers/report.controller.js";
import Middleware from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";
import allowRoles from "../middlewares/role.guard.js";
import OnlyOwnerReport from "../middlewares/owner.guard.js";

const router = express.Router();

router.get("/", report.getReports);
router.get("/:id", report.getReportById);
router.post("/", Middleware, upload.single("image"), report.createReport);
router.put("/:id", Middleware, OnlyOwnerReport, report.updateReport);
router.delete("/:id", Middleware, OnlyOwnerReport, report.deleteReport);
router.patch("/:id/status", Middleware, allowRoles("admin", "superadmin"), report.updateReportStatus);

export default router;