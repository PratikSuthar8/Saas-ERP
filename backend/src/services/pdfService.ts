import jsPDF from 'jspdf';

interface PDFItem {
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

interface PDFData {
  documentNumber: string;
  date: Date;
  company: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  supplier: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  items: PDFItem[];
}

export const generatePurchaseOrderPDF = async (data: PDFData): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new jsPDF();
      let yPos = 20;
      
      // Header
      doc.setFontSize(20);
      doc.setTextColor(79, 70, 229);
      doc.text(data.company.name, 20, yPos);
      
      yPos += 10;
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('PURCHASE ORDER', 20, yPos);
      
      yPos += 8;
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`#${data.documentNumber}`, 20, yPos);
      
      yPos += 15;
      
      // Supplier Info
      doc.setFontSize(11);
      doc.setTextColor(79, 70, 229);
      doc.text('SUPPLIER', 20, yPos);
      
      yPos += 6;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(data.supplier.name, 20, yPos);
      yPos += 5;
      doc.text(data.supplier.email, 20, yPos);
      yPos += 5;
      doc.text(data.supplier.phone, 20, yPos);
      yPos += 5;
      doc.text(data.supplier.address, 20, yPos);
      
      // Order Details
      yPos = 55;
      doc.setFontSize(11);
      doc.setTextColor(79, 70, 229);
      doc.text('ORDER DETAILS', 140, yPos);
      
      yPos += 6;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Date: ${data.date.toLocaleDateString()}`, 140, yPos);
      
      yPos = 85;
      
      // Table Headers
      doc.setFillColor(79, 70, 229);
      doc.rect(20, yPos, 170, 10, 'F');
      
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text('#', 25, yPos + 7);
      doc.text('SKU', 40, yPos + 7);
      doc.text('Description', 80, yPos + 7);
      doc.text('Qty', 130, yPos + 7);
      doc.text('Unit Price', 150, yPos + 7);
      doc.text('Total', 175, yPos + 7);
      
      yPos += 10;
      doc.setTextColor(0, 0, 0);
      
      // Table Rows
      let total = 0;
      for (let i = 0; i < data.items.length; i++) {
        const item = data.items[i];
        const itemTotal = item.quantity * item.unitPrice;
        total += itemTotal;
        
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFillColor(245, 245, 245);
        if (i % 2 === 0) {
          doc.rect(20, yPos, 170, 8, 'F');
        }
        
        doc.text((i + 1).toString(), 25, yPos + 5);
        doc.text(item.sku, 40, yPos + 5);
        doc.text(item.name.substring(0, 30), 80, yPos + 5);
        doc.text(item.quantity.toString(), 132, yPos + 5);
        doc.text(`$${item.unitPrice.toFixed(2)}`, 150, yPos + 5);
        doc.text(`$${itemTotal.toFixed(2)}`, 175, yPos + 5);
        
        yPos += 8;
      }
      
      // Total
      yPos += 10;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`Total: $${total.toFixed(2)}`, 140, yPos);
      
      // Footer
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(150, 150, 150);
      doc.text(`${data.company.name} | ${data.company.email} | ${data.company.phone}`, 20, pageHeight - 20);
      doc.text(data.company.address, 20, pageHeight - 15);
      
      const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
      resolve(pdfBuffer);
    } catch (error) {
      reject(error);
    }
  });
};

export const generateSalesOrderPDF = async (data: any): Promise<Buffer> => {
  return generatePurchaseOrderPDF(data);
};
