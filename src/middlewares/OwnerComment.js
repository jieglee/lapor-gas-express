import pool from "../config/database.js"

async function OnlyOwnerComment(req, res, next) {
    try {
        const commentId = req.params.id
        const userId = req.user.id

        const result = await pool.query(
            "SELECT * FROM comments WHERE id = $1",
            [commentId]
        )

        const comment = result.rows[0]

        if (!comment) {
            return res.status(404).json({
                message: "Comment not found"
            })
        }

        // superadmin bypass
        if (req.user.role === "superadmin") {
            return next()
        }

        // owner check
        if (comment.user_id !== userId) {
            return res.status(403).json({
                message: "Not your comment"
            })
        }

        next()

    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

export default OnlyOwnerComment