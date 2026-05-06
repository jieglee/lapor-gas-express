import pool from "../config/database.js"

// GET ALL USERS
export const getUsers = async (req, res) => {
    const result = await pool.query("SELECT * FROM users")
    res.json(result.rows)
}

// UPDATE ROLE
export const updateRole = async (req, res) => {
    const { role } = req.body

    const result = await pool.query(
        "UPDATE users SET role = $1 WHERE id = $2 RETURNING *",
        [role, req.params.id]
    )

    res.json(result.rows[0])
}

// DELETE USER
export const deleteUser = async (req, res) => {
    await pool.query(
        "DELETE FROM users WHERE id = $1",
        [req.params.id]
    )

    res.json({ message: "User deleted" })
}