import express from "express";
import {
  changeUserPassword,
  getAccounts,
  userLogin,
  userLogout,
  userProfile,
  userRegister,
} from "../controllers/user.controllers.js";
import { adminAuth, auth } from "../middlewares/auth.middleware.js";

const userRouter = express.Router();

userRouter.post("/register", adminAuth, userRegister);
userRouter.post("/login", userLogin);
userRouter.post("/logout", auth, userLogout);
userRouter.get("/profile", auth, userProfile);
userRouter.post("/change-password", auth, changeUserPassword);
userRouter.get("/accounts", auth, getAccounts);
userRouter.delete("/delete");
userRouter.patch("/update");

export default userRouter;
