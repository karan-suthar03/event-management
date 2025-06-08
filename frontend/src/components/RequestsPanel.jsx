import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlineBell, HiCheckCircle, HiTrash } from "react-icons/hi2";
import apiService from "../utils/apiService";
import authService from "../utils/authService";

const RequestsPanel = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchRequests();
    }, []);    const fetchRequests = async () => {
        setLoading(true);
        try {
            const data = await apiService.get("/api/event-requests", true);
            setRequests(data);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch requests:", err);
            setError("Failed to load requests. Please try again.");
            if (err.message === "Unauthorized") {
                navigate("/login");
            }
        } finally {
            setLoading(false);
        }
    };    const handleMarkViewed = async (id) => {
        try {
            await apiService.put(`/api/event-requests/${id}/viewed`, {}, true);
            setRequests(requests.map(req => 
                req.id === id ? { ...req, viewed: true } : req
            ));
        } catch (err) {
            console.error("Failed to mark request as viewed:", err);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this request?")) return;
        try {
            await apiService.delete(`/api/event-requests/${id}`, true);
            setRequests(requests.filter(req => req.id !== id));
        } catch (err) {
            console.error("Failed to delete request:", err);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Unknown date";
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                <p>{error}</p>
                <button 
                    onClick={fetchRequests} 
                    className="mt-2 text-sm underline hover:no-underline"
                >
                    Try again
                </button>
            </div>
        );
    }

    return (
        <div className="rounded-lg bg-slate-800 border border-slate-700 shadow-lg p-6 mt-6">
            <h2 className="text-2xl font-bold mb-6 text-purple-400 flex items-center">
                <HiOutlineBell className="mr-2" />
                Customer Requests
            </h2>

            {requests.length === 0 ? (
                <div className="bg-slate-700 rounded-lg p-6 text-center text-gray-400">
                    No requests found.
                </div>
            ) : (
                <div className="space-y-4">
                    {requests.map((request) => (
                        <div 
                            key={request.id} 
                            className={`relative rounded-lg p-4 ${request.viewed ? 'bg-slate-700' : 'bg-slate-700/80 border-l-4 border-purple-500'} transition-all duration-300`}
                        >
                            <div className="flex justify-between flex-wrap gap-2">                                <div>
                                    <h3 className="font-bold text-lg text-white">
                                        {request.name}
                                    </h3>
                                    <p className="text-gray-300">
                                        <span className="font-medium">Email:</span> {request.email}
                                    </p>
                                    {request.phone && (
                                        <p className="text-gray-300">
                                            <span className="font-medium">Phone:</span> {request.phone}
                                        </p>
                                    )}
                                    <p className="text-gray-300 mt-1">
                                        <span className="font-medium">Request Type:</span> {request.requestType?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Event Request'}
                                    </p>
                                    {request.eventTitle && (
                                        <p className="text-gray-300">
                                            <span className="font-medium">Related Event:</span> {request.eventTitle}
                                        </p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    {!request.viewed && (
                                        <button
                                            onClick={() => handleMarkViewed(request.id)}
                                            className="p-2 rounded-md bg-green-900/50 hover:bg-green-800 text-green-400 transition"
                                            title="Mark as viewed"
                                        >
                                            <HiCheckCircle className="w-5 h-5" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(request.id)}
                                        className="p-2 rounded-md bg-red-900/50 hover:bg-red-800 text-red-400 transition"
                                        title="Delete request"
                                    >
                                        <HiTrash className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            <div className="mt-3 text-gray-300 bg-slate-800/50 p-3 rounded-md">
                                {request.message || <span className="italic text-gray-400">No message provided</span>}
                            </div>
                            <div className="text-xs text-gray-400 mt-3">
                                {formatDate(request.requestDate)}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RequestsPanel;
