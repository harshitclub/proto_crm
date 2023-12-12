import express from "express";
import { addContactPerson } from "../controllers/contact.person.controllers.js";

const contactPersonRouter = express.Router();

contactPersonRouter.post("/add/:id", addContactPerson);
// contactPersonRouter.update("/update/:id")
// contactPersonRouter.delete("/delete/:id")

export default contactPersonRouter;
