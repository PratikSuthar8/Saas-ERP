const { PurchaseOrder } = require("../../db/models/PurchaseOrder");

exports.createPurchaseOrder = async (data) => {
  return PurchaseOrder.create(data);
};

exports.getPurchaseOrders = async (tenantId) => {
  return PurchaseOrder.find({ tenantId })
    .populate('supplierId', 'name contactEmail phone address')
    .populate('items.itemId', 'name sku costPrice')
    .sort({ createdAt: -1 });
};

exports.getPurchaseOrder = async (id, tenantId) => {
  return PurchaseOrder.findOne({ _id: id, tenantId })
    .populate('supplierId', 'name contactEmail phone address')
    .populate('items.itemId', 'name sku costPrice');
};
