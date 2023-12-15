import mongoose from "mongoose";
import Account from "../models/account.model.js";
import Admin from "../models/admin.model.js";
import { verifyJwtToken } from "../utils/jwtFunctions.js";
import validateMongoId from "../utils/validateMongoId.js";

export const addAccount = async (req, res) => {
  const { name, accountEmail, location, industries, website, remarks } =
    req.body;

  if (!name) {
    return res.status(400).send({
      success: false,
      message: "Name is required",
    });
  }

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

  // add account
  const newAccount = await Account({
    admin: adminID,
    name,
    accountEmail,
    location,
    industries,
    website,
    remarks,
  });

  const session = await mongoose.startSession();
  session.startTransaction(0);
  await newAccount.save();
  findAdmin.accounts.push(newAccount);
  await findAdmin.save();
  await session.commitTransaction();

  const createdAccount = await Account.findById(newAccount._id);

  res.status(201).json({
    success: true,
    message: "Account successfully.",
    data: createdAccount,
  });
};

export const getAccount = async (req, res) => {
  const accountId = req.params.id;

  // Validate if account ID is present
  if (!accountId) {
    return res.status(400).send({
      success: false,
      message: "Missing required parameter: account ID",
    });
  }

  try {
    // Attempt to find account by ID
    const account = await Account.findById(accountId)
      .populate("contactPerson")
      .populate("opportunities");

    // Check if account exists
    if (!account) {
      return res.status(404).send({
        success: false,
        message: "Account not found",
      });
    }

    // Send successful response with account data
    return res.status(200).json({
      success: true,
      message: "Account Fetched",
      account,
    });
  } catch (error) {
    console.error(error);

    // Handle specific error types
    if (error.name === "CastError") {
      return res.status(400).send({
        success: false,
        message: "Invalid account ID format",
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
