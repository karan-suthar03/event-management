import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { HiArrowLeft, HiOutlineCloudArrowUp, HiOutlinePhoto, HiPlus, HiPencil, HiTrash, HiCheck, HiCheckCircle } from "react-icons/hi2";
import apiService from "../utils/apiService";
import authService from "../utils/authService";

const AdminViewOffering = () => {
  const { offeringId: id } = useParams();
  const [offering, setOffering] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllMainCategories, setShowAllMainCategories] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", emoji: "" });
  const [catLoading, setCatLoading] = useState(false);
  const [catError, setCatError] = useState("");
  const [newImageFile, setNewImageFile] = useState(null);
  const [newImagePreview, setNewImagePreview] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    if (!id || isNaN(Number(id))) {
      setLoading(false);
      setError("Invalid offering ID.");
      return;
    }
    setLoading(true);
    setError("");
    Promise.all([
      apiService.get(`/api/offerings/${id}`, false),
      apiService.get("/api/categories", false)
    ])
      .then(([off, cats]) => {
        setOffering(off);
        setCategories(cats);
      })
      .catch(() => setError("Could not load offering."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (field, value) => {
    setOffering(o => ({ ...o, [field]: value }));
  };

  const handleCategoryToggle = (catId) => {
    setOffering(o => {
      const ids = o.categories ? o.categories.map(c => c.id) : [];
      let newCats;
      if (ids.includes(catId)) {
        newCats = o.categories.filter(c => c.id !== catId);
      } else {
        const cat = categories.find(c => c.id === catId);
        newCats = [...(o.categories || []), cat];
      }
      return { ...o, categories: newCats };
    });
  };

  const handleMainCategoryChange = e => {
    const cat = categories.find(c => String(c.id) === e.target.value);
    setOffering(o => ({ ...o, mainCategory: cat }));
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImageFile(file);
      setNewImagePreview(URL.createObjectURL(file));
    }
  };
  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("title", offering.title);
      fd.append("approximatePrice", offering.approximatePrice);
      fd.append("description", offering.description || "");
      fd.append("inclusions", offering.inclusions || "");
      if (newImageFile) {
        fd.append("image", newImageFile);
      } else {
        fd.append("decorationImageUrl", offering.decorationImageUrl || "");
      }
      if (offering.categories) {
        fd.append("categories", JSON.stringify(offering.categories.map(c => ({ id: c.id, name: c.name, emoji: c.emoji }))));
      }
      if (offering.mainCategory) {
        fd.append("mainCategory", JSON.stringify({ id: offering.mainCategory.id, name: offering.mainCategory.name, emoji: offering.mainCategory.emoji }));
      }
      if (offering.discountType === 'GLOBAL') {
        fd.append('discountType', 'GLOBAL');
      } else if (offering.discountType === 'SPECIAL') {
        fd.append('discountType', 'SPECIAL');
        fd.append('specificDiscountedPrice', offering.specificDiscountedPrice || 0);
      }
      const updated = await apiService.putFile(`/api/offerings/${offering.id}`, fd, true);
      setOffering(updated);
      setNewImageFile(null);
      setNewImagePreview(null);
      alert("Offering updated!");
    } catch (e) {
      setError(e.message || "Failed to update offering");
    }
    setSaving(false);
  };
  const handleAddCategory = async () => {
    if (!newCategory.name || !newCategory.emoji) return;
    setCatLoading(true);
    setCatError("");
    try {
      const cat = await apiService.post("/api/categories", newCategory, false);
      setCategories(prev => [...prev, cat]);
      setShowAddCategory(false);
      setNewCategory({ name: "", emoji: "" });
    } catch (e) {
      setCatError(e.message || "Failed to add category");
    }
    setCatLoading(false);
  };

  const [editingInclusions, setEditingInclusions] = useState(false);
  const [inclusionList, setInclusionList] = useState([]);
  const lastInclusionInputRef = useRef(null);

  useEffect(() => {
    if (offering && typeof offering.inclusions === 'string') {
      setInclusionList(
        offering.inclusions
          .split(';')
          .map(s => s.trim())
          .filter(Boolean)
      );
    }
  }, [offering]);

  useEffect(() => {
    if (editingInclusions && lastInclusionInputRef.current) {
      lastInclusionInputRef.current.focus();
    }
  }, [inclusionList, editingInclusions]);

  const handleInclusionChange = (idx, value) => {
    setInclusionList(list => list.map((item, i) => (i === idx ? value : item)));
  };
  const handleAddInclusion = () => {
    setEditingInclusions(true);
    setInclusionList(list => [...list, 'New inclusion']);
  };
  const handleRemoveInclusion = idx => {
    setInclusionList(list => list.filter((_, i) => i !== idx));
  };
  const handleSaveInclusions = () => {
    handleChange('inclusions', inclusionList.filter(Boolean).join('; '));
    setEditingInclusions(false);
  };

  const selectedCatIds = new Set(Array.isArray(offering?.categories) ? offering.categories.map(c => c.id) : []);
  const sortedCategories = [
    ...categories.filter(cat => selectedCatIds.has(cat.id)),
    ...categories.filter(cat => !selectedCatIds.has(cat.id))
  ];

  if (!id) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="bg-red-900/30 border border-red-700 p-6 rounded-lg shadow-xl text-center">
          <p className="text-red-400 font-semibold text-lg">No Offering Selected</p>
          <p className="text-red-500 mt-2">No offering ID was provided in the URL.</p>
          <button onClick={() => navigate(-1)} className="mt-6 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition-colors">Go Back</button>
        </div>
      </div>
    );
  }

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div><p className="ml-3 text-sky-400">Loading offering details...</p></div>;
  if (error) return <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4"><div className="bg-red-900/30 border border-red-700 p-6 rounded-lg shadow-xl text-center"><p className="text-red-400 font-semibold text-lg">Error Loading Offering</p><p className="text-red-500 mt-2">{error}</p><button onClick={() => navigate(-1)} className="mt-6 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition-colors">Go Back</button></div></div>;
  if (!offering) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><p className="text-slate-400 text-xl">Offering not found.</p></div>;

  const discountTypes = [
    { value: null, label: "No Discount" },
    { value: "GLOBAL", label: "Global Discount" },
    { value: "SPECIAL", label: "Special Discount" }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-300 py-8 px-4 md:px-8">
      <div className="max-w-3xl mx-auto bg-slate-800 rounded-xl shadow-2xl border border-slate-700 p-6 md:p-10">
        <header className="flex items-center justify-between mb-8 pb-6 border-b border-slate-700">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-sky-400">Edit Offering</h1>
            <p className="text-slate-400 mt-1">Update details for the offering: <span className='text-sky-300 font-semibold'>{offering.title}</span></p>
          </div>          <button 
            className="px-5 py-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-sky-300 font-medium transition-colors border border-slate-600 hover:border-sky-500 flex items-center gap-2" 
            onClick={() => navigate(-1)}
            title="Go back"
          >
            <HiArrowLeft className="w-5 h-5" />
            Back
          </button>
        </header>
        
        <div className="space-y-8">

          <section className="text-center p-6 bg-slate-850/50 rounded-lg border border-slate-700">
            <h2 className="text-xl font-semibold text-sky-300 mb-4">Offering Image</h2>
            {(newImagePreview || (offering.decorationImageUrl && offering.decorationImageUrl !== 'null')) ? (
              <img
                src={newImagePreview || apiService.getImageSrc(offering.decorationImageUrl)}
                alt={offering.title || "Offering image"}
                className="w-64 h-64 object-cover rounded-lg border-2 border-slate-600 mx-auto mb-4 shadow-lg"
              />
            ) : (              <div className="w-64 h-64 bg-slate-700 rounded-lg flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-slate-600">
                <HiOutlinePhoto className="w-16 h-16 text-slate-500" />
              </div>
            )}            <label className="inline-flex items-center gap-2 cursor-pointer px-6 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300 ease-in-out">
              <HiOutlineCloudArrowUp className="w-5 h-5" />
              <span>{newImageFile ? "Change Photo" : "Replace Photo"}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageFileChange}
              />
            </label>
            {newImagePreview && <p className="text-xs text-slate-400 mt-2">New photo selected. Click "Save Changes" to apply.</p>}
          </section>

          <section className="p-6 bg-slate-850/50 rounded-lg border border-slate-700 space-y-6">
            <h2 className="text-xl font-semibold text-sky-300 mb-4 border-b border-slate-700 pb-3">Basic Information</h2>
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-sky-300 mb-1">Title</label>
              <input
                id="title"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-slate-300 placeholder-slate-500 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                value={offering.title || ""}
                onChange={e => handleChange("title", e.target.value)}
                placeholder="Enter offering title (e.g., Premium DJ Setup)"
              />
            </div>
            <div>
              <label htmlFor="approximatePrice" className="block text-sm font-medium text-sky-300 mb-1">Approximate Price (₹)</label>
              <input
                id="approximatePrice"
                type="number"
                min="0"
                step="0.01"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-slate-300 placeholder-slate-500 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                value={offering.approximatePrice || ""}
                onChange={e => handleChange("approximatePrice", e.target.value)}
                placeholder="e.g., 15000"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-sky-300 mb-1">Description</label>
              <textarea
                id="description"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-slate-300 placeholder-slate-500 focus:ring-sky-500 focus:border-sky-500 transition-colors min-h-[100px]"
                value={offering.description || ""}
                onChange={e => handleChange("description", e.target.value)}
                placeholder="Detailed description of the offering..."
              />
            </div>
          </section>

          <section className="p-6 bg-slate-850/50 rounded-lg border border-slate-700 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-700 pb-3 mb-4">
                <h2 className="text-xl font-semibold text-sky-300">Categories</h2>                <button
                    type="button"
                    className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
                    onClick={() => setShowAddCategory(v => !v)}
                >
                    <HiPlus className="w-4 h-4" />
                    Add New
                </button>
            </div>
            
            {showAddCategory && (
              <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600 space-y-3 mb-4">
                <h3 className="text-md font-semibold text-sky-400">Add New Category</h3>
                <input
                  type="text"
                  placeholder="Category Name (e.g., Catering)"
                  value={newCategory.name}
                  onChange={e => setNewCategory(n => ({ ...n, name: e.target.value }))}
                  className="w-full bg-slate-600 border border-slate-500 rounded-md px-3 py-2 text-slate-300 placeholder-slate-400 focus:ring-sky-500 focus:border-sky-500"
                />
                <input
                  type="text"
                  placeholder="Emoji (e.g., 🍔)"
                  value={newCategory.emoji}
                  onChange={e => setNewCategory(n => ({ ...n, emoji: e.target.value }))}
                  className="w-24 bg-slate-600 border border-slate-500 rounded-md px-3 py-2 text-slate-300 placeholder-slate-400 focus:ring-sky-500 focus:border-sky-500 text-center"
                  maxLength={2}
                />
                <div className="flex gap-3 items-center">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-md bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm transition-colors disabled:opacity-50"
                    onClick={handleAddCategory}
                    disabled={catLoading || !newCategory.name || !newCategory.emoji}
                  >
                    {catLoading ? "Adding..." : "Add Category"}
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-md bg-slate-600 hover:bg-slate-500 text-sky-300 font-medium text-sm transition-colors"
                    onClick={() => { setShowAddCategory(false); setCatError(""); setNewCategory({ name: "", emoji: "" }); }}
                  >
                    Cancel
                  </button>
                </div>
                {catError && <p className="text-red-400 text-sm mt-1">{catError}</p>}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-sky-300 mb-2">Select Categories (Multiple)</label>
              <div className="flex flex-wrap gap-2">
              {(showAllCategories ? categories : sortedCategories.slice(0, 8)).map(cat => (
                  <button
                  key={cat.id}
                  type="button"
                  className={`px-4 py-2 rounded-full font-semibold border text-sm flex items-center gap-1.5 transition-all duration-200 ease-in-out transform hover:scale-105
                      ${offering.categories && offering.categories.some(c => c.id === cat.id) 
                      ? 'bg-sky-500 text-white border-sky-500 shadow-md' 
                      : 'bg-slate-700 text-sky-300 border-slate-600 hover:bg-slate-600 hover:border-sky-400'}`}
                  onClick={() => handleCategoryToggle(cat.id)}
                  >
                  <span>{cat.emoji}</span> {cat.name}
                  </button>
              ))}
              {categories.length > 8 && (
                  <button
                  type="button"
                  className="px-4 py-2 rounded-full font-semibold border text-sm bg-slate-600 text-sky-300 border-slate-500 hover:bg-slate-500 hover:border-sky-400 transition-colors"
                  onClick={() => setShowAllCategories(v => !v)}
                  >
                  {showAllCategories ? 'Show Less' : `Show ${categories.length - 8} More...`}
                  </button>
              )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-sky-300 mb-2">Select Main Category (Single)</label>
              <div className="flex flex-wrap gap-2">
              {(showAllMainCategories ? categories : sortedCategories.slice(0, 8)).map(cat => (
                  <button
                  key={`main-${cat.id}`}
                  type="button"
                  className={`px-4 py-2 rounded-full font-semibold border text-sm flex items-center gap-1.5 transition-all duration-200 ease-in-out transform hover:scale-105
                      ${offering.mainCategory && offering.mainCategory.id === cat.id 
                      ? 'bg-teal-500 text-white border-teal-500 shadow-md' 
                      : 'bg-slate-700 text-sky-300 border-slate-600 hover:bg-slate-600 hover:border-sky-400'}`}
                  onClick={() => setOffering(o => ({ ...o, mainCategory: cat }))}
                  >
                  <span>{cat.emoji}</span> {cat.name}
                  </button>
              ))}
              {categories.length > 8 && (
                  <button
                  type="button"
                  className="px-4 py-2 rounded-full font-semibold border text-sm bg-slate-600 text-sky-300 border-slate-500 hover:bg-slate-500 hover:border-sky-400 transition-colors"
                  onClick={() => setShowAllMainCategories(v => !v)}
                  >
                  {showAllMainCategories ? 'Show Less' : `Show ${categories.length - 8} More...`}
                  </button>
              )}
              </div>
            </div>
          </section>

          <section className="p-6 bg-slate-850/50 rounded-lg border border-slate-700 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-700 pb-3 mb-4">
                <h2 className="text-xl font-semibold text-sky-300">Inclusions</h2>                {!editingInclusions && (
                    <button
                        type="button"
                        className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
                        onClick={() => setEditingInclusions(true)}
                    >
                        <HiPencil className="w-4 h-4" />
                        Edit Inclusions
                    </button>
                )}
            </div>

            {!editingInclusions ? (
              <div className="space-y-2">
                {inclusionList.length === 0 && <p className="text-slate-400 italic">No inclusions listed. Click 'Edit Inclusions' to add some.</p>}
                {inclusionList.map((inc, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2.5 bg-slate-700 rounded-md border border-slate-600">
                    <span className="text-slate-300 flex-1">{inc}</span>
                  </div>
                ))}
                 {inclusionList.length > 0 && <p className="text-xs text-slate-500 pt-2">Click 'Edit Inclusions' to modify or add more.</p>}
              </div>
            ) : (
              <div className="space-y-3">
                {inclusionList.map((inc, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-300 placeholder-slate-500 focus:ring-sky-500 focus:border-sky-500"
                      value={inc}
                      onChange={e => handleInclusionChange(idx, e.target.value)}
                      placeholder={`Inclusion item #${idx + 1}`}
                      ref={idx === inclusionList.length - 1 ? lastInclusionInputRef : null}
                    />                    <button
                      type="button"
                      className="p-2 rounded-md bg-red-600 hover:bg-red-700 text-white transition-colors"
                      onClick={() => handleRemoveInclusion(idx)}
                      title="Remove Inclusion"
                    >
                      <HiTrash className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <div className="flex gap-3 pt-2">                  <button
                    type="button"
                    className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm transition-colors flex items-center gap-1.5"
                    onClick={handleAddInclusion}
                  >
                    <HiPlus className="w-4 h-4" />
                    Add Item
                  </button>                  <button
                    type="button"
                    className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold shadow-md hover:shadow-lg transition-all duration-300 ease-in-out flex items-center gap-2 disabled:opacity-60"
                    onClick={handleSaveInclusions}
                  >
                     <HiCheck className="w-4 h-4" />
                    Save Inclusions
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-500 text-sky-300 font-medium text-sm transition-colors"
                    onClick={() => { 
                        setEditingInclusions(false); 
                        setInclusionList(offering.inclusions ? offering.inclusions.split(';').map(s => s.trim()).filter(Boolean) : []); 
                    }}
                  >
                    Cancel Edit
                  </button>
                </div>
                 <p className="text-xs text-slate-500 pt-1">Remember to click "Save Inclusions" to confirm changes to this list before saving the entire offering.</p>
              </div>
            )}
          </section>

          <section className="p-6 bg-slate-850/50 rounded-lg border border-slate-700 space-y-6">
            <h2 className="text-xl font-semibold text-sky-300 mb-4 border-b border-slate-700 pb-3">Discount</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-sky-300 mb-1">Discount Type</label>
              <select
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-slate-300 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                value={offering.discountType || ''}
                onChange={e => {
                  const val = e.target.value || null;
                  setOffering(o => ({
                    ...o,
                    discountType: val,
                    specificDiscountedPrice: val === 'SPECIAL' ? (o.specificDiscountedPrice || '') : ''
                  }));
                }}
              >
                {discountTypes.map(dt => (
                  <option key={dt.value || 'none'} value={dt.value || ''}>{dt.label}</option>
                ))}
              </select>
            </div>
            {offering.discountType === 'SPECIAL' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-sky-300 mb-1">Specific Discounted Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-slate-300 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                  value={offering.specificDiscountedPrice ?? ''}
                  onChange={e => setOffering(o => ({ ...o, specificDiscountedPrice: e.target.value }))}
                  placeholder="Enter discounted price after special discount"
                />
              </div>
            )}
            <div className="text-slate-400 text-sm">
              <span className="font-semibold">Current:</span> {offering.discountType === 'GLOBAL' ? 'Global Discount' : offering.discountType === 'SPECIAL' ? `Special Discount (₹${offering.specificDiscountedPrice || 0})` : 'No Discount'}
            </div>
          </section>

          <div className="mt-10 flex justify-end gap-4 pt-6 border-t border-slate-700">
            <button
              type="button"
              className="px-6 py-3 rounded-lg bg-slate-600 hover:bg-slate-500 text-sky-300 font-semibold transition-colors border border-slate-500 hover:border-sky-400"
              onClick={() => navigate(-1)}
              disabled={saving}
            >
              Cancel
            </button>            <button
              type="button"
              className="px-8 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold shadow-md hover:shadow-lg transition-all duration-300 ease-in-out flex items-center gap-2 disabled:opacity-60"
              onClick={handleSave}
              disabled={saving || !offering.title}
            >
              <HiCheckCircle className="w-5 h-5" />
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
          {error && <p className="text-red-400 text-sm mt-4 text-center py-3 bg-red-900/30 border border-red-700 rounded-md">{error}</p>}
        </div>
      </div>
      <footer className="text-center text-slate-500 py-10 text-sm">
        &copy; {new Date().getFullYear()} Eventify Admin Panel. All rights reserved.
      </footer>
    </div>
  );
};

export default AdminViewOffering;
