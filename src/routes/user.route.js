import express from "express";
import * as user from "../controllers/user.controller.js";
import Middleware from "../middlewares/auth.middleware.js";
import allowRoles from "../middlewares/role.guard.js";

const router = express.Router();

router.get("/", Middleware, allowRoles("superadmin"), user.getUsers);
router.get("/:id", Middleware, allowRoles("superadmin"), user.getUserById);
router.post("/", Middleware, allowRoles("superadmin"), user.createUser);
router.patch("/:id/role", Middleware, allowRoles("superadmin"), user.updateRole);
router.delete("/:id", Middleware, allowRoles("superadmin"), user.deleteUser);

export default router;