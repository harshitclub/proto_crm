import express from "express";
import {
  adminBlockUser,
  adminDeleteUser,
  adminGetUser,
  adminLogin,
  adminLogout,
  adminProfile,
  adminProfileUpdate,
  adminRegister,
  adminUpdateUser,
  adminUpdateUserPassword,
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
adminRouter.get("/user/:id", adminAuth, adminGetUser);
adminRouter.patch("/user-block/:id", adminAuth, adminBlockUser);
adminRouter.delete("/user-delete/:id", adminAuth, adminDeleteUser);
adminRouter.patch("/update-user/:id", adminAuth, adminUpdateUser);
adminRouter.patch(
  "/update-user-password/:id",
  adminAuth,
  adminUpdateUserPassword
);
adminRouter.patch("/update", adminAuth, adminProfileUpdate);
adminRouter.post("/assign-account", adminAuth, assignAccounts);
adminRouter.delete("/unassign-account", adminAuth, unassignAccounts);

// adminRouter.post("/upload-logo", upload.none(), uploadLogo);

export default adminRouter;
