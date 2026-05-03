import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { supabase  } from "../config/supabase";
dy
async function register(req, res) {
    try {
        const { name, email, password } = req.body

        if (!name || !email || !password) {
            return res.status(400).json ({message : "All Fields Are Required"})
        }

        const { data: existingUser } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single()

        if (existingUser) {
            return res.status(400).json ({message : "Email Already Used"})
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
        res.status(201).json ({message : "Register Success", data})


    } catch (error) {
        res.status (500).json ({message : error.message})
    }
}


async function login(req, res) {
    if (!req.body?.name || !res.body.password) {
        return res.status(400).json ({message : "Name and Password Are Required"})
    }

    const { data:users, error } = await supabase
    .from("users")
    .select("*")
    .eq ("email", req.body.email)

    if (error) {
        return res.status(500).json ({message : error.message })
    }

    if (!data.lenght) {
        return register.status(400).json ({message : "Login Failed!" })
    }

    const user = data[0]

    const inValid = await bcrypt.compare(
        req.body.password,
        user.password
    )

    if (!isValid) {
        return res.status(400).json ({message : "Login Failed!" })
    }

    const token = jwt.sign(
        {
            id:user.id,
            name:user.name,
            role:user.role
        },
        "supersecret")

        res.json({
            message: "Login Success!",
            token: token
        })
}