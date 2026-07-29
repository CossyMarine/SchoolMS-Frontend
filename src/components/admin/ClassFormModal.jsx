// src/components/admin/ClassFormModal.jsx
import { useState } from "react";
import { toast } from "react-toastify";
import API from "../../api/axios";

export default function ClassFormModal({ classDoc, allClasses, onClose, onSaved }) {
  const isEdit = !!classDoc;
  const [name, setName] = useState(classDoc?.name || "");
  const [level, setLevel] = useState(classDoc?.level || "primary");
  const [order, setOrder] = useState(classDoc?.order ?? 0);
  const [capacity, setCapacity] = useState(classDoc?.capacity ?? "");
  const [streams, setStreams] = useState(
    classDoc?.streams?.length ? classDoc.streams.map((s) => ({ name: s.name, capacity: s.capacity ?? "" })) : []
  );
  const [isGraduating, setIsGraduating] = useState(classDoc?.isGraduating || false);
  const [promotesTo, setPromotesTo] = useState(classDoc?.promotesTo?._id || classDoc?.promotesTo || "");
  const [saving, setSaving] = useState(false);

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

    setSaving(true);
    try {
      const payload = {
        name, level,
        order: Number(order) || 0,
        capacity: streams.length ? null : (capacity === "" ? null : Number(capacity)),
        streams: streams.map((s) => ({ name: s.name.trim(), capacity: s.capacity === "" ? null : Number(s.capacity) })),
        isGraduating,
        promotesTo: isGraduating ? null : (promotesTo || null),
      };
      if (isEdit) {
        await API.patch(`/classes/${classDoc._id}`, payload);
        toast.success("Class updated");
      } else {
        await API.post("/classes", payload);
        toast.success("Class created");
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save class");
    } finally {
      setSaving(false);
    }
  };

  const promotionOptions = allClasses.filter((c) => c._id !== classDoc?._id);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black"><i className="fa-solid fa-xmark text-xl"></i></button>
        <div className="mb-5">
          <h3 className="text-lg font-bold text-gray-900">{isEdit ? "Edit Class" : "Create Class"}</h3>
          <p className="text-xs text-gray-500">Configure grade, streams, capacity, and academic-year progression.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Education Level</label>
              <select value={level} onChange={(e) => setLevel(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs">
                <option value="primary">Primary School</option>
                <option value="jss">Junior Secondary (JSS)</option>
                <option value="secondary">Senior Secondary</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Grade / Form Name</label>
              <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Grade 10" className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Sort Order</label>
              <input type="number" value={order} onChange={(e) => setOrder(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs" />
            </div>
            {streams.length === 0 && (
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Class Capacity</label>
                <input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="e.g. 45" className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs" />
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-bold text-gray-700 uppercase">Streams (leave empty for no streaming)</label>
              <button type="button" onClick={addStream} className="text-[10px] font-bold text-brand-orange hover:text-brand-orange-hover"><i className="fa-solid fa-plus mr-1"></i>Add Stream</button>
            </div>
            <div className="space-y-2">
              {streams.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input value={s.name} onChange={(e) => updateStream(i, "name", e.target.value)} placeholder="e.g. East" className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs" />
                  <input type="number" value={s.capacity} onChange={(e) => updateStream(i, "capacity", e.target.value)} placeholder="Capacity" className="w-24 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs" />
                  <button type="button" onClick={() => removeStream(i)} className="text-gray-400 hover:text-red-600"><i className="fa-solid fa-trash"></i></button>
                </div>
              ))}
              {streams.length === 0 && <p className="text-[11px] text-gray-400">No streams — this class is one group.</p>}
            </div>
          </div>

          <div className="pt-3 border-t border-gray-200 space-y-3">
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-700">
              <input type="checkbox" checked={isGraduating} onChange={(e) => setIsGraduating(e.target.checked)} />
              This is a graduating class (students leave the school at year-end)
            </label>

            {!isGraduating && (
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Promotes To (next academic year)</label>
                <select value={promotesTo} onChange={(e) => setPromotesTo(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs">
                  <option value="">— Not mapped yet —</option>
                  {promotionOptions.map((c) => (
                    <option key={c._id} value={c._id}>{c.name} ({c.level})</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-gray-200 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2 bg-brand-orange hover:bg-brand-orange-hover text-white rounded-lg text-xs font-bold transition shadow disabled:opacity-60">
              {saving ? "Saving…" : "Save Class"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
      }
