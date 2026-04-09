import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Truck, 
  Users as UsersIcon, 
  UserCog, 
  LogOut, 
  User, 
  Building2,
  FileText,
  Boxes,
  Layers
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/", roles: ["ADMIN", "MANAGER", "EMPLOYEE"] },
  { icon: Boxes, label: "Item Master", path: "/item-master", roles: ["ADMIN", "MANAGER", "EMPLOYEE"] },
  { icon: Layers, label: "BOM", path: "/bom", roles: ["ADMIN", "MANAGER"] },
  { icon: Package, label: "Inventory", path: "/inventory", roles: ["ADMIN", "MANAGER", "EMPLOYEE"] },
  { icon: ShoppingCart, label: "Sales", path: "/sales", roles: ["ADMIN", "MANAGER", "EMPLOYEE"] },
  { icon: Truck, label: "Purchases", path: "/purchases", roles: ["ADMIN", "MANAGER", "EMPLOYEE"] },
  { icon: UsersIcon, label: "Suppliers", path: "/suppliers", roles: ["ADMIN", "MANAGER", "EMPLOYEE"] },
  { icon: FileText, label: "PDF Templates", path: "/pdf-templates", roles: ["ADMIN", "MANAGER"] },
  { icon: UserCog, label: "Team", path: "/users", roles: ["ADMIN"] },
  { icon: Building2, label: "Company", path: "/company", roles: ["ADMIN"] },
  { icon: User, label: "Profile", path: "/profile", roles: ["ADMIN", "MANAGER", "EMPLOYEE"] },
];

export default function Layout({ children, onLogout }: { children: React.ReactNode; onLogout: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const visibleMenuItems = menuItems.filter(item => {
    if (!user) return false;
    return item.roles.some(role => user.roles?.includes(role));
  });

  return (
    <div className="flex h-screen bg-black">
      {/* Sidebar */}
      <div className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col">
        <div className="p-6 border-b border-zinc-800">
          <h1 className="text-xl font-bold text-white">InnoWebiX</h1>
          <p className="text-xs text-zinc-500 mt-1">ERP System</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {visibleMenuItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <div
                key={idx}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm cursor-pointer transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <div
            onClick={onLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white cursor-pointer transition-all"
          >
            <LogOut size={18} />
            Logout
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-black">
        <div className="p-8">{children}</div>
      </div>
    </div>
  );
}
