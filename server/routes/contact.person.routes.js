import express from "express";
import {
  addContactPerson,
  updateContactPerson,
} from "../controllers/contact.person.controllers.js";
import { auth } from "../middlewares/auth.middleware.js";

const contactPersonRouter = express.Router();

contactPersonRouter.post("/add", auth, addContactPerson);
contactPersonRouter.patch("/update", auth, updateContactPerson);
// contactPersonRouter.delete("/delete/:id")

export default contactPersonRouter;
