import React, { useEffect, useState } from "react";

const EventEditControls = ({ event, onChange, className = "" }) => {
  const [categories, setCategories] = useState([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", emoji: "" });
  const [catLoading, setCatLoading] = useState(false);
  const [catError, setCatError] = useState("");

  useEffect(() => {
    fetch("http://localhost:8080/api/categories")
      .then(res => res.json())
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  const handleAddCategory = () => {
    if (!newCategory.name || !newCategory.emoji) return;
    setCatLoading(true);
    setCatError("");
    fetch("http://localhost:8080/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCategory),
    })
      .then(res => res.json())
      .then(cat => {
        if (cat.error) throw new Error(cat.error);
        setCategories(prev => [...prev, cat]);
        setShowAddCategory(false);
        setNewCategory({ name: "", emoji: "" });
        onChange("category", cat);
      })
      .catch(e => setCatError(e.message || "Failed to add category"))
      .finally(() => setCatLoading(false));
  };

  return (
    <div className={`flex flex-col gap-6 w-full ${className}`}>
      <div className="flex flex-col gap-1">
        <label className="text-pink-700 font-semibold">Title</label>
        <input
          type="text"
          value={event.title || ""}
          onChange={e => onChange("title", e.target.value)}
          className="rounded-xl border-2 border-pink-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-fuchsia-300 bg-white/80 shadow text-lg font-bold"
          placeholder="Event title..."
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-pink-700 font-semibold">Date</label>
        <input
          type="date"
          value={event.date || ""}
          onChange={e => onChange("date", e.target.value)}
          className="rounded-xl border-2 border-pink-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-fuchsia-300 bg-white/80 shadow text-lg"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-pink-700 font-semibold">Location</label>
        <input
          type="text"
          value={event.location || ""}
          onChange={e => onChange("location", e.target.value)}
          className="rounded-xl border-2 border-pink-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-fuchsia-300 bg-white/80 shadow text-lg"
          placeholder="Location..."
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-pink-700 font-semibold">Description</label>
        <textarea
          value={event.description || ""}
          onChange={e => onChange("description", e.target.value)}
          className="rounded-xl border-2 border-pink-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-fuchsia-300 bg-white/80 shadow text-lg min-h-[80px]"
          placeholder="Event description..."
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-pink-700 font-semibold">Category</label>
        <div className="flex gap-2 items-center">
          <select
            value={event.category?.id || ""}
            onChange={e => {
              const cat = categories.find(c => String(c.id) === e.target.value);
              if (cat) onChange("category", cat);
            }}
            className="rounded-xl border-2 border-pink-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-fuchsia-300 bg-white/80 shadow text-lg flex-1"
          >
            <option value="">Select category...</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.emoji} {cat.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="ml-2 px-3 py-1 rounded-lg bg-fuchsia-100 text-fuchsia-700 font-bold border border-fuchsia-200 hover:bg-fuchsia-200 transition"
            onClick={() => setShowAddCategory(v => !v)}
          >
            +
          </button>
        </div>
        {showAddCategory && (
          <div className="flex flex-col gap-2 mt-2 bg-fuchsia-50 p-3 rounded-xl border border-fuchsia-200">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Name"
                value={newCategory.name}
                onChange={e => setNewCategory(n => ({ ...n, name: e.target.value }))}
                className="flex-1 rounded-lg border border-pink-200 px-2 py-1"
              />
              <input
                type="text"
                placeholder="Emoji"
                value={newCategory.emoji}
                onChange={e => setNewCategory(n => ({ ...n, emoji: e.target.value }))}
                className="w-16 rounded-lg border border-pink-200 px-2 py-1 text-center"
                maxLength={2}
              />
              <button
                type="button"
                className="px-3 py-1 rounded-lg bg-fuchsia-400 text-white font-bold hover:bg-fuchsia-500 transition"
                onClick={handleAddCategory}
                disabled={catLoading}
              >
                Add
              </button>
            </div>
            {catError && <div className="text-red-500 text-sm">{catError}</div>}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-pink-700 font-semibold">Highlights</label>
        <input
          type="text"
          value={event.highlights || ""}
          onChange={e => {
            onChange('highlights', e.target.value);
          }}
          className="rounded-xl border-2 border-fuchsia-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-fuchsia-300 bg-white/80 shadow text-base"
          placeholder="e.g. Keynote, Workshops, Free Lunch"
        />
        <span className="text-xs text-pink-400">Comma separated. Example: Keynote, Workshops, Free Lunch</span>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-pink-700 font-semibold mb-1">Description Sections</label>
        <ul className="flex flex-col gap-4">
          {event.descriptions && event.descriptions.length > 0 ? event.descriptions.map((desc, idx) => (
            <li key={idx} className="group flex items-start bg-gradient-to-r from-yellow-50 via-pink-50 to-fuchsia-50 border-2 border-pink-200 rounded-2xl shadow-md px-4 py-3 relative hover:shadow-lg transition-all">
              <div className="flex-1 flex flex-col gap-2">
                <input
                  type="text"
                  value={desc.title || ''}
                  onChange={e => {
                    const newDescs = [...event.descriptions];
                    newDescs[idx] = { ...newDescs[idx], title: e.target.value };
                    onChange('descriptions', newDescs);
                  }}
                  className="rounded-xl border-2 border-fuchsia-200 px-3 py-1 focus:outline-none focus:ring-2 focus:ring-fuchsia-300 bg-white/80 shadow text-base font-semibold mb-1"
                  placeholder="Section title..."
                />
                <textarea
                  value={desc.description || ''}
                  onChange={e => {
                    const newDescs = [...event.descriptions];
                    newDescs[idx] = { ...newDescs[idx], description: e.target.value };
                    onChange('descriptions', newDescs);
                  }}
                  className="rounded-xl border-2 border-fuchsia-200 px-3 py-1 focus:outline-none focus:ring-2 focus:ring-fuchsia-300 bg-white/80 shadow text-base min-h-[60px]"
                  placeholder="Section description..."
                />
              </div>
              <div className="flex flex-col gap-2 ml-3 mt-1">
                <button
                  type="button"
                  className="rounded-full bg-gradient-to-br from-fuchsia-200 to-pink-200 text-fuchsia-700 w-8 h-8 flex items-center justify-center shadow hover:from-fuchsia-300 hover:to-pink-300 hover:text-fuchsia-900 transition disabled:opacity-40 border-2 border-fuchsia-100"
                  onClick={() => {
                    if (idx > 0) {
                      const descs = [...event.descriptions];
                      [descs[idx - 1], descs[idx]] = [descs[idx], descs[idx - 1]];
                      onChange('descriptions', descs);
                    }
                  }}
                  disabled={idx === 0}
                  title="Move up"
                >
                  <span className="text-base">▲</span>
                </button>
                <button
                  type="button"
                  className="rounded-full bg-gradient-to-br from-yellow-200 to-pink-100 text-yellow-700 w-8 h-8 flex items-center justify-center shadow hover:from-yellow-300 hover:to-pink-200 hover:text-yellow-900 transition disabled:opacity-40 border-2 border-yellow-100"
                  onClick={() => {
                    if (idx < event.descriptions.length - 1) {
                      const descs = [...event.descriptions];
                      [descs[idx + 1], descs[idx]] = [descs[idx], descs[idx + 1]];
                      onChange('descriptions', descs);
                    }
                  }}
                  disabled={idx === event.descriptions.length - 1}
                  title="Move down"
                >
                  <span className="text-base">▼</span>
                </button>
                <button
                  type="button"
                  className="rounded-full bg-gradient-to-br from-pink-400 to-fuchsia-400 text-white w-8 h-8 flex items-center justify-center shadow hover:from-pink-500 hover:to-fuchsia-500 transition border-2 border-pink-200"
                  onClick={() => {
                    const descs = event.descriptions.filter((_, i) => i !== idx);
                    onChange('descriptions', descs);
                  }}
                  title="Remove section"
                >
                  <span className="text-base">✕</span>
                </button>
              </div>
            </li>
          )) : <span className="text-pink-300 italic">No description sections</span>}
        </ul>
        <button
          type="button"
          className="mt-3 w-40 self-center py-2 rounded-xl bg-gradient-to-r from-fuchsia-400 to-yellow-300 text-white font-bold shadow-lg hover:from-fuchsia-500 hover:to-yellow-400 transition text-base"
          onClick={() => {
            const descs = [...(event.descriptions || [])];
            descs.push({ title: '', description: '' });
            onChange('descriptions', descs);
          }}
        >
          + Add Section
        </button>
        <span className="text-xs text-pink-400 text-center mt-1">Edit, reorder (▲/▼), or delete (✕) sections. Add new sections below.</span>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-pink-700 font-semibold mb-1">Images</label>
        <ul className="flex flex-col gap-4">
          {event.images && event.images.length > 0 ? event.images.map((img, idx) => (
            <li key={idx} className="group flex items-center bg-gradient-to-r from-fuchsia-50 via-pink-50 to-yellow-50 border-2 border-pink-200 rounded-2xl shadow-md px-4 py-3 relative hover:shadow-lg transition-all">
              <div className="relative mr-4">
                <img
                  src={typeof img === 'string' ? img : img.url}
                  alt={`event-img-${idx}`}
                  className="w-24 h-24 object-cover rounded-xl border-2 border-fuchsia-200 bg-pink-50 shadow-md"
                />
                <span className="absolute -top-2 -left-2 bg-white/80 text-fuchsia-400 text-xs font-bold px-2 py-0.5 rounded-full border border-fuchsia-200 shadow">{idx + 1}</span>
              </div>
              <div className="flex flex-col flex-1 gap-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="rounded-full bg-gradient-to-br from-fuchsia-200 to-pink-200 text-fuchsia-700 w-9 h-9 flex items-center justify-center shadow hover:from-fuchsia-300 hover:to-pink-300 hover:text-fuchsia-900 transition disabled:opacity-40 border-2 border-fuchsia-100"
                    onClick={() => {
                      if (idx > 0) {
                        const imgs = [...event.images];
                        [imgs[idx - 1], imgs[idx]] = [imgs[idx], imgs[idx - 1]];
                        onChange('images', imgs);
                      }
                    }}
                    disabled={idx === 0}
                    title="Move up"
                  >
                    <span className="text-lg">▲</span>
                  </button>
                  <button
                    type="button"
                    className="rounded-full bg-gradient-to-br from-yellow-200 to-pink-100 text-yellow-700 w-9 h-9 flex items-center justify-center shadow hover:from-yellow-300 hover:to-pink-200 hover:text-yellow-900 transition disabled:opacity-40 border-2 border-yellow-100"
                    onClick={() => {
                      if (idx < event.images.length - 1) {
                        const imgs = [...event.images];
                        [imgs[idx + 1], imgs[idx]] = [imgs[idx], imgs[idx + 1]];
                        onChange('images', imgs);
                      }
                    }}
                    disabled={idx === event.images.length - 1}
                    title="Move down"
                  >
                    <span className="text-lg">▼</span>
                  </button>
                  <button
                    type="button"
                    className="rounded-full bg-gradient-to-br from-pink-400 to-fuchsia-400 text-white w-9 h-9 flex items-center justify-center shadow hover:from-pink-500 hover:to-fuchsia-500 transition border-2 border-pink-200"
                    onClick={() => {
                      const imgs = event.images.filter((_, i) => i !== idx);
                      onChange('images', imgs);
                    }}
                    title="Remove image"
                  >
                    <span className="text-lg">✕</span>
                  </button>
                </div>
                <span className="text-xs text-pink-400 mt-1">Image {idx + 1}</span>
              </div>
            </li>
          )) : <span className="text-pink-300 italic">No images</span>}
        </ul>
        <label className="mt-3 w-32 h-32 flex flex-col items-center justify-center border-2 border-dashed border-fuchsia-200 rounded-2xl bg-fuchsia-50 text-fuchsia-400 cursor-pointer hover:bg-fuchsia-100 transition self-center shadow-inner">
          <span className="text-4xl mb-1">＋</span>
          <span className="text-xs font-semibold">Add Image</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = ev => {
                  const imgs = [...(event.images || [])];
                  imgs.push(ev.target.result);
                  onChange('images', imgs);
                };
                reader.readAsDataURL(file);
              }
              e.target.value = '';
            }}
          />
        </label>
        <span className="text-xs text-pink-400 text-center mt-1">Use ▲/▼ to reorder. ✕ to remove. Add new images below.</span>
      </div>
      <button
        className="w-full py-3 rounded-xl bg-gradient-to-r from-fuchsia-400 to-yellow-300 text-white font-bold shadow-lg hover:from-fuchsia-500 hover:to-yellow-400 transition text-lg mt-2"
      >
        Submit Changes
      </button>
    </div>
  );
};

export default EventEditControls;
