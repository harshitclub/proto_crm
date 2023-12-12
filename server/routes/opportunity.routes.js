import express from "express";
import { addOpportunity } from "../controllers/opportunity.controllers.js";

const opportunityRouter = express.Router();

opportunityRouter.post("/add/:id", addOpportunity);
// opportunityRouter.update("/update/:id")
// opportunityRouter.delete("/delete/:id")

export default opportunityRouter;
