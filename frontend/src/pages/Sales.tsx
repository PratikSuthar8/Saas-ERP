import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import Layout from "../components/Layout";
import { ShoppingCart, Plus, Trash2, Package, Search, X } from "lucide-react";

interface Item {
  _id: string;
  name: string;
  sku: string;
  quantity: number;
}

interface SaleItem {
  itemId: string;
  name: string;
  sku: string;
  quantity: number;
  availableStock: number;
}

interface Sale {
  _id: string;
  items: SaleItem[];
  createdAt: string;
}

export default function Sales() {
  const [items, setItems] = useState<Item[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState<SaleItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchItems();
    fetchSales();
  }, []);

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

  const fetchSales = async () => {
    try {
      const response = await api.get("/sales");
      setSales(response.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addItemToSale = (item: Item) => {
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
          availableStock: item.quantity,
        },
      ]);
    }
    setSearchTerm("");
  };

  const removeItemFromSale = (itemId: string) => {
    setSelectedItems(selectedItems.filter((i) => i.itemId !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    const item = selectedItems.find((i) => i.itemId === itemId);
    if (item && quantity > item.availableStock) return;
    setSelectedItems(
      selectedItems.map((i) =>
        i.itemId === itemId ? { ...i, quantity } : i
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0) return;

    setSubmitting(true);
    try {
      await api.post("/sales", {
        items: selectedItems.map((i) => ({
          itemId: i.itemId,
          quantity: i.quantity,
        })),
      });
      await fetchItems();
      await fetchSales();
      setSelectedItems([]);
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

  const totalAmount = selectedItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  if (loading) {
    return (
      <Layout onLogout={logout}>
        <div className="flex items-center justify-center h-96 text-zinc-500">
          Loading sales...
        </div>
      </Layout>
    );
  }

  return (
    <Layout onLogout={logout}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Sales</h1>
          <p className="text-zinc-500 text-sm mt-1">
            Create and manage sales orders
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all"
        >
          <Plus size={18} />
          New Sale
        </button>
      </div>

      {/* Sales History */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-zinc-800">
          <h2 className="text-white font-medium">Recent Sales</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800/50 border-b border-zinc-800">
              <tr>
                <th className="text-left p-4 text-zinc-400 font-medium text-sm">Date</th>
                <th className="text-left p-4 text-zinc-400 font-medium text-sm">Items</th>
                <th className="text-left p-4 text-zinc-400 font-medium text-sm">Total Quantity</th>
              </tr>
            </thead>
            <tbody>
              {sales.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center p-8 text-zinc-500">
                    No sales yet
                  </td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <tr key={sale._id} className="border-b border-zinc-800">
                    <td className="p-4 text-white">
                      {new Date(sale.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-zinc-400">
                      {sale.items.map((i) => i.name).join(", ")}
                    </td>
                    <td className="p-4 text-white">
                      {sale.items.reduce((sum, i) => sum + i.quantity, 0)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Sale Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">New Sale Order</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedItems([]);
                  setSearchTerm("");
                }}
                className="text-zinc-400 hover:text-white transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6">
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
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
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
                        onClick={() => addItemToSale(item)}
                        className="flex items-center justify-between p-3 hover:bg-zinc-700 cursor-pointer border-b border-zinc-700 last:border-0"
                      >
                        <div>
                          <p className="text-white font-medium">{item.name}</p>
                          <p className="text-zinc-500 text-sm">{item.sku}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-zinc-400 text-sm">
                            Stock: {item.quantity}
                          </p>
                          <button className="text-indigo-400 text-sm mt-1">
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
                    Selected Items ({selectedItems.length})
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
                          <p className="text-zinc-500 text-xs mt-1">
                            Available: {item.availableStock}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuantity(item.itemId, parseInt(e.target.value) || 1)
                            }
                            min="1"
                            max={item.availableStock}
                            className="w-20 px-2 py-1 bg-zinc-700 border border-zinc-600 rounded text-white text-center"
                          />
                          <button
                            onClick={() => removeItemFromSale(item.itemId)}
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
              <div className="flex justify-between items-center mb-4">
                <span className="text-zinc-400">Total Items:</span>
                <span className="text-white font-semibold">{totalAmount}</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedItems([]);
                    setSearchTerm("");
                  }}
                  className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || selectedItems.length === 0}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition disabled:opacity-50"
                >
                  {submitting ? "Processing..." : "Complete Sale"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
