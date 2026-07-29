// src/components/teacher/AttendanceEntry.jsx
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API from "../../api/axios";

export default function AttendanceEntry({ classTeacherOf }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [students, setStudents] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!classTeacherOf?.class) return;
    API.get("/students", { params: { classId: classTeacherOf.class._id, stream: classTeacherOf.stream } }).then(
      (res) => {
        setStudents(res.data.students);
        setStatuses(Object.fromEntries(res.data.students.map((s) => [s._id, "present"])));
      }
    );
  }, [classTeacherOf]);

  if (!classTeacherOf?.class) {
    return <p className="text-sm text-gray-400">You are not assigned as a class teacher for any class.</p>;
  }

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await API.post("/attendance", {
        classId: classTeacherOf.class._id,
        stream: classTeacherOf.stream,
        date,
        records: students.map((s) => ({ studentId: s._id, status: statuses[s._id] })),
      });
      toast.success("Attendance recorded");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label className="text-xs font-bold text-gray-500 uppercase">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
        {students.map((s) => (
          <div key={s._id} className="flex items-center justify-between px-5 py-3">
            <span className="text-sm font-medium text-gray-900">{s.firstName} {s.lastName}</span>
            <div className="flex gap-1">
              {["present", "absent", "late", "excused"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatuses((prev) => ({ ...prev, [s._id]: status }))}
                  className={`text-xs px-2.5 py-1 rounded capitalize transition
                    ${statuses[s._id] === status
                      ? "bg-brand-orange text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={saving || students.length === 0}
        className="bg-brand-orange hover:bg-brand-orange-hover disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-lg"
      >
        {saving ? "Saving…" : "Save Attendance"}
      </button>
    </div>
  );
}
