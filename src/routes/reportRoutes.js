import express from "express"
import * as report from "../controllers/reportController.js"
import { verifyToken } from "../middleware/auth.js"

const router = express.Router()

router.post("/", verifyToken, report.createReport)
router.get("/", report.getReports)
router.get("/:id", report.getReportById)
router.put("/:id", verifyToken, report.updateReport)
router.delete("/:id", verifyToken, report.deleteReport)

export default router