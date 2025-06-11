import React, {useState} from "react";
import {HiCheckCircle, HiEnvelope, HiOutlineSparkles, HiUser, HiXMark} from "react-icons/hi2";
import apiService from '../utils/apiService';
import LoadingButton from './LoadingButton';

// TODO: Implement backend API endpoint to handle similar event requests

const RequestSimilarEventModal = ({event, onClose}) => {
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        message: ""
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [formTouched, setFormTouched] = useState(false);

    const handleChange = e => {
        const {name, value} = e.target;
        setForm(f => ({...f, [name]: value}));

        // Clear error when user starts typing
        if (error) {
            setError("");
        }

        // Mark form as touched
        if (!formTouched) {
            setFormTouched(true);
        }
    };
    const handleSubmit = async e => {
        e.preventDefault();

        // Prevent double submissions
        if (loading) return;

        setLoading(true);
        setError("");
        setSuccess(false);

        try {
            const requestData = {
                name: form.name,
                email: form.email,
                phone: form.phone,
                message: form.message,
                eventId: event?.id,
                eventTitle: event?.title,
                requestType: 'similar_event',
                requestDate: new Date().toISOString()
            };

            const data = await apiService.post("/api/event-requests", requestData, false);
            if (data) {
                setSuccess(true);
                // Clear form after successful submission
                setForm({name: "", email: "", phone: "", message: ""});
                setFormTouched(false);
            } else {
                throw new Error("Failed to submit request");
            }
        } catch (error) {
            setError("Failed to send request. Please try again later.");
            console.error("Error submitting similar event request:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4 transition-opacity duration-300 ease-in-out"
            onClick={onClose}>
            <div
                className="bg-slate-800 rounded-xl shadow-2xl p-6 sm:p-8 border border-slate-700 flex flex-col gap-4 w-full max-w-2xl relative transform transition-all duration-300 ease-in-out animate-modal-appear max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors p-2 rounded-full hover:bg-slate-700 z-10 interactive-element"
                    aria-label="Close modal"
                >
                    <HiXMark className="w-6 h-6"/>
                </button>

                <div className="text-center mb-6">
                    <div className="flex items-center justify-center mb-4">
                        <div className="bg-sky-500/20 rounded-full p-3 mr-3">
                            <HiOutlineSparkles className="h-8 w-8 text-sky-400"/>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-sky-300">
                            Request Similar Event
                        </h2>
                    </div>
                    <p className="text-slate-400 text-sm">
                        Inspired by <span className="text-sky-300 font-semibold">"{event?.title}"</span>? Let's create
                        something amazing for you!
                    </p>
                </div>

                {success ? (
                    <div className="text-center py-8">
                        <div
                            className="bg-green-500/20 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                            <HiCheckCircle className="h-12 w-12 text-green-400"/>
                        </div>
                        <h3 className="text-2xl font-semibold text-green-300 mb-3">Request Sent Successfully!</h3>
                        <p className="text-slate-400 mb-6">
                            Thank you for your interest! Our event planning team will contact you within 24 hours to
                            discuss your vision for a similar event.
                        </p>
                        <button
                            onClick={onClose}
                            className="interactive-element px-8 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            Close
                        </button>
                    </div>
                ) : (<form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="name" className="text-sm font-medium text-sky-300 mb-2 flex items-center">
                                <HiUser className="h-4 w-4 mr-2"/>
                                Full Name
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text" value={form.name}
                                onChange={handleChange}
                                placeholder="Your full name"
                                className="input-field w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all duration-200"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="text-sm font-medium text-sky-300 mb-2 flex items-center">
                                <HiEnvelope className="h-4 w-4 mr-2"/>
                                Email Address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email" value={form.email}
                                onChange={handleChange}
                                placeholder="your.email@example.com"
                                className="input-field w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all duration-200"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-sky-300 mb-2">
                                Phone Number
                            </label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel" value={form.phone}
                                onChange={handleChange}
                                placeholder="(555) 123-4567"
                                className="input-field w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all duration-200"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-sky-300 mb-2">
                                Message
                            </label>
                            <textarea
                                id="message"
                                name="message" value={form.message}
                                onChange={handleChange}
                                placeholder="Tell us about your vision for a similar event..."
                                rows={4}
                                className="input-field w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all duration-200 resize-y min-h-[100px]"
                                required
                            />
                        </div>

                        {error && (
                            <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg">
                                <p className="text-red-400 text-sm">{error}</p>
                            </div>
                        )}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-700">
                            <LoadingButton
                                type="submit"
                                loading={loading}
                                disabled={loading}
                                variant="primary"
                                size="md"
                                className="flex-1"
                            >
                                <HiOutlineSparkles className="h-5 w-5"/>
                                Send Request
                            </LoadingButton>
                            <button
                                type="button"
                                onClick={onClose}
                                className="interactive-element px-6 py-3 bg-slate-600 hover:bg-slate-500 text-slate-300 font-semibold rounded-lg shadow-md transition-all duration-200 border border-slate-500 hover:border-slate-400"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>

            <style jsx global>{`
        @keyframes modal-appear {
          0% { transform: scale(0.95); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-modal-appear {
          animation: modal-appear 0.3s ease-out forwards;
        }
      `}</style>
        </div>
    );
};

export default RequestSimilarEventModal;
