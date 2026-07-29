// src/components/teacher/ResultEntry.jsx
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API from "../../api/axios";

export default function ResultEntry({ assignments }) {
  const [assignmentIdx, setAssignmentIdx] = useState(0);
  const [exams, setExams] = useState([]);
  const [examId, setExamId] = useState(null);
  const [students, setStudents] = useState([]);
  const [scores, setScores] = useState({}); // studentId -> { componentId: score }
  const [saving, setSaving] = useState(false);

  const assignment = assignments[assignmentIdx];
  const exam = exams.find((e) => e._id === examId);

  useEffect(() => {
    if (!assignment) return;
    API.get("/exams", { params: { classId: assignment.class?._id } }).then((res) => {
      setExams(res.data.exams);
      if (res.data.exams[0]) setExamId(res.data.exams[0]._id);
    });
  }, [assignment]);

  useEffect(() => {
    if (!assignment) return;
    API.get("/students", { params: { classId: assignment.class?._id, stream: assignment.stream } }).then((res) =>
      setStudents(res.data.students)
    );
  }, [assignment]);

  const handleScoreChange = (studentId, componentId, value) => {
    setScores((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], [componentId]: value },
    }));
  };

  const handleSubmit = async () => {
    if (!exam) return;
    setSaving(true);
    try {
      const entries = students.map((s) => ({
        studentId: s._id,
        scores: exam.components.map((c) => ({
          componentId: c._id,
          score: Number(scores[s._id]?.[c._id] || 0),
        })),
      }));
      await API.post(`/exams/${examId}/results`, {
        classId: assignment.class._id,
        subjectId: assignment.subject._id,
        entries,
      });
      toast.success("Results saved");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save results");
    } finally {
      setSaving(false);
    }
  };

  if (!assignments.length) return <p className="text-sm text-gray-400">You have no subject assignments yet.</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <select
          value={assignmentIdx}
          onChange={(e) => setAssignmentIdx(Number(e.target.value))}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          {assignments.map((a, i) => (
            <option key={i} value={i}>{a.subject?.name} — {a.class?.name} {a.stream}</option>
          ))}
        </select>
        <select
          value={examId || ""}
          onChange={(e) => setExamId(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          {exams.map((e) => (
            <option key={e._id} value={e._id}>{e.name} {e.status === "approved" ? "(locked)" : ""}</option>
          ))}
        </select>
      </div>

      {exam && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-semibold border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">Student</th>
                {exam.components.map((c) => (
                  <th key={c._id} className="px-4 py-3">{c.name} (/{c.maxScore})</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map((s) => (
                <tr key={s._id}>
                  <td className="px-4 py-2 font-semibold text-gray-900">{s.firstName} {s.lastName}</td>
                  {exam.components.map((c) => (
                    <td key={c._id} className="px-4 py-2">
                      <input
                        type="number"
                        max={c.maxScore}
                        min={0}
                        disabled={exam.status === "approved"}
                        value={scores[s._id]?.[c._id] || ""}
                        onChange={(e) => handleScoreChange(s._id, c._id, e.target.value)}
                        className="w-16 border border-gray-300 rounded px-2 py-1 text-sm disabled:bg-gray-100"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {exam.status !== "approved" && (
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="bg-brand-orange hover:bg-brand-orange-hover disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-lg"
              >
                {saving ? "Saving…" : "Save Results"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
          }
