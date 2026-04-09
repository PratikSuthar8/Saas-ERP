import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import Layout from "../components/Layout";
import { Building2, Mail, Phone, MapPin, CreditCard, Globe, Calendar, Save } from "lucide-react";

interface CompanyData {
  name: string;
  email: string;
  phone: string;
  address: string;
  taxId: string;
  settings: {
    currency: string;
    dateFormat: string;
    timezone: string;
  };
}

export default function CompanySettings() {
  const [company, setCompany] = useState<CompanyData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    taxId: "",
    settings: {
      currency: "USD",
      dateFormat: "MM/DD/YYYY",
      timezone: "UTC",
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState("");
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCompany();
  }, []);

  const fetchCompany = async () => {
    try {
      const response = await api.get("/tenant");
      setCompany(response.data.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        logout();
        navigate("/login");
      } else if (err.response?.status === 403) {
        alert("Access denied. Admin only.");
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess("");
    try {
      await api.put("/tenant", company);
      setSaveSuccess("Company settings updated successfully!");
      setTimeout(() => setSaveSuccess(""), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout onLogout={logout}>
        <div className="flex items-center justify-center h-96 text-zinc-500">
          Loading company settings...
        </div>
      </Layout>
    );
  }

  return (
    <Layout onLogout={logout}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Company Settings</h1>
          <p className="text-zinc-500 text-sm mt-1">
            Manage your company information and preferences
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Information */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-800">
              <div className="p-2 rounded-lg bg-indigo-500/10">
                <Building2 size={20} className="text-indigo-400" />
              </div>
              <h2 className="text-white font-medium">Company Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Company Name
                </label>
                <div className="relative">
                  <Building2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    value={company.name}
                    onChange={(e) => setCompany({ ...company, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Tax ID / VAT
                </label>
                <div className="relative">
                  <CreditCard size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    value={company.taxId}
                    onChange={(e) => setCompany({ ...company, taxId: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="email"
                    value={company.email}
                    onChange={(e) => setCompany({ ...company, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                    placeholder="company@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="tel"
                    value={company.phone}
                    onChange={(e) => setCompany({ ...company, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Address
                </label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-3 top-3 text-zinc-500" />
                  <textarea
                    value={company.address}
                    onChange={(e) => setCompany({ ...company, address: e.target.value })}
                    rows={3}
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                    placeholder="Your company address"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Regional Settings */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-800">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Globe size={20} className="text-emerald-400" />
              </div>
              <h2 className="text-white font-medium">Regional Settings</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Currency
                </label>
                <select
                  value={company.settings.currency}
                  onChange={(e) =>
                    setCompany({
                      ...company,
                      settings: { ...company.settings, currency: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="INR">INR - Indian Rupee</option>
                  <option value="AUD">AUD - Australian Dollar</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                  <option value="JPY">JPY - Japanese Yen</option>
                  <option value="CNY">CNY - Chinese Yuan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Date Format
                </label>
                <select
                  value={company.settings.dateFormat}
                  onChange={(e) =>
                    setCompany({
                      ...company,
                      settings: { ...company.settings, dateFormat: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Timezone
                </label>
                <select
                  value={company.settings.timezone}
                  onChange={(e) =>
                    setCompany({
                      ...company,
                      settings: { ...company.settings, timezone: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London</option>
                  <option value="Europe/Paris">Paris</option>
                  <option value="Asia/Dubai">Dubai</option>
                  <option value="Asia/Kolkata">Mumbai</option>
                  <option value="Asia/Singapore">Singapore</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                  <option value="Australia/Sydney">Sydney</option>
                </select>
              </div>
            </div>
          </div>

          {saveSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
              <p className="text-emerald-400 text-sm">{saveSuccess}</p>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
