// src/pages/LibrarianDashboard.jsx
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../hooks/useAuth";
import API from "../api/axios";
import DashboardShell from "../components/DashboardShell";

const NAV_ITEMS = [
  { key: "overview", label: "Overview", icon: "fa-chart-pie" },
  { key: "catalog", label: "Book Catalog", icon: "fa-book" },
  { key: "issue", label: "Issue a Book", icon: "fa-right-from-bracket" },
  { key: "outstanding", label: "Outstanding / Returns", icon: "fa-clock-rotate-left" },
];

export default function LibrarianDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState("overview");
  const [books, setBooks] = useState([]);
  const [outstanding, setOutstanding] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [loadingOutstanding, setLoadingOutstanding] = useState(true);

  const loadBooks = async (search = "") => {
    setLoadingBooks(true);
    try {
      const res = await API.get("/library/books", { params: search ? { search } : {} });
      setBooks(res.data.books);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load books");
    } finally {
      setLoadingBooks(false);
    }
  };

  const loadOutstanding = async () => {
    setLoadingOutstanding(true);
    try {
      const res = await API.get("/library/outstanding");
      setOutstanding(res.data.issues);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load outstanding loans");
    } finally {
      setLoadingOutstanding(false);
    }
  };

  useEffect(() => {
    loadBooks();
    loadOutstanding();
  }, []);

  const overdueCount = outstanding.filter((i) => i.isOverdue).length;
  const availableTitles = books.filter((b) => b.availableCopies > 0).length;

  return (
    <DashboardShell
      brandLabel="Library Portal"
      navItems={NAV_ITEMS}
      activeTab={tab}
      onTabChange={setTab}
      userName={user?.fullName}
      userSubtitle="Librarian"
      onLogout={logout}
    >
      {tab === "overview" && (
        <OverviewTab
          totalTitles={books.length}
          availableTitles={availableTitles}
          outstandingCount={outstanding.length}
          overdueCount={overdueCount}
        />
      )}
      {tab === "catalog" && (
        <CatalogTab books={books} loading={loadingBooks} onSearch={loadBooks} onChanged={loadBooks} />
      )}
      {tab === "issue" && (
        <IssueBookTab books={books} onIssued={() => { loadBooks(); loadOutstanding(); }} />
      )}
      {tab === "outstanding" && (
        <OutstandingTab
          issues={outstanding}
          loading={loadingOutstanding}
          onReturned={() => { loadOutstanding(); loadBooks(); }}
        />
      )}
    </DashboardShell>
  );
}

/* ---------------- OVERVIEW ---------------- */

function OverviewTab({ totalTitles, availableTitles, outstandingCount, overdueCount }) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Library Dashboard</h2>
        <p className="text-sm text-gray-500">Catalog and circulation overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard label="Total Titles" value={totalTitles} icon="fa-book" />
        <StatCard label="Titles In Stock" value={availableTitles} icon="fa-square-check" />
        <StatCard label="Currently Issued" value={outstandingCount} icon="fa-arrow-right-arrow-left" />
        <StatCard
          label="Overdue"
          value={overdueCount}
          icon="fa-triangle-exclamation"
          accent={overdueCount > 0}
        />
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, accent }) {
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
        <h3 className={`text-2xl font-bold mt-1 ${accent ? "text-red-600" : "text-gray-900"}`}>{value}</h3>
      </div>
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
          accent ? "bg-red-50 text-red-500" : "bg-brand-orange-light text-brand-orange"
        }`}
      >
        <i className={`fa-solid ${icon}`}></i>
      </div>
    </div>
  );
}

/* ---------------- CATALOG ---------------- */

function CatalogTab({ books, loading, onSearch, onChanged }) {
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => onSearch(search), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Book Catalog</h3>
          <p className="text-xs text-gray-500">{books.length} titles</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search title or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/40"
          />
          <button
            onClick={() => setShowAdd((s) => !s)}
            className="bg-brand-orange text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-orange-hover transition whitespace-nowrap"
          >
            <i className="fa-solid fa-plus mr-1.5"></i>
            Add Book
          </button>
        </div>
      </div>

      {showAdd && (
        <AddBookForm
          onCancel={() => setShowAdd(false)}
          onAdded={() => {
            setShowAdd(false);
            onChanged();
          }}
        />
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left px-5 py-3">Title</th>
              <th className="text-left px-5 py-3">Author</th>
              <th className="text-left px-5 py-3">Book #</th>
              <th className="text-left px-5 py-3">Category</th>
              <th className="text-left px-5 py-3">Copies</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : books.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-gray-400">
                  No books found.
                </td>
              </tr>
            ) : (
              books.map((b) => (
                <tr key={b._id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-900">{b.title}</td>
                  <td className="px-5 py-3 text-gray-600">{b.author || "—"}</td>
                  <td className="px-5 py-3 text-gray-600">{b.bookNumber}</td>
                  <td className="px-5 py-3 text-gray-600">{b.category || "—"}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`font-medium ${
                        b.availableCopies === 0 ? "text-red-600" : "text-gray-900"
                      }`}
                    >
                      {b.availableCopies}
                    </span>
                    <span className="text-gray-400"> / {b.totalCopies}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function AddBookForm({ onCancel, onAdded }) {
  const [form, setForm] = useState({
    title: "",
    author: "",
    isbn: "",
    bookNumber: "",
    category: "",
    totalCopies: 1,
  });
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.bookNumber) {
      toast.error("Title and book number are required");
      return;
    }
    setSubmitting(true);
    try {
      await API.post("/library/books", { ...form, totalCopies: Number(form.totalCopies) || 1 });
      toast.success("Book added");
      onAdded();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add book");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="p-5 border-b border-gray-200 bg-orange-50/30 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <input
        placeholder="Title *"
        value={form.title}
        onChange={update("title")}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
      />
      <input
        placeholder="Author"
        value={form.author}
        onChange={update("author")}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
      />
      <input
        placeholder="ISBN"
        value={form.isbn}
        onChange={update("isbn")}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
      />
      <input
        placeholder="Book Number *"
        value={form.bookNumber}
        onChange={update("bookNumber")}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
      />
      <input
        placeholder="Category"
        value={form.category}
        onChange={update("category")}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
      />
      <input
        type="number"
        min="1"
        placeholder="Total Copies"
        value={form.totalCopies}
        onChange={update("totalCopies")}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
      />
      <div className="sm:col-span-2 lg:col-span-3 flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="bg-brand-orange text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-orange-hover transition disabled:opacity-50"
        >
          {submitting ? "Saving..." : "Save Book"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm font-medium px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

/* ---------------- ISSUE BOOK ---------------- */

function IssueBookTab({ books, onIssued }) {
  const [bookId, setBookId] = useState("");
  const [borrowerType, setBorrowerType] = useState("student");
  const [borrowerIdsRaw, setBorrowerIdsRaw] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const selectedBook = books.find((b) => b._id === bookId);

  const submit = async (e) => {
    e.preventDefault();
    const borrowerIds = borrowerIdsRaw.split(",").map((s) => s.trim()).filter(Boolean);
    if (!bookId || !borrowerIds.length || !dueDate) {
      toast.error("Book, at least one borrower ID, and a due date are required");
      return;
    }
    setSubmitting(true);
    try {
      await API.post("/library/issue", { bookId, borrowerType, borrowerIds, dueDate });
      toast.success(`Issued to ${borrowerIds.length} borrower${borrowerIds.length > 1 ? "s" : ""}`);
      setBorrowerIdsRaw("");
      setDueDate("");
      onIssued();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to issue book");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 max-w-2xl">
      <h3 className="text-lg font-bold text-gray-900 mb-1">Issue a Book</h3>
      <p className="text-xs text-gray-500 mb-5">
        Issue to one borrower, or several at once (comma-separated IDs) for a class-wide loan.
      </p>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Book
          </label>
          <select
            value={bookId}
            onChange={(e) => setBookId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Select a book...</option>
            {books.map((b) => (
              <option key={b._id} value={b._id} disabled={b.availableCopies === 0}>
                {b.title} ({b.availableCopies} available)
              </option>
            ))}
          </select>
          {selectedBook && selectedBook.availableCopies === 0 && (
            <p className="text-xs text-red-600 mt-1">No copies currently available for this title.</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Borrower Type
          </label>
          <div className="flex gap-3">
            {["student", "teacher"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setBorrowerType(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize border transition
                  ${borrowerType === t
                    ? "bg-brand-orange text-white border-brand-orange"
                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Borrower ID(s)
          </label>
          <input
            placeholder="Comma-separated IDs for multiple borrowers"
            value={borrowerIdsRaw}
            onChange={(e) => setBorrowerIdsRaw(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Due Date
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-brand-orange text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-brand-orange-hover transition disabled:opacity-50"
        >
          {submitting ? "Issuing..." : "Issue Book"}
        </button>
      </form>
    </section>
  );
}

/* ---------------- OUTSTANDING / RETURNS ---------------- */

function OutstandingTab({ issues, loading, onReturned }) {
  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-900">Outstanding Loans</h3>
        <p className="text-xs text-gray-500">{issues.length} copies currently checked out</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left px-5 py-3">Book</th>
              <th className="text-left px-5 py-3">Borrower</th>
              <th className="text-left px-5 py-3">Due Date</th>
              <th className="text-left px-5 py-3">Status</th>
              <th className="text-right px-5 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : issues.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-gray-400">
                  Nothing currently checked out.
                </td>
              </tr>
            ) : (
              issues.map((i) => (
                <IssueRow key={i._id} issue={i} onReturned={onReturned} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function IssueRow({ issue, onReturned }) {
  const [returning, setReturning] = useState(false);

  const markReturned = async (condition) => {
    let fineAmount = 0;
    if (condition === "damaged" || condition === "lost") {
      const input = window.prompt("Fine amount for this copy?", "0");
      fineAmount = Number(input) || 0;
    }
    setReturning(true);
    try {
      await API.patch(`/library/issue/${issue._id}/return`, { condition, fineAmount });
      toast.success("Marked as returned");
      onReturned();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to record return");
    } finally {
      setReturning(false);
    }
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-5 py-3 font-medium text-gray-900">
        {issue.book?.title || "—"}
        <div className="text-xs text-gray-400">{issue.book?.bookNumber}</div>
      </td>
      <td className="px-5 py-3 text-gray-600 capitalize">
        {issue.borrower?.fullName || issue.borrower?.name || issue.borrower?._id || "—"}
        <div className="text-xs text-gray-400">{issue.borrowerType}</div>
      </td>
      <td className="px-5 py-3 text-gray-600">
        {issue.dueDate ? new Date(issue.dueDate).toLocaleDateString() : "—"}
      </td>
      <td className="px-5 py-3">
        {issue.isOverdue ? (
          <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-full">
            Overdue
          </span>
        ) : (
          <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
            On Time
          </span>
        )}
      </td>
      <td className="px-5 py-3 text-right space-x-2">
        <button
          disabled={returning}
          onClick={() => markReturned("good")}
          className="text-xs font-medium px-3 py-1.5 rounded-lg bg-brand-orange text-white hover:bg-brand-orange-hover transition disabled:opacity-50"
        >
          Returned
        </button>
        <button
          disabled={returning}
          onClick={() => markReturned("damaged")}
          className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition disabled:opacity-50"
        >
          Damaged
        </button>
        <button
          disabled={returning}
          onClick={() => markReturned("lost")}
          className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition disabled:opacity-50"
        >
          Lost
        </button>
      </td>
    </tr>
  );
}
