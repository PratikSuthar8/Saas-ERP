import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      default: "",
    },
    password: {
      type: String,
    },
    provider: {
      type: String,
      enum: ["local", "entra"],
      default: "local",
    },
    providerId: {
      type: String,
    },
    roles: {
      type: [String],
      enum: ["ADMIN", "MANAGER", "EMPLOYEE"],
      default: ["EMPLOYEE"],
    },
    mustChangePassword: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
