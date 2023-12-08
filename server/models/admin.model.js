import mongoose, { Schema } from "mongoose";

const adminSchema = new Schema(
  {
    superAdmin: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    businessName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: Number,
      required: true,
      unique: true,
    },
    accounts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Account",
      },
    ],
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
