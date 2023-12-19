import express from "express";
import {
  addTodo,
  deleteTodo,
  getTodos,
  updateTodo,
} from "../controllers/todo.controllers.js";
import { auth } from "../middlewares/auth.middleware.js";

const todoRouter = express.Router();

todoRouter.post("/add", auth, addTodo);
todoRouter.get("/todos", auth, getTodos);
todoRouter.patch("/update", auth, updateTodo);
todoRouter.delete("/delete", auth, deleteTodo);

export default todoRouter;
