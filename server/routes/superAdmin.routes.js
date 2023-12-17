import express from "express";
import {
  changeSuperAdminPassword,
  getAdmin,
  getAdminUsers,
  getAdmins,
  getSuperAdminTodos,
  superAdminLogin,
  superAdminLogout,
  superAdminProfile,
  superAdminRegister,
} from "../controllers/superAdminControllers.js";
import { auth, superAdminAuth } from "../middlewares/auth.middleware.js";

const superAdminRouter = express.Router();

superAdminRouter.post("/register", superAdminRegister);
superAdminRouter.post("/login", superAdminLogin);
superAdminRouter.post("/logout", auth, superAdminLogout);
superAdminRouter.post(
  "/change-password",
  superAdminAuth,
  changeSuperAdminPassword
);
superAdminRouter.get("/profile", superAdminAuth, superAdminProfile);
superAdminRouter.get("/admins", superAdminAuth, getAdmins);
superAdminRouter.get("/:id", superAdminAuth, getAdmin);
superAdminRouter.get("/admin-users/:id", superAdminAuth, getAdminUsers);
superAdminRouter.get("/todos", superAdminAuth, getSuperAdminTodos);

export default superAdminRouter;
