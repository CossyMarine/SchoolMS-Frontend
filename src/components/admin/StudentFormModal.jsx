// src/components/admin/StudentFormModal.jsx
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import API from "../../api/axios";

const emptyGuardian = () => ({ name: "", relationship: "", phone: "", email: "", isPrimaryContact: false, createLogin: false });

export default function StudentFormModal({ student, classes, schoolConfig, onClose, onSaved }) {
  const isEdit = !!student;
  const admissionSettings = schoolConfig?.admissionSettings || {};
  const genderMode = admissionSettings.genderMode || "askEachTime";
  const dormMode = admissionSettings.dormMode || "none";

  const academicYears = schoolConfig?.academicYears || [];
  const currentYear = academicYears.find((y) => y.isCurrent)?.year || academicYears[0]?.year || "";

  const [firstName, setFirstName] = useState(student?.firstName || "");
  const [lastName, setLastName] = useState(student?.lastName || "");
  const [dateOfBirth, setDateOfBirth] = useState(student?.dateOfBirth?.slice(0, 10) || "");
  const [gender, setGender] = useState(student?.gender || "");
  const [classId, setClassId] = useState(student?.class?._id || student?.class || "");
  const [stream, setStream] = useState(student?.stream || "");
  const [dormId, setDormId] = useState(student?.dorm?._id || student?.dorm || "");
  const [displayRole, setDisplayRole] = useState(student?.displayRole || "");
  const [academicYear, setAcademicYear] = useState(student?.enrolledAcademicYear || currentYear);
  const [guardians, setGuardians] = useState(
    student?.guardians?.length ? student.guardians.map((g) => ({ ...g, createLogin: false })) : [emptyGuardian()]
  );

  const [manualAdmission, setManualAdmission] = useState(false);
  const [admissionPreview, setAdmissionPreview] = useState(student?.admissionNumber || "");
  const [manualAdmissionValue, setManualAdmissionValue] = useState("");
  const [dorms, setDorms] = useState([]);
  const [saving, setSaving] = useState(false);

  const selectedClass = useMemo(() => classes.find((c) => c._id === classId), [classes, classId]);

  useEffect(() => {
    if (dormMode !== "none") {
      API.get("/dorms").then((res) => setDorms(res.data.dorms.filter((d) => d.isActive))).catch(() => {});
    }
  }, [dormMode]);

  useEffect(() => {
    if (isEdit || manualAdmission || !academicYear) return;
    API.get("/students/next-admission-number", { params: { academicYear } })
      .then((res) => setAdmissionPreview(res.data.admissionNumber))
      .catch(() => setAdmissionPreview(""));
  }, [academicYear, manualAdmission, isEdit]);

  // Auto-assign the sole dorm when mode is "single"
  useEffect(() => {
    if (dormMode === "single" && dorms.length > 0 && !dormId) {
      setDormId(dorms[0]._id);
    }
  }, [dormMode, dorms, dormId]);

  const effectiveGender = genderMode === "allMale" ? "male" : genderMode === "allFemale" ? "female" : gender;

  const availableDorms = dorms.filter((d) => d.genderRestriction === "any" || d.genderRestriction === effectiveGender);

  const updateGuardian = (index, field, value) => {
    setGuardians((prev) => prev.map((g, i) => (i === index ? { ...g, [field]: value } : g)));
  };

  const setPrimaryGuardian = (index) => {
    setGuardians((prev) => prev.map((g, i) => ({ ...g, isPrimaryContact: i === index })));
  };

  const addGuardian = () => setGuardians((prev) => [...prev, emptyGuardian()]);
  const removeGuardian = (index) => setGuardians((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedClass?.streams?.length > 0 && !stream) {
      toast.error(`${selectedClass.name} has streams — please select one`);
      return;
    }
    if (genderMode === "askEachTime" && !gender) {
      toast.error("Please select a gender");
      return;
    }
    if (!guardians.some((g) => g.name && g.phone)) {
      toast.error("At least one guardian with a name and phone number is required");
      return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        await API.patch(`/students/${student._id}`, {
          firstName, lastName, dateOfBirth, gender: effectiveGender, displayRole,
          dormId: dormMode === "none" ? null : dormId || null,
        });
        await API.patch(`/students/${student._id}/guardians`, { guardians });
        toast.success("Student updated");
      } else {
        await API.post("/students", {
          firstName, lastName, dateOfBirth,
          gender: genderMode === "askEachTime" ? gender : undefined,
          classId, stream: stream || undefined,
          dormId: dormMode === "multiple" ? dormId || undefined : undefined,
          displayRole,
          admissionNumber: manualAdmission ? manualAdmissionValue.trim() : undefined,
          academicYear,
          guardians,
        });
        toast.success("Student admitted");
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save student");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black">
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>

        <div className="mb-5">
          <h3 className="text-lg font-bold text-gray-900">{isEdit ? "Edit Student Information" : "Admit New Student"}</h3>
          <p className="text-xs text-gray-500">Enter core demographic & academic registration details.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Admission No.</label>
              {isEdit ? (
                <input disabled value={student.admissionNumber} className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-xs text-gray-500" />
              ) : (
                <div className="space-y-1">
                  <input
                    disabled={!manualAdmission}
                    value={manualAdmission ? manualAdmissionValue : admissionPreview}
                    onChange={(e) => setManualAdmissionValue(e.target.value)}
                    placeholder="Auto-generated"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-brand-orange disabled:bg-gray-100 disabled:text-gray-500"
                  />
                  <label className="flex items-center gap-1.5 text-[10px] text-gray-500">
                    <input type="checkbox" checked={manualAdmission} onChange={(e) => setManualAdmission(e.target.checked)} />
                    Enter manually instead
                  </label>
                </div>
              )}
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Academic Year</label>
              <select disabled={isEdit} value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-brand-orange disabled:bg-gray-100">
                {academicYears.length === 0 && <option value="">No academic years configured</option>}
                {academicYears.map((y) => (
                  <option key={y._id} value={y.year}>{y.year}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">First Name</label>
              <input required value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-brand-orange" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Last Name</label>
              <input required value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-brand-orange" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Date of Birth</label>
              <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-brand-orange" />
            </div>
            {genderMode === "askEachTime" ? (
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Gender</label>
                <select required value={gender} onChange={(e) => setGender(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-brand-orange">
                  <option value="">Select…</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Gender</label>
                <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-xs text-gray-500 capitalize">{effectiveGender} (school-wide setting)</div>
              </div>
            )}
          </div>

          {!isEdit && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Class</label>
                <select required value={classId} onChange={(e) => { setClassId(e.target.value); setStream(""); }} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-brand-orange">
                  <option value="">Select class…</option>
                  {classes.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              {selectedClass?.streams?.length > 0 && (
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Stream</label>
                  <select required value={stream} onChange={(e) => setStream(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-brand-orange">
                    <option value="">Select stream…</option>
                    {selectedClass.streams.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
          {isEdit && (
            <p className="text-[11px] text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
              Class: <span className="font-semibold">{student.class?.name} {student.stream ? `(${student.stream})` : ""}</span> — use "Promote / Transfer" to change class.
            </p>
          )}

          {dormMode !== "none" && (
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Dorm</label>
              {dormMode === "single" ? (
                <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-xs text-gray-500">
                  {dorms[0]?.name || "No dorm configured yet"}
                </div>
              ) : (
                <select value={dormId} onChange={(e) => setDormId(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-brand-orange">
                  <option value="">No dorm (day scholar)</option>
                  {availableDorms.map((d) => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
                </select>
              )}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Display Role (optional)</label>
            <input value={displayRole} onChange={(e) => setDisplayRole(e.target.value)} placeholder="e.g. Class President, Head Girl" className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-brand-orange" />
            <p className="text-[10px] text-gray-400 mt-1">Display only — does not grant any system access.</p>
          </div>

          <div className="border-t border-gray-200 pt-3">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-bold text-gray-700 uppercase">Parents / Guardians</label>
              <button type="button" onClick={addGuardian} className="text-[11px] font-semibold text-brand-orange hover:text-brand-orange-hover">+ Add Guardian</button>
            </div>
            <div className="space-y-3">
              {guardians.map((g, i) => (
                <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input placeholder="Full name" value={g.name} onChange={(e) => updateGuardian(i, "name", e.target.value)} className="px-2.5 py-1.5 border border-gray-300 rounded text-xs" />
                    <input placeholder="Relationship" value={g.relationship} onChange={(e) => updateGuardian(i, "relationship", e.target.value)} className="px-2.5 py-1.5 border border-gray-300 rounded text-xs" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input placeholder="Phone" value={g.phone} onChange={(e) => updateGuardian(i, "phone", e.target.value)} className="px-2.5 py-1.5 border border-gray-300 rounded text-xs" />
                    <input placeholder="Email (optional)" value={g.email} onChange={(e) => updateGuardian(i, "email", e.target.value)} className="px-2.5 py-1.5 border border-gray-300 rounded text-xs" />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-[10px] text-gray-600">
                      <input type="radio" name="primaryGuardian" checked={g.isPrimaryContact} onChange={() => setPrimaryGuardian(i)} />
                      Primary contact
                    </label>
                    <label className="flex items-center gap-1.5 text-[10px] text-gray-600">
                      <input type="checkbox" checked={g.createLogin} onChange={(e) => updateGuardian(i, "createLogin", e.target.checked)} />
                      Create parent login
                    </label>
                    {guardians.length > 1 && (
                      <button type="button" onClick={() => removeGuardian(i)} className="text-gray-400 hover:text-red-600">
                        <i className="fa-solid fa-trash text-xs"></i>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-gray-200 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2 bg-brand-orange hover:bg-brand-orange-hover text-white rounded-lg text-xs font-bold transition shadow disabled:opacity-60">
              {saving ? "Saving…" : "Save Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
                      }
