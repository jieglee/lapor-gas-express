import express from "express"
import * as user from "../controllers/userController.js"
import { Middleware } from "../middlewares/Middleware.js"
import { allowRoles } from "../middlewares/AllowRole.js"

const router = express.Router()

router.get("/", Middleware, allowRoles('superadmin'), user.getUsers)
router.get("/:id", Middleware, allowRoles('superadmin'), user.getUserById)
router.post("/", allowRoles('superadmin'), user.createUser)
router.patch("/:id/role", Middleware, allowRoles('superadmin'), user.updateRole)
router.delete("/:id", Middleware, allowRoles('superadmin'), user.deleteUser)

export default router