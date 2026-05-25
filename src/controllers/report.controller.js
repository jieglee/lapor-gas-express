import { createReportSchema, updateReportSchema } from "../validation/report.validation.js"
import {
    createReport,
    getReports,
    getReportById,
    updateReport,
    deleteReport,
    updateReportStatus,
    toggleUpvote,
    getUpvoteStatus,
} from "../services/report.service.js"

export async function handleCreateReport(req, res) {
    try {
        // req.files dari upload.array — array of file objects
        const image_urls = (req.files || []).map((f) => f.path)

        const validated = createReportSchema.parse({
            ...req.body,
            category_id: Number(req.body.category_id),
            latitude: req.body.latitude ? Number(req.body.latitude) : undefined,
            longitude: req.body.longitude ? Number(req.body.longitude) : undefined,
        })

        const data = await createReport({
            user_id: req.user.id,
            image_urls,
            data: validated,
        })

        res.status(201).json(data)
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message })
    }
}

export async function handleGetReports(req, res) {
    try {
        const { category, status, priority, sort } = req.query
        const data = await getReports({ category, status, priority, sort })
        res.json(data)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

export async function handleGetReportById(req, res) {
    try {
        const data = await getReportById(req.params.id)
        if (!data) return res.status(404).json({ message: "Report not found" })
        res.json(data)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

export async function handleUpdateReportStatus(req, res) {
    try {
        const { status, reject_reason } = req.body
        const data = await updateReportStatus(req.params.id, status, reject_reason ?? null)
        res.json(data)
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message })
    }
}

export async function handleDeleteReport(req, res) {
    try {
        await deleteReport(req.params.id)
        res.json({ message: "Deleted" })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

export async function handleUpdateReport(req, res) {
    try {
        const validated = updateReportSchema.parse(req.body)
        const data = await updateReport(req.params.id, validated)
        res.json(data)
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message })
    }
}
export async function handleToggleUpvote(req, res) {
    try {
        const data = await toggleUpvote(Number(req.params.id), req.user.id)
        res.json(data)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

export async function handleGetUpvoteStatus(req, res) {
    try {
        const user_id = req.user?.id ?? null
        const data = await getUpvoteStatus(Number(req.params.id), user_id)
        res.json(data)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}