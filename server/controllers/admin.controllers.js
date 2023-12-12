import Admin from "../models/admin.model.js";
import { isPasswordCorrect, passwordHash } from "../utils/bcryptFunctions.js";
import { verifyJwtToken } from "../utils/jwtFunctions.js";

export const adminRegister = async (req, res) => {
  const { name, email, phone, password } = req.body;

  // Validate require fields
  if (!name || !email || !phone || !password) {
    return res.status(400).send({
      success: false,
      message: "All fields are required.",
    });
  }

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
};

export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  // validate request body
  if (!email || !password) {
    return res.status(400).send({
      success: false,
      message: "Please provide email and password",
    });
  }

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

  // Set cookies for access and refresh tokens
  res.cookie(`proto_access`, accessToken);
  res.cookie(`proto_refresh`, refreshToken);

  // Send successful login response
  return res.status(200).json({
    success: true,
    message: "Login successful",
    user: admin,
  });
};
