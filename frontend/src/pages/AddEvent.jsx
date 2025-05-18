import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AddEvent = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    category: "",
    date: "",
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

  useEffect(() => {
    const fetchCategories = async () => {
      setCategoryLoading(true);
      setCategoryError("");
      try {
        const res = await fetch("http://localhost:8080/api/categories");
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        } else {
          setCategoryError("Failed to load categories");
        }
      } catch (e) {
        setCategoryError("Network error loading categories");
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

  // Description section logic
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

  // Image section logic
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

  // Category logic
  const handleCategorySelect = (e) => {
    setForm(f => ({ ...f, category: e.target.value }));
  };
  const handleNewCategoryChange = (e) => {
    const { name, value } = e.target;
    setNewCategory(c => ({ ...c, [name]: value }));
  };
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.name || !newCategory.emoji) {
      alert("Both name and emoji are required.");
      return;
    }
    setCategoryLoading(true);
    setCategoryError("");
    try {
      const res = await fetch("http://localhost:8080/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newCategory)
      });
      if (res.ok) {
        const created = await res.json();
        setCategories(cats => [...cats, created]);
        setForm(f => ({ ...f, category: created.name }));
        setNewCategory({ name: "", emoji: "" });
        setShowCategoryModal(false);
      } else {
        const err = await res.json();
        setCategoryError(err.error || "Failed to add category");
      }
    } catch (e) {
      setCategoryError("Network error adding category");
    }
    setCategoryLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.category || !form.date) {
      alert("Title, category, and date are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      // Prepare form data
      const eventData = {
        ...form,
        descriptions,
        highlights: form.highlights,
        organizerNotes: form.organizerNotes,
        // images will be handled below
      };
      // Prepare images as FormData
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
      const res = await fetch("http://localhost:8080/api/events", {
        method: "POST",
        body: fd
      });
      if (res.ok) {
        alert("Event added!");
        setForm({ title: "", category: "", date: "", description: "", highlights: "", images: [], organizerNotes: "" });
        setDescriptions([{ title: "", description: "" }]);
        setImages([]);
      } else {
        let err;
        try {
          err = await res.json();
        } catch {
          err = { error: "Failed to add event" };
        }
        if (err && err.error && err.error.toLowerCase().includes("category")) {
          setError("Category not found. Please select or create a valid category.");
        } else {
          setError(err.error || "Failed to add event");
        }
      }
    } catch (e) {
      setError("Network error");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center py-8 px-2">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-xl border-2 border-pink-100 p-8">
        <h1 className="text-2xl font-extrabold text-pink-700 mb-6">Add Completed Event</h1>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input name="title" value={form.title} onChange={handleChange} placeholder="Event Title" className="border rounded px-3 py-2" />
          {/* Category Selector */}
          <div>
            <label className="block font-semibold text-pink-700 mb-1">Category</label>
            <div className="flex gap-2 items-center">
              <select name="category" value={form.category} onChange={handleCategorySelect} className="border rounded px-3 py-2 flex-1" disabled={categoryLoading}>
                <option value="">{categoryLoading ? "Loading..." : "Select Category"}</option>
                {categories.map((cat, idx) => (
                  <option key={cat.id || cat.name} value={cat.name}>{cat.emoji} {cat.name}</option>
                ))}
              </select>
              <button type="button" className="px-3 py-1 bg-pink-200 text-pink-700 rounded" onClick={() => setShowCategoryModal(true)} disabled={categoryLoading}>+ New</button>
            </div>
            {categoryError && <div className="text-red-600 text-sm mt-1">{categoryError}</div>}
          </div>
          {/* Modal for new category */}
          {showCategoryModal && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 border-2 border-pink-100 flex flex-col gap-3 min-w-[300px]">
                <h2 className="text-lg font-bold text-pink-700 mb-2">Add New Category</h2>
                <input name="emoji" value={newCategory.emoji} onChange={handleNewCategoryChange} placeholder="Emoji (e.g. 🎈)" className="border rounded px-2 py-1" maxLength={2} />
                <input name="name" value={newCategory.name} onChange={handleNewCategoryChange} placeholder="Category Name" className="border rounded px-2 py-1" />
                {categoryError && <div className="text-red-600 text-sm">{categoryError}</div>}
                <div className="flex gap-2 mt-2">
                  <button className="px-3 py-1 bg-pink-500 text-white rounded" onClick={handleAddCategory} disabled={categoryLoading}>Add</button>
                  <button className="px-3 py-1 bg-gray-200 rounded" onClick={() => { setShowCategoryModal(false); setCategoryError(""); }}>Cancel</button>
                </div>
              </div>
            </div>
          )}
          <input name="date" type="date" value={form.date} onChange={handleChange} className="border rounded px-3 py-2" />
          {/* Main Description */}
          <div>
            <label className="block font-semibold text-pink-700 mb-1">Main Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Event Description" className="border rounded px-3 py-2 min-h-[60px] w-full" />
          </div>
          {/* Additional Descriptions */}
          <div>
            <label className="block font-semibold text-pink-700 mb-1">Additional Sections</label>
            {descriptions.map((desc, idx) => (
              <div key={idx} className="flex flex-col gap-1 mb-2 border border-pink-100 rounded p-2 bg-pink-50">
                <div className="flex gap-2 mb-1">
                  <input
                    type="text"
                    value={desc.title}
                    onChange={e => handleDescChange(idx, "title", e.target.value)}
                    placeholder="Section Title (optional)"
                    className="border rounded px-2 py-1 flex-1"
                  />
                  <button type="button" className="px-2 py-1 bg-gray-200 rounded" onClick={() => moveDescription(idx, -1)} disabled={idx === 0}>↑</button>
                  <button type="button" className="px-2 py-1 bg-gray-200 rounded" onClick={() => moveDescription(idx, 1)} disabled={idx === descriptions.length - 1}>↓</button>
                  <button type="button" className="px-2 py-1 bg-red-200 text-red-700 rounded" onClick={() => removeDescription(idx)} disabled={descriptions.length === 1}>Remove</button>
                </div>
                <textarea
                  value={desc.description}
                  onChange={e => handleDescChange(idx, "description", e.target.value)}
                  placeholder="Section Description"
                  className="border rounded px-2 py-1 min-h-[40px]"
                />
              </div>
            ))}
            <button type="button" className="px-3 py-1 bg-pink-200 text-pink-700 rounded" onClick={addDescription}>+ Add Section</button>
          </div>
          {/* Highlights */}
          <textarea name="highlights" value={form.highlights} onChange={handleChange} placeholder="Highlights (comma separated)" className="border rounded px-3 py-2 min-h-[40px]" />
          {/* Images */}
          <div>
            <label className="block font-semibold text-pink-700 mb-1">Event Images</label>
            <input
              type="file"
              multiple
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageFile}
              className="mb-2"
            />
            <div className="flex flex-col gap-2">
              {images.map((img, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs text-pink-700">{img.name}</span>
                  <button type="button" className="px-2 py-1 bg-gray-200 rounded" onClick={() => moveImage(idx, -1)} disabled={idx === 0}>↑</button>
                  <button type="button" className="px-2 py-1 bg-gray-200 rounded" onClick={() => moveImage(idx, 1)} disabled={idx === images.length - 1}>↓</button>
                  <button type="button" className="px-2 py-1 bg-red-200 text-red-700 rounded" onClick={() => removeImage(idx)}>Remove</button>
                </div>
              ))}
            </div>
          </div>
          {/* Organizer Notes */}
          <textarea name="organizerNotes" value={form.organizerNotes} onChange={handleChange} placeholder="Organizer Notes (optional)" className="border rounded px-3 py-2 min-h-[40px]" />
          <button type="submit" className="px-4 py-2 bg-pink-500 text-white rounded font-bold mt-2">Add Event</button>
        </form>
        {loading && <p className="text-pink-700">Submitting...</p>}
        {error && <p className="text-red-700">{error}</p>}
      </div>
    </div>
  );
};

export default AddEvent;
