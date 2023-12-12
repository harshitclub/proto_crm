import mongoose from "mongoose";
import Admin from "../models/admin.model.js";
import User from "../models/user.model.js";
import { isPasswordCorrect, passwordHash } from "../utils/bcryptFunctions.js";
import validateMongoId from "../utils/validateMongoId.js";
import { verifyJwtToken } from "../utils/jwtFunctions.js";

export const userRegister = async (req, res) => {
  const { name, email, phone, designation, location, password } = req.body;

  // validate require fields
  if (!name || !email || !phone || !designation || !location || !password) {
    return res.status(400).send({
      success: false,
      message: "All fields are required.",
    });
  }

  // Check for existing user
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).send({
      success: false,
      message: "User already registered. Please login.",
    });
  }

  const hashPassword = await passwordHash(password);

  const adminToken = req.cookies.proto_access;
  const verifyAdminToken = await verifyJwtToken(adminToken);
  const adminID = verifyAdminToken._id;
  validateMongoId(adminID);
  const findAdmin = await Admin.findById(adminID);

  if (!findAdmin) {
    return res.status(401).send({
      success: false,
      message: "Admin Not Found",
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

  const session = await mongoose.startSession();
  session.startTransaction();
  await newUser.save();
  findAdmin.users.push(newUser);
  await findAdmin.save();
  await session.commitTransaction();

  // Select specific fields excluding sensitive data
  const createdUser = await User.findById(newUser._id).select(
    "-password -refreshToken"
  );

  // Respond with success message and user data
  res.status(201).json({
    success: true,
    message: "User registered successfully.",
    data: createdUser,
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
