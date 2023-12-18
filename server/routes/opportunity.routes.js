import express from "express";
import { addOpportunity } from "../controllers/opportunity.controllers.js";
import { auth } from "../middlewares/auth.middleware.js";

const opportunityRouter = express.Router();

opportunityRouter.post("/add/:id", auth, addOpportunity);
// opportunityRouter.patch("/update/:id")
// opportunityRouter.delete("/delete/:id")

export default opportunityRouter;
