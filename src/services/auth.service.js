import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import pool from "../config/database.js"
import dotenv from "dotenv"

dotenv.config()

export async function registerUser({ name, email, password }) {
    const result = await pool.query(
        "SELECT id FROM users WHERE email = $1",
        [email]
    )

    if (result.rows.length) {
        throw { status: 400, message: "Email already used" }
    }

    const hashed = await bcrypt.hash(password, 10)

    const newUser = await pool.query(
        "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id",
        [name, email, hashed]
    )

    return { user_id: newUser.rows[0].id }
}

export async function loginUser({ email, password }) {
    const result = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
    )

    if (!result.rows.length) {
        throw { status: 404, message: "Login failed!" }
    }

    const user = result.rows[0]

    const isValid = await bcrypt.compare(password, user.password)

    if (!isValid) {
        throw { status: 400, message: "Login failed!" }
    }

    const token = jwt.sign(
        { id: user.id, name: user.name, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    )

    return { token }
}

export async function verifyEmailAndName({ email, name }) {
    const result = await pool.query(
        "SELECT id FROM users WHERE email = $1 AND LOWER(name) = LOWER($2)",
        [email, name]
    )

    if (!result.rows.length) {
        throw { status: 400, message: "Email dan nama tidak cocok." }
    }

    return { verified: true }
}

export async function resetPasswordByName({ email, name, newPassword }) {
    const result = await pool.query(
        "SELECT id FROM users WHERE email = $1 AND LOWER(name) = LOWER($2)",
        [email, name]
    )

    if (!result.rows.length) {
        throw { status: 400, message: "Email dan nama tidak cocok." }
    }

    if (!newPassword || newPassword.length < 6) {
        throw { status: 400, message: "Password minimal 6 karakter." }
    }

    const hashed = await bcrypt.hash(newPassword, 10)

    await pool.query(
        "UPDATE users SET password = $1 WHERE email = $2",
        [hashed, email]
    )

    return { message: "Password berhasil diubah." }
}