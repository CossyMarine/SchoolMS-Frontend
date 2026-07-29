// src/components/admin/ClassesTab.jsx
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API from "../../api/axios";

export default function ClassesTab() {
  const [classes, setClasses] = useState([]);
  const [name, setName] = useState("");
  const [level, setLevel] = useState("primary");
  const [streamsInput, setStreamsInput] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => API.get("/classes").then((res) => setClasses(res.data.classes));
  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.post("/classes", {
        name,
        level,
        streams: streamsInput.split(",").map((s) => s.trim()).filter(Boolean),
      });
      toast.success("Class created");
      setName(""); setStreamsInput("");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create class");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/classes/${id}`);
      toast.success("Class deleted");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete class");
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input required placeholder="Class name (e.g. Form 1)" value={name} onChange={(e) => setName(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        <select value={level} onChange={(e) => setLevel(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="primary">Primary</option>
          <option value="jss">JSS</option>
          <option value="secondary">Secondary</option>
        </select>
        <input placeholder="Streams, comma-separated (East, North)" value={streamsInput} onChange={(e) => setStreamsInput(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        <button type="submit" disabled={saving} className="bg-brand-orange text-white text-sm font-semibold rounded-lg py-2 hover:bg-brand-orange-hover disabled:opacity-60">
          {saving ? "Saving…" : "Add Class"}
        </button>
      </form>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-semibold border-b border-gray-200">
            <tr>
              <th className="px-5 py-3">Class</th>
              <th className="px-5 py-3">Level</th>
              <th className="px-5 py-3">Streams</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {classes.map((c) => (
              <tr key={c._id} className="hover:bg-gray-50">
                <td className="px-5 py-3 font-semibold text-gray-900">{c.name}</td>
                <td className="px-5 py-3 capitalize">{c.level}</td>
                <td className="px-5 py-3">{c.streams.join(", ") || "—"}</td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => handleDelete(c._id)} className="bg-red-600 text-white text-xs px-2.5 py-1 rounded hover:bg-red-700">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
