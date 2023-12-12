import mongoose from "mongoose";
import Admin from "../models/admin.model.js";
import User from "../models/user.model.js";
import { isPasswordCorrect, passwordHash } from "../utils/bcryptFunctions.js";
import validateMongoId from "../utils/validateMongoId.js";
import { verifyJwtToken } from "../utils/jwtFunctions.js";

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

  // Set cookies for access and refresh tokens
  res.cookie(`proto_access`, accessToken);
  res.cookie(`proto_refresh`, refreshToken);

  // Send successful login response
  return res.status(200).json({
    success: true,
    message: "Login successful",
    user: user,
  });
};
