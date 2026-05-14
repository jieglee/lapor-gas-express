import { registerSchema, loginSchema } from "../validation/auth.validation.js"
import { successResponse, errorResponse } from "../utils/response.js"
import { registerUser, loginUser } from "../services/auth.service.js"

export async function register(req, res) {
    try {
        const validated = registerSchema.parse(req.body)
        const data = await registerUser(validated)

        successResponse(res, { message: "Register success", ...data }, "User registered successfully", 201)
    } catch (error) {
        const status = error.status || 500
        errorResponse(res, error.message, status)
    }
}

export async function login(req, res) {
    try {
        const validated = loginSchema.parse(req.body)
        const data = await loginUser(validated)

        successResponse(res, { message: "Login success", ...data }, "User logged in successfully", 200)
    } catch (error) {
        const status = error.status || 500
        errorResponse(res, error.message, status)
    }
}