// src/components/DashboardShell.jsx
import { useState } from "react";

export default function DashboardShell({
  brandLabel,
  navItems,
  activeTab,
  onTabChange,
  userName,
  userSubtitle,
  onLogout,
  children,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const initials = (userName || "U").split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 text-gray-900">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out flex flex-col justify-between shadow-sm
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div>
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-brand-orange flex items-center justify-center font-bold text-xl text-white shadow-md">
                E
              </div>
              <div>
                <h1 className="font-bold text-base leading-none text-gray-900">EduCore</h1>
                <span className="text-xs text-gray-500">{brandLabel}</span>
              </div>
            </div>
            <button className="md:hidden text-gray-400 hover:text-gray-600" onClick={() => setSidebarOpen(false)}>
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
          </div>

          <nav className="px-4 py-4 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  onTabChange(item.key);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition text-left
                  ${activeTab === item.key
                    ? "bg-brand-orange text-white shadow-sm"
                    : "text-gray-600 hover:bg-brand-orange-light hover:text-brand-orange"}`}
              >
                <i className={`fa-solid ${item.icon} w-5`}></i>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center space-x-3 p-2 rounded-lg bg-orange-50/60 border border-orange-100">
            <div className="w-9 h-9 rounded-full bg-brand-orange text-white flex items-center justify-center font-semibold">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
              <p className="text-xs text-gray-500 truncate">{userSubtitle}</p>
            </div>
            <button title="Logout" onClick={onLogout} className="text-gray-400 hover:text-brand-orange transition">
              <i className="fa-solid fa-right-from-bracket"></i>
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col md:ml-64 overflow-y-auto">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40 px-6 py-4 flex items-center justify-between md:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-600 hover:text-brand-orange">
            <i className="fa-solid fa-bars text-xl"></i>
          </button>
          <span className="font-bold text-gray-900">{brandLabel}</span>
          <span />
        </header>

        <main className="p-6 space-y-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
