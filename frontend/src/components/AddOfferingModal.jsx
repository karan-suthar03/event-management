import React, { useState, useEffect } from "react";
import { sendFormData } from "../utils/formDataApi";
import apiService from "../utils/apiService";

const AddOfferingModal = ({ onClose, onAdd, initial, editMode }) => {
  const [form, setForm] = useState(initial || {
    title: "",
    decorationImageUrl: "",
    approximatePrice: "",
    description: "",
    imageFile: null,
    categories: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(initial?.decorationImageUrl || "");
  const [categories, setCategories] = useState([]);
  const [mainCategory, setMainCategory] = useState("");
  useEffect(() => {
    apiService.get("/api/categories")
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  const handleChange = e => {
    const { name, value, files } = e.target;
    if (name === "imageFile") {
      const file = files[0];
      setForm(f => ({ ...f, imageFile: file }));
      if (file) setPreview(URL.createObjectURL(file));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("approximatePrice", form.approximatePrice);
      fd.append("description", form.description);
      if (form.imageFile) {
        fd.append("image", form.imageFile);
      } else if (form.decorationImageUrl) {
        fd.append("decorationImageUrl", form.decorationImageUrl);
      }
      if (form.categories) {
        for (const catId of form.categories) {
          fd.append("categories", catId);
        }
      }
      if (mainCategory) {
        fd.append("mainCategory", mainCategory);
      }
      let url = "/api/offerings";
      let method = "POST";
      if (editMode && initial?.id) {
        url += "/" + initial.id;
        method = "PUT";
      }
      const data = await apiService.sendFormData(url, fd, { method });
      
      onAdd(data);
      onClose();
    } catch (e) {
      setError(e.message || (editMode ? "Failed to update offering" : "Failed to add offering"));
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 border-2 border-pink-100 flex flex-col gap-3 min-w-[350px]">
        <h2 className="text-lg font-bold text-pink-700 mb-2">{editMode ? "Edit Offering" : "Add New Offering"}</h2>
        <form className="flex flex-col gap-3" onSubmit={handleSubmit} encType="multipart/form-data">
          <input name="title" value={form.title} onChange={handleChange} placeholder="Title" className="border rounded px-2 py-1" required />
          <input name="approximatePrice" value={form.approximatePrice} onChange={handleChange} placeholder="Approximate Price" type="number" min="0" step="0.01" className="border rounded px-2 py-1" required />
          <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description (optional)" className="border rounded px-2 py-1 min-h-[40px]" />
          <div>
            <label className="block font-semibold text-pink-700 mb-1">Decoration Image</label>
            <input name="imageFile" type="file" accept="image/*" onChange={handleChange} className="mb-2" />
            {preview && <img src={preview} alt="Preview" className="w-32 h-32 object-cover rounded border-2 border-fuchsia-200" />}
            {!form.imageFile && !preview && (
              <input name="decorationImageUrl" value={form.decorationImageUrl} onChange={handleChange} placeholder="Or paste image URL" className="border rounded px-2 py-1 mt-2 w-full" />
            )}
          </div>
          <div>
            <label className="block font-semibold text-pink-700 mb-1">Categories</label>
            <select
              multiple
              value={form.categories || []}
              onChange={e => {
                const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
                setForm(f => ({ ...f, categories: selected }));
              }}
              className="border rounded px-2 py-1 w-full"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.emoji} {cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold text-pink-700 mb-1">Main Category</label>
            <select
              value={mainCategory}
              onChange={e => setMainCategory(e.target.value)}
              className="border rounded px-2 py-1 w-full"
            >
              <option value="">Select main category...</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.emoji} {cat.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 mt-2">
            <button type="submit" className="px-3 py-1 bg-pink-500 text-white rounded" disabled={loading}>{editMode ? "Update" : "Add"}</button>
            <button type="button" className="px-3 py-1 bg-gray-200 rounded" onClick={onClose} disabled={loading}>Cancel</button>
          </div>
          {error && <div className="text-red-600 text-sm mt-1">{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default AddOfferingModal;
