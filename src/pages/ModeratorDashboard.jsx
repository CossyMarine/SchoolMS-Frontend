// src/pages/ModeratorDashboard.jsx
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import DashboardShell from "../components/DashboardShell";
import StudentsTable from "../components/admin/StudentsTable";
import FeesTab from "../components/admin/FeesTab";
import MessagesTab from "../components/admin/MessagesTab";
import ModeratorAttendanceEntry from "../components/moderator/ModeratorAttendanceEntry";
import OutstandingBooks from "../components/library/OutstandingBooks";
import BookCatalog from "../components/library/BookCatalog";

// Maps a permission key to the nav item + component shown when it's granted
const MODULE_MAP = [
  { key: "admissions", label: "Admissions", icon: "fa-user-graduate", component: <StudentsTable /> },
  { key: "fees", label: "Fees", icon: "fa-wallet", component: <FeesTab /> },
  { key: "messaging", label: "Messages", icon: "fa-paper-plane", component: <MessagesTab /> },
  { key: "attendance", label: "Attendance", icon: "fa-user-check", component: <ModeratorAttendanceEntry /> },
  { key: "library", label: "Library", icon: "fa-book-bookmark", component: <BookCatalog /> },
];

export default function ModeratorDashboard() {
  const { user, logout } = useAuth();
  const granted = MODULE_MAP.filter((m) => user?.permissions?.[m.key]);
  const [tab, setTab] = useState(granted[0]?.key || null);

  const navItems = granted.map((m) => ({ key: m.key, label: m.label, icon: m.icon }));
  const active = granted.find((m) => m.key === tab);

  return (
    <DashboardShell
      brandLabel={user?.moderatorTitle || "Moderator Portal"}
      navItems={navItems}
      activeTab={tab}
      onTabChange={setTab}
      userName={user?.fullName}
      userSubtitle={user?.moderatorTitle || "Moderator"}
      onLogout={logout}
    >
      {granted.length === 0 ? (
        <p className="text-sm text-gray-400">No modules have been enabled for your account yet — contact your administrator.</p>
      ) : (
        active?.component
      )}
    </DashboardShell>
  );
}
