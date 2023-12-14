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
