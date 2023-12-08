import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
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
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: { type: Number, required: true },
    designation: { type: String, required: true },
    location: { type: String, required: true },
    role: {
      type: String,
      enum: ["User", "AccountManager"],
      default: "User",
    },
    accounts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Account",
      },
    ],
    password: { type: String, required: true },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
