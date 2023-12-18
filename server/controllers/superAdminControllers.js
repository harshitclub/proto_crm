import { z } from "zod";
import { getProfile } from "../helpers/commonFunc.js";
import SuperAdmin from "../models/super.admin.model.js";
import { isPasswordCorrect, passwordHash } from "../utils/bcryptFunctions.js";
import validateMongoId from "../utils/validateMongoId.js";
import Admin from "../models/admin.model.js";
import {
  loginSchema,
  superAdminRegisterSchema,
} from "../helpers/zodSchemas.js";

export const superAdminRegister = async (req, res) => {
  try {
    const { name, email, password } = await superAdminRegisterSchema.parseAsync(
      req.body
    );

    // Check for existing super admin
    const existingSuperAdmin = await SuperAdmin.findOne({ email });
    if (existingSuperAdmin) {
      return res.status(409).send({
        success: false,
        message: "Super Admin already registered. Please login.",
      });
    }

    const hashPassword = await passwordHash(password);

    // Create new super admin
    const newSuperAdmin = await SuperAdmin.create({
      name,
      email,
      password: hashPassword,
    });

    // Select specific fields excluding sensitive data
    const createdSuperAdmin = await SuperAdmin.findById(
      newSuperAdmin._id
    ).select("-password -refreshToken");

    // Respond with success message and super admin data
    res.status(201).json({
      success: true,
      message: "Super Admin registered successfully.",
      data: createdSuperAdmin,
    });
  } catch (error) {
    // handling zod validation errors
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
};

export const superAdminLogin = async (req, res) => {
  try {
    const { email, password } = await loginSchema.parseAsync(req.body);

    // Find super admin by email
    const superAdmin = await SuperAdmin.findOne({ email });

    if (!superAdmin) {
      return res.status(401).send({
        success: false,
        message: "Super Admin Not Found!",
      });
    }

    // validate password
    const isPasswordValid = await isPasswordCorrect(
      password,
      superAdmin.password
    );

    if (!isPasswordValid) {
      return res.status(401).send({
        success: false,
        message: "Invalid credentials",
      });
    }

    const accessToken = await superAdmin.generateAccessToken();
    const refreshToken = await superAdmin.generateRefreshToken();

    // Update super admin with refresh token
    superAdmin.refreshToken = refreshToken;
    await superAdmin.save();

    const loggedInSuperAdmin = await SuperAdmin.findById(superAdmin._id).select(
      "-password -refreshToken"
    );

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
        user: loggedInSuperAdmin,
      });
  } catch (error) {
    // handling zod validation errors
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
};

export const superAdminLogout = async (req, res) => {
  const superAdminId = validateMongoId(req.decodedToken._id);
  return SuperAdmin.findByIdAndUpdate(
    superAdminId,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  )
    .then(() => {
      const options = {
        httpOnly: true,
        secure: true,
      };

      return res.status(200).clearCookie("proto_access", options).json({
        message: "User Logged Out",
      });
    })
    .catch((error) => {
      console.error(error); // Log the error for debugging

      // Handle specific errors
      if (error.name === "ValidationError") {
        return res.status(400).json({ error: "Invalid user ID" });
      } else if (error.name === "CastError") {
        return res.status(400).json({ error: "Invalid user ID format" });
      } else {
        // fallback for unknown errors
        return res.status(500).json({ error: "Internal server error" });
      }
    });
};

export const superAdminProfile = async (req, res) => {
  try {
    const superAdmin = await getProfile(SuperAdmin, req.decodedToken._id);

    if (!superAdmin) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "User Profile",
      superAdmin,
    });
  } catch (error) {
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

export const getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select("-password -refreshToken");

    // Check if any admins were found
    if (!admins || !admins.length) {
      return res.status(204).send({
        success: true,
        message: "No admins found",
      });
    }

    // Send successful response with list of admins
    return res.status(200).json({
      success: true,
      message: "Admins Fetched",
      admins,
    });
  } catch (error) {
    // Handle specific error types
    if (error.name === "ValidationError") {
      // Handle Admin schema validation errors if applicable
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

export const getAdmin = async (req, res) => {
  const adminId = req.params.id;

  // Handle missing admin ID
  if (!adminId) {
    return res.status(400).send({
      success: false,
      message: "Missing admin ID",
    });
  }

  try {
    // Try to find the admin with the specified ID
    const admin = await Admin.findById(adminId).select(
      "-password -refreshToken"
    );

    // Handle admin not found
    if (!admin) {
      return res.status(404).send({
        success: false,
        message: "Admin not found",
      });
    }

    // Send successful response with admin details
    return res.status(200).json({
      success: true,
      message: "Admin Fetched",
      admin,
    });
  } catch (error) {
    // Handle specific error types
    if (error.name === "CastError") {
      return res.status(400).send({
        success: false,
        message: "Invalid admin ID format",
      });
    } else if (error.name === "ValidationError") {
      // Handle Admin schema validation errors if applicable
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

export const getAdminUsers = async (req, res) => {
  const adminId = req.params.id;

  try {
    const admin = await Admin.findById(adminId).populate({
      path: "users",
      select: "-password -refreshToken",
    });

    // Check if admin exists
    if (!admin) {
      return res.status(404).send({
        success: false,
        message: "Administrator not found",
      });
    }

    // Check if the admin has any users
    if (!admin.users || !admin.users.length) {
      return res.status(204).send({
        success: true,
        message: "No users found for this admin",
      });
    }

    // Return all users with populated data
    return res.status(200).json({
      success: true,
      message: "Users Fetched",
      users: admin.users,
    });
  } catch (error) {
    // Handle specific error types
    if (error.name === "CastError") {
      return res.status(400).send({
        success: false,
        message: "Invalid admin ID format",
      });
    } else if (error.name === "ValidationError") {
      // Handle Admin schema validation errors if applicable
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

export const getSuperAdminTodos = async (req, res) => {
  const superAdminId = req.decodedToken._id;
  try {
    const superAdmin = await SuperAdmin.findById(superAdminId).populate({
      path: "todos",
    });

    // Handle nonexistent superAdmin
    if (!superAdmin) {
      return res.status(404).send({
        success: false,
        message: "Super Admin not found",
      });
    }

    // Check for and handle empty todos list
    if (!superAdmin.todos || !superAdmin.todos.length) {
      return res.status(200).send({
        success: true,
        message: "No todos found for super admin",
        todos: [],
      });
    }

    // Return successful response with todos
    return res.status(200).json({
      success: true,
      message: "Todos Fetched",
      todos: superAdmin.todos,
    });
  } catch (error) {
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

export const changeSuperAdminPassword = async (req, res) => {
  try {
    // Ensure required fields are present
    if (!req.body || !req.body.oldPassword || !req.body.newPassword) {
      return res.status(400).send({
        success: false,
        message: "Missing required fields: oldPassword, newPassword",
      });
    }

    const { oldPassword, newPassword } = req.body;
    const superAdminId = req.decodedToken._id;

    // Verify user existence
    const superAdmin = await SuperAdmin.findById(superAdminId);
    if (!superAdmin) {
      return res.status(404).send({
        success: false,
        message: "Super Admin not found",
      });
    }

    // Check old password validity
    const isOldPasswordValid = await isPasswordCorrect(
      oldPassword,
      superAdmin.password
    );
    if (!isOldPasswordValid) {
      return res.status(400).send({
        success: false,
        message: "Incorrect old password",
      });
    }

    const hashPassword = await passwordHash(newPassword);

    // Update user password and save
    superAdmin.password = hashPassword;
    await superAdmin.save();

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
