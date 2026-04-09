import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import Layout from "../components/Layout";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";
import { Package, TrendingUp, DollarSign, ShoppingCart } from "lucide-react";

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get("/dashboard");
      setData(response.data.data);
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 401) {
        logout();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout onLogout={logout}>
        <div className="flex items-center justify-center h-96 text-zinc-500">
          Loading dashboard...
        </div>
      </Layout>
    );
  }

  const cards = [
    { title: "Total Items", value: data?.totalItems || 0, icon: Package, color: "from-indigo-500 to-purple-500" },
    { title: "Current Stock", value: data?.totalStock || 0, icon: Package, color: "from-emerald-500 to-teal-500" },
    { title: "Total Purchases", value: data?.totalPurchases || 0, icon: TrendingUp, color: "from-amber-500 to-orange-500" },
    { title: "Total Sales", value: data?.totalSales || 0, icon: DollarSign, color: "from-rose-500 to-pink-500" },
  ];

  return (
    <Layout onLogout={logout}>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-zinc-500 text-sm mt-1">
            Welcome back! Here's your business overview.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div
                key={i}
                className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 hover:bg-zinc-900/70 transition-all"
              >
                <div className={`p-2 rounded-lg bg-gradient-to-br ${card.color} bg-opacity-10 w-fit mb-3`}>
                  <Icon size={18} className="text-white" />
                </div>
                <p className="text-zinc-500 text-xs uppercase tracking-wide">{card.title}</p>
                <p className="text-2xl font-semibold text-white mt-1">{card.value}</p>
              </div>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Chart */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
            <h2 className="text-white font-medium mb-4">Monthly Sales</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data?.monthlySales || []}>
                <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
                <XAxis dataKey="month" stroke="#52525b" />
                <YAxis stroke="#52525b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    border: "1px solid #27272a",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#818cf8"
                  strokeWidth={2}
                  dot={{ fill: "#818cf8", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Purchases Chart */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
            <h2 className="text-white font-medium mb-4">Monthly Purchases</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data?.monthlyPurchases || []}>
                <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
                <XAxis dataKey="month" stroke="#52525b" />
                <YAxis stroke="#52525b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    border: "1px solid #27272a",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="value" fill="#22d3ee" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Layout>
  );
}
