import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { apiClient } from "../../../lib/apiClient";
import { useAdminSession } from "../../../contexts/AdminSession";
import { buttonStyles } from "../buttonStyles";
import statusColor from "../statusColor";
import { FACULTY_BRANCH_OPTIONS, DEFAULT_BRANCH } from "../../../data/branches";

const COURSE_TYPE_LABELS = {
  individual: "Individual",
  combo: "Combo",
};

const TIMING_DAY_OPTIONS = ["Mon-Fri", "Sat-Sun"];
const TIMING_HOURS = Array.from({ length: 12 }, (_, i) => `${i + 1}`);
const TIMING_MINUTES = ["00", "15", "30", "45"];
const TIMING_PERIODS = ["am", "pm"];

const defaultTimingFields = {
  timingDay: TIMING_DAY_OPTIONS[0],
  timingStartHour: "4",
  timingStartMinute: "00",
  timingStartPeriod: "pm",
  timingEndHour: "6",
  timingEndMinute: "00",
  timingEndPeriod: "pm",
};

const formatTimingsFromFields = ({
  timingDay,
  timingStartHour,
  timingStartMinute,
  timingStartPeriod,
  timingEndHour,
  timingEndMinute,
  timingEndPeriod,
}) => {
  if (
    !timingDay ||
    !timingStartHour ||
    !timingStartMinute ||
    !timingStartPeriod ||
    !timingEndHour ||
    !timingEndMinute ||
    !timingEndPeriod
  ) {
    return "";
  }
  const startMinute = timingStartMinute.padStart(2, "0");
  const endMinute = timingEndMinute.padStart(2, "0");
  return `${timingDay}, ${timingStartHour}:${startMinute}${timingStartPeriod}-${timingEndHour}:${endMinute}${timingEndPeriod}`;
};

const parseTimingsString = (value) => {
  const fallback = { ...defaultTimingFields };
  if (!value) return fallback;
  const normalized = value.trim();
  const dayMatch = normalized.match(/(Mon-Fri|Sat-Sun)/i);
  if (dayMatch) {
    fallback.timingDay = dayMatch[1];
  }
  const timeMatch = normalized.match(
    /(\d{1,2})(?::(\d{1,2}))?\s*(am|pm)?\s*-\s*(\d{1,2})(?::(\d{1,2}))?\s*(am|pm)?/i,
  );
  if (timeMatch) {
    fallback.timingStartHour = timeMatch[1];
    fallback.timingStartMinute = (timeMatch[2] || "00").padStart(2, "0");
    fallback.timingStartPeriod = (timeMatch[3] || "pm").toLowerCase();
    fallback.timingEndHour = timeMatch[4];
    fallback.timingEndMinute = (timeMatch[5] || "00").padStart(2, "0");
    fallback.timingEndPeriod = (timeMatch[6] || "pm").toLowerCase();
  }
  return fallback;
};

const initialCourseState = {
  title: COURSE_TYPE_LABELS.individual,
  section: "Primary",
  board: "State",
  branch: DEFAULT_BRANCH,
  fee: "",
  duration: "12 months",
  description: "",
  highlights: "",
  additionalDetails: "",
  selectedSubjects: [],
  courseType: "individual",
  gradeSelection: "",
  gradeSelections: [],
  showOnHome: false,
  showOnCourse: true,
  titleSynced: true,
  ...defaultTimingFields,
  timings: formatTimingsFromFields(defaultTimingFields),
};

const SECTION_FILTER_OPTIONS = ["Primary", "Secondary"];

const gradeOptionsBySection = {
  Primary: ["Standard 1", "Standard 2", "Standard 3", "Standard 4"],
  Secondary: [
    "Standard 5",
    "Standard 6",
    "Standard 7",
    "Standard 8",
    "Standard 9",
    "Standard 10",
    "Standard 11 Commerce",
    "Standard 12 Commerce",
  ],
};

const sectionOptions = ["Primary", "Secondary"];

const getGradesForSection = (section) =>
  gradeOptionsBySection[section] ?? gradeOptionsBySection.Primary;

const getSubjectBranches = (subject) => {
  const branches = subject?.branches;
  if (Array.isArray(branches) && branches.length) {
    return branches;
  }
  return FACULTY_BRANCH_OPTIONS;
};

const toggleComboGrade = ({ grade, currentSelections }) => {
  const normalized = new Set(currentSelections);
  if (normalized.has(grade)) {
    normalized.delete(grade);
  } else if (normalized.size < 2) {
    normalized.add(grade);
  }
  return Array.from(normalized);
};

const CoursesPanel = () => {
  const { credentials, isAdminAuthenticated } = useAdminSession();
  const headers = isAdminAuthenticated
    ? {
        "x-admin-username": credentials.username,
        "x-admin-password": credentials.password,
      }
    : {};

  const [courseForm, setCourseForm] = useState(initialCourseState);
  const [courseStatus, setCourseStatus] = useState("");
  const [courseLoading, setCourseLoading] = useState(false);
  const [coursesList, setCoursesList] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [coursesError, setCoursesError] = useState("");
  const [courseListStatus, setCourseListStatus] = useState("");
  const [editingCourseId, setEditingCourseId] = useState("");
  const [subjectsList, setSubjectsList] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [subjectsError, setSubjectsError] = useState("");
  const [pendingSubjectMatches, setPendingSubjectMatches] = useState(null);
  const [libraryFilters, setLibraryFilters] = useState({
    section: "",
    branch: "",
    standard: "",
  });
  const updateTimingFields = (fields) => {
    setCourseForm((prev) => {
      const next = { ...prev, ...fields };
      return {
        ...next,
        timings: formatTimingsFromFields(next),
      };
    });
  };

  const fetchCourseList = useCallback(async () => {
    setCoursesError("");
    setCoursesLoading(true);
    try {
      const data = await apiClient.get("/courses");
      setCoursesList(Array.isArray(data) ? data : []);
    } catch (error) {
      setCoursesError(error.message || "Unable to load course list.");
    } finally {
      setCoursesLoading(false);
    }
  }, []);

  const fetchSubjectList = useCallback(async () => {
    setSubjectsError("");
    setSubjectsLoading(true);
    try {
      const data = await apiClient.get("/subjects");
      setSubjectsList(Array.isArray(data) ? data : []);
    } catch (error) {
      setSubjectsError(error.message || "Unable to load subjects.");
    } finally {
      setSubjectsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAdminAuthenticated) return;
    fetchCourseList();
  }, [fetchCourseList, isAdminAuthenticated]);

  useEffect(() => {
    if (!isAdminAuthenticated) return;
    fetchSubjectList();
  }, [fetchSubjectList, isAdminAuthenticated]);

  useEffect(() => {
    if (!pendingSubjectMatches || !subjectsList.length) {
      return;
    }
    const matchedIds = [];
    pendingSubjectMatches.forEach((subject) => {
      const found = subjectsList.find(
        (option) =>
          option.name === subject.name && option.faculty === subject.faculty,
      );
      if (found?._id) {
        matchedIds.push(found._id);
      }
    });
    if (matchedIds.length) {
      setCourseForm((prev) => ({
        ...prev,
        selectedSubjects: matchedIds,
      }));
    }
    setPendingSubjectMatches(null);
  }, [pendingSubjectMatches, subjectsList]);

  const handleCourseSubmit = async (event) => {
    event.preventDefault();
    if (!isAdminAuthenticated) {
      setCourseStatus("Log in to submit courses.");
      return;
    }
    setCourseLoading(true);
    setCourseStatus("");
    try {
      const parsedHighlights = (courseForm.highlights || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      const selectedSubjectDetails = subjectsList.filter((subject) =>
        courseForm.selectedSubjects.includes(subject._id),
      );
      const parsedSubjects = selectedSubjectDetails.map(({ name, faculty }) => ({
        name,
        faculty: faculty || "Faculty",
      }));
      const parsedAdditionalDetails = (courseForm.additionalDetails || "")
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean);
      const selectedGrades =
        courseForm.courseType === "combo"
          ? [...courseForm.gradeSelections]
          : courseForm.gradeSelection
          ? [courseForm.gradeSelection]
          : [];
      const sanitizedGrades = selectedGrades
        .map((grade) => grade?.trim())
        .filter(Boolean);
      const limit = courseForm.courseType === "combo" ? 2 : 1;
      const limitedGrades = sanitizedGrades.slice(0, limit);
      const gradeValue = limitedGrades[0];
        const trimmedTitle = courseForm.title.trim();
        const feeRaw = courseForm.fee.trim();
        const normalizedFee = feeRaw
          ? feeRaw.replace(/\/month$/i, "") + "/Month"
          : "";
      const formattedTimings = formatTimingsFromFields(courseForm);
      const payload = {
        title: trimmedTitle,
        section: courseForm.section,
        board: courseForm.board,
        branch: courseForm.branch,
        fee: normalizedFee,
        timings: formattedTimings,
        duration: courseForm.duration.trim(),
        description: courseForm.description.trim(),
        highlights: parsedHighlights,
        subjects: parsedSubjects,
        additionalDetails: parsedAdditionalDetails,
        grade: gradeValue || undefined,
        grades: limitedGrades,
        courseType: courseForm.courseType,
        showOnHome: courseForm.showOnHome,
        showOnCourse: courseForm.showOnCourse,
      };
      const hasHome = courseForm.showOnHome;
      const hasCourse = courseForm.showOnCourse;
      const visibility =
        hasHome && hasCourse ? "both" : hasHome ? "home" : "course";
      payload.visibility = visibility;

      const isEditingCourse = Boolean(editingCourseId);
      if (isEditingCourse) {
        await apiClient.put(`/courses/${editingCourseId}`, payload, {
          headers,
        });
      } else {
        await apiClient.post("/courses", payload, { headers });
      }

      setCourseStatus(
        isEditingCourse ? "Course updated successfully." : "Course published successfully.",
      );
      setCourseListStatus(
        isEditingCourse ? "Course refreshed in the library." : "Course published to the library.",
      );
      setCourseForm(initialCourseState);
      setEditingCourseId("");
      await fetchCourseList();
    } catch (error) {
      const fallbackMessage = editingCourseId
        ? "Unable to update course."
        : "Unable to publish course.";
      setCourseStatus(error.message || fallbackMessage);
    } finally {
      setCourseLoading(false);
    }
  };

const handleCourseTypeChange = (value) => {
  setCourseForm((prev) => {
    const shouldUpdateTitle = prev.titleSynced || !prev.title;
    return {
      ...prev,
      courseType: value,
      gradeSelection: "",
      gradeSelections: [],
      title: shouldUpdateTitle ? COURSE_TYPE_LABELS[value] || value : prev.title,
      titleSynced: shouldUpdateTitle,
    };
  });
};

const handleSectionChange = (value) => {
  setCourseForm((prev) => ({
    ...prev,
    section: value,
    gradeSelection: "",
    gradeSelections: [],
  }));
};

const handleBranchChange = (value) => {
  const allowedSubjectIds = subjectsList
    .filter((subject) => getSubjectBranches(subject).includes(value))
    .map((subject) => subject._id);
  setCourseForm((prev) => ({
    ...prev,
    branch: value,
    selectedSubjects: prev.selectedSubjects.filter((id) =>
      allowedSubjectIds.includes(id),
    ),
  }));
};

const handleTitleChange = (value) => {
  setCourseForm((prev) => ({
    ...prev,
    title: value,
    titleSynced:
      value === COURSE_TYPE_LABELS[prev.courseType] ||
      value.toLowerCase() === prev.courseType,
  }));
};

  const handleComboGradeToggle = (grade) => {
    setCourseForm((prev) => ({
      ...prev,
      gradeSelections: toggleComboGrade({
        grade,
        currentSelections: prev.gradeSelections,
      }),
    }));
  };

  const handleEditCourse = (course) => {
    const highlights = Array.isArray(course.highlights) ? course.highlights : [];
    const additionalDetails = Array.isArray(course.additionalDetails)
      ? course.additionalDetails
      : [];
    const courseGrades =
      Array.isArray(course.grades) && course.grades.length
        ? course.grades
        : course.grade
        ? [course.grade]
        : [];
    const isCombo = course.courseType === "combo";
    const gradeSelection = isCombo ? "" : courseGrades[0] || "";
    const gradeSelections = isCombo ? courseGrades.slice(0, 2) : [];
    const courseLabel =
      COURSE_TYPE_LABELS[course.courseType] || course.courseType || "";
    const parsedTimings = parseTimingsString(course.timings);
    const timingString =
      course.timings || formatTimingsFromFields(parsedTimings);
    setCourseForm({
      title: course.title || courseLabel,
      section: course.section || "Primary",
      board: course.board || "State",
      branch: course.branch || DEFAULT_BRANCH,
      fee: course.fee || "",
      timings: timingString,
      timingDay: parsedTimings.timingDay,
      timingStartHour: parsedTimings.timingStartHour,
      timingStartMinute: parsedTimings.timingStartMinute,
      timingStartPeriod: parsedTimings.timingStartPeriod,
      timingEndHour: parsedTimings.timingEndHour,
      timingEndMinute: parsedTimings.timingEndMinute,
      timingEndPeriod: parsedTimings.timingEndPeriod,
      duration: course.duration || "12 months",
      description: course.description || "",
      highlights: highlights.join(", "),
      additionalDetails: additionalDetails.join("\n"),
      selectedSubjects: [],
      courseType: course.courseType || "individual",
      gradeSelection,
      gradeSelections,
      titleSynced: (course.title || "").trim() === courseLabel,
      showOnHome:
        course.visibility
          ? course.visibility !== "course"
          : Boolean(course.showOnHome),
      showOnCourse:
        course.visibility
          ? course.visibility !== "home"
          : course.showOnCourse ?? true,
    });
    setEditingCourseId(course._id || course.id || "");
    setCourseStatus("");
    setCourseListStatus(`Editing ${course.title || "course"}.`);
    setPendingSubjectMatches(course.subjects || []);
  };

  const handleDeleteCourse = async (course) => {
    if (!isAdminAuthenticated) {
      setCourseListStatus("Log in to delete courses.");
      return;
    }
    const proceed = window.confirm(
      `Delete "${course.title || "this course"}"? This cannot be undone.`,
    );
    if (!proceed) return;

    setCoursesLoading(true);
    setCourseListStatus("");
    try {
      await apiClient.delete(`/courses/${course._id || course.id}`, {
        headers,
      });
      setCourseListStatus(
        `Removed ${course.title || "course"} from the library.`,
      );
      if (editingCourseId) {
        handleCancelEdit();
      }
      await fetchCourseList();
    } catch (error) {
      setCourseListStatus(error.message || "Unable to delete course.");
    } finally {
      setCoursesLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setCourseForm(initialCourseState);
    setEditingCourseId("");
    setCourseStatus("");
    setCourseListStatus("");
  };

  useEffect(() => {
    if (
      courseForm.courseType === "individual" &&
      courseForm.gradeSelection &&
      courseForm.titleSynced &&
      courseForm.title !== courseForm.gradeSelection
    ) {
      setCourseForm((prev) => ({
        ...prev,
        title: prev.gradeSelection,
      }));
    }
  }, [
    courseForm.courseType,
    courseForm.gradeSelection,
    courseForm.titleSynced,
    courseForm.title,
  ]);

  const courseHighlightsPreview = useMemo(
    () =>
      (courseForm.highlights || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    [courseForm.highlights],
  );

  const courseSubjectsPreview = useMemo(() => {
    const selectedSubjectDetails = subjectsList.filter((subject) =>
      courseForm.selectedSubjects.includes(subject._id),
    );
    return selectedSubjectDetails.map(({ name, faculty }) => ({
      name,
      faculty: faculty || "Faculty",
    }));
  }, [courseForm.selectedSubjects, subjectsList]);

  const courseAdditionalDetailsPreview = useMemo(
    () =>
      (courseForm.additionalDetails || "")
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean),
    [courseForm.additionalDetails],
  );

  const previewGradeSelection = courseForm.gradeSelection;
  const previewGradeList =
    courseForm.courseType === "combo"
      ? courseForm.gradeSelections
      : previewGradeSelection
      ? [previewGradeSelection]
      : [];

  const isEditingCourse = Boolean(editingCourseId);
  const courseActionLabel = isEditingCourse ? "Save changes" : "Publish Course";
  const courseLoadingLabel = isEditingCourse ? "Updating..." : "Publishing...";

  const libraryStandardOptions = useMemo(() => {
    const seen = new Set();
    coursesList.forEach((course) => {
      if (course.grade) {
        seen.add(course.grade);
      }
      if (Array.isArray(course.grades)) {
        course.grades.forEach((grade) => {
          if (grade) seen.add(grade);
        });
      }
    });
    return Array.from(seen);
  }, [coursesList]);

  const filteredCourseLibrary = useMemo(() => {
    return coursesList.filter((course) => {
      if (libraryFilters.section && course.section !== libraryFilters.section) {
        return false;
      }
      if (libraryFilters.branch && course.branch !== libraryFilters.branch) {
        return false;
      }
      if (libraryFilters.standard) {
        const normalizedStandard = libraryFilters.standard.trim();
        const hasGrade =
          (course.grade && course.grade.trim() === normalizedStandard) ||
          (Array.isArray(course.grades) &&
            course.grades.some((grade) => grade?.trim() === normalizedStandard));
        if (!hasGrade) {
          return false;
        }
      }
      return true;
    });
  }, [coursesList, libraryFilters]);

  const renderCourseLibrary = () => (
    <motion.div className="rounded-[32px] border border-white/10 bg-white/95 p-6 shadow-2xl space-y-4 text-slate-900">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Course library
          </p>
          <h3 className="text-2xl font-black uppercase">Published batches</h3>
        </div>
        <button
          type="button"
          onClick={handleCancelEdit}
          className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#D41304] transition hover:text-[#a10c12]"
        >
          New course
        </button>
      </div>
      {courseListStatus && (
        <p className="text-xs uppercase tracking-[0.3em] text-[#D41304]">
          {courseListStatus}
        </p>
      )}
      <div className="grid gap-3 md:grid-cols-3">
        <select
          value={libraryFilters.section}
          onChange={(e) =>
            setLibraryFilters((prev) => ({
              ...prev,
              section: e.target.value,
            }))
          }
          className="rounded-2xl border border-slate-300 px-3 py-2 text-xs uppercase tracking-[0.3em] text-slate-600 focus:border-[#D41304] focus:outline-none"
        >
          <option value="">All sections</option>
          {SECTION_FILTER_OPTIONS.map((section) => (
            <option key={section} value={section}>
              {section}
            </option>
          ))}
        </select>
        <select
          value={libraryFilters.branch}
          onChange={(e) =>
            setLibraryFilters((prev) => ({
              ...prev,
              branch: e.target.value,
            }))
          }
          className="rounded-2xl border border-slate-300 px-3 py-2 text-xs uppercase tracking-[0.3em] text-slate-600 focus:border-[#D41304] focus:outline-none"
        >
          <option value="">All branches</option>
          {FACULTY_BRANCH_OPTIONS.map((branch) => (
            <option key={branch} value={branch}>
              {branch}
            </option>
          ))}
        </select>
        <select
          value={libraryFilters.standard}
          onChange={(e) =>
            setLibraryFilters((prev) => ({
              ...prev,
              standard: e.target.value,
            }))
          }
          className="rounded-2xl border border-slate-300 px-3 py-2 text-xs uppercase tracking-[0.3em] text-slate-600 focus:border-[#D41304] focus:outline-none"
        >
          <option value="">All standards</option>
          {libraryStandardOptions.map((standard) => (
            <option key={standard} value={standard}>
              {standard}
            </option>
          ))}
        </select>
      </div>
      {coursesError && <p className="text-sm text-rose-500">{coursesError}</p>}
      {coursesLoading ? (
        <p className="text-sm text-slate-500">Syncing course list...</p>
      ) : !coursesList.length ? (
        <p className="text-sm text-slate-500">
          No courses have been saved yet.
        </p>
      ) : !filteredCourseLibrary.length ? (
        <p className="text-sm text-slate-500 uppercase tracking-[0.3em]">
          No courses match the selected filters.
        </p>
      ) : (
        <div className="grid gap-3">
          {filteredCourseLibrary.map((course) => {
            const details = Array.isArray(course.additionalDetails)
              ? course.additionalDetails
              : [];
            const detailPreview = details.slice(0, 2).join(" · ");
            return (
              <div key={course._id || course.id} className="relative">
                <button
                  type="button"
                  onClick={() => handleEditCourse(course)}
                  className="w-full rounded-2xl border border-white/10 bg-white/60 px-4 py-3 text-left text-sm text-slate-900 transition hover:border-[#D41304] hover:shadow-lg"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-base font-semibold text-slate-900">
                      {course.title || "Untitled course"}
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.35em] text-slate-500">
                      {course.section || "Section"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    {course.board || "Board"} · Branch:{" "}
                    {course.branch || DEFAULT_BRANCH} · Fee: {course.fee || "TBD"} ·
                    Timings: {course.timings || "TBD"}
                  </p>
                  {detailPreview && (
                    <p className="mt-2 text-xs text-slate-500">
                      {detailPreview}
                      {details.length > 2 ? "..." : ""}
                    </p>
                  )}
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleDeleteCourse(course);
                  }}
                  className="absolute top-2 right-3 text-[10px] font-bold uppercase tracking-[0.35em] text-rose-600 hover:text-rose-400"
                >
                  Delete
                </button>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );

  const subjectsForBranch = useMemo(() => {
    const branchValue = courseForm.branch || DEFAULT_BRANCH;
    if (!branchValue) {
      return subjectsList;
    }
    return subjectsList.filter((subject) =>
      getSubjectBranches(subject).includes(branchValue),
    );
  }, [courseForm.branch, subjectsList]);

  const groupedSubjects = useMemo(() => {
    const grouped = {};
    subjectsForBranch.forEach((subject) => {
      grouped[subject.faculty] = grouped[subject.faculty] || [];
      grouped[subject.faculty].push(subject);
    });
    return grouped;
  }, [subjectsForBranch]);

  return (
    <div className="space-y-6">
      <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] items-start">
        <motion.form
          onSubmit={handleCourseSubmit}
          className="rounded-[32px] border border-white/10 bg-white/95 p-6 shadow-2xl space-y-5 text-slate-900"
        >
          <div className="flex items-center justify-between text-sm font-black uppercase tracking-[0.3em] text-slate-500">
            <span>Courses</span>
            <span>
              {courseStatus
                ? courseStatus.includes("saved")
                  ? "Saved"
                  : "Pending"
                : "Idle"}
            </span>
          </div>
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <select
                value={courseForm.courseType}
                onChange={(e) => handleCourseTypeChange(e.target.value)}
                className="rounded-2xl border border-slate-300 px-3 py-3 text-sm focus:border-[#D41304] focus:outline-none"
              >
                <option value="individual">Individual</option>
                <option value="combo">Combo</option>
              </select>
              <input
                type="text"
                placeholder="Course title"
                value={courseForm.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-[#D41304] focus:outline-none"
                required
              />
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <select
                value={courseForm.section}
                onChange={(e) => handleSectionChange(e.target.value)}
                className="rounded-2xl border border-slate-300 px-3 py-3 text-sm focus:border-[#D41304] focus:outline-none"
              >
                {sectionOptions.map((section) => (
                  <option key={section}>{section}</option>
                ))}
              </select>
              <select
                value={courseForm.board}
                onChange={(e) =>
                  setCourseForm((prev) => ({
                    ...prev,
                    board: e.target.value,
                  }))
                }
                className="rounded-2xl border border-slate-300 px-3 py-3 text-sm focus:border-[#D41304] focus:outline-none"
              >
                {["State", "CBSE", "ICSE", "Other"].map((board) => (
                  <option key={board}>{board}</option>
                ))}
              </select>
              <select
                value={courseForm.branch}
                onChange={(e) => handleBranchChange(e.target.value)}
                className="rounded-2xl border border-slate-300 px-3 py-3 text-sm focus:border-[#D41304] focus:outline-none"
              >
                {FACULTY_BRANCH_OPTIONS.map((branch) => (
                  <option key={branch}>{branch}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-3">
              {courseForm.courseType === "individual" ? (
                <select
                  value={courseForm.gradeSelection}
                  onChange={(e) =>
                    setCourseForm({
                      ...courseForm,
                      gradeSelection: e.target.value,
                    })
                  }
                  className="rounded-2xl border border-slate-300 px-3 py-3 text-sm focus:border-[#D41304] focus:outline-none"
                >
                  <option value="">Grade / standard</option>
                  {getGradesForSection(courseForm.section).map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="grid gap-2 text-sm text-slate-700">
                  <p className="text-[10px] uppercase tracking-[0.35em] text-slate-500">
                    Select up to 2 standards
                  </p>
                  <div className="grid gap-2 md:grid-cols-2">
                    {getGradesForSection(courseForm.section).map((grade) => {
                      const selected = courseForm.gradeSelections.includes(grade);
                      return (
                        <label
                          key={grade}
                          className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-1 text-[11px] font-semibold tracking-[0.3em] uppercase text-slate-700"
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => handleComboGradeToggle(grade)}
                            className="h-4 w-4 rounded border border-slate-300 accent-[#D41304]"
                          />
                          {grade}
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">
                Visibility
              </p>
              <div className="mt-2 space-y-2">
                <label className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em]">
                  <input
                    type="checkbox"
                    checked={courseForm.showOnCourse}
                    onChange={(e) =>
                      setCourseForm((prev) => ({
                        ...prev,
                        showOnCourse: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 rounded border border-slate-300 accent-[#D41304]"
                  />
                  Course page
                </label>
                <label className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em]">
                  <input
                    type="checkbox"
                    checked={courseForm.showOnHome}
                    onChange={(e) =>
                      setCourseForm((prev) => ({
                        ...prev,
                        showOnHome: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 rounded border border-slate-300 accent-[#D41304]"
                  />
                  Home page
                </label>
              </div>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Fee (e.g. Rs. 2000/Month)"
                value={courseForm.fee}
                onChange={(e) =>
                  setCourseForm({ ...courseForm, fee: e.target.value })
                }
                className="rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-[#D41304] focus:outline-none"
              />
              <div className="rounded-2xl border border-slate-300 bg-white/90 px-4 py-3 space-y-3">
                <div>
                  <label className="text-[10px] uppercase tracking-[0.3em] text-slate-500">
                    Day
                  </label>
                  <select
                    value={courseForm.timingDay}
                    onChange={(e) =>
                      updateTimingFields({ timingDay: e.target.value })
                    }
                    className="w-full rounded-2xl border border-slate-300 px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] focus:border-[#D41304] focus:outline-none"
                  >
                    {TIMING_DAY_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">
                    Start · End
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex gap-1 items-center">
                      <select
                        value={courseForm.timingStartHour}
                        onChange={(e) =>
                          updateTimingFields({ timingStartHour: e.target.value })
                        }
                        className="rounded-2xl border border-slate-300 px-2 py-2 text-xs font-semibold uppercase tracking-[0.3em] focus:border-[#D41304] focus:outline-none"
                      >
                        {TIMING_HOURS.map((hour) => (
                          <option key={`s-${hour}`} value={hour}>
                            {hour}
                          </option>
                        ))}
                      </select>
                      <select
                        value={courseForm.timingStartMinute}
                        onChange={(e) =>
                          updateTimingFields({
                            timingStartMinute: e.target.value,
                          })
                        }
                        className="rounded-2xl border border-slate-300 px-2 py-2 text-xs font-semibold uppercase tracking-[0.3em] focus:border-[#D41304] focus:outline-none"
                      >
                        {TIMING_MINUTES.map((minute) => (
                          <option key={`s-m-${minute}`} value={minute}>
                            {minute}
                          </option>
                        ))}
                      </select>
                      <select
                        value={courseForm.timingStartPeriod}
                        onChange={(e) =>
                          updateTimingFields({
                            timingStartPeriod: e.target.value,
                          })
                        }
                        className="rounded-2xl border border-slate-300 px-2 py-2 text-xs font-semibold uppercase tracking-[0.3em] focus:border-[#D41304] focus:outline-none"
                      >
                        {TIMING_PERIODS.map((period) => (
                          <option key={`s-p-${period}`} value={period}>
                            {period.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.3em] text-slate-400">
                      to
                    </span>
                    <div className="flex gap-1 items-center">
                      <select
                        value={courseForm.timingEndHour}
                        onChange={(e) =>
                          updateTimingFields({ timingEndHour: e.target.value })
                        }
                        className="rounded-2xl border border-slate-300 px-2 py-2 text-xs font-semibold uppercase tracking-[0.3em] focus:border-[#D41304] focus:outline-none"
                      >
                        {TIMING_HOURS.map((hour) => (
                          <option key={`e-${hour}`} value={hour}>
                            {hour}
                          </option>
                        ))}
                      </select>
                      <select
                        value={courseForm.timingEndMinute}
                        onChange={(e) =>
                          updateTimingFields({
                            timingEndMinute: e.target.value,
                          })
                        }
                        className="rounded-2xl border border-slate-300 px-2 py-2 text-xs font-semibold uppercase tracking-[0.3em] focus:border-[#D41304] focus:outline-none"
                      >
                        {TIMING_MINUTES.map((minute) => (
                          <option key={`e-m-${minute}`} value={minute}>
                            {minute}
                          </option>
                        ))}
                      </select>
                      <select
                        value={courseForm.timingEndPeriod}
                        onChange={(e) =>
                          updateTimingFields({ timingEndPeriod: e.target.value })
                        }
                        className="rounded-2xl border border-slate-300 px-2 py-2 text-xs font-semibold uppercase tracking-[0.3em] focus:border-[#D41304] focus:outline-none"
                      >
                        {TIMING_PERIODS.map((period) => (
                          <option key={`e-p-${period}`} value={period}>
                            {period.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">
              Time: {courseForm.timings}
            </p>
            <input
              type="text"
              placeholder="Duration (e.g. 6 months)"
              value={courseForm.duration}
              onChange={(e) =>
                setCourseForm({ ...courseForm, duration: e.target.value })
              }
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-[#D41304] focus:outline-none"
            />
            <textarea
              placeholder="Short description"
              value={courseForm.description}
              onChange={(e) =>
                setCourseForm({ ...courseForm, description: e.target.value })
              }
              className="w-full rounded-3xl border border-slate-300 px-4 py-3 text-sm focus:border-[#D41304] focus:outline-none"
              rows={3}
            />
            <input
              type="text"
              placeholder="Highlights (comma separated)"
              value={courseForm.highlights}
              onChange={(e) =>
                setCourseForm({ ...courseForm, highlights: e.target.value })
              }
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-[#D41304] focus:outline-none"
            />
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-slate-500">
                Subjects
              </p>
              {subjectsError && (
                <p className="text-[10px] text-rose-500">{subjectsError}</p>
              )}
              {subjectsLoading ? (
                <p className="text-xs text-slate-500">Loading subjects...</p>
              ) : !subjectsList.length ? (
                <p className="text-xs text-slate-500">
                  No subjects yet. Add them via the Subjects tab.
                </p>
              ) : subjectsForBranch.length ? (
                <div className="space-y-3">
                  {Object.entries(groupedSubjects).map(
                    ([faculty, subjectGroup]) => (
                      <div
                        key={faculty}
                        className="rounded-2xl border border-slate-200/60 bg-white/70 p-3"
                      >
                        <p className="text-[10px] uppercase tracking-[0.3em] text-slate-600">
                          {faculty}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {subjectGroup.map((subject) => {
                            const idValue = subject._id;
                            const isChecked = courseForm.selectedSubjects.includes(
                              idValue,
                            );
                            return (
                              <label
                                key={idValue}
                                className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-1 text-[11px] font-semibold tracking-[0.3em] uppercase text-slate-700"
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  value={idValue}
                                  onChange={() => {
                                    setCourseForm((prev) => {
                                      const selected =
                                        prev.selectedSubjects.includes(idValue)
                                          ? prev.selectedSubjects.filter(
                                              (id) => id !== idValue,
                                            )
                                          : [...prev.selectedSubjects, idValue];
                                      return {
                                        ...prev,
                                        selectedSubjects: selected,
                                      };
                                    });
                                  }}
                                  className="h-4 w-4 rounded border border-slate-300 accent-[#D41304]"
                                />
                                {subject.name}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  No subjects available for the {courseForm.branch || DEFAULT_BRANCH} branch.
                  Add them via the Subjects tab.
                </p>
              )}
            </div>
            <textarea
              placeholder="Additional details (one per line)"
              value={courseForm.additionalDetails}
              onChange={(e) =>
                setCourseForm({
                  ...courseForm,
                  additionalDetails: e.target.value,
                })
              }
              className="w-full rounded-3xl border border-slate-300 px-4 py-3 text-sm focus:border-[#D41304] focus:outline-none"
              rows={3}
            />
          </div>
          <button
            type="submit"
            disabled={courseLoading}
            className={`${buttonStyles} bg-gradient-to-r from-[#D41304] to-[#F97316] text-white w-full flex justify-center ${
              courseLoading ? "opacity-70" : ""
            }`}
          >
            {courseLoading ? courseLoadingLabel : courseActionLabel}
          </button>
          {courseStatus && (
            <p className={`text-[11px] ${statusColor(courseStatus)}`}>
              {courseStatus}
            </p>
          )}
        </motion.form>
        <motion.div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-[#111827] to-[#0f172a] p-6 shadow-2xl space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">
              Course preview
            </p>
            <h3 className="text-2xl font-black text-white">
              {courseForm.title || "Course title"}
            </h3>
            <p className="text-sm text-white/60 min-h-[48px]">
              {courseForm.description ||
                "Descriptions surface here once you populate the form."}
            </p>
          </div>
          <div className="grid gap-1 text-xs text-white/70">
            <p className="flex items-center justify-between">
              <span>Section</span>
              <span className="text-white/40">{courseForm.section}</span>
            </p>
            <p className="flex items-center justify-between">
              <span>Branch</span>
              <span className="text-white/40">
                {courseForm.branch || DEFAULT_BRANCH}
              </span>
            </p>
            <p className="flex items-center justify-between">
              <span>Timings</span>
              <span className="text-white/40">
                {courseForm.timings || "TBD"}
              </span>
            </p>
            <p className="flex items-center justify-between">
              <span>Fee</span>
              <span className="text-white/40">
                {courseForm.fee || "Contact us"}
              </span>
            </p>
            <p className="flex items-center justify-between">
              <span>Duration</span>
              <span className="text-white/40">
                {courseForm.duration || "Flexible"}
              </span>
            </p>
          </div>
          <div className="grid gap-2 text-[10px] uppercase tracking-[0.35em] text-white/60">
            {previewGradeList.length ? (
              <p>Grade: {previewGradeList.join(" / ")}</p>
            ) : (
              <p>Grade: Pending</p>
            )}
            <p>Type: {courseForm.courseType}</p>
          </div>
          {courseHighlightsPreview.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-white/60">
                Highlights
              </p>
              <ul className="grid gap-2 text-xs text-white/70">
                {courseHighlightsPreview.slice(0, 3).map((highlight) => (
                  <li key={highlight} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {courseSubjectsPreview.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-white/60">
                Subjects
              </p>
              <div className="grid gap-1 text-xs text-white/70">
                {courseSubjectsPreview.slice(0, 3).map((subject) => (
                  <p key={subject.name} className="flex justify-between">
                    <span>{subject.name}</span>
                    <span className="text-white/50">{subject.faculty}</span>
                  </p>
                ))}
              </div>
            </div>
          )}
          {courseAdditionalDetailsPreview.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-white/60">
                Additional details
              </p>
              <ul className="mt-2 grid gap-2 text-xs text-white/70">
                {courseAdditionalDetailsPreview.map((detail) => (
                  <li key={detail} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-rose-400" />
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      </div>
      {renderCourseLibrary()}
    </div>
  );
};

export default CoursesPanel;
