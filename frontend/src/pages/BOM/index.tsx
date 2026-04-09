import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../lib/api";
import Layout from "../../components/Layout";
import { Layers, Plus, Edit, Trash2, Search } from "lucide-react";

interface BOMItem {
  _id: string;
  name: string;
  productId: { _id: string; name: string; sku: string };
  components: Array<{ itemId: { _id: string; name: string; sku: string }; quantity: number }>;
  quantity: number;
  version: string;
  isActive: boolean;
}

export default function BOM() {
  const [boms, setBoms] = useState<BOMItem[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingBOM, setEditingBOM] = useState<BOMItem | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    productId: "",
    components: [] as Array<{ itemId: string; quantity: number }>,
    quantity: 1,
    version: "1.0",
  });
  const [selectedComponent, setSelectedComponent] = useState({ itemId: "", quantity: 1 });
  const [submitting, setSubmitting] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBOMs();
    fetchItems();
  }, []);

  const fetchBOMs = async () => {
    try {
      const response = await api.get("/bom");
      setBoms(response.data.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        logout();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await api.get("/inventory");
      setItems(response.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const addComponent = () => {
    if (selectedComponent.itemId && selectedComponent.quantity > 0) {
      setFormData({
        ...formData,
        components: [...formData.components, selectedComponent],
      });
      setSelectedComponent({ itemId: "", quantity: 1 });
    }
  };

  const removeComponent = (index: number) => {
    const newComponents = [...formData.components];
    newComponents.splice(index, 1);
    setFormData({ ...formData, components: newComponents });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingBOM) {
        await api.put(`/bom/${editingBOM._id}`, formData);
      } else {
        await api.post("/bom", formData);
      }
      await fetchBOMs();
      closeModal();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const openModal = (bom?: BOMItem) => {
    if (bom) {
      setEditingBOM(bom);
      setFormData({
        name: bom.name,
        productId: bom.productId._id,
        components: bom.components.map(c => ({ itemId: c.itemId._id, quantity: c.quantity })),
        quantity: bom.quantity,
        version: bom.version,
      });
    } else {
      setEditingBOM(null);
      setFormData({
        name: "",
        productId: "",
        components: [],
        quantity: 1,
        version: "1.0",
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingBOM(null);
    setFormData({ name: "", productId: "", components: [], quantity: 1, version: "1.0" });
  };

  const filteredBOMs = boms.filter(bom =>
    bom.name.toLowerCase().includes(search.toLowerCase()) ||
    bom.productId.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <Layout onLogout={logout}>
        <div className="flex items-center justify-center h-96 text-zinc-500">
          Loading BOMs...
        </div>
      </Layout>
    );
  }

  return (
    <Layout onLogout={logout}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Bill of Materials</h1>
          <p className="text-zinc-500 text-sm mt-1">
            Define product structures and components
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
        >
          <Plus size={18} />
          Create BOM
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
        <input
          type="text"
          placeholder="Search BOMs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-lg text-white"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredBOMs.map((bom) => (
          <div key={bom._id} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10">
                  <Layers size={18} className="text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium">{bom.name}</h3>
                  <p className="text-zinc-500 text-sm">Product: {bom.productId.name}</p>
                  <p className="text-zinc-500 text-xs">Version: {bom.version}</p>
                </div>
              </div>
              <button
                onClick={() => openModal(bom)}
                className="p-1.5 rounded-lg text-indigo-400 hover:bg-indigo-500/10"
              >
                <Edit size={16} />
              </button>
            </div>
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <p className="text-zinc-400 text-sm mb-2">Components ({bom.components.length}):</p>
              <div className="space-y-1">
                {bom.components.slice(0, 3).map((comp, idx) => (
                  <div key={idx} className="text-sm text-zinc-500">
                    • {comp.itemId.name} x{comp.quantity}
                  </div>
                ))}
                {bom.components.length > 3 && (
                  <div className="text-sm text-zinc-500">+{bom.components.length - 3} more</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Create/Edit BOM */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              {editingBOM ? "Edit BOM" : "Create Bill of Materials"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">BOM Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Finished Product *</label>
                <select
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                  required
                >
                  <option value="">Select product...</option>
                  {items.map(item => (
                    <option key={item._id} value={item._id}>{item.name} ({item.sku})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Quantity Produced</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Version</label>
                <input
                  type="text"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                  placeholder="1.0"
                />
              </div>

              <div className="border-t border-zinc-800 pt-4">
                <label className="block text-sm font-medium text-zinc-400 mb-2">Components</label>
                <div className="flex gap-2 mb-3">
                  <select
                    value={selectedComponent.itemId}
                    onChange={(e) => setSelectedComponent({ ...selectedComponent, itemId: e.target.value })}
                    className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                  >
                    <option value="">Select component...</option>
                    {items.filter(item => item._id !== formData.productId).map(item => (
                      <option key={item._id} value={item._id}>{item.name} ({item.sku})</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Qty"
                    value={selectedComponent.quantity}
                    onChange={(e) => setSelectedComponent({ ...selectedComponent, quantity: parseInt(e.target.value) })}
                    className="w-24 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                    min="1"
                  />
                  <button
                    type="button"
                    onClick={addComponent}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-2 max-h-40 overflow-auto">
                  {formData.components.map((comp, idx) => {
                    const item = items.find(i => i._id === comp.itemId);
                    return (
                      <div key={idx} className="flex items-center justify-between bg-zinc-800 rounded-lg p-2">
                        <span className="text-sm text-white">{item?.name} x{comp.quantity}</span>
                        <button
                          type="button"
                          onClick={() => removeComponent(idx)}
                          className="text-rose-400 hover:text-rose-300"
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeModal} className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">
                  {submitting ? "Saving..." : editingBOM ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
