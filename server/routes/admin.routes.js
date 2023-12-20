import express from "express";
import {
  adminLogin,
  adminLogout,
  adminProfile,
  adminProfileUpdate,
  adminRegister,
  assignAccounts,
  changeAdminPassword,
  getAdminAccounts,
  getAdminUsers,
  refreshAccessToken,
  unassignAccounts,
} from "../controllers/admin.controllers.js";
import {
  adminAuth,
  auth,
  superAdminAuth,
} from "../middlewares/auth.middleware.js";

const adminRouter = express.Router();

adminRouter.post("/register", superAdminAuth, adminRegister);
adminRouter.post("/login", adminLogin);
adminRouter.post("/refresh-token", refreshAccessToken);
adminRouter.post("/logout", auth, adminLogout);
adminRouter.post("/change-password", auth, changeAdminPassword);
adminRouter.get("/profile", adminAuth, adminProfile);
adminRouter.get("/accounts", adminAuth, getAdminAccounts);
adminRouter.get("/users", adminAuth, getAdminUsers);
adminRouter.patch("/update", adminAuth, adminProfileUpdate);
adminRouter.post("/assign-account", adminAuth, assignAccounts);
adminRouter.delete("/unassign-account", adminAuth, unassignAccounts);

export default adminRouter;
