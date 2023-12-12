import express from "express";
import { adminLogin, adminRegister } from "../controllers/admin.controllers.js";

const adminRouter = express.Router();

adminRouter.post("/register", adminRegister);
adminRouter.post("/login", adminLogin);
// adminRouter.patch("/update")

export default adminRouter;