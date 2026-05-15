import express from "express"
import * as comment from "../controllers/comment.controller.js"
import Middleware from "../middlewares/auth.middleware.js"
import onlyOwnerComment from "../middlewares/ownerComment.guard.js"

const router = express.Router()

router.post("/", Middleware, comment.handleCreateComment)
router.get("/:report_id", comment.handleGetComments)
router.delete("/:id", Middleware, onlyOwnerComment, comment.handleDeleteComment)

export default router 