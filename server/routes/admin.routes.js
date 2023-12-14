import express from "express";
import {
  adminLogin,
  adminLogout,
  adminRegister,
} from "../controllers/admin.controllers.js";
import { auth } from "../middlewares/auth.middleware.js";

const adminRouter = express.Router();

adminRouter.post("/register", adminRegister);
adminRouter.post("/login", adminLogin);
adminRouter.post("/logout", auth, adminLogout);
// adminRouter.patch("/update")

export default adminRouter;
