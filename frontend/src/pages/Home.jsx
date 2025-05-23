import React from "react";
import EventCard from "../components/EventCard";

const events = [
  {
    id: 1,
    title: "Music Fest 2025",
    description: "A grand music festival with top artists.",
    date: "2025-06-10",
    location: "City Arena",
    images: [
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80"
    ],
    best: true,
  },
  {
    id: 2,
    title: "Tech Expo",
    description: "Showcasing the latest in technology and innovation.",
    date: "2025-07-05",
    location: "Expo Center",
    images: [
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=400&q=80"
    ],
    best: true,
  },
  {
    id: 3,
    title: "Food Carnival",
    description: "Taste dishes from around the world.",
    date: "2025-08-15",
    location: "Central Park",
    images: [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80"
    ],
    best: false,
  },
];

const Home = () => {
  const bestEvents = events.filter((event) => event.best);
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-100 to-yellow-50 p-8">
      <section className="mb-16 flex flex-col md:flex-row items-center justify-between gap-10 bg-gradient-to-r from-pink-200 via-fuchsia-100 to-yellow-100 rounded-3xl p-10 shadow-2xl border-4 border-pink-100 relative overflow-hidden">
        <div className="flex-1 z-10">
          <h1 className="text-5xl md:text-6xl font-extrabold text-pink-700 mb-6 drop-shadow-lg font-cursive">Make Every Moment Magical</h1>
          <p className="text-xl md:text-2xl text-pink-500 mb-8 font-medium">Birthday parties, anniversaries, and cozy celebrations—crafted with love, color, and creativity by Ananya.</p>
          <a href="/events" className="inline-block px-8 py-4 bg-gradient-to-r from-pink-400 to-yellow-300 text-white font-bold rounded-full shadow-lg hover:scale-105 hover:from-pink-500 hover:to-yellow-400 transition-transform duration-200">Browse All Events</a>
        </div>
        <div className="flex-1 flex justify-center z-10">
          <img src="https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80" alt="Party" className="w-80 h-80 object-cover rounded-full border-8 border-pink-200 shadow-xl bg-white" />
        </div>
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-pink-200 rounded-full opacity-30 blur-2xl animate-pulse"></div>
        <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-yellow-200 rounded-full opacity-20 blur-2xl animate-pulse"></div>
      </section>
      <section>
        <h2 className="text-4xl font-extrabold mb-8 text-pink-700 font-cursive flex items-center gap-2"><span role='img' aria-label='star'>🌟</span> Featured Events</h2>
        {bestEvents.length === 0 ? (
          <div className="text-pink-400">No featured events at the moment.</div>
        ) : (
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {bestEvents.map((event) => (
              <div className="hover:scale-105 transition-transform duration-200">
                <EventCard key={event.id} event={event} />
              </div>
            ))}
          </div>
        )}
      </section>
      <section className="mt-20 bg-gradient-to-r from-pink-100 via-yellow-50 to-pink-50 rounded-2xl shadow-lg p-10 border-2 border-pink-100">
        <h3 className="text-3xl font-bold mb-8 text-pink-700 font-cursive flex items-center gap-2"><span role='img' aria-label='sparkles'>✨</span> How It Works</h3>
        <div className="grid md:grid-cols-3 gap-10">
          <div className="flex flex-col items-center text-center">
            <div className="bg-pink-200 text-pink-700 rounded-full w-20 h-20 flex items-center justify-center mb-4 text-3xl font-bold shadow-lg">1</div>
            <h4 className="font-semibold mb-2 text-lg text-pink-700">Browse Events</h4>
            <p className="text-pink-500">Explore a curated list of magical celebrations and ideas.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="bg-yellow-200 text-yellow-700 rounded-full w-20 h-20 flex items-center justify-center mb-4 text-3xl font-bold shadow-lg">2</div>
            <h4 className="font-semibold mb-2 text-lg text-yellow-700">Select & Request</h4>
            <p className="text-yellow-600">Pick your favorite and send your details—Ananya will handle the magic!</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="bg-fuchsia-200 text-fuchsia-700 rounded-full w-20 h-20 flex items-center justify-center mb-4 text-3xl font-bold shadow-lg">3</div>
            <h4 className="font-semibold mb-2 text-lg text-fuchsia-700">Celebrate!</h4>
            <p className="text-fuchsia-600">Get ready for a beautiful, personalized event you’ll never forget.</p>
          </div>
        </div>
      </section>
      <section className="mt-20">
        <h3 className="text-3xl font-bold mb-8 text-pink-700 font-cursive flex items-center gap-2"><span role='img' aria-label='heart'>💖</span> What People Say</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          <div className="bg-white rounded-2xl shadow-xl p-8 border-l-8 border-pink-200 relative">
            <span className="absolute -top-6 left-6 text-4xl">🎂</span>
            <p className="text-pink-700 italic mb-4 text-lg">“Amazing experience! The birthday party was magical and so well organized.”</p>
            <div className="text-sm text-pink-500 font-bold">- Priya S.</div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-8 border-l-8 border-yellow-200 relative">
            <span className="absolute -top-6 left-6 text-4xl">🎈</span>
            <p className="text-yellow-700 italic mb-4 text-lg">“Loved the creative decor and the personal touches. The request process was super easy.”</p>
            <div className="text-sm text-yellow-600 font-bold">- Rahul M.</div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-8 border-l-8 border-fuchsia-200 relative">
            <span className="absolute -top-6 left-6 text-4xl">💐</span>
            <p className="text-fuchsia-700 italic mb-4 text-lg">“Highly recommend! Our anniversary was unforgettable thanks to Ananya.”</p>
            <div className="text-sm text-fuchsia-600 font-bold">- Anjali K.</div>
          </div>
        </div>
      </section>
      <section className="mt-20 bg-pink-100 rounded-3xl shadow-2xl p-10 border-4 border-pink-200">
        <h3 className="text-3xl font-bold mb-6 text-pink-700 font-cursive flex items-center gap-2">
          <span role="img" aria-label="party">🎉</span> About Eventify
        </h3>
        <p className="text-pink-800 mb-4 text-xl font-medium">
          Eventify is a passion project by Ananya, who loves creating magical moments for birthdays, anniversaries, and intimate celebrations. Every event is crafted with heart, creativity, and a touch of sparkle to make your special day unforgettable.
        </p>
        <p className="text-pink-700 text-lg">
          From dreamy decor to personalized touches, Eventify brings your vision to life—whether it's a surprise birthday, a romantic anniversary, or a cozy get-together. Let Ananya help you celebrate life's beautiful moments in style!
        </p>
      </section>
    </div>
  );
};

export default Home;
