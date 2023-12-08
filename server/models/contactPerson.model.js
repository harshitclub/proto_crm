import mongoose, { Schema } from "mongoose";

const contactPersonSchema = new Schema(
  {
    account: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    designation: { type: String, required: true },
    location: { type: String },
    phone: { type: Number },
    landline: { type: Number },
  },
  { timestamps: true }
);

const ContactPerson = mongoose.model("Opportunity", contactPersonSchema);

export default ContactPerson;
