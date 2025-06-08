import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../utils/apiService";
import { HiPlus, HiArrowUp, HiArrowDown, HiTrash, HiPhoto } from "react-icons/hi2";

const AddOfferingPage = () => {
  const [offering, setOffering] = useState({
    title: "",
    approximatePrice: "",
    description: "",
    inclusions: "",
    categories: [],
    mainCategory: null
  });
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

  const [editingInclusions, setEditingInclusions] = useState(true);
  const [inclusionList, setInclusionList] = useState([]);
  const lastInclusionInputRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    apiService.get("/api/categories")
      .then(cats => {
        setCategories(cats);
      })
      .catch(() => setError("Could not load categories."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (editingInclusions && lastInclusionInputRef.current) {
      lastInclusionInputRef.current.focus();
    }
  }, [inclusionList, editingInclusions]);

  const handleChange = (field, value) => {
    if (field === 'mainCategory') {
      setOffering(o => ({ ...o, [field]: value === "" ? "" : Number(value) }));
    } else {
      setOffering(o => ({ ...o, [field]: value }));
    }
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

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImageFile(file);
      setNewImagePreview(URL.createObjectURL(file));
    }
  };

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

  const handleAddCategory = async () => {
    if (!newCategory.name || !newCategory.emoji) return;
    setCatLoading(true);
    setCatError("");
    try {      const cat = await apiService.post("/api/categories", newCategory, true);
      if (cat.error) throw new Error(cat.error);
      setCategories(prev => [...prev, cat]);
      setShowAddCategory(false);
      setNewCategory({ name: "", emoji: "" });
    } catch (e) {
      setCatError(e.message || "Failed to add category");
    }
    setCatLoading(false);
  };

  const validateOffering = () => {
    if (!offering.title?.trim()) {
      setError("Title is required");
      return false;
    }
    if (!offering.approximatePrice?.trim()) {
      setError("Price is required");
      return false;
    }
    if (!offering.description?.trim()) {
      setError("Description is required");
      return false;
    }
    if (!offering.mainCategory || offering.mainCategory === "") {
      setError("Main category is required");
      return false;
    }
    if (!offering.inclusions?.trim() && inclusionList.length === 0) {
      setError("At least one inclusion is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!validateOffering()) {
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", offering.title.trim());
      formData.append("approximatePrice", offering.approximatePrice.trim());
      formData.append("description", offering.description.trim());
      formData.append("mainCategory", String(offering.mainCategory));
      const inclusionsText = editingInclusions 
        ? inclusionList.filter(inc => inc.trim()).join("\n")
        : offering.inclusions;
      formData.append("inclusions", inclusionsText);
      if (offering.categories?.length > 0) {
        const categoryIds = offering.categories.map(c => c.id);
        formData.append("categories", JSON.stringify(categoryIds));
      }
      if (newImageFile) {
        formData.append("image", newImageFile);
      }
      const result = await apiService.uploadFile("/api/offerings", formData, true);
      if (!result || result.error) {
        throw new Error(result?.error || "Failed to create offering");
      }
      navigate("/admin/offerings");
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to create offering";
      setError(errorMessage);
      setSaving(false);
    }
  };

  const selectedCatIds = new Set(Array.isArray(offering?.categories) ? offering.categories.map(c => c.id) : []);
  const sortedCategories = [
    ...categories.filter(cat => selectedCatIds.has(cat.id)),
    ...categories.filter(cat => !selectedCatIds.has(cat.id))
  ];

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div><p className="ml-3 text-sky-400">Loading categories...</p></div>;

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-slate-800 rounded-xl shadow-2xl border border-slate-700 p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-bold text-sky-400 mb-2 text-center">Add New Offering</h1>
        <p className="text-slate-400 text-center mb-8">Create a new offering package for events</p>
        {error && (
          <div className="mb-6 bg-red-900/30 border border-red-700 rounded-lg p-4 text-center">
            <p className="text-red-400 font-medium">{error}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-sky-300 mb-1.5">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={offering.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors"
              placeholder="Enter offering title"
              required
            />
          </div>
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-sky-300 mb-1.5">
              Approximate Price <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="price"
              value={offering.approximatePrice}
              onChange={(e) => handleChange("approximatePrice", e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors"
              placeholder="Enter approximate price"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-sky-300 mb-1.5">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              id="description"
              value={offering.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={4}
              className="w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors resize-y"
              placeholder="Enter offering description"
              required
            />
          </div>
          <div>
            <label htmlFor="mainCategory" className="block text-sm font-medium text-sky-300 mb-1.5">
              Main Category <span className="text-red-400">*</span>
            </label>
            <select
              id="mainCategory"
              value={offering.mainCategory || ""}
              onChange={(e) => handleChange("mainCategory", e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors"
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.emoji} {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-sky-300 mb-1.5">
              Additional Categories
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryToggle(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    offering.categories && offering.categories.some(c => c.id === cat.id) 
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {cat.emoji} {cat.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-sky-300 mb-1.5">
              Inclusions <span className="text-red-400">*</span>
            </label>
            <div className="space-y-2">
              {inclusionList.map((inclusion, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={inclusion}
                    onChange={(e) => handleInclusionChange(index, e.target.value)}
                    className="flex-1 bg-slate-700 border border-slate-600 text-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors"
                    placeholder="Enter an inclusion"
                    ref={index === inclusionList.length - 1 ? lastInclusionInputRef : null}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveInclusion(index)}
                    className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    <HiTrash className="w-5 h-5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddInclusion}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <HiPlus className="w-5 h-5" />
                Add Inclusion
              </button>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-700">
            <button
              type="submit"
              disabled={saving}
              className="w-full px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold text-base shadow-md transition-colors duration-200 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creating Offering...
                </>
              ) : (
                'Create Offering'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddOfferingPage;
