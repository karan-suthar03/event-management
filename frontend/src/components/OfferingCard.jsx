import React, { useState } from "react";
import apiService from "../utils/apiService";

const OfferingCard = ({ offering, onDelete, onEdit, globalDiscount = 0, showActions = true }) => {
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
    <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-lg p-5 flex flex-col items-center gap-3 w-72 hover:shadow-sky-500/20 transition-shadow duration-300 max-h-[480px]">
      <img
        src={apiService.getImageSrc(offering.decorationImageUrl)}
        alt={offering.title}
        className="w-full h-48 object-cover rounded-lg border-2 border-slate-700 bg-slate-700 mb-2 shadow-md flex-shrink-0"
        onError={e => (e.target.src = '/vite.svg')}
      />
      <div className="flex flex-col items-center gap-2 overflow-y-auto w-full px-1 flex-grow">
        <h3 className="text-xl font-semibold text-sky-400 mb-1 text-center truncate w-full flex-shrink-0" title={offering.title}>{offering.title}</h3>
        <div className="text-sky-300 font-bold text-lg mb-1 flex-shrink-0">₹{displayPrice}
          {(isGlobalDiscount && globalDiscount > 0 || isSpecialDiscount) && (
            <span className="line-through text-slate-400 text-xs ml-2">₹{offering.approximatePrice}</span>
          )}
        </div>
        {offering.description && <p className="text-slate-400 text-sm mb-2 text-center ">{offering.description}</p>}
        {discountBanner}
      </div>
      {showActions && (
        <div className="flex gap-3 mt-auto pt-3 border-t border-slate-700 w-full justify-around flex-shrink-0">
          <button 
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-md text-xs font-bold transition-colors duration-200 w-1/2"
            onClick={() => onEdit && onEdit(offering)}
          >
            Edit
          </button>
          <button 
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-bold transition-colors duration-200 w-1/2"
            onClick={() => onDelete && onDelete(offering.id)}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default OfferingCard;
