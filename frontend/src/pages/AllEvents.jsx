import React, { useEffect, useState } from "react";
import EventCard from "../components/EventCard";

const AllEvents = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("http://localhost:8080/api/events");
        if (!res.ok) throw new Error("Failed to fetch events");
        const events = await res.json();
        // Group by category
        const grouped = {};
        events.forEach(ev => {
          if (!grouped[ev.category]) grouped[ev.category] = [];
          grouped[ev.category].push(ev);
        });
        // Optionally fetch categories for emoji/color
        const catRes = await fetch("http://localhost:8080/api/categories");
        const categories = catRes.ok ? await catRes.json() : [];
        const sections = Object.entries(grouped).map(([cat, events]) => {
          const catObj = categories.find(c => c.name === cat) || {};
          return {
            title: cat,
            emoji: catObj.emoji || "🎉",
            color: "from-pink-100 via-pink-50 to-yellow-50",
            events
          };
        });
        setSections(sections);
      } catch (e) {
        setError("Could not load events.");
      }
      setLoading(false);
    };
    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-100 to-yellow-50 p-8">
      <section className="mb-16 text-center">
        <div className="flex flex-col items-center justify-center mb-6">
          <span className="text-6xl md:text-7xl animate-bounce mb-2">🎈</span>
          <h1 className="text-5xl font-extrabold text-pink-700 font-cursive mb-2 flex items-center justify-center gap-2">
            <span role="img" aria-label="calendar">📅</span> All Events
          </h1>
          <p className="text-xl text-pink-500 mb-4 max-w-2xl mx-auto">Welcome to the celebration gallery! Explore every birthday, anniversary, and party Ananya has crafted with love, color, and creativity. Find your inspiration below!</p>
        </div>
      </section>
      {loading ? (
        <div className="text-center text-pink-400">Loading events...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : sections.length === 0 ? (
        <div className="text-center text-pink-400">No events found.</div>
      ) : (
        sections.map((section) => (
          <section key={section.title} className={`mb-16 rounded-3xl shadow-xl border-2 border-pink-100 bg-gradient-to-r ${section.color} p-8`}>
            <h2 className="text-3xl font-extrabold text-pink-700 font-cursive mb-6 flex items-center gap-2">
              <span role="img" aria-label="section-emoji">{section.emoji}</span> {section.title}
            </h2>
            {section.events.length === 0 ? (
              <div className="text-pink-400 text-center">No events in this section yet.</div>
            ) : (
              <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
                {section.events.map((event) => (
                  <div className="hover:scale-105 transition-transform duration-200" key={event.id}>
                    <EventCard event={event} />
                  </div>
                ))}
              </div>
            )}
          </section>
        ))
      )}
      <footer className="mt-20 py-10 bg-gradient-to-r from-pink-200 via-yellow-100 to-fuchsia-100 rounded-t-3xl shadow-inner border-t-4 border-pink-200 text-center">
        <div className="mb-2 flex justify-center gap-2 text-2xl text-pink-600">
          <span role="img" aria-label="sparkle">✨</span>
          <span role="img" aria-label="balloon">🎈</span>
          <span role="img" aria-label="heart">💖</span>
        </div>
        <div className="text-pink-700 font-cursive text-2xl font-bold mb-1">Eventify by Ananya</div>
        <div className="text-pink-500 mb-2">Making your moments magical, one celebration at a time.</div>
        <div className="text-pink-400 text-sm">&copy; {new Date().getFullYear()} Eventify. All rights reserved.</div>
      </footer>
    </div>
  );
};

export default AllEvents;
