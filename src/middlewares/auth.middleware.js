import express from "express"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()
function Middleware(req, res, next) {
    const tokenjwt = req.headers['authorization']

    if (!tokenjwt.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No Token Provided" })
    }

    const token = tokenjwt.split (" ")[1]

    jwt.verify(token, process.env.JWT_SECRET, (err, result) => {
        if (err) {
            return res.status(403).json ({ message: "Invalid Token" })
        }
        req.user = result
        next()
    })
}

export default Middleware