import { Sale } from "../../db/models/Sale";

export const createSale = async (data: any) => {
  return Sale.create(data);
};

export const getSales = async (tenantId: string) => {
  return Sale.find({ tenantId });
};
