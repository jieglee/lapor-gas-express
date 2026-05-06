import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import pool from "../config/database.js"

async function register(req, res) {
    try {
        const { name, email, password } = req.body

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            })
        }

        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        )

        const users = result.rows

        if (users.length) {
            return res.status(400).json({
                message: "Email already used"
            })
        }

        const hashed = await bcrypt.hash(password, 10)

        const result2 = await pool.query(
            "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id",
            [name, email, hashed]
        )
        

        res.status(201).json({
            message: "Register success",
            user_id: result2.rows[0].id
        })

    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

async function login(req, res) {
    try {
        if (!req.body?.email || !req.body?.password) {
            return res.status(400).json({
                message: "Email and password are required"
            })
        }

        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [req.body.email]
        )

        const users = result.rows

        if (!users.length) {
            return res.status(404).json({
                message: "Login failed!"
            })
        }

        const user = users[0]

        const isValid = await bcrypt.compare(
            req.body.password,
            user.password
        )

        if (!isValid) {
            return res.status(400).json({
                message: "Login failed!"
            })
        }

        const token = jwt.sign(
            {
                id: user.id,
                name: user.name,
                role: user.role
            },
            "supersecret",
            {expiresIn: "1d"}
        )

        res.json({
            message: "Login success",
            token
        })

    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

export { register, login }