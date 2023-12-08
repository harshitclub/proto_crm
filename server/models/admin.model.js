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
    logo: {
      type: String, // URL or reference to the uploaded logo image
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      message: "Password must be at least 6 characters long.",
    },
  },
  { timestamps: true }
);

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
