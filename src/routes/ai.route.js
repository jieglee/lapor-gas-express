import express from "express"
import { categorizeReport } from "../services/ai.service.js"

const aiRouter = express.Router()

aiRouter.post("/categorize", async (req, res) => {
    try {
        const { title, description } = req.body
        if (!title && !description) {
            return res.status(400).json({ success: false, message: "Title atau description diperlukan" })
        }
        const result = await categorizeReport(title ?? "", description ?? "")
        res.json({ success: true, data: result })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
})

export default aiRouter
