import express from "express"
import * as comment from "../controllers/commentController.js"
import { Middleware } from "../middlewares/Middleware.js"
import onlyOwnerComment from "../middlewares/OwnerComment.js"

const router = express.Router()

router.post("/", Middleware, comment.createComment)
router.get("/:report_id", comment.getComments)
router.delete("/:id", Middleware, onlyOwnerComment, comment.deleteComment)

export default router 