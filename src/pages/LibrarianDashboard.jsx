// src/pages/LibrarianDashboard.jsx
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import DashboardShell from "../components/DashboardShell";
import BookCatalog from "../components/library/BookCatalog";
import IssueReturn from "../components/library/IssueReturn";
import OutstandingBooks from "../components/library/OutstandingBooks";

const NAV_ITEMS = [
  { key: "catalog", label: "Book Catalog", icon: "fa-book" },
  { key: "issue", label: "Issue / Return", icon: "fa-right-left" },
  { key: "outstanding", label: "Outstanding Books", icon: "fa-triangle-exclamation" },
];

export default function LibrarianDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState("catalog");

  return (
    <DashboardShell
      brandLabel="Librarian Portal"
      navItems={NAV_ITEMS}
      activeTab={tab}
      onTabChange={setTab}
      userName={user?.fullName}
      userSubtitle="Librarian"
      onLogout={logout}
    >
      {tab === "catalog" && <BookCatalog />}
      {tab === "issue" && <IssueReturn />}
      {tab === "outstanding" && <OutstandingBooks />}
    </DashboardShell>
  );
}
