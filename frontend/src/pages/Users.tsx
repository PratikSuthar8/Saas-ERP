import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import Layout from "../components/Layout";
import { 
  Users as UsersIcon, 
  Shield, 
  Trash2, 
  Mail, 
  Crown, 
  Briefcase, 
  User as UserIcon,
  Plus,
  X,
  Copy
} from "lucide-react";

interface User {
  _id: string;
  email: string;
  roles: string[];
  createdAt: string;
  mustChangePassword?: boolean;
}

const ROLE_OPTIONS = ["ADMIN", "MANAGER", "EMPLOYEE"];
const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  MANAGER: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  EMPLOYEE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};
const ROLE_ICONS: Record<string, any> = {
  ADMIN: Crown,
  MANAGER: Briefcase,
  EMPLOYEE: UserIcon,
};

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createEmail, setCreateEmail] = useState("");
  const [createRoles, setCreateRoles] = useState<string[]>(["EMPLOYEE"]);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [newUserCredentials, setNewUserCredentials] = useState<{email: string, password: string} | null>(null);
  const { user: currentUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get("/user");
      const usersData = response.data.data || response.data;
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (err: any) {
      console.error("Fetch users error:", err);
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

  const updateRole = async (userId: string, newRoles: string[]) => {
    setUpdating(userId);
    try {
      await api.put(`/user/${userId}/roles`, { roles: newRoles });
      await fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to update roles");
    } finally {
      setUpdating(null);
    }
  };

  const deleteUser = async (userId: string) => {
    if (userId === currentUser?.userId) {
      alert("You cannot delete yourself");
      return;
    }
    if (confirm("Are you sure you want to remove this user?")) {
      try {
        await api.delete(`/user/${userId}`);
        await fetchUsers();
      } catch (err) {
        console.error(err);
        alert("Failed to delete user");
      }
    }
  };

  const addRole = (userId: string, currentRoles: string[], newRole: string) => {
    if (!currentRoles.includes(newRole)) {
      updateRole(userId, [...currentRoles, newRole]);
    }
  };

  const removeRole = (userId: string, currentRoles: string[], roleToRemove: string) => {
    if (currentRoles.length === 1) {
      alert("User must have at least one role");
      return;
    }
    updateRole(userId, currentRoles.filter(r => r !== roleToRemove));
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    
    if (!createEmail) {
      setCreateError("Email is required");
      return;
    }
    
    if (!createEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setCreateError("Please enter a valid email address");
      return;
    }
    
    if (createRoles.length === 0) {
      setCreateError("Please select at least one role");
      return;
    }
    
    setCreating(true);
    try {
      const response = await api.post("/auth/create-user", {
        email: createEmail,
        roles: createRoles,
      });
      
      const credentials = response.data.data;
      setNewUserCredentials({
        email: credentials.email,
        password: credentials.temporaryPassword,
      });
      
      setCreateEmail("");
      setCreateRoles(["EMPLOYEE"]);
      await fetchUsers();
    } catch (err: any) {
      console.error(err);
      setCreateError(err.response?.data?.message || "Failed to create user");
    } finally {
      setCreating(false);
    }
  };

  const toggleRole = (role: string) => {
    if (createRoles.includes(role)) {
      if (createRoles.length === 1) return;
      setCreateRoles(createRoles.filter(r => r !== role));
    } else {
      setCreateRoles([...createRoles, role]);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  if (loading) {
    return (
      <Layout onLogout={logout}>
        <div className="flex items-center justify-center h-96 text-zinc-500">
          Loading users...
        </div>
      </Layout>
    );
  }

  return (
    <Layout onLogout={logout}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Team Members</h1>
          <p className="text-zinc-500 text-sm mt-1">
            Manage users and their roles in your organization
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all"
        >
          <Plus size={18} />
          Create User
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800/50 border-b border-zinc-800">
              <tr>
                <th className="text-left p-4 text-zinc-400 font-medium text-sm">User</th>
                <th className="text-left p-4 text-zinc-400 font-medium text-sm">Roles</th>
                <th className="text-left p-4 text-zinc-400 font-medium text-sm">Status</th>
                <th className="text-left p-4 text-zinc-400 font-medium text-sm">Joined</th>
                <th className="text-left p-4 text-zinc-400 font-medium text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-8 text-zinc-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const isCurrentUser = user._id === currentUser?.userId;
                  return (
                    <tr key={user._id} className="border-b border-zinc-800 hover:bg-zinc-800/30 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                            <Mail size={14} className="text-indigo-400" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{user.email}</p>
                            {isCurrentUser && (
                              <span className="text-xs text-indigo-400">(You)</span>
                            )}
                          </div>
                        </div>
                       </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          {user.roles?.map((role) => {
                            const Icon = ROLE_ICONS[role] || Shield;
                            return (
                              <div
                                key={role}
                                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border ${ROLE_COLORS[role]}`}
                              >
                                <Icon size={12} />
                                {role}
                                {!isCurrentUser && user.roles?.length > 1 && (
                                  <button
                                    onClick={() => removeRole(user._id, user.roles, role)}
                                    className="ml-1 hover:text-white transition"
                                    disabled={updating === user._id}
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                            );
                          })}
                          {!isCurrentUser && (
                            <select
                              onChange={(e) => {
                                if (e.target.value) {
                                  addRole(user._id, user.roles || [], e.target.value);
                                  e.target.value = "";
                                }
                              }}
                              className="px-2 py-1 rounded-lg text-xs bg-zinc-800 border border-zinc-700 text-zinc-400 focus:outline-none focus:border-indigo-500"
                              disabled={updating === user._id}
                            >
                              <option value="">+ Add role</option>
                              {ROLE_OPTIONS.filter(r => !(user.roles || []).includes(r)).map(role => (
                                <option key={role} value={role}>{role}</option>
                              ))}
                            </select>
                          )}
                        </div>
                       </td>
                      <td className="p-4">
                        {user.mustChangePassword ? (
                          <span className="inline-flex px-2 py-1 rounded-lg text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                            Needs password change
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Active
                          </span>
                        )}
                       </td>
                      <td className="p-4 text-zinc-500 text-sm">
                        {new Date(user.createdAt).toLocaleDateString()}
                       </td>
                      <td className="p-4">
                        {!isCurrentUser && (
                          <button
                            onClick={() => deleteUser(user._id)}
                            className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition"
                            disabled={updating === user._id}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                        </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && !newUserCredentials && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Create New User</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateEmail("");
                  setCreateRoles(["EMPLOYEE"]);
                  setCreateError("");
                }}
                className="text-zinc-400 hover:text-white transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  placeholder="user@company.com"
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  required
                />
                <p className="text-xs text-zinc-500 mt-1">
                  User will need to change password on first login
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Assign Roles
                </label>
                <div className="space-y-2">
                  {ROLE_OPTIONS.map((role) => {
                    const Icon = ROLE_ICONS[role] || Shield;
                    return (
                      <label
                        key={role}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                          createRoles.includes(role)
                            ? "border-indigo-500 bg-indigo-500/10"
                            : "border-zinc-700 hover:border-zinc-600"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={createRoles.includes(role)}
                          onChange={() => toggleRole(role)}
                          className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-indigo-600 focus:ring-indigo-500"
                        />
                        <Icon size={16} className={createRoles.includes(role) ? "text-indigo-400" : "text-zinc-500"} />
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${createRoles.includes(role) ? "text-indigo-400" : "text-white"}`}>
                            {role}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {role === "ADMIN" && "Full access to everything"}
                            {role === "MANAGER" && "Can create/edit inventory, sales, purchases"}
                            {role === "EMPLOYEE" && "Read-only access"}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {createError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{createError}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreateEmail("");
                    setCreateRoles(["EMPLOYEE"]);
                    setCreateError("");
                  }}
                  className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Show Credentials Modal */}
      {newUserCredentials && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6">
            <div className="text-center mb-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                <Shield size={24} className="text-emerald-400" />
              </div>
              <h2 className="text-xl font-semibold text-white">User Created Successfully</h2>
              <p className="text-zinc-500 text-sm mt-1">
                Share these credentials with the user
              </p>
            </div>

            <div className="space-y-3">
              <div className="bg-zinc-800 rounded-lg p-3">
                <p className="text-xs text-zinc-500 mb-1">Email</p>
                <div className="flex items-center justify-between">
                  <p className="text-white font-mono text-sm">{newUserCredentials.email}</p>
                  <button
                    onClick={() => copyToClipboard(newUserCredentials.email)}
                    className="p-1 text-zinc-400 hover:text-white transition"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>

              <div className="bg-zinc-800 rounded-lg p-3">
                <p className="text-xs text-zinc-500 mb-1">Temporary Password</p>
                <div className="flex items-center justify-between">
                  <p className="text-white font-mono text-sm">{newUserCredentials.password}</p>
                  <button
                    onClick={() => copyToClipboard(newUserCredentials.password)}
                    className="p-1 text-zinc-400 hover:text-white transition"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                <p className="text-yellow-400 text-xs">
                  ⚠️ User will be forced to change password on first login
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setNewUserCredentials(null);
                setShowCreateModal(false);
              }}
              className="w-full mt-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 p-4 bg-zinc-900/30 border border-zinc-800 rounded-lg">
        <div className="flex items-start gap-3">
          <Shield size={18} className="text-indigo-400 mt-0.5" />
          <div>
            <p className="text-sm text-zinc-400">
              <span className="text-white font-medium">Role Permissions:</span>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 text-xs text-zinc-500">
              <div>
                <span className="text-purple-400">ADMIN</span> - Full access, can create users
              </div>
              <div>
                <span className="text-blue-400">MANAGER</span> - Create/edit inventory, sales, purchases
              </div>
              <div>
                <span className="text-emerald-400">EMPLOYEE</span> - Read-only access
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
