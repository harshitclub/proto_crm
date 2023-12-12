import { ACCESS_TOKEN_NAME, REFRESH_TOKEN_NAME } from "../constants.js";
import SuperAdmin from "../models/super.admin.model.js";
import { isPasswordCorrect, passwordHash } from "../utils/bcryptFunctions.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwtFunctions.js";

export const superAdminRegister = async (req, res) => {
  const { name, email, password } = req.body;

  // Validate require fields
  if (!name || !email || !password) {
    return res.status(400).send({
      success: false,
      message: "All fields are required.",
    });
  }

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
  const createdSuperAdmin = await SuperAdmin.findById(newSuperAdmin._id).select(
    "-password -refreshToken"
  );

  // Respond with success message and super admin data
  res.status(201).json({
    success: true,
    message: "Super Admin registered successfully.",
    data: createdSuperAdmin,
  });
};

export const superAdminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // validate request body
    if (!email || !password) {
      return res.status(400).send({
        success: false,
        message: "Please provide email and password",
      });
    }

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

    // Set cookies for access and refresh tokens
    res.cookie(`proto_access`, accessToken);
    res.cookie(`proto_refresh`, refreshToken);

    // Send successful login response
    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: superAdmin,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In Super Admin Login API",
      error,
    });
  }
};
