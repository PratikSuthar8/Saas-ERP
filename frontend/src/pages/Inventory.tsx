import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import Layout from "../components/Layout";
import { Package, Plus, Edit, Trash2, TrendingUp, TrendingDown, Search } from "lucide-react";

interface Item {
  _id: string;
  name: string;
  sku: string;
  quantity: number;
  createdAt: string;
}

export default function Inventory() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [formData, setFormData] = useState({ name: "", sku: "", quantity: 0 });
  const [stockData, setStockData] = useState({ type: "IN", quantity: 0, note: "" });
  const [submitting, setSubmitting] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchItems();
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
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingItem) {
        await api.put(`/inventory/${editingItem._id}`, formData);
      } else {
        await api.post("/inventory", formData);
      }
      await fetchItems();
      closeModal();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStockAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/inventory/adjust", {
        itemId: selectedItem?._id,
        type: stockData.type,
        quantity: stockData.quantity,
        note: stockData.note,
      });
      await fetchItems();
      closeStockModal();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      try {
        await api.delete(`/inventory/${id}`);
        await fetchItems();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const openModal = (item?: Item) => {
    if (item) {
      setEditingItem(item);
      setFormData({ name: item.name, sku: item.sku, quantity: item.quantity });
    } else {
      setEditingItem(null);
      setFormData({ name: "", sku: "", quantity: 0 });
    }
    setShowModal(true);
  };

  const openStockModal = (item: Item) => {
    setSelectedItem(item);
    setStockData({ type: "IN", quantity: 0, note: "" });
    setShowStockModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({ name: "", sku: "", quantity: 0 });
  };

  const closeStockModal = () => {
    setShowStockModal(false);
    setSelectedItem(null);
    setStockData({ type: "IN", quantity: 0, note: "" });
  };

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase())
  );

  const totalStock = items.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <Layout onLogout={logout}>
        <div className="flex items-center justify-center h-96 text-zinc-500">Loading inventory...</div>
      </Layout>
    );
  }

  return (
    <Layout onLogout={logout}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Inventory</h1>
          <p className="text-zinc-500 text-sm mt-1">Manage your products and stock</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all"
        >
          <Plus size={18} />
          Add Item
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 w-fit mb-3">
            <Package size={18} />
          </div>
          <p className="text-zinc-500 text-xs uppercase">Total Items</p>
          <p className="text-2xl font-semibold text-white mt-1">{items.length}</p>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 w-fit mb-3">
            <Package size={18} />
          </div>
          <p className="text-zinc-500 text-xs uppercase">Total Stock</p>
          <p className="text-2xl font-semibold text-white mt-1">{totalStock}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
        <input
          type="text"
          placeholder="Search by name or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      {/* Items Table */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800/50 border-b border-zinc-800">
              <tr>
                <th className="text-left p-4 text-zinc-400 font-medium text-sm">Name</th>
                <th className="text-left p-4 text-zinc-400 font-medium text-sm">SKU</th>
                <th className="text-left p-4 text-zinc-400 font-medium text-sm">Stock</th>
                <th className="text-left p-4 text-zinc-400 font-medium text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center p-8 text-zinc-500">
                    No items found
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item._id} className="border-b border-zinc-800 hover:bg-zinc-800/30 transition">
                    <td className="p-4 text-white">{item.name}</td>
                    <td className="p-4 text-zinc-400 text-sm">{item.sku}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex px-2 py-1 rounded-lg text-xs font-medium ${
                          item.quantity < 10
                            ? "bg-red-500/10 text-red-400"
                            : "bg-emerald-500/10 text-emerald-400"
                        }`}
                      >
                        {item.quantity} units
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openStockModal(item)}
                          className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition"
                          title="Adjust Stock"
                        >
                          {item.quantity > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        </button>
                        <button
                          onClick={() => openModal(item)}
                          className="p-1.5 rounded-lg text-indigo-400 hover:bg-indigo-500/10 transition"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              {editingItem ? "Edit Item" : "Add New Item"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">SKU</label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Initial Quantity</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition disabled:opacity-50"
                >
                  {submitting ? "Saving..." : editingItem ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Adjust Modal */}
      {showStockModal && selectedItem && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Adjust Stock: {selectedItem.name}
            </h2>
            <form onSubmit={handleStockAdjust} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Type</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStockData({ ...stockData, type: "IN" })}
                    className={`flex-1 py-2 rounded-lg transition ${
                      stockData.type === "IN"
                        ? "bg-emerald-600 text-white"
                        : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                    }`}
                  >
                    IN (Add Stock)
                  </button>
                  <button
                    type="button"
                    onClick={() => setStockData({ ...stockData, type: "OUT" })}
                    className={`flex-1 py-2 rounded-lg transition ${
                      stockData.type === "OUT"
                        ? "bg-rose-600 text-white"
                        : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                    }`}
                  >
                    OUT (Remove Stock)
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Quantity</label>
                <input
                  type="number"
                  value={stockData.quantity}
                  onChange={(e) => setStockData({ ...stockData, quantity: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  required
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Note (optional)</label>
                <input
                  type="text"
                  value={stockData.note}
                  onChange={(e) => setStockData({ ...stockData, note: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  placeholder="Purchase, Sale, Adjustment, etc."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeStockModal}
                  className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || stockData.quantity < 1}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition disabled:opacity-50"
                >
                  {submitting ? "Processing..." : "Confirm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
