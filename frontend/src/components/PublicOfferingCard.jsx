import React from "react";
import { Link } from "react-router-dom";
import apiService from "../utils/apiService";

const PublicOfferingCard = ({ offering, modern = false, globalDiscount }) => {
  const cardBaseClass = "border shadow-lg flex flex-col h-full";
  const modernCardSpecificClass = modern ? "bg-slate-800 border-slate-700 rounded-xl max-h-[520px]" : "bg-white border-pink-200 rounded-2xl max-h-[500px]";

  let displayPrice = offering.approximatePrice;
  let discountBanner = null;
  const isGlobalDiscount = offering.discountType && offering.discountType.toLowerCase() === 'global';
  const isSpecialDiscount = offering.discountType && offering.discountType.toLowerCase() === 'special' && offering.specificDiscountedPrice && offering.specificDiscountedPrice < offering.approximatePrice;

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
  } else if (isGlobalDiscount && globalDiscount > 0) {
    const discounted = Math.round(offering.approximatePrice * (1 - globalDiscount / 100));
    discountBanner = (
      <div className="w-full text-center mb-2">
        <span className="inline-block bg-sky-700 text-sky-100 px-3 py-1 rounded-full font-bold text-xs shadow">
          {globalDiscount}% OFF
        </span>
      </div>
    );
    displayPrice = discounted;
  }

  return (
    <div className={`${cardBaseClass} ${modernCardSpecificClass}`}>
      <div className="relative">
        <div className="h-40 w-full overflow-hidden rounded-t-xl">        
          <img 
            src={apiService.getImageSrc(offering.decorationImageUrl)} 
            alt={offering.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => { e.target.src = '/vite.svg'; e.target.classList.add('p-6', 'object-contain', 'bg-gray-700'); }} 
          />
        </div>
        {offering.bestSeller && (
          <span className={`absolute top-2 right-2 px-2.5 py-1 text-xs font-bold rounded-full shadow-md ${modern ? 'bg-sky-500 text-sky-100' : 'bg-yellow-300 text-yellow-800'}`}>
            Best Seller
          </span>
        )}
      </div>
      <div className={`p-4 flex flex-col flex-grow ${modern ? 'text-slate-300' : ''} overflow-y-auto`}>
        {discountBanner}
        <h3 className={`text-lg font-bold mb-2 ${modern ? 'text-sky-400' : 'text-pink-700'}`}>{offering.title}</h3>
        {offering.description && <p className={`text-xs mb-2 ${modern ? 'text-slate-400' : 'text-gray-600'} flex-shrink-0`}>{offering.description}</p>}
        <div className={`text-sm font-semibold mb-1 ${modern ? 'text-sky-300' : 'text-pink-600'} flex-shrink-0`}>Approx. Price: ₹{displayPrice}
          {(isGlobalDiscount && globalDiscount > 0 || isSpecialDiscount) && (
            <span className="line-through text-slate-400 text-xs ml-2">₹{offering.approximatePrice}</span>
          )}
        </div>
        
        {offering.categories && offering.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {offering.categories.map(cat => (
              <span key={cat.id} className="bg-yellow-50 text-yellow-700 text-xs font-bold px-2 py-0.5 rounded-full border border-yellow-200 flex items-center gap-1">
                <span>{cat.emoji}</span> {cat.name}
              </span>
            ))}
          </div>
        )}
        
        {Array.isArray(offering.inclusions) && offering.inclusions.length > 0 && (
          <div className="mt-auto pt-2 border-t ${modern ? 'border-slate-700' : 'border-pink-100'}">
            <h4 className={`text-sm font-semibold my-2 ${modern ? 'text-slate-300' : 'text-pink-600'}`}>What's Included:</h4>
            <div className="flex flex-wrap gap-2">
              {offering.inclusions.map((inclusion, index) => {
                const isLongInclusion = inclusion.length > 22;
                return (
                  <span 
                    key={index} 
                    className={`px-3 py-1 text-xs flex-shrink-0 ${isLongInclusion ? (modern ? 'rounded-lg' : 'rounded-md') : 'rounded-full'} ${modern ? 'bg-sky-600 text-sky-100' : 'bg-pink-100 text-pink-700'}`}
                  >
                    {inclusion}
                  </span>
                );
              })}
              {offering.inclusions.length > 3 && (
                <span className="bg-slate-600 text-slate-400 text-xxs px-2 py-0.5 rounded-full">
                  +{offering.inclusions.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
      <div className={`p-4 mt-auto border-t ${modern ? 'border-slate-700' : 'border-pink-100'} flex-shrink-0`}>
        <Link 
          to={`/offerings/${offering.id}`}
          className={`w-full block text-center px-4 py-2 font-bold rounded-lg transition-colors duration-200 text-sm ${modern ? 'bg-sky-600 hover:bg-sky-700 text-white' : 'bg-pink-400 hover:bg-pink-500 text-white'}`}
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default PublicOfferingCard;
