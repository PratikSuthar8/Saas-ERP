import { Item } from "../../db/models/Item";
import PurchaseOrder from "../../db/models/PurchaseOrder";
import { Sale } from "../../db/models/Sale";

export const getDashboardStats = async (tenantId: string) => {
  // Total Items
  const totalItems = await Item.countDocuments({ tenantId });
  
  // Total Stock
  const items = await Item.find({ tenantId });
  const totalStock = items.reduce((sum, item) => sum + item.quantity, 0);
  
  // Total Purchases - Get ALL purchases and sum quantities
  const purchases = await PurchaseOrder.find({ tenantId });
  let totalPurchases = 0;
  for (const purchase of purchases) {
    for (const item of purchase.items) {
      totalPurchases += item.quantity;
    }
  }
  
  // Total Sales - Get ALL sales and sum quantities
  const sales = await Sale.find({ tenantId });
  let totalSales = 0;
  for (const sale of sales) {
    for (const item of sale.items) {
      totalSales += item.quantity;
    }
  }
  
  // Monthly Sales (last 6 months)
  const monthlySalesMap: any = {};
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  sales.forEach((sale) => {
    const saleDate = new Date(sale.createdAt);
    if (saleDate >= sixMonthsAgo) {
      const month = saleDate.toLocaleString("default", { month: "short" });
      const totalQty = sale.items.reduce((s: number, i: any) => s + i.quantity, 0);
      monthlySalesMap[month] = (monthlySalesMap[month] || 0) + totalQty;
    }
  });
  
  const monthlySales = Object.keys(monthlySalesMap).map((month) => ({
    month,
    value: monthlySalesMap[month],
  }));
  
  // Monthly Purchases
  const monthlyPurchaseMap: any = {};
  purchases.forEach((purchase) => {
    const purchaseDate = new Date(purchase.createdAt);
    if (purchaseDate >= sixMonthsAgo) {
      const month = purchaseDate.toLocaleString("default", { month: "short" });
      const totalQty = purchase.items.reduce((s: number, i: any) => s + i.quantity, 0);
      monthlyPurchaseMap[month] = (monthlyPurchaseMap[month] || 0) + totalQty;
    }
  });
  
  const monthlyPurchases = Object.keys(monthlyPurchaseMap).map((month) => ({
    month,
    value: monthlyPurchaseMap[month],
  }));
  
  // Top Selling Items
  const itemSalesMap: any = {};
  sales.forEach((sale) => {
    sale.items.forEach((item: any) => {
      itemSalesMap[item.itemId] = (itemSalesMap[item.itemId] || 0) + item.quantity;
    });
  });
  
  const topItems = await Promise.all(
    Object.keys(itemSalesMap).map(async (itemId) => {
      const item = await Item.findById(itemId);
      return {
        itemId,
        name: item?.name || "Unknown",
        quantity: itemSalesMap[itemId],
      };
    })
  );
  
  console.log("Dashboard Stats:", {
    totalItems,
    totalStock,
    totalPurchases,
    totalSales,
    purchasesCount: purchases.length,
    salesCount: sales.length,
  });
  
  return {
    totalItems,
    totalStock,
    totalPurchases,
    totalSales,
    monthlySales,
    monthlyPurchases,
    topItems,
  };
};
