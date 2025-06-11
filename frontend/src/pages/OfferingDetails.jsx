import React, {useEffect, useState} from "react";
import {Link, useNavigate, useParams} from "react-router-dom";
import {HiOutlineSparkles, HiStar} from "react-icons/hi2";
import RequestOfferingModal from "../components/RequestOfferingModal";
import SimpleImageGallery from "../components/SimpleImageGallery";
import apiService from "../utils/apiService";

const OfferingDetails = ({globalDiscount = 0}) => {
    const {offeringId} = useParams();
    const navigate = useNavigate();
    const [offering, setOffering] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showRequestModal, setShowRequestModal] = useState(false);

    useEffect(() => {
        const fetchOffering = async () => {
            setLoading(true);
            setError("");
            try {
                const data = await apiService.get(`/api/offerings/${offeringId}`);
                if (!data) {
                    throw new Error("Offering not found");
                }
                let inclusions = data.inclusions;
                if (typeof inclusions === "string") {
                    inclusions = inclusions.split(";").map(s => s.trim()).filter(Boolean);
                }
                const images = [];
                if (data.decorationImageUrl) {
                    images.push({
                        url: data.decorationImageUrl.startsWith("/uploads/")
                            ? `${apiService.baseURL || ''}${data.decorationImageUrl}`
                            : data.decorationImageUrl
                    });
                }
                if (Array.isArray(data.images) && data.images.length > 0) {
                    data.images.forEach(img => {
                        let imgUrl = apiService.getImageSrc(img);
                        if (imgUrl && !images.some(existing => existing.url === imgUrl)) {
                            images.push({url: imgUrl});
                        }
                    });
                }
                setOffering({...data, inclusions, images});
            } catch (e) {
                setError("Offering not found");
            }
            setLoading(false);
        };
        fetchOffering();
    }, [offeringId]);

    const isGlobalDiscount = offering && offering.discountType && offering.discountType.toLowerCase() === 'global';
    const isSpecialDiscount = offering && offering.discountType && offering.discountType.toLowerCase() === 'special' && offering.specificDiscountedPrice && offering.specificDiscountedPrice < offering.approximatePrice;
    let displayPrice = offering ? offering.approximatePrice : 0;
    let discountBanner = null;
    let originalPrice = null;
    if (isSpecialDiscount) {
        displayPrice = offering.specificDiscountedPrice;
        const percent = Math.round(100 - (offering.specificDiscountedPrice / offering.approximatePrice) * 100);
        discountBanner = (
            <div className="w-full text-center mb-2">
        <span className="inline-block bg-pink-700 text-pink-100 px-3 py-1 rounded-full font-bold text-xs shadow">
          {percent}% OFF
        </span>
            </div>
        );
        originalPrice = (
            <span className="line-through text-slate-400 text-xs ml-2">₹{offering.approximatePrice}</span>
        );
    } else if (isGlobalDiscount && globalDiscount > 0) {
        displayPrice = Math.round(offering.approximatePrice * (1 - globalDiscount / 100));
        discountBanner = (
            <div className="w-full text-center mb-2">
        <span className="inline-block bg-sky-700 text-sky-100 px-3 py-1 rounded-full font-bold text-xs shadow">
          {globalDiscount}% OFF
        </span>
            </div>
        );
        originalPrice = (
            <span className="line-through text-slate-400 text-xs ml-2">₹{offering.approximatePrice}</span>
        );
    }

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-sky-400 text-xl">Loading
            package...</div>;
    }
    if (error || !offering) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <h2 className="text-3xl font-bold text-red-400 mb-4">Offering Not Found</h2>
                <button onClick={() => navigate('/offerings')}
                        className="interactive-element px-6 py-2 bg-sky-600 text-white rounded-full font-bold shadow hover:bg-sky-700 transition-all">Back
                    to All Offerings
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
            <div
                className="w-full max-w-4xl mx-auto bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-6 md:p-10 mt-8">
                <button
                    className="mb-6 text-sky-400 hover:underline font-bold flex items-center gap-2"
                    onClick={() => navigate('/offerings')}
                >
                    <span aria-hidden>←</span> Back to All Offerings
                </button>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-1 space-y-6">
                        <div className="relative">
                            {offering.images && offering.images.length > 0 ? (
                                <>
                                    <SimpleImageGallery
                                        images={offering.images}
                                        altText={offering.title}
                                    />
                                    {offering.images.length > 1 && (
                                        <div className="mt-2 flex justify-end">
                                            <Link
                                                to={`/offerings/${offering.id}/gallery`}
                                                className="text-sm font-medium text-sky-400 hover:text-sky-300 transition-colors"
                                            >
                                                View all {offering.images.length} photos →
                                            </Link>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div
                                    className="w-full h-56 flex items-center justify-center bg-slate-800 rounded-xl border border-slate-700">
                                    <p className="text-slate-400">No image available</p>
                                </div>
                            )}
                            {offering.bestSeller && (
                                <span
                                    className="absolute top-2 right-2 px-3 py-1 text-xs font-bold rounded-full shadow bg-sky-500 text-sky-100 z-10">Best Seller</span>
                            )}
                        </div>
                        <div className="bg-slate-900 p-5 rounded-xl shadow border border-slate-700 space-y-2">
                            <div className="flex items-center space-x-2">
                                <span className="text-2xl">{offering.mainCategory?.emoji || "🎁"}</span>
                                <span
                                    className="text-lg font-semibold text-sky-400">{offering.mainCategory?.name || "Package"}</span>
                            </div>
                            {discountBanner}
                            <div className="text-sky-300 font-bold text-xl">₹{displayPrice} {originalPrice}</div>
                            {offering.categories && offering.categories.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {offering.categories.map(cat => (
                                        <span key={cat.id}
                                              className="bg-yellow-50 text-yellow-700 text-xs font-bold px-2 py-0.5 rounded-full border border-yellow-200 flex items-center gap-1">
                      <span>{cat.emoji}</span> {cat.name}
                    </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="md:col-span-2 flex flex-col gap-8">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-sky-300 mb-3 leading-tight">{offering.title}</h1>
                            <p className="text-lg whitespace-pre-line mb-6 text-gray-300">{offering.description}</p>
                        </div>
                        {offering.inclusions && offering.inclusions.length > 0 && (
                            <div className="bg-slate-700/50 p-6 rounded-lg border border-slate-600">
                                <h3 className="text-xl font-semibold text-sky-400 mb-3 flex items-center">
                                    <HiStar className="h-6 w-6 mr-2 text-yellow-400"/>
                                    What's Included
                                </h3>
                                <ul className="list-none space-y-2 pl-1">
                                    {offering.inclusions.map((item, idx) => (
                                        <li key={idx} className="flex items-start">
                                            <span className="text-yellow-400 mr-2 mt-1">◆</span>
                                            <span className="text-gray-300">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <div
                            className="flex flex-wrap gap-4 pt-4 items-center justify-start border-t border-slate-700 mt-8">
                            <button
                                onClick={() => setShowRequestModal(true)}
                                className="interactive-element flex items-center px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300 border border-sky-500 hover:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50"
                            >
                                <HiOutlineSparkles className="h-5 w-5 mr-2"/>
                                Request This Package
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {showRequestModal && (
                <RequestOfferingModal offering={offering} modern={true} onClose={() => setShowRequestModal(false)}/>
            )}
        </div>
    );
};

export default OfferingDetails;
