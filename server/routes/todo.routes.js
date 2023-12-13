import express from "express";
import { addTodo } from "../controllers/todo.controllers.js";

const todoRouter = express.Router();

todoRouter.post("/add", addTodo);

export default todoRouter;
