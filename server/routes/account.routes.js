import express from "express";
import { addAccount } from "../controllers/account.controllers.js";
import { adminAuth, auth } from "../middlewares/auth.middleware.js";

const accountRouter = express.Router();

accountRouter.post("/add", adminAuth, addAccount);

export default accountRouter;
