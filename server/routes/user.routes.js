import express from "express";
import { userLogin, userRegister } from "../controllers/user.controllers.js";

const userRouter = express.Router();

userRouter.post("/register", userRegister);
userRouter.post("/login", userLogin);
// userRouter.patch("/update")
// userRouter.delete("/delete")

export default userRouter;
