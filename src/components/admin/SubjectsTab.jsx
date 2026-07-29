// src/components/admin/SubjectsTab.jsx
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API from "../../api/axios";

export default function SubjectsTab() {
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [assignments, setAssignments] = useState({ compulsory: [], optional: [] });

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [levels, setLevels] = useState([]);
  const [isCore, setIsCore] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadBase = () => {
    API.get("/subjects").then((res) => setSubjects(res.data.subjects));
    API.get("/classes").then((res) => setClasses(res.data.classes));
  };
  useEffect(() => { loadBase(); }, []);

  const loadAssignments = (classId) => {
    if (!classId) return setAssignments({ compulsory: [], optional: [] });
    API.get("/class-subjects", { params: { classId } }).then((res) => setAssignments(res.data));
  };
  useEffect(() => { loadAssignments(selectedClass); }, [selectedClass]);

  const toggleLevel = (lvl) => setLevels((prev) => (prev.includes(lvl) ? prev.filter((l) => l !== lvl) : [...prev, lvl]));

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.post("/subjects", { name, code, levels, isCore });
      toast.success("Subject created");
      setName(""); setCode(""); setLevels([]); setIsCore(true);
      loadBase();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create subject");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSubject = async (id) => {
    if (!confirm("Delete this subject entirely?")) return;
    await API.delete(`/subjects/${id}`);
    loadBase();
  };

  const assignedSubjectIds = new Set([...assignments.compulsory, ...assignments.optional].map((a) => a.subject._id));

  const assign = async (subjectId, isCompulsory) => {
    await API.post("/class-subjects", { classId: selectedClass, subjectId, isCompulsory });
    loadAssignments(selectedClass);
  };
  const unassign = async (assignmentId) => {
    await API.delete(`/class-subjects/${assignmentId}`);
    loadAssignments(selectedClass);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreateSubject} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
        <h3 className="text-sm font-bold text-gray-900">Add Subject</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input required placeholder="Subject name" value={name} onChange={(e) => setName(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <input placeholder="Code (e.g. MAT)" value={code} onChange={(e) => setCode(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <div className="flex items-center gap-3 text-xs font-semibold text-gray-600">
            {["primary", "jss", "secondary"].map((lvl) => (
              <label key={lvl} className="flex items-center gap-1">
                <input type="checkbox" checked={levels.includes(lvl)} onChange={() => toggleLevel(lvl)} /> {lvl}
              </label>
            ))}
          </div>
          <button type="submit" disabled={saving} className="bg-brand-orange text-white text-sm font-semibold rounded-lg py-2 hover:bg-brand-orange-hover disabled:opacity-60">
            {saving ? "Saving…" : "Add Subject"}
          </button>
        </div>
        <label className="flex items-center gap-2 text-xs font-semibold text-gray-600">
          <input type="checkbox" checked={isCore} onChange={(e) => setIsCore(e.target.checked)} /> Core subject (default compulsory)
        </label>
      </form>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-semibold border-b border-gray-200">
            <tr><th className="px-5 py-3">Subject</th><th className="px-5 py-3">Code</th><th className="px-5 py-3">Levels</th><th className="px-5 py-3 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {subjects.map((s) => (
              <tr key={s._id} className="hover:bg-gray-50">
                <td className="px-5 py-3 font-semibold text-gray-900">{s.name}</td>
                <td className="px-5 py-3">{s.code || "—"}</td>
                <td className="px-5 py-3">{s.levels.join(", ") || "—"}</td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => handleDeleteSubject(s._id)} className="bg-red-600 text-white text-xs px-2.5 py-1 rounded hover:bg-red-700">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-bold text-gray-900">Class Subject Settings</h3>
          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="ml-auto border border-gray-300 rounded-lg px-3 py-2 text-xs">
            <option value="">Select a class…</option>
            {classes.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>

        {selectedClass && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Compulsory</h4>
              <div className="space-y-1.5">
                {assignments.compulsory.map((a) => (
                  <div key={a._id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-xs">
                    <span>{a.subject.name}</span>
                    <button onClick={() => unassign(a._id)} className="text-gray-400 hover:text-red-600"><i className="fa-solid fa-xmark"></i></button>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Optional</h4>
              <div className="space-y-1.5">
                {assignments.optional.map((a) => (
                  <div key={a._id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-xs">
                    <span>{a.subject.name}</span>
                    <button onClick={() => unassign(a._id)} className="text-gray-400 hover:text-red-600"><i className="fa-solid fa-xmark"></i></button>
                  </div>
                ))}
              </div>
            </div>
            <div className="md:col-span-2 pt-3 border-t border-gray-100">
              <p className="text-[11px] font-bold text-gray-500 uppercase mb-2">Add to this class</p>
              <div className="flex flex-wrap gap-2">
                {subjects.filter((s) => !assignedSubjectIds.has(s._id)).map((s) => (
                  <div key={s._id} className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1">
                    <span className="text-xs">{s.name}</span>
                    <button onClick={() => assign(s._id, true)} className="text-[10px] font-bold text-brand-orange">+Compulsory</button>
                    <button onClick={() => assign(s._id, false)} className="text-[10px] font-bold text-gray-500">+Optional</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
            }
