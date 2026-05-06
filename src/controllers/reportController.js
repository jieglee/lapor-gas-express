import pool from "../config/database.js"

//CREATE 
export const createReport = async (req, res) => {
    try {
        const { title, description, category_id } = req.body

        const image_url = req.file
            ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
            : null

        const result = await pool.query(
            `INSERT INTO reports (user_id, title, description, category_id, image_url)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [req.user.id, title, description, category_id, image_url]
        )

        res.status(201).json(result.rows[0])

    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

//GET ALL 
export const getReports = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT r.*, u.name AS user_name, c.name AS category_name
            FROM reports r
            JOIN users u ON r.user_id = u.id
            LEFT JOIN categories c ON r.category_id = c.id
            ORDER BY r.created_at DESC
        `)

        res.json(result.rows)

    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

//GET DETAIL
export const getReportById = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM reports WHERE id = $1",
            [req.params.id]
        )

        res.json(result.rows[0])

    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// UPDATE 
export const updateReport = async (req, res) => {
    try {
        const { title, description, status } = req.body

        const result = await pool.query(
                `UPDATE reports
                SET title = $1, description = $2, status = $3
                WHERE id = $4
                RETURNING *`,
            [title, description, status, req.params.id]
        )

        res.json(result.rows[0])

    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// DELETE
export const deleteReport = async (req, res) => {
    try {
        await pool.query(
            "DELETE FROM reports WHERE id = $1",
            [req.params.id]
        )

        res.json({ message: "Deleted" })

    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}