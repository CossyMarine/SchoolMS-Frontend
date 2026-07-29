// src/components/admin/FeesTab.jsx
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API from "../../api/axios";

export default function FeesTab() {
  const [classes, setClasses] = useState([]);
  const [school, setSchool] = useState(null);
  const [studentSearch, setStudentSearch] = useState("");
  const [foundStudent, setFoundStudent] = useState(null);
  const [statement, setStatement] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const [paymentRef, setPaymentRef] = useState("");
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    API.get("/classes").then((res) => setClasses(res.data.classes));
    API.get("/school-config").then((res) => setSchool(res.data.school));
  }, []);

  const searchStudent = async () => {
    const res = await API.get("/students", { params: { search: studentSearch } });
    if (res.data.students[0]) {
      setFoundStudent(res.data.students[0]);
      const stmt = await API.get(`/fees/student/${res.data.students[0]._id}`);
      setStatement(stmt.data);
    } else {
      toast.error("No student found");
      setFoundStudent(null);
      setStatement(null);
    }
  };

  const recordPayment = async () => {
    if (!foundStudent || !paymentAmount) return;
    setRecording(true);
    try {
      const res = await API.post("/fees/payments", {
        studentId: foundStudent._id,
        amount: Number(paymentAmount),
        method: paymentMethod,
        reference: paymentRef,
      });
      toast.success(`Payment recorded — Receipt ${res.data.payment.receiptNumber}`);
      setPaymentAmount("");
      setPaymentRef("");
      const stmt = await API.get(`/fees/student/${foundStudent._id}`);
      setStatement(stmt.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Payment failed");
    } finally {
      setRecording(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Invoice generation */}
      <GenerateInvoices classes={classes} feeTypes={school?.feeTypes || []} />

      {/* Payment recording */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Record Payment</h3>
        <div className="flex gap-2 mb-4">
          <input
            placeholder="Search admission number or name..."
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1"
          />
          <button onClick={searchStudent} className="bg-gray-100 border border-gray-300 text-gray-800 text-sm px-4 py-2 rounded-lg hover:bg-gray-200">
            Search
          </button>
        </div>

        {foundStudent && statement && (
          <div className="space-y-4">
            <div className="p-3 bg-orange-50/50 rounded-lg text-sm">
              <p className="font-semibold text-gray-900">{foundStudent.firstName} {foundStudent.lastName}</p>
              <p className="text-xs text-gray-500">{foundStudent.admissionNumber} · {foundStudent.class?.name}</p>
              <p className="text-sm mt-1">
                Balance: <span className="font-bold text-red-600">
                  KES {statement.invoices.reduce((s, i) => s + i.balance, 0).toLocaleString()}
                </span>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input type="number" placeholder="Amount (KES)" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="mpesa">M-Pesa</option>
                <option value="cash">Cash</option>
                <option value="bank">Bank</option>
                <option value="cheque">Cheque</option>
              </select>
              <input placeholder="Reference (M-Pesa code, etc)" value={paymentRef} onChange={(e) => setPaymentRef(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>

            <button
              onClick={recordPayment}
              disabled={recording}
              className="bg-brand-orange hover:bg-brand-orange-hover disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-lg"
            >
              {recording ? "Recording…" : "Record Payment"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function GenerateInvoices({ classes, feeTypes }) {
  const [classId, setClassId] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [term, setTerm] = useState("");
  const [selectedFeeTypes, setSelectedFeeTypes] = useState({}); // feeTypeId -> amount
  const [generating, setGenerating] = useState(false);

  const toggleFeeType = (id) => {
    setSelectedFeeTypes((prev) => {
      const next = { ...prev };
      if (id in next) delete next[id];
      else next[id] = 0;
      return next;
    });
  };

  const handleGenerate = async () => {
    if (!classId || !academicYear || !term || Object.keys(selectedFeeTypes).length === 0) {
      return toast.error("Fill in class, year, term, and select at least one fee type");
    }
    setGenerating(true);
    try {
      await API.post("/fees/generate-invoices", {
        classId,
        academicYear,
        term,
        feeTypeIds: Object.keys(selectedFeeTypes),
        amounts: selectedFeeTypes,
      });
      toast.success("Invoices generated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to generate invoices");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Generate Term Invoices</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <select value={classId} onChange={(e) => setClassId(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="">Select Class</option>
          {classes.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <input placeholder="Academic Year (e.g. 2026)" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        <input placeholder="Term (e.g. Term 2)" value={term} onChange={(e) => setTerm(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      </div>

      <div className="space-y-2 mb-4">
        {feeTypes.map((ft) => (
          <div key={ft._id} className="flex items-center gap-3">
            <input type="checkbox" checked={ft._id in selectedFeeTypes} onChange={() => toggleFeeType(ft._id)} />
            <span className="text-sm w-40">{ft.name}</span>
            {ft._id in selectedFeeTypes && (
              <input
                type="number"
                placeholder="Amount (KES)"
                value={selectedFeeTypes[ft._id]}
                onChange={(e) => setSelectedFeeTypes((prev) => ({ ...prev, [ft._id]: Number(e.target.value) }))}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-40"
              />
            )}
          </div>
        ))}
        {feeTypes.length === 0 && <p className="text-xs text-gray-400">No fee types configured yet — add them in School Settings.</p>}
      </div>

      <button
        onClick={handleGenerate}
        disabled={generating}
        className="bg-brand-orange hover:bg-brand-orange-hover disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-lg"
      >
        {generating ? "Generating…" : "Generate Invoices"}
      </button>
    </div>
  );
            }
