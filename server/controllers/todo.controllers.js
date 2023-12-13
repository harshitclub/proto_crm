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
