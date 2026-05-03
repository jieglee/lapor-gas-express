import express from "express"
import authRouter from "./src/routes/authRoute.js"

const app = express()
const port = 3000

app.use(express.json())

app.use("/api/register", authRouter)
app.use("/api/login", authRouter)

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})