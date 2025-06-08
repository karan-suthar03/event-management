import React, { useState } from "react";
import ConfirmationDialog from "./ConfirmationDialog";
import apiService from '../utils/apiService';

const RequestOfferingModal = ({ offering, onClose, modern = false }) => {
  const [form, setForm] = useState({ name: "", contact: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const offeringId = offering?.id;
      const requestData = {
        ...form,
        offeringId,
        offeringTitle: offering?.title,
        requestDate: new Date().toISOString()
      };
        const data = await apiService.post("/api/requests", requestData, false);
      if (data) {
        setSuccess(true);
        setShowConfirmation(true);
      } else {
        throw new Error("Failed to submit request");
      }
    } catch (error) {
      setError("Failed to send request. Please try again later.");
      console.error("Error submitting offering request:", error);
    }
    setLoading(false);
  };
  if (showConfirmation) {
    return (
      <ConfirmationDialog
        title="Request Submitted!"
        message={`Thank you for your interest in our ${offering?.title || "decoration"} package! Ananya will contact you soon to discuss your event needs.`}
        onClose={onClose}
      />
    );
  }
  
  if (modern) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4 transition-opacity duration-300 ease-in-out" onClick={onClose}>
        <div 
          className="bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8 border border-gray-700 flex flex-col gap-4 w-full max-w-md relative transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-modal-appear"
          onClick={e => e.stopPropagation()}
        >
          <button 
            onClick={onClose} 
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-gray-700"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h2 className="text-2xl sm:text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-pink-400 mb-2">
            Request: {offering?.title || "Selected Package"}
          </h2>
          
          {success ? (
            <div className="text-center py-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xl font-semibold text-green-300 mb-2">Request Sent Successfully!</p>
              <p className="text-gray-400">Ananya will get in touch with you shortly regarding your request for "{offering?.title}".</p>
              <button
                onClick={onClose}
                className="mt-6 px-6 py-2 bg-fuchsia-500 hover:bg-fuchsia-600 text-white rounded-lg font-semibold transition-colors duration-200"
              >
                Close
              </button>
            </div>
          ) : (
            <form className="flex flex-col gap-4 sm:gap-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Your Name</label>
                <input 
                  id="name" 
                  name="name" 
                  type="text"
                  value={form.name} 
                  onChange={handleChange} 
                  placeholder="e.g., Jane Doe"
                  className="w-full bg-gray-700 border border-gray-600 text-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 outline-none transition-colors duration-200"
                  required 
                />
              </div>
              <div>
                <label htmlFor="contact" className="block text-sm font-medium text-gray-300 mb-1">Contact (Email/Phone)</label>
                <input 
                  id="contact" 
                  name="contact" 
                  type="text"
                  value={form.contact} 
                  onChange={handleChange} 
                  placeholder="e.g., jane.doe@example.com or 9876543210"
                  className="w-full bg-gray-700 border border-gray-600 text-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 outline-none transition-colors duration-200"
                  required 
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">Message (Optional)</label>
                <textarea 
                  id="message" 
                  name="message" 
                  value={form.message} 
                  onChange={handleChange} 
                  placeholder="Any specific details or questions?"
                  rows="3"
                  className="w-full bg-gray-700 border border-gray-600 text-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 outline-none transition-colors duration-200 resize-none"
                />
              </div>
              
              {error && <div className="text-red-400 text-sm bg-red-900/30 border border-red-700 p-3 rounded-md">{error}</div>}

              <div className="flex flex-col sm:flex-row gap-3 mt-3">
                <button 
                  type="submit" 
                  className="w-full sm:w-auto flex-1 px-6 py-3 bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white rounded-lg font-semibold shadow-md hover:from-fuchsia-600 hover:to-pink-600 hover:scale-105 transform transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </span>
                  ) : "Send Request"}
                </button>
                <button 
                  type="button" 
                  className="w-full sm:w-auto px-6 py-3 bg-gray-600 hover:bg-gray-500 text-gray-200 rounded-lg font-semibold transition-colors duration-200 disabled:opacity-70"
                  onClick={onClose} 
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
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 border-2 border-pink-100 flex flex-col gap-3 min-w-[350px] max-w-[90vw]">
        <h2 className="text-lg font-bold text-pink-700 mb-2">Request: {offering.title}</h2>
        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <input name="name" value={form.name} onChange={handleChange} placeholder="Your Name" className="border rounded px-2 py-1" required />
          <input name="contact" value={form.contact} onChange={handleChange} placeholder="Contact (email/phone)" className="border rounded px-2 py-1" required />
          <textarea name="message" value={form.message} onChange={handleChange} placeholder="Message (optional)" className="border rounded px-2 py-1 min-h-[40px]" />
          <div className="flex gap-2 mt-2">
            <button type="submit" className="px-3 py-1 bg-pink-500 text-white rounded" disabled={loading}>Send Request</button>
            <button type="button" className="px-3 py-1 bg-gray-200 rounded" onClick={onClose} disabled={loading}>Cancel</button>
          </div>
          {success && <div className="text-green-600 text-sm mt-1">Request sent! Ananya will contact you soon.</div>}
          {error && <div className="text-red-600 text-sm mt-1">{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default RequestOfferingModal;
