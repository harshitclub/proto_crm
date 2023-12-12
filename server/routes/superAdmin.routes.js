import express from "express";
import {
  superAdminLogin,
  superAdminRegister,
} from "../controllers/superAdminControllers.js";

const superAdminRouter = express.Router();

superAdminRouter.post("/register", superAdminRegister);
superAdminRouter.post("/login", superAdminLogin);

export default superAdminRouter;
