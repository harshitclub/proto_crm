import validateMongoId from "../utils/validateMongoId.js";
import Account from "../models/account.model.js";
import Opportunity from "../models/opportunity.model.js";
import mongoose from "mongoose";

export const addOpportunity = async (req, res) => {
  const {
    name,
    commercial: { currency, amount },
    duration,
    startDate,
    expectedDeliveryDate,
    proposition,
    remarks,
  } = req.body;

  if (!name || !proposition) {
    return res.status(400).send({
      success: false,
      message: "Name and proposition fields are required.",
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

  const newOpportunity = await Opportunity({
    account: accountId,
    name,
    commercial: { currency, amount },
    duration,
    startDate,
    expectedDeliveryDate,
    proposition,
    remarks,
  });

  const session = await mongoose.startSession();
  session.startTransaction();
  await newOpportunity.save();

  account.opportunities.push(newOpportunity);
  await account.save();
  await session.commitTransaction();

  res.status(201).json({ success: true, message: "Opportunity Added" });
};
