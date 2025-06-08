import React, { useState } from 'react';
import { HiChevronLeft, HiChevronRight, HiXMark } from 'react-icons/hi2';
import apiService from "../utils/apiService";

const ImageGallery = ({ 
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

  const getImageCaption = (img) => {
    if (!img || typeof img === 'string') return '';
    return img.caption || img.description || '';
  };

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const openLightbox = () => {
    if (enableLightbox) {
      setLightboxOpen(true);
      document.body.style.overflow = 'hidden';
    }
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = 'auto';
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const imageUrl = apiService.getImageSrc(images[currentIndex]);
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      const fileName = imageUrl.split('/').pop() || `${altText.replace(/\s+/g, '-')}-${currentIndex + 1}.jpg`;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading image:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    const imageUrl = getImageSrc(images[currentIndex]);
    const title = `${altText} ${currentIndex + 1}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Check out this image: ${title}`,
          url: imageUrl,
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error("Error sharing:", error);
          copyToClipboard(imageUrl);
        }
      }
    } else {
      copyToClipboard(imageUrl);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert("Image URL copied to clipboard!");
      })
      .catch(err => {
        console.error("Failed to copy URL:", err);
      });
  };
  
  useSwipe({
    onSwipeLeft: (e) => {
      if (lightboxOpen && images.length > 1) {
        e.stopPropagation();
        setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
      }
    },
    onSwipeRight: (e) => {
      if (lightboxOpen && images.length > 1) {
        e.stopPropagation();
        setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
      }
    },    onSwipeDown: (e) => {
      if (lightboxOpen) {
        e.stopPropagation();
        closeLightbox();
      }
    },
    element: document
  });
  
  useEffect(() => {
    if (lightboxOpen) {
      const handleKeyDown = (e) => {
        if (e.key === 'ArrowRight') {
          nextImage(e);
        } else if (e.key === 'ArrowLeft') {
          prevImage(e);
        } else if (e.key === 'Escape') {
          closeLightbox();
        }
      };
      
      window.addEventListener('keydown', handleKeyDown);
      
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [lightboxOpen]);
  
  return (
    <div className={`image-gallery ${className}`}>
      <div className="relative overflow-hidden rounded-xl border-2 border-slate-700 hover:border-sky-500 transition-all duration-300">        <div 
          className="w-full aspect-video bg-slate-800 overflow-hidden cursor-pointer"
          onClick={openLightbox}
        >          <LazyImage
            src={getImageSrc(images[currentIndex])}
            alt={`${altText} ${currentIndex + 1}`}
            className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
            placeholderSrc="/vite.svg"
            onError={(e) => { 
              e.target.classList.add('p-6', 'object-contain', 'bg-slate-700'); 
            }}
          />
          {enableLightbox && (
            <div className="absolute top-3 right-3 bg-black/50 p-2 rounded-full hover:bg-sky-600/70 transition-colors">
              <HiMagnifyingGlassPlus className="w-5 h-5 text-white" />
            </div>
          )}
        </div>
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-sky-600/70 p-2 rounded-full text-white transition-colors"
              aria-label="Previous image"
            >
              <HiChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-sky-600/70 p-2 rounded-full text-white transition-colors"
              aria-label="Next image"
            >
              <HiChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>
      {showThumbnails && images.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2 hide-scrollbar">
          {images.map((img, idx) => (            <div
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`relative rounded-md overflow-hidden cursor-pointer border-2 transition-all duration-300 aspect-square ${
                idx === currentIndex 
                  ? "border-sky-500 ring-2 ring-sky-400 scale-[0.95]" 
                  : "border-slate-700 hover:border-sky-400 opacity-70 hover:opacity-100"
              }`}
            >
              <LazyImage
                src={apiService.getImageSrc(img)}
                alt={`${altText} thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
                placeholderSrc="/vite.svg"
              />
            </div>
          ))}
        </div>
      )}
      {lightboxOpen && (
        <div 
          ref={lightboxRef}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 md:p-10"
          onClick={closeLightbox}
        >
          <div className="relative w-full max-w-6xl h-full max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <button 
              onClick={closeLightbox}
              className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-red-600 p-2 rounded-full text-white transition-colors"
              aria-label="Close lightbox"
            >
              <HiXMark className="w-6 h-6" />
            </button>
            <div className="relative h-full flex items-center justify-center">              
              <img
                src={apiService.getImageSrc(images[currentIndex])}
                alt={`${altText} ${currentIndex + 1} (fullscreen)`}
                className="max-h-full max-w-full object-contain"
              />
              {showCaptions && getImageCaption(images[currentIndex]) && (
                <div className="absolute left-0 right-0 bottom-0 bg-black/60 text-white p-4 text-center">
                  <p className="text-sm md:text-base font-medium">{getImageCaption(images[currentIndex])}</p>
                </div>
              )}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-sky-600/70 p-3 rounded-full text-white transition-colors"
                    aria-label="Previous image"
                  >
                    <HiChevronLeft className="w-8 h-8" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-sky-600/70 p-3 rounded-full text-white transition-colors"
                    aria-label="Next image"
                  >
                    <HiChevronRight className="w-8 h-8" />
                  </button>
                </>
              )}
            </div>
            <div className="absolute bottom-20 right-4 flex flex-col gap-2">
              {enableDownload && (
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className={`bg-black/50 hover:bg-sky-600/70 p-3 rounded-full text-white transition-colors flex items-center justify-center ${isDownloading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  aria-label="Download image"
                  title="Download image"
                >
                  {isDownloading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <HiArrowDownTray className="w-5 h-5" />
                  )}
                </button>
              )}
              {enableSharing && (
                <button
                  onClick={handleShare}
                  className="bg-black/50 hover:bg-sky-600/70 p-3 rounded-full text-white transition-colors"
                  aria-label="Share image"
                  title="Share image"
                >
                  <HiShare className="w-5 h-5" />
                </button>
              )}
            </div>
            <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/70 rounded-full text-white text-sm">
              {currentIndex + 1} / {images.length}
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 max-w-lg overflow-x-auto flex gap-2 px-2 py-2 bg-black/50 rounded-lg hide-scrollbar">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`relative rounded-md overflow-hidden cursor-pointer border-2 transition-all w-16 h-16 flex-shrink-0 ${
                    idx === currentIndex 
                      ? "border-sky-500 ring-2 ring-sky-400" 
                      : "border-slate-700 hover:border-sky-400 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={apiService.getImageSrc(img)}
                    alt={`${altText} thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
