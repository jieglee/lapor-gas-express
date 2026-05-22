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

// ── CREATE REPORT ─────────────────────────────────────
// image_urls: array of Cloudinary URLs dari upload.array
export async function createReport({ user_id, image_urls = [], data }) {
    const {
        title, description, category_id,
        location, priority, latitude, longitude,
    } = data

    const client = await pool.connect()

    try {
        await client.query("BEGIN")

        // Insert report — image_url tetap ada (cover/foto pertama)
        const result = await client.query(
            `INSERT INTO reports
                (user_id, title, description, category_id, location, priority, latitude, longitude, image_url)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING *`,
            [user_id, title, description, category_id, location, priority,
             latitude, longitude, image_urls[0] || null]
        )

        const report = result.rows[0]

        // Insert semua foto ke report_images
        if (image_urls.length > 0) {
            for (let i = 0; i < image_urls.length; i++) {
                await client.query(
                    `INSERT INTO report_images (report_id, image_url, sort_order)
                     VALUES ($1, $2, $3)`,
                    [report.id, image_urls[i], i]
                )
            }
        }

        await client.query("COMMIT")

        return { ...report, images: image_urls }
    } catch (err) {
        await client.query("ROLLBACK")
        throw err
    } finally {
        client.release()
    }
}

// ── GET ALL REPORTS ───────────────────────────────────
export async function getReports({ category, status, priority, sort } = {}) {
    const filters = []
    const values = []

    let query = `
        SELECT
            r.*,
            u.name AS user_name,
            c.name AS category_name,
            COUNT(DISTINCT cm.id)::int AS comment_count,
            COUNT(DISTINCT uv.id)::int AS upvote_count,
            COALESCE(
                JSON_AGG(DISTINCT ri.image_url) FILTER (WHERE ri.image_url IS NOT NULL),
                '[]'
            ) AS images
        FROM reports r
        JOIN users u ON r.user_id = u.id
        LEFT JOIN categories c ON r.category_id = c.id
        LEFT JOIN comments cm ON cm.report_id = r.id
        LEFT JOIN report_upvotes uv ON uv.report_id = r.id
        LEFT JOIN report_images ri ON ri.report_id = r.id
    `

    if (category) { values.push(category); filters.push(`r.category_id = $${values.length}`) }
    if (status)   { values.push(status);   filters.push(`r.status = $${values.length}`) }
    if (priority) { values.push(priority); filters.push(`r.priority = $${values.length}`) }

    if (filters.length > 0) query += ` WHERE ${filters.join(" AND ")}`
    query += ` GROUP BY r.id, u.name, c.name`
    query += ` ORDER BY ${SORT_MAP[sort] || SORT_MAP.newest}`

    const result = await pool.query(query, values)
    return result.rows
}

// ── GET REPORT BY ID ──────────────────────────────────
export async function getReportById(id) {
    const result = await pool.query(
        `SELECT
            r.*,
            u.name AS user_name,
            c.name AS category_name,
            COUNT(DISTINCT cm.id)::int AS comment_count,
            COUNT(DISTINCT uv.id)::int AS upvote_count,
            COALESCE(
                JSON_AGG(ri.image_url ORDER BY ri.sort_order ASC) FILTER (WHERE ri.image_url IS NOT NULL),
                '[]'
            ) AS images
         FROM reports r
         JOIN users u ON r.user_id = u.id
         LEFT JOIN categories c ON r.category_id = c.id
         LEFT JOIN comments cm ON cm.report_id = r.id
         LEFT JOIN report_upvotes uv ON uv.report_id = r.id
         LEFT JOIN report_images ri ON ri.report_id = r.id
         WHERE r.id = $1
         GROUP BY r.id, u.name, c.name`,
        [id]
    )

    return result.rows[0] || null
}

// ── UPDATE REPORT ─────────────────────────────────────
export async function updateReport(id, data) {
    const { title, description, status, priority, latitude, longitude } = data

    const check = await pool.query("SELECT * FROM reports WHERE id = $1", [id])
    const report = check.rows[0]

    if (!report) throw { status: 404, message: "Report not found" }
    if (report.edit_count >= 1) throw { status: 403, message: "Report can only be edited once" }

    const result = await pool.query(
        `UPDATE reports
         SET title=$1, description=$2, status=$3, priority=$4,
             latitude=$5, longitude=$6, updated_at=NOW(), edit_count=edit_count+1
         WHERE id=$7 RETURNING *`,
        [title, description, status, priority, latitude, longitude, id]
    )

    return result.rows[0]
}

// ── DELETE REPORT ─────────────────────────────────────
export async function deleteReport(id) {
    await pool.query("DELETE FROM reports WHERE id = $1", [id])
}

// ── UPDATE STATUS ─────────────────────────────────────
export async function updateReportStatus(id, status) {
    const allowedStatus = [STATUS.APPROVED, STATUS.REJECTED, STATUS.ON_PROGRESS, STATUS.COMPLETED]
    if (!allowedStatus.includes(status)) throw { status: 400, message: "Invalid status" }

    const result = await pool.query(
        "UPDATE reports SET status=$1 WHERE id=$2 RETURNING *",
        [status, id]
    )

    if (!result.rows[0]) throw { status: 404, message: "Report not found" }
    return result.rows[0]
}

// ── UPVOTE — TOGGLE ───────────────────────────────────
export async function toggleUpvote(report_id, user_id) {
    const existing = await pool.query(
        "SELECT id FROM report_upvotes WHERE report_id=$1 AND user_id=$2",
        [report_id, user_id]
    )

    if (existing.rows.length > 0) {
        await pool.query("DELETE FROM report_upvotes WHERE report_id=$1 AND user_id=$2", [report_id, user_id])
    } else {
        await pool.query("INSERT INTO report_upvotes (report_id, user_id) VALUES ($1, $2)", [report_id, user_id])
    }

    const count = await pool.query(
        "SELECT COUNT(*)::int AS upvote_count FROM report_upvotes WHERE report_id=$1",
        [report_id]
    )

    return {
        upvoted: existing.rows.length === 0,
        upvote_count: count.rows[0].upvote_count,
    }
}

// ── UPVOTE — GET STATUS ───────────────────────────────
export async function getUpvoteStatus(report_id, user_id) {
    const [countResult, userResult] = await Promise.all([
        pool.query("SELECT COUNT(*)::int AS upvote_count FROM report_upvotes WHERE report_id=$1", [report_id]),
        user_id
            ? pool.query("SELECT id FROM report_upvotes WHERE report_id=$1 AND user_id=$2", [report_id, user_id])
            : Promise.resolve({ rows: [] })
    ])

    return {
        upvote_count: countResult.rows[0].upvote_count,
        upvoted: userResult.rows.length > 0,
    }
}