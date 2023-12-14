import express from "express";
import { addTodo } from "../controllers/todo.controllers.js";
import { auth } from "../middlewares/auth.middleware.js";

const todoRouter = express.Router();

todoRouter.post("/add", auth, addTodo);

export default todoRouter;
