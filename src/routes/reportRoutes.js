import express from "express";
import * as report from "../controllers/reportController.js";
import Middleware from "../middlewares/Middleware.js";
import upload from "../controllers/cloudinaryUpload.js";
import allowRoles from "../middlewares/AllowRole.js";
import OnlyOwnerReport from "../middlewares/OnlyOwner.js";

const router = express.Router();

router.get("/", report.getReports);
router.get("/:id", report.getReportById);
router.post("/", Middleware, upload.single("image"), report.createReport);
router.put("/:id", Middleware, OnlyOwnerReport, report.updateReport);
router.delete("/:id", Middleware, OnlyOwnerReport, report.deleteReport);
router.patch("/:id/status", Middleware, allowRoles("admin", "superadmin"), report.updateReportStatus);

export default router;