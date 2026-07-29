// src/components/admin/RebalanceStreamsModal.jsx
import { useState } from "react";
import { toast } from "react-toastify";
import API from "../../api/axios";

export default function RebalanceStreamsModal({ classDoc, onClose, onSaved }) {
  const [streams, setStreams] = useState(
    classDoc.streams.length ? classDoc.streams.map((s) => ({ name: s.name, capacity: s.capacity ?? "" })) : [{ name: "", capacity: "" }]
  );
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);

  const addStream = () => setStreams([...streams, { name: "", capacity: "" }]);
  const updateStream = (i, field, value) => {
    const next = [...streams];
    next[i] = { ...next[i], [field]: value };
    setStreams(next);
  };
  const removeStream = (i) => setStreams(streams.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (streams.some((s) => !s.name.trim())) return toast.error("Every stream needs a name");
    if (!confirm(`This redistributes every active student in ${classDoc.name} across ${streams.length} stream(s). Continue?`)) return;

    setSaving(true);
    try {
      const res = await API.post(`/classes/${classDoc._id}/rebalance-streams`, {
        streams: streams.map((s) => ({ name: s.name.trim(), capacity: s.capacity === "" ? null : Number(s.capacity) })),
      });
      setResult(res.data.distribution);
      toast.success("Streams rebalanced");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to rebalance streams");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black"><i className="fa-solid fa-xmark text-xl"></i></button>
        <div className="mb-5">
          <h3 className="text-lg font-bold text-gray-900">Rebalance {classDoc.name}</h3>
          <p className="text-xs text-gray-500">Set the new stream count/names — active students are redistributed evenly.</p>
        </div>

        {result ? (
          <div className="space-y-3">
            {result.map((r) => (
              <div key={r.stream} className="flex justify-between text-sm p-2 bg-gray-50 rounded-lg">
                <span className="font-semibold">{r.stream}</span>
                <span>{r.count} students</span>
              </div>
            ))}
            <button onClick={onSaved} className="w-full mt-3 px-5 py-2 bg-brand-orange hover:bg-brand-orange-hover text-white rounded-lg text-xs font-bold">Done</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {streams.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <input value={s.name} onChange={(e) => updateStream(i, "name", e.target.value)} placeholder="Stream name" className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs" />
                <input type="number" value={s.capacity} onChange={(e) => updateStream(i, "capacity", e.target.value)} placeholder="Capacity" className="w-24 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs" />
                <button type="button" onClick={() => removeStream(i)} className="text-gray-400 hover:text-red-600"><i className="fa-solid fa-trash"></i></button>
              </div>
            ))}
            <button type="button" onClick={addStream} className="text-[10px] font-bold text-brand-orange"><i className="fa-solid fa-plus mr-1"></i>Add Stream</button>

            <div className="pt-3 border-t border-gray-200 flex justify-end space-x-3">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold">Cancel</button>
              <button type="submit" disabled={saving} className="px-5 py-2 bg-brand-orange hover:bg-brand-orange-hover text-white rounded-lg text-xs font-bold disabled:opacity-60">
                {saving ? "Rebalancing…" : "Rebalance"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
