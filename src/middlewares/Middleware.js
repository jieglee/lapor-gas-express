import express from "express"
import jwt from "jsonwebtoken"

const express = express.Router()

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

export {Middleware}
export default router 


