import { createReportSchema, updateReportSchema } from "../validation/report.validation.js"
import {
    createReport,
    getReports,
    getReportById,
    updateReport,
    deleteReport,
    updateReportStatus,
} from "../services/report.service.js"

export async function handleCreateReport(req, res) {
    try {
        const image_url = req.file?.path || null

        const validated = createReportSchema.parse({
            ...req.body,
            category_id: Number(req.body.category_id),
            latitude: req.body.latitude ? Number(req.body.latitude) : undefined,
            longitude: req.body.longitude ? Number(req.body.longitude) : undefined,
        })

        const data = await createReport({ user_id: req.user.id, image_url, data: validated })

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

        if (!data) {
            return res.status(404).json({ message: "Report not found" })
        }

        res.json(data)
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

export async function handleDeleteReport(req, res) {
    try {
        await deleteReport(req.params.id)

        res.json({ message: "Deleted" })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

export async function handleUpdateReportStatus(req, res) {
    try {
        const data = await updateReportStatus(req.params.id, req.body.status)

        res.json(data)
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message })
    }
}