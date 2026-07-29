// src/pages/AdminDashboard.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import API from "../api/axios";
import DashboardShell from "../components/DashboardShell";
import StudentsTable from "../components/admin/StudentsTable";
import FeesOverviewChart from "../components/admin/FeesOverviewChart";
import FeesTab from "../components/admin/FeesTab";
import StaffTab from "../components/admin/StaffTab";
import ClassesTab from "../components/admin/ClassesTab";
import MessagesTab from "../components/admin/MessagesTab";
import BookCatalog from "../components/library/BookCatalog";
import OutstandingBooks from "../components/library/OutstandingBooks";
import SubjectsTab from "../components/admin/SubjectsTab";

const NAV_ITEMS = [
  { key: "overview", label: "Overview", icon: "fa-chart-pie" },
  { key: "students", label: "Students", icon: "fa-user-graduate" },
  { key: "staff", label: "Staff & Roles", icon: "fa-user-shield" },
  { key: "classes", label: "Classes", icon: "fa-school" },
  { key: "subjects", label: "Subjects", icon: "fa-book-open" },
  { key: "fees", label: "Fees & Arrears", icon: "fa-wallet" },
  { key: "messages", label: "Messages", icon: "fa-paper-plane" },
  { key: "results", label: "Exam Results", icon: "fa-square-poll-vertical" },
  { key: "library", label: "Library", icon: "fa-book-bookmark" },
];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const [studentsRes, staffRes, classesRes] = await Promise.all([
          API.get("/students"),
          API.get("/auth/staff"),
          API.get("/classes"),
        ]);
        setStats({
          totalStudents: studentsRes.data.students.length,
          totalStaff: staffRes.data.length,
          totalClasses: classesRes.data.classes.length,
        });
      } catch {
        setStats({ totalStudents: 0, totalStaff: 0, totalClasses: 0 });
      }
    }
    loadStats();
  }, []);

  return (
    <DashboardShell
      brandLabel="Admin Portal"
      navItems={NAV_ITEMS}
      activeTab={tab}
      onTabChange={setTab}
      userName={user?.fullName}
      userSubtitle="School Administrator"
      onLogout={logout}
    >
      {tab === "overview" && <OverviewTab stats={stats} />}
      {tab === "students" && <StudentsTable />}
      {tab === "fees" && <FeesTab />}
      {tab === "staff" && <StaffTab />}
      {tab === "classes" && <ClassesTab />}
      {tab === "subjects" && <SubjectsTab />}
      {tab === "messages" && <MessagesTab />}
      {tab === "results" && <ResultsTabPlaceholder />}
      {tab === "library" && <LibraryTab />}
    </DashboardShell>
  );
}

function OverviewTab({ stats }) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
        <p className="text-sm text-gray-500">Institutional overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard label="Total Students" value={stats?.totalStudents ?? "…"} icon="fa-graduation-cap" />
        <StatCard label="Total Staff" value={stats?.totalStaff ?? "…"} icon="fa-chalkboard-user" />
        <StatCard label="Total Classes" value={stats?.totalClasses ?? "…"} icon="fa-school" />
      </div>

      <FeesOverviewChart />
    </div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
        <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
      </div>
      <div className="w-12 h-12 bg-brand-orange-light text-brand-orange rounded-xl flex items-center justify-center text-xl">
        <i className={`fa-solid ${icon}`}></i>
      </div>
    </div>
  );
}

// The library components were built for the Librarian dashboard; an admin
// reasonably needs the same catalog + outstanding-books views, so they're
// reused directly rather than duplicated.
function LibraryTab() {
  return (
    <div className="space-y-6">
      <BookCatalog />
      <OutstandingBooks />
    </div>
  );
}

// Honest placeholder: unlike Library, there is no admin exam-management
// component yet (create exam, set components/weights, approve results across
// classes). ResultEntry and the approve-exam endpoint exist on the backend,
// but the admin-facing UI for them hasn't been built — this is next, not done.
function ResultsTabPlaceholder() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 text-sm text-gray-500">
      Exam creation and results-approval UI isn't built yet — the backend endpoints
      (<code className="text-xs bg-gray-100 px-1 rounded">POST /api/exams</code>,{" "}
      <code className="text-xs bg-gray-100 px-1 rounded">POST /api/exams/:id/approve</code>) are ready and waiting.
    </div>
  );
}
