import express from "express"
import authRouter from "./src/routes/authRoute.js"
import userRouter from "./src/routes/userRoutes.js"
import reportRouter from "./src/routes/reportRoutes.js"
import commentRouter from "./src/routes/commentRoutes.js"
import multer from "multer"

const app = express()
const port = 3000

app.use(express.json())
app.use("/api", authRouter)
app .use("/api/users", userRouter)
app.use("/api/reports", reportRouter)
app.use("/api/comments", commentRouter)
app.use("/uploads", express.static("uploads"))

app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: err.message })
    } else if (err) {
        return res.status(400).json({ message: err.message })
    }
    next()
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})