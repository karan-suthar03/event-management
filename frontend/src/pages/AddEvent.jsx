import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HiPlus, HiArrowUp, HiArrowDown, HiTrash, HiPhoto, HiDocumentText } from "react-icons/hi2";
import apiService from "../utils/apiService";
import authService from "../utils/authService";

const AddEvent = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    category: "",
    date: "",
    location: "",
    description: "",
    highlights: "",
    images: [],
    organizerNotes: ""
  });
  const [imageInputs, setImageInputs] = useState([""]);
  const [descriptions, setDescriptions] = useState([
    { title: "", description: "" }
  ]);
  const [images, setImages] = useState([]);
  const fileInputRef = useRef();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [categories, setCategories] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState("");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", emoji: "" });
  const [featured, setFeatured] = useState(false);
  useEffect(() => {
    const fetchCategories = async () => {
      setCategoryLoading(true);
      setCategoryError("");
      try {
        const data = await apiService.get("/api/categories");
        setCategories(data);
      } catch (e) {
        if (e.message === 'Unauthorized') {
          setCategoryError("Please log in to manage categories");
        } else {
          setCategoryError("Failed to load categories");
        }
      }
      setCategoryLoading(false);
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleImageChange = (idx, value) => {
    const newImages = [...imageInputs];
    newImages[idx] = value;
    setImageInputs(newImages);
    setForm(f => ({ ...f, images: newImages.filter(Boolean) }));
  };

  const addImageInput = () => {
    setImageInputs([...imageInputs, ""]);
  };

  const removeImageInput = (idx) => {
    const newImages = imageInputs.filter((_, i) => i !== idx);
    setImageInputs(newImages);
    setForm(f => ({ ...f, images: newImages.filter(Boolean) }));
  };

  const handleDescChange = (idx, field, value) => {
    setDescriptions(descs => descs.map((d, i) => i === idx ? { ...d, [field]: value } : d));
  };
  const addDescription = () => {
    setDescriptions(descs => [...descs, { title: "", description: "" }]);
  };
  const removeDescription = (idx) => {
    setDescriptions(descs => descs.filter((_, i) => i !== idx));
  };
  const moveDescription = (idx, dir) => {
    setDescriptions(descs => {
      const arr = [...descs];
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= arr.length) return arr;
      [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
      return arr;
    });
  };

  const handleImageFile = (e) => {
    const files = Array.from(e.target.files);
    setImages(imgs => [...imgs, ...files]);
    fileInputRef.current.value = "";
  };
  const removeImage = (idx) => {
    setImages(imgs => imgs.filter((_, i) => i !== idx));
  };
  const moveImage = (idx, dir) => {
    setImages(imgs => {
      const arr = [...imgs];
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= arr.length) return arr;
      [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
      return arr;
    });
  };

  const handleCategorySelect = (e) => {
    setForm(f => ({ ...f, category: e.target.value }));
  };
  const handleNewCategoryChange = (e) => {
    const { name, value } = e.target;
    setNewCategory(c => ({ ...c, [name]: value }));
  };  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.name || !newCategory.emoji) {
      alert("Both name and emoji are required.");
      return;
    }
    setCategoryLoading(true);
    setCategoryError("");
    try {
      const created = await apiService.post("/api/categories", newCategory, true);
      setCategories(cats => [...cats, created]);
      setForm(f => ({ ...f, category: created.name }));
      setNewCategory({ name: "", emoji: "" });
      setShowCategoryModal(false);
    } catch (e) {
      if (e.message === 'Unauthorized') {
        setCategoryError("Please log in to add categories");
        authService.logout();
        navigate("/admin");
      } else {
        setCategoryError("Failed to add category");
      }
    }
    setCategoryLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.category || !form.date || !form.location) {
      alert("Title, category, date, and location are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const eventData = {
        ...form,
        descriptions,
        highlights: form.highlights,
        organizerNotes: form.organizerNotes,
        featured,
      };
      const fd = new FormData();
      Object.entries(eventData).forEach(([key, value]) => {
        if (key === "descriptions") {
          fd.append("descriptions", JSON.stringify(value));
        } else if (key !== "images") {
          fd.append(key, value);
        }
      });
      images.forEach((img, idx) => {
        fd.append("images", img);
      });
      
      await apiService.uploadFile("/api/events", fd, true);
      alert("Event added!");
      setForm({ title: "", category: "", date: "", location: "", description: "", highlights: "", images: [], organizerNotes: "" });
      setDescriptions([{ title: "", description: "" }]);
      setImages([]);
      setFeatured(false);
    } catch (e) {
      if (e.message === 'Unauthorized') {
        setError("Please log in to add events");
        authService.logout();
        navigate("/admin");
      } else {
        setError("Failed to add event");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-8 flex items-center justify-center text-slate-300">
      <div className="w-full max-w-2xl bg-slate-800 rounded-xl shadow-2xl border border-slate-700 p-6 md:p-10">
        <h1 className="text-3xl md:text-4xl font-bold text-sky-400 mb-8 text-center">Add New Event</h1>
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-sky-300 mb-1.5">Event Title</label>
            <input id="title" name="title" value={form.title} onChange={handleChange} placeholder="Enter event title" className="w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-sky-300 mb-1.5">Category</label>
              <div className="flex gap-2 items-center">
                <select id="category" name="category" value={form.category} onChange={handleCategorySelect} className="w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors disabled:opacity-70" disabled={categoryLoading}>
                  <option value="">{categoryLoading ? "Loading Categories..." : "Select Category"}</option>
                  {categories.map((cat) => (
                    <option key={cat.id || cat.name} value={cat.name}>{cat.emoji} {cat.name}</option>
                  ))}
                </select>
                <button type="button" className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg shadow font-medium text-sm transition-colors duration-200 flex items-center gap-1.5 whitespace-nowrap" onClick={() => setShowCategoryModal(true)} disabled={categoryLoading}>
                  <HiPlus className="h-4 w-4" />
                  New
                </button>
              </div>
              {categoryError && <div className="text-red-400 text-xs mt-1.5">{categoryError}</div>}
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-sky-300 mb-1.5">Date</label>
              <input id="date" name="date" type="date" value={form.date} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors [color-scheme:dark]" />
            </div>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-sky-300 mb-1.5">Location</label>
            <input id="location" name="location" value={form.location} onChange={handleChange} placeholder="Enter event location" className="w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors" />
          </div>

          {showCategoryModal && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
              <div className="bg-slate-800 rounded-xl p-6 md:p-8 border border-slate-700 shadow-2xl flex flex-col gap-4 w-full max-w-md">
                <h2 className="text-xl font-bold text-sky-400 mb-2">Add New Category</h2>
                <input name="emoji" value={newCategory.emoji} onChange={handleNewCategoryChange} placeholder="Emoji (e.g. 🎈)" className="w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors" maxLength={2} />
                <input name="name" value={newCategory.name} onChange={handleNewCategoryChange} placeholder="Category Name" className="w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors" />
                {categoryError && <div className="text-red-400 text-xs">{categoryError}</div>}
                <div className="flex gap-3 mt-3">
                  <button className="flex-1 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg shadow font-medium text-sm transition-colors duration-200 disabled:opacity-70" onClick={handleAddCategory} disabled={categoryLoading || !newCategory.name || !newCategory.emoji}>
                    {categoryLoading ? 'Adding...' : 'Add Category'}
                  </button>
                  <button type="button" className="flex-1 px-4 py-2.5 bg-slate-600 hover:bg-slate-500 text-sky-300 rounded-lg shadow font-medium text-sm transition-colors duration-200 border border-slate-500 hover:border-sky-400" onClick={() => { setShowCategoryModal(false); setCategoryError(""); }}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-sky-300 mb-1.5">Main Description</label>
            <textarea id="description" name="description" value={form.description} onChange={handleChange} placeholder="Provide a detailed description of the event" rows={4} className="w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors min-h-[100px] resize-y" />
          </div>

          <div>
            <label className="block text-sm font-medium text-sky-300 mb-2">Additional Sections</label>
            <div className="space-y-4">
              {descriptions.map((desc, idx) => (
                <div key={idx} className="flex flex-col gap-2 p-4 bg-slate-700/50 border border-slate-600 rounded-lg">
                  <div className="flex flex-wrap gap-2 items-center">
                    <input
                      type="text"
                      value={desc.title}
                      onChange={e => handleDescChange(idx, "title", e.target.value)}
                      placeholder={`Section ${idx + 1} Title (optional)`}
                      className="flex-grow bg-slate-600 border border-slate-500 text-slate-200 rounded-md px-3 py-2 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors min-w-[200px]"
                    />
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button type="button" className="p-2 bg-slate-600 hover:bg-slate-500 text-sky-300 rounded-md text-xs transition-colors disabled:opacity-50" onClick={() => moveDescription(idx, -1)} disabled={idx === 0} title="Move Up">
                        <HiArrowUp className="h-4 w-4" />
                      </button>
                      <button type="button" className="p-2 bg-slate-600 hover:bg-slate-500 text-sky-300 rounded-md text-xs transition-colors disabled:opacity-50" onClick={() => moveDescription(idx, 1)} disabled={idx === descriptions.length - 1} title="Move Down">
                        <HiArrowDown className="h-4 w-4" />
                      </button>
                      <button type="button" className="p-2 bg-red-700 hover:bg-red-600 text-white rounded-md text-xs transition-colors disabled:opacity-50" onClick={() => removeDescription(idx)} disabled={descriptions.length === 1} title="Remove Section">
                        <HiTrash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={desc.description}
                    onChange={e => handleDescChange(idx, "description", e.target.value)}
                    placeholder={`Section ${idx + 1} Description`}
                    rows={3}
                    className="w-full bg-slate-600 border border-slate-500 text-slate-200 rounded-md px-3 py-2 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors min-h-[80px] resize-y"
                  />
                </div>
              ))}
            </div>
            <button type="button" className="mt-3 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg shadow font-medium text-sm transition-colors duration-200 flex items-center gap-1.5" onClick={addDescription}>
              <HiPlus className="h-4 w-4" />
              Add Section
            </button>
          </div>

          <div>
            <label htmlFor="highlights" className="block text-sm font-medium text-sky-300 mb-1.5">Highlights</label>
            <textarea id="highlights" name="highlights" value={form.highlights} onChange={handleChange} placeholder="Enter comma-separated highlights (e.g., Live Music, Free Food, Networking)" rows={2} className="w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors min-h-[60px] resize-y" />
          </div>

          <div>
            <label className="block text-sm font-medium text-sky-300 mb-1.5">Event Images</label>
            <div className="p-4 bg-slate-700/50 border-2 border-dashed border-slate-600 rounded-lg hover:border-sky-500 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageFile}
                className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-sky-600 file:text-white hover:file:bg-sky-700 cursor-pointer"
              />
            </div>
            {images.length > 0 && (
              <div className="mt-4 space-y-3">
                <h3 className="text-sm font-medium text-sky-300">Uploaded Images (Drag to reorder):</h3>
                {images.map((img, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2.5 bg-slate-700 border border-slate-600 rounded-lg shadow-sm">
                    <span className="text-sm text-slate-300 truncate flex-grow" title={img.name}>{img.name} ({ (img.size / 1024).toFixed(1) } KB)</span>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button type="button" className="p-1.5 bg-slate-600 hover:bg-slate-500 text-sky-300 rounded-md text-xs transition-colors disabled:opacity-50" onClick={() => moveImage(idx, -1)} disabled={idx === 0} title="Move Up">
                        <HiArrowUp className="h-4 w-4" />
                      </button>
                      <button type="button" className="p-1.5 bg-slate-600 hover:bg-slate-500 text-sky-300 rounded-md text-xs transition-colors disabled:opacity-50" onClick={() => moveImage(idx, 1)} disabled={idx === images.length - 1} title="Move Down">
                        <HiArrowDown className="h-4 w-4" />
                      </button>
                      <button type="button" className="p-1.5 bg-red-700 hover:bg-red-600 text-white rounded-md text-xs transition-colors" onClick={() => removeImage(idx)} title="Remove Image">
                        <HiTrash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 p-4 bg-slate-700/50 border border-slate-600 rounded-lg">
            <input
              type="checkbox"
              id="featured"
              checked={featured}
              onChange={e => setFeatured(e.target.checked)}
              className="w-5 h-5 accent-sky-500 bg-slate-600 border-slate-500 rounded focus:ring-2 focus:ring-offset-0 focus:ring-offset-slate-800 focus:ring-sky-500 cursor-pointer"
            />
            <label htmlFor="featured" className="text-sm font-medium text-sky-300 cursor-pointer select-none">
              Mark as Featured
              <span className="block text-xs text-slate-400 font-normal">Show this event prominently on the home page and event listings.</span>
            </label>
          </div>

          <div>
            <label htmlFor="organizerNotes" className="block text-sm font-medium text-sky-300 mb-1.5">Organizer Notes (Optional)</label>
            <textarea id="organizerNotes" name="organizerNotes" value={form.organizerNotes} onChange={handleChange} placeholder="Internal notes for event organizers (not public)" rows={3} className="w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors min-h-[80px] resize-y" />
          </div>

          <button type="submit" className="w-full px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold text-base shadow-md transition-colors duration-200 disabled:opacity-70 flex items-center justify-center gap-2" disabled={loading}>
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : "Add Event"}
          </button>
        </form>
        {error && 
          <div className="mt-6 p-3 bg-red-900/30 border border-red-700 rounded-lg">
            <p className="text-red-400 text-sm text-center font-medium">{error}</p>
          </div>
        }
      </div>
    </div>
  );
};

export default AddEvent;
