import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import hereImage from "../assets/here-section-half.png";
import { apiClient } from "../lib/apiClient";
import { FACULTY_BRANCH_OPTIONS, DEFAULT_BRANCH } from "../data/branches";

const normalizeBranchValue = (value) => (value || DEFAULT_BRANCH).trim().toLowerCase();

const Courses = () => {
  const [activeTab, setActiveTab] = useState("Primary");
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState(null);
  const [branchFilter, setBranchFilter] = useState(DEFAULT_BRANCH);

  const branchFilteredCourses = useMemo(() => {
    const normalizedSelected = normalizeBranchValue(branchFilter);
    return courses.filter((course) => {
      const branch = course.branch || DEFAULT_BRANCH;
      return normalizeBranchValue(branch) === normalizedSelected;
    });
  }, [courses, branchFilter]);
  const hasBranchMatches = branchFilteredCourses.length > 0;

  const primaryCourses = useMemo(
    () => branchFilteredCourses.filter((course) => course.section === "Primary"),
    [branchFilteredCourses],
  );
  const secondaryCourses = useMemo(
    () =>
      branchFilteredCourses.filter((course) => course.section === "Secondary"),
    [branchFilteredCourses],
  );
  const activeSectionCourses = activeTab === "Primary" ? primaryCourses : secondaryCourses;

  // --- AUTO SHUFFLE LOGIC FOR COMBO OFFERS ---
  useEffect(() => {
    let mounted = true;
    const fetchCourses = async () => {
      setCoursesLoading(true);
      setCoursesError(null);
      try {
        const data = await apiClient.get("/courses", { scope: "course" });
        if (!mounted) return;
        setCourses(data);
      } catch (error) {
        if (!mounted) return;
        setCoursesError(error.message || "Unable to load courses.");
      } finally {
        if (mounted) {
          setCoursesLoading(false);
        }
      }
    };

    fetchCourses();

    return () => {
      mounted = false;
    };
  }, []);

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  return (
    <div className="bg-[#FCFBFA] min-h-screen text-slate-900 overflow-x-hidden">
      
      {/* HERO SECTION */}
      <header className="relative pt-20 md:pt-32 pb-16 px-4 max-w-7xl mx-auto text-center">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none flex justify-center items-center">
          <img
            src={hereImage}
            alt="Hero background"
            className="w-full h-full object-cover scale-150 blur-sm"
          />
        </div>

        <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="relative z-10">
          <motion.h1
            variants={fadeUp}
            className="text-4xl sm:text-6xl md:text-8xl font-black uppercase leading-[0.9] tracking-tight"
          >
            Academic <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D41304] to-orange-500 italic drop-shadow-sm">
              Programs
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-sm md:text-lg text-slate-500 mt-6 max-w-xl mx-auto font-medium"
          >
            Structured learning designed to deliver exceptional academic results.
          </motion.p>
        </motion.div>
      </header>


      {/* COURSES SECTION */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        
        {/* MOBILE TABS */}
        <div className="md:hidden mb-8 sticky top-4 z-20 space-y-3">
          <div className="flex justify-center">
            <div className="flex flex-col items-center gap-2 bg-white/90 backdrop-blur-md rounded-[40px] px-6 py-3 border border-slate-200 shadow-lg shadow-red-100/60">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                Branch
              </span>
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="min-w-[180px] text-[14px] font-black uppercase tracking-[0.3em] bg-transparent focus:outline-none"
              >
                {FACULTY_BRANCH_OPTIONS.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {!coursesLoading && courses.length > 0 && !branchFilteredCourses.length && (
            <p className="text-[10px] uppercase tracking-[0.4em] text-slate-500 text-center">
              No {branchFilter} courses published yet.
            </p>
          )}
          <div className="flex bg-white/80 backdrop-blur-md rounded-full p-1.5 shadow-lg shadow-slate-200/50 border border-slate-100">
            {["Primary", "Secondary"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
                  activeTab === tab
                    ? "bg-gradient-to-r from-[#D41304] to-red-600 text-white shadow-md transform scale-[1.02]"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* DESKTOP LAYOUT */}
          <div className="hidden md:block">
            <div className="mb-10 flex flex-col items-center justify-center gap-2">
              <span className="text-[12px] font-black uppercase tracking-[0.5em] text-slate-400">
                Branch
              </span>
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="min-w-[220px] text-[16px] font-black uppercase tracking-[0.3em] rounded-[40px] border border-slate-200 bg-white px-6 py-3 shadow-xl transition-shadow duration-300 focus:outline-none focus:ring-2 focus:ring-[#D41304]"
              >
                {FACULTY_BRANCH_OPTIONS.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
              <p className="text-[10px] uppercase tracking-[0.4em] text-slate-400">
                Showing {branchFilter} courses
              </p>
              {!coursesLoading && courses.length > 0 && !branchFilteredCourses.length && (
                <p className="text-[10px] uppercase tracking-[0.4em] text-slate-500">
                  No {branchFilter} courses published yet.
                </p>
              )}
            </div>
            {coursesLoading && (
            <div className="mb-8 flex justify-center text-sm text-slate-500">
              Fetching the latest courses from the Vidya syllabus vault...
            </div>
          )}
          {!coursesLoading && courses.length === 0 && (
            <div className="mb-8 flex justify-center text-sm text-slate-500">
              No course data yet. Use the admin desk to publish fresh batches.
            </div>
          )}
          {[
            { title: "Primary", data: primaryCourses },
            { title: "Secondary", data: secondaryCourses },
          ].map((section) => (
            <div key={section.title} className="mb-20">
              <h3 className="text-3xl font-black mb-8 flex items-center gap-3 text-slate-800">
                {section.title} <span className="text-slate-300 font-normal text-xl">Courses</span>
              </h3>

              <motion.div
                initial="hidden"
                animate={coursesLoading ? "hidden" : "visible"}
                variants={staggerContainer}
                className="grid gap-6 grid-cols-2 lg:grid-cols-4"
              >
                {section.data.length ? (
                  section.data.map((course) => (
                    <CourseCard key={course._id ?? course.id} course={course} />
                  ))
                ) : (
                  <div className="col-span-2 lg:col-span-4 rounded-3xl border border-dashed border-slate-200 bg-white/70 p-8 text-center">
                    <p className="text-sm text-slate-500 uppercase tracking-[0.3em]">
                      No {branchFilter} {section.title} courses published yet.
                    </p>
                  </div>
                )}
              </motion.div>
            </div>
          ))}
        </div>

        {/* MOBILE LAYOUT (Course Grid) */}
        <div className="md:hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex gap-5 overflow-x-auto pb-8 snap-x snap-mandatory px-1 hide-scrollbar"
            >
              {(activeTab === "Primary" ? primaryCourses : secondaryCourses).map((course) => (
                <div key={course._id ?? course.id} className="min-w-[80vw] snap-center">
                  <CourseCard course={course} />
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
          {!coursesLoading && courses.length > 0 && hasBranchMatches && activeSectionCourses.length === 0 && (
            <p className="mt-4 text-sm text-center uppercase tracking-[0.3em] text-slate-500">
              No {branchFilter} {activeTab} courses right now. Try switching tabs.
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

const CourseCard = ({ course }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 80, damping: 15 },
    },
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -10 }}
      whileTap={{ scale: 0.98 }}
      className="group relative bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-300 flex flex-col h-full overflow-hidden cursor-pointer"
    >
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#D41304] to-orange-400 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out z-10" />

      <div className="flex justify-between items-start mb-4 relative z-10">
        <span className="px-3 py-1 bg-red-50 text-[#D41304] text-xs font-black uppercase tracking-wider rounded-md">
          {course.section}
        </span>
      </div>

      <h4 className="text-xl font-black text-slate-800 group-hover:text-[#D41304] transition-colors duration-300 relative z-10">
        {course.title}
      </h4>

      <p className="text-sm text-slate-500 mt-3 flex-grow font-medium relative z-10">
        {course.description || course.timings}
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 relative z-10">
        <div className="rounded-2xl border border-[#fde3de] bg-[#fff1ed] p-4">
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#c62c3a]">Timings</p>
          <p className="text-sm font-semibold text-slate-800">{course.timings || "TBD"}</p>
        </div>
        <div className="rounded-2xl border border-[#fde3de] bg-[#fff1ed] p-4">
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#c62c3a]">Fee</p>
          <p className="text-sm font-semibold text-slate-800">{course.fee || "Contact us"}</p>
        </div>
      </div>
      {course.grade && (
        <div className="mt-3 text-[10px] font-black uppercase tracking-[0.3em] text-[#c62c3a]">
          {course.grade}
        </div>
      )}

      <div className="mt-6 pt-5 border-t border-slate-50 flex justify-between items-center relative z-10">
        <span className="font-black text-lg bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">
          {course.fee}
        </span>

        <Link
          to={`/courses/${course._id ?? course.id}`}
          className="flex items-center text-[#D41304] text-sm font-bold overflow-hidden"
        >
          View Course
          <motion.svg 
            className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </motion.svg>
        </Link>
      </div>

      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-red-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </motion.div>
  );
};

export default Courses;
