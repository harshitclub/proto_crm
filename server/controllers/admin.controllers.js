import { z } from "zod";
import { getProfile } from "../helpers/commonFunc.js";
import {
  adminProfileUpdateSchema,
  adminRegisterSchema,
  loginSchema,
} from "../helpers/zodSchemas.js";
import Admin from "../models/admin.model.js";
import { isPasswordCorrect, passwordHash } from "../utils/bcryptFunctions.js";
import { verifyJwtToken } from "../utils/jwtFunctions.js";
import validateMongoId from "../utils/validateMongoId.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import {
  sendErrorResponse,
  sendSuccessResponse,
} from "../utils/handleErrors.js";

export const adminRegister = async (req, res) => {
  try {
    const { name, email, phone, password } =
      await adminRegisterSchema.parseAsync(req.body);

    // Check for existing admin
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return sendErrorResponse(
        res,
        409,
        "Admin already registered. Please login."
      );
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

// this below code can be a common function
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

// this below code can be a common function
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

// this below code can be a common function
export const refreshAccessToken = async (req, res) => {
  // Extract refresh token from cookie or body
  const incomingRefreshToken =
    req.cookie.proto_refresh || req.body.proto_refresh;

  // Handle missing refresh token
  if (!incomingRefreshToken) {
    return res.status(400).json({
      success: false,
      message: "Missing refresh token",
    });
  }

  try {
    // Verify refresh token
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    // Find user based on decoded token ID
    const user = await Admin.findById(decodedToken._id);

    // Handle non-existent user
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify stored refresh token matches incoming token
    if (incomingRefreshToken !== user.refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    // Generate new access and refresh tokens
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    // Set cookie options
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
        message: "Access token refreshed",
      });
  } catch (error) {
    console.error(error); // Log error for debugging

    // Handle generic error with specific responses for JWT errors if needed
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// export const uploadLogo = async (req, res) => {
//   try {
//     await upload(req, res);

//     const imagePath = req.file.path;

//     const uploadLogo = await uploadCloudinary(imagePath);

//     if (!uploadLogo) {
//       res.status(400).json({
//         success: false,
//         message: "Failed to upload logo",
//       });
//       return;
//     }

//     // Assuming logo is an object containing Cloudinary URL and other relevant data
//     console.log(uploadLogo);
//     res.status(201).json({
//       success: true,
//       message: "Logo uploaded successfully",
//       logoUrl: uploadLogo.secure_url, // Adjust based on Cloudinary data structure
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(400).json({
//       success: false,
//       message: "Failed to upload image",
//     });
//   }
// };

export const adminProfile = async (req, res) => {
  try {
    const admin = await getProfile(Admin, req.decodedToken._id);

    if (!admin) {
      return sendErrorResponse(res, 404, "Admin not found");
    }

    return res.status(200).json({
      success: true,
      message: "Admin Profile",
      data: admin,
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
  try {
    const adminId = req.decodedToken._id;
    const admin = await findAdminWithAccounts(adminId);

    if (!admin) {
      return sendErrorResponse(res, 404, "Admin not found");
    }

    // If no accounts exist for this admin, respond with informative message
    if (!admin.accounts || !admin.accounts.length) {
      return sendSuccessResponse(
        res,
        200,
        "No active accounts found for this admin"
      );
    }

    return res.status(200).json({
      success: true,
      message: "Accounts Fetched",
      data: admin.accounts,
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

  async function findAdminWithAccounts(adminId) {
    validateMongoId(adminId);
    return await Admin.findById(adminId)
      .populate({
        path: "accounts",
        populate: [{ path: "contactPerson" }, { path: "opportunities" }],
      })
      .select("-password -refreshToken");
  }
};

export const getAdminUsers = async (req, res) => {
  try {
    const adminId = req.decodedToken._id;
    const admin = await findAdminWithUsers(adminId);

    if (!admin) {
      return sendErrorResponse(res, 404, "Admin not found");
    }

    // If no accounts exist for this admin, respond with informative message
    if (!admin.users || !admin.users.length) {
      return sendSuccessResponse(
        res,
        200,
        "No active users found for this admin"
      );
    }

    return res.status(200).json({
      success: true,
      message: "Users Fetched",
      data: admin.users,
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

  async function findAdminWithUsers(adminId) {
    validateMongoId(adminId);
    return await Admin.findById(adminId)
      .populate({
        path: "users",
        populate: { path: "accounts" },
      })
      .select("-password -refreshToken");
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

export const adminProfileUpdate = async (req, res) => {
  try {
    const { name, phone, industry, description, address, social } =
      await adminProfileUpdateSchema.parseAsync(req.body);

    const adminId = req.decodedToken._id;

    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    // Update fields
    admin.name = name || admin.name;
    admin.phone = phone || admin.phone;
    admin.industry = industry || admin.industry;
    admin.description = description || admin.description;
    admin.address = {
      country: address?.country || admin.address?.country,
      state: address?.state || admin.address?.state,
      city: address?.city || admin.address?.city,
      pincode: address?.pincode || admin.address?.pincode,
      street: address?.street || admin.address?.street,
      landmark: address?.landmark || admin.address?.landmark,
    };
    admin.social = {
      website: social?.website || admin.social?.website,
      linkedin: social?.linkedin || admin.social?.linkedin,
      twitter: social?.twitter || admin.social?.twitter,
      facebook: social?.facebook || admin.social?.facebook,
      instagram: social?.instagram || admin.social?.instagram,
    };

    // Save the updated admin profile
    await admin.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
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

// not completely workable function

export const assignAccounts = async (req, res) => {
  const { userId, accountIds } = req.body;

  // Validate userId and accountIds
  if (!userId || !accountIds || !Array.isArray(accountIds)) {
    return res.status(400).json({
      success: false,
      message: "Invalid input. Provide userId and an array of accountIds.",
    });
  }

  try {
    const user = await User.findById(userId).select("-password -refreshToken");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if the given accountIds are already assigned
    const alreadyAssignedAccounts = user.accounts.filter((accountId) =>
      accountIds.includes(accountId.toString())
    );

    if (alreadyAssignedAccounts.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Some accounts are already assigned to the user: ${alreadyAssignedAccounts.join(
          ", "
        )}`,
      });
    }

    // Filter out the accountIds that are already assigned
    const newAccountIds = accountIds.filter(
      (accountId) => !user.accounts.map(String).includes(accountId)
    );

    // Assuming each accountId is a valid ObjectId, you may want to add validation
    // to ensure that each accountId is a valid ObjectId before updating the user
    user.accounts.push(...newAccountIds);
    await user.save();

    res.status(200).json({
      success: true,
      message: "User accounts updated successfully",
      newlyAssignedAccounts: newAccountIds,
    });
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// not completely workable function

export const unassignAccounts = async (req, res) => {
  const { userId, accountIdsToDelete } = req.body;

  // Validate userId and accountIdsToDelete
  if (!userId || !accountIdsToDelete || !Array.isArray(accountIdsToDelete)) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid input. Provide userId and an array of accountIdsToDelete.",
    });
  }

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { accounts: { $in: accountIdsToDelete } } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Unassign successfully",
      userAccounts: user.accounts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
