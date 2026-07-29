// src/components/library/BookCatalog.jsx
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API from "../../api/axios";

const emptyForm = { title: "", author: "", isbn: "", bookNumber: "", category: "", totalCopies: 1 };

export default function BookCatalog() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () => API.get("/library/books", { params: { search } }).then((res) => setBooks(res.data.books));

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.post("/library/books", form);
      toast.success("Book added to catalog");
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add book");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Book Catalog</h3>
          <p className="text-xs text-gray-500">{books.length} titles</p>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search title or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-56 focus:outline-none focus:border-brand-orange"
          />
          <button
            onClick={() => setShowForm((v) => !v)}
            className="bg-brand-orange text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-brand-orange-hover transition"
          >
            <i className="fa-solid fa-plus mr-1"></i> Add Book
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="p-5 bg-orange-50/40 border-b border-gray-200 grid grid-cols-2 md:grid-cols-3 gap-3">
          <input required placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <input placeholder="Author" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <input required placeholder="Book Number (e.g. LIB-0042)" value={form.bookNumber} onChange={(e) => setForm({ ...form, bookNumber: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <input placeholder="ISBN" value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <input type="number" min={1} placeholder="Total Copies" value={form.totalCopies} onChange={(e) => setForm({ ...form, totalCopies: Number(e.target.value) })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <button type="submit" disabled={saving} className="col-span-2 md:col-span-3 bg-brand-orange text-white text-sm font-semibold py-2 rounded-lg hover:bg-brand-orange-hover disabled:opacity-60">
            {saving ? "Saving…" : "Save Book"}
          </button>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-semibold border-b border-gray-200">
            <tr>
              <th className="px-5 py-3">Title</th>
              <th className="px-5 py-3">Book #</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Available</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {books.map((b) => (
              <tr key={b._id} className="hover:bg-gray-50">
                <td className="px-5 py-3 font-semibold text-gray-900">{b.title}</td>
                <td className="px-5 py-3 font-mono text-xs">{b.bookNumber}</td>
                <td className="px-5 py-3">{b.category || "—"}</td>
                <td className="px-5 py-3">
                  <span className={b.availableCopies === 0 ? "text-red-600 font-semibold" : "text-green-600 font-semibold"}>
                    {b.availableCopies}/{b.totalCopies}
                  </span>
                </td>
              </tr>
            ))}
            {books.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-6 text-center text-gray-400">No books found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
                                                                                                      }
