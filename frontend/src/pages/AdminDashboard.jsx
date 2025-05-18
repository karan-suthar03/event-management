import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const mockEvents = [
  {
    id: 1,
    title: "Aanya's 1st Birthday Bash",
    category: "Birthday",
    date: "2024-03-15",
    featured: true,
  },
  {
    id: 2,
    title: "Golden Anniversary Gala",
    category: "Anniversary",
    date: "2024-02-10",
    featured: false,
  },
  {
    id: 3,
    title: "Spring Celebration Party",
    category: "Celebration",
    date: "2024-04-22",
    featured: false,
  },
];

const mockFeedback = [
  {
    id: 1,
    eventId: 1,
    name: "Priya S.",
    message: "Absolutely magical! Ananya made our daughter's birthday unforgettable.",
    starred: true,
    date: "2024-03-16",
    status: "starred"
  },
  {
    id: 2,
    eventId: 2,
    name: "Rohit & Meera",
    message: "The anniversary decor was stunning. Highly recommend!",
    starred: false,
    date: "2024-02-11",
    status: "new"
  },
  {
    id: 3,
    eventId: 3,
    name: "Amit P.",
    message: "Great attention to detail and very professional.",
    starred: false,
    date: "2024-04-23",
    status: "regular"
  }
];

const AdminDashboard = () => {
  const [events, setEvents] = useState(mockEvents);
  const [feedbacks, setFeedbacks] = useState(mockFeedback);
  const [activeTab, setActiveTab] = useState("starred");
  const [page, setPage] = useState(1);
  const EVENTS_PER_PAGE = 10;
  const navigate = useNavigate();

  useEffect(() => {
    // Route protection: check for JWT in localStorage
    const token = localStorage.getItem("admin_jwt");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  // Event actions
  const handleFeature = (id) => {
    setEvents(events.map(ev => ev.id === id ? { ...ev, featured: !ev.featured } : ev));
  };
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      setEvents(events.filter(ev => ev.id !== id));
    }
  };
  const handleAdd = () => {
    navigate("/admin/add-event");
  };
  const handleEdit = (id) => {
    // Redirect to event edit page (placeholder)
    alert(`Redirect to Edit Event page for event #${id} (implement navigation)`);
  };

  // Pagination logic
  const pagedEvents = events.slice((page - 1) * EVENTS_PER_PAGE, page * EVENTS_PER_PAGE);
  const hasMore = events.length > page * EVENTS_PER_PAGE;

  // Feedback actions (unchanged)
  const filteredFeedbacks = feedbacks.filter(fb =>
    activeTab === "all" ? true : activeTab === "starred" ? fb.starred : fb.status === "new"
  );
  const handleStar = (id) => {
    setFeedbacks(feedbacks.map(fb => fb.id === id ? { ...fb, starred: !fb.starred, status: fb.starred ? "regular" : "starred" } : fb));
  };
  const handleDeleteFeedback = (id) => {
    if (window.confirm("Delete this feedback?")) setFeedbacks(feedbacks.filter(fb => fb.id !== id));
  };
  const handleEditFeedback = (id) => {
    const msg = prompt("Edit feedback message:", feedbacks.find(fb => fb.id === id).message);
    if (msg !== null) setFeedbacks(feedbacks.map(fb => fb.id === id ? { ...fb, message: msg } : fb));
  };

  return (
    <div className="min-h-screen bg-pink-50 py-8 px-2">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl border-2 border-pink-100 p-8">
        <h1 className="text-3xl font-extrabold text-pink-700 mb-6">Admin Dashboard</h1>
        {/* Events Section */}
        <section className="mb-10">
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-xl font-bold text-pink-700">Completed Events</h2>
            <button className="px-4 py-1 bg-pink-400 text-white rounded shadow" onClick={handleAdd}>+ Add Event</button>
            <button className="px-4 py-1 bg-blue-400 text-white rounded shadow" onClick={() => alert('Go to All Events page (implement navigation)')}>Go to All Events</button>
          </div>
          <table className="w-full text-left mb-2">
            <thead>
              <tr className="bg-pink-100">
                <th className="py-2 px-2">Title</th>
                <th className="py-2 px-2">Category</th>
                <th className="py-2 px-2">Date</th>
                <th className="py-2 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagedEvents.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-4 text-pink-400">No events found.</td></tr>
              ) : (
                pagedEvents.map(ev => (
                  <tr key={ev.id} className="border-b hover:bg-pink-50">
                    <td className="py-2 px-2">{ev.title}</td>
                    <td className="py-2 px-2">{ev.category}</td>
                    <td className="py-2 px-2">{ev.date}</td>
                    <td className="py-2 px-2 flex gap-2">
                      <button className="px-2 py-1 bg-pink-400 text-white rounded text-xs" onClick={() => handleEdit(ev.id)}>Edit</button>
                      <button className="px-2 py-1 bg-yellow-300 text-pink-700 rounded text-xs" onClick={() => handleDelete(ev.id)}>Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="flex gap-2 mt-2">
            {page > 1 && <button className="px-3 py-1 bg-gray-200 rounded" onClick={() => setPage(page - 1)}>Previous</button>}
            {hasMore && <button className="px-3 py-1 bg-gray-200 rounded" onClick={() => setPage(page + 1)}>Next</button>}
          </div>
        </section>
        {/* Feedback Section */}
        <section>
          <div className="flex gap-2 mb-4">
            <button onClick={() => setActiveTab("starred")} className={`px-3 py-1 rounded font-bold text-sm ${activeTab === "starred" ? "bg-pink-400 text-white" : "bg-pink-100 text-pink-600"}`}>Starred</button>
            <button onClick={() => setActiveTab("new")} className={`px-3 py-1 rounded font-bold text-sm ${activeTab === "new" ? "bg-yellow-300 text-pink-700" : "bg-yellow-100 text-pink-600"}`}>New</button>
            <button onClick={() => setActiveTab("all")} className={`px-3 py-1 rounded font-bold text-sm ${activeTab === "all" ? "bg-rose-300 text-white" : "bg-rose-100 text-rose-600"}`}>All</button>
            <button className="px-3 py-1 bg-blue-400 text-white rounded font-bold text-sm" onClick={() => alert('Go to All Events page (implement navigation)')}>Go to All Events</button>
          </div>
          <div className="grid gap-4">
            {filteredFeedbacks.length === 0 ? (
              <div className="text-center py-4 text-pink-400">No feedback found.</div>
            ) : (
              filteredFeedbacks.map(fb => (
                <div key={fb.id} className="bg-pink-50 border border-pink-200 rounded-lg p-4 flex flex-col gap-2 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-pink-700">{fb.name}</span>
                    <span className="text-xs text-pink-400">{fb.date}</span>
                  </div>
                  <div className="text-pink-700 text-base mb-2">{fb.message}</div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-pink-500">Event:</span>
                      <span className="text-xs text-pink-700 font-semibold">{events.find(e => e.id === fb.eventId)?.title || "-"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className={`px-2 py-1 rounded text-xs font-bold ${fb.starred ? 'bg-yellow-300 text-pink-700' : 'bg-pink-100 text-pink-600'}`}
                        onClick={() => handleStar(fb.id)}
                        title={fb.starred ? 'Unstar' : 'Star'}
                      >{fb.starred ? '★' : '☆'}</button>
                      <button
                        className="px-2 py-1 bg-pink-400 text-white rounded text-xs font-bold"
                        onClick={() => handleEditFeedback(fb.id)}
                      >Edit</button>
                      <button
                        className="px-2 py-1 bg-yellow-300 text-pink-700 rounded text-xs font-bold"
                        onClick={() => handleDeleteFeedback(fb.id)}
                      >Delete</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
