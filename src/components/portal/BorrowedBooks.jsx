// src/components/portal/BorrowedBooks.jsx
import { useEffect, useState } from "react";
import API from "../../api/axios";

export default function BorrowedBooks({ studentId }) {
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    API.get(`/library/borrower/student/${studentId}`).then((res) => setIssues(res.data.issues));
  }, [studentId]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <h3 className="font-bold text-gray-900 mb-4 pb-3 border-b border-gray-200">Borrowed Books</h3>
      {issues.length === 0 ? (
        <p className="text-xs text-gray-400">No books currently borrowed.</p>
      ) : (
        <div className="space-y-2">
          {issues.map((i) => (
            <div key={i._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg text-xs">
              <div>
                <p className="font-semibold text-gray-900">{i.book?.title}</p>
                <p className="text-gray-500">Due {new Date(i.dueDate).toLocaleDateString()}</p>
              </div>
              <span className={`font-bold ${i.status === "issued" ? "text-brand-orange" : "text-green-600"}`}>
                {i.status === "issued" ? "Borrowed" : i.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
