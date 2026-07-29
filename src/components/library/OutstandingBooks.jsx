// src/components/library/OutstandingBooks.jsx
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API from "../../api/axios";

export default function OutstandingBooks() {
  const [issues, setIssues] = useState([]);

  const load = () => API.get("/library/outstanding").then((res) => setIssues(res.data.issues));
  useEffect(() => { load(); }, []);

  const handleReturn = async (id, condition) => {
    try {
      await API.patch(`/library/issue/${id}/return`, { condition });
      toast.success("Return recorded");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to record return");
    }
  };

  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-900">Outstanding Books</h3>
        <p className="text-xs text-gray-500">{issues.length} copies currently checked out</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-semibold border-b border-gray-200">
            <tr>
              <th className="px-5 py-3">Book</th>
              <th className="px-5 py-3">Borrower</th>
              <th className="px-5 py-3">Due Date</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {issues.map((i) => (
              <tr key={i._id} className={i.isOverdue ? "bg-red-50/50" : "hover:bg-gray-50"}>
                <td className="px-5 py-3 font-semibold text-gray-900">{i.book?.title}</td>
                <td className="px-5 py-3">{i.borrower?.firstName} {i.borrower?.lastName}</td>
                <td className={`px-5 py-3 ${i.isOverdue ? "text-red-600 font-semibold" : ""}`}>
                  {new Date(i.dueDate).toLocaleDateString()} {i.isOverdue && "(Overdue)"}
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleReturn(i._id, "good")} className="bg-green-600 text-white text-xs px-2.5 py-1 rounded hover:bg-green-700">Returned</button>
                    <button onClick={() => handleReturn(i._id, "damaged")} className="bg-amber-500 text-white text-xs px-2.5 py-1 rounded hover:bg-amber-600">Damaged</button>
                    <button onClick={() => handleReturn(i._id, "lost")} className="bg-red-600 text-white text-xs px-2.5 py-1 rounded hover:bg-red-700">Lost</button>
                  </div>
                </td>
              </tr>
            ))}
            {issues.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-6 text-center text-gray-400">Nothing outstanding</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
