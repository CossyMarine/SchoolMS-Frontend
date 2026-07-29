// src/components/admin/PromotionModal.jsx
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API from "../../api/axios";

export default function PromotionModal({ onClose, onDone }) {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fromYear, setFromYear] = useState("");
  const [toYear, setToYear] = useState("");
  const [running, setRunning] = useState(false);

  useEffect(() => {
    API.get("/promotions/preview").then((res) => setPreview(res.data)).finally(() => setLoading(false));
  }, []);

  const handleRun = async () => {
    if (!toYear.trim()) return toast.error("Enter the academic year students are moving into");
    if (!confirm(`Run year rollover into ${toYear}? This moves every active student.`)) return;
    setRunning(true);
    try {
      await API.post("/promotions/run", { fromAcademicYear: fromYear, toAcademicYear: toYear });
      toast.success("Promotion run complete");
      onDone();
    } catch (err) {
      toast.error(err.response?.data?.message || "Promotion run failed");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black"><i className="fa-solid fa-xmark text-xl"></i></button>
        <div className="mb-5">
          <h3 className="text-lg font-bold text-gray-900">Academic Year Rollover</h3>
          <p className="text-xs text-gray-500">Promotes or graduates students based on each class's mapping. Run this once, at year-end.</p>
        </div>

        {loading ? (
          <p className="text-xs text-gray-400 py-8 text-center">Loading preview…</p>
        ) : (
          <>
            <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
              {preview.preview.length === 0 ? (
                <p className="text-xs text-gray-400">No classes have a promotion mapping or graduating flag set yet.</p>
              ) : (
                preview.preview.map((p) => (
                  <div key={p.classId} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg text-xs">
                    <span className="font-semibold text-gray-800">{p.className}</span>
                    <span className={p.outcome === "graduates" ? "text-red-600 font-bold" : "text-gray-600"}>
                      {p.activeCount} students → {p.outcome === "graduates" ? "Graduate" : p.target}
                    </span>
                  </div>
                ))
              )}
            </div>
            {preview.unmappedClassCount > 0 && (
              <p className="text-[11px] text-amber-600 mb-4"><i className="fa-solid fa-triangle-exclamation mr-1"></i>{preview.unmappedClassCount} class(es) have no promotion mapping and won't be touched by this run.</p>
            )}

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">From Year</label>
                <input value={fromYear} onChange={(e) => setFromYear(e.target.value)} placeholder="2026" className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">To Year</label>
                <input value={toYear} onChange={(e) => setToYear(e.target.value)} placeholder="2027" className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs" />
              </div>
            </div>

            <button onClick={handleRun} disabled={running} className="w-full px-5 py-2.5 bg-gray-900 hover:bg-black text-white rounded-lg text-xs font-bold disabled:opacity-60">
              {running ? "Running…" : "Run Year Rollover"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
