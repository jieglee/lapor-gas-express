import pool from "../config/database.js"

async function OnlyOwnerReport(req, res, next) {
    try {
    const userId = req.user.id
    const reportId = req.params.id

    const result = await pool.query(
        "SELECT * FROM reports WHERE id = $1",
        [reportId]
    )

    if (!result.rows[0]) {
        return res.status(404).json({ message: "Data not found" })
    }

    if (req.user.role === "superadmin") {
        return next()
    }

    if (result.rows[0].user_id  !== userId) {
        return res.status(403).json ({
            message: "Not your data"
        })
    }
    next()
    
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

export {OnlyOwnerReport}