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
