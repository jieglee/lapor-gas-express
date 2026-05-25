import pool from "../config/database.js"
import bcrypt from "bcrypt"

export async function getAllUsers() {
    const result = await pool.query("SELECT id, name, email, role, avatar_url, created_at FROM users")
    return result.rows
}

export async function getUserById(id) {
    const result = await pool.query(
        "SELECT id, name, email, role, avatar_url, created_at FROM users WHERE id = $1",
        [id]
    )
    return result.rows[0] || null
}

export async function createUser({ name, email, password }) {
    const hashed = await bcrypt.hash(password, 10)
    const result = await pool.query(
        "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, role, avatar_url, created_at",
        [name, email, hashed]
    )
    return result.rows[0]
}

export async function updateUserRole(id, role) {
    const result = await pool.query(
        "UPDATE users SET role=$1 WHERE id=$2 RETURNING id, name, email, role",
        [role, id]
    )
    return result.rows[0]
}

export async function deleteUser(id) {
    await pool.query("DELETE FROM users WHERE id = $1", [id])
}

// ── UPDATE USER BY ID (superadmin) ────────────────────
export async function updateUserById(id, { name, email, password }) {
    const fields = []
    const values = []

    if (name)  { values.push(name);  fields.push(`name = $${values.length}`) }
    if (email) { values.push(email); fields.push(`email = $${values.length}`) }
    if (password) {
        const hashed = await bcrypt.hash(password, 10)
        values.push(hashed)
        fields.push(`password = $${values.length}`)
    }

    if (fields.length === 0) throw { status: 400, message: "Tidak ada perubahan" }

    values.push(id)
    const result = await pool.query(
        `UPDATE users SET ${fields.join(", ")} WHERE id = $${values.length}
        RETURNING id, name, email, role, created_at`,
        values
    )

    if (!result.rows[0]) throw { status: 404, message: "User tidak ditemukan" }
    return result.rows[0]
}

// ── UPDATE PROFILE (user sendiri) ─────────────────────
// Bisa update name, email, dan/atau password
export async function updateProfile(id, { name, email, password, avatar_url }) {
    const fields = []
    const values = []

    if (name) { values.push(name); fields.push(`name = $${values.length}`) }
    if (email) { values.push(email); fields.push(`email = $${values.length}`) }
    if (password) {
        const hashed = await bcrypt.hash(password, 10)
        values.push(hashed)
        fields.push(`password = $${values.length}`)
    }
    if (avatar_url) {
    values.push(avatar_url)
    fields.push(`avatar_url = $${values.length}`)
}

    if (fields.length === 0) throw { status: 400, message: "Tidak ada perubahan" }

    values.push(id)
    const result = await pool.query(
        `UPDATE users SET ${fields.join(", ")} WHERE id = $${values.length}
         RETURNING id, name, email, role, avatar_url`,
        values
    )

    if (!result.rows[0]) throw { status: 404, message: "User tidak ditemukan" }
    return result.rows[0]
}