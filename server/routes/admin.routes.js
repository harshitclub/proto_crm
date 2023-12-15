import express from "express";
import {
  adminLogin,
  adminLogout,
  adminProfile,
  adminRegister,
} from "../controllers/admin.controllers.js";
import { auth, superAdminAuth } from "../middlewares/auth.middleware.js";

const adminRouter = express.Router();

adminRouter.post("/register", superAdminAuth, adminRegister);
adminRouter.post("/login", adminLogin);
adminRouter.post("/logout", auth, adminLogout);
adminRouter.get("/profile", auth, adminProfile);
// adminRouter.patch("/update")

export default adminRouter;
