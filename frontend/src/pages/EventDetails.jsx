import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import EventDetailsLayout from "../components/EventDetailsLayout";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackForm, setFeedbackForm] = useState({ name: "", text: "" });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`http://localhost:8080/api/events/${id}`);
        if (!res.ok) throw new Error("Event not found");
        const ev = await res.json();
        const images = Array.isArray(ev.images)
          ? ev.images.map(img =>
              typeof img === "object" && img.url
                ? (img.url.startsWith("/uploads/")
                    ? `http://localhost:8080${img.url}`
                    : img.url)
                : img
            )
          : [];
        const highlights = Array.isArray(ev.highlights)
          ? ev.highlights
          : (typeof ev.highlights === "string" ? ev.highlights.split(/,\s*/) : []);
        const descriptions = Array.isArray(ev.descriptions) ? ev.descriptions : [];
        setEvent({ ...ev, images, highlights, descriptions });
      } catch (e) {
        setError("Event not found");
      }
      setLoading(false);
    };
    fetchEvent();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-pink-400 text-xl">Loading event...</div>;
  }
  if (error || !event) {
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-yellow-50 to-fuchsia-100 p-0 md:p-8 flex flex-col items-center">
      <EventDetailsLayout
        event={event}
        onBack={() => navigate('/events')}
        onRequest={() => navigate('/events')}
      />
      <div className="w-full max-w-5xl bg-white/90 rounded-3xl shadow-xl border-4 border-pink-100 mt-10 mb-10 p-8">
        <h2 className="text-2xl md:text-3xl font-bold text-pink-700 mb-6 flex items-center gap-2"><span role="img" aria-label="feedback">💬</span> Feedback</h2>
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {feedbacks.length === 0 ? (
            <div className="text-pink-400 col-span-2 text-center">No feedback yet. Be the first!</div>
          ) : (
            feedbacks.map((fb, idx) => (
              <div key={idx} className="bg-pink-50 rounded-2xl shadow p-6 border-l-4 border-pink-200">
                <p className="text-pink-700 italic mb-2">{fb.text}</p>
                <div className="text-sm text-pink-500 font-bold">- {fb.name}</div>
              </div>
            ))
          )}
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
  );
};

export default EventDetails;
