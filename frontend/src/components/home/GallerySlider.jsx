import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Camera } from "lucide-react";

/* ---------- Helper ---------- */
const formatUploadDate = (value) => {
  if (!value) return "Captured moment";
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Captured moment";
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "Captured moment";
  }
};

/* ---------- Card ---------- */
const GalleryCard = ({ image, containerRef }) => {
  const cardRef = useRef(null);
  const [rotateY, setRotateY] = useState(0);
  const [scale, setScale] = useState(0.9);
  const [zIndex, setZIndex] = useState(1);

  useEffect(() => {
    const update3DEffect = () => {
      if (!cardRef.current || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const cardRect = cardRef.current.getBoundingClientRect();

      const containerCenter = containerRect.left + containerRect.width / 2;
      const cardCenter = cardRect.left + cardRect.width / 2;

      // Distance from center determines the 3D tilt and scale
      const distance = (cardCenter - containerCenter) / (containerRect.width / 2);
      const absDistance = Math.abs(distance);

      setRotateY(distance * -30);
      setScale(1.1 - absDistance * 0.2);
      setZIndex(Math.round(100 - absDistance * 100));
    };

    const container = containerRef.current;
    container.addEventListener("scroll", update3DEffect);
    window.addEventListener("resize", update3DEffect);
    update3DEffect(); // Initial call

    return () => {
      container.removeEventListener("scroll", update3DEffect);
      window.removeEventListener("resize", update3DEffect);
    };
  }, [containerRef]);

  return (
    <div
      ref={cardRef}
      // ADDED: snap-always forces the scroll to stop exactly at this item
      className="snap-center snap-always shrink-0 w-full md:w-1/3 flex items-center justify-center py-16"
      style={{ zIndex }}
    >
      <motion.div
        animate={{ rotateY, scale }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        className="relative w-[85%] aspect-square rounded-2xl overflow-hidden bg-slate-900 shadow-xl border border-white/10"
        style={{ transformStyle: "preserve-3d" }}
      >
        {image.imageUrl ? (
          <img
            src={image.imageUrl}
            alt={image.folderName || "Gallery"}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full bg-slate-800 text-slate-500">
            <Camera size={40} />
            <span className="text-xs mt-2">No Preview</span>
          </div>
        )}

        <motion.div
          animate={{ opacity: scale > 1 ? 1 : 0 }}
          className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 to-transparent text-white"
        >
          <h3 className="font-semibold text-sm truncate">
            {image.folderName || "Snapshot"}
          </h3>
          <p className="text-[10px] opacity-60 mt-1">
            {formatUploadDate(image.uploadedAt)}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

/* ---------- Slider ---------- */
const GallerySlider = ({ images = [] }) => {
  const sliderRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Sync state with manual scrolling
  const handleScroll = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

      // Calculate which card is currently active (closest to center/left)
      const cardWidth = sliderRef.current.children[0]?.offsetWidth || 1;
      const index = Math.round(scrollLeft / cardWidth);
      setActiveIndex(Math.min(Math.max(index, 0), images.length - 1));
    }
  };

  useEffect(() => {
    const slider = sliderRef.current;
    if (slider) {
      slider.addEventListener("scroll", handleScroll);
      handleScroll(); // Initial check
    }
    return () => slider?.removeEventListener("scroll", handleScroll);
  }, [images]);

  // Unified scroll function for arrows, dots, and autoplay
  const scrollToIndex = (index) => {
    if (sliderRef.current) {
      const cardWidth = sliderRef.current.children[0]?.offsetWidth || 0;
      sliderRef.current.scrollTo({
        left: index * cardWidth,
        behavior: "smooth",
      });
    }
  };

  // Autoplay functionality (Changes picture every 3 seconds)
  useEffect(() => {
    if (!images.length || isHovered) return;

    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => {
        let nextIndex = prevIndex + 1;

        if (sliderRef.current) {
          const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
          // If we reached the end of the scrollable area, loop back to 0
          if (scrollLeft >= scrollWidth - clientWidth - 10) {
            nextIndex = 0;
          }
        }
        
        scrollToIndex(nextIndex);
        return nextIndex;
      });
    }, 3000); 

    return () => clearInterval(interval);
  }, [images.length, isHovered]);

  if (!images.length) return null;

  return (
    <div 
      className="relative w-full bg-white py-10 group/slider overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setTimeout(() => setIsHovered(false), 3000)}
    >
      {/* Navigation Arrows - hidden on mobile (hidden md:flex) */}
      <div className="absolute inset-y-0 left-0 right-0 hidden md:flex items-center justify-between px-4 z-30 pointer-events-none">
        <button
          onClick={() => scrollToIndex(activeIndex - 1)}
          className={`nav-btn pointer-events-auto ${!canScrollLeft ? "opacity-0 pointer-events-none" : ""}`}
        >
          <ChevronLeft size={22} />
        </button>
        <button
          onClick={() => scrollToIndex(activeIndex + 1)}
          className={`nav-btn pointer-events-auto ${!canScrollRight ? "opacity-0 pointer-events-none" : ""}`}
        >
          <ChevronRight size={22} />
        </button>
      </div>

      {/* Main Slider Container */}
      <div
        ref={sliderRef}
        className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar"
        style={{
          perspective: "1200px",
          scrollbarWidth: "none",
          scrollBehavior: "smooth",
        }}
      >
        {images.map((image, idx) => (
          <GalleryCard
            key={image.id || idx}
            image={image}
            containerRef={sliderRef}
          />
        ))}
      </div>

      {/* Pagination Dots below */}
      <div className="flex justify-center mt-4 space-x-2">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => scrollToIndex(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${
              activeIndex === idx
                ? "w-6 bg-slate-800"
                : "w-2 bg-slate-300 hover:bg-slate-400"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .nav-btn {
          height: 46px;
          width: 46px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: white;
          border: 1px solid rgba(0, 0, 0, 0.1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          opacity: 0;
        }
        .group\\/slider:hover .nav-btn {
          opacity: 1;
        }
        @media (hover: none) {
          .nav-btn {
            opacity: 1;
          }
        }
        .nav-btn:hover {
          background: black;
          color: white;
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
};

export default GallerySlider;
