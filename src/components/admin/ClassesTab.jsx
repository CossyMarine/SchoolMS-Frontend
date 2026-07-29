// src/components/admin/ClassesTab.jsx
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import API from "../../api/axios";
import ClassFormModal from "./ClassFormModal";
import ClassTeachersModal from "./ClassTeachersModal";
import RebalanceStreamsModal from "./RebalanceStreamsModal";
import ClassRosterModal from "./ClassRosterModal";
import PromotionModal from "./PromotionModal";

export default function ClassesTab() {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("ALL");

  const [formModal, setFormModal] = useState(null); // null | "new" | classDoc
  const [teachersModalClass, setTeachersModalClass] = useState(null);
  const [rebalanceModalClass, setRebalanceModalClass] = useState(null);
  const [rosterModalClass, setRosterModalClass] = useState(null);
  const [showPromotion, setShowPromotion] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [classesRes, teachersRes, studentsRes] = await Promise.all([
        API.get("/classes"),
        API.get("/teachers"),
        API.get("/students", { params: { status: "active" } }),
      ]);
      setClasses(classesRes.data.classes);
      setTeachers(teachersRes.data.teachers);
      setStudents(studentsRes.data.students);
    } catch {
      toast.error("Failed to load classes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const teacherFor = (classId, stream) =>
    teachers.find((t) => t.classTeacherOf?.class === classId && (t.classTeacherOf?.stream || "") === (stream || ""));

  const countFor = (classId, stream) =>
    students.filter((s) => (s.class?._id || s.class) === classId && (s.stream || "") === (stream || "")).length;

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return classes.filter((c) => {
      const matchesLevel = levelFilter === "ALL" || c.level === levelFilter;
      const matchesQuery = !q || c.name.toLowerCase().includes(q) || c.streams.some((s) => s.name.toLowerCase().includes(q));
      return matchesLevel && matchesQuery;
    });
  }, [classes, search, levelFilter]);

  const stats = useMemo(() => {
    let totalStreams = 0, totalCapacity = 0, unassigned = 0;
    classes.forEach((c) => {
      const streamList = c.streams.length ? c.streams : [{ name: "", capacity: c.capacity }];
      streamList.forEach((s) => {
        totalStreams += 1;
        totalCapacity += s.capacity || 0;
        if (!teacherFor(c._id, s.name)) unassigned += 1;
      });
    });
    return { totalClasses: classes.length, totalStreams, totalCapacity, unassigned };
  }, [classes, teachers]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this class? This can't be undone.")) return;
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Classes" value={stats.totalClasses} icon="fa-school" />
        <StatCard label="Total Streams" value={stats.totalStreams} icon="fa-layer-group" accent />
        <StatCard label="Total Capacity" value={stats.totalCapacity} icon="fa-users-rectangle" />
        <StatCard label="Unassigned Class Teachers" value={stats.unassigned} icon="fa-user-xmark" danger />
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full md:w-auto flex-1">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search class or stream…"
            className="flex-1 md:w-64 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-brand-orange"
          />
          <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)} className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-brand-orange">
            <option value="ALL">All Levels</option>
            <option value="primary">Primary School</option>
            <option value="jss">Junior Secondary (JSS)</option>
            <option value="secondary">Senior Secondary</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowPromotion(true)} className="bg-gray-900 hover:bg-black text-white text-xs font-bold px-4 py-2.5 rounded-lg transition flex items-center gap-2">
            <i className="fa-solid fa-arrow-up-right-dots"></i><span>Year Rollover</span>
          </button>
          <button onClick={() => setFormModal("new")} className="bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold px-4 py-2.5 rounded-lg transition shadow-md flex items-center gap-2">
            <i className="fa-solid fa-plus"></i><span>Create Class</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-gray-400">Loading classes…</div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center space-y-3 bg-white rounded-xl border border-gray-200">
          <i className="fa-solid fa-chalkboard-user text-4xl text-gray-300"></i>
          <p className="text-xs text-gray-500 font-medium">No classes match your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((c) => (
            <ClassCard
              key={c._id}
              classDoc={c}
              teacherFor={teacherFor}
              countFor={countFor}
              onEdit={() => setFormModal(c)}
              onDelete={() => handleDelete(c._id)}
              onManageTeachers={() => setTeachersModalClass(c)}
              onRebalance={() => setRebalanceModalClass(c)}
              onRoster={() => setRosterModalClass(c)}
            />
          ))}
        </div>
      )}

      {formModal && (
        <ClassFormModal
          classDoc={formModal === "new" ? null : formModal}
          allClasses={classes}
          onClose={() => setFormModal(null)}
          onSaved={() => { setFormModal(null); load(); }}
        />
      )}
      {teachersModalClass && (
        <ClassTeachersModal classDoc={teachersModalClass} teachers={teachers} onClose={() => setTeachersModalClass(null)} onSaved={load} />
      )}
      {rebalanceModalClass && (
        <RebalanceStreamsModal classDoc={rebalanceModalClass} onClose={() => setRebalanceModalClass(null)} onSaved={() => { setRebalanceModalClass(null); load(); }} />
      )}
      {rosterModalClass && <ClassRosterModal classDoc={rosterModalClass} onClose={() => setRosterModalClass(null)} />}
      {showPromotion && <PromotionModal onClose={() => setShowPromotion(false)} onDone={() => { setShowPromotion(false); load(); }} />}
    </div>
  );
}

function StatCard({ label, value, icon, accent, danger }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase">{label}</p>
        <h3 className={`text-2xl font-bold mt-1 ${danger ? "text-red-600" : "text-gray-900"}`}>{value}</h3>
      </div>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${danger ? "bg-red-50 text-red-600" : accent ? "bg-brand-orange-light text-brand-orange" : "bg-black text-white"}`}>
        <i className={`fa-solid ${icon}`}></i>
      </div>
    </div>
  );
}

function ClassCard({ classDoc: c, teacherFor, countFor, onEdit, onDelete, onManageTeachers, onRebalance, onRoster }) {
  const streamList = c.streams.length ? c.streams : [{ name: "", capacity: c.capacity }];
  const totalEnrolled = streamList.reduce((sum, s) => sum + countFor(c._id, s.name), 0);
  const totalCapacity = streamList.reduce((sum, s) => sum + (s.capacity || 0), 0);
  const occupancyPercent = totalCapacity ? Math.round((totalEnrolled / totalCapacity) * 100) : 0;
  const isFull = totalCapacity > 0 && occupancyPercent >= 95;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4 hover:shadow-md transition">
      <div className="flex items-start justify-between">
        <div>
          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-gray-100 text-gray-700 uppercase">{c.level}</span>
          <h3 className="text-base font-bold text-gray-900 mt-1">{c.name}</h3>
          <p className="text-xs text-gray-400">
            {c.streams.length ? `${c.streams.length} stream${c.streams.length > 1 ? "s" : ""}: ${c.streams.map((s) => s.name).join(", ")}` : "No streaming"}
          </p>
          {c.isGraduating ? (
            <p className="text-[10px] font-bold text-red-600 mt-1"><i className="fa-solid fa-graduation-cap mr-1"></i>Graduating class</p>
          ) : c.promotesTo ? (
            <p className="text-[10px] font-bold text-green-600 mt-1"><i className="fa-solid fa-arrow-right mr-1"></i>Promotes to {c.promotesTo.name}</p>
          ) : (
            <p className="text-[10px] font-bold text-gray-400 mt-1">No promotion mapped</p>
          )}
        </div>
        <div className="flex space-x-1">
          <button onClick={onEdit} title="Edit class" className="p-1.5 text-gray-400 hover:text-brand-orange transition"><i className="fa-solid fa-pen-to-square"></i></button>
          <button onClick={onDelete} title="Delete class" className="p-1.5 text-gray-400 hover:text-red-600 transition"><i className="fa-solid fa-trash"></i></button>
        </div>
      </div>

      <div className="space-y-1.5">
        {streamList.map((s) => {
          const t = teacherFor(c._id, s.name);
          return (
            <div key={s.name || "main"} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-xs">
              <span className="font-semibold text-gray-700">{s.name || c.name}</span>
              <span className={t ? "text-gray-800" : "text-red-600 italic"}>{t ? t.user?.fullName : "Unassigned teacher"}</span>
            </div>
          );
        })}
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Occupancy</span>
          <span className="font-bold text-gray-900">{totalEnrolled}{totalCapacity ? ` / ${totalCapacity}` : ""} Students</span>
        </div>
        {totalCapacity > 0 && (
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full ${isFull ? "bg-red-500" : "bg-brand-orange"}`} style={{ width: `${Math.min(occupancyPercent, 100)}%` }}></div>
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-gray-100 grid grid-cols-3 gap-2 text-[10px] font-bold">
        <button onClick={onManageTeachers} className="py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700"><i className="fa-solid fa-chalkboard-user mr-1"></i>Teachers</button>
        <button onClick={onRebalance} className="py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700"><i className="fa-solid fa-shuffle mr-1"></i>Rebalance</button>
        <button onClick={onRoster} className="py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700"><i className="fa-solid fa-list-ul mr-1"></i>Roster</button>
      </div>
    </div>
  );
}
