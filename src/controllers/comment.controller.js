import {
    createComment,
    getCommentsByReport,
    deleteComment,
} from "../services/comment.service.js"

export async function handleCreateComment(req, res) {
    try {
        const { report_id, comment, parent_id = null } = req.body

        const type = (req.user.role === "admin" || req.user.role === "superadmin")
            ? "official"
            : "public"

        const data = await createComment({
            report_id,
            user_id: req.user.id,
            comment,
            type,
            parent_id,
        })
        res.status(201).json(data)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

export async function handleGetComments(req, res) {
    try {
        const data = await getCommentsByReport(req.params.report_id)
        res.json(data)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

export async function handleDeleteComment(req, res) {
    try {
        await deleteComment(req.params.id)
        res.json({ message: "Deleted" })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}