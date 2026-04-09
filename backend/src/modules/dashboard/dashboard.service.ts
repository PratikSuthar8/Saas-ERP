import { Item } from "../../db/models/Item";
import PurchaseOrder from "../../db/models/PurchaseOrder";
import { Sale } from "../../db/models/Sale";

export const getDashboardStats = async (tenantId: string) => {
  // BASIC STATS
  const totalItems = await Item.countDocuments({ tenantId });

  const items = await Item.find({ tenantId });
  const totalStock = items.reduce((sum, item) => sum + item.quantity, 0);

  const purchases = await PurchaseOrder.find({ tenantId });
  const totalPurchases = purchases.reduce((sum, p) => sum + p.quantity, 0);

  const sales = await Sale.find({ tenantId });
  const totalSales = sales.reduce((sum, sale) => {
    return sum + sale.items.reduce((s: number, i: any) => s + i.quantity, 0);
  }, 0);

  // 🔥 MONTHLY SALES (last 6 months)
  const monthlySalesMap: any = {};

  sales.forEach((sale) => {
    const month = new Date(sale.createdAt).toLocaleString("default", {
      month: "short",
    });

    const totalQty = sale.items.reduce(
      (s: number, i: any) => s + i.quantity,
      0
    );

    monthlySalesMap[month] =
      (monthlySalesMap[month] || 0) + totalQty;
  });

  const monthlySales = Object.keys(monthlySalesMap).map((month) => ({
    month,
    value: monthlySalesMap[month],
  }));

  // 🔥 MONTHLY PURCHASES
  const monthlyPurchaseMap: any = {};

  purchases.forEach((p) => {
    const month = new Date(p.createdAt).toLocaleString("default", {
      month: "short",
    });

    monthlyPurchaseMap[month] =
      (monthlyPurchaseMap[month] || 0) + p.quantity;
  });

  const monthlyPurchases = Object.keys(monthlyPurchaseMap).map((month) => ({
    month,
    value: monthlyPurchaseMap[month],
  }));

  // 🔥 TOP SELLING ITEMS
  const itemSalesMap: any = {};

  sales.forEach((sale) => {
    sale.items.forEach((item: any) => {
      itemSalesMap[item.itemId] =
        (itemSalesMap[item.itemId] || 0) + item.quantity;
    });
  });

  const topItems = Object.keys(itemSalesMap).map((itemId) => ({
    itemId,
    quantity: itemSalesMap[itemId],
  }));

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
