import React, {useState} from "react";
import {HiArrowLeft, HiOutlineDocumentText, HiOutlineSparkles, HiStar} from "react-icons/hi2";
import SimpleImageGallery from "./SimpleImageGallery";
import RequestSimilarEventModal from "./RequestSimilarEventModal";

const EventDetailsLayout = ({event, onBack, onRequest, controls}) => {
    const [showRequestModal, setShowRequestModal] = useState(false);
    if (!event) return null;
    const handleRequestClick = () => {
        if (typeof onRequest === 'function') {
            onRequest();
        } else if (onRequest) {
            setShowRequestModal(true);
        }
    };
    return (
        <div className="w-full max-w-6xl mx-auto mt-8 font-sans">
            {controls && (
                <div className="mb-6 p-4 bg-slate-700 rounded-lg shadow-md">
                    {controls}
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-6">
                    <div className="relative">
                        <SimpleImageGallery
                            images={event.images || []}
                            altText={event.title}
                        />
                    </div>
                    <div className="bg-slate-800 p-6 rounded-xl shadow-lg space-y-3 border border-slate-700">
                        <div className="flex items-center space-x-3">
                            <span className="text-3xl">{event.category?.emoji || "🎉"}</span>
                            <h2 className="text-xl font-semibold text-sky-400">{event.category?.name || "Event Category"}</h2>
                        </div>
                        <p className="text-slate-400"><span
                            className="font-semibold text-slate-300">Date:</span> {event.date}</p>
                        {event.location && <p className="text-slate-400"><span
                            className="font-semibold text-slate-300">Location:</span> {event.location}</p>}
                        {event.best && <span
                            className="inline-block mt-2 px-3 py-1 bg-sky-500 text-sky-100 rounded-full font-bold text-xs shadow">Featured Event</span>}
                    </div>
                </div>
                <div className="md:col-span-2 space-y-8">
                    <div className="bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-700">
                        <h1 className="text-4xl md:text-5xl font-bold text-sky-300 mb-4 leading-tight">{event.title}</h1>
                        <p className="text-lg whitespace-pre-line mb-6 text-gray-300">{event.description}</p>
                        {event.highlights && (Array.isArray(event.highlights) ? event.highlights.length > 0 : event.highlights.trim().length > 0) && (
                            <div className="mt-6 bg-slate-700/50 p-6 rounded-lg border border-slate-600">
                                <h3 className="text-2xl font-semibold text-sky-400 mb-3 flex items-center">
                                    <HiStar className="h-6 w-6 mr-2 text-yellow-400"/>
                                    Event Highlights
                                </h3>
                                <ul className="list-none space-y-2 pl-1">
                                    {(Array.isArray(event.highlights)
                                            ? event.highlights
                                            : event.highlights.split(',').map(h => h.trim()).filter(Boolean)
                                    ).map((item, idx) => (
                                        <li key={idx} className="flex items-start">
                                            <span className="text-yellow-400 mr-2 mt-1">◆</span>
                                            <span className="text-gray-300">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                    {Array.isArray(event.descriptions) && event.descriptions.length > 0 && (
                        <div className="space-y-6">
                            {event.descriptions.map((desc, idx) => (
                                <div key={idx}
                                     className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
                                    {desc.title &&
                                        <h3 className="text-2xl font-semibold text-sky-400 mb-3 flex items-center">
                                            <HiOutlineDocumentText className="mr-2 text-xl"/> {desc.title}</h3>}
                                    <div
                                        className="text-gray-300 whitespace-pre-line prose prose-sm prose-invert max-w-none">{desc.description}</div>
                                </div>
                            ))}
                        </div>
                    )}
                    {event.organizerNotes && (
                        <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
                            <h3 className="text-2xl font-semibold text-sky-400 mb-3 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none"
                                     viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                </svg>
                                Organizer's Notes
                            </h3>
                            <p className="text-gray-400 italic whitespace-pre-line">{event.organizerNotes}</p>
                        </div>
                    )}
                    <div
                        className="flex flex-wrap gap-4 pt-4 items-center justify-start border-t border-slate-700 mt-8">
                        {onBack && <button
                            onClick={onBack}
                            className="interactive-element flex items-center px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50">
                            <HiArrowLeft className="h-5 w-5 mr-2"/>
                            Back to Events
                        </button>}
                        {onRequest &&
                            <button
                                onClick={handleRequestClick}
                                className="interactive-element flex items-center px-6 py-3 bg-slate-700 hover:bg-slate-600 text-sky-300 font-semibold rounded-lg shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50 ml-3">
                                <HiOutlineSparkles className="h-5 w-5 mr-2"/>
                                Request Similar Event
                            </button>}
                    </div>
                </div>
            </div>
            {showRequestModal && (
                <RequestSimilarEventModal
                    event={event}
                    onClose={() => setShowRequestModal(false)}
                />
            )}
        </div>
    );
};

export default EventDetailsLayout;
