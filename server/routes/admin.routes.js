import express from "express";
import {
  adminLogin,
  adminLogout,
  adminProfile,
  adminRegister,
  changeAdminPassword,
  getAdminAccounts,
  getAdminTodos,
  getAdminUsers,
} from "../controllers/admin.controllers.js";
import {
  adminAuth,
  auth,
  superAdminAuth,
} from "../middlewares/auth.middleware.js";

const adminRouter = express.Router();

adminRouter.post("/register", superAdminAuth, adminRegister);
adminRouter.post("/login", adminLogin);
adminRouter.post("/logout", auth, adminLogout);
adminRouter.post("/change-password", auth, changeAdminPassword);
adminRouter.get("/profile", adminAuth, adminProfile);
adminRouter.get("/accounts", adminAuth, getAdminAccounts);
adminRouter.get("/users", adminAuth, getAdminUsers);
adminRouter.get("/todos", adminAuth, getAdminTodos);
// adminRouter.patch("/update")

export default adminRouter;
