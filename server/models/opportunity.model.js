import mongoose, { Schema } from "mongoose";

const opportunitySchema = new Schema(
  {
    account: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    commercial: {
      currency: {
        type: String,
        enum: ["INR", "USD"],
      },
      amount: Number,
    },
    duration: {
      type: String,
      default: "",
    },
    startDate: {
      type: Date,
      default: Date.now(),
    },
    expectedDeliveryDate: {
      type: Date,
      default: Date.now(),
    },
    proposition: {
      type: String,
      enum: ["COLD", "WARM", "HOT", "CLOSED", "LOST"],
      default: "COLD",
    },
    remarks: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Opportunity = mongoose.model("Opportunity", opportunitySchema);

export default Opportunity;
