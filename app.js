import express from "express"
import multer from "multer"
import cors from "cors"
import dotenv from "dotenv"

import authRouter from "./src/routes/auth.route.js"
import userRouter from "./src/routes/user.route.js"
import reportRouter from "./src/routes/report.route.js"
import commentRouter from "./src/routes/comment.route.js"

dotenv.config()

const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "LaporGas API Running"
    })
})

app.use("/api", authRouter)
app.use("/api/users", userRouter)
app.use("/api/reports", reportRouter)
app.use("/api/comments", commentRouter)

app.use((err, req, res, next) => {
    console.error(err)

    if (err instanceof multer.MulterError) {
        return res.status(400).json({
            success: false,
            message: err.message
        })
    }

    return res.status(500).json({
        success: false,
        message: "Internal Server Error"
    })
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})