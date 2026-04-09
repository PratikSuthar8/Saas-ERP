import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
    },
    barcode: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      default: "Uncategorized",
    },
    unitOfMeasure: {
      type: String,
      default: "EA",
    },
    quantity: {
      type: Number,
      default: 0,
    },
    minStock: {
      type: Number,
      default: 0,
    },
    maxStock: {
      type: Number,
      default: 0,
    },
    costPrice: {
      type: Number,
      default: 0,
    },
    sellingPrice: {
      type: Number,
      default: 0,
    },
    taxRate: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    images: [{
      type: String,
    }],
    attributes: {
      type: Map,
      of: String,
      default: {},
    },
  },
  { timestamps: true }
);

export const Item = mongoose.model("Item", itemSchema);
