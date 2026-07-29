// src/pages/StudentParentPortal.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import API from "../api/axios";
import DashboardShell from "../components/DashboardShell";
import FeeStatement from "../components/portal/FeeStatement";
import ReportCard from "../components/portal/ReportCard";
import BorrowedBooks from "../components/portal/BorrowedBooks";
import NoticesPanel from "../components/portal/NoticesPanel";

const NAV_ITEMS = [
  { key: "overview", label: "Dashboard", icon: "fa-chart-pie" },
  { key: "fees", label: "Fee Statement", icon: "fa-wallet" },
  { key: "results", label: "Results & Report Cards", icon: "fa-square-poll-vertical" },
  { key: "library", label: "Borrowed Books", icon: "fa-book-bookmark" },
  { key: "notices", label: "School Notices", icon: "fa-envelope" },
];

export default function StudentParentPortal() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState("overview");
  const [children, setChildren] = useState([]);
  const [activeChildId, setActiveChildId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/students/me")
      .then((res) => {
        setChildren(res.data.students);
        if (res.data.students[0]) setActiveChildId(res.data.students[0]._id);
      })
      .finally(() => setLoading(false));
  }, []);

  const activeChild = children.find((c) => c._id === activeChildId);

  return (
    <DashboardShell
      brandLabel={user?.role === "parent" ? "Parent Portal" : "Student Portal"}
      navItems={NAV_ITEMS}
      activeTab={tab}
      onTabChange={setTab}
      userName={user?.fullName}
      userSubtitle={user?.role === "parent" ? "Parent/Guardian" : "Student"}
      onLogout={logout}
    >
      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : !activeChild ? (
        <p className="text-sm text-gray-400">No student record is linked to this account yet.</p>
      ) : (
        <>
          {children.length > 1 && (
            <div className="mb-6">
              <label className="text-xs font-bold text-gray-500 uppercase mr-2">Viewing:</label>
              <select
                value={activeChildId}
                onChange={(e) => setActiveChildId(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
              >
                {children.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.firstName} {c.lastName} — {c.class?.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <WelcomeBanner student={activeChild} />

          {tab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <FeeStatement studentId={activeChild._id} compact />
              <ReportCard studentId={activeChild._id} classId={activeChild.class?._id} compact />
            </div>
          )}
          {tab === "fees" && <div className="mt-6"><FeeStatement studentId={activeChild._id} /></div>}
          {tab === "results" && <div className="mt-6"><ReportCard studentId={activeChild._id} classId={activeChild.class?._id} /></div>}
          {tab === "library" && <div className="mt-6"><BorrowedBooks studentId={activeChild._id} /></div>}
          {tab === "notices" && <div className="mt-6"><NoticesPanel /></div>}
        </>
      )}
    </DashboardShell>
  );
}

function WelcomeBanner({ student }) {
  return (
    <div className="bg-white text-gray-900 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 border border-orange-200">
      <div className="space-y-1">
        <span className="text-xs font-bold text-brand-orange uppercase tracking-wider">Welcome</span>
        <h2 className="text-2xl font-bold">{student.firstName} {student.lastName}</h2>
        <p className="text-xs text-gray-500">
          {student.admissionNumber} · {student.class?.name} {student.stream}
        </p>
      </div>
    </div>
  );
}
