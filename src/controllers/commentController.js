import pool from "../config/database.js"

// CREATE
export const createComment = async (req, res) => {
    try {
        const { report_id, comment } = req.body

        const result = await pool.query(
            `INSERT INTO comments (report_id, user_id, comment)
             VALUES ($1, $2, $3) RETURNING *`,
            [report_id, req.user.id, comment]
        )
        res.status(201).json(result.rows[0])

    } catch (err) {
        res.status(500).json(
            { message: err 
            }
        )
    }
}

// GET BY REPORT
export const getComments = async (req, res) => {
    try {
        const result = await pool.query(
                `SELECT c.*, u.name
                FROM comments c
                JOIN users u ON c.user_id = u.id
                WHERE report_id = $1`,
            [req.params.report_id]
        )

        res.json(result.rows)

    } catch (err) {
        res.status(500).json(
            { message: err
            }
        )
    }
}

// DELETE
export const deleteComment = async (req, res) => {
    try {
        await pool.query(
            "DELETE FROM comments WHERE id = $1",
            [req.params.id]
        )

        res.json({ message: "Deleted" })

    } catch (err) {
        res.status(500).json(
            { message: err.message }
        )
    }
}