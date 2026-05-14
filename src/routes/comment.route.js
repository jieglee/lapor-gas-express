import express from "express"
import * as comment from "../controllers/comment.controller.js"
import { Middleware } from "../middlewares/auth.middleware.js"
import onlyOwnerComment from "../middlewares/ownerComment.guard.js"

const router = express.Router()

router.post("/", Middleware, comment.createComment)
router.get("/:report_id", comment.getComments)
router.delete("/:id", Middleware, onlyOwnerComment, comment.deleteComment)

export default router 