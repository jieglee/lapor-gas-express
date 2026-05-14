import { z } from "zod"

export const createReportSchema = z.object({
    title: z
        .string()
        .min(5, "Title minimal 5 karakter"),

    description: z
        .string()
        .min(10, "Description minimal 10 karakter"),

    category_id: z
        .number(),

    location: z
        .string()
        .optional(),

    priority: z
        .enum(["low", "medium", "high", "urgent"])
        .optional(),

    latitude: z
        .number()
        .optional(),

    longitude: z
        .number()
        .optional()
})

export const updateReportSchema = z.object({
    title: z
        .string()
        .min(5)
        .optional(),

    description: z
        .string()
        .min(10)
        .optional(),

    status: z
        .enum([
            "pending",
            "approved",
            "rejected",
            "on_progress",
            "completed"
        ])
        .optional()
})