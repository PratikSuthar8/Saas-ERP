import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../lib/api";
import Layout from "../../components/Layout";
import { Package, Plus, Edit, Trash2, Search, AlertTriangle } from "lucide-react";

interface Item {
  _id: string;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  quantity: number;
  minStock: number;
  costPrice: number;
  sellingPrice: number;
  isActive: boolean;
}

export default function ItemMaster() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    barcode: "",
    category: "Uncategorized",
    quantity: 0,
    minStock: 0,
    costPrice: 0,
    sellingPrice: 0,
    taxRate: 0,
    description: "",
  });
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

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure? This will also delete all transactions for this item.")) {
      await api.delete(`/inventory/${id}`);
      fetchItems();
    }
  };

  const openModal = (item?: Item) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        sku: item.sku,
        barcode: item.barcode || "",
        category: item.category || "Uncategorized",
        quantity: item.quantity,
        minStock: item.minStock || 0,
        costPrice: item.costPrice || 0,
        sellingPrice: item.sellingPrice || 0,
        taxRate: 0,
        description: "",
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
        sku: "",
        barcode: "",
        category: "Uncategorized",
        quantity: 0,
        minStock: 0,
        costPrice: 0,
        sellingPrice: 0,
        taxRate: 0,
        description: "",
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase()) ||
      item.barcode?.toLowerCase().includes(search.toLowerCase())
  );

  const lowStockItems = items.filter(item => item.quantity <= item.minStock);

  if (loading) {
    return (
      <Layout onLogout={logout}>
        <div className="flex items-center justify-center h-96 text-zinc-500">
          Loading items...
        </div>
      </Layout>
    );
  }

  return (
    <Layout onLogout={logout}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Item Master</h1>
          <p className="text-zinc-500 text-sm mt-1">
            Manage your products, pricing, and inventory
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all"
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {lowStockItems.length > 0 && (
        <div className="mb-6 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="text-amber-400" />
            <div>
              <p className="text-amber-400 font-medium">Low Stock Alert</p>
              <p className="text-amber-400/70 text-sm">
                {lowStockItems.length} product(s) are below minimum stock level
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
        <input
          type="text"
          placeholder="Search by name, SKU, or barcode..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800/50 border-b border-zinc-800">
              <tr>
                <th className="text-left p-4 text-zinc-400 font-medium text-sm">SKU</th>
                <th className="text-left p-4 text-zinc-400 font-medium text-sm">Name</th>
                <th className="text-left p-4 text-zinc-400 font-medium text-sm">Category</th>
                <th className="text-left p-4 text-zinc-400 font-medium text-sm">Stock</th>
                <th className="text-left p-4 text-zinc-400 font-medium text-sm">Cost Price</th>
                <th className="text-left p-4 text-zinc-400 font-medium text-sm">Selling Price</th>
                <th className="text-left p-4 text-zinc-400 font-medium text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item._id} className="border-b border-zinc-800 hover:bg-zinc-800/30">
                  <td className="p-4 font-mono text-sm text-white">{item.sku}</td>
                  <td className="p-4 text-white">{item.name}</td>
                  <td className="p-4 text-zinc-400">{item.category}</td>
                  <td className="p-4">
                    <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-medium ${
                      item.quantity <= item.minStock
                        ? "bg-red-500/10 text-red-400"
                        : "bg-emerald-500/10 text-emerald-400"
                    }`}>
                      {item.quantity} units
                    </span>
                  </td>
                  <td className="p-4 text-white">${item.costPrice}</td>
                  <td className="p-4 text-white">${item.sellingPrice}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal(item)}
                        className="p-1.5 rounded-lg text-indigo-400 hover:bg-indigo-500/10"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              {editingItem ? "Edit Product" : "Add New Product"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">SKU *</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Barcode</label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Product Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Minimum Stock</label>
                  <input
                    type="number"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Cost Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Selling Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50"
                >
                  {submitting ? "Saving..." : editingItem ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
