import React from "react";

const EventDetailsLayout = ({ event, onBack, onRequest, controls }) => {
  if (!event) return null;
  return (
    <div className="w-full max-w-5xl bg-white/90 rounded-3xl shadow-2xl border-4 border-pink-200 mt-8 overflow-hidden flex flex-col">
      {controls && (
        <div className="w-full bg-gradient-to-r from-fuchsia-50 via-pink-50 to-yellow-50 border-b-2 border-pink-100 p-6 flex flex-col items-center gap-4">
          {controls}
        </div>
      )}
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/2 flex flex-col gap-6 p-8 bg-gradient-to-b from-pink-50 via-yellow-50 to-white border-r-2 border-pink-100">
          <div className="flex flex-col gap-2">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {event.images && event.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={event.title + ' photo ' + (idx + 1)}
                  className="w-32 h-32 object-cover rounded-2xl border-2 border-pink-200 shadow bg-white flex-shrink-0 hover:scale-105 transition-transform duration-200"
                />
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 items-center mt-2">
            <span className="text-3xl">{event.category?.emoji || "🎉"}</span>
            <span className="text-lg font-bold text-pink-700">{event.category?.name || "Event"}</span>
            <span className="text-pink-400">|</span>
            <span className="text-pink-600 font-semibold">{event.date}</span>
            {event.location && <span className="text-pink-400">| {event.location}</span>}
            {event.best && <span className="ml-2 px-3 py-1 bg-yellow-200 text-yellow-700 rounded-full font-bold text-xs">Featured</span>}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-pink-700 font-cursive mt-2 mb-2 leading-tight">{event.title}</h1>
          <div className="text-pink-700 text-base md:text-lg whitespace-pre-line mb-2">{event.description}</div>
          {event.highlights && (Array.isArray(event.highlights) ? event.highlights.length > 0 : event.highlights.trim().length > 0) && (
            <div className="bg-yellow-50 border-l-4 border-yellow-300 rounded-xl p-4 mb-2">
              <h3 className="text-lg font-bold text-yellow-700 mb-1 flex items-center gap-1"><span role='img' aria-label='star'>✨</span> Highlights</h3>
              <ul className="list-disc list-inside text-yellow-700 space-y-1">
                {(Array.isArray(event.highlights)
                  ? event.highlights
                  : event.highlights.split(',').map(h => h.trim()).filter(Boolean)
                ).map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="md:w-1/2 flex flex-col gap-6 p-8 bg-gradient-to-b from-fuchsia-50 via-pink-50 to-yellow-50">
          {Array.isArray(event.descriptions) && event.descriptions.length > 0 && (
            <div className="flex flex-col gap-6">
              {event.descriptions.map((desc, idx) => (
                <div key={idx} className="bg-white border-l-4 border-fuchsia-300 rounded-xl p-5 shadow-sm">
                  {desc.title && <h3 className="text-xl font-bold text-fuchsia-700 mb-2 flex items-center gap-2"><span role="img" aria-label="section">📋</span> {desc.title}</h3>}
                  <div className="text-fuchsia-700 text-base whitespace-pre-line">{desc.description}</div>
                </div>
              ))}
            </div>
          )}
          {event.organizerNotes && (
            <div className="bg-pink-100 border-l-4 border-pink-300 rounded-xl p-5 shadow-sm">
              <h3 className="text-lg font-bold text-pink-700 mb-2 flex items-center gap-1"><span role='img' aria-label='memo'>📝</span> Organizer's Notes</h3>
              <div className="text-pink-600 italic">{event.organizerNotes}</div>
            </div>
          )}
          <div className="flex flex-wrap gap-4 mt-2">
            {onBack && <button onClick={onBack} className="px-6 py-2 bg-gradient-to-r from-pink-400 to-yellow-300 text-white font-bold rounded-full shadow hover:from-pink-500 hover:to-yellow-400 transition">Back to All Events</button>}
            {onRequest && <button onClick={onRequest} className="px-6 py-2 bg-pink-100 text-pink-700 font-bold rounded-full shadow border-2 border-pink-200 hover:bg-pink-200 transition">Request to Organize Similar Event</button>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsLayout;
