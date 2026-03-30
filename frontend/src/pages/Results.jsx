import React, { memo, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import hereImage from "../assets/here-section-half.png";
import Toppercard from "../components/result/Toppercard";
import { apiClient } from "../lib/apiClient";
import { buildSectionsFromResults } from "../lib/topperUtils";
import {
  getLocalCache,
  setLocalCache,
  useClearCacheOnUnload,
  CACHE_KEYS,
} from "../lib/cacheUtils";

// --- SECTION CAROUSEL COMPONENT ---
// Each section keeps its own scroll state; we memoize to avoid unnecessary re-renders.
const SectionCarousel = memo(({ section, index, staggerContainer, fadeUp }) => {
  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHoveredOrTouched, setIsHoveredOrTouched] = useState(false);
  const activeIndexRef = useRef(0);
  const scrollAnimationFrame = useRef(null);

  const updateActiveIndex = useCallback((newIndex) => {
    setActiveIndex((prevIndex) => {
      if (prevIndex === newIndex) {
        return prevIndex;
      }
      activeIndexRef.current = newIndex;
      return newIndex;
    });
  }, []);

  const scrollTo = useCallback(
    (targetIndex) => {
      if (!scrollRef.current) return;
      const itemWidth = scrollRef.current.children[0]?.offsetWidth || 0;
      scrollRef.current.scrollTo({
        left: targetIndex * itemWidth,
        behavior: "smooth",
      });
      updateActiveIndex(targetIndex);
    },
    [updateActiveIndex]
  );

  // Handle Manual Scroll to update the active dot (throttled via requestAnimationFrame)
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    if (scrollAnimationFrame.current) return;
    if (typeof window === "undefined") return;

    scrollAnimationFrame.current = window.requestAnimationFrame(() => {
      const itemWidth = scrollRef.current.children[0]?.offsetWidth || 1;
      const newIndex = Math.round(scrollRef.current.scrollLeft / itemWidth);
      updateActiveIndex(newIndex);
      scrollAnimationFrame.current = null;
    });
  }, [updateActiveIndex]);

  // Keep the animation frame clean when the component unmounts
  useEffect(() => {
    return () => {
      if (scrollAnimationFrame.current && typeof window !== "undefined") {
        window.cancelAnimationFrame(scrollAnimationFrame.current);
      }
    };
  }, []);

  // Auto-play interval (Runs only on mobile and pauses when interacted with)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const isMobile = window.innerWidth < 768;
    if (!isMobile || isHoveredOrTouched || section.toppers.length <= 1) return;

    const interval = window.setInterval(() => {
      const nextIndex =
        activeIndexRef.current === section.toppers.length - 1
          ? 0
          : activeIndexRef.current + 1;
      scrollTo(nextIndex);
    }, 3500); // Changes every 3.5 seconds

    return () => window.clearInterval(interval);
  }, [isHoveredOrTouched, section.toppers.length, scrollTo]);

  return (
    <motion.section
      key={section.title}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={staggerContainer}
      className={`pt-4 md:pt-12 ${
        index !== 0 ? "mt-8 md:mt-20 border-t border-slate-200" : ""
      }`}
    >
      {/* Section Header */}
      <div className="flex flex-wrap items-center gap-3 md:gap-6 mb-6 md:mb-12 pr-3 md:pr-0">
        <h2 className="text-2xl md:text-3xl lg:text-5xl font-black tracking-tighter uppercase text-slate-900">
          {section.title}
        </h2>
        <div className="h-[2px] flex-1 bg-gradient-to-r from-slate-200 to-transparent"></div>
        <span className="text-[8px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] text-slate-400 font-bold hidden sm:block">
          Top Percentiles
        </span>
      </div>

      {/* THE LAYOUT: Mobile Carousel / Desktop Grid */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        onTouchStart={() => setIsHoveredOrTouched(true)}
        onTouchEnd={() => setIsHoveredOrTouched(false)}
        onMouseEnter={() => setIsHoveredOrTouched(true)}
        onMouseLeave={() => setIsHoveredOrTouched(false)}
        className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 md:pb-0 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6 lg:gap-8 md:place-items-center md:overflow-visible [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth"
      >
        {section.toppers.map((topper, i) => (
          <motion.div
            variants={fadeUp}
            key={topper.name}
            // Mobile width is 85% to peek the next card. Desktop is 100%.
            className="flex-none w-[85%] max-w-[320px] snap-center md:w-full md:max-w-none flex justify-center"
          >
              <Toppercard
                topper={topper.name}
                totalMarks={topper.marks}
                percentage={topper.percentage}
                grade={section.accent}
                year={String(topper.year ?? new Date().getFullYear())}
                school={topper.school}
                outOf={topper.outOf}
                subjects={topper.subjects}
                imageUrl={topper.imageUrl}
                imagePositionX={topper.imagePositionX}
                imagePositionY={topper.imagePositionY}
              />
          </motion.div>
        ))}
        {/* Invisible spacer to prevent right-edge sticking on mobile */}
        <div className="flex-none w-4 md:hidden"></div>
      </div>

      {/* Modern Pagination Dots (Hidden on Desktop) */}
      {section.toppers.length > 1 && (
        <div className="flex md:hidden justify-center items-center gap-2 mt-4 pb-2">
          {section.toppers.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              aria-label={`Go to student ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ease-out ${
                activeIndex === i
                  ? "w-6 bg-[#D41304] shadow-sm shadow-[#D41304]/30"
                  : "w-1.5 bg-slate-200 hover:bg-slate-300"
              }`}
            />
          ))}
        </div>
      )}
    </motion.section>
  );
});

// --- MAIN PAGE COMPONENT ---
const Results = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStandard, setSelectedStandard] = useState("Standard");
  const [selectedSchool, setSelectedSchool] = useState("School");
  const [selectedYear, setSelectedYear] = useState("Year");
  const [dynamicSections, setDynamicSections] = useState([]);
  const [isLoadingResults, setIsLoadingResults] = useState(true);
  const [resultsError, setResultsError] = useState("");
  const isMountedRef = useRef(true);
  const deferredSearchQuery = useDeferredValue(searchQuery);

  useClearCacheOnUnload();

  const fetchResults = useCallback(async ({ showLoading = true } = {}) => {
    if (showLoading && isMountedRef.current) {
      setIsLoadingResults(true);
    }
    setResultsError("");
    try {
      const data = await apiClient.get("/results");
      if (!isMountedRef.current) return;
      const sections = Array.isArray(data) ? buildSectionsFromResults(data) : [];
      setDynamicSections(sections);
      setLocalCache(CACHE_KEYS.RESULTS_SECTIONS, sections);
    } catch (error) {
      if (!isMountedRef.current) return;
      setResultsError(error.message || "Could not sync result data.");
    } finally {
      if (isMountedRef.current) {
        setIsLoadingResults(false);
      }
    }
  }, []);

  // --- ANIMATION VARIANTS ---
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const STANDARD_OPTIONS = ["HSC", "SSC"];

  const schoolOptions = useMemo(() => {
    const seen = new Set();
    dynamicSections.forEach((section) => {
      section.toppers.forEach((topper) => {
        const schoolLabel = topper.school?.trim();
        if (schoolLabel) {
          seen.add(schoolLabel);
        }
      });
    });
    return Array.from(seen).sort((a, b) => a.localeCompare(b));
  }, [dynamicSections]);

  const yearOptions = useMemo(() => {
    const seen = new Set();
    dynamicSections.forEach((section) => {
      const yearValue = section.year ?? new Date().getFullYear();
      seen.add(Number.isFinite(Number(yearValue)) ? Number(yearValue) : new Date().getFullYear());
    });
    return Array.from(seen)
      .sort((a, b) => Number(b) - Number(a))
      .map((year) => String(year));
  }, [dynamicSections]);

  useEffect(() => {
    const cachedSections = getLocalCache(CACHE_KEYS.RESULTS_SECTIONS);
    const hasCache = Array.isArray(cachedSections) && cachedSections.length > 0;
    if (hasCache) {
      setDynamicSections(cachedSections);
      setIsLoadingResults(false);
    }
    isMountedRef.current = true;
    fetchResults({ showLoading: !hasCache });
    const handleFocus = () => {
      fetchResults({ showLoading: false });
    };
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchResults({ showLoading: false });
      }
    };
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      isMountedRef.current = false;
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [fetchResults]);

  const filteredSections = useMemo(() => {
    const normalizedSearch = deferredSearchQuery.trim().toLowerCase();
    const shouldFilterStandard = selectedStandard !== "Standard";
    const normalizedStandard = shouldFilterStandard
      ? selectedStandard.toLowerCase()
      : null;
    const shouldFilterSchool = selectedSchool !== "School";
    const normalizedSchool = shouldFilterSchool
      ? selectedSchool.toLowerCase()
      : null;
    const shouldFilterYear = selectedYear !== "Year";
    const normalizedYear =
      shouldFilterYear && Number.isFinite(Number(selectedYear))
        ? Number(selectedYear)
        : null;

    return dynamicSections.reduce((acc, section) => {
      if (
        shouldFilterStandard &&
        (section.standard ?? "").toLowerCase() !== normalizedStandard
      ) {
        return acc;
      }

      if (
        shouldFilterYear &&
        normalizedYear !== null &&
        section.year !== normalizedYear
      ) {
        return acc;
      }

      const toppers = section.toppers.filter((topper) => {
        if (shouldFilterSchool) {
          const schoolLabel = (topper.school ?? "").trim().toLowerCase();
          if (schoolLabel !== normalizedSchool) {
            return false;
          }
        }
        if (normalizedSearch.length === 0) {
          return true;
        }
        return topper.name.toLowerCase().includes(normalizedSearch);
      });

      if (toppers.length === 0) return acc;

      acc.push(
        normalizedSearch.length && toppers.length !== section.toppers.length
          ? { ...section, toppers }
          : section
      );

      return acc;
    }, []);
  }, [dynamicSections, deferredSearchQuery, selectedSchool, selectedYear, selectedStandard]);

  const activeFilters = [];
  if (selectedStandard !== "Standard") activeFilters.push(selectedStandard);
  if (selectedSchool !== "School") activeFilters.push(selectedSchool);
  if (selectedYear !== "Year") activeFilters.push(selectedYear);
  const noResultsMessage = dynamicSections.length
    ? searchQuery
      ? `No students found matching "${searchQuery}".`
      : activeFilters.length
        ? `No students found for ${activeFilters.join(" • ")}.`
        : "No students found yet. Try refining the filters."
    : "No students added yet. Publish records from the admin desk.";

  return (
    <div className="min-h-screen bg-[#FCFBFA] text-slate-900 font-sans selection:bg-red-100 overflow-x-hidden">
      
      {/* --- HERO SECTION --- */}
      <header className="relative pt-16 md:pt-32 pb-12 md:pb-20 px-4 md:px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Subtle Background Texture */}
        <div className="absolute inset-0 z-0 overflow-hidden flex justify-center items-center opacity-[0.03] pointer-events-none">
          <img src={hereImage} alt="Background" className="w-[200%] md:w-[120%] h-[200%] md:h-[120%] object-cover blur-sm" />
        </div>

        <motion.div
          initial="hidden" animate="visible" variants={staggerContainer}
          className="relative z-10 w-full flex flex-col items-center"
        >
          {/* Badge */}
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm mb-6 md:mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D41304] animate-pulse" />
            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-slate-600">Official Results 2025-26</span>
          </motion.div>

          {/* Huge Typography */}
          <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl md:text-8xl font-black tracking-tighter uppercase leading-[1.1] md:leading-[0.85] text-slate-900 mb-4 md:mb-6 px-2">
            Hall of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D41304] to-orange-500 italic pr-2 md:pr-4">
              Fame.
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} className="text-sm md:text-lg text-slate-500 max-w-2xl leading-relaxed font-medium px-4 mb-10 md:mb-16">
            Turning momentum into milestones. Explore the academic journeys and exceptional percentiles of our top-performing students.
          </motion.p>
          {isLoadingResults && (
            <p className="text-sm text-slate-500 mb-4">Syncing the latest result masterpieces…</p>
          )}
          {!isLoadingResults && resultsError && (
            <p className="text-sm text-red-600 mb-4">{resultsError}</p>
          )}

          {/* Stats Bento */}
        </motion.div>
      </header>

      {/* --- COMMAND BAR (Search & Filters) --- */}
      <section className="sticky top-2 md:top-4 z-40 max-w-5xl mx-auto px-3 md:px-6 mb-4 md:mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white/95 backdrop-blur-xl rounded-[20px] md:rounded-[24px] p-3 md:p-3 border border-slate-200 shadow-lg md:shadow-xl shadow-slate-200/50 flex flex-col gap-3"
        >
          {/* Search Input */}
          <div className="relative w-full">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search student name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50/50 rounded-xl md:rounded-2xl py-2.5 md:py-3 pl-9 md:pl-12 pr-3 md:pr-4 text-xs md:text-sm font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-medium focus:outline-none focus:ring-2 focus:ring-[#D41304]/20 transition-all border border-transparent focus:border-[#D41304]/30"
            />
          </div>

          {/* Filters */}
          <div className="grid gap-2 w-full grid-cols-1 sm:grid-cols-3">
            <select
              value={selectedStandard}
              onChange={(e) => setSelectedStandard(e.target.value)}
              className="w-full bg-slate-50/50 rounded-xl md:rounded-2xl px-3 md:px-4 py-2.5 md:py-3 text-[10px] md:text-xs font-black uppercase tracking-wider text-slate-600 border border-slate-100 hover:bg-slate-100 focus:outline-none cursor-pointer transition-colors appearance-none text-center"
            >
              <option>Standard</option>
              {STANDARD_OPTIONS.map((standard) => (
                <option key={standard} value={standard}>
                  {standard}
                </option>
              ))}
            </select>
            <select
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
              className="w-full bg-slate-50/50 rounded-xl md:rounded-2xl px-3 md:px-4 py-2.5 md:py-3 text-[10px] md:text-xs font-black uppercase tracking-wider text-slate-600 border border-slate-100 hover:bg-slate-100 focus:outline-none cursor-pointer transition-colors appearance-none text-center"
            >
              <option>School</option>
              {schoolOptions.map((school) => (
                <option key={school} value={school}>
                  {school}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full bg-slate-50/50 rounded-xl md:rounded-2xl px-3 md:px-4 py-2.5 md:py-3 text-[10px] md:text-xs font-black uppercase tracking-wider text-slate-600 border border-slate-100 hover:bg-slate-100 focus:outline-none cursor-pointer transition-colors appearance-none text-center"
            >
              <option>Year</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          
          <button className="w-full bg-[#D41304] text-white rounded-xl md:rounded-2xl px-4 md:px-6 py-2.5 md:py-3 text-xs md:text-sm font-black uppercase tracking-wider shadow-md hover:bg-slate-900 transition-colors flex items-center justify-center">
            Find Results
          </button>
        </motion.div>
      </section>

      {/* --- CAROUSEL RENDER LOOP --- */}
      <main className="max-w-7xl mx-auto pl-3 pr-0 md:px-6 pb-20 md:pb-32 overflow-hidden md:overflow-visible">
        {filteredSections.length > 0 ? (
          filteredSections.map((section, index) => (
            <SectionCarousel 
              key={section.title} 
              section={section} 
              index={index} 
              staggerContainer={staggerContainer} 
              fadeUp={fadeUp} 
            />
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 pr-3 md:pr-0"
          >
            <p className="text-slate-400 text-sm md:text-base">{noResultsMessage}</p>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Results;
