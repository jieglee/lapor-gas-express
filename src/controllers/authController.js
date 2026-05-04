import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import supabase from "../config/supabase.js"

async function register(req, res) {
    try {
        const { name, email, password } = req.body

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            })
        }

        const { data: existingUser } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single()

        if (existingUser) {
            return res.status(400).json({
                message: "Email already used"
            })
        }

        const hashed = await bcrypt.hash(password, 10)

        const { data, error } = await supabase
        .from("users")
        .insert([
            {
            name,
            email,
            password: hashed,
            role: "user"
            }
        ])
        .select()

        if (error) throw error 
        res.status(201).json
        ({
            message: "Register success",
            data
        })

    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

async function login(req, res) {
    if (!req.body?.email || !req.body?.password) {
        return res.status(400).json({
            message: "Email and password are required"
        })
    }

    const { data, error }  = await supabase
    .from("users")
    .select("*")
    .eq("email", req.body.email)

    if (error) {
        return res.status(500).json({
            message: error.message
        })        
    }

    if (!data.length) {
        return res.status(404).json({
            message: "login failed!"
        })
    }

    const user = data[0]

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
            id:user.id,
            name:user.name,
            role:user.role
        },
        "supersecret")
    
        res.json({
            message: "Login success",
            token : token
        })
}

export { register, login }