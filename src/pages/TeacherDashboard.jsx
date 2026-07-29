// src/pages/TeacherDashboard.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import API from "../api/axios";
import DashboardShell from "../components/DashboardShell";
import ResultEntry from "../components/teacher/ResultEntry";
import AttendanceEntry from "../components/teacher/AttendanceEntry";

const NAV_ITEMS = [
  { key: "overview", label: "My Classes", icon: "fa-chalkboard-user" },
  { key: "results", label: "Enter Results", icon: "fa-square-poll-vertical" },
  { key: "attendance", label: "Attendance", icon: "fa-user-check" },
];

export default function TeacherDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState("overview");
  const [assignments, setAssignments] = useState([]);
  const [classTeacherOf, setClassTeacherOf] = useState(null);

  useEffect(() => {
    API.get("/exams/my-assignments").then((res) => {
      setAssignments(res.data.assignments);
      setClassTeacherOf(res.data.classTeacherOf);
    });
  }, []);

  return (
    <DashboardShell
      brandLabel="Teacher Portal"
      navItems={NAV_ITEMS}
      activeTab={tab}
      onTabChange={setTab}
      userName={user?.fullName}
      userSubtitle="Teacher"
      onLogout={logout}
    >
      {tab === "overview" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Teaching Assignments</h2>
            {classTeacherOf?.class && (
              <p className="text-sm text-brand-orange font-medium mt-1">
                Class Teacher — {classTeacherOf.class.name} {classTeacherOf.stream}
              </p>
            )}
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3">Subject</th>
                  <th className="px-5 py-3">Class</th>
                  <th className="px-5 py-3">Stream</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {assignments.map((a, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-semibold text-gray-900">{a.subject?.name}</td>
                    <td className="px-5 py-3">{a.class?.name}</td>
                    <td className="px-5 py-3">{a.stream || "All streams"}</td>
                  </tr>
                ))}
                {assignments.length === 0 && (
                  <tr><td colSpan={3} className="px-5 py-6 text-center text-gray-400">No assignments yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "results" && <ResultEntry assignments={assignments} />}
      {tab === "attendance" && <AttendanceEntry classTeacherOf={classTeacherOf} />}
    </DashboardShell>
  );
}
