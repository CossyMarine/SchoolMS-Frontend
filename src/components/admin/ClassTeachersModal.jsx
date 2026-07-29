// src/components/admin/ClassTeachersModal.jsx
import { useState } from "react";
import { toast } from "react-toastify";
import API from "../../api/axios";

export default function ClassTeachersModal({ classDoc, teachers, onClose, onSaved }) {
  const streamList = classDoc.streams.length ? classDoc.streams.map((s) => s.name) : [""];
  const [saving, setSaving] = useState(null);

  const currentTeacher = (stream) =>
    teachers.find((t) => t.classTeacherOf?.class === classDoc._id && (t.classTeacherOf?.stream || "") === stream);

  const assign = async (stream, teacherId) => {
    setSaving(stream);
    try {
      await API.patch(`/classes/${classDoc._id}/class-teacher`, { teacherId: teacherId || null, stream });
      toast.success("Class teacher updated");
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to assign teacher");
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black"><i className="fa-solid fa-xmark text-xl"></i></button>
        <div className="mb-5">
          <h3 className="text-lg font-bold text-gray-900">{classDoc.name} — Class Teachers</h3>
          <p className="text-xs text-gray-500">One class teacher per stream.</p>
        </div>
        <div className="space-y-3">
          {streamList.map((stream) => {
            const t = currentTeacher(stream);
            return (
              <div key={stream || "main"} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-gray-700 w-24 truncate">{stream || classDoc.name}</span>
                <select
                  defaultValue={t?._id || ""}
                  disabled={saving === stream}
                  onChange={(e) => assign(stream, e.target.value)}
                  className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs"
                >
                  <option value="">— Unassigned —</option>
                  {teachers.map((tc) => (
                    <option key={tc._id} value={tc._id}>{tc.user?.fullName || tc.staffId}</option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
