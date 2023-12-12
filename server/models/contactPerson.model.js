import mongoose, { Schema } from "mongoose";

const contactPersonSchema = new Schema(
  {
    account: { type: Schema.Types.ObjectId, ref: "Account", required: true },
    name: { type: String, required: true },
    email: { type: String, trim: true, lowercase: true },
    designation: { type: String, required: true },
    location: { type: String },
    phone: { type: Number },
    landline: { type: Number },
  },
  { timestamps: true }
);

const ContactPerson = mongoose.model("ContactPerson", contactPersonSchema);

export default ContactPerson;
