import express from "express";
import {
  addOpportunity,
  deleteOppotunity,
  updateOpportunity,
} from "../controllers/opportunity.controllers.js";
import { auth } from "../middlewares/auth.middleware.js";

const opportunityRouter = express.Router();

opportunityRouter.post("/add", auth, addOpportunity);
opportunityRouter.patch("/update", auth, updateOpportunity);
opportunityRouter.delete("/delete", auth, deleteOppotunity);

export default opportunityRouter;
