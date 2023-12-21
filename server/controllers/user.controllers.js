import mongoose from "mongoose";
import { z } from "zod";
import Admin from "../models/admin.model.js";
import User from "../models/user.model.js";
import { isPasswordCorrect, passwordHash } from "../utils/bcryptFunctions.js";
import validateMongoId from "../utils/validateMongoId.js";
import { verifyJwtToken } from "../utils/jwtFunctions.js";
import { getProfile } from "../helpers/commonFunc.js";
import { loginSchema, userRegisterSchema } from "../helpers/zodSchemas.js";
import { sendErrorResponse } from "../utils/handleErrors.js";

// ****************** Common functions for this controller *********************//

async function getUserByIdExcludingSensitiveInfo(userId) {
  return await User.findById(userId).select("-password -refreshToken");
}

// *****************************************************************************//

export const userRegister = async (req, res) => {
  try {
    const { name, email, phone, designation, location, password } =
      await userRegisterSchema.parseAsync(req.body);

    // Check if user with provided email already exists
    if (await doesUserExist(email)) {
      return res.status(409).send({
        success: false,
        message: "User already registered with this email.",
      });
    }

    const hashPassword = await passwordHash(password);

    const adminID = await getAdminIdFromToken(req.cookies.proto_access);

    const findAdmin = await findAdminById(adminID);

    if (!findAdmin) {
      return res.status(401).send({
        success: false,
        message: "Admin Not Found",
      });
    }

    const newUser = await createUser(
      adminID,
      name,
      email,
      phone,
      designation,
      location,
      hashPassword
    );

    // Fetch the newly created user with specific fields excluded (sensitive data)

    const createdUser = await getUserByIdExcludingSensitiveInfo(newUser._id);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: createdUser,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).send({
        success: false,
        message: "Validation error",
        errors: error.errors,
      });
    } else {
      console.error(error);
      return res.status(500).send({
        success: false,
        message: "Internal server error",
        error,
      });
    }
  }

  async function doesUserExist(email) {
    return Boolean(await User.findOne({ email }));
  }

  async function getAdminIdFromToken(adminToken) {
    const verifyAdminToken = await verifyJwtToken(adminToken);
    const adminID = verifyAdminToken._id;
    validateMongoId(adminID);
    return adminID;
  }

  async function findAdminById(adminID) {
    return await Admin.findById(adminID);
  }

  async function createUser(
    adminID,
    name,
    email,
    phone,
    designation,
    location,
    password
  ) {
    const newUser = await User({
      admin: adminID,
      name,
      email,
      phone,
      designation,
      location,
      password,
    });

    const session = await mongoose.startSession();

    session.startTransaction();
    await newUser.save();

    await Admin.findOneAndUpdate(
      { _id: adminID },
      { $push: { users: newUser } },
      { session }
    );

    await session.commitTransaction();
    return newUser;
  }
};

export const userLogin = async (req, res) => {
  try {
    const { email, password } = await loginSchema.parseAsync(req.body);

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return sendErrorResponse(res, 401, "User Not Found");
    }

    // validate password
    const isPasswordValid = await isPasswordCorrect(password, user.password);

    if (!isPasswordValid) {
      return sendErrorResponse(res, 401, "Invalid credentials");
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateTokens(user);

    // Update user with refresh token
    user.refreshToken = refreshToken;
    await user.save();

    // Fetch the logged-in user with specific fields excluded (sensitive data)
    const loggedInUser = await getUserByIdExcludingSensitiveInfo(user.id);

    const options = {
      httpOnly: true,
      secure: true,
    };

    // Send successful login response
    return res
      .status(200)
      .cookie(`proto_access`, accessToken, options)
      .cookie(`proto_refresh`, refreshToken, options)
      .json({
        success: true,
        message: "Login successful",
        data: loggedInUser,
      });
  } catch (error) {
    // handle Zod validation errors
    if (error instanceof z.ZodError) {
      return res.status(400).send({
        success: false,
        message: "Validation error",
        errors: error.errors,
      });
    } else {
      console.error(error);
      return res.status(500).send({
        success: false,
        message: "Internal server error",
        error,
      });
    }
  }

  async function generateTokens(user) {
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    return { accessToken, refreshToken };
  }
};

export const userLogout = async (req, res) => {
  try {
    const userId = req.decodedToken._id;
    validateMongoId(userId);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { refreshToken: undefined } },
      { new: true }
    );

    if (!updatedUser) {
      return sendErrorResponse(res, 404, "User not found");
    }

    const options = { httpOnly: true, secure: true };
    res.status(200).clearCookie("proto_access", options).json({
      success: true,
      message: "User Logged Out",
    });
  } catch (error) {
    console.error(error); // Log the error for debugging

    // Handle specific errors
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: "Invalid user ID" });
    } else if (error.name === "CastError") {
      return res.status(400).json({ error: "Invalid user ID format" });
    } else {
      // Fallback for unknown errors
      return res.status(500).json({ error: "Internal server error" });
    }
  }
};

export const userProfile = async (req, res) => {
  try {
    const user = await getProfile(User, req.decodedToken._id);

    if (!user) {
      return sendErrorResponse(res, 404, "User not found");
    }

    return res.status(200).json({
      success: true,
      message: "User Profile",
      data: user,
    });
  } catch (error) {
    console.error(error);

    if (error.name === "CastError") {
      return res.status(400).send({
        success: false,
        message: "Invalid user ID format",
      });
    } else if (error.name === "ValidationError") {
      // Handle validation errors if applicable
      return res.status(400).send({
        success: false,
        message: "Validation error",
        errors: error.errors,
      });
    } else {
      return res.status(500).send({
        success: false,
        message: "Internal server error",
        error,
      });
    }
  }
};

export const changeUserPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return sendErrorResponse(
        res,
        400,
        "Missing required fields: oldPassword, newPassword"
      );
    }

    const userId = req.decodedToken._id;

    // Verify user existence
    const user = await User.findById(userId);
    if (!user) {
      return sendErrorResponse(res, 404, "User not found");
    }

    // Check old password validity
    const isOldPasswordValid = await isPasswordCorrect(
      oldPassword,
      user.password
    );
    if (!isOldPasswordValid) {
      return sendErrorResponse(res, 400, "Incorrect old password");
    }

    const hashPassword = await passwordHash(newPassword);

    // Update user password and save
    user.password = hashPassword;
    await user.save();

    // Send successful response
    return res.status(200).send({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error(error);

    // Handle specific error types
    if (error.name === "CastError") {
      return res.status(400).send({
        success: false,
        message: "Invalid user ID format",
      });
    } else if (error.name === "ValidationError") {
      // Handle validation errors if applicable
      return res.status(400).send({
        success: false,
        message: "Validation error - password requirements not met",
      });
    } else {
      return res.status(500).send({
        success: false,
        message: "Internal server error",
        error,
      });
    }
  }
};

export const getAccounts = async (req, res) => {
  const userId = req.decodedToken._id;

  try {
    const user = await findUserWithAccounts(userId);

    if (!user) {
      return sendErrorResponse(res, 404, "User not found");
    }

    const userAccounts = user.accounts;

    if (!userAccounts || userAccounts.length === 0) {
      return sendErrorResponse(res, 404, "No accounts found for the user");
    }

    return res.status(200).json({
      success: true,
      message: "Accounts fetched successfully",
      data: userAccounts,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }

  async function findUserWithAccounts(userId) {
    validateMongoId(userId);
    return await User.findById(userId)
      .select("-password -refreshToken")
      .populate("accounts");
  }
};
