import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { apiClient } from "../lib/apiClient";
import Toppercard, {
  topperDefaultSubjects,
} from "../components/result/Toppercard";
import GalleryDisplay from "./Gallery";
import { buildSectionsFromResults } from "../lib/topperUtils";
import { useAdminSession } from "../contexts/AdminSession";
import { useNavigate } from "react-router-dom";
import AdminHeader from "../components/admin/AdminHeader";
import PasswordChangeCard from "../components/admin/PasswordChangeCard";
import PanelSelector from "../components/admin/PanelSelector";
import CoursesPanel from "../components/admin/panels/CoursesPanel";
import { buttonStyles } from "../components/admin/buttonStyles";
import statusColor from "../components/admin/statusColor";
import { FACULTY_BRANCH_OPTIONS, DEFAULT_BRANCH } from "../data/branches";

const RESULT_STANDARD_OPTIONS = ["SSC", "HSC"];
const RESULT_STANDARD_TOTALS = {
  SSC: 500,
  HSC: 600,
};
const DEFAULT_RESULT_STANDARD = RESULT_STANDARD_OPTIONS[0];
const getResultTotalMarks = (standard) => RESULT_STANDARD_TOTALS[standard] ?? 500;

const initialResultState = {
  firstName: "",
  lastName: "",
  standard: DEFAULT_RESULT_STANDARD,
  school: "",
  year: new Date().getFullYear(),
  percentage: "",
  marks: "",
  notes: "",
  profileImage: "",
  profileImagePosition: { x: 50, y: 50 },
  showOnHome: false,
  outOf: getResultTotalMarks(DEFAULT_RESULT_STANDARD),
  subjects: [],
};

const initialStudentState = {
  name: "",
  photoUrl: "",
  standard: "",
  branch: DEFAULT_BRANCH,
  batchYear: new Date().getFullYear(),
  photoPosition: {
    x: 50,
    y: 50,
  },
};

const initialLeaderboardState = {
  name: "",
  standard: "",
  category: "",
  score: "",
  rank: "",
  year: new Date().getFullYear(),
  photoUrl: "",
  notes: "",
};

const initialGalleryState = {
  title: "",
  category: "",
  imageUrl: "",
  description: "",
  uploadedImage: "",
  featured: false,
};

const initialOfferState = {
  imageUrl: "",
  caption: "",
  link: "",
  isActive: true,
};

const romanStandards = [
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "SSC",
  "Class XI Commerce",
  "Class XII Commerce",
];
const panelTabs = [
  {
    id: "courses",
    label: "Courses",
    description: "Publish batches and update home highlights.",
  },
    {
      id: "subjects",
      label: "Faculty",
      description: "Manage faculty-subject pairs for new courses.",
    },
  {
    id: "results",
    label: "Results",
    description: "Add topper accolades with live preview.",
  },
  {
    id: "students",
    label: "Students",
    description: "Log student profiles for global lookup.",
  },
  {
    id: "chat",
    label: "Chat",
    description: "Review inbound admission inquiries.",
  },
  {
    id: "offers",
    label: "Offers",
    description: "Control the promotional banner that sits above the results.",
  },
  {
    id: "leaderboard",
    label: "Leaderboard",
    description: "Save leaderboard tiles before publishing.",
  },
  {
    id: "gallery",
    label: "Gallery",
    description: "Upload event imagery for the gallery.",
  },
];

const Admin = () => {
  const { credentials, isAdminAuthenticated, login, logout } = useAdminSession();
  const [subjectsList, setSubjectsList] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [subjectsError, setSubjectsError] = useState("");
  const [subjectForm, setSubjectForm] = useState({
    name: "",
    faculty: "",
    branches: FACULTY_BRANCH_OPTIONS,
  });
  const [subjectBranchFilter, setSubjectBranchFilter] = useState("");
  const [subjectNameFilter, setSubjectNameFilter] = useState("");
  const [subjectStatus, setSubjectStatus] = useState("");
  const [subjectLoading, setSubjectLoading] = useState(false);
  const [subjectListStatus, setSubjectListStatus] = useState("");

  const [resultForm, setResultForm] = useState(initialResultState);
  const [resultStatus, setResultStatus] = useState("");
  const [resultLoading, setResultLoading] = useState(false);

  const [studentForm, setStudentForm] = useState(initialStudentState);
  const [studentStatus, setStudentStatus] = useState("");
  const [studentLoading, setStudentLoading] = useState(false);
  const [studentsList, setStudentsList] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState("");
  const [studentsListStatus, setStudentsListStatus] = useState("");
  const [editingStudentId, setEditingStudentId] = useState("");
  const [deletingStudentId, setDeletingStudentId] = useState("");
  const [deletingStudentGroupKey, setDeletingStudentGroupKey] = useState("");

  const [leaderboardForm, setLeaderboardForm] = useState(
    initialLeaderboardState,
  );
  const [leaderboardStatus, setLeaderboardStatus] = useState("");
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardGroup, setLeaderboardGroup] = useState({
    standard: "",
    batchYear: new Date().getFullYear(),
    branch: DEFAULT_BRANCH,
  });
  const [leaderboardSelections, setLeaderboardSelections] = useState(
    Array.from({ length: 3 }, () => ({ studentId: "", percentage: "" })),
  );
  const [leaderboardSearch, setLeaderboardSearch] = useState("");
  const [showLeaderboardForm, setShowLeaderboardForm] = useState(false);
  const [leaderboardList, setLeaderboardList] = useState([]);
  const [leaderboardListLoading, setLeaderboardListLoading] = useState(false);
  const [leaderboardListError, setLeaderboardListError] = useState("");
  const [leaderboardListStatus, setLeaderboardListStatus] = useState("");
  const [leaderboardFilterKey, setLeaderboardFilterKey] = useState("");
  const [leaderboardDeletionLoading, setLeaderboardDeletionLoading] = useState("");

  const [galleryForm, setGalleryForm] = useState(initialGalleryState);
  const [galleryStatus, setGalleryStatus] = useState("");
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryList, setGalleryList] = useState([]);
  const [galleryListLoading, setGalleryListLoading] = useState(false);
  const [galleryListError, setGalleryListError] = useState("");
  const [galleryListStatus, setGalleryListStatus] = useState("");
  const [galleryBulkFiles, setGalleryBulkFiles] = useState([]);
  const [bulkUploadCategory, setBulkUploadCategory] = useState("");
  const [galleryBulkStatus, setGalleryBulkStatus] = useState("");
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkUploadProgress, setBulkUploadProgress] = useState(0);
  const [folderActionStatus, setFolderActionStatus] = useState("");
  const [folderRenameTarget, setFolderRenameTarget] = useState("");
  const [folderRenameValue, setFolderRenameValue] = useState("");
  const progressTimer = useRef(null);
  const [offerForm, setOfferForm] = useState(initialOfferState);
  const [offerStatus, setOfferStatus] = useState("");
  const [offerSubmitting, setOfferSubmitting] = useState(false);
  const [offersList, setOffersList] = useState([]);
  const [offersLoading, setOffersLoading] = useState(false);
  const [offersError, setOffersError] = useState("");
  const [offerListStatus, setOfferListStatus] = useState("");
  const [deletingOfferId, setDeletingOfferId] = useState("");
  const [offerUploadError, setOfferUploadError] = useState("");
  const [inquiriesList, setInquiriesList] = useState([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);
  const [inquiriesError, setInquiriesError] = useState("");
  const [deletingInquiryId, setDeletingInquiryId] = useState("");
  const [resultPreviewSide, setResultPreviewSide] = useState("front");
  const [activePanel, setActivePanel] = useState(panelTabs[0].id);
  const [resultList, setResultList] = useState([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsError, setResultsError] = useState("");
  const [resultListStatus, setResultListStatus] = useState("");
  const [deletingResultId, setDeletingResultId] = useState("");
  const [editingResultId, setEditingResultId] = useState("");
  const resultSections = useMemo(
    () => (resultList.length ? buildSectionsFromResults(resultList) : []),
    [resultList],
  );

  const groupedLeaderboardEntries = useMemo(() => {
    if (!leaderboardList.length) return [];
    const map = new Map();
    leaderboardList.forEach((entry) => {
      const standard = entry.standard || "Standard";
      const year = entry.year || entry.batchYear || new Date().getFullYear();
      const branch = entry.branch || DEFAULT_BRANCH;
      const key = `${branch}|${standard}|${year}`;
      if (!map.has(key)) {
        map.set(key, { key, standard, branch, year, entries: [] });
      }
      map.get(key).entries.push(entry);
    });
    const getEntryScore = (entry) =>
      Number(entry.score ?? entry.percentage ?? 0);

    return Array.from(map.values())
      .sort((a, b) => {
        const yearDiff = Number(b.year) - Number(a.year);
        if (yearDiff !== 0) return yearDiff;
        const branchDiff = (a.branch || "").localeCompare(b.branch || "");
        if (branchDiff !== 0) return branchDiff;
        return (a.standard || "").localeCompare(b.standard || "");
      })
      .map((group) => ({
        ...group,
        entries: [...group.entries].sort((a, b) => {
          const scoreDiff = getEntryScore(b) - getEntryScore(a);
          if (scoreDiff !== 0) return scoreDiff;
          return (a.rank || 0) - (b.rank || 0);
        }),
      }));
  }, [leaderboardList]);

  const existingLeaderboardGroups = useMemo(() => {
    const map = new Map();
    groupedLeaderboardEntries.forEach((group) => {
      const branchKey = group.branch || DEFAULT_BRANCH;
      const standardLabel = group.standard || "Standard";
      const key = `${branchKey}|${standardLabel}`;
      if (!map.has(key)) {
        map.set(key, {
          key,
          branch: branchKey,
          standard: standardLabel,
          label: `${branchKey} · ${standardLabel}`,
        });
      }
    });
    return Array.from(map.values());
  }, [groupedLeaderboardEntries]);

  const existingLeaderboardKeys = useMemo(
    () =>
      new Set(
        existingLeaderboardGroups
          .map((item) => item.key)
          .filter((key) => !!key),
      ),
    [existingLeaderboardGroups],
  );

  const sortedInquiries = useMemo(() => {
    return [...inquiriesList].sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime() || 0;
      const timeB = new Date(b.createdAt).getTime() || 0;
      return timeB - timeA;
    });
  }, [inquiriesList]);

  const formatInquiryTimestamp = (value) => {
    if (!value) return "Unknown";
    const timestamp = new Date(value);
    if (!Number.isFinite(timestamp.getTime())) return "Unknown";
    return timestamp.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const [studentBranchFilter, setStudentBranchFilter] = useState(
    DEFAULT_BRANCH,
  );
  const [studentStandardFilter, setStudentStandardFilter] = useState("");
  const [studentSearch, setStudentSearch] = useState("");

  const filteredStudents = useMemo(() => {
    return studentsList
      .filter((student) =>
        studentBranchFilter
          ? (student.branch || DEFAULT_BRANCH) === studentBranchFilter
          : true,
      )
      .filter((student) =>
        studentStandardFilter
          ? (student.standard || "").toLowerCase() ===
            studentStandardFilter.toLowerCase()
          : true,
      );
  }, [studentsList, studentBranchFilter, studentStandardFilter]);
  const normalizedStudentSearch = studentSearch.trim().toLowerCase();
  const filteredStudentsWithSearch = useMemo(() => {
    if (!normalizedStudentSearch) return filteredStudents;
    return filteredStudents.filter((student) => {
      const nameValue = (student.name || "").toLowerCase();
      return nameValue.includes(normalizedStudentSearch);
    });
  }, [filteredStudents, normalizedStudentSearch]);

  const displayStudents = filteredStudentsWithSearch;

  const groupedStudents = useMemo(() => {
    if (!displayStudents.length) return [];
    const map = new Map();
    displayStudents.forEach((student) => {
      const standard = student.standard || "Standard";
      const year =
        student.batchYear && Number.isFinite(Number(student.batchYear))
          ? Number(student.batchYear)
          : new Date().getFullYear();
      const key = `${standard}|${year}`;
      if (!map.has(key)) {
        map.set(key, { key, standard, year, entries: [] });
      }
      map.get(key).entries.push(student);
    });
    return Array.from(map.values())
      .map((group) => ({
        ...group,
        entries: [...group.entries].sort((a, b) => {
          const aName = (a.name || "").toLowerCase();
          const bName = (b.name || "").toLowerCase();
          return aName.localeCompare(bName);
        }),
      }))
      .sort((a, b) => {
        const yearDiff = Number(b.year) - Number(a.year);
        if (yearDiff !== 0) return yearDiff;
        return a.standard.localeCompare(b.standard);
      });
  }, [displayStudents]);

  const isCreationBlocked =
    !!leaderboardGroup.standard &&
    !!leaderboardGroup.branch &&
    existingLeaderboardKeys.has(
      `${leaderboardGroup.branch}|${leaderboardGroup.standard}`,
    );

  const [previewSchoolName, setPreviewSchoolName] = useState(
    "Vidya Coaching Classes",
  );
  const [previewSubjects, setPreviewSubjects] = useState(() =>
    topperDefaultSubjects.map((subject) => ({ ...subject })),
  );

  const parsedMarks = Number(resultForm.marks);
  const parsedPercentage = Number(resultForm.percentage);
  const parsedOutOf = Number(resultForm.outOf);
  const previewOutOfValue =
    Number.isFinite(parsedOutOf) && parsedOutOf > 0 ? parsedOutOf : 500;
  const derivedPreviewPercentage =
    Number.isFinite(parsedMarks) && previewOutOfValue
      ? Number(((parsedMarks / previewOutOfValue) * 100).toFixed(2))
      : undefined;
  const previewPercentage =
    Number.isFinite(parsedPercentage) && parsedPercentage >= 0
      ? parsedPercentage
      : derivedPreviewPercentage;
  const previewMarks = Number.isFinite(parsedMarks) ? parsedMarks : undefined;
  const previewName =
    [resultForm.firstName, resultForm.lastName].filter(Boolean).join(" ") ||
    "Vidya Coaching Scholar";
  const previewGrade = resultForm.standard || "Vidya Coaching";
  const previewYear = resultForm.year || new Date().getFullYear();
  const previewImagePositionX = resultForm.profileImagePosition?.x ?? 50;
  const previewImagePositionY = resultForm.profileImagePosition?.y ?? 50;
  const sanitizedPreviewSubjects = previewSubjects
    .map(({ subject, mark }) => {
      const normalizedSubject = (subject || "").trim();
      const markValue =
        mark === "" || mark === null ? null : Number(mark);
      return {
        subject: normalizedSubject,
        mark: Number.isFinite(markValue) ? markValue : null,
      };
    })
    .filter((subject) => !!subject.subject);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordStatus, setPasswordStatus] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const headers = useMemo(() => {
    if (!isAdminAuthenticated) return {};
    return {
      "x-admin-username": credentials.username,
      "x-admin-password": credentials.password,
    };
  }, [isAdminAuthenticated, credentials.username, credentials.password]);

  const fetchInquiries = useCallback(async () => {
    if (!isAdminAuthenticated) {
      setInquiriesList([]);
      return;
    }
    setInquiriesError("");
    setInquiriesLoading(true);
    try {
      const data = await apiClient.get("/inquiries", {}, { headers });
      setInquiriesList(Array.isArray(data) ? data : []);
    } catch (error) {
      setInquiriesError(error.message || "Unable to load inquiries.");
    } finally {
      setInquiriesLoading(false);
    }
  }, [headers, isAdminAuthenticated]);

  const handleDeleteInquiry = useCallback(
    async (inquiryId) => {
      if (!inquiryId || !isAdminAuthenticated) return;
      setDeletingInquiryId(inquiryId);
      try {
        await apiClient.delete(`/inquiries/${inquiryId}`, {}, { headers });
        await fetchInquiries();
      } catch (error) {
        setInquiriesError(error.message || "Unable to delete inquiry.");
      } finally {
        setDeletingInquiryId("");
      }
    },
    [fetchInquiries, headers, isAdminAuthenticated],
  );

  const navigate = useNavigate();

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);
  const notifyHomeRefresh = useCallback((sections = []) => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent("vidya-home-refresh", { detail: { sections } }),
    );
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/admin/login", { replace: true });
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordForm;
    if (!newPassword.trim()) {
      setPasswordStatus("Provide a new password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus("New password and confirmation must match.");
      return;
    }
    setPasswordStatus("");
    setPasswordLoading(true);
    try {
      await apiClient.post(
        "/admin/password",
        {
          currentPassword: currentPassword || "",
          newPassword,
        },
        { headers },
      );
      setPasswordStatus("Password updated.");
      login(credentials.username, newPassword);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      setPasswordStatus(error?.message || "Unable to change the password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const updatePasswordFormField = (field, value) =>
    setPasswordForm((prev) => ({ ...prev, [field]: value }));

  useEffect(() => {
    setPreviewSchoolName(resultForm.school || "Vidya Coaching Classes");
  }, [resultForm.school]);

  const fetchResultList = async () => {
    setResultsError("");
    setResultsLoading(true);
    try {
      const data = await apiClient.get("/results");
      setResultList(Array.isArray(data) ? data : []);
    } catch (error) {
      setResultsError(error.message || "Unable to load result cards.");
    } finally {
      setResultsLoading(false);
    }
  };

  const fetchSubjectList = async () => {
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
  };

  const handleSubjectSubmit = async (event) => {
    event.preventDefault();
    setSubjectStatus("");
    const name = subjectForm.name.trim();
    const faculty = subjectForm.faculty.trim();
    if (!name || !faculty) {
      setSubjectStatus("Both subject name and faculty are required.");
      return;
    }
    setSubjectLoading(true);
    try {
      const branches =
        Array.isArray(subjectForm.branches) && subjectForm.branches.length
          ? subjectForm.branches
          : FACULTY_BRANCH_OPTIONS;
      await apiClient.post(
        "/subjects",
        { name, faculty, branches },
        { headers },
      );
      setSubjectStatus("Subject saved");
      setSubjectForm({
        name: "",
        faculty: "",
        branches: FACULTY_BRANCH_OPTIONS,
      });
      setSubjectListStatus("Subject library updated");
      fetchSubjectList();
    } catch (error) {
      setSubjectStatus(error.message || "Unable to save subject.");
    } finally {
      setSubjectLoading(false);
    }
  };

  const handleBranchToggle = (branch) => {
    setSubjectForm((prev) => {
      const current = prev.branches || [];
      const has = current.includes(branch);
      if (has) {
        if (current.length <= 1) {
          return prev;
        }
        return {
          ...prev,
          branches: current.filter((item) => item !== branch),
        };
      }
      return {
        ...prev,
        branches: [...current, branch],
      };
    });
  };

  const handleDeleteSubject = async (subjectId) => {
    if (!subjectId) return;
    setSubjectsError("");
    setSubjectListStatus("");
    try {
      await apiClient.delete(`/subjects/${subjectId}`, { headers });
      setSubjectListStatus("Subject removed");
      fetchSubjectList();
    } catch (error) {
      setSubjectsError(error.message || "Unable to delete the subject.");
    }
  };

  const fetchOfferList = async () => {
    setOffersError("");
    setOffersLoading(true);
    try {
      const data = await apiClient.get("/offers");
      setOffersList(Array.isArray(data) ? data : []);
    } catch (error) {
      setOffersError(error.message || "Unable to load offers.");
    } finally {
      setOffersLoading(false);
    }
  };

  const fetchStudentList = async () => {
    setStudentsError("");
    setStudentsLoading(true);
    try {
      const data = await apiClient.get("/students");
      setStudentsList(Array.isArray(data) ? data : []);
    } catch (error) {
      setStudentsError(error.message || "Unable to load student directory.");
    } finally {
      setStudentsLoading(false);
    }
  };

  const fetchGalleryList = async () => {
    setGalleryListError("");
    setGalleryListLoading(true);
    setGalleryListStatus("");
    try {
      const data = await apiClient.get("/gallery");
      setGalleryList(Array.isArray(data) ? data : []);
    } catch (error) {
      setGalleryListError(error.message || "Unable to load gallery assets.");
    } finally {
      setGalleryListLoading(false);
    }
  };

  const readFileAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result?.toString() ?? "");
      reader.onerror = () =>
        reject(new Error("Unable to read the selected file."));
      reader.readAsDataURL(file);
    });

  const handleGalleryBulkFilesChange = async (event) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    const supported = ["image/jpeg", "image/png", "image/webp"];
    const prepared = [];
    for (const file of files) {
      if (!supported.includes(file.type)) {
        setGalleryBulkStatus("Only JPG, PNG or WebP files can be uploaded.");
        continue;
      }
      const preview = URL.createObjectURL(file);
      try {
        const dataUrl = await readFileAsDataUrl(file);
        prepared.push({
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          fileName: file.name,
          title: file.name.replace(/\.[^.]+$/, ""),
          description: "",
          preview,
          dataUrl,
          featured: false,
        });
      } catch (error) {
        URL.revokeObjectURL(preview);
        setGalleryBulkStatus("Unable to read one of the selected files.");
      }
    }
    if (prepared.length) {
      setGalleryBulkFiles((prev) => [...prev, ...prepared]);
      setGalleryBulkStatus("");
    }
    event.target.value = "";
  };

  const handleRemoveBulkFile = (id) => {
    setGalleryBulkFiles((prev) => {
      const next = prev.filter((item) => {
        if (item.id === id) {
          URL.revokeObjectURL(item.preview);
          return false;
        }
        return true;
      });
      return next;
    });
  };

  const clearBulkFiles = () => {
    galleryBulkFiles.forEach((item) => URL.revokeObjectURL(item.preview));
    setGalleryBulkFiles([]);
  };

  const startBulkProgress = () => {
    if (progressTimer.current) {
      clearInterval(progressTimer.current);
    }
    setBulkUploadProgress(10);
    progressTimer.current = setInterval(() => {
      setBulkUploadProgress((prev) =>
        Math.min(92, prev + Math.round(Math.random() * 8) + 2),
      );
    }, 300);
  };

  const stopBulkProgress = () => {
    if (progressTimer.current) {
      clearInterval(progressTimer.current);
      progressTimer.current = null;
    }
    setBulkUploadProgress(100);
    setTimeout(() => setBulkUploadProgress(0), 600);
  };

  const updateBulkFileField = (id, field, value) => {
    setGalleryBulkFiles((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  const handleBulkUpload = async () => {
    if (!isAdminAuthenticated) {
      setGalleryBulkStatus("Log in to upload gallery images.");
      return;
    }
    if (!bulkUploadCategory.trim()) {
      setGalleryBulkStatus("Assign a folder/category before uploading.");
      return;
    }
    if (!galleryBulkFiles.length) {
      setGalleryBulkStatus("Select at least one image to upload.");
      return;
    }
    setBulkUploading(true);
    setGalleryBulkStatus("");
    startBulkProgress();
    try {
      const payload = galleryBulkFiles.map((item) => ({
        title: item.title || item.fileName,
        category: bulkUploadCategory.trim(),
        description: item.description,
        imageUrl: item.dataUrl,
        featured: item.featured,
      }));
      await apiClient.post("/gallery/batch", { images: payload }, { headers });
      setGalleryBulkStatus(`Uploaded ${galleryBulkFiles.length} image(s).`);
      clearBulkFiles();
      setBulkUploadCategory("");
      await fetchGalleryList();
      notifyHomeRefresh(["gallery"]);
    } catch (error) {
      setGalleryBulkStatus(error.message || "Unable to upload gallery images.");
    } finally {
      setBulkUploading(false);
      stopBulkProgress();
    }
  };

  const handleToggleImageFeatured = async (imageId, featured) => {
    if (!isAdminAuthenticated) {
      setGalleryListStatus("Log in to update featured images.");
      return;
    }
    try {
      await apiClient.put(`/gallery/${imageId}`, { featured }, { headers });
      setGalleryList((prev) =>
        prev.map((img) => (img._id === imageId ? { ...img, featured } : img)),
      );
      setGalleryListStatus(
        featured
          ? "Image will now appear on the homepage gallery."
          : "Image removed from the homepage gallery.",
      );
      notifyHomeRefresh(["gallery"]);
    } catch (error) {
      setGalleryListStatus(error.message || "Unable to update featured state.");
    }
  };

  const handleGalleryImageDelete = async (imageId) => {
    if (!isAdminAuthenticated) {
      setGalleryListStatus("Log in to delete gallery images.");
      return;
    }
    const proceed = window.confirm(
      "Delete this image from the gallery? This cannot be undone.",
    );
    if (!proceed) return;
    try {
      await apiClient.delete(`/gallery/${imageId}`, { headers });
      setGalleryList((prev) => prev.filter((img) => img._id !== imageId));
      setGalleryListStatus("Gallery image removed.");
      notifyHomeRefresh(["gallery"]);
    } catch (error) {
      setGalleryListStatus(error.message || "Unable to delete the image.");
    }
  };

  const handleFolderRename = async () => {
    if (!isAdminAuthenticated) {
      setFolderActionStatus("Log in to rename folders.");
      return;
    }
    if (!folderRenameTarget || !folderRenameValue.trim()) {
      setFolderActionStatus("Select a folder and enter a new name.");
      return;
    }
    try {
      await apiClient.put(
        `/gallery/categories/${encodeURIComponent(folderRenameTarget)}`,
        { newName: folderRenameValue.trim() },
        { headers },
      );
      setFolderActionStatus(`Folder renamed to ${folderRenameValue.trim()}.`);
      setFolderRenameTarget("");
      setFolderRenameValue("");
      await fetchGalleryList();
      notifyHomeRefresh(["gallery"]);
    } catch (error) {
      setFolderActionStatus(error.message || "Unable to rename the folder.");
    }
  };

  const handleFolderDelete = async (category) => {
    if (!isAdminAuthenticated) {
      setFolderActionStatus("Log in to delete folders.");
      return;
    }
    const proceed = window.confirm(
      `Delete the folder "${category}" and all its images?`,
    );
    if (!proceed) return;
    try {
      await apiClient.delete(
        `/gallery/categories/${encodeURIComponent(category)}`,
        { headers },
      );
      setFolderActionStatus(`Folder ${category} deleted.`);
      if (folderRenameTarget === category) {
        setFolderRenameTarget("");
        setFolderRenameValue("");
      }
      await fetchGalleryList();
      notifyHomeRefresh(["gallery"]);
    } catch (error) {
      setFolderActionStatus(error.message || "Unable to delete the folder.");
    }
  };

  const fetchLeaderboardList = async () => {
    setLeaderboardListError("");
    setLeaderboardListLoading(true);
    try {
      const data = await apiClient.get("/leaderboard");
      setLeaderboardList(Array.isArray(data) ? data : []);
    } catch (error) {
      setLeaderboardListError(
        error.message || "Unable to load leaderboard entries.",
      );
    } finally {
      setLeaderboardListLoading(false);
    }
  };

  const handleDeleteFilteredStandard = async () => {
    if (!leaderboardFilterKey) return;
    const selectedGroup = existingLeaderboardGroups.find(
      (group) => group.key === leaderboardFilterKey,
    );
    if (!selectedGroup) return;
    if (!isAdminAuthenticated) {
      setLeaderboardListStatus("Log in to delete leaderboard entries.");
      return;
    }
    const proceed = window.confirm(
      `Delete all leaderboard entries for ${selectedGroup.label}?`,
    );
    if (!proceed) return;
    setLeaderboardDeletionLoading("standard");
    setLeaderboardListStatus("Deleting leaderboard entries...");
    try {
      await apiClient.delete(
        "/leaderboard",
        {
          standard: selectedGroup.standard,
          branch: selectedGroup.branch,
        },
        { headers },
      );
      setLeaderboardListStatus("Leaderboard entries deleted.");
      setLeaderboardFilterKey("");
      await fetchLeaderboardList();
    } catch (error) {
      setLeaderboardListStatus(
        error.message || "Unable to delete the leaderboard entries.",
      );
    } finally {
      setLeaderboardDeletionLoading("");
    }
  };

  const handleDeleteAllLeaderboards = async () => {
    if (!isAdminAuthenticated) {
      setLeaderboardListStatus("Log in to delete leaderboard entries.");
      return;
    }
    const proceed = window.confirm("Delete all leaderboard entries?");
    if (!proceed) return;
    setLeaderboardDeletionLoading("all");
    setLeaderboardListStatus("Deleting leaderboard entries...");
    try {
      await apiClient.delete("/leaderboard", { headers });
      setLeaderboardListStatus("All leaderboard entries deleted.");
      setLeaderboardFilterStandard("");
      await fetchLeaderboardList();
    } catch (error) {
      setLeaderboardListStatus(
        error.message || "Unable to delete the leaderboard entries.",
      );
    } finally {
      setLeaderboardDeletionLoading("");
    }
  };

  const handleOfferFileSelection = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setOfferUploadError("Only image files are allowed.");
      return;
    }
    setOfferUploadError("");
    const reader = new FileReader();
    reader.onload = () => {
      setOfferForm((prev) => ({
        ...prev,
        imageUrl: reader.result?.toString() ?? prev.imageUrl,
      }));
    };
    reader.onerror = () => {
      setOfferUploadError("Unable to read the selected file. Try again.");
    };
    reader.readAsDataURL(file);
  };

  const handleOfferFileChange = (event) => {
    handleOfferFileSelection(event.target.files?.[0]);
  };

  const handleOfferDrop = (event) => {
    event.preventDefault();
    handleOfferFileSelection(event.dataTransfer?.files?.[0]);
  };

  const handleOfferDragOver = (event) => {
    event.preventDefault();
  };

  const handleOfferSubmit = async (event) => {
    event.preventDefault();
    if (!isAdminAuthenticated) {
      setOfferStatus("Log in to save the banner.");
      return;
    }
    setOfferSubmitting(true);
    setOfferStatus("");
    try {
      await apiClient.post("/offers", offerForm, { headers });
      setOfferStatus("Offer banner saved.");
      setOfferListStatus("Banner list refreshed.");
      setOfferForm(initialOfferState);
      await fetchOfferList();
    } catch (error) {
      setOfferStatus(error.message || "Unable to save the banner.");
    } finally {
      setOfferSubmitting(false);
    }
  };

  const handleDeleteOffer = async (offerId) => {
    if (!isAdminAuthenticated) {
      setOfferListStatus("Log in to delete banners.");
      return;
    }
    setDeletingOfferId(offerId);
    try {
      await apiClient.delete(`/offers/${offerId}`, { headers });
      setOfferListStatus("Offer removed.");
      await fetchOfferList();
    } catch (error) {
      setOffersError(error.message || "Unable to delete the banner.");
    } finally {
      setDeletingOfferId("");
    }
  };

  useEffect(() => {
    fetchResultList();
  }, [isAdminAuthenticated]);

  useEffect(() => {
    fetchSubjectList();
  }, [isAdminAuthenticated]);

  useEffect(() => {
    fetchOfferList();
  }, [isAdminAuthenticated]);
  useEffect(() => {
    fetchStudentList();
  }, [isAdminAuthenticated]);

  useEffect(() => {
    if (!isAdminAuthenticated) {
      return;
    }
    fetchGalleryList();
  }, [isAdminAuthenticated]);

  useEffect(() => {
    if (!isAdminAuthenticated) {
      return;
    }
    fetchLeaderboardList();
  }, [isAdminAuthenticated]);

  useEffect(() => {
    return () => {
      if (progressTimer.current) {
        clearInterval(progressTimer.current);
      }
    };
  }, []);

  const handleResultSubmit = async (e) => {
    e.preventDefault();
    if (!isAdminAuthenticated) {
      setResultStatus("Log in to submit results.");
      return;
    }
    setResultLoading(true);
    setResultStatus("");
    try {
      const firstName = resultForm.firstName.trim();
      const lastName = resultForm.lastName.trim();
      const studentName = [firstName, lastName].filter(Boolean).join(" ");
      const schoolName = previewSchoolName.trim();
      const payload = {
        ...resultForm,
        marks: Number.isFinite(parsedMarks) ? parsedMarks : undefined,
        outOf: previewOutOfValue,
        percentage:
          Number.isFinite(parsedPercentage)
            ? parsedPercentage
            : derivedPreviewPercentage,
        studentName,
        school: schoolName || undefined,
        subjects: sanitizedPreviewSubjects.length
          ? sanitizedPreviewSubjects
          : undefined,
      };
      delete payload.firstName;
      delete payload.lastName;
      const wasEditing = Boolean(editingResultId);
      if (wasEditing) {
        await apiClient.put(`/results/${editingResultId}`, payload, {
          headers,
        });
        setResultStatus("Result updated.");
      } else {
        await apiClient.post("/results", payload, { headers });
        setResultStatus("Result added to leaderboard.");
      }
      setResultForm(initialResultState);
      setPreviewSubjects(
        topperDefaultSubjects.map((subject) => ({ ...subject })),
      );
      setEditingResultId("");
      await fetchResultList();
      setResultListStatus(
        wasEditing ? "Result updated in library." : "Result saved to library.",
      );
      notifyHomeRefresh(["results"]);
    } catch (error) {
      setResultStatus(error.message || "Unable to add result.");
    } finally {
      setResultLoading(false);
    }
  };

  const handleDeleteResult = async (id) => {
    if (!isAdminAuthenticated) {
      setResultListStatus("Log in to delete cards.");
      return;
    }
    setResultListStatus("");
    setDeletingResultId(id);
    try {
      await apiClient.delete(`/results/${id}`, { headers });
      await fetchResultList();
      setResultListStatus("Card deleted.");
      notifyHomeRefresh(["results"]);
    } catch (error) {
      setResultsError(error.message || "Unable to delete the card.");
    } finally {
      setDeletingResultId("");
    }
  };

  const updateStudentPhotoPosition = (axis, value) => {
    const numericValue = Number(value);
    setStudentForm((prev) => ({
      ...prev,
      photoPosition: {
        ...prev.photoPosition,
        [axis]: Number.isNaN(numericValue) ? 50 : numericValue,
      },
    }));
  };

  const handleEditResult = (result) => {
    const nameParts = (result.studentName || "").trim().split(" ");
    const firstName = nameParts.shift() || "";
    const lastName = nameParts.join(" ");
    const previewSubjectsFromResult =
      Array.isArray(result.subjects) && result.subjects.length
        ? result.subjects.map((subject) => ({
            subject: subject.subject || "",
            mark: subject.mark ?? 0,
          }))
        : topperDefaultSubjects.map((subject) => ({ ...subject }));

    const resolvedStandard =
      RESULT_STANDARD_OPTIONS.includes(result.standard) && result.standard
        ? result.standard
        : DEFAULT_RESULT_STANDARD;

    setResultForm({
      firstName,
      lastName,
      standard: resolvedStandard,
      year: result.year ?? new Date().getFullYear(),
      percentage: result.percentage ?? "",
      marks: result.marks ?? "",
      notes: result.notes || "",
      profileImage: result.profileImage || "",
      profileImagePosition: {
        x: result.profileImagePosition?.x ?? 50,
        y: result.profileImagePosition?.y ?? 50,
      },
      school: result.school || "",
      outOf: result.outOf ?? getResultTotalMarks(resolvedStandard),
      subjects: result.subjects || [],
      showOnHome: result.showOnHome ?? false,
    });
    setPreviewSubjects(previewSubjectsFromResult);
    setPreviewSchoolName(result.school || "Vidya Coaching Classes");
    setEditingResultId(result._id);
    setResultStatus(`Editing ${result.studentName || "result"}.`);
  };

  const handleCancelResultEdit = () => {
    setResultForm(initialResultState);
    setPreviewSubjects(
      topperDefaultSubjects.map((subject) => ({ ...subject })),
    );
    setPreviewSchoolName("Vidya Coaching Classes");
    setEditingResultId("");
    setResultStatus("");
  };

  const handleLeaderboardSubmit = async (e) => {
    e.preventDefault();
    if (!isAdminAuthenticated) {
      setLeaderboardStatus("Log in to submit leaderboard entries.");
      return;
    }
    setLeaderboardLoading(true);
    setLeaderboardStatus("");
    try {
      await apiClient.post("/leaderboard", leaderboardForm, { headers });
      setLeaderboardStatus("Leaderboard entry saved.");
      setLeaderboardForm(initialLeaderboardState);
    } catch (error) {
      setLeaderboardStatus(error.message || "Unable to add entry.");
    } finally {
      setLeaderboardLoading(false);
    }
  };

  const handleToggleLeaderboardForm = () => {
    setShowLeaderboardForm((prev) => !prev);
    setLeaderboardStatus("");
  };

  const handleLeaderboardSelectionChange = (index, field, value) => {
    setLeaderboardSelections((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        [field]: value,
      };
      return next;
    });
  };


  const handleCreateLeaderboard = async (e) => {
    e.preventDefault();
    if (!isAdminAuthenticated) {
      setLeaderboardStatus("Log in to submit leaderboard entries.");
      return;
    }
  if (!leaderboardGroup.standard) {
    setLeaderboardStatus("Choose a standard.");
    return;
  }
  if (!leaderboardGroup.batchYear) {
    setLeaderboardStatus("Select batch year.");
    return;
  }
  if (!leaderboardGroup.branch) {
    setLeaderboardStatus("Choose a branch.");
    return;
  }
    const entries = leaderboardSelections
      .map((selection) => ({
        ...selection,
        percentage:
          selection.percentage === ""
            ? null
            : Number(selection.percentage) || null,
      }))
      .filter(
        (selection) =>
          selection.studentId && Number.isFinite(selection.percentage),
      )
      .sort(
        (a, b) =>
          (b.percentage ?? 0) - (a.percentage ?? 0) ||
          (b.rank || 0) - (a.rank || 0),
      )
      .map((selection, index) => ({
        ...selection,
        rank: index + 1,
      }));
    if (!entries.length) {
      setLeaderboardStatus(
        "Select at least one student and enter a percentage.",
      );
      return;
    }
    setLeaderboardLoading(true);
    setLeaderboardStatus("");
    try {
      const studentMap = studentsList.reduce((map, student) => {
        map[student._id] = student;
        return map;
      }, {});
      await Promise.all(
        entries.map((selection) => {
          const student = studentMap[selection.studentId];
          if (!student) return null;
           const percentageValue = Number(selection.percentage) || 0;
          const payload = {
            name: student.name,
            standard: leaderboardGroup.standard,
            category: `Batch ${leaderboardGroup.batchYear}`,
            score: percentageValue,
            percentage: percentageValue,
            rank: selection.rank,
            photoUrl: student.photoUrl || undefined,
            photoPosition: student.photoPosition || { x: 50, y: 50 },
            year: leaderboardGroup.batchYear,
            branch:
              leaderboardGroup.branch ||
              student.branch ||
              DEFAULT_BRANCH,
            notes: "Auto-generated leaderboard entry.",
          };
          return apiClient.post("/leaderboard", payload, { headers });
        }),
      );
      setLeaderboardStatus("Leaderboard saved.");
      setShowLeaderboardForm(false);
      setLeaderboardSelections(
        Array.from({ length: 3 }, () => ({ studentId: "", percentage: "" })),
      );
      setLeaderboardSearch("");
      fetchLeaderboardList();
    } catch (error) {
      setLeaderboardStatus(error.message || "Unable to save leaderboard.");
    } finally {
      setLeaderboardLoading(false);
    }
  };

  const handleGallerySubmit = async (e) => {
    e.preventDefault();
    if (!isAdminAuthenticated) {
      setGalleryStatus("Log in to add gallery images.");
      return;
    }
    setGalleryLoading(true);
    setGalleryStatus("");
    try {
      const payload = {
        ...galleryForm,
        imageUrl: galleryForm.uploadedImage || galleryForm.imageUrl,
      };
      delete payload.uploadedImage;
      await apiClient.post("/gallery", payload, { headers });
      setGalleryStatus("Gallery image added.");
      setGalleryForm(initialGalleryState);
      await fetchGalleryList();
      notifyHomeRefresh(["gallery"]);
    } catch (error) {
      setGalleryStatus(error.message || "Unable to add image.");
    } finally {
      setGalleryLoading(false);
    }
  };

  const updatePreviewSubject = (index, field, value) => {
    setPreviewSubjects((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        [field]: field === "mark" ? Number(value) : value,
      };
      return next;
    });
  };

  const removePreviewSubject = (index) => {
    setPreviewSubjects((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleProfileImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setResultForm((prev) => ({
        ...prev,
        profileImage: dataUrl,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleGalleryImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setGalleryForm((prev) => ({
        ...prev,
        imageUrl: dataUrl,
      }));
    };
    reader.readAsDataURL(file);
  };

  const updateImagePosition = (axis, value) => {
    setResultForm((prev) => ({
      ...prev,
      profileImagePosition: {
        ...prev.profileImagePosition,
        [axis]: Number(value),
      },
    }));
  };

  const parseNumberInput = (value) => {
    if (value === "" || value === null || value === undefined) return "";
    const parsed = Number(value);
    return Number.isNaN(parsed) ? "" : parsed;
  };

  const handleStudentPhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result?.toString() ?? "";
      setStudentForm((prev) => ({
        ...prev,
        photoUrl: dataUrl,
        photoPosition: prev.photoPosition || { x: 50, y: 50 },
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    if (!isAdminAuthenticated) {
      setStudentStatus("Log in to submit student records.");
      return;
    }
    const trimmedName = studentForm.name.trim();
    if (!trimmedName) {
      setStudentStatus("Provide the student name.");
      return;
    }
    setStudentLoading(true);
    setStudentStatus("");
    try {
      const payload = { ...studentForm, name: trimmedName };
      if (editingStudentId) {
        await apiClient.put(`/students/${editingStudentId}`, payload, {
          headers,
        });
        setStudentStatus("Student updated.");
      } else {
        await apiClient.post("/students", payload, { headers });
        setStudentStatus("Student saved.");
      }
      setStudentForm(initialStudentState);
      setEditingStudentId("");
      await fetchStudentList();
      setStudentsListStatus("Student directory updated.");
    } catch (error) {
      setStudentStatus(error.message || "Unable to save student.");
    } finally {
      setStudentLoading(false);
    }
  };

  const handleEditStudent = (student) => {
    setStudentForm({
      name: student.name || "",
      photoUrl: student.photoUrl || "",
      standard: student.standard || "",
      branch: student.branch || DEFAULT_BRANCH,
      batchYear: student.batchYear ?? new Date().getFullYear(),
      photoPosition: student.photoPosition || { x: 50, y: 50 },
    });
    setEditingStudentId(student._id);
    setStudentStatus(`Editing ${student.name}`);
  };

  const handleCancelStudentEdit = () => {
    setStudentForm(initialStudentState);
    setEditingStudentId("");
    setStudentStatus("");
  };

  const handleDeleteStudent = async (studentId) => {
    if (!isAdminAuthenticated) {
      setStudentsListStatus("Log in to delete students.");
      return;
    }
    const proceed = window.confirm(
      "Delete this student record? This cannot be undone.",
    );
    if (!proceed) return;
    setDeletingStudentId(studentId);
    try {
      await apiClient.delete(`/students/${studentId}`, { headers });
      await fetchStudentList();
      setStudentsListStatus("Student removed.");
    } catch (error) {
      setStudentsListStatus(error.message || "Unable to delete student.");
    } finally {
      setDeletingStudentId("");
    }
  };

  const handleDeleteStudentGroup = async (group) => {
    if (!isAdminAuthenticated) {
      setStudentsListStatus("Log in to delete students.");
      return;
    }
    const standardLabel = group.standard || "Standard";
    const yearLabel = group.year || new Date().getFullYear();
    const proceed = window.confirm(
      `Delete every student in ${standardLabel} (Batch ${yearLabel})? This cannot be undone.`,
    );
    if (!proceed) return;
    setDeletingStudentGroupKey(group.key);
    try {
      const params = new URLSearchParams({ standard: standardLabel });
      if (Number.isFinite(Number(yearLabel))) {
        params.append("batchYear", String(yearLabel));
      }
      await apiClient.delete(`/students/bulk?${params.toString()}`, { headers });
      await fetchStudentList();
      setStudentsListStatus(`${standardLabel} roster removed.`);
    } catch (error) {
      setStudentsListStatus(error.message || "Unable to delete students.");
    } finally {
      setDeletingStudentGroupKey("");
    }
  };

  const galleryManualUrlValue = galleryForm.uploadedImage
    ? ""
    : galleryForm.imageUrl;
  const galleryPreviewImage =
    galleryForm.uploadedImage ||
    galleryForm.imageUrl ||
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=60";
  const galleryPreviewTitle = galleryForm.title || "Gallery Image";
  const galleryPreviewCategory = galleryForm.category || "General";
  const galleryPreviewDescription =
    galleryForm.description ||
    "A short description will appear here once you fill the form.";
  const activeTab = panelTabs.find((tab) => tab.id === activePanel);

  const handleNumberFieldChange = (field) => (event) => {
    const parsed = parseNumberInput(event.target.value);
    setResultForm((prev) => ({
      ...prev,
      [field]: parsed,
    }));
  };

  const handleResultStandardChange = (event) => {
    const selected = event.target.value;
    setResultForm((prev) => ({
      ...prev,
      standard: selected,
      outOf: selected ? getResultTotalMarks(selected) : 500,
    }));
  };

  const filteredSubjects = useMemo(() => {
    return subjectsList.filter((subject) => {
      if (subjectBranchFilter && !(subject.branches || []).includes(subjectBranchFilter)) {
        return false;
      }
      if (subjectNameFilter && subject.name !== subjectNameFilter) {
        return false;
      }
      return true;
    });
  }, [subjectsList, subjectBranchFilter, subjectNameFilter]);

  const renderSubjectPanel = () => (
    <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] items-start">
      <motion.form
        onSubmit={handleSubjectSubmit}
        className="rounded-[32px] border border-white/10 bg-white/95 p-6 shadow-2xl space-y-5 text-slate-900"
      >
        <div className="flex items-center justify-between text-sm font-black uppercase tracking-[0.3em] text-slate-500">
          <span>Faculty</span>
          <span>
            {subjectStatus
              ? subjectStatus.includes("saved")
                ? "Saved"
                : "Pending"
              : "Idle"}
          </span>
        </div>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Subject name"
            value={subjectForm.name}
            onChange={(e) =>
              setSubjectForm({ ...subjectForm, name: e.target.value })
            }
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-[#D41304] focus:outline-none"
            required
          />
          <input
            type="text"
            placeholder="Faculty"
            value={subjectForm.faculty}
            onChange={(e) =>
              setSubjectForm({ ...subjectForm, faculty: e.target.value })
            }
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-[#D41304] focus:outline-none"
            required
          />
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 mb-2">
              Branch selection
            </p>
            <div className="flex flex-wrap gap-3">
              {FACULTY_BRANCH_OPTIONS.map((branch) => {
                const selected = subjectForm.branches.includes(branch);
                return (
                  <label
                    key={branch}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold tracking-[0.35em] uppercase ${
                      selected
                        ? "border-[#D41304] bg-[#ffece9] text-[#c42e3f]"
                        : "border-slate-300 bg-white text-slate-600"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => handleBranchToggle(branch)}
                      className="h-4 w-4 rounded border border-slate-300 accent-[#D41304]"
                    />
                    {branch}
                  </label>
                );
              })}
            </div>
          </div>
        </div>
        <button
          type="submit"
          disabled={subjectLoading}
          className={`${buttonStyles} bg-gradient-to-r from-[#F97316] to-[#D41304] text-white w-full flex justify-center ${
            subjectLoading ? "opacity-70" : ""
          }`}
        >
          {subjectLoading ? "Saving..." : "Save Faculty"}
        </button>
        {subjectStatus && (
          <p className={`text-[11px] ${statusColor(subjectStatus)}`}>
            {subjectStatus}
          </p>
        )}
      </motion.form>
      <motion.div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-[#111827] to-[#0f172a] p-6 shadow-2xl space-y-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-3">
            <select
              value={subjectBranchFilter}
              onChange={(e) => setSubjectBranchFilter(e.target.value)}
              className="rounded-2xl border border-white/20 bg-black/60 px-3 py-2 text-xs uppercase tracking-[0.3em] text-white"
            >
              <option value="">All branches</option>
              {FACULTY_BRANCH_OPTIONS.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
            <select
              value={subjectNameFilter}
              onChange={(e) => setSubjectNameFilter(e.target.value)}
              className="rounded-2xl border border-white/20 bg-black/60 px-3 py-2 text-xs uppercase tracking-[0.3em] text-white"
            >
              <option value="">All subjects</option>
              {Array.from(
                new Set(subjectsList.map((subject) => subject.name)).values(),
              )
                .sort()
                .map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/60">
                Library
              </p>
              <h3 className="text-2xl font-black uppercase text-white">
                Faculty list
              </h3>
            </div>
            {subjectListStatus && (
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">
                {subjectListStatus}
              </p>
            )}
          </div>
        </div>
        {subjectsError && (
          <p className="text-sm text-rose-400">{subjectsError}</p>
        )}
        {subjectsLoading ? (
          <p className="text-sm text-white/60">Syncing faculty...</p>
        ) : filteredSubjects.length ? (
            (() => {
              const grouped = {};
              filteredSubjects.forEach((subject) => {
                grouped[subject.faculty] = grouped[subject.faculty] || [];
                grouped[subject.faculty].push(subject);
              });
              return (
                <div className="space-y-4">
                  {Object.entries(grouped).map(([faculty, subjects]) => {
                    const branchSet = new Set();
                    subjects.forEach((subject) => {
                      (subject.branches || FACULTY_BRANCH_OPTIONS).forEach(
                        (branch) => branchSet.add(branch),
                      );
                    });
                    const branchLabel = branchSet.size
                      ? Array.from(branchSet).join(", ")
                      : "All branches";
                    return (
                      <div
                        key={faculty}
                        className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-white/80"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.35em] text-white/60">
                              {branchLabel}
                            </p>
                            <p className="text-base font-semibold">{faculty}</p>
                          </div>
                            <button
                              type="button"
                              onClick={() =>
                                subjects.forEach((subject) =>
                                  handleDeleteSubject(subject._id),
                                )
                              }
                              className="text-[10px] font-semibold uppercase tracking-[0.3em] text-rose-400 hover:text-rose-200"
                            >
                              Remove faculty
                            </button>
                        </div>
                        <div className="mt-2 grid gap-2 text-xs">
                          {subjects.map((subject) => (
                            <div
                              key={subject._id}
                              className="rounded-2xl border border-white/10 bg-black/30 px-3 py-2 space-y-1"
                            >
                              <div className="flex items-center justify-between">
                                <span>{subject.name}</span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSubject(subject._id)}
                                  className="text-[10px] font-semibold uppercase tracking-[0.3em] text-rose-400 hover:text-rose-200"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()
        ) : (
          <p className="text-sm text-white/60">No faculty entries yet.</p>
        )}
      </motion.div>
    </div>
  );

  const renderGroupedStudentDirectory = () => (
    <div className="space-y-5">
      {groupedStudents.map((group) => (
        <div
          key={group.key}
          className="rounded-[32px] border border-white/10 bg-black/40 p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.3em]">
                {group.standard}
              </p>
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/60">
                Batch {group.year}
              </p>
            </div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/60">
              {group.entries.length} students
            </p>
          </div>
          <div className="space-y-3">
            {group.entries.map((student) => (
              <div
                key={student._id}
                className="rounded-2xl border border-white/10 bg-black/50 p-4 space-y-2"
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-slate-900 overflow-hidden border border-white/20">
                    {student.photoUrl ? (
                      <img
                        src={student.photoUrl}
                        alt={student.name}
                        className="h-full w-full object-cover"
                        style={{
                          objectPosition: `${student.photoPosition?.x ?? 50}% ${student.photoPosition?.y ?? 50}%`,
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] uppercase text-white/60">
                        No photo
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.3em]">
                      {student.name}
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/60">
                      {student.standard || "Standard unknown"} · Batch{" "}
                      {student.batchYear || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 text-[10px] uppercase tracking-[0.3em]">
                  <button
                    type="button"
                    onClick={() => handleEditStudent(student)}
                    className="flex-1 rounded-full border border-white/30 px-3 py-1 text-white transition hover:border-white"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    disabled={
                      !isAdminAuthenticated || deletingStudentId === student._id
                    }
                    onClick={() => handleDeleteStudent(student._id)}
                    className={`flex-1 rounded-full border px-3 py-1 font-black tracking-[0.3em] transition ${
                      !isAdminAuthenticated || deletingStudentId === student._id
                        ? "border-white/30 text-white/40 cursor-not-allowed"
                        : "border-white/60 text-white hover:border-white"
                    }`}
                  >
                    {deletingStudentId === student._id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const toNumberOrNull = (value) => {
    if (value === "" || value === null || value === undefined) return null;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  };

  const renderResultList = () => (
    <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-2xl space-y-5 text-white">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-white/60">
            Result library
          </p>
          <h3 className="text-2xl font-black uppercase">All cards</h3>
        </div>
        {resultListStatus && (
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">
            {resultListStatus}
          </p>
        )}
      </div>
      {resultsError && <p className="text-sm text-rose-400">{resultsError}</p>}
      {resultsLoading ? (
        <p className="text-sm text-white/60">Syncing result cards...</p>
      ) : resultList.length ? (
        <div className="grid gap-6 md:grid-cols-2">
          {resultList.map((result) => {
            const position = result.profileImagePosition || {};
            const previewYearValue = result.year || new Date().getFullYear();
            const marksValue = toNumberOrNull(result.marks);
            const outOfValue = toNumberOrNull(result.outOf) ?? 500;
            const savedPercentage = toNumberOrNull(result.percentage);
            const derivedPercentage =
              marksValue !== null && outOfValue > 0
                ? Number(((marksValue / outOfValue) * 100).toFixed(1))
                : 0;
            const finalPercentage = savedPercentage ?? derivedPercentage;
            const derivedMarks =
              savedPercentage !== null && outOfValue > 0
                ? Math.min(
                    Math.round((savedPercentage / 100) * outOfValue),
                    outOfValue,
                  )
                : 0;
            const finalMarks = marksValue !== null ? marksValue : derivedMarks;
            const displaySchool = result.school || "Institution";
            return (
              <div
                key={result._id}
                className="space-y-3 rounded-[28px] border border-white/10 bg-white p-4 shadow-lg text-slate-900"
              >
                {(() => {
                  const resultSubjects =
                    Array.isArray(result.subjects) && result.subjects.length
                      ? result.subjects
                      : topperDefaultSubjects;
                  return (
                    <Toppercard
                      topper={result.studentName}
                      grade={result.standard || DEFAULT_RESULT_STANDARD}
                      year={String(previewYearValue)}
                      percentage={finalPercentage}
                      totalMarks={finalMarks}
                      school={displaySchool}
                      subjects={resultSubjects}
                      outOf={outOfValue}
                      imageUrl={result.profileImage}
                      imagePositionX={position.x ?? 50}
                      imagePositionY={position.y ?? 50}
                      flipSide="front"
                    />
                  );
                })()}
                <div className="flex flex-wrap items-center justify-end gap-3 text-[10px] uppercase tracking-[0.3em] text-slate-500">
                  <button
                    type="button"
                    onClick={() => handleEditResult(result)}
                    className="rounded-2xl border border-white/30 px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-white transition hover:border-white"
                  >
                    Edit card
                  </button>
                  <button
                    type="button"
                    disabled={!isAdminAuthenticated || deletingResultId === result._id}
                    onClick={() => handleDeleteResult(result._id)}
                    className={`rounded-2xl px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] transition ${
                      isAdminAuthenticated
                        ? "bg-rose-500 text-white hover:bg-rose-600"
                        : "bg-white/20 text-white/60 cursor-not-allowed"
                    }`}
                  >
                    {deletingResultId === result._id
                      ? "Deleting..."
                      : "Delete card"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-white/60">
          No result cards yet. Add one above to populate this list.
        </p>
      )}
      {!isAdminAuthenticated && (
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">
          Log in to delete cards.
        </p>
      )}
    </div>
  );

  const renderResultPreview = () => (
    <div className="space-y-10">
      {resultSections.length ? (
        resultSections.map((section) => (
          <section
            key={`${section.title}-${section.accent}`}
            className="space-y-6 rounded-[28px] border border-white/10 bg-white/5 p-5"
          >
            <div className="flex flex-wrap items-center gap-3">
              <h4 className="text-lg font-black tracking-tight uppercase text-white">
                {section.title}
              </h4>
              <div className="h-px flex-1 bg-white/20" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/60">
                {section.accent}
              </span>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {section.toppers.map((topper) => {
                const topperSubjects =
                  topper.subjects?.length ? topper.subjects : topperDefaultSubjects;
                return (
                  <div
                    key={topper.id ?? topper.name}
                    className="space-y-3 rounded-[28px] border border-white/20 bg-white p-4 shadow-lg text-slate-900"
                  >
                    <Toppercard
                      topper={topper.name}
                      grade={section.accent}
                      year={String(topper.year)}
                      percentage={topper.percentage}
                      totalMarks={topper.marks}
                      school={topper.school}
                      subjects={topperSubjects}
                      outOf={topper.outOf}
                      imageUrl={topper.imageUrl}
                      imagePositionX={topper.imagePositionX}
                      imagePositionY={topper.imagePositionY}
                      flipSide="front"
                    />
                    <div className="flex flex-wrap items-center justify-end gap-3 text-[10px] uppercase tracking-[0.3em] text-slate-500">
                      <button
                          type="button"
                          onClick={() => handleEditResult(topper.source ?? {})}
                          className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 transition hover:border-white/60"
                        >
                          Edit card
                        </button>
                      <button
                        type="button"
                        disabled={!isAdminAuthenticated || deletingResultId === topper.id}
                        onClick={() =>
                          handleDeleteResult(topper.id ?? topper.source?._id)
                        }
                        className={`rounded-2xl px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] transition ${
                          isAdminAuthenticated
                            ? "bg-rose-500 text-white hover:bg-rose-600"
                            : "bg-white/20 text-white/60 cursor-not-allowed"
                        }`}
                      >
                        {deletingResultId === topper.id
                          ? "Deleting..."
                          : "Delete card"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))
      ) : (
        <p className="text-sm text-white/60">
          No result cards yet. Add one above to populate this list.
        </p>
      )}
    </div>
  );

  const renderResultPanel = () => {
    const resultStatusIsPositive =
      typeof resultStatus === "string" &&
      /(added|updated|saved)/i.test(resultStatus);
    return (
      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.form
            onSubmit={handleResultSubmit}
            className="rounded-[32px] border border-white/10 bg-white/95 p-6 shadow-2xl space-y-6 text-slate-900"
          >
            <div className="flex items-center justify-between text-sm font-black uppercase tracking-[0.3em] text-slate-500">
              <span>Result editor</span>
              <div className="flex items-center gap-3">
                {resultStatus && (
                  <span>{resultStatusIsPositive ? "✓" : "•"}</span>
                )}
                {editingResultId && (
                  <button
                    type="button"
                    onClick={handleCancelResultEdit}
                    className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-slate-700 transition"
                  >
                    Cancel edit
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  placeholder="First name"
                  value={resultForm.firstName}
                  onChange={(e) =>
                    setResultForm({ ...resultForm, firstName: e.target.value })
                  }
                  className="rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-[#D41304] focus:outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="Last name"
                  value={resultForm.lastName}
                  onChange={(e) =>
                    setResultForm({ ...resultForm, lastName: e.target.value })
                  }
                  className="rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-[#D41304] focus:outline-none"
                />
              </div>
              <div className="grid gap-3">
                <select
                  value={resultForm.standard}
                  onChange={handleResultStandardChange}
                  className="rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-[#D41304] focus:outline-none bg-white"
                >
                  <option value="">Standard / Grade</option>
                  {RESULT_STANDARD_OPTIONS.map((label) => (
                    <option key={label} value={label}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <input
                  type="number"
                  placeholder="Year"
                  value={resultForm.year}
                  onChange={handleNumberFieldChange("year")}
                  className="rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-[#D41304] focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="Percentage (%)"
                  value={resultForm.percentage}
                  onChange={handleNumberFieldChange("percentage")}
                  className="rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-[#D41304] focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="Obtained marks"
                  value={resultForm.marks}
                  onChange={handleNumberFieldChange("marks")}
                  className="rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-[#D41304] focus:outline-none"
                />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  type="number"
                  placeholder="Out of (total marks)"
                  value={resultForm.outOf}
                  readOnly
                  className="rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-[#D41304] focus:outline-none"
                  aria-readonly="true"
                />
                <input
                  type="text"
                  placeholder="School / Institution"
                  value={previewSchoolName}
                  onChange={(e) => {
                    const value = e.target.value;
                    setPreviewSchoolName(value);
                    setResultForm((prev) => ({ ...prev, school: value }));
                  }}
                  className="rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-[#D41304] focus:outline-none"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  id="result-home-toggle"
                  type="checkbox"
                  checked={resultForm.showOnHome}
                  onChange={(e) =>
                    setResultForm({
                      ...resultForm,
                      showOnHome: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border border-slate-300 focus:ring-[#F97316]"
                />
                <span className="font-semibold text-[11px] uppercase tracking-[0.3em] text-slate-700">
                  Show on home page
                </span>
              </label>
            </div>
            <div className="space-y-3 text-slate-700">
              <div className="text-[10px] uppercase tracking-[0.3em] text-slate-500">
                <span>Subject marks</span>
              </div>
              <div className="space-y-3">
                {previewSubjects.map((subject, index) => (
                  <div
                    key={index}
                    className="grid gap-2 sm:grid-cols-[1.4fr_0.9fr_auto]"
                  >
                    <input
                      type="text"
                      value={subject.subject}
                      onChange={(e) =>
                        updatePreviewSubject(index, "subject", e.target.value)
                      }
                      className="rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-[#D41304] focus:outline-none"
                    />
                    <input
                      type="number"
                      value={subject.mark}
                      onChange={(e) =>
                        updatePreviewSubject(index, "mark", e.target.value)
                      }
                      className="rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-[#D41304] focus:outline-none"
                    />
                    {previewSubjects.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePreviewSubject(index)}
                        className="text-[10px] font-semibold uppercase tracking-[0.3em] text-amber-400 hover:text-amber-100"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 text-[10px] uppercase tracking-[0.3em] text-slate-600">
              <label className="flex flex-col gap-1">
                Horizontal focus
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={previewImagePositionX}
                  onChange={(e) => updateImagePosition("x", e.target.value)}
                  className="w-full accent-[#D41304]"
                />
                <span className="text-[10px] text-slate-500">
                  {previewImagePositionX}%
                </span>
              </label>
              <label className="flex flex-col gap-1">
                Vertical focus
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={previewImagePositionY}
                  onChange={(e) => updateImagePosition("y", e.target.value)}
                  className="w-full accent-[#D41304]"
                />
                <span className="text-[10px] text-slate-500">
                  {previewImagePositionY}%
                </span>
              </label>
            </div>
            <div className="space-y-3 text-[10px] uppercase tracking-[0.3em] text-slate-600">
              <label className="flex flex-col gap-1">
                Profile image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  className="mt-1 block w-full rounded-2xl border border-slate-300 px-3 py-2 text-sm focus:border-[#D41304] focus:outline-none"
                />
              </label>
              {resultForm.profileImage && (
                <button
                  type="button"
                  onClick={() =>
                    setResultForm((prev) => ({ ...prev, profileImage: "" }))
                  }
                  className="text-[10px] uppercase tracking-[0.3em] text-[#D41304] hover:text-[#a2292f]"
                >
                  Remove selected image
                </button>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="submit"
                disabled={resultLoading}
                className={`${buttonStyles} bg-gradient-to-r from-[#F97316] to-[#D41304] text-white w-full flex justify-center ${resultLoading ? "opacity-70" : ""}`}
              >
                {resultLoading ? "Saving..." : "Add Result"}
              </button>
              {resultStatus && (
                <p className={`text-[11px] ${statusColor(resultStatus)}`}>
                  {resultStatus}
                </p>
              )}
            </div>
          </motion.form>
          <motion.div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-[#111827] to-[#030712] p-5 text-white shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-white/60">
                  Live preview
                </p>
                <p className="text-[10px] text-white/50">
                  Use the buttons to flip between faces.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] transition ${resultPreviewSide === "front" ? "bg-white text-slate-900" : "bg-white/10 text-white/60 hover:bg-white/20"}`}
                  onClick={() => setResultPreviewSide("front")}
                >
                  Front
                </button>
                <button
                  type="button"
                  className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] transition ${resultPreviewSide === "back" ? "bg-white text-slate-900" : "bg-white/10 text-white/60 hover:bg-white/20"}`}
                  onClick={() => setResultPreviewSide("back")}
                >
                  Back
                </button>
              </div>
            </div>
            <div className="flex justify-center">
              <Toppercard
                topper={previewName}
                grade={previewGrade}
                year={String(previewYear)}
                percentage={previewPercentage}
                totalMarks={previewMarks}
                school={previewSchoolName}
                subjects={previewSubjects}
                outOf={previewOutOfValue}
                imageUrl={resultForm.profileImage}
                imagePositionX={previewImagePositionX}
                imagePositionY={previewImagePositionY}
                flipSide={resultPreviewSide}
              />
            </div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/60">
              Preview reflects the editor fields in real time. Hover the card on
              public pages to see the animation.
            </p>
          </motion.div>
        </div>
        {renderResultPreview()}
      </div>
    );
  };

  const renderStudentPanel = () => (
    <div className="space-y-6">
      <motion.form
        onSubmit={handleStudentSubmit}
        className="rounded-[32px] border border-white/10 bg-white/95 p-6 shadow-2xl space-y-6 text-slate-900"
      >
        <div className="flex items-center justify-between text-sm font-black uppercase tracking-[0.3em] text-slate-500">
          <span>Students</span>
          <span>
            {studentStatus && (studentStatus.includes("saved") ? "✓" : "•")}
          </span>
        </div>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Full name"
            value={studentForm.name}
            onChange={(e) =>
              setStudentForm((prev) => ({ ...prev, name: e.target.value }))
            }
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-[#D41304] focus:outline-none"
            required
          />
          <div className="grid gap-3 sm:grid-cols-3">
            <select
              value={studentForm.standard}
              onChange={(e) =>
                setStudentForm((prev) => ({
                  ...prev,
                  standard: e.target.value,
                }))
              }
              className="rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-[#D41304] focus:outline-none bg-white"
            >
              <option value="">Standard</option>
              {romanStandards.map((label) => (
                <option key={label} value={label}>
                  {label}
                </option>
              ))}
            </select>
            <select
              value={studentForm.branch}
              onChange={(e) =>
                setStudentForm((prev) => ({
                  ...prev,
                  branch: e.target.value,
                }))
              }
              className="rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-[#D41304] focus:outline-none bg-white"
            >
              {FACULTY_BRANCH_OPTIONS.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Batch year"
              value={studentForm.batchYear}
              min={2000}
              onChange={(e) =>
                setStudentForm((prev) => ({
                  ...prev,
                  batchYear: Number(e.target.value) || "",
                }))
              }
              className="rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-[#D41304] focus:outline-none"
            />
          </div>
          <div className="flex justify-center">
            <div className="h-24 w-24 rounded-full border border-slate-300 overflow-hidden bg-slate-100 shadow-inner mb-2">
              {studentForm.photoUrl ? (
                <img
                  src={studentForm.photoUrl}
                  alt="Student preview"
                  className="h-full w-full object-cover"
                  style={{
                    objectPosition: `${studentForm.photoPosition?.x ?? 50}% ${studentForm.photoPosition?.y ?? 50}%`,
                  }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[10px] uppercase text-slate-500">
                  Preview
                </div>
              )}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 text-[10px] uppercase tracking-[0.3em] text-slate-600 mb-2">
            <label className="flex flex-col gap-1">
              Horizontal focus
              <input
                type="range"
                min={0}
                max={100}
                value={studentForm.photoPosition?.x ?? 50}
                onChange={(e) =>
                  updateStudentPhotoPosition("x", e.target.value)
                }
                className="w-full accent-[#D41304]"
              />
              <span className="text-[10px] text-slate-500">
                {studentForm.photoPosition?.x ?? 50}%
              </span>
            </label>
            <label className="flex flex-col gap-1">
              Vertical focus
              <input
                type="range"
                min={0}
                max={100}
                value={studentForm.photoPosition?.y ?? 50}
                onChange={(e) =>
                  updateStudentPhotoPosition("y", e.target.value)
                }
                className="w-full accent-[#D41304]"
              />
              <span className="text-[10px] text-slate-500">
                {studentForm.photoPosition?.y ?? 50}%
              </span>
            </label>
          </div>
          <label className="flex flex-col gap-2 text-[10px] uppercase tracking-[0.3em] text-slate-600">
            Student photo
            <input
              type="file"
              accept="image/*"
              onChange={handleStudentPhotoChange}
              className="rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm focus:border-[#D41304] focus:outline-none file:cursor-pointer"
            />
          </label>
          {studentForm.photoUrl && (
            <div className="text-[10px] text-slate-500">
              Photo added and will be stored as base64.
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={studentLoading}
          className={`${buttonStyles} bg-gradient-to-r from-[#F97316] to-[#D41304] text-white w-full flex justify-center ${studentLoading ? "opacity-70" : ""}`}
        >
          {studentLoading
            ? editingStudentId
              ? "Updating..."
              : "Saving..."
            : editingStudentId
              ? "Update student"
              : "Save student"}
        </button>
        {editingStudentId && (
          <button
            type="button"
            onClick={handleCancelStudentEdit}
            disabled={studentLoading}
            className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-slate-700 transition mt-2"
          >
            Cancel edit
          </button>
        )}
        {studentStatus && (
          <p className={`text-[11px] ${statusColor(studentStatus)}`}>
            {studentStatus}
          </p>
        )}
      </motion.form>

      <motion.div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-2xl text-white space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.3em]">
            Student directory
          </p>
          <div className="flex items-center gap-3">
            <div className="hidden md:block w-[220px]">
              <input
                type="search"
                placeholder="Search by name"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full rounded-2xl border border-white/20 bg-black/40 px-3 py-2 text-[10px] uppercase tracking-[0.3em] text-white placeholder:text-white/50 focus:outline-none focus:border-[#D41304]"
              />
            </div>
            <select
              value={studentBranchFilter}
              onChange={(e) => setStudentBranchFilter(e.target.value)}
              className="rounded-2xl border border-white/20 bg-black/60 px-3 py-2 text-[10px] uppercase tracking-[0.3em] text-white"
            >
              {FACULTY_BRANCH_OPTIONS.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
            <select
              value={studentStandardFilter}
              onChange={(e) => setStudentStandardFilter(e.target.value)}
              className="rounded-2xl border border-white/20 bg-black/60 px-3 py-2 text-[10px] uppercase tracking-[0.3em] text-white"
            >
              <option value="">All standards</option>
              {romanStandards.map((label) => (
                <option key={label} value={label}>
                  {label}
                </option>
              ))}
            </select>
            {studentsListStatus && (
              <span className="text-[10px] uppercase tracking-[0.3em] text-emerald-300">
                {studentsListStatus}
              </span>
            )}
          </div>
          <div className="md:hidden">
            <input
              type="search"
              placeholder="Search by name"
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              className="w-full rounded-2xl border border-white/20 bg-black/40 px-3 py-2 text-[10px] uppercase tracking-[0.3em] text-white placeholder:text-white/50 focus:outline-none focus:border-[#D41304]"
            />
          </div>
        </div>
        {studentsError && (
          <p className="text-sm text-rose-400">{studentsError}</p>
        )}
        {studentsLoading ? (
          <p className="text-sm text-white/60">Syncing students...</p>
        ) : !studentsList.length ? (
          <p className="text-sm text-white/60">
            No students yet. Add one above.
          </p>
        ) : !displayStudents.length ? (
          <p className="text-sm text-white/60">
            No students recorded for {studentBranchFilter}
            {studentStandardFilter ? ` / ${studentStandardFilter}` : ""}.
            {studentSearch ? ` Search "${studentSearch}".` : ""}
          </p>
        ) : (
          <div className="space-y-5">
            {groupedStudents.map((group) => (
              <div
                key={group.key}
                className="rounded-3xl border border-white/10 bg-black/40 p-4 space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.3em] text-white">
                      {group.standard}
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/50">
                      Batch {group.year}
                    </p>
                  </div>
                  <div className="space-y-1 text-right text-[10px] uppercase tracking-[0.3em] text-white/60">
                    <p className="font-black text-sm text-white">
                      {group.entries.length} students
                    </p>
                    <button
                      type="button"
                      disabled={
                        !isAdminAuthenticated ||
                        deletingStudentGroupKey === group.key
                      }
                      onClick={() => handleDeleteStudentGroup(group)}
                      className="inline-flex items-center justify-center rounded-full border border-white/20 bg-[#D41304] px-4 py-1 text-[10px] font-black uppercase tracking-[0.3em] text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deletingStudentGroupKey === group.key
                        ? "Deleting..."
                        : "Delete standard"}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  {group.entries.map((student) => (
                    <div
                      key={student._id || `${student.name}-${student.batchYear}`}
                      className="rounded-2xl border border-white/5 bg-black/50 px-4 py-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-1 items-center gap-4">
                          <div className="h-20 w-20 rounded-3xl border border-white/10 overflow-hidden bg-slate-900">
                            {student.photoUrl ? (
                              <img
                                src={student.photoUrl}
                                alt={`Profile of ${student.name}`}
                                className="h-full w-full object-cover"
                                style={{
                                  objectPosition: `${student.photoPosition?.x ?? 50}% ${student.photoPosition?.y ?? 50}%`,
                                }}
                              />
                            ) : (
                              <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-[10px] uppercase tracking-[0.3em] text-white/60">
                                <span>No photo</span>
                                <span className="text-[8px]">Upload via form</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-black text-sm uppercase tracking-[0.3em]">
                              {student.name}
                            </p>
                            <p className="text-[9px] uppercase tracking-[0.4em] text-white/50">
                              Branch {student.branch || DEFAULT_BRANCH}
                            </p>
                            <p className="text-[10px] uppercase tracking-[0.3em] text-white/50">
                              Batch {student.batchYear || "N/A"}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteStudent(student._id)}
                          disabled={
                            !isAdminAuthenticated ||
                            deletingStudentId === student._id
                          }
                          className={`rounded-full border border-white/30 px-4 py-1 text-[10px] font-black uppercase tracking-[0.3em] transition ${
                            !isAdminAuthenticated ||
                            deletingStudentId === student._id
                              ? "text-white/40 border-white/30 cursor-not-allowed"
                              : "text-white hover:border-white"
                          }`}
                        >
                          {deletingStudentId === student._id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );

  const renderChatPanel = () => (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-[32px] border border-white/10 bg-gradient-to-br from-[#050912] to-[#0f172a] p-6 shadow-2xl space-y-4 text-white"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">
              Admissions chat
            </p>
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">
              {sortedInquiries.length} inquiries logged
            </p>
          </div>
          <button
            type="button"
            onClick={fetchInquiries}
            disabled={inquiriesLoading}
            className="rounded-full border border-white/30 px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-white transition disabled:opacity-50"
          >
            {inquiriesLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
          {inquiriesError && (
            <p className="text-sm text-rose-400">{inquiriesError}</p>
          )}
          {inquiriesLoading && !inquiriesError ? (
            <p className="text-sm text-white/60">Loading inquiries…</p>
          ) : sortedInquiries.length ? (
            <div className="space-y-4 max-h-[560px] overflow-y-auto pr-2">
              {sortedInquiries.map((inquiry) => (
                <div
                  key={inquiry._id ?? `${inquiry.email}-${inquiry.createdAt}`}
                  className="rounded-3xl border border-white/10 bg-black/30 p-5 space-y-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-black uppercase tracking-[0.3em] text-white">
                        {inquiry.name || "Unknown"}
                      </p>
                      <p className="text-[10px] uppercase tracking-[0.3em] text-white/50">
                        {inquiry.email || "Email missing"} ·{" "}
                        {inquiry.phone || "Phone missing"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">
                        {formatInquiryTimestamp(inquiry.createdAt)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteInquiry(inquiry._id)}
                        disabled={
                          !isAdminAuthenticated ||
                          deletingInquiryId === inquiry._id
                        }
                        className={`text-[10px] font-black uppercase tracking-[0.3em] transition ${
                          !isAdminAuthenticated || deletingInquiryId === inquiry._id
                            ? "text-white/40"
                            : "text-rose-400 hover:text-rose-300"
                        }`}
                      >
                        {deletingInquiryId === inquiry._id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                  <div className="grid gap-2 text-[11px] text-white/70">
                    <p>
                      <span className="font-semibold text-white/90">
                        Applying for:
                      </span>{" "}
                      {inquiry.applyingFor || "Standard unfilled"}
                    </p>
                    <p>
                      <span className="font-semibold text-white/90">
                        Course interest:
                      </span>{" "}
                      {inquiry.course || "Not provided"}
                    </p>
                    {inquiry.learningGoals && (
                      <p className="text-xs text-white/60">
                        {inquiry.learningGoals}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/60">
              No inquiries yet. They will appear here once visitors submit the form.
            </p>
          )}
      </motion.div>
    </div>
  );

  const renderOfferPanel = () => (
    <div className="space-y-6">
      <motion.form
        onSubmit={handleOfferSubmit}
        className="rounded-[32px] border border-white/10 bg-white/95 p-6 shadow-2xl space-y-5 text-slate-900"
      >
        <div className="flex items-center justify-between text-sm font-black uppercase tracking-[0.3em] text-slate-500">
          <span>Offer banner</span>
          <span>
            {offerStatus
              ? offerStatus.includes("saved")
                ? "Saved"
                : "Pending"
              : "Idle"}
          </span>
        </div>
        <div className="space-y-4">
          <div
            onDrop={handleOfferDrop}
            onDragOver={handleOfferDragOver}
            className="relative rounded-2xl border-2 border-dashed border-slate-300 bg-white/60 p-5 text-center text-xs uppercase tracking-[0.3em] text-slate-500"
          >
            <p className="text-sm font-semibold text-slate-900">
              Drag & drop an image or click to browse
            </p>
            <p className="text-[9px] text-slate-500 mt-1">
              Supported formats: JPG, PNG, WEBP
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={handleOfferFileChange}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
            {offerForm.imageUrl && (
              <p className="mt-3 text-[11px] text-emerald-600">
                Image selected will be uploaded.
              </p>
            )}
          </div>
          {offerForm.imageUrl && (
            <div className="relative">
              <img
                src={offerForm.imageUrl}
                alt="Offer preview"
                className="mt-3 h-32 w-full rounded-2xl border border-white/10 object-cover"
              />
            </div>
          )}
          {offerUploadError && (
            <p className="text-[11px] text-rose-500">{offerUploadError}</p>
          )}
          <input
            type="url"
            placeholder="Image URL"
            value={offerForm.imageUrl}
            required
            onChange={(e) =>
              setOfferForm({ ...offerForm, imageUrl: e.target.value })
            }
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-[#D41304] focus:outline-none"
          />
          <input
            type="text"
            placeholder="Caption (optional)"
            value={offerForm.caption}
            onChange={(e) =>
              setOfferForm({ ...offerForm, caption: e.target.value })
            }
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-[#D41304] focus:outline-none"
          />
          <input
            type="url"
            placeholder="Link (optional)"
            value={offerForm.link}
            onChange={(e) =>
              setOfferForm({ ...offerForm, link: e.target.value })
            }
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-[#D41304] focus:outline-none"
          />
          <label className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em]">
            <input
              type="checkbox"
              checked={offerForm.isActive}
              onChange={(e) =>
                setOfferForm({ ...offerForm, isActive: e.target.checked })
              }
              className="h-4 w-4 rounded border border-slate-300 accent-[#D41304]"
            />
            Active banner
          </label>
        </div>
        <button
          type="submit"
          disabled={offerSubmitting}
          className={`${buttonStyles} bg-gradient-to-r from-[#D41304] to-[#F97316] text-white w-full flex justify-center ${offerSubmitting ? "opacity-70" : ""}`}
        >
          {offerSubmitting ? "Saving..." : "Save banner"}
        </button>
        {offerStatus && (
          <p
            className={`text-[11px] ${offerStatus.includes("saved") ? "text-emerald-600" : "text-rose-500"}`}
          >
            {offerStatus}
          </p>
        )}
      </motion.form>

      <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-2xl space-y-4 text-white/90">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.3em]">Current banners</p>
          {offerListStatus && (
            <span className="text-[10px] uppercase tracking-[0.3em] text-emerald-300">
              {offerListStatus}
            </span>
          )}
        </div>
        {offersError && <p className="text-sm text-rose-400">{offersError}</p>}
        {offersLoading ? (
          <p className="text-sm text-white/60">Syncing banners...</p>
        ) : !offersList.length ? (
          <p className="text-sm text-white/60">No promotional banners yet.</p>
        ) : (
          <div className="grid gap-5">
            {offersList.map((offer) => (
              <div
                key={offer._id}
                className="rounded-[28px] border border-white/5 bg-white/10 p-4 space-y-3"
              >
                <img
                  src={offer.imageUrl}
                  alt={offer.caption || "Offer banner"}
                  className="h-40 w-full rounded-2xl object-cover border border-white/10"
                  loading="lazy"
                />
                {offer.caption && (
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/80">
                    {offer.caption}
                  </p>
                )}
                {offer.link && (
                  <a
                    href={offer.link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] uppercase tracking-[0.3em] text-[#F97316] underline"
                  >
                    Preview link
                  </a>
                )}
                <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-white/60">
                  <span>{offer.isActive ? "Active" : "Inactive"}</span>
                  <button
                    type="button"
                    disabled={!isAdminAuthenticated || deletingOfferId === offer._id}
                    onClick={() => handleDeleteOffer(offer._id)}
                    className={`font-black ${isAdminAuthenticated ? "text-rose-400 hover:text-rose-300" : "text-white/40 cursor-not-allowed"}`}
                  >
                    {deletingOfferId === offer._id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderLeaderboardPanel = () => {
    const availableBatchYears = Array.from(
      new Set(studentsList.map((student) => student.batchYear).filter(Boolean)),
    ).sort((a, b) => (b || 0) - (a || 0));
    const filteredStudents = studentsList.filter((student) => {
      const matchesStandard =
        !leaderboardGroup.standard ||
        student.standard === leaderboardGroup.standard;
      const matchesBatch =
        !leaderboardGroup.batchYear ||
        Number(student.batchYear) === Number(leaderboardGroup.batchYear);
      const matchesBranch =
        !leaderboardGroup.branch ||
        (student.branch || DEFAULT_BRANCH) === leaderboardGroup.branch;
      const matchesSearch =
        !leaderboardSearch ||
        student.name.toLowerCase().includes(leaderboardSearch.toLowerCase());
      return matchesStandard && matchesBatch && matchesBranch && matchesSearch;
    });

    return (
      <div className="space-y-6">
        <div className="rounded-[32px] border border-white/10 bg-white/95 p-6 shadow-2xl space-y-5 text-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
                Leaderboard
              </p>
              <h3 className="text-2xl font-black uppercase">
                Create scoreboard
              </h3>
            </div>
            <button
              type="button"
              onClick={handleToggleLeaderboardForm}
              className="rounded-full border border-[#D41304] px-4 py-2 text-[10px] font-black uppercase tracking-[0.4em] text-[#D41304]"
            >
              {showLeaderboardForm ? "Close" : "Create leaderboard"}
            </button>
          </div>
          {showLeaderboardForm && (
            <motion.form
              onSubmit={handleCreateLeaderboard}
              className="space-y-4"
            >
              <div className="grid gap-3 sm:grid-cols-3">
                <select
                  value={leaderboardGroup.standard}
                  onChange={(e) =>
                    setLeaderboardGroup((prev) => ({
                      ...prev,
                      standard: e.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-[#D41304] focus:outline-none bg-white"
                >
                  <option value="">Select standard</option>
                  {romanStandards.map((label) => (
                    <option key={label} value={label}>
                      {label}
                    </option>
                  ))}
                </select>
                <select
                  value={leaderboardGroup.batchYear}
                  onChange={(e) =>
                    setLeaderboardGroup((prev) => ({
                      ...prev,
                      batchYear: Number(e.target.value) || "",
                    }))
                  }
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-[#D41304] focus:outline-none bg-white"
                >
                  <option value="">Batch year</option>
                  {availableBatchYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <select
                  value={leaderboardGroup.branch}
                  onChange={(e) =>
                    setLeaderboardGroup((prev) => ({
                      ...prev,
                      branch: e.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-[#D41304] focus:outline-none bg-white"
                >
                  {FACULTY_BRANCH_OPTIONS.map((branch) => (
                    <option key={branch} value={branch}>
                      {branch}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.3em] text-slate-500">
                  Search students
                </label>
                <div className="flex gap-3">
                  <input
                    type="search"
                    placeholder="Type to filter"
                    value={leaderboardSearch}
                    onChange={(e) => setLeaderboardSearch(e.target.value)}
                    className="flex-1 rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-[#D41304] focus:outline-none"
                  />
                  <div className="text-[10px] uppercase tracking-[0.3em] text-slate-500 flex items-center">
                    Type or pick below
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                {leaderboardSelections.map((selection, index) => (
                  <div
                    key={`leaderboard-selection-${index}`}
                    className="grid gap-3 sm:grid-cols-[1fr_0.6fr]"
                  >
                    <select
                      value={selection.studentId}
                      onChange={(e) =>
                        handleLeaderboardSelectionChange(
                          index,
                          "studentId",
                          e.target.value,
                        )
                      }
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-[#D41304] focus:outline-none bg-white"
                    >
                      <option value="">Choose student #{index + 1}</option>
                      {filteredStudents.map((student) => (
                        <option key={student._id} value={student._id}>
                          {student.name} - {student.standard || "Standard"} -{" "}
                          Batch {student.batchYear || "N/A"}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="Percentage"
                      value={selection.percentage}
                      onChange={(e) =>
                        handleLeaderboardSelectionChange(
                          index,
                          "percentage",
                          e.target.value,
                        )
                      }
                      className="rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-[#D41304] focus:outline-none"
                    />
                  </div>
                ))}
              </div>
              <button
                type="submit"
                disabled={leaderboardLoading || isCreationBlocked}
                className={`${buttonStyles} bg-gradient-to-r from-[#F97316] to-[#D41304] text-white w-full flex justify-center ${leaderboardLoading ? "opacity-70" : ""}`}
              >
                {leaderboardLoading ? "Saving..." : "Save leaderboard"}
              </button>
              {isCreationBlocked && (
                <p className="text-[10px] uppercase tracking-[0.3em] text-rose-400">
                  Leaderboard already exists for{" "}
                  {`${leaderboardGroup.branch || DEFAULT_BRANCH} · ${
                    leaderboardGroup.standard
                  }`}.
                </p>
              )}
              {leaderboardStatus && (
                <p className={`text-[11px] ${statusColor(leaderboardStatus)}`}>
                  {leaderboardStatus}
                </p>
              )}
            </motion.form>
          )}
        </div>
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-2xl space-y-4 text-white">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                Standard roster
              </p>
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">
                {groupedLeaderboardEntries.length} standards - {leaderboardList.length} entries
              </p>
            </div>
            {leaderboardListStatus && (
              <span className="text-[10px] uppercase tracking-[0.3em] text-emerald-300 whitespace-nowrap">
                {leaderboardListStatus}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={leaderboardFilterKey}
                onChange={(e) => setLeaderboardFilterKey(e.target.value)}
                className="rounded-full border border-white/20 bg-black/40 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-white placeholder:text-white/60 focus:outline-none"
              >
                <option value="">Filter branch & standard</option>
                {[...existingLeaderboardGroups]
                  .sort((a, b) => a.label.localeCompare(b.label))
                  .map((group) => (
                    <option key={group.key} value={group.key}>
                      {group.label}
                    </option>
                  ))}
              </select>
              <button
                type="button"
                onClick={handleDeleteFilteredStandard}
                disabled={
                  !leaderboardFilterKey || !!leaderboardDeletionLoading
                }
                className="rounded-full border border-white/20 bg-[#D41304] px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {leaderboardDeletionLoading === "standard"
                  ? "Deleting..."
                  : "Delete filtered standard"}
              </button>
            </div>
            <button
              type="button"
              onClick={handleDeleteAllLeaderboards}
              disabled={!!leaderboardDeletionLoading}
              className="rounded-full border border-white/20 bg-black/20 px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {leaderboardDeletionLoading === "all" ? "Deleting..." : "Delete all"}
            </button>
          </div>
          {leaderboardListError ? (
            <p className="text-sm text-rose-400">{leaderboardListError}</p>
          ) : leaderboardListLoading ? (
            <p className="text-sm text-white/60">Loading entries...</p>
          ) : groupedLeaderboardEntries.length ? (
            <div className="space-y-5">
              {groupedLeaderboardEntries.map((group) => {
                const scoreValues = group.entries
                  .map((entry) =>
                    Number(entry.score ?? entry.percentage ?? entry.value ?? NaN),
                  )
                  .filter((value) => Number.isFinite(value));
                const averageScore =
                  scoreValues.length === 0
                    ? "-"
                    : (
                        scoreValues.reduce((sum, value) => sum + value, 0) /
                        scoreValues.length
                      ).toFixed(1);
                const topScore =
                  scoreValues.length === 0
                    ? "-"
                    : Math.max(...scoreValues).toFixed(1);
                const bestRankValue = group.entries.reduce((best, entry) => {
                  const rankValue = Number(entry.rank);
                  if (!Number.isFinite(rankValue)) return best;
                  return Math.min(best, rankValue);
                }, Infinity);
                const bestRank =
                  Number.isFinite(bestRankValue) ? bestRankValue : "-";
                return (
                  <div
                    key={group.key}
                    className="rounded-3xl border border-white/10 bg-black/40 p-5 space-y-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-black uppercase tracking-[0.3em] text-white">
                          {group.branch} · {group.standard}
                        </p>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-white/50">
                          Batch {group.year}
                        </p>
                      </div>
                      <div className="text-right text-[10px] uppercase tracking-[0.3em] text-white/60">
                        <p className="font-black text-white">
                          {group.entries.length} students
                        </p>
                        <p>
                          Avg {averageScore}% - Top {topScore}% - Rank {bestRank}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {group.entries.map((entry, index) => {
                        const displayScore =
                          entry.score ?? entry.percentage ?? "-";
                        const displayRank = entry.rank ?? index + 1;
                        return (
                          <div key={entry._id ?? `${entry.name}-${entry.rank}`}>
                            <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-black/50 px-4 py-3 text-xs uppercase tracking-[0.2em]">
                              <div>
                                <p className="font-black text-sm text-white">
                                  {entry.name}
                                </p>
                                <p className="text-white/40 text-[9px]">
                                  Score {displayScore} - Rank {displayRank}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-white/60">No leaderboard entries yet.</p>
          )}
        </div>
      </div>
    );
  };
  const renderGalleryPanelLegacy = () => (
    <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] items-start">
      <motion.form
        onSubmit={handleGallerySubmit}
        className="rounded-[32px] border border-white/10 bg-white/95 p-6 shadow-2xl space-y-5 text-slate-900"
      >
        <div className="flex items-center justify-between text-sm font-black uppercase tracking-[0.3em] text-slate-500">
          <span>Gallery</span>
          <span>
            {galleryStatus
              ? galleryStatus.includes("saved")
                ? "Saved"
                : "Pending"
              : "Idle"}
          </span>
        </div>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Image title"
            value={galleryForm.title}
            onChange={(e) =>
              setGalleryForm({ ...galleryForm, title: e.target.value })
            }
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-[#D41304] focus:outline-none"
            required
          />
          <input
            type="text"
            placeholder="Category"
            value={galleryForm.category}
            onChange={(e) =>
              setGalleryForm({ ...galleryForm, category: e.target.value })
            }
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-[#D41304] focus:outline-none"
          />
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.3em] text-slate-600">
              Upload image
              <input
                type="file"
                accept="image/*"
                onChange={handleGalleryImageChange}
                className="mt-2 block w-full rounded-2xl border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-[#D41304] focus:outline-none bg-white"
              />
            </label>
            {galleryForm.uploadedImage && (
              <button
                type="button"
                onClick={() =>
                  setGalleryForm((prev) => ({
                    ...prev,
                    uploadedImage: "",
                    imageUrl: "",
                  }))
                }
                className="text-[10px] uppercase tracking-[0.3em] text-[#D41304] hover:text-[#a2292f]"
              >
                Remove uploaded image
              </button>
            )}
          </div>
          <input
            type="url"
            placeholder="Image URL"
            value={galleryManualUrlValue}
            onChange={(e) =>
              setGalleryForm({ ...galleryForm, imageUrl: e.target.value })
            }
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-[#D41304] focus:outline-none"
          />
          <textarea
            placeholder="Description"
            value={galleryForm.description}
            onChange={(e) =>
              setGalleryForm({ ...galleryForm, description: e.target.value })
            }
            className="w-full rounded-3xl border border-slate-300 px-4 py-3 text-sm focus:border-[#D41304] focus:outline-none"
            rows={3}
          />
        </div>
        <button
          type="submit"
          disabled={galleryLoading}
          className={`${buttonStyles} bg-gradient-to-r from-[#1d4ed8] to-[#8b5cf6] text-white w-full flex justify-center ${galleryLoading ? "opacity-70" : ""}`}
        >
          {galleryLoading ? "Uploading..." : "Add Image"}
        </button>
        {galleryStatus && (
          <p className={`text-[11px] ${statusColor(galleryStatus)}`}>
            {galleryStatus}
          </p>
        )}
      </motion.form>
      <motion.div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-[#111827] to-[#0f172a] p-6 shadow-2xl space-y-4 text-white">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-orange-300">
            Gallery preview
          </p>
          <p className="text-sm text-white/70">
            This card mirrors what visitors will see.
          </p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 space-y-3">
          <div className="h-48 overflow-hidden rounded-2xl bg-slate-900/40">
            <img
              src={galleryPreviewImage}
              alt="Gallery preview"
              className="h-full w-full object-cover"
            />
          </div>
          <p className="text-lg font-black uppercase tracking-[0.3em]">
            {galleryPreviewTitle}
          </p>
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">
            {galleryPreviewCategory}
          </p>
          <p className="text-sm text-white/70">{galleryPreviewDescription}</p>
        </div>
      </motion.div>
    </div>
  );

  const renderGalleryPanel = () => (
    <div className="space-y-10">
      <GalleryDisplay isAdmin />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#01030c] via-slate-950 to-[#101828] text-white pb-20">
      <AdminHeader isAdminAuthenticated={isAdminAuthenticated} />

      <section className="max-w-6xl mx-auto px-6">
        <div className="rounded-[40px] border border-white/10 bg-white/5 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.4)] backdrop-blur">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/60">
                Focused workflow
              </p>
              <h2 className="text-2xl font-black text-white">
                {activeTab?.label} Panel
              </h2>
            </div>
            <p className="text-sm text-white/70 max-w-2xl">
              {activeTab?.description}
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-5">
          <PasswordChangeCard
            passwordForm={passwordForm}
            passwordStatus={passwordStatus}
            passwordLoading={passwordLoading}
            onChangeField={updatePasswordFormField}
            onSubmit={handlePasswordChange}
            onLogout={handleLogout}
          />
          <PanelSelector
            panelTabs={panelTabs}
            activePanel={activePanel}
            onSelect={setActivePanel}
          />
        </div>

        <div className="mt-10 space-y-10">
          {activePanel === "courses" && <CoursesPanel />}
          {activePanel === "subjects" && renderSubjectPanel()}
          {activePanel === "results" && renderResultPanel()}
          {activePanel === "students" && renderStudentPanel()}
          {activePanel === "chat" && renderChatPanel()}
          {activePanel === "offers" && renderOfferPanel()}
          {activePanel === "leaderboard" && renderLeaderboardPanel()}
          {activePanel === "gallery" && renderGalleryPanel()}
        </div>
      </section>
    </div>
  );
};

export default Admin;




