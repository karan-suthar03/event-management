import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Use the same eventSections as AllEvents for demo
const eventSections = [
  {
    title: "Birthday Parties",
    events: [
      {
        id: 1,
        title: "Princess Birthday Bash",
        description: "A magical princess-themed birthday party for kids. The venue was transformed into a fairytale castle with pastel balloons, sparkling lights, and a custom cake. Activities included a princess dress-up corner, face painting, and a treasure hunt. Every child received a personalized goodie bag, and the birthday girl had a grand entrance in a mini carriage!",
        date: "2025-06-10",
        location: "City Arena",
        images: [
          "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
          "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80"
        ],
        best: true,
        section: "Birthday Parties",
        highlights: [
          "Fairytale castle decor with pastel balloons and lights",
          "Princess dress-up and face painting for kids",
          "Custom themed cake and dessert table",
          "Treasure hunt adventure",
          "Personalized goodie bags for every child",
          "Grand entrance for the birthday girl in a mini carriage"
        ],
        organizerNotes: "This event was a dream come true for the birthday girl and her friends. Every detail was planned to make the day magical and memorable. The parents loved the stress-free experience and the kids had a blast!"
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
        section: "Birthday Parties"
      },
    ],
  },
  {
    title: "Anniversary Celebrations",
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
        section: "Anniversary Celebrations"
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
        section: "Anniversary Celebrations"
      },
    ],
  },
  {
    title: "Celebration Parties",
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
        section: "Celebration Parties"
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
        section: "Celebration Parties"
      },
    ],
  },
];

const getEventById = (id) => {
  for (const section of eventSections) {
    const found = section.events.find((e) => e.id === Number(id));
    if (found) return { ...found, section: section.title };
  }
  return null;
};

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const event = getEventById(id);
  const [feedbacks, setFeedbacks] = useState([
    { name: "Priya S.", text: "It was a beautiful event, thank you Ananya!" },
    { name: "Rahul M.", text: "Loved the decor and the personal touch." },
  ]);
  const [feedbackForm, setFeedbackForm] = useState({ name: "", text: "" });
  const [submitted, setSubmitted] = useState(false);

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 via-rose-100 to-yellow-50">
        <h2 className="text-3xl font-bold text-pink-700 mb-4">Event Not Found</h2>
        <button onClick={() => navigate('/events')} className="px-6 py-2 bg-pink-400 text-white rounded-full font-bold shadow hover:bg-pink-500 transition">Back to All Events</button>
      </div>
    );
  }

  const handleFeedbackChange = (e) => {
    setFeedbackForm({ ...feedbackForm, [e.target.name]: e.target.value });
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (feedbackForm.name && feedbackForm.text) {
      setFeedbacks([...feedbacks, { ...feedbackForm }]);
      setFeedbackForm({ name: "", text: "" });
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-100 to-yellow-50 p-8">
      <div className="max-w-4xl mx-auto bg-white/80 rounded-3xl shadow-2xl border-2 border-pink-100 p-0 mt-10 overflow-hidden">
        {/* Photo Gallery */}
        <div className="w-full bg-pink-100 flex flex-col items-center py-8 px-2">
          <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-6">
            {event.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={event.title + ' photo ' + (idx + 1)}
                className="w-full h-72 md:h-96 object-cover rounded-2xl border-2 border-pink-200 shadow-lg transition-transform duration-200 hover:scale-105 bg-white"
              />
            ))}
          </div>
        </div>
        {/* Event Details */}
        <div className="p-10 flex flex-col gap-6">
          <h1 className="text-4xl font-extrabold text-pink-700 font-cursive flex items-center gap-2">
            <span role="img" aria-label="section">{event.section === 'Birthday Parties' ? '🎂' : event.section === 'Anniversary Celebrations' ? '💖' : '🎉'}</span> {event.title}
          </h1>
          <div className="text-pink-500 font-semibold">{event.date} | {event.location}</div>
          <div className="text-pink-700 text-lg">{event.description}</div>
          {event.highlights && (
            <div>
              <h3 className="text-lg font-bold text-pink-700 mb-2 flex items-center gap-1"><span role='img' aria-label='star'>✨</span> Highlights</h3>
              <ul className="list-disc list-inside text-pink-600 space-y-1">
                {event.highlights.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          {event.organizerNotes && (
            <div>
              <h3 className="text-lg font-bold text-pink-700 mb-2 flex items-center gap-1"><span role='img' aria-label='memo'>📝</span> Organizer's Notes</h3>
              <div className="text-pink-600 italic">{event.organizerNotes}</div>
            </div>
          )}
          <div>
            <span className="inline-block bg-pink-200 text-pink-700 px-4 py-1 rounded-full font-bold text-sm mr-2">{event.section}</span>
            {event.best && <span className="inline-block bg-yellow-200 text-yellow-700 px-4 py-1 rounded-full font-bold text-sm">Featured</span>}
          </div>
          <div className="flex flex-wrap gap-4 mt-2">
            <button onClick={() => navigate('/events')} className="px-6 py-2 bg-gradient-to-r from-pink-400 to-yellow-300 text-white font-bold rounded-full shadow hover:from-pink-500 hover:to-yellow-400 transition">Back to All Events</button>
            <button onClick={() => navigate('/events')} className="px-6 py-2 bg-pink-100 text-pink-700 font-bold rounded-full shadow border-2 border-pink-200 hover:bg-pink-200 transition">Request to Organize Similar Event</button>
          </div>
        </div>
        {/* Feedback Section */}
        <div className="bg-pink-50 px-10 py-8 border-t-2 border-pink-100">
          <h2 className="text-2xl font-bold text-pink-700 mb-4 flex items-center gap-2"><span role="img" aria-label="feedback">💬</span> Feedback</h2>
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {feedbacks.map((fb, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow p-6 border-l-4 border-pink-200">
                <p className="text-pink-700 italic mb-2">{fb.text}</p>
                <div className="text-sm text-pink-500 font-bold">- {fb.name}</div>
              </div>
            ))}
          </div>
          <form onSubmit={handleFeedbackSubmit} className="bg-pink-100 rounded-2xl p-6 border-2 border-pink-200 shadow flex flex-col gap-4 max-w-xl mx-auto">
            <h3 className="text-lg font-bold text-pink-700 mb-2">Submit Your Feedback</h3>
            <input
              type="text"
              name="name"
              value={feedbackForm.name}
              onChange={handleFeedbackChange}
              className="rounded-lg border-2 border-pink-200 p-3 focus:outline-none focus:border-pink-400 bg-white"
              placeholder="Your Name"
              required
            />
            <textarea
              name="text"
              value={feedbackForm.text}
              onChange={handleFeedbackChange}
              className="rounded-lg border-2 border-pink-200 p-3 focus:outline-none focus:border-pink-400 bg-white"
              placeholder="Your Feedback"
              rows={3}
              required
            ></textarea>
            <button type="submit" className="px-8 py-3 bg-gradient-to-r from-pink-400 to-yellow-300 text-white font-bold rounded-full shadow hover:from-pink-500 hover:to-yellow-400 transition">Submit Feedback</button>
            {submitted && <div className="text-green-600 font-bold mt-2">Thank you for your feedback!</div>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
