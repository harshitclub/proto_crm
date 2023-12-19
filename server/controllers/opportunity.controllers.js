import validateMongoId from "../utils/validateMongoId.js";
import Account from "../models/account.model.js";
import Opportunity from "../models/opportunity.model.js";
import mongoose from "mongoose";

export const addOpportunity = async (req, res) => {
  const {
    accountId,
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

export const updateOpportunity = async (req, res) => {
  const {
    opportunityId,
    name,
    commercial,
    duration,
    startDate,
    expectedDeliveryDate,
    proposition,
    remarks,
  } = req.body;

  try {
    // Validate if opportunityId is a valid MongoDB ObjectId
    validateMongoId(opportunityId);

    // Check if the opportunity exists
    const existingOpportunity = await Opportunity.findById(opportunityId);

    if (!existingOpportunity) {
      return res.status(404).json({
        success: false,
        message: "Opportunity not found",
      });
    }

    // Update other fields if provided
    if (name) existingOpportunity.name = name;
    // Handle updates to the commercial field
    if (commercial) {
      if (commercial.currency)
        existingOpportunity.commercial.currency = commercial.currency;
      if (commercial.amount)
        existingOpportunity.commercial.amount = commercial.amount;
    }
    if (duration) existingOpportunity.duration = duration;
    if (startDate) existingOpportunity.startDate = startDate;
    if (expectedDeliveryDate)
      existingOpportunity.expectedDeliveryDate = expectedDeliveryDate;
    if (proposition) existingOpportunity.proposition = proposition;
    if (remarks) existingOpportunity.remarks = remarks;

    // Save the updated opportunity
    await existingOpportunity.save();

    res.status(200).json({
      success: true,
      message: "Opportunity updated",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteOppotunity = async (req, res) => {
  const { opportunityId } = req.body;

  try {
    validateMongoId(opportunityId);

    const opportunity = await Opportunity.findByIdAndDelete({
      _id: opportunityId,
    }).populate("account");

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: "Opportunity not found",
      });
    }

    await opportunity.account.opportunities.pull(opportunity);

    await opportunity.account.save();

    return res.status(200).json({
      success: true,
      message: "Opportunity deleted",
    });
  } catch (error) {
    console.error(error);
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid opportunity ID format",
      });
    } else if (error.name === "NotFoundError") {
      return res.status(404).json({
        message: "Opportunity not found",
      });
    } else {
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }
};
