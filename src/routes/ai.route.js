import express from "express"
import { categorizeReport } from "../services/ai.service.js"

const aiRouter = express.Router()
aiRouter.post("/categorize", async (req, res) => {
    try {
        const { title, description } = req.body
        const result = await categorizeReport(title ?? "", description ?? "")
        res.json({ success: true, data: result })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
})
export default aiRouter
