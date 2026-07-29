// src/components/admin/FeesOverviewChart.jsx
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
import API from "../../api/axios";

export default function FeesOverviewChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/fees/summary-by-class")
      .then((res) => setData(res.data.summary))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-gray-900">Financial Overview & Fee Trends</h3>
          <p className="text-xs text-gray-500">Collected fees vs. outstanding arrears per class</p>
        </div>
      </div>
      <div className="h-64 w-full">
        {loading ? (
          <p className="text-sm text-gray-400 flex items-center justify-center h-full">Loading…</p>
        ) : data.length === 0 ? (
          <p className="text-sm text-gray-400 flex items-center justify-center h-full">No invoices generated yet</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => `KES ${value.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="collected" name="Fees Collected (KES)" fill="#FF5722" radius={[4, 4, 0, 0]} />
              <Bar dataKey="arrears" name="Outstanding Arrears (KES)" fill="#FFCCBC" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
