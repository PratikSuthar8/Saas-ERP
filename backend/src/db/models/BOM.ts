import mongoose from "mongoose";

const bomItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  scrapPercentage: {
    type: Number,
    default: 0,
  },
});

const bomSchema = new mongoose.Schema(
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
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    components: [bomItemSchema],
    quantity: {
      type: Number,
      default: 1,
    },
    version: {
      type: String,
      default: "1.0",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export const BOM = mongoose.model("BOM", bomSchema);
