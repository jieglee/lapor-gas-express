import { z } from "zod"

export const registerSchema = z.object({
    name: z
        .string()
        .min(3, "Name minimal 3 karakter"),

    email: z
        .email("Format email tidak valid"),

    password: z
        .string()
        .min(6, "Password minimal 6 karakter")
})

export const loginSchema = z.object({
    email: z
        .email("Format email tidak valid"),

    password: z
        .string()
        .min(6, "Password minimal 6 karakter")
})