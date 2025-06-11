import React, {useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import {HiArrowDown, HiArrowUp, HiDocumentText, HiPhoto, HiPlus, HiTrash} from "react-icons/hi2";
import apiService from "../utils/apiService";
import authService from "../utils/authService";
import LoadingButton from "../components/LoadingButton";

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
    const [descriptions, setDescriptions] = useState([
        {title: "", description: ""}
    ]);
    const [images, setImages] = useState([]);
    const fileInputRef = useRef();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showSuccessNotification, setShowSuccessNotification] = useState(false);
    const [submittedEventName, setSubmittedEventName] = useState("");

    const [categories, setCategories] = useState([]);
    const [categoryLoading, setCategoryLoading] = useState(false);
    const [categoryError, setCategoryError] = useState("");
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [newCategory, setNewCategory] = useState({name: "", emoji: ""});
    const [featured, setFeatured] = useState(false);
    const [highlights, setHighlights] = useState([]);
    const [highlightInput, setHighlightInput] = useState("");

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
        const {name, value} = e.target;
        setForm(f => ({...f, [name]: value}));
    };

    const handleDescChange = (idx, field, value) => {
        setDescriptions(descs => descs.map((d, i) => i === idx ? {...d, [field]: value} : d));
    };
    const addDescription = () => {
        setDescriptions(descs => [...descs, {title: "", description: ""}]);
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
        setForm(f => ({...f, category: e.target.value}));
    };
    const handleNewCategoryChange = (e) => {
        const {name, value} = e.target;
        setNewCategory(c => ({...c, [name]: value}));
    };
    const handleAddCategory = (e) => {
        e.preventDefault();
        if (!newCategory.name || !newCategory.emoji) {
            alert("Both name and emoji are required.");
            return;
        }

        // Create a temporary category object for local display
        const tempCategory = {
            id: `temp-${Date.now()}`, // Temporary ID for local use
            name: newCategory.name,
            emoji: newCategory.emoji,
            isTemp: true // Flag to identify temporary categories
        };

        // Add to local state immediately without backend call
        setCategories(cats => [...cats, tempCategory]);
        setForm(f => ({...f, category: tempCategory.name}));
        setNewCategory({name: "", emoji: ""});
        setShowCategoryModal(false);
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
            // Find the selected category to get its emoji (especially for temp categories)
            const selectedCategory = categories.find(cat => cat.name === form.category);
            const categoryEmoji = selectedCategory?.emoji || "❓";

            const eventData = {
                ...form,
                categoryEmoji, // Include category emoji for backend
                descriptions,
                highlights: highlights.join(", "),
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
            images.forEach((img) => {
                fd.append("images", img);
            });

            await apiService.uploadFile("/api/events", fd, true);
            setSubmittedEventName(form.title);
            setShowSuccessNotification(true);
            // Reset form data
            setForm({
                title: "",
                category: "",
                date: "",
                location: "",
                description: "",
                highlights: "",
                images: [],
                organizerNotes: ""
            });
            setDescriptions([{title: "", description: ""}]);
            setImages([]);
            setFeatured(false);
            setHighlights([]);
            setHighlightInput("");
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

    const handleAddAnother = () => {
        setShowSuccessNotification(false);
        // Form is already reset in handleSubmit
        window.scrollTo({top: 0, behavior: 'smooth'});
    };

    const handleGoToDashboard = () => {
        navigate("/admin");
    };

    const handleHighlightInputChange = (e) => setHighlightInput(e.target.value);
    const handleAddHighlight = (e) => {
        e.preventDefault();
        const value = highlightInput.trim();
        if (value && !highlights.includes(value)) {
            setHighlights([...highlights, value]);
        }
        setHighlightInput("");
    };
    const handleRemoveHighlight = (idx) => {
        setHighlights(highlights.filter((_, i) => i !== idx));
    };

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8 text-center text-white bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Add
                New Event</h1>

            {error && (
                <div className="bg-red-900/30 border border-red-500 text-red-300 px-4 py-3 rounded relative mb-4"
                     role="alert">
                    <strong className="font-bold">Error:</strong>
                    <span className="block sm:inline"> {error}</span>
                </div>
            )}

            {showSuccessNotification ? (
                <div className="bg-slate-800 p-8 shadow-2xl rounded-xl border border-green-500 mb-6">
                    <div className="text-center">
                        <div
                            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4">
                            <svg className="h-10 w-10 text-green-400" fill="none" stroke="currentColor"
                                 viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Event Submitted Successfully!</h2>
                        <p className="text-gray-300 mb-6">"{submittedEventName}" has been added to the system.</p>

                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <button
                                onClick={handleAddAnother}
                                className="interactive-element px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-md shadow transition-all duration-200 flex items-center justify-center"
                            >
                                <HiPlus className="mr-2"/> Add Another Event
                            </button>
                            <button
                                onClick={handleGoToDashboard}
                                className="interactive-element px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-md shadow transition-all duration-200"
                            >
                                Go to Admin Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit}
                      className="space-y-6 bg-slate-800 p-8 shadow-2xl rounded-xl border border-slate-700">
                    {/* Event Title */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">Event
                            Title</label>
                        <input
                            type="text"
                            name="title"
                            id="title"
                            value={form.title}
                            onChange={handleChange}
                            placeholder="e.g., Summer Music Festival"
                            className="mt-1 block w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm text-white"
                            required
                        />
                    </div>

                    {/* Category */}
                    <div className="flex items-end space-x-3">
                        <div className="flex-grow">
                            <label htmlFor="category"
                                   className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                            <select
                                name="category"
                                id="category"
                                value={form.category}
                                onChange={handleCategorySelect}
                                className="mt-1 block w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm text-white"
                                required
                            >
                                <option value="">Select a category</option>
                                {categoryLoading && <option disabled>Loading categories...</option>}
                                {categories.map(cat => (
                                    <option key={cat.id || cat.name} value={cat.name}>
                                        {cat.emoji} {cat.name}
                                    </option>
                                ))}
                            </select>
                            {categoryError && <p className="text-xs text-red-400 mt-1">{categoryError}</p>}
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowCategoryModal(true)}
                            className="interactive-element px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-purple-500 flex items-center"
                        >
                            <HiPlus className="mr-2 h-5 w-5"/> Add New
                        </button>
                    </div>

                    {/* Date and Location */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-1">Date</label>
                            <input
                                type="date"
                                name="date"
                                id="date"
                                value={form.date}
                                onChange={handleChange}
                                className="mt-1 block w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm text-white"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="location"
                                   className="block text-sm font-medium text-gray-300 mb-1">Location</label>
                            <input
                                type="text"
                                name="location"
                                id="location"
                                value={form.location}
                                onChange={handleChange}
                                placeholder="e.g., Central Park, NYC"
                                className="mt-1 block w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm text-white"
                                required
                            />
                        </div>
                    </div>

                    {/* Main Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Main
                            Description</label>
                        <textarea
                            name="description"
                            id="description"
                            value={form.description}
                            onChange={handleChange}
                            rows="4"
                            placeholder="A brief overview of the event."
                            className="mt-1 block w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm text-white"
                        ></textarea>
                    </div>

                    {/* Highlights */}
                    <div>
                        <label htmlFor="highlights"
                               className="block text-sm font-medium text-gray-300 mb-1">Highlights</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                name="highlightInput"
                                id="highlightInput"
                                value={highlightInput}
                                onChange={handleHighlightInputChange}
                                placeholder="e.g., Live Music"
                                className="mt-1 block w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm text-white"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddHighlight(e);
                                    }
                                }}
                            />
                            <button
                                type="button" // Changed from type="submit"
                                className="interactive-element mt-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md shadow hover:from-purple-600 hover:to-pink-600"
                                disabled={!highlightInput.trim()}
                                onClick={handleAddHighlight} // Added onClick handler
                            >
                                Add
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {highlights.map((hl, idx) => (
                                <span key={idx}
                                      className="inline-flex items-center px-3 py-1 bg-purple-700/30 text-purple-200 rounded-full text-xs font-medium">
                  {hl}
                                    <button type="button" className="ml-2 text-purple-300 hover:text-red-400"
                                            onClick={() => handleRemoveHighlight(idx)}>
                    <HiTrash className="w-3 h-3"/>
                  </button>
                </span>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Add each highlight and press Enter or Add. You can
                            remove them by clicking the trash icon.</p>
                    </div>

                    {/* Image Uploads */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">Event Images</label>
                        <div
                            className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-600 border-dashed rounded-md hover:border-purple-500/50 transition-colors duration-200 bg-slate-900/50">
                            <div className="space-y-1 text-center">
                                <HiPhoto className="mx-auto h-12 w-12 text-slate-400"/>
                                <div className="flex text-sm text-gray-400">
                                    <label
                                        htmlFor="file-upload"
                                        className="relative cursor-pointer bg-transparent rounded-md font-medium text-purple-400 hover:text-purple-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-slate-900 focus-within:ring-purple-500"
                                    >
                                        <span>Upload files</span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only"
                                               multiple onChange={handleImageFile} ref={fileInputRef} accept="image/*"/>
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                            </div>
                        </div>
                        {images.length > 0 && (
                            <div className="mt-4 space-y-3">
                                <h3 className="text-sm font-medium text-gray-300">Uploaded Images:</h3>
                                {images.map((file, idx) => (
                                    <div key={idx}
                                         className="flex items-center justify-between p-2 border border-slate-600 rounded-md bg-slate-900">
                                        <div className="flex items-center space-x-2">
                                            <img src={URL.createObjectURL(file)} alt={`preview ${idx}`}
                                                 className="h-10 w-10 object-cover rounded"/>
                                            <span className="text-sm text-gray-300 truncate max-w-xs">{file.name}</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <button type="button" onClick={() => moveImage(idx, -1)}
                                                    disabled={idx === 0}
                                                    className="interactive-element p-1 text-gray-400 hover:text-purple-400 disabled:opacity-50">
                                                <HiArrowUp className="h-4 w-4"/></button>
                                            <button type="button" onClick={() => moveImage(idx, 1)}
                                                    disabled={idx === images.length - 1}
                                                    className="interactive-element p-1 text-gray-400 hover:text-purple-400 disabled:opacity-50">
                                                <HiArrowDown className="h-4 w-4"/></button>
                                            <button type="button" onClick={() => removeImage(idx)}
                                                    className="interactive-element p-1 text-red-400 hover:text-red-300">
                                                <HiTrash className="h-4 w-4"/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Additional Description Sections */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium text-white">Additional Sections</h3>
                            <button
                                type="button"
                                onClick={addDescription}
                                className="interactive-element px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-green-500 flex items-center"
                            >
                                <HiDocumentText className="mr-2 h-5 w-5"/> Add Section
                            </button>
                        </div>
                        {descriptions.map((desc, idx) => (
                            <div key={idx} className="p-4 border border-slate-600 rounded-md space-y-3 bg-slate-700/30">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-md font-medium text-white">Section {idx + 1}</h4>
                                    <div className="flex items-center space-x-1">
                                        <button type="button" onClick={() => moveDescription(idx, -1)}
                                                disabled={idx === 0}
                                                className="interactive-element p-1 text-gray-400 hover:text-purple-400 disabled:opacity-50">
                                            <HiArrowUp className="h-4 w-4"/></button>
                                        <button type="button" onClick={() => moveDescription(idx, 1)}
                                                disabled={idx === descriptions.length - 1}
                                                className="interactive-element p-1 text-gray-400 hover:text-purple-400 disabled:opacity-50">
                                            <HiArrowDown className="h-4 w-4"/></button>
                                        <button type="button" onClick={() => removeDescription(idx)}
                                                className="interactive-element p-1 text-red-400 hover:text-red-300">
                                            <HiTrash className="h-4 w-4"/></button>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor={`desc-title-${idx}`}
                                           className="block text-xs font-medium text-gray-300 mb-1">Section
                                        Title</label>
                                    <input
                                        type="text"
                                        id={`desc-title-${idx}`}
                                        value={desc.title}
                                        onChange={(e) => handleDescChange(idx, "title", e.target.value)}
                                        placeholder="e.g., Performance Schedule"
                                        className="mt-1 block w-full px-3 py-1.5 bg-slate-900 border border-slate-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm text-white"
                                    />
                                </div>
                                <div>
                                    <label htmlFor={`desc-content-${idx}`}
                                           className="block text-xs font-medium text-gray-300 mb-1">Section
                                        Content</label>
                                    <textarea
                                        id={`desc-content-${idx}`}
                                        value={desc.description}
                                        onChange={(e) => handleDescChange(idx, "description", e.target.value)}
                                        rows="3"
                                        placeholder="Details for this section..."
                                        className="mt-1 block w-full px-3 py-1.5 bg-slate-900 border border-slate-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm text-white"
                                    ></textarea>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Organizer Notes */}
                    <div>
                        <label htmlFor="organizerNotes" className="block text-sm font-medium text-gray-300 mb-1">Organizer
                            Notes (Optional)</label>
                        <textarea
                            name="organizerNotes"
                            id="organizerNotes"
                            value={form.organizerNotes}
                            onChange={handleChange}
                            rows="3"
                            placeholder="Internal notes for event organizers."
                            className="mt-1 block w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm text-white"
                        ></textarea>
                    </div>

                    {/* Featured Event */}
                    <div className="flex items-start">
                        <div className="flex items-center h-5">
                            <input
                                id="featured"
                                name="featured"
                                type="checkbox"
                                checked={featured}
                                onChange={(e) => setFeatured(e.target.checked)}
                                className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-slate-600 rounded bg-slate-900"
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="featured" className="font-medium text-gray-300">Mark as Featured
                                Event</label>
                            <p className="text-gray-500">Featured events may be displayed more prominently.</p>
                        </div>
                    </div>
                    {/* Submit Button */}
                    <div className="pt-5">
                        <LoadingButton
                            type="submit"
                            loading={loading}
                            disabled={loading}
                            variant="gradient"
                            size="lg"
                            className="w-full"
                        >
                            Add Event
                        </LoadingButton>
                    </div>
                </form>
            )}

            {/* Category Modal */}
            {showCategoryModal && (
                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div
                        className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-slate-900 opacity-75"></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen"
                              aria-hidden="true">&#8203;</span>
                        <div
                            className="inline-block align-bottom bg-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-slate-700">
                            <form onSubmit={handleAddCategory}>
                                <div className="bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                            <h3 className="text-lg leading-6 font-medium text-white" id="modal-title">
                                                Add New Category
                                            </h3>
                                            <div className="mt-4 space-y-3">
                                                <div>
                                                    <label htmlFor="newCategoryName"
                                                           className="block text-sm font-medium text-gray-300">Category
                                                        Name</label>
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        id="newCategoryName"
                                                        value={newCategory.name}
                                                        onChange={handleNewCategoryChange}
                                                        className="mt-1 block w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm text-white"
                                                        placeholder="e.g., Music"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label htmlFor="newCategoryEmoji"
                                                           className="block text-sm font-medium text-gray-300">Emoji</label>
                                                    <input
                                                        type="text"
                                                        name="emoji"
                                                        id="newCategoryEmoji"
                                                        value={newCategory.emoji}
                                                        onChange={handleNewCategoryChange}
                                                        className="mt-1 block w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm text-white"
                                                        placeholder="e.g., 🎵"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-slate-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="submit"
                                        className="interactive-element w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-base font-medium text-white hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        Add Category
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowCategoryModal(false)}
                                        className="interactive-element mt-3 w-full inline-flex justify-center rounded-md border border-slate-600 shadow-sm px-4 py-2 bg-slate-800 text-base font-medium text-gray-300 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-purple-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddEvent;
