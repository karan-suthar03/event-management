import React, { useEffect, useState } from "react";
import { HiPlus, HiArrowUp, HiArrowDown, HiTrash, HiPhoto, HiDocumentText } from "react-icons/hi2";
import apiService from "../utils/apiService";
import authService from "../utils/authService";

const EventEditControls = ({ event, onChange, onSubmit, onAddNewImage, className = "" }) => {
  const [categories, setCategories] = useState([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", emoji: "" });
  const [catLoading, setCatLoading] = useState(false);
  const [catError, setCatError] = useState("");
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await apiService.get("/api/categories");
        setCategories(data);
      } catch (error) {
        setCategories([]);
        setCatError("Failed to load categories");
      }
    };
    fetchCategories();
  }, []);
  const handleAddCategory = async () => {
    if (!newCategory.name || !newCategory.emoji) return;
    setCatLoading(true);
    setCatError("");
    try {
      const cat = await apiService.post("/api/categories", newCategory, true);
      setCategories(prev => [...prev, cat]);
      setShowAddCategory(false);
      setNewCategory({ name: "", emoji: "" });
      onChange("category", cat);
    } catch (e) {
      if (e.message === 'Unauthorized') {
        setCatError("Please log in to add categories");
        authService.logout();
      } else {
        setCatError("Failed to add category");
      }
    } finally {
      setCatLoading(false);
    }
  };

  return (
    <div className={`flex flex-col gap-6 w-full ${className} text-slate-300`}>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="event-title" className="text-sm font-medium text-sky-300">Title</label>
        <input
          id="event-title"
          type="text"
          value={event.title || ""}
          onChange={e => onChange("title", e.target.value)}
          className="w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors"
          placeholder="Enter event title"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="event-date" className="text-sm font-medium text-sky-300">Date</label>
        <input
          id="event-date"
          type="date"
          value={event.date || ""}
          onChange={e => onChange("date", e.target.value)}
          className="w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors [color-scheme:dark]"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="event-location" className="text-sm font-medium text-sky-300">Location</label>
        <input
          id="event-location"
          type="text"
          value={event.location || ""}
          onChange={e => onChange("location", e.target.value)}
          className="w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors"
          placeholder="Enter event location"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="event-description" className="text-sm font-medium text-sky-300">Description</label>
        <textarea
          id="event-description"
          value={event.description || ""}
          onChange={e => onChange("description", e.target.value)}
          className="w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors min-h-[100px] resize-y"
          placeholder="Provide a detailed description of the event"
          rows={4}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="event-category" className="text-sm font-medium text-sky-300">Category</label>
        <div className="flex gap-2 items-center">
          <select
            id="event-category"
            value={event.category?.id || ""}
            onChange={e => {
              const cat = categories.find(c => String(c.id) === e.target.value);
              if (cat) onChange("category", cat);
            }}
            className="w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors disabled:opacity-70 flex-1"
            disabled={catLoading}
          >
            <option value="">{catLoading ? "Loading..." : "Select Category"}</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.emoji} {cat.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg shadow font-medium text-sm transition-colors duration-200 flex items-center gap-1.5 whitespace-nowrap"
            onClick={() => setShowAddCategory(v => !v)}
            disabled={catLoading}
          >
            <HiPlus className="h-4 w-4" />
            {showAddCategory ? 'Cancel' : 'New'}
          </button>
        </div>
        {showAddCategory && (
          <div className="flex flex-col gap-3 mt-3 p-4 bg-slate-700/50 border border-slate-600 rounded-lg">
            <h3 className="text-md font-semibold text-sky-400">Add New Category</h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Category Name"
                value={newCategory.name}
                onChange={e => setNewCategory(n => ({ ...n, name: e.target.value }))}
                className="flex-1 bg-slate-600 border border-slate-500 text-slate-200 rounded-md px-3 py-2 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors"
              />
              <input
                type="text"
                placeholder="Emoji"
                value={newCategory.emoji}
                onChange={e => setNewCategory(n => ({ ...n, emoji: e.target.value }))}
                className="w-20 bg-slate-600 border border-slate-500 text-slate-200 rounded-md px-3 py-2 text-center focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors"
                maxLength={2}
              />
            </div>
            <button
              type="button"
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg shadow font-medium text-sm transition-colors duration-200 disabled:opacity-70 self-start"
              onClick={handleAddCategory}
              disabled={catLoading || !newCategory.name || !newCategory.emoji}
            >
              {catLoading ? 'Adding...' : 'Add Category'}
            </button>
            {catError && <div className="text-red-400 text-xs mt-1">{catError}</div>}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="event-highlights" className="text-sm font-medium text-sky-300">Highlights</label>
        <input
          id="event-highlights"
          type="text"
          value={Array.isArray(event.highlights) ? event.highlights.join(', ') : event.highlights || ""}
          onChange={e => {
            onChange('highlights', e.target.value);
          }}
          className="w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors"
          placeholder="e.g. Keynote, Workshops, Free Lunch"
        />
        <span className="text-xs text-slate-400">Comma separated. Example: Keynote, Workshops, Free Lunch</span>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-sky-300 mb-1">Description Sections</label>
        <ul className="space-y-4">
          {event.descriptions && event.descriptions.length > 0 ? event.descriptions.map((desc, idx) => (
            <li key={idx} className="group flex flex-col gap-2 p-4 bg-slate-700/50 border border-slate-600 rounded-lg">
              <div className="flex flex-wrap gap-2 items-center">
                <input
                  type="text"
                  value={desc.title || ''}
                  onChange={e => {
                    const newDescs = [...event.descriptions];
                    newDescs[idx] = { ...newDescs[idx], title: e.target.value };
                    onChange('descriptions', newDescs);
                  }}
                  className="flex-grow bg-slate-600 border border-slate-500 text-slate-200 rounded-md px-3 py-2 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors min-w-[200px]"
                  placeholder={`Section ${idx + 1} Title (optional)`}
                />
                <div className="flex gap-1.5 flex-shrink-0">
                  <button
                    type="button"
                    className="p-2 bg-slate-600 hover:bg-slate-500 text-sky-300 rounded-md text-xs transition-colors disabled:opacity-50"
                    onClick={() => {
                      if (idx > 0) {
                        const descs = [...event.descriptions];
                        [descs[idx - 1], descs[idx]] = [descs[idx], descs[idx - 1]];
                        onChange('descriptions', descs);
                      }
                    }}
                    disabled={idx === 0}
                    title="Move Up"
                  >
                    <HiArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="p-2 bg-slate-600 hover:bg-slate-500 text-sky-300 rounded-md text-xs transition-colors disabled:opacity-50"
                    onClick={() => {
                      if (idx < event.descriptions.length - 1) {
                        const descs = [...event.descriptions];
                        [descs[idx + 1], descs[idx]] = [descs[idx], descs[idx + 1]];
                        onChange('descriptions', descs);
                      }
                    }}
                    disabled={idx === event.descriptions.length - 1}
                    title="Move Down"
                  >
                    <HiArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="p-2 bg-red-700 hover:bg-red-600 text-white rounded-md text-xs transition-colors"
                    onClick={() => {
                      const descs = event.descriptions.filter((_, i) => i !== idx);
                      onChange('descriptions', descs);
                    }}
                    title="Remove Section"
                  >
                    <HiTrash className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <textarea
                value={desc.description || ''}
                onChange={e => {
                  const newDescs = [...event.descriptions];
                  newDescs[idx] = { ...newDescs[idx], description: e.target.value };
                  onChange('descriptions', newDescs);
                }}
                className="w-full bg-slate-600 border border-slate-500 text-slate-200 rounded-md px-3 py-2 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors min-h-[80px] resize-y"
                placeholder={`Section ${idx + 1} Description`}
                rows={3}
              />
            </li>
          )) : <span className="text-slate-400 italic text-sm">No description sections. Click below to add one.</span>}
        </ul>
        <button
          type="button"
          className="mt-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg shadow font-medium text-sm transition-colors duration-200 flex items-center gap-1.5 self-start"
          onClick={() => {
            const descs = [...(event.descriptions || [])];
            descs.push({ title: '', description: '' });
            onChange('descriptions', descs);
          }}
        >
          <HiPlus className="h-4 w-4" />
          Add Section
        </button>
        <span className="text-xs text-slate-400 mt-1">Edit, reorder (using arrow buttons), or delete (using trash icon) sections.</span>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-sky-300 mb-1">Images</label>
        <ul className="space-y-4">
          {event.images && event.images.length > 0 ? event.images.map((img, idx) => (
            <li key={img.id || idx} className="group flex items-center gap-4 p-3 bg-slate-700/50 border border-slate-600 rounded-lg">
              <div className="relative flex-shrink-0">
                <img
                  src={apiService.getImageSrc(img)}
                  alt={`event-img-${idx}`}
                  className="w-24 h-24 object-cover rounded-lg border-2 border-slate-500 bg-slate-600 shadow-md"
                />
                <span className="absolute -top-2 -left-2 bg-slate-800 text-sky-400 text-xs font-bold px-1.5 py-0.5 rounded-full border border-slate-500 shadow">{idx + 1}</span>
              </div>
              <div className="flex flex-col flex-1 gap-2 items-start">
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    className="p-2 bg-slate-600 hover:bg-slate-500 text-sky-300 rounded-md text-xs transition-colors disabled:opacity-50"
                    onClick={() => {
                      if (idx > 0) {
                        const imgs = [...event.images];
                        [imgs[idx - 1], imgs[idx]] = [imgs[idx], imgs[idx - 1]];
                        onChange('images', imgs);
                      }
                    }}
                    disabled={idx === 0}
                    title="Move Up"
                  >
                    <HiArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="p-2 bg-slate-600 hover:bg-slate-500 text-sky-300 rounded-md text-xs transition-colors disabled:opacity-50"
                    onClick={() => {
                      if (idx < event.images.length - 1) {
                        const imgs = [...event.images];
                        [imgs[idx + 1], imgs[idx]] = [imgs[idx], imgs[idx + 1]];
                        onChange('images', imgs);
                      }
                    }}
                    disabled={idx === event.images.length - 1}
                    title="Move Down"
                  >
                    <HiArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="p-2 bg-red-700 hover:bg-red-600 text-white rounded-md text-xs transition-colors"
                    onClick={() => {
                      const imgs = event.images.filter((_, i) => i !== idx);
                      onChange('images', imgs);
                    }}
                    title="Remove Image"
                  >
                    <HiTrash className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-xs text-slate-400 mt-1 truncate max-w-[150px]" title={img.url || img.name || `Image ${idx+1}`}>{img.url?.substring(img.url.lastIndexOf('/') + 1) || img.name || `Image ${idx+1}`}</span>
              </div>
            </li>
          )) : <span className="text-slate-400 italic text-sm">No images uploaded. Click below to add new images.</span>}
        </ul>
        <label className="mt-3 w-full p-6 flex flex-col items-center justify-center border-2 border-dashed border-slate-600 rounded-lg bg-slate-700/50 text-sky-400 cursor-pointer hover:bg-slate-700 hover:border-sky-500 transition shadow-inner">
          <HiPhoto className="h-10 w-10 mb-2 text-slate-500" />
          <span className="text-sm font-semibold">Click to browse or drag & drop new images</span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={e => {
              const files = Array.from(e.target.files);
              files.forEach(file => {
                if (file && onAddNewImage) {
                  onAddNewImage(file);
                }
              });
              e.target.value = '';
            }}
          />
        </label>
        <span className="text-xs text-slate-400 text-center mt-1">Use ▲/▼ to reorder. ✕ to remove. Add new images below.</span>
      </div>
      <div className="flex items-center gap-3 p-4 bg-slate-700/50 border border-slate-600 rounded-lg">
        <input
          id="event-featured"
          type="checkbox"
          checked={!!event.featured}
          onChange={e => onChange('featured', e.target.checked)}
          className="w-5 h-5 accent-sky-500 bg-slate-600 border-slate-500 rounded focus:ring-2 focus:ring-offset-0 focus:ring-offset-slate-800 focus:ring-sky-500 cursor-pointer"
        />
        <label htmlFor="event-featured" className="text-sm font-medium text-sky-300 cursor-pointer select-none">
          Mark as Featured
          <span className="block text-xs text-slate-400 font-normal">Show this event prominently on the home page and event listings.</span>
        </label>
      </div>
      <button
        className="w-full px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold text-base shadow-md transition-colors duration-200 disabled:opacity-70 flex items-center justify-center gap-2 mt-2"
        onClick={onSubmit}
      >
        Submit Changes
      </button>
    </div>
  );
};

export default EventEditControls;
