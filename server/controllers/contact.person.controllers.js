import mongoose from "mongoose";
import Account from "../models/account.model.js";
import ContactPerson from "../models/contactPerson.model.js";
import validateMongoId from "../utils/validateMongoId.js";

export const addContactPerson = async (req, res) => {
  const { name, email, designation, location, phone, landline } = req.body;

  if (!name || !designation) {
    return res.status(400).send({
      success: false,
      message: "Name and designation fields are required.",
    });
  }

  const accountId = req.params.id;

  validateMongoId(accountId);

  const account = await Account.findById(accountId);

  if (!account) {
    return res.status(401).send({
      success: false,
      message: "Something Went wrong from account",
    });
  }

  const newContactPerson = await ContactPerson({
    account: accountId,
    name,
    email,
    designation,
    location,
    phone,
    landline,
  });

  const session = await mongoose.startSession();
  session.startTransaction();
  await newContactPerson.save();

  account.contactPerson.push(newContactPerson);
  await account.save();
  await session.commitTransaction();

  res.status(201).json({ success: true, message: "Contact Person Added" });
};
