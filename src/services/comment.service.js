import pool from "../config/database.js"

export async function createComment({ report_id, user_id, comment, type = "public", parent_id = null }) {
    const result = await pool.query(
        `INSERT INTO comments (report_id, user_id, comment, type, parent_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [report_id, user_id, comment, type, parent_id]
    )

    const inserted = result.rows[0]

    const full = await pool.query(
        `SELECT c.*, u.name, u.role
         FROM comments c
         JOIN users u ON c.user_id = u.id
         WHERE c.id = $1`,
        [inserted.id]
    )

    return full.rows[0]
}

export async function getCommentsByReport(report_id) {
    const result = await pool.query(
        `SELECT c.*, u.name, u.role
         FROM comments c
         JOIN users u ON c.user_id = u.id
         WHERE c.report_id = $1
         ORDER BY c.created_at ASC`,
        [report_id]
    )

    const comments = result.rows
    const map = {}
    const roots = []

    comments.forEach((c) => {
        map[c.id] = { ...c, replies: [] }
    })

    comments.forEach((c) => {
        if (c.parent_id && map[c.parent_id]) {
            map[c.parent_id].replies.push(map[c.id])
        } else {
            roots.push(map[c.id])
        }
    })

    return roots
}

export async function deleteComment(id) {
    await pool.query(
        "DELETE FROM comments WHERE id = $1",
        [id]
    )
}