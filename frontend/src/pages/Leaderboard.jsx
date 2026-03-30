import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import classLogo from "../assets/class_logo.png";
import { apiClient } from "../lib/apiClient";
import { useNavigate } from "react-router-dom";
import {
  getLocalCache,
  setLocalCache,
  useClearCacheOnUnload,
  CACHE_KEYS,
} from "../lib/cacheUtils";
import { FACULTY_BRANCH_OPTIONS, DEFAULT_BRANCH } from "../data/branches";

const classifyGrade = (gradeLabel) => {
  const normalized = (gradeLabel || "").trim();
  const digits = normalized.match(/\d+/);
  const romanMatch = normalized.match(
    /\b(xii|xi|x|ix|viii|vii|vi|v|iv|iii|ii|i)\b/i,
  );
  let gradeNumber = null;
  if (digits) {
    const num = Number(digits[0]);
    if (!Number.isNaN(num)) {
      gradeNumber = num;
    }
  } else if (romanMatch) {
    const roman = romanMatch[0].toUpperCase();
    const romanMap = {
      I: 1,
      II: 2,
      III: 3,
      IV: 4,
      V: 5,
      VI: 6,
      VII: 7,
      VIII: 8,
      IX: 9,
      X: 10,
      XI: 11,
      XII: 12,
    };
    gradeNumber = romanMap[roman] ?? null;
  }
  if (gradeNumber !== null) {
    if (gradeNumber >= 1 && gradeNumber <= 4) return "Primary";
    if (gradeNumber >= 5 && gradeNumber <= 10) return "Secondary";
    if (gradeNumber >= 11 && gradeNumber <= 12) return "Junior College";
  }
  const lower = normalized.toLowerCase();
  if (
    /11|x1|xi|class xi|11th|class 11|class xi/i.test(lower) ||
    /12|x2|xii|class xii|12th|class 12|hsc|jr\.? college/i.test(lower)
  ) {
    return "Junior College";
  }
  if (/ix|ssc|secondary|board|10th|class 10|class x/i.test(lower)) {
    return "Secondary";
  }
  return "Primary";
};

const buildLeaderboardFromData = (rawEntries) => {
  const groups = new Map();
  rawEntries.forEach((entry) => {
    const label = entry.standard || entry.category || "General";
    if (!groups.has(label)) {
      groups.set(label, []);
    }
    groups.get(label).push(entry);
  });

  const sections = [];
  const rosterList = [];

  for (const [label, students] of groups.entries()) {
    sections.push({ grade: label });
    const sorted = students
      .slice()
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, 3)
      .map((student) => ({
        name: student.name,
        score: student.score ?? student.percentage ?? 0,
        percentage: student.percentage ?? student.score ?? 0,
        marks:
          student.marks ??
          Math.round((student.percentage ?? student.score ?? 0) * 6),
        year: student.year,
        photoUrl: student.photoUrl,
        photoPosition: student.photoPosition || { x: 50, y: 50 },
      }));
    rosterList.push(sorted);
  }

  return { sections, rosterList };
};

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right
  const autoPlayRef = useRef(null);
  const touchStartX = useRef(null);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [dynamicSections, setDynamicSections] = useState([]);
  const [dynamicRoster, setDynamicRoster] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [branchFilter, setBranchFilter] = useState(DEFAULT_BRANCH);
  const isMountedRef = useRef(true);
  const navigate = useNavigate();
  useClearCacheOnUnload();

  const fetchLeaderboard = useCallback(
    async ({ showLoading = true } = {}) => {
      if (showLoading) {
        setIsLoadingData(true);
      }
      setFetchError("");
      try {
        const data = await apiClient.get("/leaderboard");
        if (!isMountedRef.current) return;
        const normalized = Array.isArray(data) ? data : [];
        setLeaderboardData(normalized);
        setLocalCache(CACHE_KEYS.LEADERBOARD_DATA, normalized);
      } catch (error) {
        if (!isMountedRef.current) return;
        setFetchError(error.message || "Unable to fetch leaderboard.");
      } finally {
        if (isMountedRef.current) {
          setIsLoadingData(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    const cachedData = getLocalCache(CACHE_KEYS.LEADERBOARD_DATA);
    const hasCache = Array.isArray(cachedData) && cachedData.length > 0;
    if (hasCache) {
      setLeaderboardData(cachedData);
      setIsLoadingData(false);
    }
    isMountedRef.current = true;
    fetchLeaderboard({ showLoading: !hasCache });
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchLeaderboard]);

  const branchFilteredData = useMemo(() => {
    if (!branchFilter) return leaderboardData;
    return leaderboardData.filter((entry) => {
      const branch = entry.branch || DEFAULT_BRANCH;
      return branch === branchFilter;
    });
  }, [branchFilter, leaderboardData]);

  useEffect(() => {
    if (!branchFilteredData.length) {
      setDynamicSections([]);
      setDynamicRoster([]);
      return;
    }
    const { sections, rosterList } = buildLeaderboardFromData(branchFilteredData);
    setDynamicSections(sections);
    setDynamicRoster(rosterList);
  }, [branchFilteredData]);

  const sectionEntries = dynamicSections
    .map((section, index) => ({
      section,
      students: dynamicRoster[index] ?? [],
    }))
    .reverse();

  const filteredEntries = sectionEntries.filter((entry) => {
    if (activeTab === "Primary")
      return classifyGrade(entry.section.grade) === "Primary";
    if (activeTab === "Secondary")
      return classifyGrade(entry.section.grade) === "Secondary";
    if (activeTab === "Jr.College")
      return classifyGrade(entry.section.grade) === "Junior College";
    return true;
  });

  // Responsive logic: 5 cards for desktop (>=1024px), 1 for mobile
  const itemsPerPage =
    typeof window !== "undefined" && window.innerWidth >= 1024 ? 5 : 1;
  const totalPages = Math.max(
    1,
    Math.ceil(filteredEntries.length / (itemsPerPage || 1)),
  );

  // --- AUTO PLAY LOGIC ---
  useEffect(() => {
    if (!isPaused && filteredEntries.length) {
      autoPlayRef.current = setInterval(() => {
        nextSlide();
      }, 3000);
    }
    return () => clearInterval(autoPlayRef.current);
  }, [isPaused, currentIndex, filteredEntries.length]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [filteredEntries.length]);

  const nextSlide = () => {
    if (!filteredEntries.length) return;
    setDirection(1);
    setCurrentIndex((prev) => {
      const next = prev + itemsPerPage;
      return next % filteredEntries.length;
    });
  };

  const prevSlide = () => {
    if (!filteredEntries.length) return;
    setDirection(-1);
    setCurrentIndex((prev) => {
      const next = prev - itemsPerPage;
      return (
        ((next % filteredEntries.length) + filteredEntries.length) %
        filteredEntries.length
      );
    });
  };

  const handleTouchStart = (event) => {
    setIsPaused(true);
    touchStartX.current = event.touches?.[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event) => {
    const touchX = event.changedTouches?.[0]?.clientX ?? null;
    if (touchStartX.current !== null && touchX !== null) {
      const delta = touchX - touchStartX.current;
      if (Math.abs(delta) > 40) {
        if (delta < 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      }
    }
    setIsPaused(false);
    touchStartX.current = null;
  };

  const handleStudentClick = (student, sectionLabel, rank) => {
    if (!student) return;
    navigate("/certificate", {
      state: {
        student,
        sectionLabel,
        rank,
      },
    });
  };

  // Variants for group animation
  const variants = {
    enter: (direction) => ({ x: direction > 0 ? 500 : -500, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction) => ({ x: direction < 0 ? 500 : -500, opacity: 0 }),
  };

  return (
    <div className="min-h-screen bg-[#FCFBFA] text-slate-900 font-sans selection:bg-red-100 overflow-x-hidden">
      {/* --- HERO --- */}
      <header className="relative pt-20 md:pt-32 pb-10 md:pb-16 px-6 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-[#D41304] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">
              Academic Excellence
            </span>
          </div>
          <h1 className="text-5xl md:text-9xl font-black tracking-tighter uppercase leading-[0.9] mb-6">
            THE{" "}
            <span className="text-[#D41304] italic pr-4">ELITE</span>
          </h1>
          <div className="flex flex-col items-center gap-3 text-slate-500">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">
                Branch
              </span>
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black uppercase tracking-[0.3em] text-slate-900 focus:outline-none"
              >
                {FACULTY_BRANCH_OPTIONS.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
              Showing {branchFilter} leaderboard entries
            </p>
          </div>
          {isLoadingData && (
            <p className="text-sm text-slate-500 mb-2">
              Syncing leaderboard rankings…
            </p>
          )}
          {!isLoadingData && fetchError && (
            <p className="text-sm text-red-600 mb-2">{fetchError}</p>
          )}
        </motion.div>
      </header>

      {/* --- CLASS CHAMPIONS (Group Carousel) --- */}
    <section
      className="px-4 md:px-10 py-12 max-w-[1600px] mx-auto relative group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-[12px] font-black uppercase tracking-[0.5em] text-slate-400">
            Class Champions
          </h2>
          <div className="hidden md:flex gap-4 z-10">
            <button
              onClick={prevSlide}
              className="w-10 h-10 rounded-full border border-slate-200 hover:bg-white hover:border-[#D41304] transition-all flex items-center justify-center text-slate-600"
              style={{ backgroundColor: "rgba(255,255,255,0.8)" }}
            >
              ←
            </button>
            <button
              onClick={nextSlide}
              className="w-10 h-10 rounded-full border border-slate-200 hover:bg-white hover:border-[#D41304] transition-all flex items-center justify-center text-slate-600"
              style={{ backgroundColor: "rgba(255,255,255,0.8)" }}
            >
              →
            </button>
          </div>
          <div className="h-[1px] flex-1 mx-8 bg-slate-200" />
        </div>

        <div className="relative h-[420px] overflow-hidden">
          {!filteredEntries.length && !isLoadingData && (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-500">
              No leaderboard entries have been published yet.
            </div>
          )}
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6 w-full"
            >
              {filteredEntries
                .slice(currentIndex, currentIndex + itemsPerPage)
                .map((entry) => {
                  const topStudent = entry.students[0];
                  const topPhoto = topStudent?.photoUrl || classLogo;
                  const topPhotoPosition = topStudent?.photoPosition || {
                    x: 50,
                    y: 50,
                  };
                  return (
                    <div
                      key={entry.section.grade}
                      className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-xl text-center flex flex-col items-center justify-center group/card transition-all duration-300 hover:border-[#D41304] cursor-pointer"
                      onClick={() =>
                        topStudent &&
                        handleStudentClick(topStudent, entry.section.grade, 1)
                      }
                    >
                      <span className="text-[10px] font-black text-[#D41304] tracking-widest uppercase">
                        {entry.section.grade}
                      </span>
                      <div className="mt-4 relative">
                        <div className="w-24 h-24 rounded-full border-4 border-slate-50 overflow-hidden shadow-inner bg-slate-100">
                          <img
                            src={topPhoto}
                            className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-500"
                            alt={topStudent?.name || "leader"}
                            style={{
                              objectPosition: `${topPhotoPosition.x}% ${topPhotoPosition.y}%`,
                            }}
                          />
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-slate-900 text-white text-[9px] font-black w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                          #1
                        </div>
                      </div>
                      <h3 className="mt-5 font-black text-lg tracking-tight text-slate-900 line-clamp-1">
                        {topStudent?.name ?? "TBD"}
                      </h3>
                      <p className="text-slate-400 font-bold text-base mt-1">
                        {topStudent?.score ?? "--"}%
                      </p>
                    </div>
                  );
                })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Pagination indicators (Pages, not individual cards) */}
        <div className="flex justify-center gap-3 mt-8">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i * itemsPerPage > currentIndex ? 1 : -1);
                setCurrentIndex(i * itemsPerPage);
              }}
              className={`h-1.5 transition-all duration-500 rounded-full ${Math.floor(currentIndex / itemsPerPage) === i ? "w-12 bg-[#D41304]" : "w-3 bg-slate-200"}`}
            />
          ))}
        </div>
      </section>

      {/* --- DETAILED LIST --- */}
      <section className="px-4 md:px-6 pb-32 max-w-7xl mx-auto">
        <div className="bg-white rounded-[30px] md:rounded-[40px] border border-slate-200 overflow-hidden shadow-2xl">
          <div className="p-6 md:p-10 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">
              Performance Roster
            </h2>
            <div className="hidden md:flex gap-1 md:gap-2 bg-slate-100 p-1.5 rounded-2xl w-full md:w-auto overflow-x-auto">
              {["All", "Primary", "Secondary", "Jr.College"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 md:flex-none min-w-[88px] px-6 md:px-8 py-2.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? "bg-white text-[#D41304] shadow-md" : "text-slate-400 hover:text-slate-600"}`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="md:hidden flex items-center border border-slate-200 rounded-2xl px-4 py-2 bg-white shadow-sm w-full max-w-xs">
              <label className="text-[9px] font-black tracking-[0.3em] uppercase text-slate-400 mr-3">
                View
              </label>
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
                className="flex-1 text-[10px] font-black uppercase tracking-[0.3em] bg-transparent focus:outline-none"
              >
                {["All", "Primary", "Secondary", "Jr.College"].map((tab) => (
                  <option key={tab} value={tab}>
                    {tab}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-x divide-slate-100">
            <AnimatePresence mode="popLayout">
              {filteredEntries.map((entry) => (
                <motion.div
                  key={entry.section.grade}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-6 md:p-10 hover:bg-slate-50 transition-all group"
                >
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-base md:text-lg font-black uppercase tracking-[0.2em] text-slate-900 group-hover:text-[#D41304] transition-colors">
                      {entry.section.grade}
                    </span>
                    <span className="text-[9px] font-black py-1 px-3 bg-green-100 text-green-700 rounded-full">
                      BATCH 2026
                    </span>
                  </div>

                  <div className="space-y-5">
                    {entry.students.map((student, i) => {
                      const studentPhotoPosition = student.photoPosition || {
                        x: 50,
                        y: 50,
                      };
                      return (
                        <div
                          key={i}
                          className="flex items-center justify-between group/row cursor-pointer"
                          onClick={() =>
                            handleStudentClick(student, entry.section.grade, i + 1)
                          }
                        >
                          <div className="flex items-center gap-4">
                            <span
                              className={`text-xs font-black w-7 h-7 rounded-xl flex items-center justify-center transition-all ${i === 0 ? "bg-[#D41304] text-white rotate-3 shadow-lg shadow-red-200" : "bg-slate-100 text-slate-400 group-hover/row:bg-slate-200"}`}
                            >
                              {i + 1}
                            </span>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 shadow-inner">
                                <img
                                  src={student.photoUrl || classLogo}
                                  alt={student.name}
                                  className="w-full h-full object-cover"
                                  style={{
                                    objectPosition: `${studentPhotoPosition.x}% ${studentPhotoPosition.y}%`,
                                  }}
                                />
                              </div>
                              <span className="text-base md:text-lg font-bold text-slate-700 group-hover/row:text-slate-900 transition-colors tracking-tight">
                                {student.name}
                              </span>
                            </div>
                          </div>
                          <span
                            className={`text-lg font-black ${i === 0 ? "text-[#D41304]" : "text-slate-900 opacity-60"}`}
                          >
                            {student.score}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Leaderboard;
