import express from "express";
import {
  superAdminLogin,
  superAdminLogout,
  superAdminRegister,
} from "../controllers/superAdminControllers.js";
import { auth } from "../middlewares/auth.middleware.js";

const superAdminRouter = express.Router();

superAdminRouter.post("/register", superAdminRegister);
superAdminRouter.post("/login", superAdminLogin);
superAdminRouter.post("/logout", auth, superAdminLogout);

export default superAdminRouter;
