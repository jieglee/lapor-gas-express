import express from "express"
import * as report from "../controllers/reportController.js"
import { Middleware } from "../middlewares/Middleware.js"
import upload from "../middlewares/upload.js"

const router = express.Router()

router.post("/", upload.single("image"), Middleware, report.createReport)
router.get("/", report.getReports)
router.get("/:id", report.getReportById)
router.put("/:id", Middleware, report.updateReport)
router.delete("/:id", Middleware, report.deleteReport)

export default router