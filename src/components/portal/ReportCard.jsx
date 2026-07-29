// src/components/portal/ReportCard.jsx
import { useEffect, useState } from "react";
import API from "../../api/axios";

export default function ReportCard({ studentId, classId, compact }) {
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState(null);
  const [report, setReport] = useState(null);

  useEffect(() => {
    API.get("/exams", { params: { classId } }).then((res) => {
      setExams(res.data.exams);
      if (res.data.exams[0]) setSelectedExamId(res.data.exams[0]._id);
    });
  }, [classId]);

  useEffect(() => {
    if (!selectedExamId) return;
    API.get(`/exams/${selectedExamId}/student/${studentId}`)
      .then((res) => setReport(res.data))
      .catch(() => setReport(null));
  }, [selectedExamId, studentId]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
        <h3 className="font-bold text-gray-900">Results & Report Card</h3>
        {exams.length > 1 && (
          <select
            value={selectedExamId || ""}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="text-xs border border-gray-300 rounded-lg px-2 py-1"
          >
            {exams.map((e) => (
              <option key={e._id} value={e._id}>{e.name}</option>
            ))}
          </select>
        )}
      </div>

      {!report ? (
        <p className="text-xs text-gray-400">Results not yet published for this term.</p>
      ) : (
        <>
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-gray-500">Overall Mean</span>
            <span className="text-lg font-bold text-brand-orange">{report.overallMean}%</span>
          </div>
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="text-gray-500 uppercase border-b border-gray-200">
              <tr>
                <th className="py-2">Subject</th>
                <th className="py-2">Score</th>
                <th className="py-2">Grade</th>
                {!compact && <th className="py-2">Position</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(compact ? report.results.slice(0, 4) : report.results).map((r) => (
                <tr key={r._id}>
                  <td className="py-2 font-semibold text-gray-900">{r.subject?.name}</td>
                  <td className="py-2">{r.totalPercentage}%</td>
                  <td className="py-2">{r.grade}</td>
                  {!compact && <td className="py-2">{r.classPosition || "—"}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
