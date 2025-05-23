import React from "react";

const EventCard = ({ event }) => (
  <div className="bg-white/80 rounded-3xl shadow-xl border-2 border-pink-100 p-5 flex flex-col gap-4 transition-transform duration-200 hover:scale-105 hover:shadow-2xl relative overflow-hidden">
    {event.best && (
      <div className="absolute top-4 right-4 bg-gradient-to-r from-pink-400 to-yellow-300 text-white text-xs font-bold px-4 py-1 rounded-full shadow-md z-20 flex items-center gap-1">
        <span role="img" aria-label="star">🌟</span> Featured
      </div>
    )}
    <div className="flex gap-2 overflow-x-auto pb-2">
      {event.images && event.images.map((img, idx) => (
        <img
          key={idx}
          src={img}
          alt={event.title + ' photo ' + (idx + 1)}
          className="w-24 h-24 object-cover rounded-xl border-2 border-pink-100 flex-shrink-0 bg-pink-50"
        />
      ))}
    </div>
    <div className="flex-1">
      <h2 className="text-2xl font-extrabold mb-1 text-pink-700 font-cursive flex items-center gap-2">
        <span role="img" aria-label="category-emoji">{event.category?.emoji || "🎈"}</span> {event.title}
      </h2>
      <p className="text-pink-500 mb-1 font-medium">{event.date} | {event.location}</p>
      <p className="text-pink-700 mb-2">{event.description}</p>
      <a href={`/events/${event.id}`} className="inline-block mt-2 px-4 py-2 bg-gradient-to-r from-pink-400 to-yellow-300 text-white font-bold rounded-full shadow hover:from-pink-500 hover:to-yellow-400 transition-colors duration-200">View Details</a>
    </div>
  </div>
);

export default EventCard;
