import express from "express";
import { addAccount, getAccount } from "../controllers/account.controllers.js";
import { adminAuth, auth } from "../middlewares/auth.middleware.js";

const accountRouter = express.Router();

accountRouter.post("/add", adminAuth, addAccount);
accountRouter.get("/:id", getAccount);

export default accountRouter;
