import pool from "../config/database.js"
import { STATUS } from "../constants/status.js"

const SORT_MAP = {
    newest: "r.created_at DESC",
    oldest: "r.created_at ASC",
    category: "c.name ASC",
    priority: `
        CASE
            WHEN r.priority = 'urgent' THEN 1
            WHEN r.priority = 'high' THEN 2
            WHEN r.priority = 'medium' THEN 3
            WHEN r.priority = 'low' THEN 4
        END
    `,
    status: `
        CASE
            WHEN r.status = '${STATUS.PENDING}' THEN 1
            WHEN r.status = '${STATUS.APPROVED}' THEN 2
            WHEN r.status = '${STATUS.ON_PROGRESS}' THEN 3
            WHEN r.status = '${STATUS.COMPLETED}' THEN 4
            WHEN r.status = '${STATUS.REJECTED}' THEN 5
        END
    `,
}

export async function createReport({ user_id, image_url, data }) {
    const {
        title, description, category_id,
        location, priority, latitude, longitude,
    } = data

    const result = await pool.query(
        `INSERT INTO reports
            (user_id, title, description, category_id, location, priority, latitude, longitude, image_url)
         VALUES
            ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [user_id, title, description, category_id, location, priority, latitude, longitude, image_url]
    )

    return result.rows[0]
}

export async function getReports({ category, status, priority, sort }) {
    const filters = []
    const values = []

    let query = `
        SELECT r.*, u.name AS user_name, c.name AS category_name
        FROM reports r
        JOIN users u ON r.user_id = u.id
        LEFT JOIN categories c ON r.category_id = c.id
    `

    if (category) {
        values.push(category)
        filters.push(`r.category_id = $${values.length}`)
    }

    if (status) {
        values.push(status)
        filters.push(`r.status = $${values.length}`)
    }

    if (priority) {
        values.push(priority)
        filters.push(`r.priority = $${values.length}`)
    }

    if (filters.length > 0) {
        query += ` WHERE ${filters.join(" AND ")}`
    }

    query += ` ORDER BY ${SORT_MAP[sort] || SORT_MAP.newest}`

    const result = await pool.query(query, values)
    return result.rows
}

export async function getReportById(id) {
    const result = await pool.query(
        "SELECT * FROM reports WHERE id = $1",
        [id]
    )

    return result.rows[0] || null
}

export async function updateReport(id, data) {
    const { title, description, status, priority, latitude, longitude } = data

    const check = await pool.query(
        "SELECT * FROM reports WHERE id = $1",
        [id]
    )

    const report = check.rows[0]

    if (!report) {
        throw { status: 404, message: "Report not found" }
    }

    if (report.edit_count >= 1) {
        throw { status: 403, message: "Report can only be edited once" }
    }

    const result = await pool.query(
        `UPDATE reports
         SET title = $1, description = $2, status = $3, priority = $4,
             latitude = $5, longitude = $6, updated_at = NOW(), edit_count = edit_count + 1
         WHERE id = $7
         RETURNING *`,
        [title, description, status, priority, latitude, longitude, id]
    )

    return result.rows[0]
}

export async function deleteReport(id) {
    await pool.query("DELETE FROM reports WHERE id = $1", [id])
}

export async function updateReportStatus(id, status) {
    const allowedStatus = [
        STATUS.APPROVED,
        STATUS.REJECTED,
        STATUS.ON_PROGRESS,
        STATUS.COMPLETED,
    ]

    if (!allowedStatus.includes(status)) {
        throw { status: 400, message: "Invalid status" }
    }

    const result = await pool.query(
        "UPDATE reports SET status = $1 WHERE id = $2 RETURNING *",
        [status, id]
    )

    if (!result.rows[0]) {
        throw { status: 404, message: "Report not found" }
    }

    return result.rows[0]
}