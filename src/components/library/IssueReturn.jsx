// src/components/library/IssueReturn.jsx
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API from "../../api/axios";

export default function IssueReturn() {
  const [books, setBooks] = useState([]);
  const [classes, setClasses] = useState([]);
  const [bookId, setBookId] = useState("");
  const [classId, setClassId] = useState("");
  const [stream, setStream] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [students, setStudents] = useState([]);
  const [dueDate, setDueDate] = useState("");
  const [issuing, setIssuing] = useState(false);

  useEffect(() => {
    API.get("/library/books").then((res) => setBooks(res.data.books));
    API.get("/classes").then((res) => setClasses(res.data.classes));
  }, []);

  useEffect(() => {
    if (!classId) return;
    API.get("/students", { params: { classId, stream } }).then((res) => setStudents(res.data.students));
  }, [classId, stream]);

  const toggleStudent = (id) => {
    setSelectedStudentIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleIssue = async () => {
    if (!bookId || !selectedStudentIds.length || !dueDate) {
      return toast.error("Select a book, at least one student, and a due date");
    }
    setIssuing(true);
    try {
      await API.post("/library/issue", {
        bookId,
        borrowerType: "student",
        borrowerIds: selectedStudentIds,
        dueDate,
      });
      toast.success(`Issued to ${selectedStudentIds.length} student(s)`);
      setSelectedStudentIds([]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to issue book");
    } finally {
      setIssuing(false);
    }
  };

  const selectedClass = classes.find((c) => c._id === classId);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
      <h3 className="text-lg font-bold text-gray-900">Issue Book</h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <select value={bookId} onChange={(e) => setBookId(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="">Select Book</option>
          {books.map((b) => (
            <option key={b._id} value={b._id}>{b.title} ({b.availableCopies} available)</option>
          ))}
        </select>
        <select value={classId} onChange={(e) => { setClassId(e.target.value); setStream(""); }} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="">Select Class</option>
          {classes.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
        {selectedClass?.streams?.length > 0 && (
          <select value={stream} onChange={(e) => setStream(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="">All streams</option>
            {selectedClass.streams.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        )}
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      </div>

      {students.length > 0 && (
        <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto divide-y divide-gray-100">
          {students.map((s) => (
            <label key={s._id} className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedStudentIds.includes(s._id)}
                onChange={() => toggleStudent(s._id)}
              />
              {s.firstName} {s.lastName} — {s.admissionNumber}
            </label>
          ))}
        </div>
      )}

      <button
        onClick={handleIssue}
        disabled={issuing}
        className="bg-brand-orange hover:bg-brand-orange-hover disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-lg"
      >
        {issuing ? "Issuing…" : `Issue to ${selectedStudentIds.length} selected`}
      </button>
    </div>
  );
                     }
