const { Response } = require("express");
const service = require("./purchase.service");
const { generatePurchaseOrderPDF } = require("../../services/pdfService");

exports.createPurchaseOrder = async (req, res) => {
  const order = await service.createPurchaseOrder(req.body, req.tenantId);
  res.json({ success: true, data: order });
};

exports.getPurchaseOrders = async (req, res) => {
  const orders = await service.getPurchaseOrders(req.tenantId);
  res.json({ success: true, data: orders });
};

exports.getPurchaseOrder = async (req, res) => {
  const order = await service.getPurchaseOrder(req.params.id, req.tenantId);
  res.json({ success: true, data: order });
};

exports.downloadPurchaseOrderPDF = async (req, res) => {
  try {
    const order = await service.getPurchaseOrder(req.params.id, req.tenantId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Purchase order not found" });
    }
    
    const company = await service.getCompanyDetails(req.tenantId);
    const supplier = order.supplierId || {};
    
    const items = (order.items || []).map((item) => ({
      sku: item.itemId?.sku || 'N/A',
      name: item.itemId?.name || 'Unknown Product',
      quantity: item.quantity || 0,
      unitPrice: item.itemId?.costPrice || 0,
    }));
    
    const orderId = order._id.toString();
    
    const pdfData = {
      documentNumber: orderId.slice(-8).toUpperCase(),
      date: order.createdAt || new Date(),
      company: {
        name: company?.name || 'Your Company',
        email: company?.email || 'company@example.com',
        phone: company?.phone || '+1 234 567 8900',
        address: company?.address || 'Business Address',
      },
      supplier: {
        name: supplier.name || 'Unknown Supplier',
        email: supplier.contactEmail || 'supplier@example.com',
        phone: supplier.phone || '+1 234 567 8900',
        address: supplier.address || 'Supplier Address',
      },
      items: items,
    };
    
    const pdf = await generatePurchaseOrderPDF(pdfData);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=PO-${orderId.slice(-8)}.pdf`);
    res.send(pdf);
  } catch (error) {
    console.error("PDF Generation Error:", error);
    res.status(500).json({ success: false, message: "Failed to generate PDF" });
  }
};
