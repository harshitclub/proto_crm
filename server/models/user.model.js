import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";

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
    todos: [
      {
        type: Schema.Types.ObjectId,
        ref: "TODO",
      },
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: String,
      enum: ["active", "block", "freeze"],
      default: "active",
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      message: "Password must be at least 6 characters long.",
    },
    refreshToken: String,
  },
  { timestamps: true }
);

userSchema.methods.generateAccessToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
      role: this.role,
      isVerified: this.isVerified,
      isActive: this.isActive,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
      role: this.role,
      isVerified: this.isVerified,
      isActive: this.isActive,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

const User = mongoose.model("User", userSchema);

export default User;
