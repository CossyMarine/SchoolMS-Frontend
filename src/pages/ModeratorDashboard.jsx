// src/pages/ModeratorDashboard.jsx
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import DashboardShell from "../components/DashboardShell";
import StudentsTable from "../components/admin/StudentsTable";

const ALL_NAV_ITEMS = [
  { key: "overview", label: "Overview", icon: "fa-chart-pie", permission: null },
  { key: "students", label: "Students", icon: "fa-user-graduate", permission: "admissions" },
  { key: "fees", label: "Fees & Arrears", icon: "fa-wallet", permission: "fees" },
  { key: "attendance", label: "Attendance", icon: "fa-clipboard-check", permission: "attendance" },
  { key: "results", label: "Exam Results", icon: "fa-square-poll-vertical", permission: "results" },
  { key: "library", label: "Library", icon: "fa-book-bookmark", permission: "library" },
  { key: "messages", label: "Messages", icon: "fa-paper-plane", permission: "messaging" },
];

export default function ModeratorDashboard() {
  const { user, logout } = useAuth();

  const allowedItems = ALL_NAV_ITEMS.filter(
    (item) => item.permission === null || user?.permissions?.[item.permission]
  );

  const [tab, setTab] = useState(allowedItems[0]?.key ?? "overview");

  return (
    <DashboardShell
      brandLabel="Moderator Portal"
      navItems={allowedItems}
      activeTab={tab}
      onTabChange={setTab}
      userName={user?.fullName}
      userSubtitle={user?.moderatorTitle || "Moderator"}
      onLogout={logout}
    >
      {tab === "overview" && <OverviewTab user={user} />}
      {tab === "students" && user?.permissions?.admissions && <StudentsTable />}
      {tab === "fees" && user?.permissions?.fees && (
        <PlaceholderTab label="Fees & Arrears" />
      )}
      {tab === "attendance" && user?.permissions?.attendance && (
        <PlaceholderTab label="Attendance" />
      )}
      {tab === "results" && user?.permissions?.results && (
        <PlaceholderTab label="Exam Results" />
      )}
      {tab === "library" && user?.permissions?.library && (
        <PlaceholderTab label="Library" />
      )}
      {tab === "messages" && user?.permissions?.messaging && (
        <PlaceholderTab label="Messages" />
      )}
    </DashboardShell>
  );
}

function OverviewTab({ user }) {
  const grantedModules = Object.entries(user?.permissions || {}).filter(([, v]) => v);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Moderator Dashboard</h2>
        <p className="text-sm text-gray-500">
          {user?.moderatorTitle ? `${user.moderatorTitle} — ` : ""}
          Scoped access based on your assigned permissions.
        </p>
      </div>

      {grantedModules.length === 0 ? (
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm text-sm text-gray-500">
          No modules have been enabled for your account yet. Contact an administrator.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {grantedModules.map(([key]) => (
            <div
              key={key}
              className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Module Access
                </p>
                <h3 className="text-lg font-bold text-gray-900 mt-1 capitalize">{key}</h3>
              </div>
              <div className="w-12 h-12 bg-brand-orange-light text-brand-orange rounded-xl flex items-center justify-center text-xl">
                <i className="fa-solid fa-circle-check"></i>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PlaceholderTab({ label }) {
  return (
    <div className="text-sm text-gray-500">{label} module UI — next build step.</div>
  );
}
