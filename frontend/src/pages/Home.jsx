import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  lazy,
  Suspense,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Herobtn from "../components/home/Herobtn";
import { apiClient } from "../lib/apiClient";
import { normalizeTopperEntry, getResultSchoolLabel } from "../lib/topperUtils";
import { groupGalleryImages } from "../lib/galleryUtils";
import heroImage from "../assets/here-section.png";
import mobileHeroImage from "../assets/mobile-hero-section.png"; // ✅ NEW
import {
  getLocalCache,
  setLocalCache,
  useClearCacheOnUnload,
  CACHE_KEYS,
} from "../lib/cacheUtils";

const OFFER_CARD_WIDTH = 320;
const OFFER_CARD_GAP = 24;
const MAX_GALLERY_SHOWCASE = 6;

const REFRESH_COOLDOWN_MS = 30 * 1000;

const STANDARD_FILTER_OPTIONS = ["SSC", "HSC"];
const DEFAULT_RESULT_STANDARD = "SSC";

const Toppercard = lazy(() =>
  import("../components/result/Toppercard").then((mod) => ({
    default: mod.default,
  }))
);
const GallerySlider = lazy(() =>
  import("../components/home/GallerySlider")
);

const getDisplayYear = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return new Date().getFullYear();
  }
  return parsed;
};

const prioritizeResultsByYear = (entries = []) => {
  const currentYear = new Date().getFullYear();
  return [...entries].sort((a, b) => {
    const yearA = getDisplayYear(a.year ?? a.batchYear);
    const yearB = getDisplayYear(b.year ?? b.batchYear);
    const priorityA = yearA === currentYear ? 0 : 1;
    const priorityB = yearB === currentYear ? 0 : 1;
    if (priorityA !== priorityB) return priorityA - priorityB;
    return yearB - yearA;
  });
};

const Home = () => {
  const navigate = useNavigate();

  useClearCacheOnUnload();

  const [featuredResults, setFeaturedResults] = useState([]);
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [resultsLoading, setResultsLoading] = useState(true);
  const [resultsError, setResultsError] = useState("");
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState("");
  const [offerBanners, setOfferBanners] = useState([]);
  const [offerLoading, setOfferLoading] = useState(true);
  const [offerError, setOfferError] = useState("");
  const [galleryShowcaseImages, setGalleryShowcaseImages] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(true);
  const [galleryError, setGalleryError] = useState("");
  const [isMobileView, setIsMobileView] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );
  const sliderRef = useRef(null);
  const isDesktopSlider = windowWidth >= 1024;
  const isMountedRef = useRef(true);
  const lastRefreshRef = useRef(0);
  const [resultStandardFilter, setResultStandardFilter] = useState(
    DEFAULT_RESULT_STANDARD,
  );
  const latestResultFetchIdRef = useRef(0);

  const warmGalleryCache = useCallback(async () => {
    try {
      const data = await apiClient.get("/gallery");
      const grouped = groupGalleryImages(data);
      setLocalCache(CACHE_KEYS.GALLERY_FOLDERS, grouped);
    } catch {
      // Ignore cache warm failures
    }
  }, [groupGalleryImages]);

  const fetchFeaturedResults = useCallback(
    async ({ showLoading = true } = {}) => {
      if (showLoading && isMountedRef.current) {
        setResultsLoading(true);
      }
      setResultsError("");
      latestResultFetchIdRef.current += 1;
      const currentFetchId = latestResultFetchIdRef.current;
      try {
        const data = await apiClient.get("/results", {
          showOnHome: true,
          standard: resultStandardFilter,
        });
        if (
          !isMountedRef.current ||
          latestResultFetchIdRef.current !== currentFetchId
        ) {
          return;
        }
        const results = Array.isArray(data) ? data : [];
        const prioritized = prioritizeResultsByYear(results).slice(0, 3);
        setFeaturedResults(prioritized);
        const existingCache = getLocalCache(
          CACHE_KEYS.HOME_FEATURED_RESULTS,
        );
        const normalizedCache =
          Array.isArray(existingCache) && existingCache.length
            ? { [DEFAULT_RESULT_STANDARD]: existingCache }
            : typeof existingCache === "object" &&
              existingCache !== null
            ? existingCache
            : {};
        const nextCache = {
          ...normalizedCache,
          [resultStandardFilter]: prioritized,
        };
        setLocalCache(CACHE_KEYS.HOME_FEATURED_RESULTS, nextCache);
      } catch (error) {
        if (
          !isMountedRef.current ||
          latestResultFetchIdRef.current !== currentFetchId
        ) {
          return;
        }
        setResultsError(error.message || "Unable to load featured results.");
      } finally {
        if (
          isMountedRef.current &&
          latestResultFetchIdRef.current === currentFetchId
        ) {
          setResultsLoading(false);
        }
      }
    },
    [resultStandardFilter],
  );
  const fetchFeaturedCourses = useCallback(async ({ showLoading = true } = {}) => {
    if (showLoading && isMountedRef.current) {
      setCoursesLoading(true);
    }
    setCoursesError("");
    try {
      const data = await apiClient.get("/courses", { scope: "home" });
      if (!isMountedRef.current) return;
      const courses = Array.isArray(data) ? data.slice(0, 4) : [];
      setFeaturedCourses(courses);
      setLocalCache(CACHE_KEYS.HOME_FEATURED_COURSES, courses);
    } catch (error) {
      if (!isMountedRef.current) return;
      setCoursesError(error.message || "Unable to load featured courses.");
    } finally {
      if (isMountedRef.current) {
        setCoursesLoading(false);
      }
    }
  }, []);

  const fetchOfferBanner = useCallback(async ({ showLoading = true } = {}) => {
    if (showLoading && isMountedRef.current) {
      setOfferLoading(true);
    }
    setOfferError("");
    try {
      const data = await apiClient.get("/offers", { active: true });
      if (!isMountedRef.current) return;
      const offers = Array.isArray(data) ? data : [];
      setOfferBanners(offers);
      setLocalCache(CACHE_KEYS.HOME_OFFER_BANNERS, offers);
    } catch (error) {
      if (!isMountedRef.current) return;
      setOfferError(error.message || "Unable to load the promotional banners.");
      setOfferBanners([]);
    } finally {
      if (isMountedRef.current) {
        setOfferLoading(false);
      }
    }
  }, []);

  const fetchGalleryShowcase = useCallback(async ({ showLoading = true } = {}) => {
    if (showLoading && isMountedRef.current) {
      setGalleryLoading(true);
    }
    setGalleryError("");
    try {
      const data = await apiClient.get("/gallery", { featured: true });
      if (!isMountedRef.current) return;
      const images = Array.isArray(data) ? data.slice(0, MAX_GALLERY_SHOWCASE) : [];
      setGalleryShowcaseImages(images);
      setLocalCache(CACHE_KEYS.HOME_GALLERY, images);
    } catch (error) {
      if (!isMountedRef.current) return;
      setGalleryError(error.message || "Unable to load gallery highlights.");
      setGalleryShowcaseImages([]);
    } finally {
      if (isMountedRef.current) {
        setGalleryLoading(false);
      }
    }
  }, []);

  const refreshHomeData = useCallback(
    (options = {}) => {
      const {
        force = false,
        showResultsLoading = true,
        showCoursesLoading = true,
        showOfferLoading = true,
        showGalleryLoading = true,
        fetchResults = true,
        fetchCourses = true,
        fetchOffers = true,
        fetchGallery = true,
      } = options;
      const now = Date.now();
      if (!force && now - lastRefreshRef.current < REFRESH_COOLDOWN_MS) {
        return;
      }
      lastRefreshRef.current = now;
      if (fetchResults) {
        fetchFeaturedResults({ showLoading: showResultsLoading });
      }
      if (fetchCourses) {
        fetchFeaturedCourses({ showLoading: showCoursesLoading });
      }
      if (fetchOffers) {
        fetchOfferBanner({ showLoading: showOfferLoading });
      }
      if (fetchGallery) {
        fetchGalleryShowcase({ showLoading: showGalleryLoading });
      }
    },
    [fetchFeaturedCourses, fetchFeaturedResults, fetchGalleryShowcase, fetchOfferBanner],
  );

  const fadeIn = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7 } }
  };

  const staggerContainer = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.2 }
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    const cachedCourses = getLocalCache(CACHE_KEYS.HOME_FEATURED_COURSES);
    const cachedOffers = getLocalCache(CACHE_KEYS.HOME_OFFER_BANNERS);
    const cachedGallery = getLocalCache(CACHE_KEYS.HOME_GALLERY);

    const hasCachedCourses =
      Array.isArray(cachedCourses) && cachedCourses.length > 0;
    const hasCachedOffers =
      Array.isArray(cachedOffers) && cachedOffers.length > 0;
    const hasCachedGallery =
      Array.isArray(cachedGallery) && cachedGallery.length > 0;

    if (hasCachedCourses) {
      setFeaturedCourses(cachedCourses);
      setCoursesLoading(false);
    }
    if (hasCachedOffers) {
      setOfferBanners(cachedOffers);
      setOfferLoading(false);
    }
    if (hasCachedGallery) {
      setGalleryShowcaseImages(cachedGallery);
      setGalleryLoading(false);
    }

    refreshHomeData({
      force: true,
      fetchResults: false,
      showCoursesLoading: !hasCachedCourses,
      showOfferLoading: !hasCachedOffers,
      showGalleryLoading: !hasCachedGallery,
    });

    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
      setWindowWidth(window.innerWidth);
    };
    const handleFocus = () => {
      refreshHomeData({
        showResultsLoading: false,
        showCoursesLoading: false,
        showOfferLoading: false,
        showGalleryLoading: false,
      });
    };
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        refreshHomeData({
          showResultsLoading: false,
          showCoursesLoading: false,
          showOfferLoading: false,
          showGalleryLoading: false,
        });
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      isMountedRef.current = false;
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [refreshHomeData]);

  useEffect(() => {
    const cachedResultsRaw = getLocalCache(
      CACHE_KEYS.HOME_FEATURED_RESULTS,
    );
    const normalizedCachedResults =
      Array.isArray(cachedResultsRaw) && cachedResultsRaw.length
        ? { [DEFAULT_RESULT_STANDARD]: cachedResultsRaw }
        : typeof cachedResultsRaw === "object" && cachedResultsRaw !== null
        ? cachedResultsRaw
        : {};
    const cachedResults =
      Array.isArray(normalizedCachedResults[resultStandardFilter])
        ? normalizedCachedResults[resultStandardFilter]
        : null;

    setFeaturedResults(cachedResults ?? []);
    setResultsLoading(!cachedResults);
    fetchFeaturedResults({ showLoading: !cachedResults });
  }, [resultStandardFilter, fetchFeaturedResults]);

  useEffect(() => {
    warmGalleryCache();
  }, [warmGalleryCache]);

  useEffect(() => {
    const handleExternalRefresh = (event) => {
      const sections = event?.detail?.sections;
      if (Array.isArray(sections) && sections.length > 0) {
        const refreshResults = sections.includes("results");
        const refreshCourses = sections.includes("courses");
        const refreshOffers = sections.includes("offers");
        const refreshGallery = sections.includes("gallery");
        refreshHomeData({
          force: true,
          fetchResults: refreshResults,
          fetchCourses: refreshCourses,
          fetchOffers: refreshOffers,
          fetchGallery: refreshGallery,
          showResultsLoading: refreshResults,
          showCoursesLoading: refreshCourses,
          showOfferLoading: refreshOffers,
          showGalleryLoading: refreshGallery,
        });
      } else {
        refreshHomeData({ force: true, showGalleryLoading: true });
      }
    };
    window.addEventListener("vidya-home-refresh", handleExternalRefresh);
    return () => {
      window.removeEventListener("vidya-home-refresh", handleExternalRefresh);
    };
  }, [refreshHomeData]);

  const scrollOffers = (direction) => {
    const container = sliderRef.current;
    if (!container) return;
    const scrollAmount = direction * (OFFER_CARD_WIDTH + OFFER_CARD_GAP);
    container.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  return (
    <div className="bg-[#FCFBFA] text-[#1a1a1a] min-h-screen">

      {/* ================= HERO ================= */}
      <section className="relative min-h-[80vh] md:min-h-[95vh] flex items-center overflow-hidden bg-[#1a1a1a]">

        {/* ================= BACKGROUND ================= */}
        <div className="absolute inset-0">

          {/* ✅ Desktop Image */}
          <img
            src={heroImage}
            alt="Hero Desktop"
            className="hidden md:block w-full h-full object-cover scale-105 opacity-40"
            loading="lazy"
            decoding="async"
          />

          {/* ✅ Mobile Image */}
          <img
            src={mobileHeroImage}
            alt="Hero Mobile"
            className="block md:hidden w-full h-full object-cover opacity-50"
            loading="lazy"
            decoding="async"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent md:via-black/30" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-10 grid md:grid-cols-2 gap-12 items-center">

          {/* LEFT CONTENT */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6 md:space-y-8"
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-bold tracking-[0.3em] uppercase text-white/80">
                Admissions Open 2026
              </span>
            </div>

            <h1 className="text-4xl md:text-8xl font-black text-white leading-[0.95]">
              VIDYA <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                COACHING
              </span>
            </h1>

            <p className="text-sm md:text-xl text-white/70 max-w-md border-l-2 border-red-500 pl-5">
              We don’t just teach — we engineer success through discipline and clarity.
            </p>
            <p className="text-xs md:text-sm text-white uppercase tracking-[0.4em] mt-2 font-bold">
              We Teach Standards I-X + Class XI & XII Commerce.
            </p>

            <div className="flex gap-3 md:gap-5">
              <Herobtn
                label="Explore Courses"
                filled
                onClick={() => navigate("/courses")}
              />

              <Herobtn
                label="Gallery"
                onClick={() => navigate("/gallery")}
              />
            </div>
          </motion.div>

          {/* RIGHT DECORATION */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="hidden md:flex justify-end"
          >
            <div className="relative w-72 h-72 border-2 border-white/10 rounded-full flex items-center justify-center">
              <div className="absolute inset-0 border-t-2 border-red-500 rounded-full animate-spin [animation-duration:10s]" />
              <p className="text-white/40 text-xs tracking-widest uppercase text-center">
                Legacy of Excellence
              </p>
            </div>
          </motion.div>

        </div>

      </section>

      {offerBanners.length > 0 && (
        <section className="py-16 bg-[#fdfdfd]">
        <div className="max-w-6xl mx-auto px-4 md:px-0 space-y-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-[#D41304]">Offer's</p>
              <h3 className="text-3xl md:text-5xl font-black text-[#111827]">Promotional highlights</h3>
            </div>
          </div>
          {offerLoading ? (
            <div className="rounded-[32px] border border-dashed border-slate-200 bg-white/90 p-8 text-center text-sm text-slate-500">
              Syncing the latest promotional banners...
            </div>
          ) : offerError ? (
            <div className="rounded-[32px] border border-slate-200 bg-white/90 p-8 text-center text-sm text-rose-500">
              {offerError}
            </div>
          ) : offerBanners.length ? (
            isMobileView ? (
              <div
                className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-2 py-3 scroll-smooth"
                style={{
                  scrollPadding: "10px",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                {offerBanners.map((offer) => (
                  <div
                    key={offer._id ?? offer.imageUrl}
                    className="snap-center flex-shrink-0 w-[280px]"
                  >
                    <OfferCard offer={offer} />
                  </div>
                ))}
              </div>
            ) : isDesktopSlider ? (
              <div className="relative mx-auto max-w-[1060px]">
                <div
                  ref={sliderRef}
                  className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-2 py-3 scroll-smooth"
                  style={{
                    scrollPadding: "16px",
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                  }}
                >
                  {offerBanners.map((offer) => (
                    <div
                      key={offer._id ?? offer.imageUrl}
                      className="snap-center flex-shrink-0"
                      style={{ minWidth: `${OFFER_CARD_WIDTH}px` }}
                    >
                      <OfferCard offer={offer} />
                    </div>
                  ))}
                </div>
                <div className="absolute -right-2 top-1/2 flex -translate-y-1/2 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => scrollOffers(-1)}
                    className="rounded-full bg-white/90 p-2 text-[#D41304] shadow-lg"
                  >
                    &lt;
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollOffers(1)}
                    className="rounded-full bg-white/90 p-2 text-[#D41304] shadow-lg"
                  >
                    &gt;
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {offerBanners.map((offer) => (
                  <OfferCard key={offer._id ?? offer.imageUrl} offer={offer} />
                ))}
              </div>
            )
          ) : (
            <div className="rounded-[32px] border border-dashed border-slate-200 bg-white/90 p-8 text-center text-sm text-slate-500">
              No promotional banners yet. Use the admin desk to upload one.
            </div>
          )}

        </div>
        </section>
      )}

      {!galleryLoading && (
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-5 md:px-10 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-slate-400 mb-1">
                  Gallery slider
                </p>
                <h3 className="text-3xl font-black">Captured moments</h3>
              </div>
            </div>

            {galleryError ? (
              <div className="rounded-[32px] border border-white/20 bg-white/90 p-12 text-center text-sm text-rose-500">
                {galleryError}
              </div>
            ) : galleryShowcaseImages.length ? (
              <Suspense
                fallback={
                  <div className="rounded-[32px] border border-white/20 bg-white/90 p-12 text-center text-sm text-slate-500">
                    Preparing the gallery...
                  </div>
                }
              >
                <GallerySlider images={galleryShowcaseImages} />
              </Suspense>
            ) : (
              <div className="rounded-[32px] border border-white/20 bg-white/90 p-12 text-center text-sm text-slate-500">
                Gallery highlights are coming soon. Check back later.
              </div>
            )}
            <div className="flex justify-center">
              <Link
                to="/gallery"
                className="mt-6 inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-900 transition hover:border-slate-500 hover:bg-slate-50"
              >
                View more moments
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ================= TOPPERS ================= */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-5 md:px-10">

          <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 mb-12">
            <div>
              <h2 className="text-red-600 text-xs tracking-[0.4em] uppercase mb-3">
                Wall of Fame
              </h2>
              <h3 className="text-3xl md:text-6xl font-black">
                THE MINDS THAT <span className="italic font-light">CONQUERED</span>
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.4em] text-slate-500">
                Standard
              </span>
              {STANDARD_FILTER_OPTIONS.map((option) => {
                const isActive = option === resultStandardFilter;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      if (option === resultStandardFilter) return;
                      setResultStandardFilter(option);
                    }}
                    className={`rounded-full px-4 py-1 text-[10px] font-black tracking-[0.3em] uppercase transition ${
                      isActive
                        ? "bg-[#D41304] text-white shadow-lg shadow-[#D41304]/30"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          {resultsLoading ? (
            <div className="text-center py-12 text-sm text-slate-500">
              Syncing the latest toppers for the homepage...
            </div>
          ) : resultsError ? (
            <div className="text-center py-12 text-sm text-red-600">{resultsError}</div>
          ) : featuredResults.length ? (
              <Suspense
                fallback={
                  <div className="text-center py-12 text-sm text-slate-500">
                    Preparing the Wall of Fame...
                  </div>
                }
              >
                <div className="hidden md:grid grid-cols-3 gap-8" key={resultStandardFilter}>
                  {featuredResults.map((result) => {
                    const normalized = normalizeTopperEntry(result);
                    return (
                      <motion.div
                        key={result._id ?? result.studentName}
                        variants={fadeIn}
                        whileHover={{ y: -12 }}
                      >
                        <Toppercard
                          topper={result.studentName}
                          grade={result.standard || "Vidya"}
                          percentage={normalized.percentage}
                          totalMarks={normalized.marks}
                          outOf={normalized.outOf}
                          subjects={normalized.subjects}
                          year={String(result.year ?? new Date().getFullYear())}
                          school={getResultSchoolLabel(result)}
                          imageUrl={result.profileImage}
                          imagePositionX={result.profileImagePosition?.x ?? 50}
                          imagePositionY={result.profileImagePosition?.y ?? 50}
                        />
                      </motion.div>
                    );
                  })}
                </div>

                <div className="flex md:hidden gap-4 overflow-x-auto pb-2">
                  {featuredResults.map((result) => {
                    const normalized = normalizeTopperEntry(result);
                    return (
                      <motion.div
                        key={`${result._id ?? result.studentName}-mobile`}
                        whileTap={{ scale: 0.96 }}
                        className="min-w-[85%] snap-center"
                      >
                        <Toppercard
                          topper={result.studentName}
                          grade={result.standard || "Vidya"}
                          percentage={normalized.percentage}
                          totalMarks={normalized.marks}
                          outOf={normalized.outOf}
                          subjects={normalized.subjects}
                          year={String(result.year ?? new Date().getFullYear())}
                          school={getResultSchoolLabel(result)}
                          imageUrl={result.profileImage}
                          imagePositionX={result.profileImagePosition?.x ?? 50}
                          imagePositionY={result.profileImagePosition?.y ?? 50}
                        />
                      </motion.div>
                    );
                  })}
                </div>
              </Suspense>
          ) : (
            <div className="text-center py-12 text-sm text-slate-500">
              No home-featured results yet. Use the admin desk to spotlight achievers.
            </div>
          )}
        </div>
      </section>

      <div className="flex justify-center my-8">
        <Link
          to="/results"
          className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-900 transition hover:border-slate-500 hover:bg-slate-50"
        >
          View more achievers
        </Link>
      </div>

      {/* ================= COURSES ================= */}
      <section className="py-16 md:py-24 bg-[#0a0a0a] text-white">
        <div className="max-w-7xl mx-auto px-5 md:px-10">

          <div className="grid md:grid-cols-2 gap-10 mb-12 items-center">
            <h2 className="text-3xl md:text-7xl font-black">
              PICK YOUR <br /> <span className="text-red-600">BATTLEFIELD</span>
            </h2>
            <p className="text-white/50 text-sm md:text-lg max-w-sm">
              From foundation to boards, we provide everything required for success.
            </p>
          </div>

          {coursesLoading ? (
            <div className="text-center py-12 text-sm text-white/70">
              Loading featured courses...
            </div>
          ) : coursesError ? (
            <div className="text-center py-12 text-sm text-red-400">{coursesError}</div>
          ) : featuredCourses.length ? (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid gap-6 md:grid-cols-3"
            >
              {featuredCourses.map((course, index) => (
                <CoursePreviewCard
                  key={course._id ?? `${course.title}-${index}`}
                  course={course}
                />
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-12 text-sm text-white/70">
              No courses are marked for the homepage yet. Use the admin desk to feature a batch.
            </div>
          )}

          <div className="flex justify-center mt-10">
            <Link
              to="/courses"
              className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:border-white hover:bg-white/20"
            >
              View all courses
            </Link>
          </div>
        </div>
      </section>

      {/* ================= GOAL ================= */}
      <section className="py-20 md:py-32 text-center px-5 bg-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
        >
          <h2 className="text-4xl md:text-8xl font-black mb-8">
            FROM <span className="text-red-600">DREAMERS</span> <br />
            TO ACHIEVERS
          </h2>

          <p className="text-gray-500 max-w-md mx-auto text-sm md:text-base">
            Discipline, consistency and strong fundamentals create real success.
          </p>
        </motion.div>
      </section>

    </div>
  );
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 90, damping: 18 },
  },
};

const CoursePreviewCard = React.memo(({ course }) => {
  const description =
    course.description ||
    "Detailed learning plans, milestone trackers, and practice grids crafted by Vidya's masters.";
  const highlight = course.highlights?.[0];
  const gradeLabel =
    Array.isArray(course.grades) && course.grades.length
      ? course.grades.join(" / ")
      : course.grade;

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.98 }}
      className="group relative border border-white/20 bg-white/5 rounded-3xl p-6 shadow-2xl shadow-red-500/10 overflow-hidden"
    >
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.4em] text-white/70 font-black mb-4">
        <span>{course.section || "General"}</span>
        {course.board && <span>{course.board} Board</span>}
      </div>
      {gradeLabel && (
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white mb-2">
          Grade: {gradeLabel}
        </p>
      )}

      <h3 className="text-2xl font-black text-white leading-snug">
        {course.title}
      </h3>

      <p className="text-sm text-white/70 mt-3 min-h-[68px]">{description}</p>

      <div className="mt-6 flex items-center justify-between">
        <span className="text-2xl font-black">{course.fee || "Contact us"}</span>
        <Link
          to={`/courses/${course._id ?? course.id}`}
          className="text-xs font-black uppercase tracking-[0.3em] text-white/90"
        >
          View course
        </Link>
      </div>

      {course.timings && (
        <p className="mt-3 text-xs text-white/70">{course.timings}</p>
      )}

      {highlight && (
        <p className="mt-2 text-xs text-white/70">
          Highlight: <span className="text-white">{highlight}</span>
        </p>
      )}
    </motion.div>
  );
});
CoursePreviewCard.displayName = "CoursePreviewCard";

const OfferCard = React.memo(({ offer }) => (
  <div className="mx-auto flex max-w-[320px] flex-col overflow-hidden rounded-[28px] border border-[#f1e9ff] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.12)] transition hover:shadow-[0_25px_60px_rgba(15,23,42,0.22)]">
    <div className="overflow-hidden bg-[#f6f2ff]">
      <img
        src={offer.imageUrl}
        alt={offer.caption || "Vidya offer"}
        className="h-[420px] w-full object-contain"
        loading="lazy"
        decoding="async"
      />
    </div>
    <div className="space-y-1 border-t border-[#f1e9ff] px-4 py-3 text-center">
      <p className="text-[10px] uppercase tracking-[0.5em] text-[#D41304]">Offer</p>
      {offer.caption && (
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#0F172A]">
          {offer.caption}
        </p>
      )}
      <p className="text-[10px] text-slate-500">{offer.link ? "Tap to learn more" : "Limited time banner"}</p>
      {offer.link && (
        <a
          href={offer.link}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex w-full items-center justify-center rounded-full border border-[#D41304] px-4 py-2 text-[10px] font-black uppercase tracking-[0.35em] text-[#D41304] transition hover:bg-[#D41304] hover:text-white"
        >
          Learn more
        </a>
      )}
    </div>
  </div>
));
OfferCard.displayName = "OfferCard";

export default Home;

  
