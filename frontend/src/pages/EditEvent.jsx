import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import EventDetailsLayout from "../components/EventDetailsLayout";
import EventCard from "../components/EventCard";
import EventEditControls from "../components/EventEditControls";

const EditEvent = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleEventFieldChange = (field, value) => {
    setEvent(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    setLoading(true);
    setError("");
    fetch(`http://localhost:8080/api/events/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch event");
        return res.json();
      })
      .then(data => {
        const images = Array.isArray(data.images)
          ? data.images.map(img => {
              if (typeof img === 'string') {
                return img.startsWith('http') ? img : `http://localhost:8080${img}`;
              } else if (img && typeof img === 'object' && img.url) {
                return img.url.startsWith('http') ? img.url : `http://localhost:8080${img.url}`;
              }
              return '';
            })
          : [];
        const highlights = typeof data.highlights === 'string'
          ? data.highlights.split(',').map(h => h.trim()).filter(Boolean)
          : data.highlights;
        setEvent({ ...data, images, highlights });
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load event.");
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="text-center text-pink-400 py-8">Loading event...</div>;
  if (error) return <div className="text-center text-red-500 py-8">{error}</div>;
  if (!event) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-100 via-pink-50 to-yellow-50 flex flex-col items-center py-0 md:py-10 px-0 md:px-8">
      <header className="w-full max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4 px-6 py-8 md:py-10">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-fuchsia-500 to-yellow-400 drop-shadow-lg tracking-tight font-cursive">Eventify Admin</h1>
          <span className="text-pink-400 font-semibold text-lg tracking-wide">Edit Event</span>
        </div>
      </header>
      <section className="w-full max-w-4xl bg-gradient-to-r from-fuchsia-50 via-pink-50 to-yellow-50 border-b-2 border-pink-100 p-6 flex flex-col items-center gap-4 mt-8 mb-4 rounded-3xl shadow-xl animate-fade-in">
        <h2 className="text-2xl font-bold text-fuchsia-700 mb-2 tracking-tight flex items-center gap-2"><span role="img" aria-label="edit">🛠️</span> Edit Event Controls</h2>
        <EventEditControls event={event} onChange={handleEventFieldChange} />
      </section>
      <header className="w-full max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4 px-6 py-8 md:py-10">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-fuchsia-500 to-yellow-400 drop-shadow-lg tracking-tight font-cursive">Eventify Admin</h1>
          <span className="text-pink-400 font-semibold text-lg tracking-wide">Edit Event</span>
        </div>
      </header>
      <main className="w-full flex flex-col gap-10 items-center">
        <div className="relative w-full max-w-xl group animate-fade-in">
          <div className="absolute -inset-2 bg-gradient-to-br from-pink-200 via-yellow-100 to-fuchsia-100 rounded-2xl blur opacity-60 group-hover:scale-105 group-hover:opacity-80 transition-all duration-300"></div>
          <div className="relative z-10 mb-6">
            <EventCard event={event} />
          </div>
          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-pink-500 font-semibold text-xs tracking-widest uppercase bg-white/80 px-4 py-1 rounded-full shadow">Card Preview</span>
        </div>
        <div className="flex items-center w-full my-2">
          <div className="flex-1 h-1 bg-gradient-to-r from-pink-200 via-yellow-100 to-fuchsia-100 rounded-full opacity-60"></div>
          <span className="mx-4 text-2xl text-pink-300">🎨</span>
          <div className="flex-1 h-1 bg-gradient-to-l from-pink-200 via-yellow-100 to-fuchsia-100 rounded-full opacity-60"></div>
        </div>
        <div className="w-full max-w-5xl bg-white/90 rounded-3xl shadow-2xl border-4 border-pink-200 p-10 flex flex-col items-center animate-fade-in-slow">
          <h2 className="text-2xl font-extrabold text-pink-700 mb-6 tracking-tight flex items-center gap-2"><span role="img" aria-label="preview">👀</span> Full Event Preview</h2>
          <EventDetailsLayout event={event} />
        </div>
      </main>
      <footer className="w-full text-center text-pink-400 py-8 text-sm mt-10">
        &copy; {new Date().getFullYear()} Eventify Admin &mdash; Designed with <span className="text-pink-500">♥</span> by Copilot
      </footer>
    </div>
  );
};

export default EditEvent;