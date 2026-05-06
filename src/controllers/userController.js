import pool from "../config/database.js"
import bcrypt from "bcrypt";


// GET ALL USERS
export const getUsers = async (req, res) => {
    const result = await pool.query("SELECT * FROM users")
    res.json(result.rows)
}

export const getUserById = async (req, res) => {
    const result = await pool.query(
        "SELECT * FROM users WHERE id = $1",
        [req.params.id]
    )
    res.json(result.rows[0])
}

export const createUser = async (req, res) => {
    const { name, email, password} = req.body

    const hashed = await bcrypt.hash(password, 10)

    const result = await pool.query(
        "INSERT INTO users (name, email, password VALUES ($1, $2, $3) RETURNING *",
        [name, email, hashed])

        res.json(result.rows[0])

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