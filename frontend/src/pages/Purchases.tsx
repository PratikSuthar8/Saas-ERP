import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import Layout from "../components/Layout";
import { Truck, Plus, Trash2, Package, Search, X, Building2 } from "lucide-react";

interface Item {
  _id: string;
  name: string;
  sku: string;
  quantity: number;
}

interface Supplier {
  _id: string;
  name: string;
  contactEmail: string;
  phone: string;
}

interface PurchaseItem {
  itemId: string;
  name: string;
  sku: string;
  quantity: number;
}

interface Purchase {
  _id: string;
  supplierId: string;
  items: PurchaseItem[];
  createdAt: string;
}

export default function Purchases() {
  const [items, setItems] = useState<Item[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<string>("");
  const [selectedItems, setSelectedItems] = useState<PurchaseItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchItems(),
        fetchSuppliers(),
        fetchPurchases()
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await api.get("/inventory");
      setItems(response.data.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        logout();
        navigate("/login");
      }
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await api.get("/supplier");
      setSuppliers(response.data.data);
    } catch (err) {
      console.error("Failed to fetch suppliers:", err);
    }
  };

  const fetchPurchases = async () => {
    try {
      const response = await api.get("/purchase");
      setPurchases(response.data.data);
    } catch (err) {
      console.error("Failed to fetch purchases:", err);
    }
  };

  const getSupplierName = (supplierId: string) => {
    const supplier = suppliers.find(s => s._id === supplierId);
    return supplier ? supplier.name : "Unknown Supplier";
  };

  const addItemToPurchase = (item: Item) => {
    const existing = selectedItems.find((i) => i.itemId === item._id);
    if (existing) {
      setSelectedItems(
        selectedItems.map((i) =>
          i.itemId === item._id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      );
    } else {
      setSelectedItems([
        ...selectedItems,
        {
          itemId: item._id,
          name: item.name,
          sku: item.sku,
          quantity: 1,
        },
      ]);
    }
    setSearchTerm("");
  };

  const removeItemFromPurchase = (itemId: string) => {
    setSelectedItems(selectedItems.filter((i) => i.itemId !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    setSelectedItems(
      selectedItems.map((i) =>
        i.itemId === itemId ? { ...i, quantity } : i
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0 || !selectedSupplier) return;

    setSubmitting(true);
    try {
      await api.post("/purchase", {
        supplierId: selectedSupplier,
        items: selectedItems.map((i) => ({
          itemId: i.itemId,
          quantity: i.quantity,
        })),
      });
      await fetchAllData();
      setSelectedItems([]);
      setSelectedSupplier("");
      setShowModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalQuantity = selectedItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const selectedSupplierData = suppliers.find((s) => s._id === selectedSupplier);

  if (loading) {
    return (
      <Layout onLogout={logout}>
        <div className="flex items-center justify-center h-96 text-zinc-500">
          Loading purchases...
        </div>
      </Layout>
    );
  }

  return (
    <Layout onLogout={logout}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Purchases</h1>
          <p className="text-zinc-500 text-sm mt-1">
            Manage purchase orders from suppliers
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all"
        >
          <Plus size={18} />
          New Purchase Order
        </button>
      </div>

      {/* Purchase History */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-zinc-800">
          <h2 className="text-white font-medium">Purchase History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800/50 border-b border-zinc-800">
              <tr>
                <th className="text-left p-4 text-zinc-400 font-medium text-sm">Date</th>
                <th className="text-left p-4 text-zinc-400 font-medium text-sm">Supplier</th>
                <th className="text-left p-4 text-zinc-400 font-medium text-sm">Items</th>
                <th className="text-left p-4 text-zinc-400 font-medium text-sm">Total Quantity</th>
              </tr>
            </thead>
            <tbody>
              {purchases.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center p-8 text-zinc-500">
                    No purchase orders yet
                  </td>
                </tr>
              ) : (
                purchases.map((purchase) => (
                  <tr key={purchase._id} className="border-b border-zinc-800">
                    <td className="p-4 text-white">
                      {new Date(purchase.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-white">
                      {getSupplierName(purchase.supplierId)}
                    </td>
                    <td className="p-4 text-zinc-400">
                      {purchase.items?.map((i) => i.name).join(", ") || "No items"}
                    </td>
                    <td className="p-4 text-white">
                      {purchase.items?.reduce((sum, i) => sum + i.quantity, 0) || 0}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Purchase Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">New Purchase Order</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedItems([]);
                  setSelectedSupplier("");
                  setSearchTerm("");
                }}
                className="text-zinc-400 hover:text-white transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6">
              {/* Select Supplier */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Select Supplier
                </label>
                <select
                  value={selectedSupplier}
                  onChange={(e) => setSelectedSupplier(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">Choose a supplier...</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier._id} value={supplier._id}>
                      {supplier.name} - {supplier.contactEmail}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Items */}
              <div className="relative mb-6">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search products to add..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Search Results */}
              {searchTerm && (
                <div className="mb-6 bg-zinc-800 rounded-lg overflow-hidden">
                  {filteredItems.length === 0 ? (
                    <div className="p-4 text-zinc-500 text-center">
                      No products found
                    </div>
                  ) : (
                    filteredItems.map((item) => (
                      <div
                        key={item._id}
                        onClick={() => addItemToPurchase(item)}
                        className="flex items-center justify-between p-3 hover:bg-zinc-700 cursor-pointer border-b border-zinc-700 last:border-0"
                      >
                        <div>
                          <p className="text-white font-medium">{item.name}</p>
                          <p className="text-zinc-500 text-sm">{item.sku}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-zinc-400 text-sm">
                            Current Stock: {item.quantity}
                          </p>
                          <button className="text-emerald-400 text-sm mt-1">
                            Add
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Selected Items */}
              {selectedItems.length > 0 && (
                <div>
                  <h3 className="text-white font-medium mb-3">
                    Items to Purchase ({selectedItems.length})
                  </h3>
                  <div className="space-y-3">
                    {selectedItems.map((item) => (
                      <div
                        key={item.itemId}
                        className="bg-zinc-800 rounded-lg p-3 flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <p className="text-white font-medium">{item.name}</p>
                          <p className="text-zinc-500 text-sm">{item.sku}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuantity(item.itemId, parseInt(e.target.value) || 1)
                            }
                            min="1"
                            className="w-20 px-2 py-1 bg-zinc-700 border border-zinc-600 rounded text-white text-center"
                          />
                          <button
                            onClick={() => removeItemFromPurchase(item.itemId)}
                            className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-zinc-800">
              {selectedSupplierData && (
                <div className="flex items-center gap-2 mb-4 p-3 bg-emerald-500/10 rounded-lg">
                  <Building2 size={16} className="text-emerald-400" />
                  <span className="text-emerald-400 text-sm">
                    Supplier: {selectedSupplierData.name}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center mb-4">
                <span className="text-zinc-400">Total Items:</span>
                <span className="text-white font-semibold">{totalQuantity}</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedItems([]);
                    setSelectedSupplier("");
                    setSearchTerm("");
                  }}
                  className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || selectedItems.length === 0 || !selectedSupplier}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition disabled:opacity-50"
                >
                  {submitting ? "Processing..." : "Create Purchase Order"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
