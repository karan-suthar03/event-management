import React, { useState } from 'react';
import { HiChevronLeft, HiChevronRight, HiXMark } from 'react-icons/hi2';
import apiService from "../utils/apiService";

const SimpleImageGallery = ({ 
  images = [], 
  altText = "Gallery image", 
  className = "" 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className={`bg-slate-700 rounded-xl border border-slate-600 aspect-video flex items-center justify-center ${className}`}>
        <p className="text-slate-400">No images available</p>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  const prevImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const openLightbox = () => {
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = 'auto';
  };

  return (
    <div className={`simple-image-gallery ${className}`}>
      <div className="relative overflow-hidden rounded-xl border-2 border-slate-700 hover:border-sky-500 transition-all duration-300">
        <div 
          className="w-full aspect-video bg-slate-800 overflow-hidden cursor-pointer"
          onClick={openLightbox}
        >
          <img
            src={apiService.getImageSrc(images[currentIndex])}
            alt={`${altText} ${currentIndex + 1}`}
            className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
            onError={(e) => { 
              e.target.src = '/vite.svg';
              e.target.classList.add('p-6', 'object-contain', 'bg-slate-700'); 
            }}
          />
        </div>
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-sky-600/70 p-2 rounded-full text-white transition-colors"
              aria-label="Previous image"
            >
              <HiChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-sky-600/70 p-2 rounded-full text-white transition-colors"
              aria-label="Next image"
            >
              <HiChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="mt-2 text-center text-sm text-slate-400">
          {currentIndex + 1} of {images.length}
        </div>
      )}
      {lightboxOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <div className="relative max-w-full max-h-full" onClick={e => e.stopPropagation()}>
            <button 
              onClick={closeLightbox}
              className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-red-600 p-2 rounded-full text-white transition-colors"
              aria-label="Close"
            >
              <HiXMark className="w-6 h-6" />
            </button>
            <img
              src={apiService.getImageSrc(images[currentIndex])}
              alt={`${altText} ${currentIndex + 1}`}
              className="max-h-[90vh] max-w-[90vw] object-contain"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-sky-600/70 p-3 rounded-full text-white transition-colors"
                  aria-label="Previous"
                >
                  <HiChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-sky-600/70 p-3 rounded-full text-white transition-colors"
                  aria-label="Next"
                >
                  <HiChevronRight className="w-6 h-6" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/70 rounded-full text-white text-sm">
                  {currentIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleImageGallery;