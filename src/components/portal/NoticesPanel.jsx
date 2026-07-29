// src/components/portal/NoticesPanel.jsx
import { useEffect, useState } from "react";
import API from "../../api/axios";

export default function NoticesPanel() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    API.get("/messages/notifications").then((res) => setNotifications(res.data.notifications));
  }, []);

  const markRead = async (id) => {
    await API.patch(`/messages/notifications/${id}/read`);
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <h3 className="font-bold text-gray-900 mb-4 pb-3 border-b border-gray-200">School Notices</h3>
      {notifications.length === 0 ? (
        <p className="text-xs text-gray-400">No notices yet.</p>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => !n.isRead && markRead(n._id)}
              className={`p-3 rounded-lg text-xs cursor-pointer ${n.isRead ? "bg-gray-50" : "bg-orange-50 border border-orange-200"}`}
            >
              <p className="font-semibold text-gray-900">{n.title}</p>
              <p className="text-gray-600 mt-1">{n.body}</p>
              <p className="text-[10px] text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
