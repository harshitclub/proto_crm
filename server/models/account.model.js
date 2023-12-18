import mongoose, { Schema } from "mongoose";

const accountSchema = new Schema(
  {
    admin: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    accountEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
      unique: false,
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
    website: {
      type: String,
      default: "",
    },
    remarks: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Account = mongoose.model("Account", accountSchema);

export default Account;
