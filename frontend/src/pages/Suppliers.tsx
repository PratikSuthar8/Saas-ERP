import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import Layout from "../components/Layout";
import { Building2, Plus, Edit, Trash2, Phone, Mail, X } from "lucide-react";

interface Supplier {
  _id: string;
  name: string;
  contactEmail: string;
  phone: string;
  address: string;
  createdAt: string;
}

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    contactEmail: "",
    phone: "",
    address: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await api.get("/supplier");
      setSuppliers(response.data.data);
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
      if (editingSupplier) {
        await api.put(`/supplier/${editingSupplier._id}`, formData);
      } else {
        await api.post("/supplier", formData);
      }
      await fetchSuppliers();
      closeModal();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this supplier?")) {
      try {
        await api.delete(`/supplier/${id}`);
        await fetchSuppliers();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const openModal = (supplier?: Supplier) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setFormData({
        name: supplier.name,
        contactEmail: supplier.contactEmail || "",
        phone: supplier.phone || "",
        address: supplier.address || "",
      });
    } else {
      setEditingSupplier(null);
      setFormData({ name: "", contactEmail: "", phone: "", address: "" });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSupplier(null);
    setFormData({ name: "", contactEmail: "", phone: "", address: "" });
  };

  if (loading) {
    return (
      <Layout onLogout={logout}>
        <div className="flex items-center justify-center h-96 text-zinc-500">
          Loading suppliers...
        </div>
      </Layout>
    );
  }

  return (
    <Layout onLogout={logout}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Suppliers</h1>
          <p className="text-zinc-500 text-sm mt-1">
            Manage your product suppliers
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all"
        >
          <Plus size={18} />
          Add Supplier
        </button>
      </div>

      {/* Suppliers Grid */}
      {suppliers.length === 0 ? (
        <div className="text-center py-12 bg-zinc-900/50 border border-zinc-800 rounded-xl">
          <Building2 size={48} className="mx-auto text-zinc-600 mb-3" />
          <p className="text-zinc-500">No suppliers yet</p>
          <button
            onClick={() => openModal()}
            className="mt-3 text-indigo-400 hover:text-indigo-300 text-sm"
          >
            Add your first supplier
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {suppliers.map((supplier) => (
            <div
              key={supplier._id}
              className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 hover:bg-zinc-900/70 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500/10">
                    <Building2 size={20} className="text-indigo-400" />
                  </div>
                  <h3 className="text-white font-medium">{supplier.name}</h3>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openModal(supplier)}
                    className="p-1.5 rounded-lg text-indigo-400 hover:bg-indigo-500/10 transition"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(supplier._id)}
                    className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {supplier.contactEmail && (
                <div className="flex items-center gap-2 text-sm text-zinc-400 mt-2">
                  <Mail size={14} />
                  {supplier.contactEmail}
                </div>
              )}

              {supplier.phone && (
                <div className="flex items-center gap-2 text-sm text-zinc-400 mt-1">
                  <Phone size={14} />
                  {supplier.phone}
                </div>
              )}

              {supplier.address && (
                <div className="text-sm text-zinc-500 mt-2 pt-2 border-t border-zinc-800">
                  {supplier.address}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">
                {editingSupplier ? "Edit Supplier" : "Add New Supplier"}
              </h2>
              <button
                onClick={closeModal}
                className="text-zinc-400 hover:text-white transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Phone
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
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
                  {submitting ? "Saving..." : editingSupplier ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
