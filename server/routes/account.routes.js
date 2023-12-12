import express from "express";
import { addAccount } from "../controllers/account.controllers.js";

const accountRouter = express.Router();

accountRouter.post("/add", addAccount);

export default accountRouter;
