import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import pool from "../config/database.js"
import { registerSchema, loginSchema } from "../validation/auth.validation.js"
import { successResponse, errorResponse } from "../utils/response.js"
import dotenv from "dotenv"

dotenv.config()
async function register(req, res) {
    try {
        const validated = registerSchema.parse(req.body)
        const { name, email, password } = validated

        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        )

        const users = result.rows

        if (users.length) {
            return errorResponse(res, "Email already used", 400)
        }

        const hashed = await bcrypt.hash(password, 10)

        const newUser = await pool.query(
            "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id",
            [name, email, hashed]
        )
        

        successResponse(res, {
            message: "Register success",
            user_id: newUser.rows[0].id
        }, "User registered successfully", 201)

    } catch (error) {
        errorResponse(res, error.message, 500)
    }
}

async function login(req, res) {
    try {
        const validated = loginSchema.parse(req.body)

        const { email, password } = validated

        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        )

        const users = result.rows

        if (!users.length) {
            return errorResponse(res, "Login failed!", 404)
        }

        const user = users[0]

        const isValid = await bcrypt.compare(
            password,
            user.password
        )

        if (!isValid) {
            return errorResponse(res, "Login failed!", 400)
        }

        const token = jwt.sign(
            {
                id: user.id,
                name: user.name,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        )

        successResponse(res, {
            message: "Login success",
            token
        }, "User logged in successfully", 200)

    } catch (error) {
        errorResponse(res, error.message, 500)
    }
}

export { register, login }