import express from "express";
import * as user from "../controllers/user.controller.js";
import Middleware from "../middlewares/auth.middleware.js";
import allowRoles from "../middlewares/role.guard.js";

const router = express.Router();

router.get("/", Middleware, allowRoles("superadmin"), user.handleGetUsers);
router.get("/:id", Middleware, allowRoles("superadmin"), user.handleGetUserById);
router.post("/", Middleware, allowRoles("superadmin"), user.handleCreateUser);
router.patch("/:id/role", Middleware, allowRoles("superadmin"), user.handleUpdateRole);
router.delete("/:id", Middleware, allowRoles("superadmin"), user.handleDeleteUser);

export default router;