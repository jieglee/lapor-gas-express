import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import connection from "../config/database.js"

async function register(req, res) {
    try {
        const { name, email, password } = req.body

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            })
        }

        const [users] = await connection.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        )

        if (users.length) {
            return res.status(400).json({
                message: "Email already used"
            })
        }

        const hashed = await bcrypt.hash(password, 10)

        const [result] = await connection.query(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            [name, email, hashed]
        )

        res.status(201).json({
            message: "Register success",
            user_id: result.insertId
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

        const [users] = await connection.query(
            "SELECT * FROM users WHERE email = ?",
            [req.body.email]
        )

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
            "supersecret"
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