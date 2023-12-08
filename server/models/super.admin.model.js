import mongoose, { Schema } from "mongoose";

const superAdminSchema = new Schema({
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
  password: {
    type: String,
    required: true,
  },
});

const SuperAdmin = mongoose.model("SuperAdmin", superAdminSchema);

export default SuperAdmin;
