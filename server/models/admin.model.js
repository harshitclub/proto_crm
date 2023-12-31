import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";

const adminSchema = new Schema(
  {
    superAdmin: {
      type: Schema.Types.ObjectId,
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
      unique: true,
      validate: {
        validator: function (value) {
          return /^\d{10}$/.test(value);
        },
        message: "Invalid phone number format. Please enter a 10-digit number.",
      },
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
    todos: [
      {
        type: Schema.Types.ObjectId,
        ref: "TODO",
      },
    ],
    logo: {
      type: String, // URL or reference to the uploaded logo image
      default: "",
    },
    gstin: {
      type: String,
      default: "",
    },
    industry: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    address: {
      country: {
        type: String,
        default: "",
      },
      state: {
        type: String,
        default: "",
      },
      city: {
        type: String,
        default: "",
      },
      pincode: {
        type: String,
        default: "",
      },
      street: {
        type: String,
        default: "",
      },
      landmark: {
        type: String,
        default: "",
      },
    },
    social: {
      website: {
        type: String,
        default: "",
      },
      linkedin: {
        type: String,
        default: "",
      },
      twitter: {
        type: String,
        default: "",
      },
      facebook: {
        type: String,
        default: "",
      },
      instagram: {
        type: String,
        default: "",
      },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: String,
      enum: ["active", "block", "freeze"],
      default: "active",
    },
    role: {
      type: String,
      enum: ["Admin", "User"],
      default: "Admin",
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

adminSchema.methods.generateAccessToken = async function () {
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

adminSchema.methods.generateRefreshToken = async function () {
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

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
