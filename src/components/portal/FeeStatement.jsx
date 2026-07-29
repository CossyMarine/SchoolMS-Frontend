// src/components/portal/FeeStatement.jsx
import { useEffect, useState } from "react";
import API from "../../api/axios";

export default function FeeStatement({ studentId, compact }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    API.get(`/fees/student/${studentId}`).then((res) => setData(res.data));
  }, [studentId]);

  if (!data) return <div className="bg-white rounded-xl border border-gray-200 p-5 text-sm text-gray-400">Loading fee statement…</div>;

  const openInvoices = data.invoices.filter((i) => i.status === "open");
  const totalBalance = openInvoices.reduce((s, i) => s + i.balance, 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
        <h3 className="font-bold text-gray-900">Fee Statement</h3>
        <span className={`text-sm font-bold ${totalBalance > 0 ? "text-red-600" : "text-green-600"}`}>
          {totalBalance > 0 ? `KES ${totalBalance.toLocaleString()} due` : "Fully Cleared"}
        </span>
      </div>

      <div className="space-y-3 text-xs">
        {(compact ? data.invoices.slice(0, 3) : data.invoices).map((inv) => (
          <div key={inv._id} className="p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-1">
              <p className="font-semibold text-gray-900">{inv.academicYear} — {inv.term}</p>
              <span className={`font-bold ${inv.balance > 0 ? "text-red-600" : "text-green-600"}`}>
                {inv.balance > 0 ? `KES ${inv.balance.toLocaleString()}` : "Cleared"}
              </span>
            </div>
            {!compact &&
              inv.lineItems.map((li) => (
                <div key={li._id} className="flex justify-between text-gray-500 pl-2">
                  <span>{li.name}</span>
                  <span>KES {li.amountExpected.toLocaleString()} (paid {li.amountPaid.toLocaleString()})</span>
                </div>
              ))}
          </div>
        ))}
        {data.invoices.length === 0 && <p className="text-gray-400">No invoices yet.</p>}
      </div>

      {!compact && data.payments.length > 0 && (
        <div className="mt-5 pt-4 border-t border-gray-200">
          <p className="text-xs font-bold text-gray-700 uppercase mb-2">Payment History</p>
          <div className="space-y-2">
            {data.payments.map((p) => (
              <div key={p._id} className="flex justify-between text-xs text-gray-600">
                <span>{p.receiptNumber} — {p.method}</span>
                <span className="font-semibold text-gray-900">KES {p.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
