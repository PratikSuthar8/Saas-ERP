import mongoose from "mongoose";

const tenantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    logo: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    taxId: {
      type: String,
      default: "",
    },
    settings: {
      currency: { type: String, default: "USD" },
      dateFormat: { type: String, default: "MM/DD/YYYY" },
      timezone: { type: String, default: "UTC" },
    },
  },
  { timestamps: true }
);

export const Tenant = mongoose.model("Tenant", tenantSchema);
