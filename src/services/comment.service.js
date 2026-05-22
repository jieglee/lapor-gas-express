import pool from "../config/database.js"

export async function createComment({ report_id, user_id, comment, type = "public" }) {
    const result = await pool.query(
        `INSERT INTO comments (report_id, user_id, comment, type)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [report_id, user_id, comment, type]
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
         WHERE report_id = $1
         ORDER BY c.created_at ASC`,
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