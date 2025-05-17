import React from "react";
import EventCard from "../components/EventCard";

// Sectioned event data
const eventSections = [
  {
    title: "Birthday Parties",
    emoji: "🎂",
    color: "from-pink-100 via-pink-50 to-yellow-50",
    events: [
      {
        id: 1,
        title: "Princess Birthday Bash",
        description: "A magical princess-themed birthday party for kids.",
        date: "2025-06-10",
        location: "City Arena",
        images: [
          "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
          "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80"
        ],
        best: true,
      },
      {
        id: 2,
        title: "Superhero Adventure",
        description: "Action-packed superhero birthday fun!",
        date: "2025-07-05",
        location: "Expo Center",
        images: [
          "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80",
          "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80"
        ],
        best: false,
      },
    ],
  },
  {
    title: "Anniversary Celebrations",
    emoji: "💖",
    color: "from-fuchsia-100 via-pink-50 to-yellow-50",
    events: [
      {
        id: 3,
        title: "Romantic Garden Dinner",
        description: "A dreamy anniversary dinner under the stars.",
        date: "2025-08-15",
        location: "Central Park",
        images: [
          "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80",
          "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=400&q=80"
        ],
        best: true,
      },
      {
        id: 4,
        title: "Classic Candlelight Evening",
        description: "Celebrate your love with a classic candlelight setup.",
        date: "2025-09-10",
        location: "Riverside Hall",
        images: [
          "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=400&q=80"
        ],
        best: false,
      },
    ],
  },
  {
    title: "Celebration Parties",
    emoji: "🎉",
    color: "from-yellow-100 via-pink-50 to-fuchsia-100",
    events: [
      {
        id: 5,
        title: "Colorful Carnival",
        description: "A vibrant party with games, food, and fun for all ages!",
        date: "2025-10-01",
        location: "Carnival Grounds",
        images: [
          "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80",
          "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&q=80"
        ],
        best: false,
      },
      {
        id: 6,
        title: "Tech Expo Bash",
        description: "Celebrate innovation and creativity with a tech-themed party!",
        date: "2025-11-12",
        location: "Expo Center",
        images: [
          "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80"
        ],
        best: false,
      },
    ],
  },
];

const AllEvents = () => {
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
      {eventSections.map((section, idx) => (
        <section key={section.title} className={`mb-16 rounded-3xl shadow-xl border-2 border-pink-100 bg-gradient-to-r ${section.color} p-8`}> 
          <h2 className="text-3xl font-extrabold text-pink-700 font-cursive mb-6 flex items-center gap-2">
            <span role="img" aria-label="section-emoji">{section.emoji}</span> {section.title}
          </h2>
          {section.events.length === 0 ? (
            <div className="text-pink-400 text-center">No events in this section yet.</div>
          ) : (
            <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
              {section.events.map((event) => (
                <div className="hover:scale-105 transition-transform duration-200">
                  <EventCard key={event.id} event={event} />
                </div>
              ))}
            </div>
          )}
        </section>
      ))}
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
