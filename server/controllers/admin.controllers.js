import { z } from "zod";
import { getProfile } from "../helpers/commonFunc.js";
import { adminRegisterSchema, loginSchema } from "../helpers/zodSchemas.js";
import Admin from "../models/admin.model.js";
import { isPasswordCorrect, passwordHash } from "../utils/bcryptFunctions.js";
import { verifyJwtToken } from "../utils/jwtFunctions.js";
import validateMongoId from "../utils/validateMongoId.js";

export const adminRegister = async (req, res) => {
  try {
    const { name, email, phone, password } =
      await adminRegisterSchema.parseAsync(req.body);

    // Check for existing admin
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(409).send({
        success: false,
        message: "Admin already registered. Please login.",
      });
    }

    const hashPassword = await passwordHash(password);

    const superAdminToken = req.cookies.proto_access;

    const superAdminTokenDecoded = await verifyJwtToken(superAdminToken);

    // Create new admin
    const newAdmin = await Admin.create({
      superAdmin: superAdminTokenDecoded._id,
      name,
      email,
      phone,
      password: hashPassword,
    });

    // Select specific fields excluding sensitive data
    const createdAdmin = await Admin.findById(newAdmin._id).select(
      "-password -refreshToken"
    );

    // Respond with success message and admin data
    res.status(201).json({
      success: true,
      message: "Admin registered successfully.",
      data: createdAdmin,
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
};

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = await loginSchema.parseAsync(req.body);

    // Find admin by email
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(401).send({
        success: false,
        message: "Admin Not Found",
      });
    }

    // validate password
    const isPasswordValid = await isPasswordCorrect(password, admin.password);

    if (!isPasswordValid) {
      return res.status(401).send({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate tokens
    const accessToken = await admin.generateAccessToken();
    const refreshToken = await admin.generateRefreshToken();

    // Update admin with refresh token
    admin.refreshToken = refreshToken;
    await admin.save();

    const loggedInAdmin = await Admin.findById(admin._id).select(
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
        user: loggedInAdmin,
      });
  } catch (error) {
    // handle zod validation errors
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

export const adminLogout = async (req, res) => {
  const adminId = validateMongoId(req.decodedToken._id);
  return Admin.findByIdAndUpdate(
    adminId,
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

export const adminProfile = async (req, res) => {
  try {
    const admin = await getProfile(Admin, req.decodedToken._id);

    if (!admin) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Admin Profile",
      admin,
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

export const getAdminAccounts = async (req, res) => {
  const adminId = req.decodedToken._id;
  try {
    const admin = await Admin.findById(adminId).populate({
      path: "accounts",
      populate: {
        path: "contactPerson",
        // Optionally specify select fields for contactPerson
        // select: "name email"
      },
      populate: {
        path: "opportunities",
        // Optionally specify select fields for opportunities
        // select: "title company stage"
      },
    });

    if (!admin) {
      return res.status(404).send({
        success: false,
        message: "Admin not found",
      });
    }

    // If no accounts exist for this admin, respond with informative message
    if (!admin.accounts || !admin.accounts.length) {
      return res.status(200).send({
        success: true,
        message: "No active accounts found for this admin",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Accounts Fetched",
      accounts: admin.accounts,
    });
  } catch (error) {
    console.error(error);

    if (error.name === "CastError") {
      return res.status(400).send({
        success: false,
        message: "Invalid administrator ID format",
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
  const adminId = req.decodedToken._id;
  try {
    const admin = await Admin.findById(adminId).populate({
      path: "users",
      populate: {
        path: "accounts",
        // Optionally specify select fields for contactPerson
        // select: "name email"
      },
      select: "-password -refreshToken",
    });

    if (!admin) {
      return res.status(404).send({
        success: false,
        message: "Admin not found",
      });
    }

    // If no accounts exist for this admin, respond with informative message
    if (!admin.users || !admin.users.length) {
      return res.status(200).send({
        success: true,
        message: "No active users found for this admin",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Users Fetched",
      users: admin.users,
    });
  } catch (error) {
    console.error(error);

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

export const getAdminTodos = async (req, res) => {
  const adminId = req.decodedToken._id;
  try {
    const admin = await Admin.findById(adminId).populate({
      path: "todos",
    });

    if (!admin) {
      return res.status(404).send({
        success: false,
        message: "Admin not found",
      });
    }

    // If no accounts exist for this admin, respond with informative message
    if (!admin.todos || !admin.todos.length) {
      return res.status(200).send({
        success: true,
        message: "No todos found for this admin",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Accounts Fetched",
      todos: admin.todos,
    });
  } catch (error) {
    console.error(error);

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

export const changeAdminPassword = async (req, res) => {
  try {
    // Ensure required fields are present
    if (!req.body || !req.body.oldPassword || !req.body.newPassword) {
      return res.status(400).send({
        success: false,
        message: "Missing required fields: oldPassword, newPassword",
      });
    }

    const { oldPassword, newPassword } = req.body;
    const adminId = req.decodedToken._id;

    // Verify user existence
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).send({
        success: false,
        message: "Admin not found",
      });
    }

    // Check old password validity
    const isOldPasswordValid = await isPasswordCorrect(
      oldPassword,
      admin.password
    );
    if (!isOldPasswordValid) {
      return res.status(400).send({
        success: false,
        message: "Incorrect old password",
      });
    }

    const hashPassword = await passwordHash(newPassword);

    // Update user password and save
    admin.password = hashPassword;
    await admin.save();

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
