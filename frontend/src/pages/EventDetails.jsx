import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { HiOutlineChatBubbleLeftRight, HiArrowUpTray } from "react-icons/hi2";
import EventDetailsLayout from "../components/EventDetailsLayout";
import apiService from "../utils/apiService";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackForm, setFeedbackForm] = useState({ name: "", text: "" });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {    const fetchEvent = async () => {
      setLoading(true);
      setError("");      try {
        const ev = await apiService.get(`/api/events/${id}`);
        if (!ev) {
          throw new Error("Event not found");
        }
        const images = Array.isArray(ev.images)
          ? ev.images.map(img =>
              apiService.getImageSrc(img)
            )
          : [];
        const highlights = Array.isArray(ev.highlights)
          ? ev.highlights
          : (typeof ev.highlights === "string" ? ev.highlights.split(/,\s*/) : []);
        const descriptions = Array.isArray(ev.descriptions) ? ev.descriptions : [];
        setEvent({ ...ev, images, highlights, descriptions });
      } catch (e) {
        console.error("Error fetching event:", e);
        setError(e.response?.status === 404 ? "Event not found" : "Failed to load event");
        setEvent(null);
      }
      setLoading(false);
    };    fetchEvent();
    const fetchFeedbacks = async () => {
      try {
        const data = await apiService.get(`/api/events/${id}/feedback`);
        setFeedbacks(Array.isArray(data) ? data : []);
      } catch {
        setFeedbacks([]);
      }
    };
    fetchFeedbacks();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-sky-400 text-xl">Loading event...</div>;
  }
  if (error || !event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-3xl font-bold text-red-400 mb-4">Event Not Found</h2>
        <button onClick={() => navigate('/events')} className="px-6 py-2 bg-sky-600 text-white rounded-full font-bold shadow hover:bg-sky-700 transition">Back to All Events</button>
      </div>
    );
  }

  const handleFeedbackChange = (e) => {
    setFeedbackForm({ ...feedbackForm, [e.target.name]: e.target.value });
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (feedbackForm.name && feedbackForm.text) {
      try {
        await apiService.post(`/api/events/${id}/feedback`, { ...feedbackForm, eventId: id });
        setFeedbackForm({ name: "", text: "" });
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 2000);
        const data = await apiService.get(`/api/events/${id}/feedback`);
        setFeedbacks(Array.isArray(data) ? data : []);
      } catch (err) {
        setSubmitted(false);
        alert('Failed to submit feedback. Please try again.');
      }
    }
  };
  return (
    <div className="min-h-screen p-0 md:p-8 flex flex-col items-center">
      <EventDetailsLayout
        event={event}
        onBack={() => navigate('/events')}
        onRequest={true}
      />
      <div className="w-full max-w-4xl mx-auto mt-12 mb-10 p-8 bg-slate-800 rounded-xl shadow-xl border border-slate-700">
        <h2 className="text-3xl font-semibold text-sky-400 mb-8 flex items-center">
          <HiOutlineChatBubbleLeftRight className="h-7 w-7 mr-3 text-sky-500" />
          Community Feedback
        </h2>
        {feedbacks.length === 0 ? (
          <div className="text-center py-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-slate-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <p className="text-slate-400 text-lg">No feedback has been shared for this event yet.</p>
            <p className="text-slate-500">Be the first to share your thoughts!</p>
          </div>
        ) : (
          <div className="space-y-6 mb-10">
            {feedbacks.map((fb, idx) => (
              <div key={idx} className="bg-slate-700/50 p-5 rounded-lg shadow border border-slate-600 flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-sky-500 flex items-center justify-center text-white font-semibold">
                    {fb.name.substring(0, 1).toUpperCase()}
                  </div>
                </div>
                <div>
                  <p className="text-gray-300 leading-relaxed mb-1">{fb.text}</p>
                  <p className="text-sm text-sky-500 font-medium">– {fb.name}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        <form onSubmit={handleFeedbackSubmit} className="bg-slate-700 p-6 rounded-xl shadow-md border border-slate-600 flex flex-col gap-5 max-w-2xl mx-auto">
          <h3 className="text-xl font-semibold text-sky-300 mb-1">Share Your Experience</h3>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">Your Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={feedbackForm.name}
              onChange={handleFeedbackChange}
              className="w-full rounded-md border-2 border-slate-600 p-3 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 bg-slate-800 text-gray-200 placeholder-slate-400 transition duration-150 ease-in-out"
              placeholder="e.g., Alex Smith"
              required
            />
          </div>
          <div>
            <label htmlFor="text" className="block text-sm font-medium text-slate-300 mb-1">Your Feedback</label>
            <textarea
              id="text"
              name="text"
              value={feedbackForm.text}
              onChange={handleFeedbackChange}
              className="w-full rounded-md border-2 border-slate-600 p-3 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 bg-slate-800 text-gray-200 placeholder-slate-400 transition duration-150 ease-in-out"
              placeholder="What did you think of the event?"
              rows={4}
              required
            ></textarea>
          </div>
          <button 
            type="submit" 
            className="w-full px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50 flex items-center justify-center">
            <HiArrowUpTray className="h-5 w-5 mr-2" />
            Submit Feedback
          </button>
          {submitted && <div className="text-green-400 font-semibold mt-2 text-center">Thank you for your feedback! It has been submitted.</div>}
        </form>
      </div>
    </div>
  );
};

export default EventDetails;
