// src/components/admin/MessagesTab.jsx
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API from "../../api/axios";

export default function MessagesTab() {
  const [classes, setClasses] = useState([]);
  const [audience, setAudience] = useState("all");
  const [classId, setClassId] = useState("");
  const [channels, setChannels] = useState(["sms"]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    API.get("/classes").then((res) => setClasses(res.data.classes));
    API.get("/messages/history").then((res) => setHistory(res.data.messages)).catch(() => {});
  }, []);

  const toggleChannel = (c) => {
    setChannels((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  };

  const handleSend = async () => {
    if (!body || channels.length === 0) return toast.error("Enter a message and select at least one channel");
    setSending(true);
    try {
      const res = await API.post("/messages/send", {
        title,
        body,
        channels,
        filter: { audience, classId: audience === "class" ? classId : undefined },
      });
      toast.success(`Sent to ${res.data.recipientCount} recipient(s)`);
      setBody("");
      setTitle("");
      const h = await API.get("/messages/history");
      setHistory(h.data.messages);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Send New Message</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <select value={audience} onChange={(e) => setAudience(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="all">Entire School</option>
            <option value="students">All Students</option>
            <option value="teachers">All Teachers</option>
            <option value="class">Specific Class</option>
            <option value="fee-balance">Students with Fee Balance</option>
          </select>
          {audience === "class" && (
            <select value={classId} onChange={(e) => setClassId(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="">Select Class</option>
              {classes.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          )}
        </div>

        <div className="flex gap-4">
          {["sms", "whatsapp", "email", "in-app"].map((c) => (
            <label key={c} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={channels.includes(c)} onChange={() => toggleChannel(c)} />
              <span className="capitalize">{c}</span>
            </label>
          ))}
        </div>

        <input placeholder="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        <textarea placeholder="Message body" rows={4} value={body} onChange={(e) => setBody(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />

        <button
          onClick={handleSend}
          disabled={sending}
          className="bg-brand-orange hover:bg-brand-orange-hover disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-lg"
        >
          <i className="fa-solid fa-paper-plane mr-1"></i> {sending ? "Sending…" : "Send Message"}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h3 className="font-bold text-gray-900">Message History</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {history.map((m) => (
            <div key={m._id} className="px-5 py-3 text-sm">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-900">{m.title || "(No title)"}</span>
                <span className="text-xs text-gray-400">{new Date(m.createdAt).toLocaleString()}</span>
              </div>
              <p className="text-gray-600 mt-1">{m.body}</p>
              <p className="text-xs text-gray-400 mt-1">
                {m.channels.join(", ")} · {m.recipientCount} recipients
              </p>
            </div>
          ))}
          {history.length === 0 && <p className="px-5 py-6 text-center text-sm text-gray-400">No messages sent yet</p>}
        </div>
      </div>
    </div>
  );
}
