import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import EventCard from "../components/EventCard";
import apiService from "../utils/apiService";

const AllEvents = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError("");
      try {
        const eventsData = await apiService.get("/api/events");

        const sortedEvents = eventsData.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );

        const grouped = {};
        sortedEvents.forEach((ev) => {
          const catName =
            typeof ev.category === "object" && ev.category !== null
              ? ev.category.name
              : ev.category || "Uncategorized";
          if (!grouped[catName]) grouped[catName] = [];
          grouped[catName].push(ev);
        });
        const categories = await apiService.get("/api/categories");

        const processedSections = Object.entries(grouped).map(
          ([cat, events]) => {
            const catObj = categories.find((c) => c.name === cat) || {};
            return {
              title: cat,
              emoji: catObj.emoji || "🗓️",
              events: events.map((ev) => ({
                ...ev,
                images: Array.isArray(ev.images)
                  ? ev.images.map((img) => {
                      return apiService.getImageSrc(img);
                    })
                  : [],
                highlights: Array.isArray(ev.highlights)
                  ? ev.highlights
                  : typeof ev.highlights === "string"
                  ? ev.highlights.split(/,\s*/)
                  : [],
              })),
            };
          }
        );
        setSections(processedSections);
      } catch (e) {
        console.error("Fetch Events Error:", e);
        setError("Could not load events. Please try again later.");
      }
      setLoading(false);
    };
    fetchEvents();
  }, []);

  return (
    <div className="text-gray-100">
      <section className="mb-12 text-center">
        <div className="flex flex-col items-center justify-center mb-6 pt-0">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-500 to-pink-500">
              All Events
            </span>
          </h1>
          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto">
            Explore our curated collection of beautifully organized events.
            Discover past celebrations and find inspiration for your next memorable
            occasion.
          </p>
        </div>
      </section>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fuchsia-500 mb-4"></div>
          <p className="text-fuchsia-400 text-lg">Loading amazing events...</p>
        </div>
      ) : error ? (
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-8 text-center">
            <p className="text-red-400 text-xl font-semibold mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : sections.length === 0 ? (
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8">
            <p className="text-xl text-gray-400 mb-4">
              No events found at the moment.
            </p>
            <p className="text-gray-500 mb-6">
              Check back soon for our upcoming events!
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-lg font-medium transition-colors"
            >
              Return Home
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-12 pb-0">
          {sections.map((section) => (
            <section
              key={section.title}
              className="bg-gray-800 p-4 sm:p-6 rounded-xl shadow-2xl border border-gray-700"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-pink-400 mb-6 flex items-center gap-3">
                <span className="text-3xl sm:text-4xl">{section.emoji}</span>
                {section.title}
              </h2>
              {section.events.length === 0 ? (
                <div className="text-gray-500 text-center py-4">
                  No events in this section yet.
                </div>
              ) : (
                <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {section.events.map((event) => (
                    <EventCard event={event} key={event.id} modern={true} />
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllEvents;
