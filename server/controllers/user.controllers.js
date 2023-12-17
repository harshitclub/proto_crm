import mongoose from "mongoose";
import Admin from "../models/admin.model.js";
import User from "../models/user.model.js";
import { isPasswordCorrect, passwordHash } from "../utils/bcryptFunctions.js";
import validateMongoId from "../utils/validateMongoId.js";
import { verifyJwtToken } from "../utils/jwtFunctions.js";
import { getProfile } from "../helpers/commonFunc.js";

export const userRegister = async (req, res) => {
  // Extract required fields from request body
  const { name, email, phone, designation, location, password } = req.body;

  // Validate if all required fields are present
  if (!name || !email || !phone || !designation || !location || !password) {
    return res.status(400).send({
      success: false,
      message: "All fields are required.", // Inform user of missing fields
    });
  }

  // Check if user with provided email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).send({
      success: false,
      message: "User already registered. Please login.",
    });
  }

  // Hash the password for secure storage
  const hashPassword = await passwordHash(password);

  // Extract admin token from cookies
  const adminToken = req.cookies.proto_access;

  const verifyAdminToken = await verifyJwtToken(adminToken);
  const adminID = verifyAdminToken._id;
  validateMongoId(adminID);

  // Find the admin associated with the token
  const findAdmin = await Admin.findById(adminID); // Find admin by extracted ID

  // Check if admin exists
  if (!findAdmin) {
    return res.status(401).send({
      success: false,
      message: "Admin Not Found", // Inform user of missing admin
    });
  }

  // Create new admin
  const newUser = await User({
    admin: adminID,
    name,
    email,
    phone,
    designation,
    location,
    password: hashPassword,
  });

  // Start a MongoDB transaction for efficient data manipulation
  const session = await mongoose.startSession();
  session.startTransaction(); // Begin transaction

  // Save the new user to the database
  await newUser.save();

  // Update the admin's user list
  findAdmin.users.push(newUser); // Add new user to the admin's users list
  await findAdmin.save(); // Update the admin document in the database

  // Commit the transaction to permanently save the changes
  await session.commitTransaction();

  // Fetch the newly created user with specific fields excluded (sensitive data)
  const createdUser = await User.findById(newUser._id).select(
    "-password -refreshToken" // Exclude sensitive fields from response
  );

  // Respond with success message and filtered user data
  res.status(201).json({
    success: true,
    message: "User registered successfully.",
    data: createdUser, // Provide user data without sensitive information
  });
};

export const userLogin = async (req, res) => {
  const { email, password } = req.body;

  // validate request body
  if (!email || !password) {
    return res.status(400).send({
      success: false,
      message: "Please provide email and password",
    });
  }

  // Find user by email
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).send({
      success: false,
      message: "User Not Found",
    });
  }

  // validate password
  const isPasswordValid = await isPasswordCorrect(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).send({
      success: false,
      message: "Invalid credentials",
    });
  }

  // Generate tokens
  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();

  // Update user with refresh token
  user.refreshToken = refreshToken;
  await user.save();

  const loggedInUser = await User.findById(user.id).select(
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
      user: loggedInUser,
    });
};

export const userLogout = async (req, res) => {
  const userId = req.decodedToken._id;
  validateMongoId(userId);
  return User.findByIdAndUpdate(
    userId,
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

export const userProfile = async (req, res) => {
  try {
    const user = await getProfile(User, req.decodedToken._id);

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User Profile",
      user,
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
    // Ensure required fields are present
    if (!req.body || !req.body.oldPassword || !req.body.newPassword) {
      return res.status(400).send({
        success: false,
        message: "Missing required fields: oldPassword, newPassword",
      });
    }

    const { oldPassword, newPassword } = req.body;
    const userId = req.decodedToken._id;

    // Verify user existence
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    // Check old password validity
    const isOldPasswordValid = await isPasswordCorrect(
      oldPassword,
      user.password
    );
    if (!isOldPasswordValid) {
      return res.status(400).send({
        success: false,
        message: "Incorrect old password",
      });
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
