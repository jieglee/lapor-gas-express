import pool from "../config/database.js";
import {
    createReportSchema,
    updateReportSchema,
} from "../validation/report.js";
import { STATUS } from "../constants/status.js";

export const createReport = async (req, res) => {
    try {
        const image_url = req.file?.path || null;

        const validated = createReportSchema.parse({
            ...req.body,
            category_id: Number(req.body.category_id),
            latitude: req.body.latitude
                ? Number(req.body.latitude)
                : undefined,

            longitude: req.body.longitude
                ? Number(req.body.longitude)
                : undefined,
        });

        const {
            title,
            description,
            category_id,
            location,
            priority,
            latitude,
            longitude,
        } = validated;

        const result = await pool.query(
            `INSERT INTO reports
            (
                user_id,
                title,
                description,
                category_id,
                location,
                priority,
                latitude,
                longitude,
                image_url
            )
            VALUES
            (
                $1, $2, $3, $4, $5,
                $6, $7, $8, $9
            )
            RETURNING *`,
            [
                req.user.id,
                title,
                description,
                category_id,
                location,
                priority,
                latitude,
                longitude,
                image_url,
            ]
        );

        res.status(201).json(result.rows[0]);

    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
};


export const getReports = async (req, res) => {
    try {
        const {
            category,
            status,
            priority,
            sort,
        } = req.query;

        const filters = [];
        const values = [];

        let query = `
            SELECT
                r.*,
                u.name AS user_name,
                c.name AS category_name
            FROM reports r
            JOIN users u
                ON r.user_id = u.id
            LEFT JOIN categories c
                ON r.category_id = c.id
        `;

        // FILTER CATEGORY
        if (category) {
            values.push(category);

            filters.push(
                `r.category_id = $${values.length}`
            );
        }

        // FILTER STATUS
        if (status) {
            values.push(status);

            filters.push(
                `r.status = $${values.length}`
            );
        }

        // FILTER PRIORITY
        if (priority) {
            values.push(priority);

            filters.push(
                `r.priority = $${values.length}`
            );
        }

        // WHERE
        if (filters.length > 0) {
            query += ` WHERE ${filters.join(" AND ")}`;
        }

        // SORTING
        const sortMap = {
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
        };

        query += `
            ORDER BY
            ${sortMap[sort] || sortMap.newest}
        `;

        const result = await pool.query(query, values);

        res.json(result.rows);

    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
};


export const getReportById = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT *
             FROM reports
             WHERE id = $1`,
            [req.params.id]
        );

        if (!result.rows[0]) {
            return res.status(404).json({
                message: "Report not found",
            });
        }

        res.json(result.rows[0]);

    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
};


export const updateReport = async (req, res) => {
    try {
        const validated = updateReportSchema.parse(req.body);

        const {
            title,
            description,
            status,
            priority,
            latitude,
            longitude,
        } = validated;

        // CHECK REPORT
        const checkReport = await pool.query(
            `SELECT *
             FROM reports
             WHERE id = $1`,
            [req.params.id]
        );

        const report = checkReport.rows[0];

        if (!report) {
            return res.status(404).json({
                message: "Report not found",
            });
        }

        // LIMIT EDIT ONLY 1x
        if (report.edit_count >= 1) {
            return res.status(403).json({
                message: "Report can only be edited once",
            });
        }

        const result = await pool.query(
            `UPDATE reports
             SET
                title = $1,
                description = $2,
                status = $3,
                priority = $4,
                latitude = $5,
                longitude = $6,
                updated_at = NOW(),
                edit_count = edit_count + 1
             WHERE id = $7
             RETURNING *`,
            [
                title,
                description,
                status,
                priority,
                latitude,
                longitude,
                req.params.id,
            ]
        );

        res.json(result.rows[0]);

    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
};

export const deleteReport = async (req, res) => {
    try {
        await pool.query(
            `DELETE FROM reports
             WHERE id = $1`,
            [req.params.id]
        );

        res.json({
            message: "Deleted",
        });

    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
};

export const updateReportStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const allowedStatus = [
            STATUS.APPROVED,
            STATUS.REJECTED,
            STATUS.ON_PROGRESS,
            STATUS.COMPLETED,
        ];

        // INVALID STATUS
        if (!allowedStatus.includes(status)) {
            return res.status(400).json({
                message: "Invalid status",
            });
        }

        const result = await pool.query(
            `UPDATE reports
             SET status = $1
             WHERE id = $2
             RETURNING *`,
            [
                status,
                req.params.id,
            ]
        );

        // REPORT NOT FOUND
        if (!result.rows[0]) {
            return res.status(404).json({
                message: "Report not found",
            });
        }

        res.json(result.rows[0]);

    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
};