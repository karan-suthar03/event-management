import React, {useMemo} from "react";
import {Link} from "react-router-dom";
import {FaStar} from "react-icons/fa";
import {HiOutlineCalendar} from "react-icons/hi";
import apiService from "../utils/apiService";

const EventCard = ({event}) => {
    if (!event) return null;

    const imageSource = useMemo(() => {
        const firstImage = event.images?.[0];
        return apiService.getImageSrc(firstImage);
    }, [event.images]);

    const formattedDate = useMemo(() => {
        return event.date
            ? new Date(event.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
            : "Date TBD";
    }, [event.date]);

    const description = useMemo(() => {
        return event.description ||
            (Array.isArray(event.descriptions) && event.descriptions[0]?.description) ||
            "No description available.";
    }, [event.description, event.descriptions]);

    return (
        <div
            className="bg-slate-800 rounded-xl shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-purple-500/40 hover:transform hover:-translate-y-1 flex flex-col h-full">
            <div className="relative">
                <img
                    src={imageSource}
                    alt={event.title || "Event image"}
                    className="w-full h-56 object-cover"
                />
                {event.featured && (
                    <div
                        className="absolute top-3 right-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                        <FaStar className="w-4 h-4"/>
                        <span>Featured</span>
                    </div>
                )}
            </div>
            <div className="p-5 flex flex-col flex-grow">
                <h2 className="text-xl font-bold mb-2">
          <span
              className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 hover:opacity-80 transition-opacity">
            {event.title || "Untitled Event"}
          </span>
                </h2>
                <div className="text-xs text-gray-400 mb-1 flex items-center">
                    <HiOutlineCalendar className="h-4 w-4 mr-1.5 text-purple-400"/>
                    <span>{formattedDate}</span>
                </div>
                {event.location && (
                    <div className="text-xs text-gray-400 mb-3 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-pink-400" fill="none"
                             viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                        <span>{event.location}</span>
                    </div>
                )}
                <p className="text-gray-300 text-sm leading-relaxed mb-4 line-clamp-3 flex-grow">
                    {description}
                </p>
                <div className="mt-auto">
                    <Link
                        to={`/events/${event.id}`}
                        className="inline-block w-full text-center px-6 py-2.5 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-sm"
                    >
                        View Details
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default EventCard;
