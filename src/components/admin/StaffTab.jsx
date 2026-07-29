// src/components/admin/StaffTab.jsx
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API from "../../api/axios";

const PERMISSION_KEYS = ["admissions", "fees", "remedialFees", "messaging", "attendance", "results", "library", "staffManagement", "settings"];

export default function StaffTab() {
  const [staff, setStaff] = useState([]);
  const [form, setForm] = useState({ fullName: "", method: "email", contact: "", password: "", role: "teacher", moderatorTitle: "", staffId: "" });
  const [permissions, setPermissions] = useState({});
  const [saving, setSaving] = useState(false);

  const load = () => API.get("/auth/staff").then((res) => setStaff(res.data));
  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.post("/auth/staff", { ...form, permissions });
      toast.success("Staff account created");
      setForm({ fullName: "", method: "email", contact: "", password: "", role: "teacher", moderatorTitle: "", staffId: "" });
      setPermissions({});
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create account");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (id) => {
    await API.patch(`/auth/staff/${id}/status`);
    load();
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
        <h3 className="text-lg font-bold text-gray-900">Add Staff Account</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input required placeholder="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="teacher">Teacher</option>
            <option value="librarian">Librarian</option>
            <option value="moderator">Moderator</option>
            <option value="admin">Admin</option>
          </select>
          {form.role === "teacher" && (
            <input placeholder="Staff ID" value={form.staffId} onChange={(e) => setForm({ ...form, staffId: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          )}
          {form.role === "moderator" && (
            <input placeholder="Title (e.g. Deputy Principal)" value={form.moderatorTitle} onChange={(e) => setForm({ ...form, moderatorTitle: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="email">Email</option>
            <option value="phone">Phone</option>
          </select>
          <input required placeholder={form.method === "email" ? "Email" : "Phone"} value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <input required type="password" placeholder="Temporary password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>

        {form.role === "moderator" && (
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase mb-2">Module Access</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {PERMISSION_KEYS.map((key) => (
                <label key={key} className="flex items-center gap-2 text-sm capitalize">
                  <input
                    type="checkbox"
                    checked={!!permissions[key]}
                    onChange={(e) => setPermissions((prev) => ({ ...prev, [key]: e.target.checked }))}
                  />
                  {key}
                </label>
              ))}
            </div>
          </div>
        )}

        <button type="submit" disabled={saving} className="bg-brand-orange text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-brand-orange-hover disabled:opacity-60">
          {saving ? "Creating…" : "Create Account"}
        </button>
      </form>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-semibold border-b border-gray-200">
            <tr>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Contact</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {staff.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 font-semibold text-gray-900">{s.fullName}</td>
                <td className="px-5 py-3 capitalize">{s.role === "moderator" ? s.moderatorTitle || "Moderator" : s.role}</td>
                <td className="px-5 py-3">{s.email || s.phone}</td>
                <td className="px-5 py-3">
                  <span className={s.isActive ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                    {s.isActive ? "Active" : "Disabled"}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => toggleStatus(s.id)} className="bg-gray-100 border border-gray-300 text-xs px-2.5 py-1 rounded hover:bg-gray-200">
                    {s.isActive ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
