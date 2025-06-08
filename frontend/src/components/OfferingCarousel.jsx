import React, { useState, useRef, useEffect } from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import PublicOfferingCard from "./PublicOfferingCard";

const OfferingCarousel = ({ offerings, globalDiscount = 0 }) => {
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  useEffect(() => {
    if (!scrollContainerRef.current) return;
    const checkScrollPosition = () => {
      const container = scrollContainerRef.current;
      setShowLeftArrow(container.scrollLeft > 20);
      setShowRightArrow(container.scrollLeft + container.clientWidth < container.scrollWidth - 20);
    };
    checkScrollPosition();
    const container = scrollContainerRef.current;
    container.addEventListener('scroll', checkScrollPosition);
    return () => {
      container.removeEventListener('scroll', checkScrollPosition);
    };
  }, [offerings]);
  const scrollLeft = () => {
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
  };
  const scrollRight = () => {
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
  };
  if (!offerings || offerings.length === 0) {
    return null;
  }
  return (
    <div className="relative group">
      {showLeftArrow && (
        <button 
          onClick={scrollLeft}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 p-2 rounded-full bg-slate-800/80 text-white shadow-lg hover:bg-slate-700 transition-all opacity-70 hover:opacity-100"
          aria-label="Scroll left"
        >
          <HiChevronLeft className="w-8 h-8" />
        </button>
      )}
      {showRightArrow && (
        <button 
          onClick={scrollRight}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 p-2 rounded-full bg-slate-800/80 text-white shadow-lg hover:bg-slate-700 transition-all opacity-70 hover:opacity-100"
          aria-label="Scroll right"
        >
          <HiChevronRight className="w-8 h-8" />
        </button>
      )}
      <div 
        ref={scrollContainerRef}
        className="flex overflow-x-auto snap-x pb-4 scrollbar-hide hide-scrollbar" 
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {offerings.map(offering => (
          <div 
            key={offering.id} 
            className="flex-none snap-start px-2 w-80 md:w-96"
          >
            <PublicOfferingCard 
              offering={offering} 
              globalDiscount={globalDiscount} 
              modern={true} 
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default OfferingCarousel;
