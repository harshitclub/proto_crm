import mongoose, { Schema } from "mongoose";

const todoSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: function () {
        if (this.todoType === "SuperAdmin") {
          return "SuperAdmin";
        } else if (this.todoType === "Admin") {
          return "Admin";
        } else {
          return "User";
        }
      },
    },
    todo: {
      type: String,
      required: true,
      maxlength: 125,
    },
    todoType: {
      type: String,
      enum: ["SuperAdmin", "Admin", "User"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "in progress"],
      required: true,
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
    },
  },
  {
    timestamps: true,
  }
);

const TODO = mongoose.model("TODO", todoSchema);

export default TODO;
