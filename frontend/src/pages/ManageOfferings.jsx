import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiPlus, HiPencil, HiTrash, HiArchiveBoxXMark } from "react-icons/hi2";
import apiService from "../utils/apiService";

const ManageOfferings = () => {
  const [offerings, setOfferings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortField, setSortField] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingOffering, setEditingOffering] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    setLoading(true);
    setError("");
    apiService.get(`/api/offerings/sorted?sort=${sortField}&order=${sortOrder}`)
      .then(setOfferings)
      .catch(() => setError("Could not load offerings."))
      .finally(() => setLoading(false));
  }, [sortField, sortOrder]);
  useEffect(() => {
    apiService.get('/api/categories')
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this offering?")) return;
    try {
      await apiService.delete(`/api/offerings/${id}`, true);
      setOfferings(offerings.filter(o => o.id !== id));
    } catch {
      alert("Failed to delete offering");
    }
  };

  const handleAdd = (offering) => {
    setOfferings(o => [...o, offering]);
  };

  const handleUpdate = (updated) => {
    setOfferings(o => o.map(of => of.id === updated.id ? updated : of));
    setShowEditModal(false);
    setEditingOffering(null);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(order => order === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredOfferings = selectedCategory
    ? offerings.filter(off => Array.isArray(off.categories) && off.categories.some(cat => String(cat.id) === String(selectedCategory)))
    : offerings;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-300 py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto bg-slate-800 rounded-xl shadow-2xl border border-slate-700 p-6 md:p-8">
        <header className="mb-8 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-sky-400">Manage Offerings</h1>
          <p className="text-slate-400 mt-1">View, filter, add, edit, or delete service offerings.</p>
        </header>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-700">          <button
            className="w-full md:w-auto px-6 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold text-md shadow-md hover:shadow-lg transition-all duration-300 ease-in-out flex items-center justify-center gap-2"
            onClick={() => navigate("/admin/offerings/add")}
          >
            <HiPlus className="w-5 h-5" />
            Add New Offering
          </button>
          <div className="w-full md:w-auto">
            <label htmlFor="categoryFilter" className="sr-only">Filter by category</label>
            <select
              id="categoryFilter"
              className="w-full md:w-auto border border-slate-600 rounded-lg px-4 py-2.5 text-slate-300 bg-slate-700 hover:border-sky-500 focus:ring-sky-500 focus:border-sky-500 transition-colors"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
            >
              <option value="" className="bg-slate-700 text-slate-300">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id} className="bg-slate-700 text-slate-300">{cat.emoji} {cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-sky-500"></div>
            <p className="ml-3 text-sky-400">Loading offerings...</p>
          </div>
        ) : error ? (
          <div className="bg-red-900/30 border border-red-700 p-6 rounded-lg shadow-xl text-center">
            <p className="text-red-400 font-semibold text-lg">Error Loading Offerings</p>
            <p className="text-red-500 mt-2">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-6 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : Array.isArray(filteredOfferings) && filteredOfferings.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-slate-700 shadow-md">
            <table className="min-w-full text-sm text-left text-slate-400">
              <thead className="bg-slate-700/50 text-xs text-sky-400 uppercase tracking-wider">
                <tr>
                  <th scope="col" className="py-3 px-4 md:px-6 cursor-pointer hover:bg-slate-600/50 transition-colors" onClick={() => handleSort('id')}>
                    ID {sortField === 'id' ? (sortOrder === 'asc' ? '▲' : '▼') : <span className="opacity-50">↕</span>}
                  </th>
                  <th scope="col" className="py-3 px-4 md:px-6 cursor-pointer hover:bg-slate-600/50 transition-colors" onClick={() => handleSort('title')}>
                    Title {sortField === 'title' ? (sortOrder === 'asc' ? '▲' : '▼') : <span className="opacity-50">↕</span>}
                  </th>
                  <th scope="col" className="py-3 px-4 md:px-6">Photo</th>
                  <th scope="col" className="py-3 px-4 md:px-6">Category</th>
                  <th scope="col" className="py-3 px-4 md:px-6 cursor-pointer hover:bg-slate-600/50 transition-colors" onClick={() => handleSort('approximatePrice')}>
                    Price {sortField === 'approximatePrice' ? (sortOrder === 'asc' ? '▲' : '▼') : <span className="opacity-50">↕</span>}
                  </th>
                  <th scope="col" className="py-3 px-4 md:px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredOfferings.map(off => (
                  <tr key={off.id} className="bg-slate-800 hover:bg-slate-700/60 transition-colors">
                    <td className="py-3 px-4 md:px-6 font-medium text-slate-300">{off.id}</td>
                    <td className="py-3 px-4 md:px-6 text-sky-400 font-semibold">{off.title}</td>
                    <td className="py-3 px-4 md:px-6">
                      {off.decorationImageUrl ? (
                        <img 
                          src={off.decorationImageUrl.startsWith("/uploads/") ? `${apiService.baseURL || ''}${off.decorationImageUrl}` : off.decorationImageUrl} 
                          alt={off.title || "Offering image"} 
                          className="w-16 h-16 object-cover rounded-md border border-slate-600 shadow-sm" 
                        />
                      ) : (
                        <div className="w-16 h-16 bg-slate-700 rounded-md flex items-center justify-center text-slate-500 text-xs">No Image</div>
                      )}
                    </td>
                    <td className="py-3 px-4 md:px-6">{Array.isArray(off.categories) ? off.categories.map(c => c.name).join(", ") : <span className="text-slate-500">-</span>}</td>
                    <td className="py-3 px-4 md:px-6">{off.approximatePrice ? `₹${off.approximatePrice}` : <span className="text-slate-500">-</span>}</td>
                    <td className="py-3 px-4 md:px-6">
                      <div className="flex items-center justify-center gap-2">                        <button
                          title="Edit Offering"
                          className="p-2 rounded-md bg-sky-600 hover:bg-sky-700 text-white transition-colors shadow-sm hover:shadow-md"
                          onClick={() => navigate(`/admin/offerings/${off.id}`)}
                        >
                          <HiPencil className="w-4 h-4" />
                        </button>
                        <button
                          title="Delete Offering"
                          className="p-2 rounded-md bg-red-600 hover:bg-red-700 text-white transition-colors shadow-sm hover:shadow-md"
                          onClick={() => handleDelete(off.id)}
                        >
                          <HiTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (          <div className="text-center text-slate-400 py-10">
            <HiArchiveBoxXMark className="w-12 h-12 mx-auto mb-3 text-slate-500" />
            <p className="text-xl font-semibold mb-1">No offerings found.</p>
            <p className="text-slate-500">Try adjusting your filters or add a new offering.</p>
          </div>
        )}
      </div>
      <footer className="text-center text-slate-500 py-10 text-sm">
        &copy; {new Date().getFullYear()} Eventify Admin Panel. All rights reserved.
      </footer>
    </div>
  );
};

export default ManageOfferings;
