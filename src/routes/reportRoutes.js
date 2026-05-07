import express from "express"
import * as report from "../controllers/reportController.js"
import { Middleware } from "../middlewares/Middleware.js"
import upload from "../middlewares/upload.js"
import  allowRole from "../middlewares/allowRole.js"

const router = express.Router()

router.post("/", upload.single("image"), Middleware, report.createReport)
router.get("/", report.getReports)
router.get("/:id", report.getReportById)
router.put("/:id", Middleware, report.updateReport)
router.delete("/:id", Middleware, report.deleteReport)
router.patch("/id/approve", Middleware, allowRole("admin", "superadmin"), report.approveReport)
router.patch("/id/reject", Middleware, allowRole("admin", "superadmin"), report.rejectReport)
router.patch("/id/progress", Middleware, allowRole("admin", "superadmin"), report.progressReport)
router.patch("/id/complete", Middleware, allowRole("admin", "superadmin"), report.completeReport)

export default router