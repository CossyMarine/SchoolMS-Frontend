// src/pages/LoginPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../api/axios";
import { routeForUser } from "../utils/routeForUser";

export default function LoginPage({ onAuthed }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/auth/login", { identifier, password });
      await onAuthed();
      navigate(routeForUser(res.data.user), { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-brand-orange text-white rounded-xl mx-auto flex items-center justify-center text-xl font-bold mb-2 shadow-md">
            E
          </div>
          <h3 className="text-xl font-bold text-gray-900">Unified Portal Access</h3>
          <p className="text-xs text-gray-500">Log in with your admission/staff ID, email, or phone</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Email / Phone / Admission No.
            </label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. ADM-2026-089"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange"
            />
          </div>

          <div className="text-right">
            <a href="/forgot-password" className="text-xs text-brand-orange hover:underline">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-orange hover:bg-brand-orange-hover disabled:opacity-60 text-white font-bold py-3 rounded-lg text-sm transition shadow-md"
          >
            {loading ? "Signing in…" : "Sign In to Portal"}
          </button>
        </form>
      </div>
    </div>
  );
}
