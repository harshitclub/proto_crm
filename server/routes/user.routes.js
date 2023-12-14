import express from "express";
import {
  userLogin,
  userLogout,
  userRegister,
} from "../controllers/user.controllers.js";
import { adminAuth, auth } from "../middlewares/auth.middleware.js";

const userRouter = express.Router();

userRouter.post("/register", adminAuth, userRegister);
userRouter.post("/login", userLogin);
userRouter.post("/logout", auth, userLogout);
// userRouter.patch("/update")
// userRouter.delete("/delete")

export default userRouter;
