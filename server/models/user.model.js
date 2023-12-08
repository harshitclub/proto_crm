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
      match: [/^\S+@\S+\.\S+$/, "Invalid email format."],
    },
    phone: {
      type: Number,
      required: true,
      validate: {
        validator: function (value) {
          return /^\d{10}$/.test(value);
        },
        message: "Invalid phone number format. Please enter a 10-digit number.",
      },
    },
    designation: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
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
    password: {
      type: String,
      required: true,
      minlength: 6,
      message: "Password must be at least 6 characters long.",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
