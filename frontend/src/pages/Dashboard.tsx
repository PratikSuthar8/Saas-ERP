import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import Layout from "../components/Layout";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Package, TrendingUp, DollarSign } from "lucide-react";

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/dashboard")
      .then((res) => {
        setData(res.data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        if (err.response?.status === 401) {
          logout();
          navigate("/login");
        }
        setLoading(false);
      });
  }, [logout, navigate]);

  if (loading) {
    return (
      <Layout onLogout={logout}>
        <div className="flex items-center justify-center h-96 text-zinc-500">Loading dashboard...</div>
      </Layout>
    );
  }

  const cards = [
    { title: "Total Items", value: data.totalItems, icon: Package, color: "bg-indigo-500/10 text-indigo-400" },
    { title: "Current Stock", value: data.totalStock, icon: Package, color: "bg-emerald-500/10 text-emerald-400" },
    { title: "Purchases", value: data.totalPurchases, icon: TrendingUp, color: "bg-amber-500/10 text-amber-400" },
    { title: "Sales", value: data.totalSales, icon: DollarSign, color: "bg-rose-500/10 text-rose-400" },
  ];

  return (
    <Layout onLogout={logout}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-zinc-500 text-sm mt-1">Welcome back! Here's your business overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
              <div className={`p-2 rounded-lg ${card.color} w-fit mb-3`}>
                <Icon size={18} />
              </div>
              <p className="text-zinc-500 text-xs uppercase tracking-wide">{card.title}</p>
              <p className="text-2xl font-semibold text-white mt-1">{card.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
          <h2 className="text-white font-medium mb-4">Monthly Sales</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.monthlySales}>
              <XAxis dataKey="month" stroke="#52525b" />
              <YAxis stroke="#52525b" />
              <Tooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px" }} />
              <Line type="monotone" dataKey="value" stroke="#818cf8" strokeWidth={2} dot={{ fill: "#818cf8", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
          <h2 className="text-white font-medium mb-4">Monthly Purchases</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.monthlyPurchases}>
              <XAxis dataKey="month" stroke="#52525b" />
              <YAxis stroke="#52525b" />
              <Tooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px" }} />
              <Bar dataKey="value" fill="#22d3ee" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Layout>
  );
}
