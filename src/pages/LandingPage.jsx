// src/pages/LandingPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function LandingPage() {
  const [school, setSchool] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/public/school-info")
      .then((res) => setSchool(res.data))
      .catch(() => setSchool(null));
  }, []);

  const announcements = school?.landingPage?.announcements || [];

  return (
    <div className="bg-gray-50 text-gray-900 antialiased min-h-screen">
      {/* HEADER */}
      <header className="bg-white text-gray-900 sticky top-0 z-50 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-brand-orange flex items-center justify-center font-bold text-2xl text-white shadow-md">
              {school?.name?.[0] || "S"}
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none text-gray-900">
                {school?.name || "Loading…"}
              </h1>
              <span className="text-xs text-gray-500">
                {(school?.schoolType || []).join(", ") || "School Management System"}
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-600">
            <a href="#about" className="hover:text-brand-orange transition">About Us</a>
            <a href="#admissions" className="hover:text-brand-orange transition">Admissions</a>
            <a href="#announcements" className="hover:text-brand-orange transition">Announcements</a>
            <a href="#contact" className="hover:text-brand-orange transition">Contact</a>
          </nav>

          <button
            onClick={() => navigate("/login")}
            className="bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold px-5 py-2.5 rounded-lg transition flex items-center space-x-2 shadow-sm"
          >
            <span>Portal Login</span>
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-gradient-to-b from-orange-50/50 to-white text-gray-900 py-20 px-6 border-b border-gray-200">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="px-3 py-1 bg-brand-orange-light text-brand-orange border border-orange-200 rounded-full text-xs font-semibold">
              Admissions Open
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold leading-tight text-gray-900">
              {school?.motto || "Empowering Students for a Brighter Tomorrow"}
            </h2>
            <p className="text-gray-600 text-sm md:text-base">
              Providing holistic education with modern digital tracking for parents and students.
            </p>
            <div className="flex items-center space-x-4 pt-2">
              <button
                onClick={() => navigate("/login")}
                className="bg-brand-orange hover:bg-brand-orange-hover text-white text-sm font-bold px-6 py-3 rounded-lg shadow-md transition"
              >
                Access Portal
              </button>
              <a
                href="#admissions"
                className="bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold px-6 py-3 rounded-lg border border-gray-300 transition shadow-sm"
              >
                Admission Criteria
              </a>
            </div>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-orange-100 shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80"
              alt="Students studying"
              className="rounded-xl object-cover w-full h-80"
            />
          </div>
        </div>
      </section>

      {/* ANNOUNCEMENTS */}
      <section id="announcements" className="py-16 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h3 className="text-2xl font-bold text-gray-900">Latest News & Announcements</h3>
          <p className="text-sm text-gray-500 mt-2">
            Stay updated with school events, term dates, and administrative releases.
          </p>
        </div>

        {announcements.length === 0 ? (
          <p className="text-center text-sm text-gray-400">No announcements posted yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {announcements.slice(0, 6).map((a, i) => (
              <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-3">
                <span className="text-xs font-bold text-brand-orange uppercase">{a.category || "Notice"}</span>
                <h4 className="font-bold text-gray-900 text-base">{a.title}</h4>
                <p className="text-xs text-gray-600">{a.body}</p>
                <span className="text-[10px] text-gray-400 block pt-2">
                  {new Date(a.postedAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CONTACT / FOOTER */}
      <footer id="contact" className="bg-white border-t border-gray-200 py-10 px-6">
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-500 space-y-1">
          {school?.address && <p>{school.address}</p>}
          <p>{school?.phone} {school?.phone && school?.email && "•"} {school?.email}</p>
        </div>
      </footer>
    </div>
  );
            }
