import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../lib/api";
import Layout from "../../components/Layout";
import { FileText, Plus, Edit, Trash2, Copy, Star } from "lucide-react";
import TemplateEditor from "./TemplateEditor";

interface Template {
  _id: string;
  name: string;
  documentType: string;
  isDefault: boolean;
  createdAt: string;
}

const DOCUMENT_TYPES = [
  { value: "purchase_order", label: "Purchase Order" },
  { value: "sales_order", label: "Sales Order" },
  { value: "invoice", label: "Invoice" },
  { value: "bill", label: "Bill" },
  { value: "bom", label: "Bill of Materials" },
];

export default function PDFTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTemplates();
  }, [selectedType]);

  const fetchTemplates = async () => {
    try {
      const url = selectedType ? `/pdf/templates?type=${selectedType}` : "/pdf/templates";
      const response = await api.get(url);
      setTemplates(response.data.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        logout();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      await api.delete(`/pdf/templates/${id}`);
      fetchTemplates();
    }
  };

  const handleSetDefault = async (id: string) => {
    await api.put(`/pdf/templates/${id}`, { isDefault: true });
    fetchTemplates();
  };

  if (showEditor) {
    return (
      <Layout onLogout={logout}>
        <TemplateEditor
          template={editingTemplate}
          onClose={() => {
            setShowEditor(false);
            setEditingTemplate(null);
            fetchTemplates();
          }}
        />
      </Layout>
    );
  }

  return (
    <Layout onLogout={logout}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">PDF Templates</h1>
        <p className="text-zinc-500 text-sm mt-1">
          Customize your document templates (Purchase Orders, Sales Orders, Invoices)
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
        >
          <option value="">All Types</option>
          {DOCUMENT_TYPES.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
        
        <button
          onClick={() => {
            setEditingTemplate(null);
            setShowEditor(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
        >
          <Plus size={18} />
          Create Template
        </button>
      </div>

      {/* Templates List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {templates.map((template) => (
          <div key={template._id} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10">
                  <FileText size={18} className="text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium">{template.name}</h3>
                  <p className="text-zinc-500 text-xs">
                    {DOCUMENT_TYPES.find(t => t.value === template.documentType)?.label}
                  </p>
                </div>
              </div>
              {template.isDefault && (
                <span className="px-2 py-1 rounded-lg text-xs bg-emerald-500/10 text-emerald-400">
                  Default
                </span>
              )}
            </div>

            <div className="flex gap-2 mt-4 pt-3 border-t border-zinc-800">
              <button
                onClick={() => {
                  setEditingTemplate(template);
                  setShowEditor(true);
                }}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-indigo-400 hover:bg-indigo-500/10 transition"
              >
                <Edit size={14} />
                Edit
              </button>
              {!template.isDefault && (
                <button
                  onClick={() => handleSetDefault(template._id)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-amber-400 hover:bg-amber-500/10 transition"
                >
                  <Star size={14} />
                  Set Default
                </button>
              )}
              <button
                onClick={() => handleDelete(template._id)}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
