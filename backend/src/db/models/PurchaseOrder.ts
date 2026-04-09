import mongoose from "mongoose";

const purchaseItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
});

const purchaseOrderSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
    items: [purchaseItemSchema],
    status: {
      type: String,
      enum: ["DRAFT", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"],
      default: "CONFIRMED",
    },
  },
  { timestamps: true }
);

export const PurchaseOrder = mongoose.model("PurchaseOrder", purchaseOrderSchema);
export default PurchaseOrder;
