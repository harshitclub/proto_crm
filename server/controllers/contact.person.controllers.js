import mongoose from "mongoose";
import Account from "../models/account.model.js";
import ContactPerson from "../models/contactPerson.model.js";
import validateMongoId from "../utils/validateMongoId.js";

export const addContactPerson = async (req, res) => {
  const { accountId, name, email, designation, location, phone, landline } =
    req.body;

  if (!name || !designation) {
    return res.status(400).send({
      success: false,
      message: "Name and designation fields are required.",
    });
  }

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

export const updateContactPerson = async (req, res) => {
  const {
    contactPersonId,
    name,
    email,
    designation,
    location,
    phone,
    landline,
  } = req.body;
  try {
    validateMongoId(contactPersonId);

    const existingContactPerson = await ContactPerson.findById(contactPersonId);

    if (!existingContactPerson) {
      return res.status(404).json({
        success: false,
        message: "Contact person not found",
      });
    }

    // update other fields if provided

    if (name) existingContactPerson.name = name;
    if (email) existingContactPerson.email = email;
    if (designation) existingContactPerson.designation = designation;
    if (location) existingContactPerson.location = location;
    if (phone) existingContactPerson.phone = phone;
    if (landline) existingContactPerson.landline = landline;

    await existingContactPerson.save();

    res.status(200).json({
      success: true,
      message: "Contact person updated",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
