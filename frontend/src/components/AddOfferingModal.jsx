import React, {useEffect, useState} from "react";
import apiService from "../utils/apiService";
import LoadingButton from "./LoadingButton";

const AddOfferingModal = ({onClose, onAdd, initial, editMode}) => {
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
    const [formTouched, setFormTouched] = useState(false);
    useEffect(() => {
        apiService.get("/api/categories")
            .then(setCategories)
            .catch(() => setCategories([]));
    }, []);
    const handleChange = e => {
        const {name, value, files} = e.target;
        setFormTouched(true);
        setError(""); // Clear error when user starts typing

        if (name === "imageFile") {
            const file = files[0];
            setForm(f => ({...f, imageFile: file}));
            if (file) setPreview(URL.createObjectURL(file));
        } else {
            setForm(f => ({...f, [name]: value}));
        }
    };
    const handleSubmit = async e => {
        e.preventDefault();
        if (loading) return; // Prevent double submission

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
            const data = await apiService.sendFormData(url, fd, {method});

            onAdd(data);
            onClose();
        } catch (e) {
            setError(e.message || (editMode ? "Failed to update offering" : "Failed to add offering"));
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
             onClick={onClose}>
            <div
                className="bg-white rounded-xl p-6 border-2 border-pink-100 flex flex-col gap-3 min-w-[350px] max-w-md w-full max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-bold text-pink-700">{editMode ? "Edit Offering" : "Add New Offering"}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                        disabled={loading}
                        aria-label="Close modal"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
                <form className="flex flex-col gap-3" onSubmit={handleSubmit} encType="multipart/form-data">
                    <input
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        placeholder="Title"
                        className="border rounded px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-colors"
                        required
                        disabled={loading}
                    />
                    <input
                        name="approximatePrice"
                        value={form.approximatePrice}
                        onChange={handleChange}
                        placeholder="Approximate Price"
                        type="number"
                        min="0"
                        step="0.01"
                        className="border rounded px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-colors"
                        required
                        disabled={loading}
                    />
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Description (optional)"
                        className="border rounded px-3 py-2 min-h-[60px] focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-colors resize-y"
                        disabled={loading}
                    />
                    <div>
                        <label className="block font-semibold text-pink-700 mb-1">Decoration Image</label>
                        <input
                            name="imageFile"
                            type="file"
                            accept="image/*"
                            onChange={handleChange}
                            className="mb-2 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100 file:cursor-pointer cursor-pointer"
                            disabled={loading}
                        />
                        {preview && (
                            <div className="relative inline-block">
                                <img src={preview} alt="Preview"
                                     className="w-32 h-32 object-cover rounded border-2 border-fuchsia-200"/>
                                {loading && <div
                                    className="absolute inset-0 bg-black/20 rounded flex items-center justify-center">
                                    <div className="loading-spinner loading-spinner-sm text-white"></div>
                                </div>}
                            </div>
                        )}
                        {!form.imageFile && !preview && (
                            <div
                                className="w-32 h-32 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-500 text-sm">
                                No image
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block font-semibold text-pink-700 mb-1">Categories</label>
                        <select
                            multiple
                            value={form.categories || []}
                            onChange={e => {
                                const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
                                setForm(f => ({...f, categories: selected}));
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
                            className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-colors"
                            disabled={loading}
                        >
                            <option value="">Select main category...</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.emoji} {cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <LoadingButton
                            type="submit"
                            loading={loading}
                            disabled={!form.title.trim() || !form.approximatePrice.trim()}
                            className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600"
                            loadingText={editMode ? "Updating..." : "Adding..."}
                        >
                            {editMode ? "Update" : "Add"}
                        </LoadingButton>
                        <LoadingButton
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            variant="secondary"
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                        >
                            Cancel
                        </LoadingButton>
                    </div>
                    {error && <div className="text-red-600 text-sm mt-1">{error}</div>}
                </form>
            </div>
        </div>
    );
};

export default AddOfferingModal;
