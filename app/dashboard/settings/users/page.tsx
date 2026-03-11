"use client";

import { useEffect, useState } from "react";
import { Users, UserPlus, Trash2, Shield, UserCheck, Loader2, Eye, EyeOff, X } from "lucide-react";
import { formatDate } from "@/lib/utils";

const ROLES = [
  { value: "COUNSELOR", label: "Counselor", color: "bg-blue-100 text-blue-700" },
  { value: "ACCOUNTANT", label: "Accountant", color: "bg-green-100 text-green-700" },
  { value: "TRAINER", label: "Trainer", color: "bg-orange-100 text-orange-700" },
  { value: "ADMIN", label: "Admin", color: "bg-purple-100 text-purple-700" },
];

function getRoleStyle(role: string) {
  return ROLES.find(r => r.value === role)?.color || "bg-gray-100 text-gray-700";
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "COUNSELOR",
  });

  const fetchUsers = async () => {
    setLoading(true);
    const res = await fetch("/api/users");
    const data = await res.json();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (res.ok) {
      setShowModal(false);
      setForm({ name: "", email: "", password: "", role: "COUNSELOR" });
      fetchUsers();
    } else {
      setError(data.error || "Failed to create user");
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Kya aap "${name}" ko CRM se remove karna chahte hain? Ye action undo nahi ho sakta.`)) return;
    setDeletingId(id);
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchUsers();
    } else {
      const data = await res.json();
      alert(data.error || "Delete failed");
    }
    setDeletingId(null);
  };

  const handleToggleAccess = async (id: string, isActive: boolean) => {
    await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    fetchUsers();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">CRM users, counselors, and staff ko manage karein</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <UserPlus className="w-4 h-4" />
          Add New Staff
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
        </div>
      ) : (
        <div className="card shadow-sm overflow-hidden">
          <div className="card-header border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary-500" />
              All Staff Members ({users.length})
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {users.map((user) => (
              <div key={user.id} className={`p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors ${!user.isActive ? 'opacity-50' : ''}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white ${user.isActive ? 'bg-primary-500' : 'bg-gray-400'}`}>
                    {user.name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Added: {formatDate(user.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 ml-auto">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${getRoleStyle(user.role)}`}>
                    {user.role}
                  </span>
                  
                  {user.isActive ? (
                    <span className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-700 font-medium border border-green-100">Active</span>
                  ) : (
                    <span className="text-xs px-2 py-1 rounded-full bg-red-50 text-red-600 font-medium border border-red-100">Blocked</span>
                  )}

                  <button
                    onClick={() => handleToggleAccess(user.id, user.isActive)}
                    className={`p-2 rounded-lg transition-colors ${user.isActive ? 'text-orange-500 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`}
                    title={user.isActive ? "Block Access" : "Restore Access"}
                  >
                    {user.isActive ? <Shield className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => handleDelete(user.id, user.name)}
                    disabled={deletingId === user.id}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Remove Staff"
                  >
                    {deletingId === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
            {users.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Users className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                <p>Koi staff member nahi mila.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary-500" />
                New Staff Account
              </h2>
              <button onClick={() => { setShowModal(false); setError(""); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600 font-medium">
                  {error}
                </div>
              )}
              
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input required type="text" className="form-input" placeholder="Staff member ka naam" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input required type="email" className="form-input" placeholder="email@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>

              <div className="form-group">
                <label className="form-label">Password *</label>
                <div className="relative">
                  <input required type={showPassword ? "text" : "password"} className="form-input pr-10" placeholder="Strong password set karein" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Role *</label>
                <select required className="form-select" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  {ROLES.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">Role ke hisaab se dashboard access milega.</p>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => { setShowModal(false); setError(""); }} className="btn-ghost">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
