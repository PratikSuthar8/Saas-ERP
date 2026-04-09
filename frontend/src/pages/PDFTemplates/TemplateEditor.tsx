import { useState, useEffect } from "react";
import api from "../../lib/api";
import { ArrowLeft, Save } from "lucide-react";
import Editor from "@monaco-editor/react";

interface Template {
  _id?: string;
  name: string;
  documentType: string;
  content: string;
  css: string;
}

const DOCUMENT_TYPES = [
  { value: "purchase_order", label: "Purchase Order" },
  { value: "sales_order", label: "Sales Order" },
  { value: "invoice", label: "Invoice" },
  { value: "bill", label: "Bill" },
  { value: "bom", label: "Bill of Materials" },
];

const DEFAULT_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>{{documentType}} {{documentNumber}}</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      margin: 40px;
      color: #333;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .company-name {
      font-size: 28px;
      font-weight: bold;
      color: #4f46e5;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }
    th {
      background: #f3f4f6;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-name">{{company.name}}</div>
    <h1>{{documentType}} #{{documentNumber}}</h1>
    <p>Date: {{formatDate date}}</p>
  </div>

  <h3>Items</h3>
  <table>
    <thead>
      <tr><th>#</th><th>SKU</th><th>Description</th><th>Quantity</th><th>Price</th><th>Total</th></tr>
    </thead>
    <tbody>
      {{#eachItem items}}
      <tr>
        <td>{{index}}</td>
        <td>{{sku}}</td>
        <td>{{name}}</td>
        <td>{{formatNumber quantity}}</td>
        <td>{{formatCurrency unitPrice}}</td>
        <td>{{formatCurrency total}}</td>
      </tr>
      {{/eachItem}}
    </tbody>
  </table>

  <div style="text-align: right; margin-top: 20px;">
    <strong>Total: {{formatCurrency total}}</strong>
  </div>

  <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #666;">
    {{company.name}} - {{company.email}} - {{company.phone}}
  </div>
</body>
</html>`;

export default function TemplateEditor({ template, onClose }: { template: Template | null; onClose: () => void }) {
  const [formData, setFormData] = useState<Template>({
    name: "",
    documentType: "purchase_order",
    content: DEFAULT_HTML,
    css: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        documentType: template.documentType,
        content: template.content,
        css: template.css || "",
      });
    }
  }, [template]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (template?._id) {
        await api.put(`/pdf/templates/${template._id}`, formData);
      } else {
        await api.post("/pdf/templates", formData);
      }
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition"
        >
          <ArrowLeft size={20} />
          Back to Templates
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
        >
          <Save size={16} />
          {saving ? "Saving..." : "Save Template"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Template Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Document Type
            </label>
            <select
              value={formData.documentType}
              onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
            >
              {DOCUMENT_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            HTML Template
          </label>
          <div className="border border-zinc-700 rounded-lg overflow-hidden">
            <Editor
              height="500px"
              defaultLanguage="html"
              value={formData.content}
              onChange={(value) => setFormData({ ...formData, content: value || "" })}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                lineNumbers: "on",
                automaticLayout: true,
              }}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Custom CSS (Optional)
          </label>
          <div className="border border-zinc-700 rounded-lg overflow-hidden">
            <Editor
              height="200px"
              defaultLanguage="css"
              value={formData.css}
              onChange={(value) => setFormData({ ...formData, css: value || "" })}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                lineNumbers: "on",
              }}
            />
          </div>
        </div>

        <div className="bg-zinc-900/30 border border-zinc-800 rounded-lg p-4">
          <h3 className="text-white text-sm font-medium mb-2">Available Variables</h3>
          <div className="text-xs text-zinc-400 space-y-1">
            <p><code className="text-indigo-400">{"{{company.name}}"}</code> - Company name</p>
            <p><code className="text-indigo-400">{"{{documentNumber}}"}</code> - Document number</p>
            <p><code className="text-indigo-400">{"{{formatDate date}}"}</code> - Format date</p>
            <p><code className="text-indigo-400">{"{{formatCurrency amount}}"}</code> - Format currency</p>
            <p><code className="text-indigo-400">{"{{#eachItem items}}"}</code> - Loop through items</p>
            <p><code className="text-indigo-400">{"{{formatNumber quantity}}"}</code> - Format number</p>
          </div>
        </div>
      </form>
    </div>
  );
}
