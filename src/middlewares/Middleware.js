import express from "express"
import jwt from "jsonwebtoken"
import { supabase } from "../config/supabase"

async function Middleware(req, res, next) {
    const tokenjwt = req.headers['authorization']

    if (!tokenjwt) {
        return res.status(401).json({ message: "No Token Provided" })
    }

    const token = tokenjwt.split ("")[1]

    jwt.verify(token, "supersecret", (err, result) => {
        if (err) {
            return res.status(401).json ({ message: "Invaild Token" })
        }
        req.user = result
        next()
    })
}

async function OnlyOwnerReport(req, res, next) {
    try {
    const userId = req.user.userId
    const reportId = req.params.id

    const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("id", reportId)
    .eq("user_id", userId)

    if (!data.length) {
        return res.status(404).json ({ message: "Data Not Found" })
    }

    if (req.user.role === "superadmin"){
        return next ()
    }

    if (data.user_id !== userId) {
        return res.status(403).json ({ message: "Not Your Data" })
    }
    next()

    } catch (error) {
        return req.status(500).json ({ message: error.message })

    }
}