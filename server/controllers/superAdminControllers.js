import { getProfile } from "../helpers/commonFunc.js";
import SuperAdmin from "../models/super.admin.model.js";
import { isPasswordCorrect, passwordHash } from "../utils/bcryptFunctions.js";
import validateMongoId from "../utils/validateMongoId.js";

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
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In Super Admin Login API",
      error,
    });
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
