import express from "express"
import * as user from "../controllers/userController.js"
import { verifyToken, checkRole } from "../middleware/auth.js"

const router = express.Router()

router.get("/", verifyToken, checkRole(['superadmin']), user.getUsers)
router.patch("/:id/role", verifyToken, checkRole(['superadmin']), user.updateRole)
router.delete("/:id", verifyToken, checkRole(['superadmin']), user.deleteUser)

export default router