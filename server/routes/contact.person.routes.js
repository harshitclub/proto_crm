import express from "express";
import { addContactPerson } from "../controllers/contact.person.controllers.js";
import { auth } from "../middlewares/auth.middleware.js";

const contactPersonRouter = express.Router();

contactPersonRouter.post("/add/:id", auth, addContactPerson);
// contactPersonRouter.update("/update/:id")
// contactPersonRouter.delete("/delete/:id")

export default contactPersonRouter;
