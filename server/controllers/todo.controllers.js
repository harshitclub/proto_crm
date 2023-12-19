import mongoose from "mongoose";
import TODO from "../models/todos.model.js";
import { verifyJwtToken } from "../utils/jwtFunctions.js";
import validateMongoId from "../utils/validateMongoId.js";
import SuperAdmin from "../models/super.admin.model.js";
import Admin from "../models/admin.model.js";
import User from "../models/user.model.js";

export const addTodo = async (req, res) => {
  const { todo, priority } = req.body;

  if (!todo && !priority) {
    return res.status(400).send({
      success: false,
      message: "All fields are required.",
    });
  }

  const userToken = req.cookies.proto_access;

  const verifyUserToken = await verifyJwtToken(userToken);

  const userId = verifyUserToken._id;

  validateMongoId(userId);

  const roleModels = {
    Admin: Admin,
    SuperAdmin: SuperAdmin,
    User: User,
  };

  const findUser = await roleModels[verifyUserToken.role].findById(userId);

  if (!findUser) {
    return res.status(401).send({
      success: false,
      message: "User Not Found", // Inform user of missing admin
    });
  }

  // create new todo
  const newTodo = await TODO({
    user: findUser._id,
    todo,
    todoType: findUser.role,
    priority,
  });

  const session = await mongoose.startSession();
  session.startTransaction();
  await newTodo.save();
  findUser.todos.push(newTodo);
  await findUser.save();

  await session.commitTransaction();

  res.status(201).json({
    success: true,
    message: "Todo Added",
  });
};

export const updateTodo = async (req, res) => {
  const { todoId, todo, status, priority } = req.body;

  try {
    validateMongoId(todoId);
    const findTodo = await TODO.findById({
      _id: todoId,
    });

    if (!findTodo) {
      return res.status(404).json({
        success: false,
        message: "Todo Not Found",
      });
    }

    if (todo) findTodo.todo = todo;
    if (status) findTodo.status = status;
    if (priority) findTodo.priority = priority;

    await findTodo.save();

    return res.status(200).json({
      success: true,
      message: "Todo updated",
    });
  } catch (error) {
    console.error(error);
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid opportunity ID format",
      });
    } else if (error.name === "NotFoundError") {
      return res.status(404).json({
        message: "Opportunity not found",
      });
    } else {
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }
};

export const getTodos = async (req, res) => {
  try {
    const userToken = req.cookies.proto_access;
    const verifyUserToken = await verifyJwtToken(userToken);
    const userId = verifyUserToken._id;
    validateMongoId(userId);
    const roleModels = {
      Admin: Admin,
      SuperAdmin: SuperAdmin,
      User: User,
    };
    const user = await roleModels[verifyUserToken.role]
      .findById(userId)
      .populate("todos");

    if (!user) {
      return res.status(401).send({
        success: false,
        message: "User Not Found", // Inform user of missing admin
      });
    }

    // If no accounts exist for this admin, respond with informative message
    if (!user.todos || !user.todos.length) {
      return res.status(200).send({
        success: true,
        message: "No todos found for this user",
      });
    }

    res.status(201).json({
      success: true,
      message: "Todo fetched",
      todos: user.todos,
    });
  } catch (error) {
    console.error(error);
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid opportunity ID format",
      });
    } else if (error.name === "NotFoundError") {
      return res.status(404).json({
        message: "Opportunity not found",
      });
    } else {
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }
};

export const deleteTodo = async (req, res) => {
  const { todoId } = req.body;

  try {
    validateMongoId(todoId);

    const todo = await TODO.findByIdAndDelete({
      _id: todoId,
    }).populate("user");

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: "Todo Not Found",
      });
    }

    await todo.user.todos.pull(todo);
    await todo.user.save();

    return res.status(200).json({
      success: true,
      message: "Todo deleted",
    });
  } catch (error) {
    console.error(error);
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid opportunity ID format",
      });
    } else if (error.name === "NotFoundError") {
      return res.status(404).json({
        message: "Opportunity not found",
      });
    } else {
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }
};
