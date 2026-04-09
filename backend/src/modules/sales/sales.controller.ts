import { Response } from "express";
import * as service from "./sales.service";
import { generatePurchaseOrderPDF } from "../../services/pdfService";

export const createSale = async (req: any, res: Response) => {
  const sale = await service.createSale(req.body, req.tenantId);
  res.json({
    success: true,
    data: sale,
  });
};

export const getSales = async (req: any, res: Response) => {
  const sales = await service.getSales(req.tenantId);
  res.json({
    success: true,
    data: sales,
  });
};

export const getSale = async (req: any, res: Response) => {
  const sale = await service.getSale(req.params.id, req.tenantId);
  res.json({
    success: true,
    data: sale,
  });
};

export const updateSaleStatus = async (req: any, res: Response) => {
  const { status } = req.body;
  const sale = await service.updateSaleStatus(req.params.id, status, req.tenantId);
  res.json({
    success: true,
    data: sale,
  });
};

export const downloadSalesOrderPDF = async (req: any, res: Response) => {
  try {
    const sale = await service.getSale(req.params.id, req.tenantId);
    if (!sale) {
      return res.status(404).json({ success: false, message: "Sales order not found" });
    }
    
    const company = await service.getCompanyDetails(req.tenantId);
    
    const items = (sale.items || []).map((item: any) => ({
      sku: item.itemId?.sku || 'N/A',
      name: item.itemId?.name || 'Unknown Product',
      quantity: item.quantity || 0,
      unitPrice: item.itemId?.sellingPrice || 0,
    }));
    
    const saleId = sale._id.toString();
    
    const pdfData = {
      documentNumber: saleId.slice(-8).toUpperCase(),
      date: sale.createdAt || new Date(),
      company: {
        name: company?.name || 'Your Company',
        email: company?.email || 'company@example.com',
        phone: company?.phone || '+1 234 567 8900',
        address: company?.address || 'Business Address',
      },
      supplier: {
        name: 'Customer',
        email: 'customer@example.com',
        phone: 'N/A',
        address: 'Customer Address',
      },
      items: items,
    };
    
    const pdf = await generatePurchaseOrderPDF(pdfData);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=SO-${saleId.slice(-8)}.pdf`);
    res.send(pdf);
  } catch (error: any) {
    console.error("PDF Generation Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to generate PDF",
      error: error.message 
    });
  }
};
