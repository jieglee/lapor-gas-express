import pool from "../config/database.js"
import bcrypt from "bcrypt"

export async function getAllUsers() {
    const result = await pool.query("SELECT * FROM users")
    return result.rows
}

export async function getUserById(id) {
    const result = await pool.query(
        "SELECT * FROM users WHERE id = $1",
        [id]
    )

    return result.rows[0] || null
}

export async function createUser({ name, email, password }) {
    const hashed = await bcrypt.hash(password, 10)

    const result = await pool.query(
        "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
        [name, email, hashed]
    )

    return result.rows[0]
}

export async function updateUserRole(id, role) {
    const result = await pool.query(
        "UPDATE users SET role = $1 WHERE id = $2 RETURNING *",
        [role, id]
    )

    return result.rows[0]
}

export async function deleteUser(id) {
    await pool.query("DELETE FROM users WHERE id = $1", [id])
}