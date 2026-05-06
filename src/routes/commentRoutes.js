import express from "express"
import * as comment from "../controllers/commentController.js"
import { verifyToken } from "../middleware/auth.js"

const router = express.Router()

router.post("/", verifyToken, comment.createComment)
router.get("/:report_id", comment.getComments)
router.delete("/:id", verifyToken, comment.deleteComment)

export default router 