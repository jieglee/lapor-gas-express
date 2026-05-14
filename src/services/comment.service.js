import pool from "../config/database.js"

export async function createComment({ report_id, user_id, comment }) {
    const result = await pool.query(
        `INSERT INTO comments (report_id, user_id, comment)
         VALUES ($1, $2, $3) RETURNING *`,
        [report_id, user_id, comment]
    )

    return result.rows[0]
}

export async function getCommentsByReport(report_id) {
    const result = await pool.query(
        `SELECT c.*, u.name
         FROM comments c
         JOIN users u ON c.user_id = u.id
         WHERE report_id = $1`,
        [report_id]
    )

    return result.rows
}

export async function deleteComment(id) {
    await pool.query(
        "DELETE FROM comments WHERE id = $1",
        [id]
    )
}