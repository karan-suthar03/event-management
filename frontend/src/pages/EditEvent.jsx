import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import EventDetailsLayout from "../components/EventDetailsLayout";
import EventCard from "../components/EventCard";
import EventEditControls from "../components/EventEditControls";
import apiService from "../utils/apiService";
import authService from "../utils/authService";

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [newImageFiles, setNewImageFiles] = useState([]);

  const handleEventFieldChange = (field, value) => {
    setEvent(prev => ({ ...prev, [field]: value }));
  };

  const handleAddNewImage = (file) => {
    setNewImageFiles(prev => [...prev, file]);
    setEvent(prev => ({
      ...prev,
      images: [...(prev.images || []), { url: URL.createObjectURL(file) }],
    }));
  };
  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiService.get(`/api/events/${id}`);
        setEvent(data);
      } catch (e) {
        if (e.message === 'Unauthorized') {
          setError("Please log in to edit events");
          authService.logout();
          navigate("/admin");
        } else {
          setError("Could not load event.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id, navigate]);

  const handleSubmit = async () => {
    if (!event) return;
    let highlights = event.highlights;
    if (Array.isArray(highlights)) {
      highlights = highlights.join(',');
    }
    // Ensure category is a full object (not just id or name)
    let category = event.category;
    if (category && (typeof category === 'string' || typeof category === 'number')) {
      if (Array.isArray(event.categories)) {
        const found = event.categories.find(c => c.id === category || c.name === category);
        if (found) category = found;
      }
    }
    // Ensure date is ISO string (YYYY-MM-DD)
    let date = event.date;
    if (date instanceof Date) {
      date = date.toISOString().slice(0, 10);
    }
    // Clean descriptions
    const descriptions = Array.isArray(event.descriptions)
      ? event.descriptions.map(d => ({
          title: d.title || '',
          description: d.description || ''
        }))
      : [];
    // Only send existing images (with id)
    let imagesForBackend = (event.images || []).filter(img => img.id);
    // Set order property for backend
    imagesForBackend = imagesForBackend.map((img, idx) => ({ ...img, order: idx }));
    const eventData = {
      ...event,
      highlights,
      images: imagesForBackend,
      category,
      date,
      descriptions,
      featured: event.featured,
    };    try {
      setLoading(true);
      setError("");
      setSuccess(false);
      const formData = new FormData();
      formData.append('eventData', JSON.stringify(eventData));
      newImageFiles.forEach(file => {
        formData.append('newImages', file);
      });
      
      await apiService.putFile(`/api/events/${id}`, formData, true);
      setSuccess(true);
      setNewImageFiles([]);
    } catch (e) {
      if (e.message === 'Unauthorized') {
        setError("Please log in to update events");
        authService.logout();
        navigate("/admin");
      } else {
        setError("Failed to update event");
      }
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500 mb-4"></div>
      <p className="text-sky-400 text-lg">Loading event details...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="bg-red-900/30 border border-red-700 p-8 rounded-lg shadow-xl text-center max-w-lg w-full">
        <p className="text-red-400 font-semibold text-xl mb-2">Error Loading Event</p>
        <p className="text-red-500 mb-6">{error}</p>
        <div className="flex gap-4 justify-center">
          <button 
            onClick={() => window.location.reload()} 
            className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
          <button 
            onClick={() => navigate('/admin')} 
            className="px-5 py-2.5 bg-slate-600 hover:bg-slate-500 text-sky-300 rounded-lg font-medium transition-colors border border-slate-500 hover:border-sky-400"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );

  if (!event) return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="bg-slate-800/50 border border-slate-700 p-8 rounded-lg shadow-xl text-center max-w-lg w-full">
        <p className="text-slate-300 text-xl font-semibold mb-4">Event Not Found</p>
        <p className="text-slate-400 mb-6">The event you're looking for doesn't exist or has been removed.</p>
        <button 
          onClick={() => navigate('/admin')} 
          className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );

  if (success) return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="bg-green-900/30 border border-green-700 p-8 rounded-lg shadow-xl text-center max-w-lg w-full">
        <h2 className="text-2xl font-bold text-green-400 mb-4">Success!</h2>
        <p className="text-green-300 mb-6">Event updated successfully.</p>
        <div className="flex gap-4 justify-center">
          <button 
            onClick={() => navigate(`/events/${id}`)} 
            className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition-colors"
          >
            View Event
          </button>
          <button 
            onClick={() => navigate('/admin')} 
            className="px-5 py-2.5 bg-slate-600 hover:bg-slate-500 text-sky-300 rounded-lg font-medium transition-colors border border-slate-500 hover:border-sky-400"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-300 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-sky-400 mb-3">Edit Event</h1>
          <p className="text-slate-400 text-lg">Modify details, sections, and images for your event.</p>
        </header>

        {/* Edit Controls Section */}
        <section className="mb-12 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-sky-300 mb-6 pb-3 border-b border-slate-700">Event Configuration</h2>
          <EventEditControls 
            event={event} 
            onChange={handleEventFieldChange} 
            onSubmit={handleSubmit} 
            onAddNewImage={handleAddNewImage} 
          />
        </section>

        <div className="my-12 h-px bg-slate-700 w-3/4 mx-auto"></div>

        {/* Preview Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-sky-400 mb-8 text-center">Live Previews</h2>
          {/* Reverting to a stacked layout for previews */}
          <div className="flex flex-col gap-10 items-center">
            
            {/* Card Preview */}
            <div className="w-full max-w-xl bg-slate-800 rounded-xl shadow-2xl border border-slate-700 p-6">
              <h3 className="text-xl font-semibold text-sky-300 mb-4 text-center">Card Preview</h3>
              <div className="max-w-md mx-auto">
                <EventCard event={event} />
              </div>
              <p className="text-xs text-slate-500 mt-4 text-center">This is how the event card will appear on listing pages.</p>
            </div>

            {/* Separator */}
            <div className="w-full max-w-lg my-2">
              <div className="h-px bg-slate-700"></div>
            </div>

            {/* Full Details Preview */}
            <div className="w-full bg-slate-800 rounded-xl shadow-2xl border border-slate-700 p-6">
              <h3 className="text-xl font-semibold text-sky-300 mb-4 text-center">Full Details Preview</h3>
                <div className="p-1 bg-slate-850 custom-scrollbar">
                    <EventDetailsLayout event={event} />
                </div>
              <p className="text-xs text-slate-500 mt-4 text-center">This is how the full event details page will look.</p>
            </div>
          </div>
        </section>

        <footer className="text-center text-slate-500 py-8 text-sm mt-10">
          &copy; {new Date().getFullYear()} Eventify Admin Panel. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default EditEvent;