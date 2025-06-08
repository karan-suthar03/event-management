import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HiPlus, HiPencil, HiTrash, HiOutlineBell, HiOutlineCalendar, HiOutlineChatBubbleLeftRight, HiOutlineExclamationCircle, HiArrowPath } from "react-icons/hi2";
import RequestsPanel from "../components/RequestsPanel";
import apiService from "../utils/apiService";

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [discountInput, setDiscountInput] = useState(0);
  const [discountLoading, setDiscountLoading] = useState(false);
  const [discountError, setDiscountError] = useState("");
  const [unviewedRequestsCount, setUnviewedRequestsCount] = useState(0);
  const EVENTS_PER_PAGE = 10;
  const navigate = useNavigate();
  useEffect(() => {
    setLoading(true);
    setError("");
    apiService.get("/api/events/recent", true)
      .then(data => {
        setEvents(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load events.");
        setLoading(false);
      });    apiService.get("/api/feedbacks/recent", true)
      .then(data => {
        const mapped = data.map(fb => ({
          id: fb.id,
          eventId: fb.eventId,
          eventTitle: fb.eventTitle || "-",
          name: fb.name,
          message: fb.text,
          date: ""
        }));
        setFeedbacks(mapped);
      })
      .catch(() => {
      });
    apiService.get("/api/global-discount", false)
      .then(data => {
        setGlobalDiscount(Number(data.discount) || 0);
        setDiscountInput(Number(data.discount) || 0);
      })
      .catch(() => setGlobalDiscount(0));    const fetchUnviewedCount = async () => {
      try {
        const data = await apiService.get("/api/event-requests/unviewed-count", true);
        setUnviewedRequestsCount(data.count || 0);
      } catch (err) {
        console.error("Failed to fetch unviewed requests count:", err);
      }
    };
    fetchUnviewedCount();
    const interval = setInterval(fetchUnviewedCount, 30000);
    return () => clearInterval(interval);
  }, []);
  const handleFeature = async (id) => {
    const event = events.find(ev => ev.id === id);
    if (!event) return;
    setEvents(events.map(ev => ev.id === id ? { ...ev, featured: !ev.featured } : ev));
    try {
      const eventData = { ...event, featured: !event.featured };
      const formData = new FormData();
      formData.append('eventData', JSON.stringify(eventData));
      await apiService.putFile(`/api/events/${id}`, formData, true);
    } catch (e) {
      setEvents(events);
      alert('Failed to update featured status.');
    }
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
    navigate(`/admin/edit-event/${id}`);
  };
  const pagedEvents = events.slice((page - 1) * EVENTS_PER_PAGE, page * EVENTS_PER_PAGE);
  const hasMore = events.length > page * EVENTS_PER_PAGE;
  const lastTenFeedbacks = feedbacks.slice(-10).reverse();
  const handleDeleteFeedback = (id) => {
    if (window.confirm("Are you sure you want to delete this feedback?")) {
      setFeedbacks(feedbacks.filter(fb => fb.id !== id));
    }
  };
  const handleDiscountSave = async () => {
    setDiscountLoading(true);
    setDiscountError("");
    try {
      const discountToSend = discountInput === '' ? 0 : discountInput;
      const data = await apiService.post("/api/global-discount", { discount: discountToSend }, true);
      setGlobalDiscount(Number(data.discount) || 0);
      setDiscountInput(Number(data.discount) || '');
    } catch (error) {
      setDiscountError(error.message || "Failed to update discount");
    }
    setDiscountLoading(false);
  };
  return (
    <div className="min-h-screen p-4 md:p-8 text-slate-300">
      <div className="max-w-7xl mx-auto bg-slate-800 rounded-xl shadow-2xl border border-slate-700 p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-bold text-sky-400 mb-8">Admin Dashboard</h1>
        {unviewedRequestsCount > 0 && (
          <div className="mb-6 bg-purple-900/30 border border-purple-500 rounded-lg p-4 flex items-center">
            <HiOutlineBell className="text-purple-400 w-6 h-6 mr-3 flex-shrink-0" />
            <span className="text-white">
              You have {unviewedRequestsCount} unviewed {unviewedRequestsCount === 1 ? 'request' : 'requests'}
            </span>
          </div>        )}
        
        <section className="mb-8 bg-slate-800/50 p-6 rounded-lg border border-slate-700 shadow-md">
          <h2 className="text-2xl font-semibold text-sky-300 mb-6">Global Discount</h2>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Current Discount: {globalDiscount}%
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={discountInput}
                onChange={(e) => setDiscountInput(Number(e.target.value))}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                placeholder="Enter discount percentage (0-100)"
              />
            </div>
            <button
              onClick={handleDiscountSave}
              disabled={discountLoading}
              className="px-6 py-2 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-600 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            >
              {discountLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                'Update Discount'
              )}
            </button>
          </div>
          {discountError && (
            <div className="mt-4 p-3 bg-red-900/30 border border-red-700 rounded-lg">
              <p className="text-red-400 text-sm">{discountError}</p>
            </div>
          )}
          <p className="text-slate-400 text-sm mt-3">
            This discount will be applied to all events globally. Set to 0 to disable.
          </p>
        </section>

        <section className="mb-12 bg-slate-800/50 p-6 rounded-lg border border-slate-700 shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-semibold text-sky-300">Manage Events</h2>
            <div className="flex flex-wrap gap-3">
              <button 
                className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg shadow font-medium text-sm transition-colors duration-200 flex items-center gap-2"
                onClick={handleAdd}
              >
                <HiPlus className="h-5 w-5" />
                Add New Event
              </button>
              <button 
                className="px-5 py-2.5 bg-slate-600 hover:bg-slate-500 text-sky-300 rounded-lg shadow font-medium text-sm transition-colors duration-200 border border-slate-500 hover:border-sky-400"
                onClick={() => navigate('/events')}
              >
                View All Events
              </button>
              <button 
                className="px-5 py-2.5 bg-slate-600 hover:bg-slate-500 text-sky-300 rounded-lg shadow font-medium text-sm transition-colors duration-200 border border-slate-500 hover:border-sky-400"
                onClick={() => navigate('/admin/offerings')}
              >
                Manage Offerings
              </button>
            </div>
          </div>
          {loading && !error && (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500 mx-auto mb-4"></div>
              <p className="text-sky-400 text-lg">Loading events...</p>
            </div>
          )}
          {error && (
            <div className="text-center py-8 bg-red-900/30 rounded-lg border border-red-700">
              <HiOutlineExclamationCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <p className="text-red-400 font-semibold text-lg mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2"
              >
                <HiArrowPath className="w-5 h-5" />
                Try Again
              </button>
            </div>
          )}
          {!loading && !error && events.length === 0 ? (
            <div className="text-center py-12">
              <HiOutlineCalendar className="w-16 h-16 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-300 text-xl font-semibold mb-2">No Events Yet</p>
              <p className="text-slate-400 mb-6">Start by adding your first event.</p>
              <button 
                onClick={handleAdd}
                className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2"
              >
                <HiPlus className="w-5 h-5" />
                Add First Event
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-700">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-700 text-xs text-sky-300 uppercase tracking-wider">
                  <tr>
                    <th scope="col" className="py-3 px-4">Title</th>
                    <th scope="col" className="py-3 px-4">Category</th>
                    <th scope="col" className="py-3 px-4">Date</th>
                    <th scope="col" className="py-3 px-4 text-center">Featured</th>
                    <th scope="col" className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {pagedEvents.length === 0 ? (
                    <tr><td colSpan="5" className="text-center py-8 text-slate-400 text-base">No events found.</td></tr>
                  ) : pagedEvents.map(ev => (
                    <tr key={ev.id} className="bg-slate-800 hover:bg-slate-700/50 transition-colors duration-150">
                      <td className="py-3 px-4 font-medium text-slate-200 whitespace-nowrap">{ev.title}</td>
                      <td className="py-3 px-4 text-slate-400">{typeof ev.category === 'object' ? ev.category.name : ev.category}</td>
                      <td className="py-3 px-4 text-slate-400">{ev.date}</td>
                      <td className="py-3 px-4 text-center">
                        <button
                          className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm transition-all ${ev.featured ? 'bg-yellow-500 text-yellow-900 hover:bg-yellow-400' : 'bg-slate-600 text-slate-300 hover:bg-slate-500'}`}
                          onClick={() => handleFeature(ev.id)}
                          title={ev.featured ? 'Unmark as Featured' : 'Mark as Featured'}
                        >
                          {ev.featured ? '★ Featured' : '☆ Feature'}
                        </button>
                      </td>
                      <td className="py-3 px-4 flex items-center justify-center gap-2 whitespace-nowrap">
                        <button className="p-2 bg-sky-600 hover:bg-sky-700 text-white rounded-md text-xs transition-colors" onClick={() => handleEdit(ev.id)} title="Edit Event">
                          <HiPencil />
                        </button>
                        <button className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs transition-colors" onClick={() => handleDelete(ev.id)} title="Delete Event">
                           <HiTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!loading && !error && events.length > EVENTS_PER_PAGE && (
            <div className="flex items-center justify-center gap-3 mt-6">
              {page > 1 && <button className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-sky-300 rounded-md text-sm font-medium transition-colors" onClick={() => setPage(page - 1)}>Previous</button>}
              {hasMore && <button className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-sky-300 rounded-md text-sm font-medium transition-colors" onClick={() => setPage(page + 1)}>Next</button>}
            </div>
          )}
        </section>
        <section className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 shadow-md">
          <h2 className="text-2xl font-semibold text-sky-300 mb-6">Recent Feedbacks</h2>
          <div className="space-y-5">
            {lastTenFeedbacks.length === 0 && !loading ? (
              <div className="text-center py-12">
                <HiOutlineChatBubbleLeftRight className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-300 text-xl font-semibold mb-2">No Feedbacks Yet</p>
                <p className="text-slate-400">Feedback from your events will appear here.</p>
              </div>
            ) : (
              lastTenFeedbacks.map(fb => (
                <div key={fb.id} className="bg-slate-700/60 border border-slate-600 rounded-lg p-5 shadow-sm transition-all hover:shadow-md hover:border-slate-500">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="font-semibold text-sky-400 text-base mr-2">{fb.name}</span>
                      {fb.eventTitle && (
                        <span className="text-xs text-slate-400">on <button onClick={() => navigate(`/events/${fb.eventId}`)} disabled={!fb.eventId} className="text-sky-500 hover:underline disabled:text-slate-500 disabled:no-underline">{fb.eventTitle}</button></span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 flex-shrink-0 ml-2">{fb.date || new Date().toLocaleDateString()}</span>
                  </div>
                  <p className="text-slate-300 text-sm mb-3 leading-relaxed">{fb.message}</p>
                  <div className="flex items-center justify-end gap-2 mt-2 pt-3 border-t border-slate-600/50">
                    <button
                      className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs transition-colors"
                      onClick={() => handleDeleteFeedback(fb.id)} title="Delete Feedback"
                    >
                      <HiTrash />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
        <section className="mt-8">
          <RequestsPanel />
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
