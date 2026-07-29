// src/components/moderator/ModeratorAttendanceEntry.jsx
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API from "../../api/axios";

export default function ModeratorAttendanceEntry() {
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState("");
  const [stream, setStream] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [students, setStudents] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    API.get("/classes").then((res) => setClasses(res.data.classes));
  }, []);

  useEffect(() => {
    if (!classId) {
      setStudents([]);
      return;
    }
    API.get("/students", { params: { classId, stream } }).then((res) => {
      setStudents(res.data.students);
      setStatuses(Object.fromEntries(res.data.students.map((s) => [s._id, "present"])));
    });
  }, [classId, stream]);

  const selectedClass = classes.find((c) => c._id === classId);

  const handleSubmit = async () => {
    if (!classId || students.length === 0) return;
    setSaving(true);
    try {
      await API.post("/attendance", {
        classId,
        stream,
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
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={classId}
          onChange={(e) => { setClassId(e.target.value); setStream(""); }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Select Class</option>
          {classes.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>

        {selectedClass?.streams?.length > 0 && (
          <select value={stream} onChange={(e) => setStream(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="">All streams</option>
            {selectedClass.streams.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        )}

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
      </div>

      {!classId ? (
        <p className="text-sm text-gray-400">Select a class to record attendance.</p>
      ) : students.length === 0 ? (
        <p className="text-sm text-gray-400">No students found in this class/stream.</p>
      ) : (
        <>
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
            disabled={saving}
            className="bg-brand-orange hover:bg-brand-orange-hover disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-lg"
          >
            {saving ? "Saving…" : "Save Attendance"}
          </button>
        </>
      )}
    </div>
  );
        }
