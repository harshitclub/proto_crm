import mongoose, { Schema } from "mongoose";

const accountSchema = new Schema(
  {
    sAdmin: {
      type: Schema.Types.ObjectId,
      ref: "SuperAdmin",
      required: true,
    },
    accountName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    location: {
      type: String,
      default: "",
    },
    industries: {
      type: String,
    },
    contactPerson: [
      {
        type: Schema.Types.ObjectId,
        ref: "ContactPerson",
      },
    ],
    opportunities: [
      {
        type: Schema.Types.ObjectId,
        ref: "Opportunity",
      },
    ],
    remarks: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Account = mongoose.model("Account", accountSchema);

export default Account;
