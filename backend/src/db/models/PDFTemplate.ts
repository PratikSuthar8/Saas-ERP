import mongoose from "mongoose";

const pdfTemplateSchema = new mongoose.Schema(
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
    documentType: {
      type: String,
      enum: ["purchase_order", "sales_order", "invoice", "bill", "bom"],
      required: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    content: {
      type: String,
      required: true,
    },
    css: {
      type: String,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const PDFTemplate = mongoose.model("PDFTemplate", pdfTemplateSchema);
