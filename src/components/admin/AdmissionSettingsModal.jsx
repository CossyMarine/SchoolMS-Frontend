// src/components/admin/AdmissionSettingsModal.jsx
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API from "../../api/axios";

export default function AdmissionSettingsModal({ onClose }) {
  const [genderMode, setGenderMode] = useState("askEachTime");
  const [dormMode, setDormMode] = useState("none");
  const [dorms, setDorms] = useState([]);
  const [newDormName, setNewDormName] = useState("");
  const [newDormGender, setNewDormGender] = useState("any");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const [configRes, dormsRes] = await Promise.all([
        API.get("/school-config"),
        API.get("/dorms"),
      ]);
      setGenderMode(configRes.data.school.admissionSettings?.genderMode || "askEachTime");
      setDormMode(configRes.data.school.admissionSettings?.dormMode || "none");
      setDorms(dormsRes.data.dorms);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load admissions settings");
    }
  };

  useEffect(() => { load(); }, []);

  const saveSettings = async (updates) => {
    setSaving(true);
    try {
      await API.patch("/school-config", { admissionSettings: updates });
      toast.success("Admissions settings updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleGenderModeChange = (value) => {
    setGenderMode(value);
    saveSettings({ genderMode: value });
  };

  const handleDormModeChange = (value) => {
    setDormMode(value);
    saveSettings({ dormMode: value });
  };

  const handleAddDorm = async (e) => {
    e.preventDefault();
    if (!newDormName.trim()) return;
    try {
      await API.post("/dorms", { name: newDormName.trim(), genderRestriction: newDormGender });
      setNewDormName("");
      setNewDormGender("any");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add dorm");
    }
  };

  const handleToggleDormActive = async (dorm) => {
    try {
      await API.patch(`/dorms/${dorm._id}`, { isActive: !dorm.isActive });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update dorm");
    }
  };

  const handleDeleteDorm = async (dorm) => {
    if (!confirm(`Delete "${dorm.name}"?`)) return;
    try {
      await API.delete(`/dorms/${dorm._id}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete dorm");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black">
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>

        <div className="mb-5">
          <h3 className="text-lg font-bold text-gray-900">Admissions Settings</h3>
          <p className="text-xs text-gray-500">Controls how the admission form behaves for this school.</p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Gender at Admission</label>
            <select
              value={genderMode}
              onChange={(e) => handleGenderModeChange(e.target.value)}
              disabled={saving}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-brand-orange"
            >
              <option value="askEachTime">Ask for each student</option>
              <option value="allMale">This school is all-male</option>
              <option value="allFemale">This school is all-female</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Dorm Assignment</label>
            <select
              value={dormMode}
              onChange={(e) => handleDormModeChange(e.target.value)}
              disabled={saving}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-brand-orange"
            >
              <option value="none">No dorms — day school</option>
              <option value="single">One dorm only — auto-assign everyone</option>
              <option value="multiple">Multiple dorms — choose per student</option>
            </select>
          </div>

          {dormMode !== "none" && (
            <div className="border-t border-gray-200 pt-4">
              <p className="text-[11px] font-bold text-gray-700 uppercase mb-2">Dorms</p>

              <form onSubmit={handleAddDorm} className="flex gap-2 mb-3">
                <input
                  value={newDormName}
                  onChange={(e) => setNewDormName(e.target.value)}
                  placeholder="Dorm name"
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-brand-orange"
                />
                <select
                  value={newDormGender}
                  onChange={(e) => setNewDormGender(e.target.value)}
                  className="px-2 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-brand-orange"
                >
                  <option value="any">Any</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                <button type="submit" className="bg-brand-orange text-white text-xs font-bold px-3 rounded-lg hover:bg-brand-orange-hover">
                  Add
                </button>
              </form>

              <div className="space-y-2 max-h-52 overflow-y-auto">
                {dorms.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-3">No dorms added yet.</p>
                )}
                {dorms.map((d) => (
                  <div key={d._id} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <p className="text-xs font-semibold text-gray-800">{d.name}</p>
                      <p className="text-[10px] text-gray-500 capitalize">{d.genderRestriction} · {d.occupantCount} occupant(s){!d.isActive && " · inactive"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleToggleDormActive(d)} className="text-[10px] font-semibold text-gray-600 hover:text-brand-orange">
                        {d.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button onClick={() => handleDeleteDorm(d)} className="text-gray-400 hover:text-red-600">
                        <i className="fa-solid fa-trash text-xs"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
